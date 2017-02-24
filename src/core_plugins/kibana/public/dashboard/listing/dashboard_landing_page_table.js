import React from 'react';

import { DashboardConstants } from '../dashboard_constants';
import { DashboardItemPrompt } from './dashboard_item_prompt';
import { SelectedIds } from 'ui/saved_object_table/selected_ids';
import { Pager } from 'ui/pager/pager';
import { PagerActions } from 'ui/pager/pager_actions';
import { sortItems, getFlippedSortOrder } from 'ui/saved_object_table/sort_items';
import { TITLE_COLUMN_ID } from 'ui/saved_object_table/get_title_column';
import { getCheckBoxColumn } from 'ui/saved_object_table/get_checkbox_column';
import { getTitleColumn } from 'ui/saved_object_table/get_title_column';
import { ItemSelectionActions } from 'ui/saved_object_table/item_selection_actions';

import {
  ItemTable,
  DeleteButton,
  CreateButtonLink,
  SortOrder,
  LandingPageToolBar,
  LandingPageToolBarFooter
} from 'ui_framework/components';

export class DashboardLandingPageTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetchingItems: true,
      items: [],
      sortedColumn: undefined,
      sortOrder: SortOrder.ASC,
      selectedIds: new SelectedIds()
    };
  }

  componentDidMount() {
    this.onFilter();
  }

  onFilter(newFilter) {
    const PAGE_SIZE = 20;
    this.props.fetch(newFilter).then((results) => {
      const items = results.hits;
      this.setState({
        items,
        isFetchingItems: false,
        pager: new Pager(items.length, PAGE_SIZE, 1),
        selectedIds: new SelectedIds()
      });
    });
  }

  onSort(property) {
    let { sortedColumn, sortOrder } = this.state;
    const { selectedIds, items } = this.state;

    if (sortedColumn === property) {
      sortOrder = getFlippedSortOrder(sortOrder);
    } else {
      sortedColumn = property;
      sortOrder = SortOrder.ASC;
    }

    const sortedItems = sortItems(items, sortedColumn, sortOrder);
    ItemSelectionActions.deselectAll(selectedIds);
    this.setState({
      sortedColumn,
      sortOrder,
      selectedIds,
      items: sortedItems
    });
  }

  turnToNextPage() {
    const { pager, selectedIds } = this.state;
    ItemSelectionActions.deselectAll(selectedIds);
    PagerActions.nextPage(pager);
    this.setState({ pager, selectedIds });
  }

  turnToPreviousPage() {
    const { pager, selectedIds } = this.state;
    ItemSelectionActions.deselectAll(selectedIds);
    PagerActions.previousPage(pager);
    this.setState({ pager, selectedIds });
  }

  onSortByTitle = () => {
    this.onSort(TITLE_COLUMN_ID);
  };

  onToggleItem = (item) => {
    const selectedIds = ItemSelectionActions.toggleItem(this.state.selectedIds, item);
    this.setState({ selectedIds });
  };

  onToggleAll = () => {
    const pageOfItems = PagerActions.calculateItemsOnPage(this.state.pager, this.state.items);
    const selectedIds = ItemSelectionActions.toggleAll(this.state.selectedIds, pageOfItems);
    this.setState({ selectedIds });
  };

  getEditUrlForItem = (item) => {
    return this.props.kbnUrl.eval(`#${DashboardConstants.EDIT_PATH}/{{id}}`, { id: item.id });
  };

  getColumnSortOrder(column) {
    return this.state.sortedColumn === column ? this.state.sortOrder : SortOrder.NONE;
  }

  getTitleSortOrder() {
    return this.getColumnSortOrder(TITLE_COLUMN_ID);
  }

  getAreAllItemsSelected() {
    const { selectedIds, items, pager } = this.state;
    const pageOfItems = PagerActions.calculateItemsOnPage(pager, items);
    return selectedIds.areAllItemsSelected(pageOfItems);
  }

  getDashboardColumns() {
    const { selectedIds } = this.state;
    return  [
      getCheckBoxColumn(this.getAreAllItemsSelected(), selectedIds, this.onToggleItem, this.onToggleAll),
      getTitleColumn(this.getEditUrlForItem, this.getTitleSortOrder(), this.onSortByTitle)
    ];
  }

  onDelete = () => {
    const { deleteItems } = this.props;
    const { selectedIds, filter } = this.state;
    deleteItems(selectedIds.selectedIds).then((didDelete) => {
      if (didDelete) {
        this.onFilter(filter);
      }
    });
  };

  getActionButtons() {
    return this.state.selectedIds.getSelectedItemsCount() > 0
      ? <DeleteButton onClick={this.onDelete} />
      : <CreateButtonLink href={'#' + DashboardConstants.CREATE_NEW_DASHBOARD_URL} />;
  }

  getTableContents() {
    const { isFetchingItems, pager, items } = this.state;
    if (isFetchingItems) return null;
    const pageOfItems = PagerActions.calculateItemsOnPage(pager, items);
    const columns = this.getDashboardColumns();

    return pageOfItems.length > 0
      ? <ItemTable items={pageOfItems} columns={columns}/>
      : <DashboardItemPrompt />;
  }

  render() {
    const { filter, pager, selectedIds } = this.state;

    return <div>
      <LandingPageToolBar
        filter={filter}
        onFilter={this.onFilter}
        pagerState={pager}
        onNextPage={this.turnToNextPage}
        onPreviousPage={this.turnToPreviousPage}
        actionButtons={this.getActionButtons()}/>
      {
        this.getTableContents()
      }
      <LandingPageToolBarFooter
        pagerState={pager}
        onNextPage={this.turnToNextPage}
        onPreviousPage={this.turnToPreviousPage}
        selectedItemsCount={selectedIds.getSelectedItemsCount()}
      />
    </div>;
  }
}

DashboardLandingPageTable.propTypes = {
  fetch: React.PropTypes.func.isRequired,
  deleteItems: React.PropTypes.func.isRequired,
  kbnUrl: React.PropTypes.any.isRequired
};
