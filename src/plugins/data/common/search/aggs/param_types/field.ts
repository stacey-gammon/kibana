/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { i18n } from '@kbn/i18n';
import { IAggConfig } from '../agg_config';
import {
  SavedFieldNotFound,
  SavedFieldTypeInvalidForAgg,
} from '../../../../../../plugins/kibana_utils/common';
import { BaseParamType } from './base';
import { propFilter } from '../utils';
import { KBN_FIELD_TYPES } from '../../../kbn_field_types/types';
import { isNestedField, IndexPatternField } from '../../../../../data_views/common';

const filterByType = propFilter('type');

export type FieldTypes = KBN_FIELD_TYPES | KBN_FIELD_TYPES[] | '*';
// TODO need to make a more explicit interface for this
export type IFieldParamType = FieldParamType;

export class FieldParamType extends BaseParamType {
  required = true;
  scriptable = true;
  filterFieldTypes: FieldTypes;
  onlyAggregatable: boolean;

  constructor(config: Record<string, any>) {
    super(config);

    this.filterFieldTypes = config.filterFieldTypes || '*';
    this.onlyAggregatable = config.onlyAggregatable !== false;

    if (!config.write) {
      this.write = (aggConfig: IAggConfig, output: Record<string, any>) => {
        const field = aggConfig.getField();

        if (!field) {
          throw new TypeError(
            i18n.translate('data.search.aggs.paramTypes.field.requiredFieldParameterErrorMessage', {
              defaultMessage: '{fieldParameter} is a required parameter',
              values: {
                fieldParameter: '"field"',
              },
            })
          );
        }

        if (field.type === KBN_FIELD_TYPES.MISSING) {
          throw new SavedFieldNotFound(
            i18n.translate(
              'data.search.aggs.paramTypes.field.notFoundSavedFieldParameterErrorMessage',
              {
                defaultMessage:
                  'The field "{fieldParameter}" associated with this object no longer exists in the index pattern. Please use another field.',
                values: {
                  fieldParameter: field.name,
                },
              }
            )
          );
        }

        const validField = this.getAvailableFields(aggConfig).find(
          (f: any) => f.name === field.name
        );

        if (!validField) {
          throw new SavedFieldTypeInvalidForAgg(
            i18n.translate(
              'data.search.aggs.paramTypes.field.invalidSavedFieldParameterErrorMessage',
              {
                defaultMessage:
                  'Saved field "{fieldParameter}" of index pattern "{indexPatternTitle}" is invalid for use with the "{aggType}" aggregation. Please select a new field.',
                values: {
                  fieldParameter: field.name,
                  aggType: aggConfig?.type?.title,
                  indexPatternTitle: aggConfig.getIndexPattern().title,
                },
              }
            )
          );
        }

        if (validField.scripted) {
          output.params.script = {
            source: validField.script,
            lang: validField.lang,
          };
        } else {
          output.params.field = validField.name;
        }
      };
    }

    this.serialize = (field: IndexPatternField) => {
      return field.name;
    };

    this.deserialize = (fieldName: string, aggConfig?: IAggConfig) => {
      if (!aggConfig) {
        throw new Error('aggConfig was not provided to FieldParamType deserialize function');
      }
      const field = aggConfig.getIndexPattern().fields.getByName(fieldName);

      if (!field) {
        return new IndexPatternField({
          type: KBN_FIELD_TYPES.MISSING,
          name: fieldName,
          searchable: false,
          aggregatable: false,
        });
      }

      return field;
    };
  }

  /**
   * filter the fields to the available ones
   */
  getAvailableFields = (aggConfig: IAggConfig) => {
    const fields = aggConfig.getIndexPattern().fields;
    const filteredFields = fields.filter((field: IndexPatternField) => {
      const { onlyAggregatable, scriptable, filterFieldTypes } = this;

      if (
        (onlyAggregatable && (!field.aggregatable || isNestedField(field))) ||
        (!scriptable && field.scripted)
      ) {
        return false;
      }

      return filterByType([field], filterFieldTypes).length !== 0;
    });

    return filteredFields;
  };
}
