/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  actionFactoryRegistry,
  actionRegistry,
  CONTEXT_MENU_TRIGGER,
  triggerRegistry,
} from '../../../../src/legacy/core_plugins/embeddable_api/public';

import { CUSTOMIZE_EVENTS_ACTION, CustomizeEventsAction } from './customize_events';

import {
  ApplyTimeRangeActionFactory,
  CustomizeTimeRangeAction,
  CustomizeTimeRangeFactory,
} from './customize_time_range';
import { AddNavigateAction } from './navigate_action/add_navigate_action';
import { AddNavigateActionFactory } from './navigate_action/add_navigate_action_factory';
import { DashboardDrilldownActionFactory } from './navigate_action/dashboard_drilldown_action_factory';
import { NavigateActionFactory } from './navigate_action/navigate_action_factory';

import { CUSTOMIZE_TIME_RANGE } from './customize_time_range/customize_time_range_factory';
import { ADD_NAVIGATE_ACTION } from './navigate_action/add_navigate_action_factory';

actionRegistry.addAction(new CustomizeTimeRangeAction());
actionRegistry.addAction(new AddNavigateAction());
actionRegistry.addAction(new CustomizeEventsAction());

// actionFactoryRegistry.registerActionFactory(new ExpressionActionFactory());
// actionFactoryRegistry.registerActionFactory(new CustomizeTimeRangeFactory());
actionFactoryRegistry.registerActionFactory(new ApplyTimeRangeActionFactory());
actionFactoryRegistry.registerActionFactory(new NavigateActionFactory());
actionFactoryRegistry.registerActionFactory(new DashboardDrilldownActionFactory());

triggerRegistry.addDefaultAction({
  triggerId: CONTEXT_MENU_TRIGGER,
  actionId: CUSTOMIZE_EVENTS_ACTION,
});

triggerRegistry.addDefaultAction({
  triggerId: CONTEXT_MENU_TRIGGER,
  actionId: ADD_NAVIGATE_ACTION,
});

triggerRegistry.addDefaultAction({
  triggerId: CONTEXT_MENU_TRIGGER,
  actionId: CUSTOMIZE_TIME_RANGE,
});
