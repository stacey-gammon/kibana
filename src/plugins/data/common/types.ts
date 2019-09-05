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

import { SearchParams } from 'elasticsearch';

export * from './timefilter/types';

export interface SearchArguments {
  // The Elasticsearch search parameters
  searchParams: SearchParams;

  // An optional signal to abort the request
  signal?: AbortSignal;

  // Additional search options to customize the behavior of the request
  options?: SearchOptions;
}

export interface SearchOptions {
  [propName: string]: any;

  // If courier:setRequestPreference is set to "sessionId", this will be used as the preference
  sessionId?: string;
}
