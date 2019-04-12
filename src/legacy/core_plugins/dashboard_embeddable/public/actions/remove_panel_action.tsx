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

import { i18n } from '@kbn/i18n';
import {
  Action,
  actionRegistry,
  Embeddable,
  CONTEXT_MENU_TRIGGER,
  triggerRegistry,
  ViewMode,
  ExecuteActionContext,
} from 'plugins/embeddable_api/index';
import { DASHBOARD_CONTAINER_TYPE, DashboardContainer } from '../embeddable';
import { DashboardEmbeddable } from '../embeddable/dashboard_container';

export const REMOVE_PANEL_ACTION = 'REMOVE_PANEL_ACTION';

export class RemovePanelAction extends Action {
  constructor() {
    super({
      type: 'REMOVE_PANEL_ACTION',
    });

    this.id = REMOVE_PANEL_ACTION;
    this.title = i18n.translate('kbn.dashboard.panel.removePanel.displayName', {
      defaultMessage: 'Delete from dashboard',
    });
    this.priority = 6;
  }

  public isCompatible({
    embeddable,
    container,
  }: {
    embeddable: Embeddable;
    container: DashboardContainer;
  }) {
    return Promise.resolve(
      container &&
        container.type === DASHBOARD_CONTAINER_TYPE &&
        embeddable.getInput().viewMode === ViewMode.EDIT &&
        container.getInput().expandedPanelId !== embeddable.id
    );
  }

  public execute({ embeddable, container }: ExecuteActionContext<Embeddable, DashboardContainer>) {
    if (!container) {
      throw new Error('Remove action requires a container');
    }
    container.removeEmbeddable(embeddable.id);
  }
}

actionRegistry.addAction(new RemovePanelAction());

triggerRegistry.addDefaultAction({
  triggerId: CONTEXT_MENU_TRIGGER,
  actionId: REMOVE_PANEL_ACTION,
});
