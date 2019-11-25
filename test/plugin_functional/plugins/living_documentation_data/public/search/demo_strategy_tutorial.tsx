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
import { EuiPageContentBody } from '@elastic/eui';
import { EuiText } from '@elastic/eui';
import { EuiHorizontalRule } from '@elastic/eui';
import { ICodeSnippet } from '../../../demo_explorer/public/i_code_snippet';
import { extractCodeSnippets, CodeSnippet } from '../../../demo_explorer/public';

// @ts-ignore
import doSearch from '!!raw-loader!./do_search.tsx';
// @ts-ignore
import demoStrategyServerProvider from '!!raw-loader!./../../../demo_search/server/demo_search_strategy';
// @ts-ignore
import demoStrategyPublicProvider from '!!raw-loader!./../../../demo_search/public/demo_search_strategy';
// @ts-ignore
import demoStrategyServerPlugin from '!!raw-loader!./../../../demo_search/server/plugin';
// @ts-ignore
import demoStrategyPublicPlugin from '!!raw-loader!./../../../demo_search/public/plugin';
// @ts-ignore
import demoStrategyUsagePlugin from '!!raw-loader!./../../../search_explorer/public/plugin.tsx';
// @ts-ignore
import demoStrategyUsageApp from '!!raw-loader!./../../../search_explorer/public/demo_strategy.tsx';

export class DemoStrategyTutorial extends React.Component<{}, {}> {
  private codeSnippets: { [id: string]: ICodeSnippet } = {};

  constructor(props: {}) {
    super(props);

    const files = [
      [
        demoStrategyServerProvider,
        'test/plugin_functional/plugins/demo_search/server/demo_search_strategy.tsx',
      ],
      [
        demoStrategyPublicProvider,
        'test/plugin_functional/plugins/demo_search/public/demo_search_strategy.ts',
      ],
      [demoStrategyServerPlugin, 'test/plugin_functional/plugins/demo_search/server/plugin.ts'],
      [demoStrategyPublicPlugin, 'test/plugin_functional/plugins/demo_search/public/plugin.ts'],
      [demoStrategyUsagePlugin, 'test/plugin_functional/plugins/search_explorer/public/plugin.tsx'],
      [
        demoStrategyUsageApp,
        'test/plugin_functional/plugins/search_explorer/public/demo_strategy.tsx',
      ],
    ];

    files.forEach(file => {
      extractCodeSnippets(file[0], file[1], this.codeSnippets);
    });
  }

  componentDidMount() {}

  render() {
    return (
      <EuiPageContentBody>
        <EuiText>
          <h1>Step 1</h1>
          <p>
            Create a client side custom search strategy provider that returns your custom search
            strategy.
          </p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchClientSearchStrategy} />
        <EuiHorizontalRule />
        <EuiText>
          <h1>Step 2</h1>
          <p>
            Be sure to include the `data` plugin as a dependency in your plugin's kibana.json. If
            writing typescript, include this type in your plugin's setup dependencies.
          </p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchDeclarePluginDependencies} />

        <EuiText>
          <p>Register your provider with the data plugin.</p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchClientRegisterProvider} />

        <EuiText>
          <p>If using typescript, be sure to add your request and response types.</p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchClientTypeCompletion} />

        <EuiHorizontalRule />
        <EuiText>
          <h1>Step 3</h1>
          <p>
            To use your custom search strategy from another application, you can get access to the
            search function on AppMountContext
          </p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchAppMountContext} />

        <EuiText>
          <p>
            Pass in your request body, an optional abort signal, and the id of your custom strategy.
          </p>
        </EuiText>
        <CodeSnippet snippet={this.codeSnippets.demoSearchUsageExample} />
      </EuiPageContentBody>
    );
  }
}
