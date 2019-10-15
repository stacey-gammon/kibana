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
/* eslint-disable @kbn/eslint/no-restricted-paths */
import 'ui/autoload/all';
import 'uiExports/embeddableFactories';
import 'uiExports/embeddableActions';

import { npSetup, npStart } from 'ui/new_platform';
import { SavedObjectFinder } from 'ui/saved_objects/components/saved_object_finder';
import uiRoutes from 'ui/routes';
// @ts-ignore
import { uiModules } from 'ui/modules';
/* eslint-enable @kbn/eslint/no-restricted-paths */

import template from './index.html';

import { plugin } from '../public';

const pluginInstance = plugin({} as any);

let rendered = false;
const onRenderCompleteListeners: Array<() => void> = [];

uiRoutes.enable();
uiRoutes.defaults(/\eql_search_explorer/, {});
uiRoutes.when('/', {
  template,
  controller($scope) {
    $scope.$$postDigest(() => {
      rendered = true;
      onRenderCompleteListeners.forEach(listener => listener());
    });
  },
});

export const setup = pluginInstance.setup(npSetup.core, {
  embeddable: npSetup.plugins.embeddable,
  data: npSetup.plugins.data,
  uiActions: npSetup.plugins.uiActions,
  inspector: npStart.plugins.inspector,
  __LEGACY: {
    SavedObjectFinder,
    onRenderComplete: (renderCompleteListener: () => void) => {
      if (rendered) {
        renderCompleteListener();
      } else {
        onRenderCompleteListeners.push(renderCompleteListener);
      }
    },
  },
});

export const start = pluginInstance.start();
