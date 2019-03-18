/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  Action,
  ActionSavedObject,
  Container,
  ContainerInput,
  Embeddable,
  TimeRange,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';

import { PanelState } from '../../../../../src/legacy/core_plugins/dashboard_embeddable/public';
import { APPLY_TIME_RANGE } from './apply_time_range_factory';

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
      newContainerInputState.panels[panelId].customization.timeRange = undefined;
    }
    container.setInput(newContainerInputState);
  }
}
