/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Legacy } from 'kibana';
import { CoreShim } from '.';

export class Plugin {
  public server: Legacy.Server;

  constructor(server: Legacy.Server) {
    this.server = server;
  }

  public start({ core }: { core: CoreShim }): void {
    return;
  }
}
