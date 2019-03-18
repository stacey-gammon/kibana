/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Action, Container, Embeddable } from '../../../../';

import { EuiIcon } from '@elastic/eui';
import { ViewMode } from 'plugins/embeddable_api/types';
import React from 'react';
import { openFlyout } from 'ui/flyout';
import { CustomizePanelFlyout } from './customize_panel_flyout';

const CUSTOMIZE_PANEL_ACTION_ID = 'CUSTOMIZE_PANEL_ACTION_ID';

export class CustomizePanelTitleAction extends Action {
  constructor() {
    super();
    this.id = CUSTOMIZE_PANEL_ACTION_ID;
    this.title = 'Customize panel';
    this.priority = 8;
  }

  public allowEditing() {
    return false;
  }

  public isSingleton() {
    return true;
  }

  public getIcon() {
    return <EuiIcon type="pencil" />;
  }

  public isCompatible({
    embeddable,
    container,
  }: {
    embeddable: Embeddable;
    container?: Container;
  }) {
    return Promise.resolve(
      container && container.getOutput().viewMode === ViewMode.EDIT ? true : false
    );
  }

  public execute({ embeddable, container }: { embeddable: Embeddable; container: Container }) {
    if (!embeddable || !container) {
      throw new Error(
        'Customize panel title action requires an embeddable and container as context.'
      );
    }
    openFlyout(
      <CustomizePanelFlyout
        container={container}
        embeddable={embeddable}
        onReset={() => this.onReset({ embeddable, container })}
        onUpdatePanelTitle={title => this.onSetTitle({ embeddable, container }, title)}
      />,
      {
        'data-test-subj': 'samplePanelActionFlyout',
      }
    );
  }

  private onReset(panelAPI: { embeddable: Embeddable; container: Container }) {
    this.onSetTitle(panelAPI);
  }

  private onSetTitle(
    { embeddable, container }: { embeddable: Embeddable; container: Container },
    title?: string
  ) {
    const currentContainerState = container.getOutput();
    const embeddableState = currentContainerState.panels[embeddable.id];
    container.setInput({
      ...currentContainerState,
      panels: {
        ...currentContainerState.panels,
        [embeddable.id]: {
          ...embeddableState,
          customization: {
            ...embeddableState.customization,
            title,
          },
        },
      },
    });
  }
}
