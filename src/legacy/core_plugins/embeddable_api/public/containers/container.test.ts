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
} from '../__test__/index';
import { EmbeddableFactoryRegistry, isErrorEmbeddable } from '../embeddables';
import {
  HelloWorldEmbeddable,
  HelloWorldInput,
} from '../__test__/embeddables/hello_world_embeddable';
import { PanelState } from './container';

function createHelloWorldContainer(panels: { [key: string]: PanelState }) {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new HelloWorldEmbeddableFactory());
  return new HelloWorldContainer(panels, embeddableFactories);
}

test('Container initializes embeddables', async done => {
  const container = createHelloWorldContainer({
    '123': {
      embeddableId: '123',
      initialInput: { name: 'Sam' },
      type: HELLO_WORLD_EMBEDDABLE,
    },
  });

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

test('Container.addNewEmbeddable', async () => {
  const container = createHelloWorldContainer({});
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

test('Container.removeEmbeddable removes the embeddable and cleans up', async () => {
  const container = createHelloWorldContainer({
    '123': {
      embeddableId: '123',
      initialInput: { firstName: 'Sam' },
      type: HELLO_WORLD_EMBEDDABLE,
    },
  });
  const embeddable = await container.addNewEmbeddable<HelloWorldInput, HelloWorldEmbeddable>(
    HELLO_WORLD_EMBEDDABLE,
    {
      firstName: 'Kibana',
    }
  );

  if (isErrorEmbeddable(embeddable)) {
    expect(false).toBe(true);
    return;
  }

  const changes = jest.fn();
  const unsubcribe = container.subscribeToChanges(changes);

  embeddable.getDoctorate();

  expect(changes).toBeCalledTimes(1);

  embeddable.destroy = jest.fn();

  container.removeEmbeddable(embeddable.id);

  const noFind = container.getEmbeddable<HelloWorldEmbeddable>(embeddable.id);
  expect(noFind).toBeUndefined();
  expect(embeddable.destroy).toBeCalled();
  expect(container.getInput().panels[embeddable.id]).toBeUndefined();

  embeddable.loseDoctorate();

  expect(changes).toBeCalledTimes(1);

  unsubcribe();
});

test('Container.subscribeToChanges is called when child embeddable input is updated', async () => {
  const container = createHelloWorldContainer({});
  const embeddable = await container.addNewEmbeddable<HelloWorldInput, HelloWorldEmbeddable>(
    HELLO_WORLD_EMBEDDABLE,
    {
      firstName: 'Kibana',
    }
  );

  if (isErrorEmbeddable(embeddable)) {
    expect(false).toBe(true);
    return;
  }

  const changes = jest.fn();
  const unsubcribe = container.subscribeToChanges(changes);

  embeddable.getDoctorate();
  embeddable.loseDoctorate();

  expect(changes).toBeCalledTimes(2);

  unsubcribe();

  embeddable.getDoctorate();

  expect(changes).toBeCalledTimes(2);
});

test('Container.subscribeToInputChanges', async () => {
  const container = createHelloWorldContainer({});
  const embeddable = await container.addNewEmbeddable<HelloWorldInput, HelloWorldEmbeddable>(
    HELLO_WORLD_EMBEDDABLE,
    {
      firstName: 'Joe',
    }
  );

  if (isErrorEmbeddable(embeddable)) {
    expect(false).toBe(true);
    return;
  }

  const changes = jest.fn();
  const input = container.getInput();
  expect(input.panels[embeddable.id].initialInput).toEqual({ firstName: 'Joe' });

  const unsubcribe = container.subscribeToInputChanges(changes);
  embeddable.getDoctorate();

  expect(changes).toBeCalledWith({
    ...input,
    panels: {
      ...input.panels,
      [embeddable.id]: {
        ...input.panels[embeddable.id],
        title: 'Dr.',
      },
    },
  });
  expect(container.getInput().panels[embeddable.id].initialInput).toEqual({
    title: 'Dr.',
    firstName: 'Joe',
  });
  unsubcribe();
});

test('Container.subscribeToInputChanges not triggered if state is the same', async () => {
  const container = createHelloWorldContainer({});
  const embeddable = await container.addNewEmbeddable<HelloWorldInput, HelloWorldEmbeddable>(
    HELLO_WORLD_EMBEDDABLE,
    {
      firstName: 'Joe',
    }
  );

  if (isErrorEmbeddable(embeddable)) {
    expect(false).toBe(true);
    return;
  }

  const changes = jest.fn();
  const input = container.getInput();
  expect(input.panels[embeddable.id].initialInput).toEqual({ firstName: 'Joe' });
  const unsubcribe = container.subscribeToInputChanges(changes);
  embeddable.getDoctorate();
  expect(changes).toBeCalledTimes(1);
  embeddable.getDoctorate();
  expect(changes).toBeCalledTimes(1);
  unsubcribe();
});
