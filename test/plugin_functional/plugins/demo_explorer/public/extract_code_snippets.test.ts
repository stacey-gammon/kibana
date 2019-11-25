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

import { extractCodeSnippets } from './extract_code_snippets';

test('Code snippet extractor', () => {
  const snippets = {};
  extractCodeSnippets(
    `
  /**
   * CodeSnippet:Start
   * CodeSnippet:Step: 1
   * CodeSnippet:Title: Hi
   * CodeSnippet:Description: This
   *  is a long description.
   */
   function hi() {
     return 'bye!';
   }
  /** CodeSnippet:End */
  `,
    'src/test/plugin_functional/plugins/living_documentation/public/extract_code_snippets.test.ts',
    snippets
  );
  expect(snippets[0].title).toBe('Hi');
  expect(snippets[0].description).toBe('This is a long description.');
  expect(snippets[0].code).toMatchInlineSnapshot(`
    "
       function hi() {
         return 'bye!';
       }
    "
  `);
});
