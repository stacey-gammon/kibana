/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  Action,
  ActionSavedObject,
  ExecuteOptions,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';

// @ts-ignore
import { fromExpression } from '@kbn/interpreter/common';
// @ts-ignore
import { interpretAst } from '../../interpreter/public/interpreter';
import { NAVIGATE_ACTION_TYPE } from './navigate_action_factory';

export class NavigateAction extends Action {
  public urlTemplate: string = '';

  constructor(actionSavedObject?: ActionSavedObject) {
    super({
      actionSavedObject,
      type: NAVIGATE_ACTION_TYPE,
    });

    if (actionSavedObject && actionSavedObject.attributes.configuration !== '') {
      this.urlTemplate = actionSavedObject.attributes.configuration;
    }
  }

  public isCompatible() {
    return Promise.resolve(true);
  }

  public updateConfiguration(config: string) {
    this.urlTemplate = config;
  }

  public getConfiguration() {
    return this.urlTemplate;
  }

  public execute({ embeddable, triggerContext }: ExecuteOptions) {
    const url = this.injectTemplateParameters(this.urlTemplate, embeddable, triggerContext);
    window.open(url, '_blank');
  }
}
