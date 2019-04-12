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
import chrome from 'ui/chrome';
import { Action, getAction } from '../actions';
import { Container } from '../containers';
import { openContextMenu } from '../context_menu_actions';
import {
  buildEuiContextMenuPanels,
  ContextMenuAction,
  ContextMenuPanel,
} from '../context_menu_actions';
import { Embeddable } from '../embeddables';

import { triggerRegistry } from './trigger_registry';

function isAction(action: Action | { message: string; statusCode?: number }): action is Action {
  return (action as Action).title !== undefined;
}

export async function getActionsForTrigger(
  triggerId: string,
  context: {
    embeddable?: Embeddable;
    container?: Container;
  } = {}
) {
  const trigger = triggerRegistry.getTrigger(triggerId) || {
    id: '',
    title: 'Invalid Trigger',
  };

  const actionIds =
    trigger.defaultActions && trigger.defaultActions !== ''
      ? trigger.defaultActions.split(';')
      : [];

  const response = await chrome
    .getSavedObjectsClient()
    .get<{ actions: string }>('ui_trigger', triggerId);

  const userActions = response.attributes.actions;
  const userActionIds = userActions && userActions !== '' ? userActions.split(';') : '';
  actionIds.push(...userActionIds);

  const actions: Action[] = [];
  const promises = actionIds.map(async id => {
    const action = await getAction(id);
    if (isAction(action)) {
      if (await action.isCompatible(context)) {
        actions.push(action);
      }

      // TODO: what to do about the errors?
    }
  });

  await Promise.all(promises);

  return actions;
}

export async function executeTriggerActions(
  triggerId: string,
  {
    embeddable,
    container,
    triggerContext,
  }: {
    embeddable: Embeddable;
    container?: Container;
    triggerContext: any;
  }
) {
  const actions = await getActionsForTrigger(triggerId, { embeddable, container });
  if (actions.length > 1) {
    const contextMenuPanel = new ContextMenuPanel({
      title: 'Actions',
      id: 'mainMenu',
    });

    const closeMyContextMenuPanel = () => {
      session.close();
    };
    const wrappedForContextMenu: ContextMenuAction[] = [];
    actions.forEach((action: Action) => {
      if (action.id) {
        wrappedForContextMenu.push(
          new ContextMenuAction(
            {
              id: action.id,
              displayName: action.title,
              parentPanelId: 'mainMenu',
            },
            {
              onClick: () => {
                action.execute({ embeddable, container, triggerContext });
                closeMyContextMenuPanel();
              },
            }
          )
        );
      }
    });
    const panels = buildEuiContextMenuPanels({
      contextMenuPanel,
      actions: wrappedForContextMenu,
      embeddable,
      container,
    });

    const session = openContextMenu(panels);
  } else if (actions.length === 1) {
    actions[0].execute({ embeddable, container, triggerContext });
  }
}
