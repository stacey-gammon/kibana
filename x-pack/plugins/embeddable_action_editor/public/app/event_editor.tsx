/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import {
  EuiBasicTable,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSelect,
} from '@elastic/eui';
import React from 'react';
import {
  Action,
  ActionFactory,
  actionFactoryRegistry,
  addTriggerActionMapping,
  deleteAction,
  Embeddable,
  getActionsForTrigger,
  saveAction,
  Trigger,
  triggerRegistry,
} from '../../../../../src/legacy/core_plugins/embeddable_api/public';
import { CreateNewActionModal } from './create_new_action_modal';

export interface EventEditorProps {
  embeddable?: Embeddable;
  actionTypes?: string[];
  hideTriggerIds?: string[];
  onEditAction: (id: string) => void;
  actionType?: string;
}

interface EventEditorState {
  triggerMapping: { [key: string]: Action[] };
  selectedTrigger: string;
  showCreateModal: boolean;
}

export class EventEditor extends React.Component<EventEditorProps, EventEditorState> {
  private actions: AnyAction[] = [];
  private triggers: Trigger[] = [];

  constructor(props: EventEditorProps) {
    super(props);
    this.state = {
      triggerMapping: {},
      selectedTrigger: '',
      showCreateModal: false,
    };
  }

  public render() {
    return (
      <div>
        {this.state.showCreateModal && this.renderCreateModal()}
        <EuiFlexGroup>
          <EuiFlexItem>{this.renderTriggerSelect()}</EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFormRow hasEmptyLabelSpace>{this.renderCreateNewButton()}</EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>
        <h3> Actions attached </h3>
        {this.renderExistingActions()}
      </div>
    );
  }

  public async componentDidMount() {
    //    await this.findActions();

    this.triggers = triggerRegistry.getTriggers().filter(trigger => {
      return !this.props.hideTriggerIds || !this.props.hideTriggerIds.find(id => id === trigger.id);
    });

    const triggerMapping: { [key: string]: Action[] } = {};
    let selectedId = '';
    const promises = this.triggers.map(async trigger => {
      if (!triggerMapping[trigger.id]) {
        triggerMapping[trigger.id] = [];
      }

      selectedId = trigger.id;
      const actions = await getActionsForTrigger(trigger.id, {
        embeddable: this.props.embeddable,
        container: this.props.embeddable ? this.props.embeddable.container : undefined,
      });

      actions.forEach(action => {
        triggerMapping[trigger.id].push(action);
      });
    });

    await Promise.all(promises);
    this.setState({ triggerMapping, selectedTrigger: selectedId });
  }

  private getActionFactoryOptions() {
    return Object.values(actionFactoryRegistry.getFactories())
      .filter(factory => {
        return (
          !factory.isSingleton() &&
          (!this.props.actionTypes || this.props.actionTypes.find(type => type === factory.id))
        );
      })
      .map((factory: ActionFactory) => ({
        value: factory.id,
        text: factory.title,
      }));
  }

  private renderCreateNewButton() {
    const actionTypes = this.props.actionTypes;
    if (actionTypes && actionTypes.length === 1) {
      return (
        <EuiButton onClick={() => this.createAction(actionTypes[0] || '')}>
          Create new {actionTypes[0]} action
        </EuiButton>
      );
    } else {
      return (
        <EuiSelect
          options={[{ text: 'Create new action', value: '' }].concat(
            this.getActionFactoryOptions()
          )}
          value=""
          onChange={e => this.createAction(e.target.value)}
        />
      );
    }
  }

  private closeModal = () => this.setState({ showCreateModal: false });

  private onCreate = (type: string) => {
    this.createAction(type);
    this.closeModal();
  };

  private createAction = async (type: string) => {
    const factory = actionFactoryRegistry.getFactoryById(type);
    const action = await factory.createNew();
    if (action && action.id) {
      if (this.props.embeddable) {
        action.embeddableId = this.props.embeddable.id;
        action.embeddableType = this.props.embeddable.type;
        await saveAction(action);
      }

      await addTriggerActionMapping({ triggerId: this.state.selectedTrigger, actionId: action.id });

      this.setState(prevState => {
        const triggerMapping = { ...prevState.triggerMapping };
        triggerMapping[this.state.selectedTrigger].push(action);
        return {
          triggerMapping,
        };
      });

      this.props.onEditAction(action.id);
    }
  };

  private renderCreateModal = () => {
    return (
      <CreateNewActionModal
        onClose={this.closeModal}
        onCreate={this.onCreate}
        actionTypes={this.props.actionTypes}
      />
    );
  };

  private removeTriggerMapping = async (actionId: string) => {
    // Need to delete the action as well.
    await deleteAction(actionId);

    this.setState(prevState => {
      const triggerMapping = { ...prevState.triggerMapping };
      triggerMapping[this.state.selectedTrigger] = triggerMapping[
        this.state.selectedTrigger
      ].filter(action => action.id !== actionId);
      return {
        triggerMapping,
      };
    });
  };

  private renderExistingActions() {
    if (!this.state.selectedTrigger) {
      return null;
    }
    const items = this.state.triggerMapping[this.state.selectedTrigger];
    // const items: AnyAction[] = [];
    // actions.forEach((actionId: string) => {
    //   const foundAction = this.actions.find(action => action.id === actionId);
    //   if (!foundAction) {
    //     return;
    //   }
    //   if (this.props.actionType && foundAction.type !== this.props.actionType) {
    //     return;
    //   }
    //   items.push(foundAction);
    // });

    const columns = [
      {
        field: 'title',
        sortable: false,
        name: 'Name',
      },
      {
        field: 'description',
        sortable: false,
        name: 'Description',
      },

      {
        field: 'id',
        sortable: false,
        name: 'Actions',
        width: '100px',
        render: (id: string) => {
          const foundAction = this.actions.find(action => action.id === id);
          return (
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiButtonIcon
                  iconType="pencil"
                  disabled={!foundAction || !foundAction.allowEditing()}
                  onClick={() => this.props.onEditAction(id)}
                />
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButtonIcon iconType="trash" onClick={() => this.removeTriggerMapping(id)} />
              </EuiFlexItem>
            </EuiFlexGroup>
          );
        },
      },
    ];
    return <EuiBasicTable columns={columns} items={items} sorting={{}} />;
  }

  private getTriggerOptions() {
    return this.triggers.map(trigger => {
      return {
        value: trigger.id,
        text: trigger.title,
      };
    });
  }

  private changeTrigger = (evt: any) => {
    this.setState({ selectedTrigger: evt.target.value });
  };

  private renderTriggerSelect() {
    return (
      <EuiFormRow label="Trigger">
        <EuiSelect
          options={this.getTriggerOptions()}
          value={this.state.selectedTrigger}
          onChange={this.changeTrigger}
        />
      </EuiFormRow>
    );
  }
}
