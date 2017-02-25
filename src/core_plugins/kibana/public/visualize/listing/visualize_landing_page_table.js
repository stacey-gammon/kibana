import React from 'react';

import { VisualizeConstants } from '../visualize_constants';
import { VisualizeItemPrompt } from './visualize_item_prompt';
import {
  areAllItemsSelected,
  toggleItem,
  toggleAll,
} from 'ui/saved_object_table/item_selection_actions';
import { sortItems, getFlippedSortOrder } from 'ui/saved_object_table/sort_items';
import { TITLE_COLUMN_ID } from 'ui/saved_object_table/get_title_column';
import { getCheckBoxColumn } from 'ui/saved_object_table/get_checkbox_column';
import { getTitleColumn } from 'ui/saved_object_table/get_title_column';
import { TYPE_COLUMN_ID, getTypeColumn } from './get_type_column';

import {
  ItemTable,
  DeleteButton,
  CreateButtonLink,
  SortOrder,
  LandingPageToolBar,
  LandingPageToolBarFooter
} from 'ui_framework/components';

class Pager {
  constructor(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
  }

  canPagePrevious(currentPage) {
    return currentPage > 0;
  }

  canPageNext(itemsCount, currentPage) {
    const pagesCount = this.getPagesCount(itemsCount);
    return currentPage < pagesCount - 1;
  }

  getItemsOnPage(items, currentPage) {
    const startIndex = currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return items.filter((item, index) => (
      index >= startIndex
      && index < endIndex
    ));
  }

  getPagesCount(itemsCount) {
    return Math.ceil(itemsCount / this.itemsPerPage);
  }
}

export class VisualizeLandingPageTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetchingItems: true,
      items: [],
      sortedColumn: undefined,
      sortOrder: SortOrder.ASC,
      selectedIds: [],
      currentPage: 0,
    };

    this.pager = new Pager(2);
  }

  componentDidMount() {
    this.onFilter();
  }

  onFilter = (newFilter) => {
    const PAGE_SIZE = 3;
    this.props.fetch(newFilter).then((results) => {
      const items = results.hits;
      const pagesCount = this.pager.getPagesCount(items.length);

      this.setState({
        items,
        isFetchingItems: false,
        currentPage: Math.min(this.state.currentPage, pagesCount - 1),
        selectedIds: [],
      });
    });
  };

  onSort = (property) => {
    let { sortedColumn, sortOrder } = this.state;
    const { selectedIds, items } = this.state;

    if (sortedColumn === property) {
      sortOrder = getFlippedSortOrder(sortOrder);
    } else {
      sortedColumn = property;
      sortOrder = SortOrder.ASC;
    }

    const sortedItems = sortItems(items, sortedColumn, sortOrder);

    this.setState({
      sortedColumn,
      sortOrder,
      selectedIds: [],
      items: sortedItems
    });
  };

  turnToNextPage = () => {
    this.setState({
      currentPage: this.state.currentPage + 1,
      selectedIds: [],
    });
  };

  turnToPreviousPage = () => {
    this.setState({
      currentPage: this.state.currentPage - 1,
      selectedIds: [],
    });
  };

  onSortByTitle = () => {
    this.onSort(TITLE_COLUMN_ID);
  };

  onSortByType = () => {
    this.onSort(TYPE_COLUMN_ID);
  };

  onToggleItem = (item) => {
    this.setState({
      selectedIds: toggleItem(this.state.selectedIds, item.id),
    });
  };

  onToggleAll = () => {
    const pageOfItems = this.pager.getItemsOnPage(this.state.items, this.state.currentPage);
    const pageOfItemIds = pageOfItems.map(item => item.id);
    this.setState({
      selectedIds: toggleAll(this.state.selectedIds, pageOfItemIds),
    });
  };

  hasPreviousPage = () => this.pager.canPagePrevious(this.state.currentPage);

  hasNextPage = () => this.pager.canPageNext(this.state.items.length, this.state.currentPage);

  getEditUrlForItem = (item) => {
    return this.props.kbnUrl.eval(`#${VisualizeConstants.EDIT_PATH}/{{id}}`, { id: item.id });
  };

  getColumnSortOrder(column) {
    return this.state.sortedColumn === column ? this.state.sortOrder : SortOrder.NONE;
  }

  getTitleSortOrder() {
    return this.getColumnSortOrder(TITLE_COLUMN_ID);
  }

  getTypeSortOrder() {
    return this.getColumnSortOrder(TYPE_COLUMN_ID);
  }

  getAreAllItemsSelected() {
    const { selectedIds, items, currentPage } = this.state;
    const pageOfItems = this.pager.getItemsOnPage(items, currentPage);
    const pageOfItemIds = pageOfItems.map(item => item.id);
    return areAllItemsSelected(selectedIds, pageOfItemIds);
  }

  getVisualizeColumns() {
    const { selectedIds } = this.state;
    return [
      getCheckBoxColumn(this.getAreAllItemsSelected(), selectedIds, this.onToggleItem, this.onToggleAll),
      getTitleColumn(this.getEditUrlForItem, this.getTitleSortOrder(), this.onSortByTitle),
      getTypeColumn(this.onSortByType, this.getTypeSortOrder()),
    ];
  }

  onDelete = () => {
    const { deleteItems } = this.props;
    const { selectedIds, filter } = this.state;
    deleteItems(selectedIds).then((didDelete) => {
      if (didDelete) {
        this.onFilter(filter);
      }
    });
  };

  getActionButtons() {
    return this.state.selectedIds.length > 0
      ? <DeleteButton onClick={this.onDelete} />
      : <CreateButtonLink href={'#' + VisualizeConstants.WIZARD_STEP_1_PAGE_PATH} />;
  }

  getTableContents() {
    const { isFetchingItems, currentPage, items } = this.state;
    if (isFetchingItems) return null;
    const pageOfItems = this.pager.getItemsOnPage(items, currentPage);
    const columns = this.getVisualizeColumns();

    return pageOfItems.length > 0
      ? <ItemTable items={pageOfItems} columns={columns}/>
      : <VisualizeItemPrompt />;
  }

  render() {
    const { filter, pager, selectedIds } = this.state;

    return <div>
      <LandingPageToolBar
        filter={filter}
        onFilter={this.onFilter}
        startNumber={0}
        endNumber={0}
        totalItems={10}
        hasPreviousPage={this.hasPreviousPage}
        hasNextPage={this.hasNextPage}
        onNextPage={this.turnToNextPage}
        onPreviousPage={this.turnToPreviousPage}
        actionButtons={this.getActionButtons()}/>
      {
        this.getTableContents()
      }
      <LandingPageToolBarFooter
        startNumber={0}
        endNumber={0}
        totalItems={10}
        hasPreviousPage={this.hasPreviousPage}
        hasNextPage={this.hasNextPage}
        onNextPage={this.turnToNextPage}
        onPreviousPage={this.turnToPreviousPage}
        selectedItemsCount={selectedIds.length}
      />
    </div>;
  }
}

VisualizeLandingPageTable.propTypes = {
  fetch: React.PropTypes.func.isRequired,
  deleteItems: React.PropTypes.func.isRequired,
  kbnUrl: React.PropTypes.any.isRequired
};
