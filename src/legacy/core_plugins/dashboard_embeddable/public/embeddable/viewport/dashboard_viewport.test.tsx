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

import React from 'react';

import { EmbeddableFactoryRegistry } from '../../../../embeddable_api/public';
import { DashboardViewport, DashboardViewportProps } from './dashboard_viewport';
import {
  ContactCardEmbeddableFactory,
  CONTACT_CARD_EMBEDDABLE,
} from '../../../../embeddable_api/public/__test__';
import { DashboardContainer } from '../dashboard_container';
import { getSampleDashboardInput } from '../../__test__';
import { skip } from 'rxjs/operators';
import { mount } from 'enzyme';
import { I18nProvider } from '@kbn/i18n/react';
// @ts-ignore
import { findTestSubject } from '@elastic/eui/lib/test';
import { nextTick } from 'test_utils/enzyme_helpers';

jest.mock('ui/chrome', () => ({ getKibanaVersion: () => '6.0.0', setVisible: () => {} }), {
  virtual: true,
});

jest.mock(
  'ui/notify',
  () => ({
    toastNotifications: {
      addDanger: () => {},
    },
  }),
  { virtual: true }
);

let dashboardContainer: DashboardContainer | undefined;

function getProps(props?: Partial<DashboardViewportProps>): DashboardViewportProps {
  const embeddableFactories = new EmbeddableFactoryRegistry();
  embeddableFactories.registerFactory(new ContactCardEmbeddableFactory());
  dashboardContainer = new DashboardContainer(
    getSampleDashboardInput({
      panels: {
        '1': {
          gridData: { x: 0, y: 0, w: 6, h: 6, i: '1' },
          embeddableId: '1',
          type: CONTACT_CARD_EMBEDDABLE,
          explicitInput: { firstName: 'Bob' },
        },
        '2': {
          gridData: { x: 6, y: 6, w: 6, h: 6, i: '2' },
          type: CONTACT_CARD_EMBEDDABLE,
          embeddableId: '2',
          explicitInput: { firstName: 'Stacey' },
        },
      },
    }),
    embeddableFactories
  );
  const defaultTestProps: DashboardViewportProps = {
    container: dashboardContainer,
  };
  return Object.assign(defaultTestProps, props);
}

test('renders DashboardViewport', () => {
  const props = getProps();
  const component = mount(
    <I18nProvider>
      <DashboardViewport {...props} />
    </I18nProvider>
  );
  const panels = findTestSubject(component, 'dashboardPanel');
  expect(panels.length).toBe(2);
});

test('renders DashboardViewport with no visualizations', () => {
  const props = getProps();
  props.container.updateInput({ panels: {} });
  const component = mount(
    <I18nProvider>
      <DashboardViewport {...props} />
    </I18nProvider>
  );
  const panels = findTestSubject(component, 'dashboardPanel');
  expect(panels.length).toBe(0);

  component.unmount();
});

test('renders exit full screen button when in full screen mode', async () => {
  const props = getProps();
  props.container.updateInput({ isFullScreenMode: true });
  const component = mount(
    <I18nProvider>
      <DashboardViewport {...props} />
    </I18nProvider>
  );
  let exitButton = findTestSubject(component, 'exitFullScreenModeText');
  expect(exitButton.length).toBe(1);

  props.container.updateInput({ isFullScreenMode: false });

  await nextTick();
  component.update();

  exitButton = findTestSubject(component, 'exitFullScreenModeText');
  expect(exitButton.length).toBe(0);

  component.unmount();
});

test('DashboardViewport unmount unsubscribes', async done => {
  const props = getProps();
  const component = mount(
    <I18nProvider>
      <DashboardViewport {...props} />
    </I18nProvider>
  );
  component.unmount();

  props.container
    .getInput$()
    .pipe(skip(1))
    .subscribe(() => {
      done();
    });

  props.container.updateInput({ panels: {} });
});
