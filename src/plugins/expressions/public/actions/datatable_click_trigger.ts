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
import { CoreSetup } from 'kibana/public';
import { APPLY_FILTER_TRIGGER, IEmbeddable } from '../../../embeddable/public';
import { ITrigger, createAction, IUiActionsStart } from '../../../ui_actions/public';

export const DATATABLE_CLICK_TRIGGER = 'DATATABLE_CLICK_TRIGGER';
export const DATATABLE_CLICK_ACTION = 'DATATABLE_CLICK_ACTION';

export const dataTableClickTrigger: ITrigger = {
  id: DATATABLE_CLICK_TRIGGER,
  actionIds: [DATATABLE_CLICK_ACTION],
};

export interface DataTableClickTriggerContext {
  clickData: {
    x: any;
    y: any;
  };
  columnMetaData: {
    dataType: string;
  };
  embeddable: IEmbeddable;
}

export const createApplyFilterFromDataTableClickAction = (
  core: CoreSetup<{ uiActions: IUiActionsStart }>
) =>
  createAction({
    type: DATATABLE_CLICK_ACTION,
    execute: async (context: DataTableClickTriggerContext) => {
      const filters = [{}];
      const [coreStart, depsStart] = await core.getStartServices();
      depsStart.uiActions.executeTriggerActions(APPLY_FILTER_TRIGGER, {
        embeddable: context.embeddable,
        filters,
      });
    },
  });
