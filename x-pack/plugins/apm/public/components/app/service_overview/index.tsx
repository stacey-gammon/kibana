/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem, EuiLink, EuiPanel } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import React from 'react';
import { isRumAgentName, isIosAgentName } from '../../../../common/agent_name';
import { AnnotationsContextProvider } from '../../../context/annotations/annotations_context';
import { useApmServiceContext } from '../../../context/apm_service/use_apm_service_context';
import { ChartPointerEventContextProvider } from '../../../context/chart_pointer_event/chart_pointer_event_context';
import { useBreakPoints } from '../../../hooks/use_break_points';
import { LatencyChart } from '../../shared/charts/latency_chart';
import { TransactionBreakdownChart } from '../../shared/charts/transaction_breakdown_chart';
import { TransactionErrorRateChart } from '../../shared/charts/transaction_error_rate_chart';
import { ServiceOverviewDependenciesTable } from './service_overview_dependencies_table';
import { ServiceOverviewErrorsTable } from './service_overview_errors_table';
import { ServiceOverviewInstancesChartAndTable } from './service_overview_instances_chart_and_table';
import { ServiceOverviewThroughputChart } from './service_overview_throughput_chart';
import { TransactionsTable } from '../../shared/transactions_table';
import { useApmParams } from '../../../hooks/use_apm_params';
import { useFallbackToTransactionsFetcher } from '../../../hooks/use_fallback_to_transactions_fetcher';
import { AggregatedTransactionsCallout } from '../../shared/aggregated_transactions_callout';
import { useApmRouter } from '../../../hooks/use_apm_router';

/**
 * The height a chart should be if it's next to a table with 5 rows and a title.
 * Add the height of the pagination row.
 */
export const chartHeight = 288;

export function ServiceOverview() {
  const { agentName, serviceName } = useApmServiceContext();
  const {
    query,
    query: { environment, kuery },
  } = useApmParams('/services/:serviceName/overview');
  const { fallbackToTransactions } = useFallbackToTransactionsFetcher({
    kuery,
  });

  // The default EuiFlexGroup breaks at 768, but we want to break at 992, so we
  // observe the window width and set the flex directions of rows accordingly
  const { isMedium } = useBreakPoints();
  const rowDirection = isMedium ? 'column' : 'row';
  const isRumAgent = isRumAgentName(agentName);
  const isIosAgent = isIosAgentName(agentName);

  const router = useApmRouter();
  const dependenciesLink = router.link('/services/:serviceName/dependencies', {
    path: {
      serviceName,
    },
    query,
  });

  return (
    <AnnotationsContextProvider
      serviceName={serviceName}
      environment={environment}
    >
      <ChartPointerEventContextProvider>
        <EuiFlexGroup direction="column" gutterSize="s">
          {fallbackToTransactions && (
            <EuiFlexItem>
              <AggregatedTransactionsCallout />
            </EuiFlexItem>
          )}
          <EuiFlexItem>
            <EuiPanel hasBorder={true}>
              <LatencyChart
                height={200}
                environment={environment}
                kuery={kuery}
              />
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup
              direction={rowDirection}
              gutterSize="s"
              responsive={false}
            >
              <EuiFlexItem grow={3}>
                <ServiceOverviewThroughputChart
                  height={chartHeight}
                  environment={environment}
                  kuery={kuery}
                />
              </EuiFlexItem>
              <EuiFlexItem grow={7}>
                <EuiPanel hasBorder={true}>
                  <TransactionsTable
                    kuery={kuery}
                    environment={environment}
                    fixedHeight={true}
                  />
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup
              direction={rowDirection}
              gutterSize="s"
              responsive={false}
            >
              {!isRumAgent && (
                <EuiFlexItem grow={3}>
                  <TransactionErrorRateChart
                    height={chartHeight}
                    showAnnotations={false}
                    kuery={kuery}
                    environment={environment}
                  />
                </EuiFlexItem>
              )}
              <EuiFlexItem grow={7}>
                <EuiPanel hasBorder={true}>
                  <ServiceOverviewErrorsTable serviceName={serviceName} />
                </EuiPanel>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFlexGroup
              direction={rowDirection}
              gutterSize="s"
              responsive={false}
            >
              <EuiFlexItem grow={3}>
                <TransactionBreakdownChart
                  showAnnotations={false}
                  environment={environment}
                  kuery={environment}
                />
              </EuiFlexItem>
              {!isRumAgent && (
                <EuiFlexItem grow={7}>
                  <EuiPanel hasBorder={true}>
                    <ServiceOverviewDependenciesTable
                      fixedHeight={true}
                      link={
                        <EuiLink href={dependenciesLink}>
                          {i18n.translate(
                            'xpack.apm.serviceOverview.dependenciesTableTabLink',
                            { defaultMessage: 'View dependencies' }
                          )}
                        </EuiLink>
                      }
                    />
                  </EuiPanel>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiFlexItem>
          {!isRumAgent && !isIosAgent && (
            <EuiFlexItem>
              <EuiFlexGroup
                direction="column"
                gutterSize="s"
                responsive={false}
              >
                <ServiceOverviewInstancesChartAndTable
                  chartHeight={chartHeight}
                  serviceName={serviceName}
                />
              </EuiFlexGroup>
            </EuiFlexItem>
          )}
        </EuiFlexGroup>
      </ChartPointerEventContextProvider>
    </AnnotationsContextProvider>
  );
}
