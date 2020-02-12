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

import { createDirectAccessDashboardLinkGenerator } from './direct_access_link_generator';

const BASE_PATH: string = 'xyz';

test('creates a link to a saved dashboard', async () => {
  const generator = createDirectAccessDashboardLinkGenerator(() =>
    Promise.resolve({ basePath: BASE_PATH, useHashedUrl: false })
  );
  const url = await generator.createUrl({});
  expect(url).toMatchInlineSnapshot(`"http://localhost/xyz/app/kibana#dashboard?_a=()&_g=()"`);
});

test('creates a link with global time range set up', async () => {
  const generator = createDirectAccessDashboardLinkGenerator(() =>
    Promise.resolve({ basePath: BASE_PATH, useHashedUrl: false })
  );
  const url = await generator.createUrl({
    timeRange: { to: 'now', from: 'now-15m', mode: 'relative' },
  });
  expect(url).toMatchInlineSnapshot(
    `"http://localhost/xyz/app/kibana#dashboard?_a=()&_g=(timeRange:(from:now-15m,mode:relative,to:now))"`
  );
});

test('creates a link with filters, time range and query to a saved object', async () => {
  const generator = createDirectAccessDashboardLinkGenerator(() =>
    Promise.resolve({ basePath: BASE_PATH, useHashedUrl: false })
  );
  const url = await generator.createUrl({
    timeRange: { to: 'now', from: 'now-15m', mode: 'relative' },
    dashboardId: '123',
    filters: [
      {
        meta: {
          alias: null,
          disabled: false,
          negate: false,
        },
        query: { query: 'hi' },
      },
    ],
    query: { query: 'bye', language: 'kuery' },
  });
  expect(url).toMatchInlineSnapshot(
    `"http://localhost/xyz/app/kibana#dashboard/123?_a=(filters:!((meta:(alias:!n,disabled:!f,negate:!f),query:(query:hi))),query:(language:kuery,query:bye))&_g=(timeRange:(from:now-15m,mode:relative,to:now))"`
  );
});
