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
import { Subscription } from 'rxjs';
import {
  EuiPageContentBody,
  EuiFormRow,
  EuiFlexItem,
  EuiFlexGroup,
  EuiFieldText,
} from '@elastic/eui';
import {
  EmbeddablePanel,
  GetEmbeddableFactory,
  GetEmbeddableFactories,
} from '../../../../../src/plugins/embeddable/public';
import {
  HelloWorldContainer,
  CONTACT_CARD_EMBEDDABLE,
  HELLO_WORLD_EMBEDDABLE_TYPE,
} from '../../../../../src/plugins/embeddable/public/lib/test_samples';
import { TGetActionsCompatibleWithTrigger } from '../../../../../src/plugins/ui_actions/public';
import { CoreStart } from '../../../../../src/core/public';
import { Start as InspectorStartContract } from '../../../../../src/plugins/inspector/public';
import { GuideSection } from '../../demo_explorer/public/guide_section';

import { HelloWorldContainerDemo } from './hello_world_container_demo';

// @ts-ignore
import demo from '!!raw-loader!./hello_world_container_demo.tsx';
// @ts-ignore
import hello_world_container from '!!raw-loader!./../../../demo_search/server/demo_search_strategy';
// @ts-ignore
import demoStrategyPublicProvider from '!!raw-loader!./../../../demo_search/public/demo_search_strategy';
// @ts-ignore
import demoStrategyServerPlugin from '!!raw-loader!./../../../demo_search/server/plugin';
// @ts-ignore
import helloWorldContainerPlugin from '!!raw-loader!./../../../demo_search/public/plugin';

interface Props {
  getActions: TGetActionsCompatibleWithTrigger;
  getEmbeddableFactory: GetEmbeddableFactory;
  getAllEmbeddableFactories: GetEmbeddableFactories;
  overlays: CoreStart['overlays'];
  notifications: CoreStart['notifications'];
  inspector: InspectorStartContract;
  SavedObjectFinder: React.ComponentType<any>;
}

export class HelloWorldContainerExample extends React.Component<Props, { lastName?: string }> {
  constructor(props: Props) {
    super(props);
  }

  public renderDemo() {
    return (
      <HelloWorldContainerDemo
        getActions={this.props.getActions}
        getEmbeddableFactory={this.props.getEmbeddableFactory}
        getAllEmbeddableFactories={this.props.getAllEmbeddableFactories}
        overlays={this.props.overlays}
        notifications={this.props.notifications}
        inspector={this.props.inspector}
        SavedObjectFinder={this.props.SavedObjectFinder}
      />
    );
  }

  public render() {
    return (
      <EuiPageContentBody>
        <GuideSection
          codeSections={[
            {
              title: 'Public',
              code: [
                { description: 'plugin.ts', snippet: demoStrategyPublicPlugin },
                { description: 'demo_search_strategy.ts', snippet: demoStrategyPublicProvider },
              ],
            },
            {
              title: 'Server',
              code: [
                { description: 'plugin.ts', snippet: demoStrategyServerPlugin },
                { description: 'demo_search_strategy.ts', snippet: demoStrategyServerProvider },
              ],
            },
          ]}
          demo={this.renderDemo()}
        />
      </EuiPageContentBody>
    );
  }
}
