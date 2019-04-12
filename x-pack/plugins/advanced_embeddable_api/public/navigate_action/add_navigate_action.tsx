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
  ActionSavedObject,
  ExecuteOptions,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { ADD_NAVIGATE_ACTION } from './add_navigate_action_factory';
import { AddNavigateActionFlyout } from './add_navigate_action_flyout';

export class AddNavigateAction extends Action {
  private flyoutSession?: FlyoutRef;

  constructor(actionSavedObject?: ActionSavedObject) {
    super({ actionSavedObject, type: ADD_NAVIGATE_ACTION });

    this.id = ADD_NAVIGATE_ACTION;
    this.title = actionSavedObject ? actionSavedObject.attributes.title : 'Customize flow';

    this.description =
      'Exposes the ability to manage and customize per embeddable "Custom flow" actions to content editors, via the context menu of a panel, in edit mode.';
  }

  public isCompatible() {
    return Promise.resolve(true);
  }

  public execute({ embeddable, container }: ExecuteOptions) {
    if (!embeddable) {
      throw new Error('Navigate action requires an embeddable context to be executed');
    }
    const panelId = embeddable.id;

    this.flyoutSession = getNewPlatform().setup.core.overlays.openFlyout(
      <AddNavigateActionFlyout
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
        size: 'l',
      }
    );
  }
}
