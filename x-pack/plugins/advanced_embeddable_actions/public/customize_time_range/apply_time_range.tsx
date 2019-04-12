/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React from 'react';
import {
  Action,
  ActionSavedObject,
  Container,
  ContainerInput,
  Embeddable,
  TimeRange,
  PanelState
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';

import { APPLY_TIME_RANGE } from './apply_time_range_factory';
import { EuiIcon } from '@elastic/eui';

interface ApplyTimeRangeContainerInput extends ContainerInput {
  panels: { [key: string]: PanelState };
}

export class ApplyTimeRangeAction extends Action {
  public timeRange?: TimeRange;

  constructor(actionSavedObject?: ActionSavedObject) {
    super({ actionSavedObject, type: APPLY_TIME_RANGE });
    if (
      actionSavedObject &&
      actionSavedObject.attributes.configuration &&
      actionSavedObject.attributes.configuration !== ''
    ) {
      this.timeRange = JSON.parse(actionSavedObject.attributes.configuration);
    }
  }

  public getConfiguration() {
    return JSON.stringify(this.timeRange);
  }

  public getTitle() {
    if (!this.timeRange) return 'Inherit from dashboard';
    if (this.timeRange.from === 'now/y' && this.timeRange.to === 'now/y') {
      return 'This year';
    }
    if (this.timeRange.from === 'now/M' && this.timeRange.to === 'now/M') {
      return 'This month';
    }
    if (this.timeRange.from === 'now-15m' && this.timeRange.to === 'now') {
      return 'Last fifteen minutes';
    }
    return `${this.timeRange.from} to ${this.timeRange.to}`; 
  }

  public getIcon({ embeddable, container} : { embeddable: Embeddable, container: Container} ) {
    const customization = container.getInput().panels[embeddable.id].customization;
    if (!this.timeRange && (!customization || !customization.timeRange)) {
      return <EuiIcon type="check"/>
    }

    if (customization && _.isEqual(this.timeRange, customization.timeRange)) {
      return <EuiIcon type="check"/>
    }

    return <div />;
  }

  public allowTemplateMapping() {
    return false;
  }

  public execute({
    embeddable,
    container,
  }: {
    embeddable: Embeddable;
    container: Container<ApplyTimeRangeContainerInput>;
  }) {
    if (!embeddable || !container) {
      return;
    }
    const panelId = embeddable.id;
    const newContainerInputState = _.cloneDeep(container.getInput());
    if (this.timeRange) {
      newContainerInputState.panels[panelId].customization.timeRange = this.timeRange;
    } else {
      delete newContainerInputState.panels[panelId].customization.timeRange;
    }
    container.setInput(newContainerInputState);
  }
}
