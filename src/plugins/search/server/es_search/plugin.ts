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

import { ISearchSetup } from '../i_search_setup';
import { PluginInitializerContext, CoreSetup, Plugin } from '../../../../core/server';
import { esSearchStrategyProvider } from './es_search_strategy';
import { ES_SEARCH_STRATEGY } from '../../common';

interface IEsSearchDependencies {
  search: ISearchSetup;
}

export class EsSearchService implements Plugin<void, void, IEsSearchDependencies> {
  constructor(private initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup, deps: IEsSearchDependencies) {
    deps.search.registerSearchStrategyProvider(
      this.initializerContext.opaqueId,
      ES_SEARCH_STRATEGY,
      esSearchStrategyProvider
    );
  }

  public start() {}
  public stop() {}
}
