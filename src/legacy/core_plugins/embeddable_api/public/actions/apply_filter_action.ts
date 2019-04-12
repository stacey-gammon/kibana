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

import { Container, ContainerInput, ContainerOutput } from '../containers';
import { EmbeddableInput, Embeddable } from '../embeddables';
import { APPLY_FILTER_TRIGGER, triggerRegistry } from '../triggers';
import { Filter } from '../types';
import { Action } from './action';
import { actionRegistry } from './action_registry';
import { ActionSavedObject } from './action_saved_object';

interface ApplyFilterContainerInput extends ContainerInput {
  filters: Filter[];
}

const APPLY_FILTER_ACTION_ID = 'APPLY_FILTER_ACTION_ID';

export class ApplyFilterAction extends Action {
  constructor(actionSavedObject?: ActionSavedObject) {
    super({ actionSavedObject });
    this.id = APPLY_FILTER_ACTION_ID;
    this.title = 'Apply filter to current view';

    this.description =
      'This action uses advanced internal knowledge of our embeddables and our filter shape to apply a filter to a' +
      ' container that comes from the APPLY_FILTER_TRIGGER. Functionally, this should implement the same flow Kibana users are' +
      ' used to when they click on a magnifying glass in a saved search, or a pie slice on a visualization, for example.';
  }

  public allowEditing() {
    return false;
  }

  public isSingleton() {
    return true;
  }

  public execute({
    container,
    triggerContext,
  }: {
    container?: Container<ApplyFilterContainerInput>;
    triggerContext?: { filters: Filter[] };
  }) {
    if (!container) {
      throw new Error('Apply filter action requires a container');
    }

    if (!triggerContext) {
      throw new Error('Applying a filter requires a filter as context');
    }


    const newState = _.cloneDeep(container.getInput()) as ApplyFilterContainerInput;
    newState.filters = triggerContext.filters;
    container.setInput(newState);
  }
}

actionRegistry.addAction(new ApplyFilterAction());

triggerRegistry.addDefaultAction({
  triggerId: APPLY_FILTER_TRIGGER,
  actionId: APPLY_FILTER_ACTION_ID,
});
