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

import _ from 'lodash';
import {
  APPLY_FILTER_TRIGGER,
  Embeddable,
  EmbeddableInput,
  EmbeddableOutput,
  executeTriggerActions,
  Filters,
  Query,
  TimeRange,
} from 'plugins/embeddable_api/index';
import { StaticIndexPattern } from 'ui/index_patterns';
import { PersistedState } from 'ui/persisted_state';
import { VisualizeLoader } from 'ui/visualize/loader';
import { EmbeddedVisualizeHandler } from 'ui/visualize/loader/embedded_visualize_handler';
import { VISUALIZE_EMBEDDABLE_TYPE } from './visualize_embeddable_factory';

import {
  Filter,
  VisSavedObject,
  VisualizeLoaderParams,
  VisualizeUpdateParams,
} from 'ui/visualize/loader/types';

export interface VisualizeEmbeddableConfiguration {
  savedVisualization: VisSavedObject;
  indexPatterns?: StaticIndexPattern[];
  editUrl: string;
  loader: VisualizeLoader;
}

interface VisualizeOverrides {
  vis?: {
    colors?: { [key: string]: string };
  };
  title?: string;
}

export interface VisualizeInput extends EmbeddableInput {
  timeRange?: TimeRange;
  query?: Query;
  filters?: Filters;
  hidePanelTitles?: boolean;
  customization: VisualizeOverrides;
  savedObjectId: string;
}

export interface VisualizeOutput extends EmbeddableOutput {
  title: string;
  editUrl: string;
  indexPatterns?: StaticIndexPattern[];
}

export class VisualizeEmbeddable extends Embeddable<VisualizeInput, VisualizeOutput> {
  private savedVisualization: VisSavedObject;
  private loader: VisualizeLoader;
  private uiState: PersistedState;
  private handler?: EmbeddedVisualizeHandler;
  private customization?: object;
  private panelTitle?: string;
  private timeRange?: TimeRange;
  private query?: Query;
  private filters?: Filters;

  constructor(
    { savedVisualization, indexPatterns, editUrl, loader }: VisualizeEmbeddableConfiguration,
    initialInput: VisualizeInput
  ) {
    super(VISUALIZE_EMBEDDABLE_TYPE, initialInput, {
      title: savedVisualization.title,
      editUrl,
      indexPatterns,
      customization: {},
    });
    this.savedVisualization = savedVisualization;
    this.loader = loader;

    const parsedUiState = savedVisualization.uiStateJSON
      ? JSON.parse(savedVisualization.uiStateJSON)
      : {};
    this.uiState = new PersistedState(parsedUiState);

    this.uiState.on('change', this.uiStateChangeHandler);
  }

  public getInspectorAdapters() {
    if (!this.handler) {
      return undefined;
    }
    return this.handler.inspectorAdapters;
  }

  /**
   * Transfers all changes in the containerState.customization into
   * the uiState of this visualization.
   */
  public transferCustomizationsToUiState(containerState: VisualizeInput) {
    // Check for changes that need to be forwarded to the uiState
    // Since the vis has an own listener on the uiState we don't need to
    // pass anything from here to the handler.update method
    const customization = containerState.customization;
    if (customization && !_.isEqual(this.customization, customization)) {
      // Turn this off or the uiStateChangeHandler will fire for every modification.
      this.uiState.off('change', this.uiStateChangeHandler);
      this.uiState.clearAllKeys();
      this.uiState.set('vis', customization.vis);
      // Object.getOwnPropertyNames(customization).forEach(key => {
      //   this.uiState.set(key, customization[key]);
      // });
      this.output.customization = customization;
      this.uiState.on('change', this.uiStateChangeHandler);
    }
  }

  public handleInputChanges(containerState: VisualizeInput) {
    this.transferCustomizationsToUiState(containerState);

    const updatedParams: VisualizeUpdateParams = {};

    // Check if timerange has changed
    if (containerState.timeRange !== this.timeRange) {
      updatedParams.timeRange = containerState.timeRange;
      this.timeRange = containerState.timeRange;
    }

    // Check if filters has changed
    if (containerState.filters !== this.filters) {
      updatedParams.filters = containerState.filters;
      this.filters = containerState.filters;
    }

    // Check if query has changed
    if (containerState.query !== this.query) {
      updatedParams.query = containerState.query;
      this.query = containerState.query;
    }

    const derivedPanelTitle = this.getPanelTitle();
    if (this.panelTitle !== derivedPanelTitle) {
      updatedParams.dataAttrs = {
        title: derivedPanelTitle,
      };
      this.panelTitle = derivedPanelTitle;
    }

    if (this.handler && !_.isEmpty(updatedParams)) {
      this.handler.update(updatedParams);
    }
  }

  public setInput(input: VisualizeInput) {
    this.input = input;
    this.reload();
    this.handleInputChanges(this.input);
  }

  /**
   *
   * @param {Element} domNode
   * @param {ContainerState} containerState
   */
  public render(domNode: HTMLElement) {
    this.panelTitle = this.getPanelTitle();
    this.timeRange = this.input.timeRange;
    this.query = this.input.query;
    this.filters = this.input.filters;

    this.transferCustomizationsToUiState(this.input);

    const dataAttrs: { [key: string]: string } = {
      'shared-item': '',
      title: this.panelTitle,
    };
    if (this.savedVisualization.description) {
      dataAttrs.description = this.savedVisualization.description;
    }

    const handlerParams: VisualizeLoaderParams = {
      uiState: this.uiState,
      // Append visualization to container instead of replacing its content
      append: true,
      timeRange: this.input.timeRange,
      query: this.input.query,
      filters: this.input.filters,
      cssClass: `panel-content panel-content--fullWidth`,
      dataAttrs,
    };

    this.handler = this.loader.embedVisualizationWithSavedObject(
      domNode,
      this.savedVisualization,
      handlerParams
    );
  }

  public destroy() {
    this.uiState.off('change', this.uiStateChangeHandler);
    this.savedVisualization.destroy();
    if (this.handler) {
      this.handler.destroy();
      this.handler.getElement().remove();
    }
  }

  public reload() {
    if (this.handler) {
      this.handler.reload();
    }
  }

  private filterListener = async (filters: Filter[]) => {
    filters[0].$state = {};
    const fieldName = Object.keys(filters[0].query.match)[0];
    const fieldValue = filters[0].query.match[fieldName].query;

    const events = await executeTriggerActions(APPLY_FILTER_TRIGGER, {
      embeddable: this,
      container: this.container,
      triggerContext: {
        fieldName,
        fieldValue,
        filters,
      },
    });
  };

  /**
   * Retrieve the panel title for this panel from the container state.
   * This will either return the overwritten panel title or the visualization title.
   */
  private getPanelTitle() {
    let derivedPanelTitle = '';
    if (!this.input.hidePanelTitles) {
      derivedPanelTitle =
        this.input.customization && this.input.customization.title !== undefined
          ? this.input.customization.title
          : this.savedVisualization.title;
    }
    return derivedPanelTitle;
  }

  private uiStateChangeHandler = () => {
    this.emitOutputChanged({
      ...this.output,
      customization: {
        ...this.output.customization,
        ...this.uiState.toJSON(),
      },
    });
  };
}
