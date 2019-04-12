/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// @ts-ignore
import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
// @ts-ignore
import { interpretAst } from 'plugins/interpreter/interpreter';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  ActionFactory,
  ActionSavedObject,
  addAction,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { ApplyFilterAction } from './apply_filter_action';

export const APPLY_FILTER_ACTION = 'APPLY_FILTER_ACTION';

export class ApplyFilterActionFactory extends ActionFactory {
  constructor() {
    super({ id: APPLY_FILTER_ACTION, title: 'Apply a filter' });
  }

  public async renderEditor(domNode: React.ReactNode) {
    // @ts-ignore
    ReactDOM.render(<div />, domNode);
  }

  public fromSavedObject(actionSavedObject: ActionSavedObject) {
    return new ApplyFilterAction(actionSavedObject);
  }

  public createNew() {
    return new ApplyFilterAction();
  }
}
