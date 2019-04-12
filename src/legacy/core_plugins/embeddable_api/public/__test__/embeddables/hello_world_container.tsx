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
import { EmbeddableFactoryRegistry } from 'plugins/embeddable_api/embeddables';
import { Container } from 'plugins/embeddable_api/index';
import React from 'react';
import ReactDOM from 'react-dom';
import { ViewMode } from 'plugins/embeddable_api/types';
import { PanelState } from 'plugins/embeddable_api/containers';
import { HelloWorldContainerComponent } from './hello_world_container_component';

export const LIST_CONTAINER_ID = 'LIST_CONTAINER_ID';

export class HelloWorldContainer extends Container {
  constructor(
    exisingPanels: { [key: string]: PanelState },
    embeddableFactories: EmbeddableFactoryRegistry
  ) {
    // Seed the list with one embeddable to ensure it works.
    super(
      LIST_CONTAINER_ID,
      {
        id: '1234',
        panels: exisingPanels,
      },
      { embeddableLoaded: { myid: false } },
      embeddableFactories
    );
  }

  public getInputForEmbeddableFromContainer(id: string) {
    return {
      id,
      customization: this.input.panels[id].customization || {},
      viewMode: this.input.viewMode || ViewMode.EDIT,
    };
  }

  public render(node: HTMLElement) {
    ReactDOM.render(<HelloWorldContainerComponent container={this} />, node);
  }
}
