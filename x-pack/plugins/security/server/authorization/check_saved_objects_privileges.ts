/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { KibanaRequest } from '../../../../../src/core/server';
import { SpacesService } from '../plugin';
import { CheckPrivilegesWithRequest, CheckPrivilegesResponse } from './check_privileges';

export type CheckSavedObjectsPrivilegesWithRequest = (
  request: KibanaRequest
) => CheckSavedObjectsPrivileges;

export type CheckSavedObjectsPrivileges = (
  actions: string | string[],
  namespaceOrNamespaces?: string | string[]
) => Promise<CheckPrivilegesResponse>;

export const checkSavedObjectsPrivilegesWithRequestFactory = (
  checkPrivilegesWithRequest: CheckPrivilegesWithRequest,
  getSpacesService: () => SpacesService | undefined
): CheckSavedObjectsPrivilegesWithRequest => {
  return function checkSavedObjectsPrivilegesWithRequest(
    request: KibanaRequest
  ): CheckSavedObjectsPrivileges {
    return async function checkSavedObjectsPrivileges(
      actions: string | string[],
      namespaceOrNamespaces?: string | string[]
    ) {
      const spacesService = getSpacesService();
      if (!spacesService) {
        // Spaces disabled, authorizing globally
        return await checkPrivilegesWithRequest(request).globally(actions);
      } else if (Array.isArray(namespaceOrNamespaces)) {
        // Spaces enabled, authorizing against multiple spaces
        if (!namespaceOrNamespaces.length) {
          throw new Error(`Can't check saved object privileges for 0 namespaces`);
        }
        const spaceIds = namespaceOrNamespaces.map((x) => spacesService.namespaceToSpaceId(x));
        return await checkPrivilegesWithRequest(request).atSpaces(spaceIds, actions);
      } else {
        // Spaces enabled, authorizing against a single space
        const spaceId = spacesService.namespaceToSpaceId(namespaceOrNamespaces);
        return await checkPrivilegesWithRequest(request).atSpace(spaceId, actions);
      }
    };
  };
};
