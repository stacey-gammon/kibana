
jest.mock('ui/metadata', () => ({
  metadata: {
    branch: 'my-metadata-branch',
    version: 'my-metadata-version',
  },
}));

import React from 'react';
import { HELLO_WORLD_EMBEDDABLE, HelloWorldEmbeddableFactory } from '../../../../__test__/index';

import { AddPanelFlyout } from './add_panel_flyout';
import { Container } from 'plugins/embeddable_api/containers';
import { EmbeddableFactoryRegistry } from 'plugins/embeddable_api/embeddables';
// @ts-ignore
import { findTestSubject } from '@elastic/eui/lib/test';
import { mountWithIntl } from 'test_utils/enzyme_helpers';

const onClose = jest.fn();
let container: Container;

beforeEach(() => {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new HelloWorldEmbeddableFactory());
  container = new Container(
    'test',
    { id: '123', panels: {} },
    { embeddableLoaded: {} },
    embeddableFactories
  );
})

test('matches snapshot', async () => {
  const component = mountWithIntl(
    <AddPanelFlyout
      container={container}
      onClose={onClose}
    />
  );

  expect(component).toMatchSnapshot();
});

test('adds a panel to the container', async done => {
  const component = mountWithIntl(
    <AddPanelFlyout
      container={container}
      onClose={onClose}
    />
  );

  expect(Object.values(container.getInput().panels).length).toBe(0);
  
  let unsubscribe = container.subscribeToInputChanges((input) => {
    expect(Object.values(input.panels).length).toBe(1);
    unsubscribe();
    done();
  });

  findTestSubject(component, 'createNew').simulate('click');
  findTestSubject(component, `createNew-${HELLO_WORLD_EMBEDDABLE}`).simulate('click');
});
