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

import '../doc_table';
import { uiCapabilities } from 'ui/capabilities';
import { i18n } from '@kbn/i18n';
import {
  embeddableFactories,
  EmbeddableFactory,
  ErrorEmbeddable,
  triggerRegistry,
} from 'plugins/embeddable_api/index';
import chrome from 'ui/chrome';
import { SavedSearchLoader } from '../types';
import { SearchEmbeddable, SearchInput, SearchOutput } from './search_embeddable';

export const SEARCH_EMBEDDABLE_TYPE = 'search';

export const SEARCH_OUTPUT_SPEC = {
  ['title']: {
    displayName: 'Title',
    description: 'The title of the element',
    accessPath: 'element.title',
    id: 'title',
  },
  ['timeRange']: {
    displayName: 'Time range',
    description: 'The time range. Object type that has from and to nested properties.',
    accessPath: 'element.timeRange',
    id: 'timeRange',
  },
  ['filters']: {
    displayName: 'Filters',
    description: 'The filters applied to the current view',
    accessPath: 'element.filters',
    id: 'filters',
  },
  ['query']: {
    displayName: 'Query',
    description: 'The query applied to the current view',
    accessPath: 'element.query',
    id: 'query',
  },
};

export class SearchEmbeddableFactory extends EmbeddableFactory<SearchInput, SearchOutput> {
  constructor() {
    super({
      name: SEARCH_EMBEDDABLE_TYPE,
      savedObjectMetaData: {
        name: i18n.translate('kbn.discover.savedSearch.savedObjectName', {
          defaultMessage: 'Saved search',
        }),
        type: 'search',
        getIconForSavedObject: () => 'search',
      },
    });
  }

  public getOutputSpec() {
    return SEARCH_OUTPUT_SPEC;
  }

  /**
   *
   * @param panelMetadata. Currently just passing in panelState but it's more than we need, so we should
   * decouple this to only include data given to us from the embeddable when it's added to the dashboard. Generally
   * will be just the object id, but could be anything depending on the plugin.
   * @param onEmbeddableStateChanged
   * @return
   */
  public async create(initialInput: SearchInput) {
    if (!initialInput.savedObjectId) {
      return new ErrorEmbeddable({
        ...initialInput,
        errorMessage: 'Need a saved object id to load search embeddable',
      });
    }

    const $injector = await chrome.dangerouslyGetActiveInjector();

    const $compile = $injector.get<ng.ICompileService>('$compile');
    const $rootScope = $injector.get<ng.IRootScopeService>('$rootScope');
    const courier = $injector.get<unknown>('courier');
    const searchLoader = $injector.get<SavedSearchLoader>('savedSearches');

    const editUrl = chrome.addBasePath(
      `/app/kibana${searchLoader.urlFor(initialInput.savedObjectId)}`
    );
    // can't change this to be async / awayt, because an Anglular promise is expected to be returned.
    return searchLoader
      .get(initialInput.savedObjectId)
      .then(savedObject => {
        return new SearchEmbeddable(
          {
            courier,
            editable: uiCapabilities.discover.save as boolean,
            savedSearch: savedObject,
            editUrl,
            $rootScope,
            $compile,
            factory: this,
          },
          initialInput
        );
      })
      .catch((e: any) => {
        return new ErrorEmbeddable({
          ...initialInput,
          errorMessage: 'Hit a failure: ' + JSON.stringify(e),
        });
      });
  }
}

embeddableFactories.registerFactory(new SearchEmbeddableFactory());

export const SEARCH_ROW_CLICK_TRIGGER = 'SEARCH_ROW_CLICK_TRIGGER';

triggerRegistry.registerTrigger({
  id: SEARCH_ROW_CLICK_TRIGGER,
  embeddableType: SEARCH_EMBEDDABLE_TYPE,
  title: 'On row click',
});
