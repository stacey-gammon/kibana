/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

function PanelActions(kibana: any) {
  return new kibana.Plugin({
    uiExports: {
      contextMenuActions: ['plugins/panel_actions/time_picker'],
    },
  });
}

module.exports = (kibana: any) => {
  return [PanelActions(kibana)];
};
