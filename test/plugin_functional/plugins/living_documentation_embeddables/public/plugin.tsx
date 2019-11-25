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
import { IEmbeddableSetup, IEmbeddableStart } from 'src/plugins/embeddable/public';
import {
  ILivingDeveloperDocumentationSetup,
  ILivingDeveloperDocumentationStart,
} from '../../demo_explorer/public/plugin';

declare module '../../demo_explorer/public/plugin' {
  export interface ILivingDocumentationSectionContext {
    core: CoreSetup;
    embeddables: IEmbeddableStart;
  }
}

interface IEmbeddableDocumentationSetupDeps {
  demoExplorer: ILivingDeveloperDocumentationSetup;
  embeddables: IEmbeddableSetup;
}

interface IEmbeddableDocumentationStartDeps {
  demoExplorer: ILivingDeveloperDocumentationStart;
  embeddables: IEmbeddableStart;
}

export class EmbeddableDocumentation implements Plugin {
  constructor(private initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup, deps: IEmbeddableDocumentationSetupDeps) {
    deps.demoExplorer.registerDocumentationSection(this.initializerContext.opaqueId, {
      id: 'embeddableServices',
      title: 'Embeddable services',
      subSections: [
        {
          id: 'searchServices',
          title: 'Search services',
          render: async () => {
            const { DocumentationPage } = await import('./search');
            return <DocumentationPage />;
          },
          subSections: [
            {
              id: 'demoStrategy',
              title: 'Demo strategy',
              render: async context => {
                const { HelloWorldContainerExample } = await import(
                  './hello_world_container_example'
                );
                return <HelloWorldContainerExample search={context.embeddables!.search} />;
              },
            },
          ],
        },
      ],
      render: async () => {
        const { ReadMePage } = await import('./render_readme');
        return <ReadMePage />;
      },
    });
  }

  public start(core: CoreStart, deps: IEmbeddableDocumentationStartDeps) {
    deps.livingDocumentation.registerDocumentationContext<'embeddables'>(
      this.initializerContext.opaqueId,
      'embeddables',
      () => deps.embeddables
    );
  }

  public stop() {}
}
