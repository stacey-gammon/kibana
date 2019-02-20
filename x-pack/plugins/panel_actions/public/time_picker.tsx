/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlyoutBody, EuiFlyoutHeader, EuiTitle } from '@elastic/eui';
import React from 'react';
import { openFlyout } from 'ui/flyout';

import {
  ContextMenuAction,
  ContextMenuActionsRegistryProvider,
  PanelActionAPI,
} from 'ui/embeddable';

class TimePicker extends ContextMenuAction {
  constructor() {
    super({
      displayName: 'Sample Panel Link',
      id: 'samplePanelLink',
      parentPanelId: 'mainMenu',
    });
  }

  public isVisible({ embeddable }: PanelActionAPI) {
    // Unfortunately saved search embeddables don't use the passed down time picker appropriatly.
    return embeddable.name === 'Visualize';
  }

  public onClick = ({ embeddable }: PanelActionAPI) => {
    openFlyout(
      <React.Fragment>
        <EuiFlyoutHeader>
          <EuiTitle size="s" data-test-subj="samplePanelActionTitle">
            <h1>{embeddable.metadata.title}</h1>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <h1 data-test-subj="samplePanelActionBody">This is a sample action</h1>
        </EuiFlyoutBody>
      </React.Fragment>,
      {
        'data-test-subj': 'samplePanelActionFlyout',
      }
    );
  };
}

ContextMenuActionsRegistryProvider.register(() => new TimePicker());
