import { Slice } from './slice.mjs';

export function createRepository<T, K>(): Slice<
  Map<K, T>,
  {
    addAll: (entries: Iterable<[K, T]>) => void;
    deleteAll: (keys: Iterable<K>) => void;
    set: (key: K, value: T) => void;
    delete: (key: K) => void;
    clear: () => void;
  }
> {
  return Slice.create({
    initState: new Map<K, T>(),
    actions: {
      addAll: (state, entries: Iterable<[K, T]>) => {
        const newState = new Map([...state, ...entries]);
        return newState;
      },
      deleteAll: (state, keys: Iterable<K>) => {
        const newState = new Map(state);
        for (const key of keys) {
          newState.delete(key);
        }
        return newState;
      },
      set: (state, key: K, value: T) => {
        const newState = new Map(state);
        newState.set(key, value);
        return newState;
      },
      delete: (state, key: K) => {
        const newState = new Map(state);
        newState.delete(key);
        return newState;
      },
      clear: () => new Map(),
    },
  });
}

export function createAutoRepository<T, K>(
  itemToKey: (item: T) => K
): Slice<
  Map<K, T>,
  {
    addAll: (items: Iterable<T>) => void;
    deleteAll: (items: Iterable<T>) => void;
    add: (item: T) => void;
    remove: (item: T) => void;
    clear: () => void;
  }
> {
  const repo = createRepository<T, K>();

  return {
    ...repo,
    actions: {
      addAll: (items: Iterable<T>): void => {
        for (const item of items) {
          const key = itemToKey(item);
          repo.actions.set(key, item);
        }
      },
      deleteAll: (items: Iterable<T>): void => {
        for (const item of items) {
          const key = itemToKey(item);
          repo.actions.delete(key);
        }
      },
      add: (item: T): void => {
        repo.actions.set(itemToKey(item), item);
      },
      remove: (item: T): void => {
        repo.actions.delete(itemToKey(item));
      },
      clear: repo.actions.clear,
    },
  };
}
