/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { withApmSpan } from '../../../../utils/with_apm_span';
import { Setup } from '../../../helpers/setup_request';
import {
  SERVICE_NAME,
  SERVICE_ENVIRONMENT,
} from '../../../../../common/elasticsearch_fieldnames';
import { ALL_OPTION_VALUE } from '../../../../../common/agent_configuration/all_option';

export async function getExistingEnvironmentsForService({
  serviceName,
  setup,
}: {
  serviceName: string | undefined;
  setup: Setup;
}) {
  return withApmSpan('get_existing_environments_for_service', async () => {
    const { internalClient, indices, config } = setup;
    const maxServiceEnvironments = config['xpack.apm.maxServiceEnvironments'];

    const bool = serviceName
      ? { filter: [{ term: { [SERVICE_NAME]: serviceName } }] }
      : { must_not: [{ exists: { field: SERVICE_NAME } }] };

    const params = {
      index: indices.apmAgentConfigurationIndex,
      body: {
        size: 0,
        query: { bool },
        aggs: {
          environments: {
            terms: {
              field: SERVICE_ENVIRONMENT,
              missing: ALL_OPTION_VALUE,
              size: maxServiceEnvironments,
            },
          },
        },
      },
    };

    const resp = await internalClient.search(params);
    const existingEnvironments =
      resp.aggregations?.environments.buckets.map(
        (bucket) => bucket.key as string
      ) || [];
    return existingEnvironments;
  });
}
