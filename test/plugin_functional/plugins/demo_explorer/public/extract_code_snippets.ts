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

import { ICodeSnippet } from './i_code_snippet';

export function extractCodeSnippets(
  fileAsString: string,
  filePath: string,
  snippets: { [id: string]: ICodeSnippet }
) {
  const lines = fileAsString.split('\n');
  let inSnippet = false;
  let snippet = '';
  let snippetId = '';
  let lineCnt = 0;
  lines.forEach(line => {
    lineCnt++;
    if (inSnippet) {
      if (line.match(/(@codeReferenceEnd)/gi)) {
        inSnippet = false;
        snippets[snippetId] = {
          id: snippetId,
          code: parseCodeSnippet(snippet),
          link: `http://github.com/elastic/kibana/tree/master/${filePath}#L${lineCnt}`,
        };
        snippet = '';
      } else {
        snippet += line + '\n';
      }
    } else {
      const codeReferenceStart = line.match(/(@codeReferenceStart) (.*)/i);
      if (codeReferenceStart) {
        inSnippet = true;
        snippetId = codeReferenceStart[2];
      }
    }
  });
}

function parseCodeSnippet(codeSnippet: string): string {
  const onlyCodeMatch = codeSnippet.match(/(\*\/)(.*)/is);
  return onlyCodeMatch && onlyCodeMatch.length > 2 ? onlyCodeMatch[2] : '';
}
