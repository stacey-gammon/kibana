/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { getNewPlatform } from 'ui/new_platform';
import {
  Action,
  ActionSavedObject,
  ExecuteActionContext,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { FlyoutRef } from '../../../../../src/core/public';
import { CUSTOMIZE_TIME_RANGE } from './customize_time_range_factory';
import { CustomizeTimeRangeFlyout } from './customize_time_range_flyout';

export class CustomizeTimeRangeAction extends Action {
  private flyoutSession?: FlyoutRef;

  constructor(actionSavedObject?: ActionSavedObject) {
    super({ actionSavedObject, type: CUSTOMIZE_TIME_RANGE });

    this.id = CUSTOMIZE_TIME_RANGE;
    this.title = actionSavedObject ? actionSavedObject.attributes.title : 'Customize time range';
    this.description =
      'Exposes the ability to manage and customize per embeddable "Apply Time Range" actions to content editors, via the context menu of a panel, in edit mode.';
  }

  public isCompatible() {
    return Promise.resolve(true);
  }

  public allowTemplateMapping() {
    return false;
  }

  public allowEditing() {
    return false;
  }
  public execute({ embeddable, container }: ExecuteActionContext) {
    const panelId = embeddable.id;

    this.flyoutSession = getNewPlatform().setup.core.overlays.openFlyout(
      <CustomizeTimeRangeFlyout
        panelId={panelId}
        embeddable={embeddable}
        container={container}
        onClose={() => {
          if (this.flyoutSession) {
            this.flyoutSession.close();
          }
        }}
      />,
      {
        'data-test-subj': 'samplePanelActionFlyout',
      }
    );
  }
}
