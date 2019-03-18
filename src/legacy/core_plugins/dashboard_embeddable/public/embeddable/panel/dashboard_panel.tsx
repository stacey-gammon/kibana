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

import classNames from 'classnames';
import _ from 'lodash';
import React from 'react';

import { EuiLoadingChart } from '@elastic/eui';
import { InjectedIntl, injectI18n } from '@kbn/i18n/react';

import { EmbeddableFactory, ErrorEmbeddable } from 'plugins/embeddable_api/index';

import { DashboardContainer, DashboardEmbeddable } from '../dashboard_container';
import { DashboardPanelState, PanelId } from '../types';

export interface DashboardPanelProps {
  viewOnlyMode: boolean;
  onPanelFocused?: (panelIndex: PanelId) => void;
  onPanelBlurred?: (panelIndex: PanelId) => void;
  embeddableFactory: EmbeddableFactory;
  lastReloadRequestTime?: number;
  panel: DashboardPanelState;
  className?: string;
  container: DashboardContainer;
}

export interface DashboardPanelUiProps extends DashboardPanelProps {
  intl: InjectedIntl;
}

interface State {
  loading: boolean;
}

export function isErrorEmbeddable(
  embeddable: ErrorEmbeddable | DashboardEmbeddable
): embeddable is ErrorEmbeddable {
  return (embeddable as ErrorEmbeddable).getInput().errorMessage !== undefined;
}

class DashboardPanelUi extends React.Component<DashboardPanelUiProps, State> {
  [panel: string]: any;
  public mounted: boolean;
  public embeddable!: DashboardEmbeddable | ErrorEmbeddable;
  private unsubscribe?: () => void;

  constructor(props: DashboardPanelUiProps) {
    super(props);
    this.state = {
      loading: true,
    };

    this.mounted = false;
  }

  public async componentDidMount() {
    this.mounted = true;
    this.unsubscribe = this.props.container.subscribeToOutputChanges(() => {
      if (!this.embeddable) {
        this.renderEmbeddable();
      }
    });
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (
      this.embeddable &&
      !isErrorEmbeddable(this.embeddable) &&
      this.props.container.getEmbeddable(this.embeddable.id)
    ) {
      this.props.container.removeEmbeddable(this.embeddable);
    }
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public onFocus = () => {
    const { onPanelFocused, panel } = this.props;
    if (onPanelFocused) {
      onPanelFocused(panel.embeddableId);
    }
  };

  public onBlur = () => {
    const { onPanelBlurred, panel } = this.props;
    if (onPanelBlurred) {
      onPanelBlurred(panel.embeddableId);
    }
  };

  public renderEmbeddableViewport() {
    const classes = classNames('embPanel panel-content', {
      'panel-content-isLoading': this.state.loading,
    });

    return (
      <div
        id="embeddedPanel"
        className={classes}
        ref={panelElement => (this.panelElement = panelElement)}
      >
        {this.state.loading && <EuiLoadingChart size="l" mono />}
      </div>
    );
  }

  public shouldComponentUpdate(nextProps: DashboardPanelUiProps) {
    if (this.embeddable && nextProps.lastReloadRequestTime !== this.props.lastReloadRequestTime) {
      this.embeddable.reload();
    }

    return true;
  }

  public render() {
    return this.renderEmbeddableViewport();
  }

  private renderEmbeddable() {
    this.embeddable = this.props.container.getEmbeddable(this.props.panel.embeddableId);
    if (this.mounted && this.embeddable) {
      this.setState({ loading: false }, () => {
        this.embeddable.renderInPanel(this.panelElement);
      });
    } else if (this.embeddable) {
      this.embeddable.destroy();
    }
  }
}

export const DashboardPanel = injectI18n(DashboardPanelUi);
