# Rimbu Review — Open Issue Index

The **actionable** backlog from the three-pass review (API / implementation / tests) across
18 packages (excluding `core`, `actor`, `reactor`, `spy`, `typical`).

Reconciled 2026-10-09 against the completed capability migration. The original review filed
**38** issues; **23 are now done, moot, or `wontfix`** and live in [`_archive/`](./_archive/).
The **15** below are still open. Each archived file keeps its own `status:` field; this index
lists only what remains.

## Summary

- **Open issues:** 15
- **By severity:** high: 0, medium: 5, low: 10
- **By pass:** api: 7, implementation: 5, tests: 3

### Issues per package

- stream: 3
- common: 2
- deep: 2
- task: 2
- base: 1
- channel: 1
- graph: 1
- list: 1
- sorted: 1
- table: 1

## Cross-package / repo-wide themes (for triage)

- **`any` / non-null leakage still erodes internal type safety** in `sorted` (`take` returns
  `| any`), `deep` (public selector types), and `stream` (async `otherwise!`). The
  capability migration removed the public `transform` `any` leaks; these are the remainder.
- **Negative-index convention has residual sharp edges:** `deep` path arrays treat `[-1]` as a
  literal key; `List.repeat(negative)` now throws while `Stream.repeat(negative)` still
  normalizes to `1` (the filed issue is solved, but the divergence itself remains).
- **Type-level (`test-d/`) and property-based (`test-random/`) coverage gaps** persist in
  `task` (no `test-d` at all) and in the `Stream.at(-1)` guard; the keyed-package gaps were
  closed by the migration.
- **Foundational equality drift:** `Eq.stringCaseInsentitive` is still misspelled and the
  object-equality `in` check still walks the prototype chain.

## Open issues (severity → impact → package)

| # | Severity | Impact | Complexity | Pass | Package | Confidence | Effort | Title | File |
|---|----------|--------|------------|------|---------|-----------|-------|-------|------|
| 1 | medium | package | medium | tests | channel | medium | 1d | Channel concurrency primitives lack high-contention / interleaving stress tests | [channel-concurrency-tests.md](./channel-concurrency-tests.md) |
| 2 | medium | package | small | api | deep | high | 0.5d | getAt/select/patchAt path array indexing ignores negative-index (from-end) convention | [deep-path-no-negative-index.md](./deep-path-no-negative-index.md) |
| 3 | medium | package | small | implementation | sorted | medium | 0.5d | SortedMap/SortedSet take/drop implementations return '| any', weakening internal type safety | [sorted-take-drop-any-returns.md](./sorted-take-drop-any-returns.md) |
| 4 | medium | package | medium | api | stream | high | 1d | AsyncStream Constructors omit many factory methods present on sync Stream | [stream-async-constructors-missing-factories.md](./stream-async-constructors-missing-factories.md) |
| 5 | medium | package | small | tests | task | high | 1d | Task package has no type-level (test-d) tests despite heavily generic public types | [task-missing-test-d.md](./task-missing-test-d.md) |
| 6 | low | cross-package | trivial | implementation | common | medium | 0.5d | Eq object equality uses `in` (prototype-chain) for key presence, can miscompare objects with inherited enumerable properties | [common-eq-object-inherited-props.md](./common-eq-object-inherited-props.md) |
| 7 | low | cross-package | trivial | api | common | high | 0.5d | Eq.stringCaseInsentitive is misspelled (should be 'Insensitive'), inconsistent with Comp.stringCaseInsensitive | [common-eq-stringcaseinsentitive-typo.md](./common-eq-stringcaseinsentitive-typo.md) |
| 8 | low | package | trivial | api | base | medium | 0.5d | plain-object: type-level IsPlainObj excludes function-valued properties but runtime isPlainObj does not check them | [base-plainobject-type-runtime-divergence.md](./base-plainobject-type-runtime-divergence.md) |
| 9 | low | package | trivial | api | deep | high | 0.1d | select selector function type returns `any`; Select.Result widens to any | [deep-public-any-selectors.md](./deep-public-any-selectors.md) |
| 10 | low | package | trivial | api | graph | high | 0.1d | EdgeGraphBase.isDirected doc comment wrongly says 'arrow (directed)' | [graph-edge-directed-doc.md](./graph-edge-directed-doc.md) |
| 11 | low | package | small | implementation | list | medium | 0.5d | List.updateAt/setAt silently no-ops on out-of-bounds indices instead of throwing | [list-updateat-outofbounds-noop.md](./list-updateat-outofbounds-noop.md) |
| 12 | low | package | trivial | implementation | stream | high | 0.5d | Async at/find/first/last/single use `otherwise!` non-null assertion unlike sync OptLazy(otherwise) | [stream-async-at-find-nonnull-assertion.md](./stream-async-at-find-nonnull-assertion.md) |
| 13 | low | package | small | tests | stream | medium | 0.25d | No type-level test guards that Stream.at(-1) returns the fallback, not the last element | [stream-testd-negative-at-guard.md](./stream-testd-negative-at-guard.md) |
| 14 | low | package | small | api | table | medium | 0.5d | Table exposes only row-oriented access; no column view | [table-no-column-view.md](./table-no-column-view.md) |
| 15 | low | package | small | implementation | task | medium | 0.5d | Task.run does not await children when context is cancelled (contradicts documented guarantee) | [task-run-no-wait-on-cancel.md](./task-run-no-wait-on-cancel.md) |

## Known residual defects (not yet filed)

Surfaced while re-verifying the archived issues against the migrated code; each is a leftover
of a solved issue rather than a new one:

- `AsyncStream.NonEmpty.concat` declares its parameter as `AsyncStreamSource<T>` while the
  return is `T | T2` — the old overload asymmetry is gone, but the parameter type looks wrong.
- `List.repeat(negative)` now throws (`InvalidUsageError`) whereas `Stream.repeat(negative)`
  still normalizes to `1`; the behaviours remain divergent (throw vs. normalize).
- `Task.run`'s JSDoc promises it waits for children even on cancellation, but
  `task-context-impl.ts` still swallows the abort via `waitIgnoringAbort` (see issue 15).

---

Each issue file contains: Summary, Evidence (file:line), Impact, Recommendation.
Triage by: severity (correctness first) → impact (cross-package first) → complexity (quick wins).
