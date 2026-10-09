# Plan: Migrate `@rimbu/graph` to the capability/Family style

**Goal:** Move `@rimbu/graph` onto the capability-based API in
`@rimbu/collection-types`, joining the migrated set (hashed, sorted, ordered,
proximity, list, bimap, multimap, multiset, bimultimap, table). Graph is the
last holdout, and clearing it is what unblocks issue 10 (removal of the legacy
`RMap`/`RSet`/`Variant*` surface).

**Reference (already migrated, use as templates):**
- `.scratch/table-migration-plan.md` — closest structural analogue: a package
  whose element is *not* a KV pair, so it adopts the plain `Collection`
  contract plus a package-local `Capability.With*` suite, and bans
  `KeyedCollection`/`ValuedCollection` outright.
- `.scratch/bimap-migration-plan.md` — fullest plan; package-local capability
  namespace and the `*AndReturn` convention.
- `packages/table/src/advanced/table-base.ts` — the `Advanced.{Api,BuilderApi,
  ContextApi,FamilyBase,Family}` + `Capability.WithX` shape this plan copies.
- `packages/multiset/src/advanced/multiset-base.ts` — the smaller suite.

**Baseline gate (historical — this is what the plan was written against, and it
no longer holds):** `packages/graph` **did not build and did not test.**
`bun run build:seq` built 15 packages then aborted at graph (position 16 of 23),
leaving 7 packages downstream unverified. `tsc -p tsconfig.json --noEmit`
reported **72 errors** (40×TS2344, 16×TS2339, 8×TS2430, 8×TS2345).
`bun test test/` reported **8 pass / 174 fail**.

> Note: the error count is a floor, not a ceiling. Because the build aborted at
> graph, three further packages (`multimap`, `multiset`, `bimultimap`) were *also*
> broken and nobody had seen it. Fixing graph is what exposed them.

**Hard switch:** big bang, no aliases, no deprecation shims. Breaking change
(`major` changeset). No `Variant*` legacy surface, no `RMap`/`RSet` references.

**This is a repair, not a refactor.** See §1 — the package calls 57 methods
that no longer exist. The `tsc` errors are the visible tip of that, not the
whole of it.

---

## 1. Measured baseline

| Metric | Value |
|---|---|
| `src/` | 6 430 lines, 44 files. **No `src/advanced/`**; `package.json` has no `./advanced/*` |
| `test/` | 3 383 lines: 4 shared harnesses (2 881 lines) + 4 thin drivers + 2 traverse suites |
| `test-d/` | 92 lines, **one** file, abstract family only, stale |
| `test-random/` | **absent**, and no `test:random` script |
| build position | 16 of 23 (blocks `multimap`, `proximity`, `table`, `bimultimap`, `core`, +2) |

### 1.1 Legacy method calls in `src/` — 57 sites

| Legacy spelling | New spelling | Sites | Files |
|---|---|---:|---|
| `modifyAt(k, o)` | `modifyAtKey(k, o)` | **34** | `valued/base.ts` 11, `valued/builder.ts` 8, `valued/non-empty.ts` 8, `non-valued/builder.ts` 3, `non-valued/non-empty.ts` 4 |
| `updateAt(k, o)` | `updateAtKey(k, o)` | 12 | `non-valued/builder.ts` 5, `valued/builder.ts` 3, both `non-empty.ts` 2 each |
| `hasKey(k)` | `has(k)` | 11 | `valued/non-empty.ts` 5, both `builder.ts` 2 each, `non-valued/non-empty.ts` 2 |
| `defaultContext()` | the object itself | 16 | all 8 `src/public/*/{hashed,sorted}.ts`, 2 each |

`hasKey` no longer exists anywhere in rimbu — verified absent from
`packages/hashed/src/public/map.ts`,
`packages/collection-types/src/public/map.ts`, and
`packages/collection-types/src/public/collection/keyed.ts`.

**One of the 57 is on a hot public path:**
`src/internal/valued/non-empty.ts:133` calls `targets?.hasKey(node2)` inside
`hasConnection`. Every valued-graph connection query throws.

`defaultContext()` fails because `HashMap` *is* the default context now:
`packages/hashed/src/public/map.ts:92-93` exports
`HashMapCollectionContext.createDefault().keyedContext` as `HashMap`, typed
`KeyedContextApi<any, Family<any, any>>`, which has `createContext` but not
`defaultContext`. Replace `X.defaultContext()` with `X`.

### 1.2 Why the 72 type errors happen

`GraphBase.Types` (`internal/base.ts:503-509`) and `ValuedGraphBase.Types`
(`internal/valued/base.ts:583-595`) pin seven storage slots to legacy
`RMap`/`RSet`: `linkMap`, `linkMapNonEmpty`, `linkMapContext`,
`linkConnectionsContext`, `linkMapBuilder`, `linkConnectionsBuilder`,
`linkConnections`. New `HashMap.Context` no longer satisfies old
`RMap.Context` (which still demands `mergeAll`/`mergeAllWith`/`merge`/`mergeWith`,
`collection-types/src/advanced/map/base.ts:696,743,816`), so every leaf
`Types` record fails its `extends` constraint.

The single most informative diagnostic is `TS2430` at
`src/public/non-valued/arrow/hashed.ts:70`, whose innermost frame reads
`HashMap.Context<any>` is missing `mergeAll, mergeAllWith, merge, mergeWith`
from `RMap.Context<any>`.

### 1.3 Eight hand-restated `Types` records

Each leaf `Types` in `src/public/**` re-declares all seven storage slots with
concrete `HashMap`/`HashSet`/`SortedMap`/`SortedSet`. That is the only
mechanism by which graph generalizes over storage — the runtime classes do not
vary, only the injected context and this type record. This duplication is the
trap that produced the bug; §3 removes it.

---

## 2. Settled design decisions

### 2.1 Storage typing — two HKT slots, derived (Q2, Q13, Q18)

`GraphCollection.Advanced.FamilyBase<N>` extends
`Collection.Advanced.FamilyBase<GraphElement<N>>` and adds:

- `_N`, `_NEW_N`, `_UPPER_N` — **independent** slots, not projections.
  `KeyedCollection.Advanced.FamilyBase` gets away with
  `_UPPER_K: this['_UPPER_E'][0]` only because its element is a 2-tuple.
  `GraphElement<N>` is the *union* `N | Link<N>`, so there is nothing to index,
  and projecting would require pinning `_UPPER_E`/`_NEW_E` as concrete unions
  — which merges with TS2320 against `Collection.Advanced.Family`.
  Same reason, same remedy as `table-base.ts:80-104`.
- `_LINK_MAP_FAM` — the outer map family.
- `_LINK_CONNECTIONS_FAM` — the inner set (non-valued) / map (valued) family.
- `_FAM`, `_NEW_FAMILY`.

**Derive the outer map's value type from the inner family**, so each fact is
named once per variant:

```ts
_LINK_CONNECTIONS_FAM: SetCollection.Advanced.Family<N>;
_LINK_MAP_FAM: MapCollection.Advanced.Family<this['_N'], this['_LINK_CONNECTIONS_FAM']['_NORMAL']>;
```

**Fallback:** if `this['_LINK_CONNECTIONS_FAM']['_NORMAL']` is rejected in the
constraint position, write the value type literally
(`MapCollection.Advanced.Family<N, HashSet<N>>`) and add a `tune-hkt --probe`
assertion that `ArrowGraphHashed['linkMap']` resolves to
`HashMap<N, HashSet<N>>`, so drift is caught by a check rather than a bug
report. Do not accept a cast or `any` to make it compile.

`linkMap` **stays public** (Q17). It is documented with a runnable `@example`,
and demoting it is a breaking removal the "rename nothing" rule ruled out.

### 2.2 Two root families, no collapse (Q12)

New generic names `GraphCollection<N>` and `ValuedGraphCollection<N,V>` host the
capability suites, matching the `TableCollection`/`MultiSetCollection`/
`BiMapCollection`/`MultiMapCollection`/`BiMultiMapCollection` precedent. They
are forced as two: the inner slot differs in *kind*
(`SetCollection.Advanced.Family` vs `MapCollection.Advanced.Family`), so no
single family spans both.

`ArrowGraph`/`EdgeGraph`/`ArrowValuedGraph`/`EdgeValuedGraph` stay exactly as
they are, now extending `GraphCollection.Advanced.Api`. **Directedness stays a
runtime flag**, moved onto the context per §2.6.

*Deliberately deferred:* collapsing the four into `Graph`/`ValuedGraph`, and
typing `EdgeGraph.getConnectionsFrom` as symmetric. Both are follow-ups, filed
together, because collapsing is a post-migration removal.

### 2.3 Capability adoption — the narrow set (Q1, Q16, Q26)

Claim from shared `@rimbu/collection-types`:

- `Collection.Capability.WithToBuilder`
- `Collection.Capability.WithReducer` (via `ContextApi`)
- `Collection.Capability.WithRecompose`

Refuse, with the reason recorded in the type system:

- **`WithFilter` — all four families.** Two independent reasons.
  (a) Its type-guard overloads return `Advanced.ReTyped<Tp, E2>['_NORMAL']`,
  which re-derives via `(Tp & { _NEW_E: E2 })['_NEW_FAMILY']`. For a graph
  `_NEW_FAMILY` is `FamilyBase<this['_NEW_N']>` — keyed on the **node** type,
  not the element type — so narrowing `GraphElement<N>` leaves
  `_LINK_MAP_FAM`/`_LINK_CONNECTIONS_FAM` as `unknown` and resolves to
  nothing usable. (b) On undirected graphs each edge is stored twice, so
  keeping `[2,3]` while dropping `[3,2]` yields a state no `connect`/
  `disconnect` can produce.
- **`WithAdd`/`WithAddEach`** — the graph's addable unit is a *node*, not a
  `GraphElement`; claiming them would wrongly admit a link.
- **`WithMap`/`WithFlatMap`/`WithMapIndexed`/`WithFlatMapIndexed`** — a node
  rename must be applied to both sides of every link, which is not `map`'s
  contract.
- **`KeyedCollection<K,V>` and `ValuedCollection`** — banned, for the same
  reason as table: `KeyedCollection` binds its element to `readonly [K, V]`
  unconditionally, and the graph's element is a union.
- **`IndexedCollection`** — no positional order.

**Consequence:** `GraphCollection.Advanced.Api` is hand-written, composing the
claimed capability `Api`s explicitly rather than extending the aggregate
`Collection.Advanced.Api` (which would drag in `WithFilter`). This is what
`table` does, for the same reason. `table-base.ts` is the template.

### 2.4 `size` semantics (Q10)

`size === nodeSize` (`linkMap.size` is the node count). Delete `length`
(banned name; only ever existed on the empty class via `EmptyBase`).

**Documented divergence, required in JSDoc on every graph family:** `size` is
the node count, while `toArray().length` enumerates graph *elements*
(isolated nodes + links) and equals neither `size` nor `connectionSize`.

### 2.5 Undirected iteration — keep the double-count (Q19, Q22, Q23)

`EdgeGraph*.stream()` / `toArray()` / `forEach()` / `[Symbol.iterator]` /
`streamConnections()` emit each undirected edge **twice**, because
`connect` writes both directions (`internal/non-valued/non-empty.ts:203-228`).
`connectionSize` counts once. Keep it.

Reasons: a dedup needs a visited-pair set — O(edges) allocation and state on a
hot iteration path — and the current behaviour is **asserted, not masked**:
both edge harnesses have a `symmetric()` helper
(`test/edge-graph-test-standard.ts:9-25`) that manufactures the doubled
expectation from a single-encoded fixture, at ~20 sites per harness including
both `forEach` counters (`:208` expects 6, `:212` expects 12).

Do:

- Document the inconsistency on `size`/`nodeSize`/`connectionSize`/`stream`/
  `forEach`/`toArray` for the undirected families.
- Tighten the harness comparison (Q19(c)) so a future change is caught.
- File the behaviour change + symmetric-`getConnectionsFrom` typing as a
  follow-up issue.

Note: `traverseDepthFirst*`/`traverseBreadthFirst*` are **unaffected** — they
consume `getConnectionStreamFrom` + `hasNode` and are already visit-gated.

### 2.6 Mixin chain, and `isDirected` onto the context (Q5)

Use the `WithMixin` chain (`MapCollectionEmpty.WithMixin(
KeyedCollectionEmpty.WithMixin(CollectionEmpty.Constructor))`), as hashed /
sorted / list / bimap / proximity / ordered do.

This requires reshaping graph's constructors to lead with `context`, because
`CollectionEmpty.Base` / `CollectionNonEmpty.Base` assume the first constructor
parameter is `Tp['_CONTEXT']`. Move `isDirected` onto the context — it is a
per-variant compile-time constant (`Arrow` → `true`, `Edge` → `false`) that is
currently stored per-instance on all four non-empty classes. This is a genuine
simplification and is what makes the classes chainable.

**If the ctor reshaping cascades further than expected, fall back** to direct
implementation against `CollectionEmpty.Base`/`CollectionNonEmpty.Base` as
abstract supertypes (table's route), skipping the `WithMixin` wrapper types.

`EmptyBase`/`NonEmptyBase` (`collection-types/src/advanced/common/empty-base.ts`)
are deleted; graph's `GraphEmptyBase` becomes a graph-local base over
`CollectionEmpty.Base`.

### 2.7 Variant tier — delete (Q4)

Delete all four: `VariantGraphBase` (`internal/variant-base.ts`, 345 lines),
`VariantValuedGraphBase` (`internal/valued/variant-base.ts`, 130 lines),
`VariantGraph`, `VariantValuedGraph`. All are internal-only, so this costs
nothing publicly. The capability rewrite already deleted the map/set variant
tier with no successor; this follows that precedent. Whatever read-only surface
users need (`linkMap`, `getConnectionsFrom`) lives in the normal `Api`.

### 2.8 Naming — two renames, two kept (Q6, Q11)

Rename: `connectAll` → `connectEach`, `disconnectAll` → `disconnectEach`. The
`*All` ban is load-bearing — `connectAll(links)` genuinely reads as "connect
everything".

Keep: `addNodes`, `removeNodes`. The plural already conveys per-element
application and `Node` is the correct unit noun; `addNodeEach` reads worse.
**Record this deviation in `packages/graph/AGENTS.md`** so the next reader
does not "fix" it.

Keep everything else: `linkMap`, `getConnectionsFrom`, `getConnectionsTo`,
`getConnectionStreamFrom`, `getConnectionStreamTo`, `nodeSize`,
`connectionSize`, `streamNodes`, `streamConnections`, and all 16 exported type
names. Graph's names are not legacy.

### 2.9 Builder (Q29)

`GraphBuilder` implements the capability `BuilderApi` (`context`, `isEmpty`,
`size`, `forEach`, `forEachIndexed`, `clear`, `build`) and keeps `_lock` /
`checkLock` graph-local. `nodeSize`/`connectionSize` stay graph-local on both
`Builder` and the collection — `size` on the builder is ambiguous under §2.4 and
duplicating it invites the confusion that §2.4 already has to document.

`checklock` tests must use a **fresh builder per assertion** plus a
post-condition proving the lock was not leaked, and must cover `halt()`
separately (which `CollectionBuilderBase.forEachIndexed` implements by throwing
a sentinel it swallows). Root `AGENTS.md` §9 records a live precedent of that
lock leaking when `_lock++`/`_lock--` was not wrapped in `try`/`finally`.

---

## 3. Capability roster (Q17)

**Shared core** — `GraphCollection.Advanced.Api`, claimed by all 8 concrete
types: `size`, `isEmpty`, `nodeSize`, `connectionSize`, `context`, `nonEmpty`,
`assumeNonEmpty`, `asNormal`, `stream`, `forEach`, `forEachIndexed`, `toArray`,
`toString`, `toJSON`, `streamNodes`, `streamConnections`, `hasNode`,
`hasConnection`, `linkMap`, plus the three shared capabilities from §2.3.

**Non-valued only** (`GraphCollection.Capability`): `addNode`, `addNodes`,
`removeNode`, `removeNodes`, `connect`, `connectEach`, `disconnect`,
`disconnectEach`, `getConnectionsFrom`, `getConnectionsTo`,
`getConnectionStreamFrom`, `getConnectionStreamTo`, `removeUnconnectedNodes`,
`isSink`, `isSource`.

**Valued only** (`ValuedGraphCollection.Capability`): the same node/link
vocabulary plus `getValue`, `modifyAt`, `mapValues`.

Decisions taken: `isSink`/`isSource` stay on all four (well-defined on an
`EdgeGraph`, where they are always `false`; narrowing per directedness would add
asymmetry for no gain). `linkMap` stays public. Check whether
`removeUnconnectedNodes` is missing from the valued families — if accidental,
close the gap.

---

## 4. Defects found while establishing the baseline

All fold into commit 1; none is independent of the rewrite.

### 4.1 Runtime (in code being rewritten anyway)

- **57 legacy method-name call sites** — §1.1. Includes
  `valued/non-empty.ts:133` (`hasKey` in `hasConnection`).
- **16 `defaultContext()` call sites** — §1.1.
- `internal/non-valued/non-empty.ts:125` — `getConnectionStreamTo()` returns
  `any`, while its valued twin returns `Stream<ValuedLink<N, V>>` correctly.
- `internal/non-valued/empty.ts:77` and `internal/valued/empty.ts:113` —
  `toJSON(): ToJSON<any[]>` on both empty classes, vs properly typed non-empty
  counterparts.
- `internal/common/base.ts` — `streamNodes()`/`streamConnections()` on
  `GraphEmptyBase` return `Stream<any>`, vs typed non-empty counterparts.
  (Four `any` leaks in total. Plan completion criterion 4 forbids new `any`;
  these are pre-existing and get removed anyway.)
- `internal/valued/non-empty.ts:168` — the directed branch of
  `getConnectionStreamTo` is implemented **on top of** `streamConnections()`,
  while the non-valued twin reads `linkMap` directly. Two implementations of one
  operation; unify on the `linkMap`-direct form.
- `EmptyBase.filter(): any` and `EmptyBase.remove(): any` — `remove()` is
  meaningless on a graph (there is `removeNode`/`removeNodes`/`disconnect`).
  Gone with `EmptyBase`; do not reintroduce. `filter` must not exist anywhere,
  since `WithFilter` is refused.

### 4.2 Tests

- `arrMulti` in both edge harnesses lists `['a','b']` and `['b','a']` — the same
  undirected edge twice. `symmetric(arrMulti)` yields 7 against a graph holding
  5, so **`arrMulti` is never passed to `expectEqual`**; its connection
  behaviour is untested. It is used only for `nodeSize`
  (`edge-graph-test-standard.ts:295`, `:413`) and `getConnectionStreamTo`
  (`:242`, `:253`).
- `test-d/arrowgraph.test-d.ts:83-88` — uses the *function form*
  `expectTypeOf<Stream<Link<number>>>(value)`, which asserts nothing. Needs
  `.toEqualTypeOf`.
- `test-d/arrowgraph.test-d.ts:60-62` — dead `connectIfNodesExist` assertions.
  Confirmed `connectIfNodesExist` is a **Builder-only** method
  (`test/edge-graph-test-standard.ts:487`); the immutable assertions never
  existed.
- `test-d/arrowgraph.test-d.ts:64-68` — commented-out, superseded
  `sourceMap`/`RMap` assertions.
- `test-d/arrowgraph.test-d.ts:79-80` — asserts
  `getConnectionsFrom(1)` is exactly `RSet<number>`. Under §2.1 this resolves
  per variant (`HashSet<number>` / `SortedSet<number>`); must be rewritten
  against a concrete variant.
- Only 1 `test-d` file exists, testing only the abstract `ArrowGraph` family.
  None of the 8 concrete variants has a type test. Rewrite per variant.
- `test/traverse-depth-first.test.ts` — both `describe` blocks are misnamed
  `'traverseBreadthFirst …'`.
- All 4 harnesses are typed against `ArrowGraph.Context<any>` /
  `ArrowValuedGraph.Context<any>` — 8×TS2345. Retype against a **named**
  capability family (the `collection-types/test-utils/map-collection-standard.ts`
  precedent: a named interface extending the aggregate family, then
  `Graph.Context<Capabilities>`), never an ad-hoc intersection of
  `Capability.With*` (root `AGENTS.md` §6.4).

### 4.3 Documentation

- Root `AGENTS.md` §11 — "All packages currently typecheck cleanly. There are no
  known pre-existing typecheck errors." **False**: 72 errors in graph.
- `.scratch/collection-capabilities/issues/06:39` — records "64 `tsc` errors";
  actual is 72. Also `06:17` still says "Graph ❌ not started"; `06:32-35` and
  the `06:37-45` pre-existing-failures note need updating once graph lands.
- `packages/graph/AGENTS.md:3-6` — describes families as
  "`Arrow`/`Edge` × `Valued`/`NonValued`", but the exported names are infix
  (`ArrowValuedGraph`, `EdgeValuedGraph`). `:78-91` describes `VariantGraphBase`,
  deleted by §2.7. Needs the §2.8 naming deviation and the §2.5 iteration note.
- `packages/collection-types/AGENTS.md:40-43` — "All concrete maps extend
  `RMapBase`" is false since Phase 4; `:7-29` omits `src/public/**` entirely.
  (Already tracked as issue 03.)

---

## 5. `test-random/` (Q8, Q15)

New directory, new `test:random` script in `package.json` that passes
`--tsconfig-override tsconfig.common.json` (root `AGENTS.md` §5: without it,
cross-package imports fail to resolve and the suite exits before running a
single test).

- Oracle: an adjacency-list model (`Map<N, Set<N>>` / `Map<N, Map<N, V>>`).
- **Both** valuednesses, all operations. The valued variant differs under
  `disconnect` (drop the link's value) and under `connect` on an already-connected
  pair (overwrite the value, or keep the first? — currently uncovered by any
  test, so decide and assert it).
- `checklock` coverage for the builder's traversal lock, plus a separate `halt()`
  case. See §2.9.
- **Sub-quadratic** (root `AGENTS.md` §9): O(1) invariants after every
  operation, full re-verification every `CHECK_FULL_EVERY`, explicit `checkFull()`
  per case. A differential harness re-verifying the whole graph after each of
  ~1000 ops is O(n²) and dominated the multimap suite before it was fixed.

---

## 6. Commit plan

Four commits, four `major` changesets — matching the 12 pending in `.changeset/`
(`bimap-capabilities-migration.md`, `table-capabilities-migration.md`, …).

### Commit 0 — verify before renaming (no commit; a gate)

The 34 `modifyAt` and 12 `updateAt` sites pass option objects of the shape
`{ ifNew: { create }, ifExists: { update } }`. **Their key names may also have
been renamed.** `ModifyOptions` and `checkEmptyModifyOptions` are imported from
`@rimbu/collection-types/advanced/common` — confirm whether that pair survived
the rewrite or is itself legacy.

**Already verified (2026-10-06) — do not redo:** the option shape is
**unchanged**. `collection-types/src/internal/common/utils.ts:3-41` still
declares

```ts
ifNew?: { set?: any; create?: any };
ifExists?: { set?: any; update?: any };
```

and `checkEmptyModifyOptions` still destructures `{ ifNew, ifExists }` and
diagnoses on `'set' in ifExists === 'update' in ifExists`. `ModifyOptions` and
`checkEmptyModifyOptions` are both still exported and still live. So all 34
`modifyAt` sites are a **pure rename** to `modifyAtKey`, not a rewrite.

Two follow-ups before committing the rename:

- Grep each site's *value* side too — the callbacks (`create`, `update`, `set`)
  receive the **inner** collection, so calls made *inside* them (e.g.
  `targets.add(node2)` in `connect`, `non-valued/non-empty.ts:190`) must also be
  spelled per the capability API. `add` and `has` are current; anything else is
  not.
- After the rename, `bun test` must go from 8 pass / 174 fail to fully green
  **before** adding `size`, `connectEach`, or `test-random/`, so each later
  step is attributable.

Do this **while the types are still broken**, because the 72 `tsc` errors are
currently masking whether the option shapes are correct.

**Risk (reduced):** the option shape is confirmed unchanged, so commit 1 does
not grow. The residual risk is a mis-spelled call *inside* a `create`/`update`
callback, which no type error catches until runtime.

### Commit 1 — graph, green

Proposed internal order:

1. Storage slots (§2.1) — remove the eight hand-restated `Types` records.
2. `isDirected` onto the context; constructor reshape (§2.6).
3. `WithMixin` chain; delete `Variant*` tier (§2.7); delete `EmptyBase` usage.
4. **57-site legacy rename** (§1.1) + 16 `defaultContext()`.
5. `size` (= `nodeSize`); delete `length` (§2.4).
6. `connectEach` / `disconnectEach` (§2.8).
7. Remaining runtime bugs + 4 `any` leaks (§4.1).
8. Per-variant `test-d` (§4.2).
9. Retype 4 harnesses against a named capability family; fix `arrMulti`,
   tighten the undirected comparison (§4.2, §2.5).
10. `test-random/` (§5).
11. `.changeset/graph-capabilities-migration.md`.
12. Doc fixes (§4.3) + `packages/graph/AGENTS.md`.

**Expected in the changeset:** `size` added, `length` removed,
`connectAll`/`disconnectAll` renamed, `getConnectionsFrom` return type now
per-variant, undirected `stream()`/`toArray()` **behaviour change** (§2.5), and
`Variant*` internals deleted.

### Commit 2 — remove the legacy `collection-types` surface

- Delete `advanced/map/base.ts` (1110 lines, `RMapBase`),
  `advanced/set/base.ts` (699 lines, `RSetBase`), `advanced/{map,set}/base-module.ts`,
  `internal/{map,set}/types/{generic,variant}.ts`,
  `advanced/common/empty-base.ts`.
- Un-`@ts-nocheck` `hashed/test-d/{map,set}.test-d.ts` and
  `sorted/test-d/{map,set}.test-d.ts` (issue 10 items 2; they are inert today).
- Drop the last `@deprecated` in any `packages/*/src` — `MultiSetCreators`
  (`multiset/src/public/multiset.ts:92`).
- **Replace `core/src/collection-types.ts`.** It is currently
  `export * from '@rimbu/collection-types'; export * from '@rimbu/collection-types/advanced/common';`
  — i.e. legacy generics plus `ModifyOptions`/`checkEmptyModifyOptions`. The
  capability surface is **not** re-exported from `@rimbu/core` today. Swap in
  `Collection`, `MapCollection`, `SetCollection`, `KeyedCollection`,
  `ValuedCollection`, the family `Advanced` types, the `Capability` namespaces,
  and graph's new `GraphCollection`/`ValuedGraphCollection`. Do not re-export
  `ModifyOptions`/`checkEmptyModifyOptions` from `core`; graph imports them from
  `@rimbu/collection-types/advanced/common` directly.
- `.changeset/remove-legacy-map-set-surface.md`.

Note: this is issue 10's content. Issue 10 also lists issue 09 (Ordered
order-edit) as a blocker, but that is independent of legacy removal.

### Commit 3 — the two unrelated pre-existing failures

Neither blocks `build:seq` (both are outside `src/`), but both block
`typecheck:seq` / `test`, and root `AGENTS.md` §11 must end up true.

- `packages/list/test-types/family.ts` — 39 errors; expects
  `Advanced.Types` / `Advanced.TypesNonEmpty` that the capability rewrite removed.
- `packages/deep/test/patch.test.ts` — 1 error; calls the renamed `with`.

---

## 7. Documentation deliverables (Q20)

- `src/advanced/graph-base.ts` — `GraphCollection.Advanced.{FamilyBase,Family,Api,
  BuilderApi,ContextApi}` + `GraphCollection.Capability.With*`; the valued twin
  alongside.
- **Add `"./advanced/*"` to `package.json` exports** and `src/advanced/` to the
  source layout. Precedent: bimap, bimultimap, multimap, multiset, table.
- `@example` policy: document the aggregate types (`Api`, `Family`, `FamilyBase`)
  with **one worked end-to-end example per suite namespace** (showing how to add
  a custom capability to a custom graph family); individual `With*` interfaces get
  prose. `advanced/` is the implementer tier — 15 near-identical snippets would
  be noise, and one worked example teaches more.
  **This needs a written exemption in `graph/AGENTS.md`**, because the
  `review-docs` skill otherwise flags prose-only public exports.
- Concrete families keep their existing examples and **gain one for `size`**.
- Update `.scratch/collection-capabilities/issues/06` (§4.3).
- Update `packages/graph/AGENTS.md`: source layout incl. `advanced/`, the §2.8
  naming deviation, the §2.5 iteration note, and the undirected
  `getConnectionStreamTo` asymmetry resolution.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| `modifyAt` option shape also changed | Commit 0 verifies while types are broken |
| `this['_LINK_CONNECTIONS_FAM']['_NORMAL']` rejected in constraint position | §2.1 fallback + `tune-hkt --probe`; never a cast or `any` |
| Constructor reshape cascades past the mixin chain | §2.6 fallback to direct implementation |
| `test-random/` finds graph logic bugs the set-comparison never could | Intended; commit 1 may not be one sitting |
| `connect` on an already-connected valued pair is undefined | Decide and assert under §5; it is currently uncovered |
| Undirected double-count looks like a bug to a reviewer | §2.5 documents it; tightened harness guards it |
| Scope creep into `filter`/iteration redesign | Explicitly out of scope; filed as follow-up |

> **Status: 2026-10-08 — commits 1 and 3 landed; commit 2 untouched.**
>
> `bun run build:seq` builds all 23 packages (it used to abort at graph, position
> 16), `bun run typecheck:seq` is clean across all 22, and `bun run test` /
> `test:random` / `biome:check` all exit 0. Graph contributes 481 runtime tests,
> a per-variant `test-d`, and a `test-random/` suite.
>
> **What actually got done differs from the plan below. Two corrections matter:**
>
> 1. **§2.3/§2.7 are only half-done.** `advanced/graph-base.ts` and its
>    family-carrying storage aliases are in place and used by all eight concrete
>    families — `linkMap` resolves to `HashMap<N, HashSet<N>>` and friends. But the
>    public variant interfaces still extend the internal `VariantGraphBase` /
>    `GraphConnect` hierarchy, **not** `GraphCollection.Advanced.Api`. So the
>    capability aggregates do not reach users, and the `Variant*` tier still
>    exists. A visible symptom: `toArray()` is declared on the capability `Api` but
>    **graphs have no `toArray()`** (use `stream().toArray()`). This is the main
>    remaining piece of work.
> 2. **§6 commit 3 turned out to be much wider than "two unrelated failures."**
>    Fixing graph exposed three further *build* failures it had been hiding
>    (multimap, multiset, bimultimap) plus 30 errors in `list/test/`. All are fixed;
>    §6 commit 3 is therefore done and §1's "pre-existing failures" note is stale.
>
> **The `test-random/` suite earned its place immediately** (§5 predicted this):
> it found two defects the set-comparison harnesses could not reach, both now
> fixed and pinned in `packages/graph/test/regression.test.ts` —
> `connectionSize` drifted upwards after `removeNode` on a directed graph (only
> incoming arcs were subtracted, outgoing ones silently ignored), and
> `Builder.forEach` emitted a spurious isolated-node element for every *connected*
> node, disagreeing with `Builder.build().stream()`.

> **Status: 2026-10-08 — commits 1 and 3 landed; step 1 of the rewiring landed.**
>
> `bun run build:seq` builds all 23 packages (it used to abort at graph, position
> 16), `bun run typecheck:seq` is clean across all 22, and `bun run test` /
> `test:random` / `biome:check` all exit 0. Graph contributes 512 runtime tests,
> a per-variant `test-d`, and a `test-random/` suite.
>
> **§2.7 is now done: the `Variant*` tier is deleted.** `VariantGraphBase`,
> `VariantValuedGraphBase`, `VariantGraph`, `VariantValuedGraph`,
> `GraphConnect` and `GraphConnectNonEmpty` are gone; their members and all of
> their documentation moved onto `GraphBase` / `ValuedGraphBase`. No public API
> change, no behaviour change (518 tests green before and after). Two knock-on
> effects are documented in `packages/graph/AGENTS.md`: the two hierarchies are
> no longer unified, and each non-empty base must state `isDirected` itself
> because the `Omit` that folds its refinements into the normal form widens it.
>
> **§2.3 (adopt `Advanced.Api` as the public surface) was attempted and not
> completed.** It requires replacing graph's self-referential `Types` record with
> a `Family<N>`, which is a public API change (12 exported interfaces removed).
> Blocked on the fact that a set is invariant in its element type, so the
> abstract `_LINK_MAP_FAM` cannot derive its value type from
> `_LINK_CONNECTIONS_FAM['_NORMAL']` as §2.1 specifies — the widening is the
> plan's own documented fallback. Even with that resolved, wiring the concrete
> `Families` through the internal classes hits the same invariance wall one level
> down (`_FAM` → `_CONTEXT` → `linkMapContext`). Deferred deliberately.
>
> **Rewiring step 1 of 2 (done): the capability surface now exists at runtime and
> in the public types.** `toArray()`, `forEachIndexed()`, `Builder.clear()` and
> `asNormal()` were declared by `GraphCollection.Advanced.Api` / `.BuilderApi` but
> had no implementation and no public declaration. All four are now implemented on
> the classes *and* declared on the legacy bases, so the rewiring below is a pure
> move rather than a rewrite. Covered by `test/capability-surface.test.ts`.
>
> **What actually got done differs from the plan below. Three corrections matter:**
>
> 1. **§2.3/§2.7 are half-done.** `advanced/graph-base.ts` and its
>    family-carrying storage aliases are in place and used by all eight concrete
>    families — `linkMap` resolves to `HashMap<N, HashSet<N>>` and friends. But the
>    public variant interfaces still extend the internal `VariantGraphBase` /
>    `GraphConnect` hierarchy, **not** `GraphCollection.Advanced.Api`. So the
>    capability aggregates do not yet reach users. **This is step 2, the main
>    remaining piece of work.**
> 2. **§2.5's `toArray()` claim was wrong** when written: graphs had no `toArray()`
>    at all. Step 1 added it, so the claim is now true.
> 3. **§6 commit 3 turned out to be much wider than "two unrelated failures."**
>    Fixing graph exposed three further *build* failures it had been hiding
>    (multimap, multiset, bimultimap) plus 30 errors in `list/test/`. All are fixed;
>    §6 commit 3 is therefore done and §1's "pre-existing failures" note is stale.
>
> **The `test-random/` suite earned its place immediately** (§5 predicted this):
> it found two defects the set-comparison harnesses could not reach, both now
> fixed and pinned in `packages/graph/test/regression.test.ts` —
> `connectionSize` drifted upwards after `removeNode` on a directed graph (only
> incoming arcs were subtracted, outgoing ones silently ignored), and
> `Builder.forEach` emitted a spurious isolated-node element for every *connected*
> node, disagreeing with `Builder.build().stream()`.

## 9. Definition of done

- `bun run build:seq` passes all 23 packages (currently aborts at 16).
- `bun run typecheck:seq` clean.
- `bun run biome:check` clean.
- `bun run test` clean — graph contributes 4 passing harnesses and a
  `test:random` suite. ✅
- `bun run test:random` runs graph's suite serially. ✅
- Zero hits for `RMap|RSet|VariantMap|VariantSet|RMapBase|RSetBase|
  VariantMapBase|VariantSetBase` in `packages/graph/src`. ✅
  **Still open:** the legacy `RMap`/`RSet` classes themselves remain in
  `collection-types/src/advanced/{map,set}/base.ts` — that is commit 2 below.
  The `EmptyBase`/`NonEmptyBase` half of this criterion is not met and should not
  be: those symbols now denote the local
  `const EmptyBase = MapCollectionEmpty.WithMixin(...)` aliases that eight
  packages legitimately declare. The criterion meant the *legacy* base classes in
  `collection-types/advanced/common/empty-base.ts`, which only graph still uses.
- Zero hits for the 4 removed method spellings (`hasKey`, `modifyAt`,
  `updateAt`, `addEntry`) against rimbu storage objects in graph's `src/`.
- Zero `defaultContext()` calls.
- No `any` introduced (plan completion criterion 4); the 4 pre-existing leaks
  in §4.1 are gone.
- Per root `AGENTS.md` §6.4, every family is a **named** interface — no ad-hoc
  intersections of `Capability.With*`.
- `.changeset/graph-capabilities-migration.md` written.