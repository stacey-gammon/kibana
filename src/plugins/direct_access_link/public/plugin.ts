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

import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from '../../../core/public';
import { DirectAccessLinkGenerator } from '../common';
import { GeneratorId, GeneratorStateMapping } from '../common/types';
import { LinkGeneratorOptions } from './types';

export interface DirectAccessLinkSetup {
  registerLinkGenerator: (generator: DirectAccessLinkGenerator<GeneratorId>) => void;
}

export interface DirectAccessLinkStart {
  generateUrl: <G extends GeneratorId>(
    generatorId: G,
    state: GeneratorStateMapping[G],
    options: LinkGeneratorOptions
  ) => void;
}

export class DirectAccessLinkPlugin
  implements Plugin<DirectAccessLinkSetup, DirectAccessLinkStart> {
  private generators: { [key: string]: DirectAccessLinkGenerator<typeof key> } = {};

  constructor(initializerContext: PluginInitializerContext) {}

  public setup(core: CoreSetup) {
    return {
      registerLinkGenerator: (generator: DirectAccessLinkGenerator<string>) => {
        this.generators[generator.id] = generator;
      },
    };
  }

  public start(core: CoreStart) {
    return {
      generateUrl: <G extends GeneratorId>(id: G, state: GeneratorStateMapping[G]) => {
        const generator = this.generators[id] as DirectAccessLinkGenerator<typeof id>;
        if (!generator) {
          throw new Error(`No link generator exists with id ${id}`);
        }
        return generator.generateUrl(state);
      },
    };
  }

  public stop() {}
}
