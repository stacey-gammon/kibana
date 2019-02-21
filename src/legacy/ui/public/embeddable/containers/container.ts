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

import { ContainerState } from 'ui/embeddable/containers/container_state';
import { Embeddable } from 'ui/embeddable/embeddable';

export class Container {
  private context: object = {};

  private embeddables: { [key: string]: Embeddable } = {};
  private embeddableOverrides: { [key: string]: object } = {};

  private contextTranformations: { [id: string]: string } = {};

  public registerContextExpression({ expression, id }: { expression: string; id: string }) {
    if (this.contextExpressions.hasOwnProperty(id)) {
      throw new Error('Already an expression registered with that id');
    }
    this.contextExpressions[id] = expression;
  }

  public onContextStateChange(newContext: object) {
    const context = embeddables.forEach(embeddable => {
      embeddable.onContainerStateChange();
    });
  }
}
