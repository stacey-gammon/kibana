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
  CONTEXT_MENU_TRIGGER,
  Trigger,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { CustomizeTimeRangeAction } from './customize_time_range';

export const CUSTOMIZE_TIME_RANGE = 'CUSTOMIZE_TIME_RANGE';

export class CustomizeTimeRangeFactory extends ActionFactory {
  constructor() {
    super({ id: CUSTOMIZE_TIME_RANGE, title: 'Customize time range' });
  }

  public isSingleton() {
    return true;
  }

  public allowAddingToTrigger(trigger: Trigger) {
    return trigger.id === CONTEXT_MENU_TRIGGER;
  }

  public async renderEditor(domNode: React.ReactNode) {
    // @ts-ignore
    ReactDOM.render(<div />, domNode);
  }

  public fromSavedObject(actionSavedObject: ActionSavedObject) {
    return new CustomizeTimeRangeAction(actionSavedObject);
  }

  public createNew() {
    return new CustomizeTimeRangeAction();
  }
}
