/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import 'uiExports/embeddableActions';
import 'uiExports/embeddableFactories';

export { ActionEditor } from './app/action_editor';
export { EventEditor } from './app/event_editor';

import { Plugin as EmbeddableActionEditor } from './plugin';
import { createShim } from './shim';

const embeddableActionEditor = new EmbeddableActionEditor();

// Because of code importing ActionEditor and EventEditor above, this causes
// silent failures because of `uiRoutes.enable` inside `createShim`.
// embeddableActionEditor.start(createShim());

export { ActionEventEditorApp } from './app';
