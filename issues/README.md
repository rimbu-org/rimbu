# Rimbu Review — Issue Index

Generated from the three-pass review (API / implementation / tests) across 18 packages
(excluding `core`, `actor`, `reactor`, `spy`, `typical`).

## Summary

- **Total issues:** 38
- **By severity:** high: 3, medium: 16, low: 19
- **By pass:** api: 25, tests: 6, implementation: 7

### Issues per package

- stream: 5
- collection-types: 4
- proximity: 4
- bimultimap: 3
- common: 3
- bimap: 2
- ordered: 2
- list: 2
- channel: 2
- deep: 2
- graph: 2
- sorted: 2
- task: 2
- base: 1
- multimap: 1
- table: 1

## Cross-package / repo-wide themes (for triage)

- **Negative-index convention is inconsistently surfaced.** `Stream.at(-1)` correctly returns the fallback while `fromArray`/`fromString` honor negative `range.start`; `List.repeat(-1)` *reverses* while `Stream.repeat` normalizes to 1; `deep` path API treats `[-1]` as a literal key. Same library, three behaviors. (foundation + sequence + deep)
- **HKT `NonEmpty` overload-order defect in `collection-types` map base** silently widens `transform()` results to possibly-empty for every concrete map package — the exact anti-pattern AGENTS.md §6.3 forbids. Inherited repo-wide by hashed/sorted/ordered/bimap/bimultimap/multimap.
- **Foundational comparators not total orders** (`Comp.number` NaN handling) and **spelling/naming drift** (`Eq.stringCaseInsentitive`) propagate to every number-keyed/string-keyed collection.
- **Builder↔immutable naming divergence** in `bimap`/`bimultimap` (getValue/getKey vs at/atValue) breaks the convention every other keyed collection follows.
- **Missing type-level (`test-d/`) and property-based (`test-random/`) tests** across foundation (collection-types HKT), keyed (bimultimap, ordered, bimap), and structure (task) packages — exactly where types are most intricate.
- **`advanced/` vs `internal/` tier discipline** and **public `any` leakage** (proximity transform, deep selectors, EmptyBase) erode the extension API.

## All issues (severity → impact → package)

| # | Severity | Impact | Complexity | Pass | Package | Confidence | Effort | Title | File |
|---|----------|--------|------------|------|---------|-----------|-------|-------|------|
| 1 | high | cross-package | small | api | bimap | high | 0.5d | BiMap.Builder lookup methods use getKey/getValue, diverging from immutable at/atValue | [bimap-builder-getvalue-getkey-inconsistent.md](./bimap-builder-getvalue-getkey-inconsistent.md) |
| 2 | high | cross-package | small | api | bimultimap | high | 0.5d | BiMultiMap.Builder lookup methods use getValues/getKeys, diverging from immutable valuesAt/keysAt | [bimultimap-builder-getvalues-getkeys-inconsistent.md](./bimultimap-builder-getvalues-getkeys-inconsistent.md) |
| 3 | high | cross-package | small | api | collection-types | high | 0.5d | VariantMapBase.NonEmpty.transform declares the nonEmpty-returning overload AFTER the normal one, losing NonEmpty types | [collection-types-map-transform-overload-order.md](./collection-types-map-transform-overload-order.md) |
| 4 | medium | cross-package | medium | tests | collection-types | high | 1d | Type-level tests for collection-types omit transform() return types and merge/reducer factories | [collection-types-transform-typetests-missing.md](./collection-types-transform-typetests-missing.md) |
| 5 | medium | cross-package | small | implementation | common | high | 0.5d | Comp.number.compare is not a consistent total order for NaN vs Infinity | [common-comp-number-nan-total-order.md](./common-comp-number-nan-total-order.md) |
| 6 | medium | cross-package | small | tests | ordered | high | 1d | ordered, bimap, and bimultimap lack property-based (test-random) test suites | [keyed-packages-missing-property-tests.md](./keyed-packages-missing-property-tests.md) |
| 7 | medium | cross-package | small | api | list | high | 0.5d | List.repeat(negative) reverses the list, while Stream.repeat documents negative as normalized to 1 | [list-repeat-negative-reverses.md](./list-repeat-negative-reverses.md) |
| 8 | medium | cross-package | medium | api | ordered | high | 1d | OrderedMap/OrderedSet lack the positional/order methods present on SortedMap/SortedSet | [ordered-missing-positional-methods.md](./ordered-missing-positional-methods.md) |
| 9 | medium | package | small | tests | bimultimap | high | 0.5d | BiMultiMap has no type-level (test-d) tests, unlike every other keyed package | [bimultimap-missing-type-tests.md](./bimultimap-missing-type-tests.md) |
| 10 | medium | package | medium | tests | channel | medium | 1d | Channel concurrency primitives lack high-contention / interleaving stress tests | [channel-concurrency-tests.md](./channel-concurrency-tests.md) |
| 11 | medium | package | small | api | channel | high | 0.5d | Channel.select/selectCase leak a raw AggregateError and mislabel all-exhausted as TimeoutError | [channel-select-aggregate-error.md](./channel-select-aggregate-error.md) |
| 12 | medium | package | small | api | deep | high | 0.5d | getAt/select/patchAt path array indexing ignores negative-index (from-end) convention | [deep-path-no-negative-index.md](./deep-path-no-negative-index.md) |
| 13 | medium | package | small | api | graph | medium | 0.5d | ArrowGraph has no public reverse-connection lookup (getConnectionsTo) | [graph-missing-get-connections-to.md](./graph-missing-get-connections-to.md) |
| 14 | medium | package | trivial | implementation | proximity | high | 0.2d | findNearestKeyMatch treats NaN distance as an exact (distance-0) match | [proximity-nan-distance-match.md](./proximity-nan-distance-match.md) |
| 15 | medium | package | trivial | api | proximity | high | 0.2d | ProximityMapNonEmpty.transform returns `any`, losing return-type safety | [proximity-transform-returns-any.md](./proximity-transform-returns-any.md) |
| 16 | medium | package | small | implementation | sorted | medium | 0.5d | SortedMap/SortedSet take/drop/transform implementations return '| any', weakening internal type safety | [sorted-take-drop-any-returns.md](./sorted-take-drop-any-returns.md) |
| 17 | medium | package | medium | api | stream | high | 1d | AsyncStream Constructors omit many factory methods present on sync Stream | [stream-async-constructors-missing-factories.md](./stream-async-constructors-missing-factories.md) |
| 18 | medium | package | small | api | stream | high | 0.5d | Inconsistent negative-index handling: fromArray/fromString ranges honor negatives, Stream.at(-1) does not | [stream-negative-index-at-vs-range.md](./stream-negative-index-at-vs-range.md) |
| 19 | medium | package | small | tests | task | high | 1d | Task package has no type-level (test-d) tests despite heavily generic public types | [task-missing-test-d.md](./task-missing-test-d.md) |
| 20 | low | cross-package | trivial | api | collection-types | medium | 0.5d | EmptyBase.filter/remove/asNormal return `any`, leaking the concrete type for extenders | [collection-types-emptybase-any-returns.md](./collection-types-emptybase-any-returns.md) |
| 21 | low | cross-package | trivial | api | collection-types | medium | 0.5d | RMapBase.updateAt takes (value: V) => V while updateAtAndGet/Builder use VariantUpdate<V>, an inconsistent update callback type | [collection-types-updateat-variantupdate-inconsistent.md](./collection-types-updateat-variantupdate-inconsistent.md) |
| 22 | low | cross-package | trivial | implementation | common | medium | 0.5d | Eq object equality uses `in` (prototype-chain) for key presence, can miscompare objects with inherited enumerable properties | [common-eq-object-inherited-props.md](./common-eq-object-inherited-props.md) |
| 23 | low | cross-package | trivial | api | common | high | 0.5d | Eq.stringCaseInsentitive is misspelled (should be 'Insensitive'), inconsistent with Comp.stringCaseInsensitive | [common-eq-stringcaseinsentitive-typo.md](./common-eq-stringcaseinsentitive-typo.md) |
| 24 | low | package | trivial | api | base | medium | 0.5d | plain-object: type-level IsPlainObj excludes function-valued properties but runtime isPlainObj does not check them | [base-plainobject-type-runtime-divergence.md](./base-plainobject-type-runtime-divergence.md) |
| 25 | low | package | trivial | api | bimap | high | 0.25d | bimap AGENTS.md documents the public API as getKey/getValue, but the immutable API is at/atValue | [bimap-agentsmd-getvalue-getkey-doc.md](./bimap-agentsmd-getvalue-getkey-doc.md) |
| 26 | low | package | trivial | api | bimultimap | high | 0.25d | BiMultiMap removeValue/removeValues docs say 'key' but operate on 'value' | [bimultimap-remove-doc-copypaste.md](./bimultimap-remove-doc-copypaste.md) |
| 27 | low | package | trivial | api | deep | high | 0.1d | select selector function type returns `any`; Select.Result widens to any | [deep-public-any-selectors.md](./deep-public-any-selectors.md) |
| 28 | low | package | trivial | api | graph | high | 0.1d | EdgeGraphBase.isDirected doc comment wrongly says 'arrow (directed)' | [graph-edge-directed-doc.md](./graph-edge-directed-doc.md) |
| 29 | low | package | small | implementation | list | medium | 0.5d | List.updateAt/with silently no-ops on out-of-bounds indices instead of throwing | [list-updateat-outofbounds-noop.md](./list-updateat-outofbounds-noop.md) |
| 30 | low | package | trivial | api | multimap | high | 0.25d | multimap AGENTS.md documents a getValues(key) method that does not exist on the public API | [multimap-agentsmd-getvalues-doc.md](./multimap-agentsmd-getvalues-doc.md) |
| 31 | low | package | trivial | api | proximity | high | 0.1d | ProximityMapBuilder.at doc comment contradicts its own implementation | [proximity-builder-at-doc.md](./proximity-builder-at-doc.md) |
| 32 | low | package | trivial | api | proximity | medium | 0.2d | ProximityMap.hasKey uses exact match while at() uses nearest match (inconsistent) | [proximity-haskey-at-inconsistency.md](./proximity-haskey-at-inconsistency.md) |
| 33 | low | package | trivial | api | sorted | high | 0.25d | SortedMap.at is key-based while SortedMap.atIndex is positional — an undocumented sharp edge | [sorted-at-vs-atindex-sharp-edge.md](./sorted-at-vs-atindex-sharp-edge.md) |
| 34 | low | package | trivial | implementation | stream | high | 0.5d | Async at/find/first/last/single use `otherwise!` non-null assertion unlike sync OptLazy(otherwise) | [stream-async-at-find-nonnull-assertion.md](./stream-async-at-find-nonnull-assertion.md) |
| 35 | low | package | small | api | stream | medium | 0.5d | AsyncStream.NonEmpty.concat lacks the non-empty-source overload present on Stream.NonEmpty.concat | [stream-async-nonempty-concat-overload.md](./stream-async-nonempty-concat-overload.md) |
| 36 | low | package | small | tests | stream | medium | 0.25d | No type-level test guards that Stream.at(-1) returns the fallback, not the last element | [stream-testd-negative-at-guard.md](./stream-testd-negative-at-guard.md) |
| 37 | low | package | small | api | table | medium | 0.5d | Table exposes only row-oriented access; no column view | [table-no-column-view.md](./table-no-column-view.md) |
| 38 | low | package | small | implementation | task | medium | 0.5d | Task.run does not await children when context is cancelled (contradicts documented guarantee) | [task-run-no-wait-on-cancel.md](./task-run-no-wait-on-cancel.md) |

---

Each issue file contains: Summary, Evidence (file:line), Impact, Recommendation.
Triage by: severity (correctness first) → impact (cross-package first) → complexity (quick wins).