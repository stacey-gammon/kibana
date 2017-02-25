export function areAllItemsSelected(selectedIds, itemIds) {
  return itemIds.every(id => selectedIds.indexOf(id) !== -1);
}

export function toggleItem(selectedIds, itemId) {
  const itemIndex = selectedIds.indexOf(itemId);
  if (itemIndex === -1) {
    return selectedIds.concat(itemId);
  }

  const copy = selectedIds.slice(0);
  copy.splice(itemIndex, 1);
  return copy;
}

export function toggleAll(selectedIds, itemIds) {
  if (areAllItemsSelected(selectedIds, itemIds)) {
    return [];
  }

  return itemIds.slice(0);
}
