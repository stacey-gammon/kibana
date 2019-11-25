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

import {
  Plugin,
  CoreSetup,
  PluginOpaqueId,
  IContextProvider,
  IContextContainer,
  PluginInitializerContext,
} from 'kibana/public';
import { INavSection, INavSectionProvider } from './i_nav_section';

export interface ILivingDocumentationSectionContext {
  core: CoreSetup;
}

export interface ILivingDeveloperDocumentationApi {
  registerDocumentationSection: (
    plugin: PluginOpaqueId,
    sectionProvider: INavSectionProvider
  ) => void;
  registerDocumentationContext: <TContextName extends keyof ILivingDocumentationSectionContext>(
    pluginId: symbol,
    contextName: TContextName,
    provider: IContextProvider<INavSectionProvider['render'], TContextName>
  ) => void;
}

export type ILivingDeveloperDocumentationSetup = ILivingDeveloperDocumentationApi;
export type ILivingDeveloperDocumentationStart = ILivingDeveloperDocumentationApi;

export class LivingDeveloperDocumentation
  implements Plugin<ILivingDeveloperDocumentationApi, ILivingDeveloperDocumentationApi> {
  private sections: INavSection[] = [];

  private api?: ILivingDeveloperDocumentationApi;

  /**
   * Exposes context to documentation sections.
   */
  private contextContainer?: IContextContainer<INavSectionProvider['render']>;

  constructor(private initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup) {
    const sections = this.sections;

    this.contextContainer = core.context.createContextContainer();

    core.application.register({
      order: 1,
      id: 'demoExplorer',
      title: 'Demo explorer',
      async mount(context, params) {
        const { renderApp } = await import('./application');
        return renderApp(context, sections, params);
      },
    });

    const bindContextToSectionRenderers = (
      plugin: PluginOpaqueId,
      sectionProvider: INavSectionProvider
    ): INavSection => {
      const navSectionRenderer = this.contextContainer!.createHandler(
        plugin,
        sectionProvider.render
      );

      let boundSubSections;
      if (sectionProvider.subSections) {
        boundSubSections = sectionProvider.subSections.map(section =>
          bindContextToSectionRenderers(plugin, section)
        );
      }
      return {
        ...sectionProvider,
        subSections: boundSubSections,
        render: navSectionRenderer,
      };
    };

    const registerDocumentationSection = (
      plugin: PluginOpaqueId,
      sectionProvider: INavSectionProvider
    ) => {
      const section = bindContextToSectionRenderers(plugin, sectionProvider);
      this.sections.push(section);
    };

    this.api = {
      registerDocumentationSection,
      registerDocumentationContext: this.contextContainer!.registerContext,
    };

    this.api.registerDocumentationContext(this.initializerContext.opaqueId, 'core', () => core);
    return this.api;
  }

  public start(): ILivingDeveloperDocumentationApi {
    return this.api!;
  }

  public stop() {}
}
