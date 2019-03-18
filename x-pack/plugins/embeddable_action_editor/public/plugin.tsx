/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { I18nProvider } from '@kbn/i18n/react';
import React from 'react';
import ReactDOM from 'react-dom';
import { ActionEventEditorApp } from './app/';
import { CoreShim, PluginShim } from './shim';

const REACT_ROOT_ID = 'actionEditorRoot';

export class Plugin {
  public start({ core, plugins }: { core: CoreShim; plugins: PluginShim }): void {
    core.onRenderComplete(() => {
      const root = document.getElementById(REACT_ROOT_ID);
      ReactDOM.render(
        <I18nProvider>
          <ActionEventEditorApp />
        </I18nProvider>,
        root
      );
    });
  }
}
