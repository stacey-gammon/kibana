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
  HelloWorldEmbeddable,
  HelloWorldInput,
  HELLO_WORLD_EMBEDDABLE,
  HelloWorldEmbeddableFactory,
} from 'plugins/embeddable_api/__test__/embeddables';
import { EmbeddableFactoryRegistry, isErrorEmbeddable } from 'plugins/embeddable_api/index';
import { DashboardContainer } from './dashboard_container';
import { getSampleDashboardInput, getSampleDashboardPanel } from '../__test__';

test('DashboardContainer initializes embeddables', async done => {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new HelloWorldEmbeddableFactory());
  const container = new DashboardContainer(
    getSampleDashboardInput({
      panels: {
        '123': getSampleDashboardPanel({
          embeddableId: '123',
          initialInput: { firstName: 'Sam' },
          type: HELLO_WORLD_EMBEDDABLE,
        }),
      },
    }),
    embeddableFactories
  );

  container.subscribeToOutputChanges(output => {
    if (container.getOutput().embeddableLoaded['123']) {
      const embeddable = container.getEmbeddable<HelloWorldEmbeddable>('123');
      expect(embeddable).toBeDefined();
      expect(embeddable.id).toBe('123');
      done();
    }
  });

  if (container.getOutput().embeddableLoaded['123']) {
    const embeddable = container.getEmbeddable<HelloWorldEmbeddable>('123');
    expect(embeddable).toBeDefined();
    expect(embeddable.id).toBe('123');
    done();
  }
});

test('DashboardContainer.addNewEmbeddable', async () => {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new HelloWorldEmbeddableFactory());
  const container = new DashboardContainer(getSampleDashboardInput(), embeddableFactories);
  const embeddable = await container.addNewEmbeddable<HelloWorldInput>(HELLO_WORLD_EMBEDDABLE, {
    firstName: 'Kibana',
  });
  expect(embeddable).toBeDefined();

  if (!isErrorEmbeddable(embeddable)) {
    expect(embeddable.getInput().firstName).toBe('Kibana');
  } else {
    expect(false).toBe(true);
  }

  const embeddableInContainer = container.getEmbeddable<HelloWorldEmbeddable>(embeddable.id);
  expect(embeddableInContainer).toBeDefined();
  expect(embeddableInContainer.id).toBe(embeddable.id);
});
