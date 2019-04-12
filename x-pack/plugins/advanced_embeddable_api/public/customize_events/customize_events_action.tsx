/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import { getNewPlatform } from 'ui/new_platform';
import { FlyoutRef } from '../../../../../src/core/public';
import {
  Action,
  ExecuteOptions,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { CustomizeEventsFlyout } from './customize_events_flyout';

export const CUSTOMIZE_EVENTS_ACTION = 'CUSTOMIZE_EVENTS_ACTION';

export class CustomizeEventsAction extends Action {
  private flyoutSession?: FlyoutRef;

  constructor() {
    super({
      type: CUSTOMIZE_EVENTS_ACTION,
    });
    this.id = CUSTOMIZE_EVENTS_ACTION;
    this.title = 'Customize events';
  }

  public isSingleton() {
    return true;
  }

  public execute({ embeddable, container }: ExecuteOptions) {
    this.flyoutSession = getNewPlatform().setup.core.overlays.openFlyout(
      <CustomizeEventsFlyout
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
