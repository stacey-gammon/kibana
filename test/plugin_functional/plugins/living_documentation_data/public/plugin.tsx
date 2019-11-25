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
import React from 'react';

import { Plugin, CoreSetup, PluginInitializerContext } from 'kibana/public';

import { CoreStart } from 'kibana/server';
import {
  ILivingDeveloperDocumentationSetup,
  ILivingDeveloperDocumentationStart,
} from '../../demo_explorer/public/plugin';
import {
  DataPublicPluginSetup,
  DataPublicPluginStart,
  ISearchGeneric,
} from '../../../../../src/plugins/data/public';

declare module '../../demo_explorer/public/plugin' {
  export interface ILivingDocumentationSectionContext {
    core: CoreSetup;
    data: {
      search: ISearchGeneric;
    };
  }
}

interface IDataDocumentationSetupDeps {
  demoExplorer: ILivingDeveloperDocumentationSetup;
  data: DataPublicPluginSetup;
}

interface IDataDocumentationStartDeps {
  data: DataPublicPluginStart;
  demoExplorer: ILivingDeveloperDocumentationStart;
}

export class DataDocumentation implements Plugin {
  constructor(private initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup, deps: IDataDocumentationSetupDeps) {
    deps.demoExplorer.registerDocumentationSection(this.initializerContext.opaqueId, {
      id: 'searchServices',
      title: 'Search services',
      subSections: [
        {
          id: 'demoStrategyTutorial',
          title: 'Custom search strategy tutorial',
          render: async context => {
            const { DemoStrategyTutorial } = await import('./search/demo_strategy_tutorial');
            return <DemoStrategyTutorial />;
          },
        },
      ],
      render: async () => {
        const { DataReadMe } = await import('./data_readme');
        return <DataReadMe />;
      },
    });
  }

  public start(core: CoreStart, deps: IDataDocumentationStartDeps) {
    deps.demoExplorer.registerDocumentationContext<'data'>(
      this.initializerContext.opaqueId,
      'data',
      () => ({
        search: deps.data.search.search,
      })
    );
  }

  public stop() {}
}
