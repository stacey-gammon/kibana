/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Legacy } from 'kibana';
import { resolve } from 'path';
// @ts-ignore
import { injectVars } from '../../../src/legacy/core_plugins/kibana/inject_vars';
// @ts-ignore
import mappings from './mappings.json';
import { Plugin as EmbeddableExplorer } from './plugin';
import { createShim } from './shim';

export type CoreShim = object;

export const embeddableActionEditor = (kibana: any) => {
  return new kibana.Plugin({
    id: 'embeddable_action_editor',
    publicDir: resolve(__dirname, 'public'),
    require: ['kibana', 'xpack_main'],
    uiExports: {
      app: {
        title: 'Action Editor',
        order: 1,
        main: 'plugins/embeddable_action_editor',
      },
    },
    init(server: Legacy.Server) {
      const embeddableExplorer = new EmbeddableExplorer(server);
      embeddableExplorer.start(createShim());

      // @ts-ignore
      server.injectUiAppVars('embeddable_action_editor', () => injectVars(server));
    },
  });
};
