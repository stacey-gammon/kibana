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
import { Embeddable, EmbeddableInput } from 'plugins/embeddable_api/index';
import React, { ReactNode } from 'react';
import ReactDom from 'react-dom';
import { EmbeddableOutput } from 'plugins/embeddable_api/embeddables';
import { HELLO_WORLD_EMBEDDABLE } from './hello_world_embeddable_factory';
import { HelloWorldEmbeddableComponent } from './hello_world_embeddable_component';

export interface HelloWorldInput extends EmbeddableInput {
  firstName: string;
  lastName?: string;
  title?: string;
}

export interface HelloWorldOutput extends EmbeddableOutput {
  name: string;
}

export class HelloWorldEmbeddable extends Embeddable<HelloWorldInput, HelloWorldOutput> {
  private unsubscribe: () => void;
  private node?: Element;

  constructor(initialInput: HelloWorldInput) {
    super(HELLO_WORLD_EMBEDDABLE, initialInput, { name: '' });

    this.unsubscribe = this.subscribeToInputChanges(() => {
      this.updateOutput({
        name: this.getFullName(),
      });
    });
  }

  public getFullName() {
    return `${this.input.title} ${this.input.firstName} ${this.input.lastName}`;
  }

  public getDoctorate() {
    this.updateInput({ title: 'Dr.' });
  }

  public loseDoctorate() {
    this.updateInput({ title: '' });
  }

  public render(node: HTMLElement) {
    this.node = node;
    ReactDom.render(<HelloWorldEmbeddableComponent helloWorldEmbeddable={this} />, node);
  }

  public destroy() {
    if (this.node) {
      ReactDom.unmountComponentAtNode(this.node);
    }
    this.unsubscribe();
  }
}
