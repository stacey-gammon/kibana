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

import { EuiContextMenuPanelDescriptor, EuiPanel } from '@elastic/eui';
import classNames from 'classnames';
import React from 'react';
import {
  Action,
  buildEuiContextMenuPanels,
  Container,
  ContextMenuAction,
  ContextMenuPanel,
  Embeddable,
  getActionsForTrigger,
  CONTEXT_MENU_TRIGGER,
  ViewMode,
} from '..';
import { getEditPanelAction, getInspectorPanelAction } from './panel_header/panel_actions';
import { AddPanelAction } from './panel_header/panel_actions/add_panel/add_panel_action';
import { CustomizePanelTitleAction } from './panel_header/panel_actions/customize_title/customize_panel_action';
import { PanelHeader } from './panel_header/panel_header';

interface Props {
  embeddable: Embeddable;
  container?: Container;
}

interface State {
  focusedPanelIndex?: string;
  viewMode: ViewMode;
  hidePanelTitles: boolean;
  closeContextMenu: boolean;
}

export class EmbeddablePanel extends React.Component<Props, State> {
  private embeddableRoot: React.RefObject<HTMLDivElement>;
  private unsubscribe?: () => void;
  private mounted: boolean = false;
  constructor(props: Props) {
    super(props);
    const viewMode = this.props.container ? this.props.container.getViewMode() : ViewMode.EDIT;
    const hidePanelTitles = this.props.container
      ? this.props.container.getHidePanelTitles()
      : false;

    this.state = {
      viewMode,
      hidePanelTitles,
      closeContextMenu: false,
    };

    this.embeddableRoot = React.createRef();
  }

  public componentWillMount() {
    this.mounted = true;
    if (this.props.container) {
      this.unsubscribe = this.props.container.subscribeToChanges(() => {
        if (this.mounted && this.props.container) {
          this.setState({
            viewMode: this.props.container.getViewMode(),
            hidePanelTitles: this.props.container.getHidePanelTitles(),
          });
        }
      });
    }
  }

  public componentWillUnmount() {
    this.mounted = false;
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public onFocus = (focusedPanelIndex: string) => {
    this.setState({ focusedPanelIndex });
  };

  public onBlur = (blurredPanelIndex: string) => {
    if (this.state.focusedPanelIndex === blurredPanelIndex) {
      this.setState({ focusedPanelIndex: undefined });
    }
  };

  public render() {
    const viewOnlyMode = this.state.viewMode === ViewMode.VIEW;
    const classes = classNames('embPanel', {
      'embPanel--editing': !viewOnlyMode,
    });
    const customization = this.props.embeddable.getInput().customization;
    const customizedTitle = customization ? customization.title : undefined;
    const title = customizedTitle ? customizedTitle : this.props.embeddable.getInput().title;
    return (
      <EuiPanel className={classes} data-test-subj="embeddablePanel" paddingSize="none">
        <PanelHeader
          getPanels={this.getPanels}
          hidePanelTitles={this.state.hidePanelTitles}
          isViewMode={viewOnlyMode}
          closeContextMenu={this.state.closeContextMenu}
          title={title}
        />
        <div className="embeddable-root panel-content" ref={this.embeddableRoot} />
      </EuiPanel>
    );
  }

  public componentDidMount() {
    this.props.embeddable.render(this.embeddableRoot.current);
  }

  private getPanels = async () => {
    let panels: EuiContextMenuPanelDescriptor[] = [];

    const actions = await getActionsForTrigger(CONTEXT_MENU_TRIGGER, {
      embeddable: this.props.embeddable,
      container: this.props.container,
    });

    const contextMenuPanel = new ContextMenuPanel({
      title: 'Options',
      id: 'mainMenu',
    });

    const closeMyContextMenuPanel = () => {
      this.setState({ closeContextMenu: true }, () => {
        this.setState({ closeContextMenu: false });
      });
    };

    const customizePanelAction = new CustomizePanelTitleAction();
    if (
      await customizePanelAction.isCompatible({
        embeddable: this.props.embeddable,
        container: this.props.container,
      })
    ) {
      actions.push(customizePanelAction);
    }

    const addPanelAction = new AddPanelAction();
    if (
      await addPanelAction.isCompatible({
        embeddable: this.props.embeddable,
        container: this.props.container,
      })
    ) {
      actions.push(addPanelAction);
    }

    const wrappedForContextMenu = actions.map((action: Action) => {
      return new ContextMenuAction<Embeddable, Container>(
        {
          id: action.id,
          displayName: action.getTitle({
            embeddable: this.props.embeddable,
            container: this.props.container,
          }),
          parentPanelId: 'mainMenu',
        },
        {
          priority: action.priority,
          icon: action.getIcon({
            embeddable: this.props.embeddable,
            container: this.props.container,
          }),
          onClick: ({ embeddable, container }) => {
            action.execute({ embeddable, container });
            closeMyContextMenuPanel();
          },
        }
      );
    });

    const contextMenuActions = [
      getInspectorPanelAction({
        closeContextMenu: closeMyContextMenuPanel,
        panelTitle: this.props.embeddable.getInput().title,
      }),
      getEditPanelAction(),
    ].concat(wrappedForContextMenu);

    const sorted = contextMenuActions.sort((a, b) => {
      return b.priority - a.priority;
    });

    panels = buildEuiContextMenuPanels({
      contextMenuPanel,
      actions: sorted,
      embeddable: this.props.embeddable,
      container: this.props.container,
    });
    return panels;
  };
}
