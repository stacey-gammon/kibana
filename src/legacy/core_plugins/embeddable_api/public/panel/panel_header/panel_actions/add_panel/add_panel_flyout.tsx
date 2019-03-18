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

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import React from 'react';
import { toastNotifications } from 'ui/notify';
import { SavedObjectFinder } from 'ui/saved_objects/components/saved_object_finder';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFlyout,
  EuiFlyoutBody,
  EuiFlyoutFooter,
  EuiFlyoutHeader,
  EuiSelect,
  EuiTitle,
} from '@elastic/eui';

import { Container } from '../../../../containers';
import { embeddableFactories } from '../../../../embeddables';

interface Props {
  onClose: () => void;
  container: Container;
}

export class AddPanelFlyout extends React.Component<Props> {
  private lastToast: any;

  constructor(props: Props) {
    super(props);
  }

  public showToast = (id: string, type: string, name: string) => {
    // To avoid the clutter of having toast messages cover flyout
    // close previous toast message before creating a new one
    if (this.lastToast) {
      toastNotifications.remove(this.lastToast);
    }

    this.lastToast = toastNotifications.addSuccess({
      title: i18n.translate(
        'kbn.dashboard.topNav.addPanel.savedObjectAddedToDashboardSuccessMessageTitle',
        {
          defaultMessage: '{savedObjectName} was added to your dashboard',
          values: {
            savedObjectName: name,
          },
        }
      ),
      'data-test-subj': 'addObjectToDashboardSuccess',
    });
  };

  public createNewEmbeddable = async (type: string) => {
    // const factory = embeddableFactories.getFactoryByName(type);
    const embeddable = await this.props.container.addNewEmbeddable(type);
    // this.props.container.addEmbeddable(embeddable);
    this.showToast(embeddable.id, embeddable.type, embeddable.getOutput().title || '');
  };

  public onAddPanel = async (id: string, type: string, name: string) => {
    const factory = embeddableFactories.getFactoryByName(type);
    const panelState = this.props.container.createNewPanelState(type);
    const embeddable = await factory.create({
      savedObjectId: id,
      ...this.props.container.getInputForEmbeddable(panelState),
    });
    this.props.container.addExistingEmbeddable(embeddable);

    this.showToast(id, type, name);
  };

  public render() {
    return (
      <EuiFlyout ownFocus onClose={this.props.onClose} data-test-subj="dashboardAddPanel">
        <EuiFlyoutHeader hasBorder>
          <EuiTitle size="m">
            <h2>
              <FormattedMessage
                id="kbn.dashboard.topNav.addPanelsTitle"
                defaultMessage="Add panels"
              />
            </h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        <EuiFlyoutBody>
          <SavedObjectFinder
            onChoose={this.onAddPanel}
            savedObjectMetaData={Object.values(embeddableFactories.getFactories())
              .filter(embeddableFactory => Boolean(embeddableFactory.savedObjectMetaData))
              .map(({ savedObjectMetaData }) => savedObjectMetaData)}
            showFilter={true}
            noItemsMessage={i18n.translate(
              'kbn.dashboard.topNav.addPanel.noMatchingObjectsMessage',
              {
                defaultMessage: 'No matching objects found.',
              }
            )}
          />
        </EuiFlyoutBody>
        <EuiFlyoutFooter>
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiSelect
                options={[
                  { text: 'Create New...', value: '1' },
                  ...Object.values(embeddableFactories.getFactories()).map(factory => ({
                    text: `Create new ${factory.name}`,
                    value: factory.name,
                  })),
                ]}
                value=""
                onChange={e => this.createNewEmbeddable(e.target.value)}
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlyoutFooter>
      </EuiFlyout>
    );
  }
}
