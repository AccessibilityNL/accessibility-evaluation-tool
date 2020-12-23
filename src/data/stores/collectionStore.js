import { writable } from 'svelte/store';

export default function collectionStore(Item, initialCollection) {
  const collection = writable(initialCollection);

  collection.create = function (value) {
    if (typeof value !== 'object') {
      value = { value };
    }

    const newItem = Item ? new Item(value) : { ...value };

    collection.update((value) => {
      return [...value, newItem];
    });

    return newItem;
  };

  collection.remove = function remove(removeItem) {
    collection.update((items) => {
      return items.filter((item) => {
        return item !== removeItem;
      });
    });
  };

  return collection;
}
