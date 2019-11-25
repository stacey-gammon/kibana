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

import {
  EuiText,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiListGroup,
} from '@elastic/eui';

export const DocumentationPage = () => (
  <EuiPageBody data-test-subj="dataPluginExplorerHome">
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiTitle size="l">
          <h1>Welcome to the search explorer</h1>
        </EuiTitle>
      </EuiPageHeaderSection>
    </EuiPageHeader>
    <EuiPageContent>
      <EuiPageContentHeader>
        <EuiPageContentHeaderSection>
          <EuiTitle>
            <h2>Demos</h2>
          </EuiTitle>
        </EuiPageContentHeaderSection>
      </EuiPageContentHeader>
      <EuiPageContentBody>
        <EuiText>
          <h2>Search Services</h2>
          <p>
            Located in the{' '}
            <a href="https://github.com/elastic/kibana/tree/master/src/plugins/data">data plugin</a>
          </p>
          <ul>
            <li>Provides an abstraction on top of advanced query settings</li>

            <li>Provides an abstraction layer for query cancellation semantics</li>

            <li>Provides a clean separation of OSS and commercial search strategies.</li>
          </ul>
          <h2>Extensibility</h2>
          <p>
            Plugins can register or use different client side, and server side{' '}
            <i>search strategies</i>. Search strategies can take advantage of other search stratgies
            already registered. For example, the `ES_SEARCH_STRATEGY` uses the
            `SYNC_SEARCH_STRATEGY`
          </p>

          <h2>References</h2>
          <EuiListGroup
            listItems={[
              {
                label: 'Roadmap',
                href: 'https://github.com/elastic/kibana/issues/44661',
                iconType: 'logoGithub',
                size: 's',
              },
              {
                label: 'Data access API issue',
                href: 'https://github.com/elastic/kibana/issues/43371',
                iconType: 'logoGithub',
                size: 's',
              },
            ]}
          />
        </EuiText>
      </EuiPageContentBody>
    </EuiPageContent>
  </EuiPageBody>
);
