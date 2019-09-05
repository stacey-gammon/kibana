/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { registerSearchRoute } from './search';
import {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  APICaller,
} from '../../../core/server';
import { ISearchStrategy } from './search/i_search_strategy';
import { defaultSearchStrategyProvider } from './search/default_search_strategy';

export interface DataPluginRequestContext {
  getSearchStrategy: () => Promise<ISearchStrategy>;
}

export interface DataPluginStartContract {
  setDefaultSearchStrategy: (name: string) => void;
  addSearchStrategyProvider: (
    name: string,
    searchStrategyProvider: (caller: APICaller) => ISearchStrategy
  ) => void;
}

declare module 'kibana/server' {
  interface RequestHandlerContext {
    data?: DataPluginRequestContext;
  }
}

const DEFAULT_SEARCH_STRATEGY_KEY = 'default';

export class DataServerPlugin implements Plugin<void, DataPluginStartContract> {
  private searchStrategyProviders = new Map<string, (caller: APICaller) => ISearchStrategy>();
  private defaultSearchStrategy: string = DEFAULT_SEARCH_STRATEGY_KEY;

  constructor(initializerContext: PluginInitializerContext) {
    this.searchStrategyProviders.set(DEFAULT_SEARCH_STRATEGY_KEY, defaultSearchStrategyProvider);
  }

  private setDefaultSearchStrategy(name: string) {
    if (!this.searchStrategyProviders.get(name)) {
      throw new Error('No strategy with that name exsits');
    }
    this.defaultSearchStrategy = name;
  }

  private addSearchStrategyProvider(
    name: string,
    strategyProvider: (caller: APICaller) => ISearchStrategy
  ) {
    this.searchStrategyProviders.set(name, strategyProvider);
  }

  public setup(core: CoreSetup) {
    const router = core.http.createRouter();
    core.http.registerRouteHandlerContext<'data'>('data', context => {
      return {
        getSearchStrategy: async () => {
          const strategyProvider = this.searchStrategyProviders.get(this.defaultSearchStrategy);
          if (!strategyProvider) {
            throw new Error('no startegy found');
          }
          return strategyProvider(context.core!.elasticsearch.dataClient.callAsCurrentUser);
        },
      };
    });

    registerSearchRoute(router);
  }
  public start(core: CoreStart) {
    return {
      setDefaultSearchStrategy: this.setDefaultSearchStrategy,
      addSearchStrategyProvider: this.addSearchStrategyProvider,
    };
  }
  public stop() {}
}

export { DataServerPlugin as Plugin };
