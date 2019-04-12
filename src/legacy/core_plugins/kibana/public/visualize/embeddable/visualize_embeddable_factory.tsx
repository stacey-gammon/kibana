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

import 'ui/registry/field_formats';
import 'uiExports/autocompleteProviders';
import 'uiExports/contextMenuActions';
import 'uiExports/devTools';
import 'uiExports/docViews';
import 'uiExports/embeddableFactories';
import 'uiExports/fieldFormatEditors';
import 'uiExports/fieldFormats';
import 'uiExports/home';
import 'uiExports/indexManagement';
import 'uiExports/inspectorViews';
import 'uiExports/savedObjectTypes';
import 'uiExports/search';
import 'uiExports/shareContextMenuExtensions';
import 'uiExports/visEditorTypes';
import 'uiExports/visRequestHandlers';
import 'uiExports/visResponseHandlers';
import 'uiExports/visTypes';
import 'uiExports/visualize';

import React from 'react';
import { i18n } from '@kbn/i18n';

import { uiCapabilities } from 'ui/capabilities';
// @ts-ignore
import { showSaveModal } from 'ui/saved_objects/show_saved_object_save_modal';
// @ts-ignore
import { SavedObjectSaveModal } from 'ui/saved_objects/components/saved_object_save_modal';

import {
  embeddableFactories,
  EmbeddableFactory,
  ErrorEmbeddable,
} from 'plugins/embeddable_api/index';
import chrome from 'ui/chrome';
import { getVisualizeLoader } from 'ui/visualize/loader';

import { Legacy } from 'kibana';
import { VisTypesRegistry, VisTypesRegistryProvider } from 'ui/registry/vis_types';

import { IPrivate } from 'ui/private';
import { VisualizationAttributes } from '../../../../../server/saved_objects/service/saved_objects_client';
import { showNewVisModal } from '../wizard';
import { SavedVisualizations } from '../types';
import { DisabledLabEmbeddable } from './disabled_lab_embeddable';
import { getIndexPattern } from './get_index_pattern';
import { VisualizeEmbeddable, VisualizeInput, VisualizeOutput } from './visualize_embeddable';

export const VISUALIZE_EMBEDDABLE_TYPE = 'visualization';

export class VisualizeEmbeddableFactory extends EmbeddableFactory<
  VisualizeInput,
  VisualizeOutput,
  VisualizationAttributes
> {
  private visTypes?: VisTypesRegistry;

  constructor() {
    super({
      name: VISUALIZE_EMBEDDABLE_TYPE,
      savedObjectMetaData: {
        name: i18n.translate('kbn.visualize.savedObjectName', { defaultMessage: 'Visualization' }),
        type: 'visualization',
        getIconForSavedObject: savedObject => {
          if (!this.visTypes) {
            return 'visualizeApp';
          }
          return (
            this.visTypes.byName[JSON.parse(savedObject.attributes.visState).type].icon ||
            'visualizeApp'
          );
        },
        getTooltipForSavedObject: savedObject => {
          if (!this.visTypes) {
            return '';
          }
          const visType = this.visTypes.byName[JSON.parse(savedObject.attributes.visState).type]
            .title;
          return `${savedObject.attributes.title} (${visType})`;
        },
        showSavedObject: savedObject => {
          if (chrome.getUiSettingsClient().get('visualize:enableLabs')) {
            return true;
          }
          if (!this.visTypes) {
            return false;
          }
          const typeName: string = JSON.parse(savedObject.attributes.visState).type;
          const visType = this.visTypes.byName[typeName];
          return visType.stage !== 'experimental';
        },
      },
    });
    this.initializeVisTypes();
  }

  public async initializeVisTypes() {
    const $injector = await chrome.dangerouslyGetActiveInjector();
    const Private = $injector.get<IPrivate>('Private');
    this.visTypes = Private(VisTypesRegistryProvider);
  }

  public getOutputSpec() {
    return {
      ['title']: {
        displayName: 'Title',
        description: 'The title of the element',
        accessPath: 'title',
        id: 'title',
      },
      ['timeRange']: {
        displayName: 'Time range',
        description: 'The time range. Object type that has from and to nested properties.',
        accessPath: 'timeRange',
        id: 'timeRange',
      },
      ['filters']: {
        displayName: 'Filters',
        description: 'The filters applied to the current view',
        accessPath: 'filters',
        id: 'filters',
      },
      ['query']: {
        displayName: 'Query',
        description: 'The query applied to the current view',
        accessPath: 'query',
        id: 'query',
      },
      ['brushContext']: {
        displayName: 'Brushed time range',
        description:
          'If the end user brushes on a visualization with time as x axis, this will contain the range',
        accessPath: 'actionContext.brushContext',
        id: 'brushContext',
      },
      ['clickContext']: {
        displayName: 'Clicked filter',
        description: 'A filter that was clicked on',
        accessPath: 'actionContext.clickContext',
        id: 'clickContext',
      },
    };
  }

  public async create(initialInput: VisualizeInput) {
    const $injector = await chrome.dangerouslyGetActiveInjector();
    const config = $injector.get<Legacy.KibanaConfig>('config');
    const savedVisualizations = $injector.get<SavedVisualizations>('savedVisualizations');

    if (!initialInput.savedObjectId && this.visTypes) {
      return new Promise<VisualizeEmbeddable | ErrorEmbeddable>(async resolve => {
        const onCreateNew = async (options: {
          visType: string;
          searchId?: string;
          searchType?: string;
        }) => {
          const getOptions: {
            type: string;
            savedSearchId?: string;
            indexPattern?: string;
          } = {
            type: options.visType,
          };
          if (options.searchType) {
            getOptions[options.searchType === 'search' ? 'savedSearchId' : 'indexPattern'] =
              options.searchId;
          }
          const savedVis = await savedVisualizations.get(getOptions);

          const onSave = async ({
            newTitle,
            newCopyOnSave,
            isTitleDuplicateConfirmed,
            onTitleDuplicate,
          }: {
            newTitle: string;
            newCopyOnSave: boolean;
            isTitleDuplicateConfirmed: boolean;
            onTitleDuplicate: () => void;
          }) => {
            savedVis.title = newTitle;
            savedVis.copyOnSave = newCopyOnSave;
            const saveOptions = {
              confirmOverwrite: false,
              isTitleDuplicateConfirmed,
              onTitleDuplicate,
            };
            const id = await savedVis.save(saveOptions);
            const newVis = await this.create({ ...initialInput, savedObjectId: id });
            resolve(newVis);
            return newVis;
          };

          const saveModal = (
            <SavedObjectSaveModal
              onSave={onSave}
              onClose={() => {}}
              title={savedVis.title}
              showCopyOnSave={false}
              objectType="visualization"
            />
          );

          showSaveModal(saveModal);
        };

        if (!this.visTypes) {
          resolve(
            new ErrorEmbeddable({
              id: initialInput.id,
              errorMessage: i18n.translate('kbn.visualizeEmbeddable.noSavedObjectIdErrorMessage', {
                defaultMessage:
                  'No saved object id given, re-directing you to create a new visualization',
              }),
            })
          );
        } else {
          showNewVisModal(this.visTypes, {
            editorParams: ['addToDashboard'],
            //  onCreate: onCreateNew
          });
        }
      });
    }

    try {
      const visId = initialInput.savedObjectId;

      const editUrl = chrome.addBasePath(`/app/kibana${savedVisualizations.urlFor(visId)}`);
      const loader = await getVisualizeLoader();
      const savedObject = await savedVisualizations.get(visId);
      const isLabsEnabled = config.get<boolean>('visualize:enableLabs');

      if (!isLabsEnabled && savedObject.vis.type.stage === 'experimental') {
        return new DisabledLabEmbeddable(savedObject.title, initialInput);
      }

      const indexPattern = await getIndexPattern(savedObject);
      const indexPatterns = indexPattern ? [indexPattern] : [];
      return new VisualizeEmbeddable(
        {
          savedVisualization: savedObject,
          editUrl,
          loader,
          indexPatterns,
        },
        {
          ...initialInput,
          editable: uiCapabilities.visualize.save as boolean,
        }
      );
    } catch (e) {
      return new ErrorEmbeddable({
        ...initialInput,
        errorMessage: 'Hit a failure: ' + JSON.stringify(e),
      });
    }
  }
}

embeddableFactories.registerFactory(new VisualizeEmbeddableFactory());
