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
import { Embeddable } from 'plugins/embeddable_api/index';
import { QueryLanguageType, ViewMode } from 'plugins/embeddable_api/types';
import {
  DashboardContainer,
  DashboardEmbeddableInput,
  DashboardEmbeddableOutput,
} from './dashboard_container';

function getSampleDashboardEmbeddableInput(): DashboardEmbeddableInput {
  return {
    filters: [],
    customization: {},
    query: {
      language: QueryLanguageType.KUERY,
      query: 'hi',
    },
    isPanelExpanded: false,
    timeRange: {
      to: 'now',
      from: 'now-15m',
    },
    viewMode: ViewMode.VIEW,
  };
}

class TestEmbeddable extends Embeddable<DashboardEmbeddableInput, DashboardEmbeddableOutput> {
  constructor() {
    super('TEST', {});
  }
}

test('DashboardContainer.getIndexPatterns', () => {
  const container = new DashboardContainer({});
  container.addNewEmbeddable('TEST');

  panels.push(panelState);
});

