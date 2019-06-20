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
import _ from 'lodash';
import { i18n } from '@kbn/i18n';
import { DEFAULT_PANEL_WIDTH, DEFAULT_PANEL_HEIGHT } from '../dashboard_constants';
import { PanelUtils } from '../panel/panel_utils';
import {
  RawSavedDashboardPanelTo60,
  RawSavedDashboardPanel630,
  RawSavedDashboardPanel640To720,
  RawSavedDashboardPanel730ToLatest,
  RawSavedDashboardPanel610,
  RawSavedDashboardPanel620,
} from './types';
import {
  SavedDashboardPanelTo60,
  SavedDashboardPanel620,
  SavedDashboardPanel630,
  SavedDashboardPanel610,
} from '../types';

const PANEL_HEIGHT_SCALE_FACTOR = 5;
const PANEL_HEIGHT_SCALE_FACTOR_WITH_MARGINS = 4;
const PANEL_WIDTH_SCALE_FACTOR = 4;

/**
 * Note!
 *
 * The 7.3.0 migrations reference versions that are quite old because for a long time all of this
 * migration logic was done ad hoc in the code itself, not on the indexed data (migrations didn't even
 * exist at the point most of that logic was put in place).
 *
 * So you could have a dashboard in 7.2.0 that was created in 6.3 and it will have data of a different
 * shape than some other dashboards that were created more recently.
 *
 * Moving forward migrations should be simpler since all 7.3.0+ dashboards should finally have the
 * same data.
 */

function isPre61Panel(
  panel: unknown | RawSavedDashboardPanelTo60
): panel is RawSavedDashboardPanelTo60 {
  return (panel as RawSavedDashboardPanelTo60).row !== undefined;
}

function is61Panel(panel: unknown | RawSavedDashboardPanel610): panel is RawSavedDashboardPanel610 {
  const panelVersion = PanelUtils.parseVersion((panel as RawSavedDashboardPanel610).version);
  return panelVersion && panelVersion.major === 6 && panelVersion.minor === 1;
}

function is62Panel(panel: unknown | RawSavedDashboardPanel620): panel is RawSavedDashboardPanel620 {
  const panelVersion = PanelUtils.parseVersion((panel as RawSavedDashboardPanel620).version);
  return panelVersion && panelVersion.major === 6 && panelVersion.minor === 2;
}

function is63Panel(panel: unknown | RawSavedDashboardPanel630): panel is RawSavedDashboardPanel630 {
  const panelVersion = PanelUtils.parseVersion((panel as RawSavedDashboardPanel630).version);
  return panelVersion && panelVersion.major === 6 && panelVersion.minor === 3;
}

function is640To720Panel(
  panel: unknown | RawSavedDashboardPanel640To720
): panel is RawSavedDashboardPanel640To720 {
  const panelVersion = PanelUtils.parseVersion((panel as RawSavedDashboardPanel640To720).version);
  return (
    panelVersion &&
    ((panelVersion.major === 6 && panelVersion.minor > 3) ||
      (panelVersion.major === 7 && panelVersion.minor < 3))
  );
}

// Migrations required for 6.0 and prior:
// 1. (6.1) migrate size_x/y/row/col into gridData
// 2. (6.2) migrate uiState into embeddableConfig
// 3. (6.3) scale grid dimensions
// 4. (6.4) remove columns, sort properties
// 5. (7.3) make sure panelIndex is a string
function migratePre61PanelToLatest(
  panel: RawSavedDashboardPanelTo60,
  version: string,
  useMargins: boolean,
  uiState?: { [key: string]: { [key: string]: unknown } }
): RawSavedDashboardPanel730ToLatest {
  ['col', 'row'].forEach(key => {
    if (!_.has(panel, key)) {
      throw new Error(
        i18n.translate('kbn.dashboard.panel.unableToMigratePanelDataForSixOneZeroErrorMessage', {
          defaultMessage:
            'Unable to migrate panel data for "6.1.0" backwards compatibility, panel does not contain expected field: {key}',
          values: { key },
        })
      );
    }
  });

  const embeddableConfig = uiState ? uiState[`P-${panel.panelIndex}`] || {} : {};

  if (panel.columns || panel.sort) {
    embeddableConfig.columns = panel.columns;
    embeddableConfig.sort = panel.sort;
  }

  const heightScaleFactor = useMargins
    ? PANEL_HEIGHT_SCALE_FACTOR_WITH_MARGINS
    : PANEL_HEIGHT_SCALE_FACTOR;

  const { columns, sort, row, col, size_x, size_y, ...rest } = panel;
  return {
    ...rest,
    version,
    panelIndex: panel.panelIndex.toString(),
    gridData: {
      x: (panel.col - 1) * PANEL_WIDTH_SCALE_FACTOR,
      y: (panel.row - 1) * heightScaleFactor,
      w: panel.size_x ? panel.size_x * PANEL_WIDTH_SCALE_FACTOR : DEFAULT_PANEL_WIDTH,
      h: panel.size_y ? panel.size_y * heightScaleFactor : DEFAULT_PANEL_HEIGHT,
      i: panel.panelIndex.toString(),
    },
    embeddableConfig,
  };
}

// Migrations required for 6.1 panels:
// 1. (6.2) migrate uiState into embeddableConfig
// 2. (6.3) scale grid dimensions
// 3. (6.4) remove columns, sort properties
// 4. (7.3) make sure panel index is a string
function migrate610PanelToLatest(
  panel: RawSavedDashboardPanel610,
  version: string,
  useMargins: boolean,
  uiState?: { [key: string]: { [key: string]: unknown } }
): RawSavedDashboardPanel730ToLatest {
  ['w', 'x', 'h', 'y'].forEach(key => {
    if (!_.has(panel.gridData, key)) {
      throw new Error(
        i18n.translate('kbn.dashboard.panel.unableToMigratePanelDataForSixThreeZeroErrorMessage', {
          defaultMessage:
            'Unable to migrate panel data for "6.3.0" backwards compatibility, panel does not contain expected field: {key}',
          values: { key },
        })
      );
    }
  });

  const embeddableConfig = uiState ? uiState[`P-${panel.panelIndex}`] : {};

  // 2. (6.4) remove columns, sort properties
  if (panel.columns || panel.sort) {
    embeddableConfig.columns = panel.columns;
    embeddableConfig.sort = panel.sort;
  }

  // 1. (6.3) scale grid dimensions
  const heightScaleFactor = useMargins
    ? PANEL_HEIGHT_SCALE_FACTOR_WITH_MARGINS
    : PANEL_HEIGHT_SCALE_FACTOR;
  const { columns, sort, ...rest } = panel;

  return {
    ...rest,
    version,
    panelIndex: panel.panelIndex.toString(),
    gridData: {
      w: panel.gridData.w * PANEL_WIDTH_SCALE_FACTOR,
      h: panel.gridData.h * heightScaleFactor,
      x: panel.gridData.x * PANEL_WIDTH_SCALE_FACTOR,
      y: panel.gridData.y * heightScaleFactor,
      i: panel.gridData.i,
    },
    embeddableConfig,
  };
}

// Migrations required for 6.2 panels:
// 1. (6.3) scale grid dimensions
// 2. (6.4) remove columns, sort properties
// 3. (7.3) make sure panel index is a string
function migrate620PanelToLatest(
  panel: RawSavedDashboardPanel620,
  version: string,
  useMargins: boolean
): RawSavedDashboardPanel730ToLatest {
  // Migrate column, sort
  const embeddableConfig = panel.embeddableConfig || {};
  if (panel.columns || panel.sort) {
    embeddableConfig.columns = panel.columns;
    embeddableConfig.sort = panel.sort;
  }

  // Scale grid dimensions
  const heightScaleFactor = useMargins
    ? PANEL_HEIGHT_SCALE_FACTOR_WITH_MARGINS
    : PANEL_HEIGHT_SCALE_FACTOR;
  const { columns, sort, ...rest } = panel;

  return {
    ...rest,
    version,
    panelIndex: panel.panelIndex.toString(),
    gridData: {
      w: panel.gridData.w * PANEL_WIDTH_SCALE_FACTOR,
      h: panel.gridData.h * heightScaleFactor,
      x: panel.gridData.x * PANEL_WIDTH_SCALE_FACTOR,
      y: panel.gridData.y * heightScaleFactor,
      i: panel.gridData.i,
    },
    embeddableConfig,
  };
}

// Migrations required for 6.3 panels:
// 1. (6.4) remove columns, sort properties
// 2. (7.3) make sure panel index is a string
function migrate630PanelToLatest(
  panel: RawSavedDashboardPanel630,
  version: string
): RawSavedDashboardPanel730ToLatest {
  // Migrate column, sort
  const embeddableConfig = panel.embeddableConfig || {};
  if (panel.columns || panel.sort) {
    embeddableConfig.columns = panel.columns;
    embeddableConfig.sort = panel.sort;
  }

  const { columns, sort, ...rest } = panel;
  return {
    ...rest,
    version,
    panelIndex: panel.panelIndex.toString(),
    embeddableConfig,
  };
}

// Migrations required for 6.4 to 7.20 panels:
// 1. (7.3) make sure panel index is a string
function migrate640To720PanelsToLatest(
  panel: RawSavedDashboardPanel630,
  version: string
): RawSavedDashboardPanel730ToLatest {
  return {
    ...panel,
    version,
    panelIndex: panel.panelIndex.toString(),
  };
}

export function migratePanelsTo730(
  panels: Array<
    | RawSavedDashboardPanelTo60
    | RawSavedDashboardPanel610
    | RawSavedDashboardPanel620
    | RawSavedDashboardPanel630
    | RawSavedDashboardPanel640To720
    // We run these on post processed panels too for url BWC
    | SavedDashboardPanelTo60
    | SavedDashboardPanel610
    | SavedDashboardPanel620
    | SavedDashboardPanel630
  >,
  version: string,
  useMargins: boolean,
  uiState?: { [key: string]: { [key: string]: unknown } }
): RawSavedDashboardPanel730ToLatest[] {
  return panels.map(panel => {
    if (isPre61Panel(panel)) {
      return migratePre61PanelToLatest(panel, version, useMargins, uiState);
    }

    if (is61Panel(panel)) {
      return migrate610PanelToLatest(panel, version, useMargins, uiState);
    }

    if (is62Panel(panel)) {
      return migrate620PanelToLatest(panel, version, useMargins);
    }

    if (is63Panel(panel)) {
      return migrate630PanelToLatest(panel, version);
    }

    if (is640To720Panel(panel)) {
      return migrate640To720PanelsToLatest(panel, version);
    }

    return panel as RawSavedDashboardPanel730ToLatest;
  });
}
