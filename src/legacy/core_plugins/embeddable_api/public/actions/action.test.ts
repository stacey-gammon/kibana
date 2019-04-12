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

jest.mock('ui/metadata', () => ({
  metadata: {
    branch: 'my-metadata-branch',
    version: 'my-metadata-version',
  },
}));

import {
  HELLO_WORLD_EMBEDDABLE,
  HelloWorldEmbeddableFactory,
  HelloWorldContainer,
  SayHelloAction,
  EmptyEmbeddable,
  HelloWorldEmbeddable,
  HelloWorldInput,
} from '../__test__/index';
import { EmbeddableFactoryRegistry, isErrorEmbeddable } from '../embeddables';
import { PanelState } from '../containers';

function createHelloWorldContainer(panels: { [key: string]: PanelState }) {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new HelloWorldEmbeddableFactory());
  return new HelloWorldContainer(panels, embeddableFactories);
}

test('SayHelloAction is not compatible with not matching embeddables', async done => {
  const sayHelloAction = new SayHelloAction(() => {});
  const emptyEmbeddable = new EmptyEmbeddable({ id: '234' });

  // @ts-ignore Typescript is nice and tells us ahead of time this is invalid, but
  // I want to make sure it also returns false.
  expect(sayHelloAction.isCompatible(emptyEmbeddable)).toBe(false);
});

test('Action can be stored as saved object', async () => {});
