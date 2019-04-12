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
import { I18nProvider } from '@kbn/i18n/react';
import { isEqual } from 'lodash';
import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { Adapters } from 'ui/inspector';
import { Container } from '../containers';
import { EmbeddablePanel } from '../panel';
import { Trigger } from '../triggers';
import { OutputSpec, ViewMode } from '../types';

export interface EmbeddableInput {
  viewMode?: ViewMode;
  title?: string;
  id: string;
  customization?: { [key: string]: any };
  savedObjectId?: string;
  editable?: boolean;
}

export interface EmbeddableOutput {
  editUrl?: string;
}

export class Embeddable<
  I extends EmbeddableInput = EmbeddableInput,
  O extends EmbeddableOutput = EmbeddableOutput
> {
  public readonly isContainer: boolean = false;
  public readonly type: string;
  public readonly id: string;
  protected anyChangeListeners: Array<
    <EI extends I, EO extends O>(changes: { output?: Partial<EO>; input?: Partial<EI> }) => void
  > = [];
  protected inputChangeListeners: Array<(<EI extends I>(input: Partial<EI>) => void)> = [];
  protected outputChangeListeners: Array<(<EO extends O>(output: Partial<EO>) => void)> = [];
  protected output: O;
  protected input: I;
  private panelContainer?: Element;

  constructor(type: string, input: I, output: O) {
    this.type = type;
    this.id = input.id;
    this.output = output;
    this.input = input;
  }

  public updateInput(changes: Partial<I>): void {
    const newInput = {
      ...this.input,
      ...changes,
    };
    if (!isEqual(this.input, newInput)) {
      this.input = newInput;
      this.debug();
      this.emitInputChanged(changes);
    }
  }

  public emitInputChanged(changes: Partial<I>) {
    this.inputChangeListeners.forEach(listener => listener(changes));
    this.anyChangeListeners.forEach(listener => listener({ input: changes }));
  }

  public getOutput(): Readonly<O> {
    return this.output;
  }

  public getInput(): Readonly<I> {
    return this.input;
  }

  public getOutputSpec(trigger?: Trigger): OutputSpec {
    return {};
  }

  public subscribeToInputChanges(listener: (input: Partial<I>) => void) {
    this.inputChangeListeners.push(listener);
    const unsubscribe = () => {
      this.inputChangeListeners.splice(this.inputChangeListeners.indexOf(listener), 1);
    };
    return unsubscribe;
  }

  public subscribeToOutputChanges(listener: (output: Partial<O>) => void) {
    this.outputChangeListeners.push(listener);
    const unsubscribe = () => {
      this.outputChangeListeners.splice(this.outputChangeListeners.indexOf(listener), 1);
    };
    return unsubscribe;
  }

  public subscribeToChanges(listener: () => void) {
    this.anyChangeListeners.push(listener);
    const unsubscribe = () => {
      this.anyChangeListeners.splice(this.anyChangeListeners.indexOf(listener), 1);
    };
    return unsubscribe;
  }

  public supportsTrigger(trigger: Trigger) {
    return false;
  }

  /**
   * Embeddable should render itself at the given domNode.
   */
  public renderInPanel(domNode: HTMLElement | Element, container?: Container) {
    // Clean up if this has already been rendered once.
    // this.destroy();

    this.panelContainer = domNode;

    ReactDOM.render(
      // @ts-ignore
      <I18nProvider>
        <EmbeddablePanel embeddable={this as Embeddable} container={container} />
      </I18nProvider>,
      domNode
    );
  }

  public render(domNode: HTMLElement | ReactNode): void {
    return;
  }

  /**
   * An embeddable can return inspector adapters if it want the inspector to be
   * available via the context menu of that panel.
   * @return Inspector adapters that will be used to open an inspector for.
   */
  public getInspectorAdapters(): Adapters | undefined {
    return undefined;
  }

  public destroy(): void {
    if (this.panelContainer) {
      ReactDOM.unmountComponentAtNode(this.panelContainer);
    }
    return;
  }

  public debug() {
    // @ts-nocheck
    console.log(`Embeddable ${this.id}:\nINPUT:\n${JSON.stringify(this.input)}`);
  }

  protected emitOutputChanged(changes: Partial<O>) {
    this.outputChangeListeners.forEach(listener => listener(changes));
    this.anyChangeListeners.forEach(listener => listener({ output: changes }));
  }

  protected updateOutput(outputChanges: Partial<O>): void {
    const newOutput = {
      ...this.output,
      ...outputChanges,
    };
    if (!isEqual(this.output, newOutput)) {
      this.output = newOutput;
      this.debug();
      this.emitOutputChanged(outputChanges);
    }
  }
}
