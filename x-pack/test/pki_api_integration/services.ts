/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { services as apiIntegrationServices } from '../api_integration/services';

export const services = {
  esSupertest: apiIntegrationServices.esSupertest,
  supertestWithoutAuth: apiIntegrationServices.supertestWithoutAuth,
};
