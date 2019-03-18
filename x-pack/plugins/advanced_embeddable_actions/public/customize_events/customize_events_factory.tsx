/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

// @ts-ignore
import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  ActionFactory,
  addAction,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
// @ts-ignore
import { interpretAst } from '../../interpreter/public/interpreter';
import { CustomizeEventsAction } from './customize_events_action';

export const CUSTOMIZE_EVENTS_ACTION = 'CUSTOMIZE_EVENTS_ACTION';

export class CustomizeEventsFactory extends ActionFactory {
  constructor() {
    super({ id: CUSTOMIZE_EVENTS_ACTION, title: 'Customize Events Action' });
  }

  public isCompatible() {
    return Promise.resolve(true);
  }

  public async renderEditor(domNode: React.ReactNode) {
    // @ts-ignore
    ReactDOM.render(<div />, domNode);
  }

  public allowAddingToTrigger() {
    return false;
  }

  public fromSavedObject() {
    return new CustomizeEventsAction();
  }
  public isSingleton() {
    return true;
  }
  public async createNew() {
    return addAction(new CustomizeEventsAction());
  }
}
