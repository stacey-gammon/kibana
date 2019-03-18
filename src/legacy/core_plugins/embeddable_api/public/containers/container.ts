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

import { Embeddable, embeddableFactories, EmbeddableInput, EmbeddableOutput } from '../embeddables';
import { ViewMode } from '../types';

import uuid from 'uuid';

export interface PanelState<E extends EmbeddableInput = EmbeddableInput> {
  embeddableId: string;
  // The type of embeddable in this panel. Will be used to find the factory in which to
  // load the embeddable.
  type: string;

  // Stores customization state for the embeddable. Perhaps should be part of initialInput.
  customization?: { [key: string]: any };

  // Stores input for this embeddable that is specific to this embeddable. Other parts of embeddable input
  // will be derived from the container's input.
  initialInput: Partial<E>;
}

export interface ContainerInput extends EmbeddableInput {
  hidePanelTitles?: boolean;
  panels: {
    [key: string]: PanelState;
  };
}

export interface ContainerOutput extends EmbeddableOutput {
  embeddableLoaded: { [key: string]: boolean };
}

export class Container<
  I extends ContainerInput = ContainerInput,
  O extends ContainerOutput = ContainerOutput,
  E extends Embeddable = Embeddable
> extends Embeddable<I, O> {
  public readonly isContainer: boolean = true;
  protected readonly embeddables: { [key: string]: E } = {};
  private embeddableUnsubscribes: { [key: string]: () => void } = {};

  constructor(type: string, input: I, output: O) {
    super(type, input, output);

    this.initializeEmbeddables();
  }

  public getEmbeddableCustomization(embeddableId: string) {
    return this.input.panels[embeddableId].customization;
  }

  public getViewMode() {
    return this.input.viewMode ? this.input.viewMode : ViewMode.EDIT;
  }

  public getHidePanelTitles() {
    return this.input.hidePanelTitles ? this.input.hidePanelTitles : false;
  }

  public updatePanelState(panelState: PanelState) {
    this.setInput({
      ...this.input,
      panels: {
        ...this.input.panels,
        [panelState.embeddableId]: {
          ...this.input.panels[panelState.embeddableId],
          ...panelState,
        },
      },
    });
  }

  public async loadEmbeddable(panelState: PanelState) {
    const factory = embeddableFactories.getFactoryByName(panelState.type);
    const embeddable = await factory.create(this.getInputForEmbeddable(panelState));
    this.subscribeToEmbeddableCustomizations(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(panelState);

    this.emitOutputChanged({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
  }

  public async addNewEmbeddable(type: string) {
    const factory = embeddableFactories.getFactoryByName(type);
    const panelState = this.createNewPanelState(type);
    const embeddable = await factory.create(this.getInputForEmbeddable(panelState));
    this.subscribeToEmbeddableCustomizations(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(panelState);

    this.emitOutputChanged({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
    return embeddable;
  }

  public addExistingEmbeddable(embeddable: Embeddable) {
    const panelState = this.createNewPanelState(embeddable.type, embeddable.id);
    panelState.initialInput = embeddable.getInput();
    this.subscribeToEmbeddableCustomizations(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(panelState);

    this.emitOutputChanged({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
  }

  public createNewPanelState(type: string, id?: string): PanelState {
    const embeddableId = id || uuid.v4();
    return {
      type,
      embeddableId,
      customization: {},
      initialInput: {},
    };
  }

  public removeEmbeddable(embeddable: Embeddable) {
    this.embeddables[embeddable.id].destroy();
    delete this.embeddables[embeddable.id];

    this.embeddableUnsubscribes[embeddable.id]();

    const changedInput = _.cloneDeep(this.input);
    delete changedInput.panels[embeddable.id];
    this.setInput(changedInput);
  }

  public getInputForEmbeddable(panelState: PanelState): EmbeddableInput {
    return {
      id: panelState.embeddableId,
      customization: {
        ...panelState.customization,
      },
      ...panelState.initialInput,
    };
  }

  public getEmbeddable(id: string) {
    return this.embeddables[id];
  }

  private subscribeToEmbeddableCustomizations(embeddable: Embeddable) {
    this.embeddableUnsubscribes[embeddable.id] = embeddable.subscribeToOutputChanges(
      (output: EmbeddableOutput) => {
        this.setInput({
          ...this.input,
          panels: {
            ...this.input.panels,
            [embeddable.id]: {
              ...this.input.panels[embeddable.id],
              customization: {
                ...this.input.panels[embeddable.id].customization,
                ...output.customization,
              },
            },
          },
        });
      }
    );
  }

  private async initializeEmbeddables() {
    const promises = Object.values(this.input.panels).map(panel => this.loadEmbeddable(panel));
    await Promise.all(promises);

    this.subscribeToInputChanges(() => this.setEmbeddablesInput());
  }

  private setEmbeddablesInput() {
    Object.values(this.embeddables).forEach((embeddable: Embeddable) => {
      embeddable.setInput(this.getInputForEmbeddable(this.input.panels[embeddable.id]));
    });
  }
}
