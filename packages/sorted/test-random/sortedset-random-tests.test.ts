import { SortedSet } from '@rimbu/sorted/set';
import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';

// `SortedSet` is a `DefaultFactory`, which `Pick`s only `builder` / `empty` /
// `from` / `of` / `reducer` off the context. The harness wants a full
// `ContextApi`, so pass the default context directly — the same context the
// factory would otherwise be standing in for.
runSetRandomTestsWith('SortedSet default', SortedSet.createContext<number>());
