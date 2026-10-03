---
'@rimbu/multiset': major
'@rimbu/core': major
---

# `@rimbu/multiset`: one collection type, two contexts

Completes the capability migration by collapsing the two variant *types* into contexts, matching
`@rimbu/multimap` and `@rimbu/bimultimap`. No method is renamed in this change — it is purely
structural.

**`HashMultiSet` and `SortedMultiSet` are no longer types.** They are now `MultiSet.Context`
instances, and there is a single collection type `MultiSet<T>`:

```ts
import { HashMultiSet } from '@rimbu/multiset/hashed';

const ms = HashMultiSet.of('a', 'b', 'a'); // MultiSet<string>
```

The backing is chosen by the context, not by the type:

| Export | Backing count map |
|---|---|
| `HashMultiSet` | `HashMap` |
| `SortedMultiSet` | `SortedMap` |
| `MultiSet` (root) | `HashMap` |

Any other backing is `MultiSet.createContext({ countMapContext })`.

### Changed

- **`typeTag` is uniformly `'MultiSet'`.** It was per-variant (`'HashMultiSet'`,
  `'SortedMultiSet'`). The tag describes the collection, not the backing — the same rule
  `MultiMap` and `BiMultiMap` use. **Consequently `toString()` output changes**:
  `HashMultiSet("a")` is now `MultiSet(a)`.
- **`countMap` is no longer narrowed per variant.** `HashMultiSet<T>['countMap']` was a
  `HashMap<T, number>` and is now the generic `MapCollection<T, number>`
  (`MapCollection.NonEmpty<T, number>` when non-empty). This is the one caller-visible loss in
  the change; the concrete backing is an implementation detail, exactly as `BiMap` treats its
  delegate maps. Reaching for `HashMap`-only members on `countMap` no longer typechecks.
- **The root `MultiSet` value is now a working context**, so `MultiSet.of(1, 2, 2)` and
  `MultiSet.empty()` work at the root. It was previously a factory exposing only
  `createContext`, which meant the package had no default instance at all.
- **`HashMultiSet.Advanced` / `SortedMultiSet.Advanced` are gone**, along with
  `HashMultiSet.Builder`, `HashMultiSet.Context` and the per-variant `NonEmpty` interfaces.
  Use `MultiSet.Builder<T>` and `MultiSet.Context<UT>`.
- **`createContext` moved onto `MultiSetCollection.Advanced.ContextApi`**, so every context has
  it, not just the root const. This also fixes a latent bug: `MultiSet.createContext` declared
  an options object of `{ countMapContext }` while its implementation read `options.typeTag`, so
  a conforming call produced collections whose `toString()` began with `undefined(`. Options are
  now optional and default to the context's own backing.
- `MultiSetCreators` is retained as a deprecated alias for `MultiSet.Context<any>` so existing
  references keep resolving.

### Fixed

- `MultiSet.createContext()` produced `typeTag: undefined` at runtime — see above. No caller
  existed, which is why it went unnoticed.
