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

import uuid from 'uuid';
import {
  Embeddable,
  EmbeddableFactoryRegistry,
  EmbeddableInput,
  EmbeddableOutput,
  ErrorEmbeddable,
  EmbeddableFactory,
} from '../embeddables';
import { ViewMode } from '../types';

export interface PanelState<E extends { [key: string]: unknown } = { [key: string]: unknown }> {
  embeddableId: string;
  // The type of embeddable in this panel. Will be used to find the factory in which to
  // load the embeddable.
  type: string;

  // Stores customization state for the embeddable. Perhaps should be part of initialInput.
  customization?: { [key: string]: any };

  // Stores input for this embeddable that is specific to this embeddable. Other parts of embeddable input
  // will be derived from the container's input.
  initialInput: E;
}

export interface ContainerOutput extends EmbeddableOutput {
  embeddableLoaded: { [key: string]: boolean };
}

type NonNeverPropertyNames<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T];
type ObjectWithoutNever<T> = Pick<T, NonNeverPropertyNames<T>>;

export type EmbeddableInputMissingFromContainer<
  EI extends EmbeddableInput,
  CEI extends { [key: string]: unknown }
> = ObjectWithoutNever<{ [key in keyof EI]: CEI[key] extends EI[key] ? never : EI[key] }>;

export interface ContainerInput extends EmbeddableInput {
  hidePanelTitles?: boolean;
  panels: {
    [key: string]: PanelState;
  };
}

export abstract class Container<
  CEI extends EmbeddableInput = EmbeddableInput,
  EO extends EmbeddableOutput = EmbeddableOutput,
  I extends ContainerInput = ContainerInput,
  O extends ContainerOutput = ContainerOutput
> extends Embeddable<I, O> {
  public readonly isContainer: boolean = true;
  protected readonly embeddables: { [key: string]: Embeddable<EmbeddableInput, EO> } = {};
  private embeddableUnsubscribes: { [key: string]: () => void } = {};

  constructor(
    type: string,
    input: I,
    output: O,
    protected embeddableFactories: EmbeddableFactoryRegistry
  ) {
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

  public async addNewEmbeddable<
    EEI extends EmbeddableInput = EmbeddableInput,
    E extends Embeddable<EEI, EO> = Embeddable<EEI, EO>
  >(
    type: string,
    initialInput: EmbeddableInputMissingFromContainer<EEI, CEI>
  ): Promise<E | ErrorEmbeddable> {
    const factory = this.embeddableFactories.getFactoryByName<EmbeddableFactory<EEI, EO, E>>(type);
    const panelState = this.createNewPanelState<EEI>({ type, initialInput });
    this.updatePanelState<EEI>(panelState);
    const embeddable = await factory.create(
      this.getInputForEmbeddable<EEI>(panelState.embeddableId)
    );
    this.subscribeToEmbeddableInputChanges(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;

    this.updateOutput({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
    return embeddable;
  }

  public removeEmbeddable(embeddableId: string) {
    const embeddable = this.getEmbeddable(embeddableId);
    embeddable.destroy();
    delete this.embeddables[embeddableId];

    this.embeddableUnsubscribes[embeddableId]();

    const changedInput = _.cloneDeep(this.input);
    delete changedInput.panels[embeddable.id];
    this.updateInput(changedInput);
  }

  public getEmbeddable<EEI extends EmbeddableInput = EmbeddableInput>(
    id: string
  ): Embeddable<EEI, EO> {
    return this.embeddables[id] as Embeddable<EEI, EO>;
  }

  private updatePanelState<EEI extends EmbeddableInput = EmbeddableInput>(
    panelState: PanelState<EmbeddableInputMissingFromContainer<EEI, CEI>>
  ) {
    this.updateInput({
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

  protected async loadEmbeddable<EEI extends EmbeddableInput = EmbeddableInput>(
    panelState: PanelState<EmbeddableInputMissingFromContainer<EEI, CEI>>
  ) {
    if (this.input.panels[panelState.embeddableId] === undefined) {
      throw new Error(`Panel with id ${panelState.embeddableId} does not exist in this container`);
    }

    const factory = this.embeddableFactories.getFactoryByName<EmbeddableFactory<EEI, EO>>(
      panelState.type
    );

    const embeddable = await factory.create(
      this.getInputForEmbeddable<EEI>(panelState.embeddableId)
    );
    this.subscribeToEmbeddableInputChanges(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState<EEI>(panelState);

    this.updateOutput({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
  }

  protected createNewPanelState<EEI extends EmbeddableInput = EmbeddableInput>({
    type,
    initialInput,
  }: {
    type: string;
    initialInput: EmbeddableInputMissingFromContainer<EEI, CEI> & { id?: string };
  }): PanelState<EmbeddableInputMissingFromContainer<EEI, CEI>> {
    const embeddableId = initialInput.id || uuid.v4();
    return {
      type,
      embeddableId,
      customization: {},
      initialInput,
    };
  }

  protected getPanelState<EI>(embeddableId: string) {
    const panelState: PanelState = this.input.panels[embeddableId];
    return panelState as PanelState<EI>;
  }

  protected abstract getInputForEmbeddableFromContainer(embeddableId: string): CEI;

  protected getInputForEmbeddable<EEI extends EmbeddableInput = EmbeddableInput>(
    embeddableId: string
  ): EEI {
    const containerInput: CEI = this.getInputForEmbeddableFromContainer(embeddableId);
    const panelState = this.getPanelState<EmbeddableInputMissingFromContainer<EEI, CEI>>(
      embeddableId
    );

    return ({
      ...containerInput,
      ...panelState.initialInput,
      // Typescript has difficulties with inferring this type but it is accurate with all
      // tests I tried. Could probably be revisted with future releases of TS to see if
      // it can accurately infer the type.
    } as unknown) as EEI;
  }

  private subscribeToEmbeddableInputChanges(embeddable: Embeddable) {
    this.embeddableUnsubscribes[embeddable.id] = embeddable.subscribeToInputChanges(
      (changes: Partial<EmbeddableInput>) => {
        this.updateInput({
          ...this.input,
          panels: {
            ...this.input.panels,
            [embeddable.id]: {
              ...this.input.panels[embeddable.id],
              initialInput: {
                ...changes,
                ...this.input.panels[embeddable.id].initialInput,
              },
            },
          },
        });
      }
    );
  }

  private async initializeEmbeddables() {
    const promises = Object.values(this.input.panels).map(panel =>
      this.loadEmbeddable<EmbeddableInput>(panel as PanelState<
        EmbeddableInputMissingFromContainer<EmbeddableInput, CEI>
      >)
    );
    await Promise.all(promises);

    this.subscribeToInputChanges(() => this.setEmbeddablesInput());
  }

  private setEmbeddablesInput() {
    Object.values(this.embeddables).forEach((embeddable: Embeddable<EmbeddableInput, EO>) => {
      const input = this.getInputForEmbeddable<EmbeddableInput>(embeddable.id);
      embeddable.setInput(input);
    });
  }
}
