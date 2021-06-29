/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { TrackApplicationView } from '../../../../../src/plugins/usage_collection/public';
import { ALERTS_PATH, DETECTIONS_PATH, SecurityPageName } from '../../common/constants';

import { SpyRoute } from '../common/utils/route/spy_routes';

import { DetectionEnginePage } from './pages/detection_engine/detection_engine';

const renderAlertsRoutes = () => (
  <TrackApplicationView viewId={SecurityPageName.alerts}>
    <DetectionEnginePage />
    <SpyRoute pageName={SecurityPageName.alerts} />
  </TrackApplicationView>
);

const DetectionsRedirects = ({ location }: RouteComponentProps) =>
  location.pathname === DETECTIONS_PATH ? (
    <Redirect to={{ ...location, pathname: ALERTS_PATH }} />
  ) : (
    <Redirect to={{ ...location, pathname: location.pathname.replace(DETECTIONS_PATH, '') }} />
  );

export const routes: RouteProps[] = [
  {
    path: ALERTS_PATH,
    render: renderAlertsRoutes,
  },
  {
    path: DETECTIONS_PATH,
    component: DetectionsRedirects,
  },
];
