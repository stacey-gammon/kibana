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
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui';

export const DataReadMe = () => (
  <EuiPageBody data-test-subj="dataReadme">
    <EuiPageHeader>
      <EuiPageHeaderSection>
        <EuiTitle size="l">
          <h1>Data services</h1>
        </EuiTitle>
      </EuiPageHeaderSection>
    </EuiPageHeader>
    <EuiPageContent>
      <EuiPageContentBody>
        <EuiText>
          <h4>
            <a href="https://github.com/elastic/kibana/blob/master/src/plugins/data/README.md">
              data plugin
            </a>{' '}
            provides common data access services.
          </h4>
          <ul>
            <li>Expressions</li>

            <li>Filtering</li>

            <li>Index patterns</li>
            <li>Query</li>
            <li>Search</li>
          </ul>
        </EuiText>
      </EuiPageContentBody>
    </EuiPageContent>
  </EuiPageBody>
);
