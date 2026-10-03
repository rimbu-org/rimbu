# @rimbu/multiset migration plan

Bring `@rimbu/multiset` onto the same capability/Family + one-type-many-contexts shape as
`@rimbu/multimap` and `@rimbu/bimultimap` (both migrated in this series).

Status legend: `[ ]` open · `[x]` done

---

## 0. Current state (measured, 2026-10-03)

| check | result |
|---|---|
| `src` typecheck | 0 errors |
| `bun run test` | 104 pass, 0 fail |
| `bun run test:random` | 46 pass, 0 fail |
| `bun run build` | OK |
| full typecheck | **5 errors**, all in `test-d/multiset-collection.test-d.ts` |
| biome | 0 errors, 32 accepted `noExplicitAny`-style warnings |

Blast radius: **only `@rimbu/core`** depends on `@rimbu/multiset`, via a 3-line wildcard
re-export (`packages/core/src/multiset.ts`). All 101 `HashMultiSet`/`SortedMultiSet`/
`MultiSetCollection` symbol references live inside `packages/multiset` itself. So this is a
low-blast-radius breaking change.

**The 5 typecheck errors are one root cause, and the file is obsolete rather than broken.**
`test-d/multiset-collection.test-d.ts` uses `MultiSetCollection<T, Tp>` as an *interface*; it
is now an `export declare namespace`. TS2709 at :11,:15; TS2694 at :49; TS7006 at :34,:35 is a
knock-on. And the file's premise — "any map can define a concretely typed MultiSet kind with a
one-line alias", asserted via `expectTypeOf<HashMultiSet<number>>().toEqualTypeOf<HashMapMultiSet<number>>()` —
is now true *by construction*, because `HashMultiSet<T>` **is**
`MultiSetCollection.Advanced.Api<T, Collection.Advanced.Types<HashMultiSet.Advanced.Family<T>, T>>`.
Patching the alias to `HashMultiSet` would make the assertion tautological. Rewrite or drop.

## 1. The shape gap (why this is a migration, not a cleanup)

multiset is at roughly the **pre-collapse** stage:

| | multiset (now) | multimap / bimultimap (target) |
|---|---|---|
| variant types | `HashMultiSet`, `SortedMultiSet` are distinct **interfaces** | one `MultiMap<K,V>` / `BiMultiMap<K,V>` |
| variants are | interfaces + `DefaultFactory` consts | **contexts** |
| `typeTag` | per-variant `'HashMultiSet'` / `'SortedMultiSet'` | uniformly `'MultiMap'` / `'BiMultiMap'` |
| backing accessor | `countMap` narrowed to `HashMap<T, number>` per variant | generic `MapCollection<T, number>` |
| `internal/` | already `immutable/{empty,non-empty}.ts` + `builder.ts` | same |

So `internal/` is already migrated (mirrors multimap's layout); what remains is the **public
tier**: the variant types, `typeTag`, and the root const.

## 2. Decisions

Precedent is taken from the two migrations already completed in this series, so these are
settled rather than open:

- **D1 — One `MultiSet<T>` type; `HashMultiSet` / `SortedMultiSet` become contexts.** Big bang,
  no deprecated aliases (matches both prior migrations).
- **D2 — `typeTag` becomes uniformly `'MultiSet'`.** The tag describes the collection, not the
  backing. Consequence, documented not hidden: `toString()` output changes from
  `HashMultiSet(…)` to `MultiSet(…)`.
- **D3 — Drop the per-variant `countMap` narrowing.** `countMap` becomes
  `MapCollection<T, number>` (`MapCollection.NonEmpty<T, number>` when non-empty) on every
  variant. This is the one *visible API loss*: hashed callers lose `HashMap`-typed `countMap`.
  Precedent: multimap deliberately gave up per-variant `keyMap` narrowing for exactly this, and
  it is what made bimultimap typecheck at all. Must be called out in the changeset.
- **D4 — The root `MultiSet` const becomes a working default (hashed) context**, not a
  factory-only object. Precedent: `MultiMap`'s root const is a full default context, as is
  `BiMultiMap`'s. Makes `MultiSet.of(1, 2, 3)` work at the root.
- **D5 — Variant consts become the full `MultiSet.Context<any>`,** not a `Pick`-ed
  `DefaultFactory`. Consistency with bimultimap, where `HashBiMultiMap` is the whole ContextApi.
- **D6 — `MultiSetCollection` stays a namespace** (`Capability.*`, `Advanced.*`). Same role as
  `MultiMapCollection`. Element type stays `T` — no tuple change needed.
- **D7 — `removeAll(value)` stays.** Root `AGENTS.md` §1.1 names it the literal exception to the
  `*Each` rule: it removes all occurrences of *one value*.
- **D8 — Fix `MultiSetCreators.createContext`'s signature.** It currently declares
  `{ countMapContext }` but the implementation destructures `options.typeTag`, so a conforming
  caller yields `typeTag: undefined` at runtime. No caller exists today, which is why it went
  unnoticed. Becomes `createContext<T>(options?: { countMapContext?: … })`, matching the
  variant-level signature.

## 3. Method renames

**None.** multiset has no pre-rename vocabulary left to fix — `intersection` /
`symmetricDifference` were already renamed and released. This is the one migration in the series
that is *purely* structural.

## 4. Steps

- [x] **0** — measure baseline, map blast radius (done, §0)
- [ ] **1** — decide + record the plan (this document)
- [x] **2** — `advanced/multiset-base.ts`: confirm the capability suite is complete for a
      one-type world; add nothing unless a capability is missing. Add
      `MultiSetCollection.Advanced.Family`'s `countMap` slot widening if needed for D3.
- [x] **3** — `public/multiset.ts`: collapse to one `MultiSet<T>`; make the root const a default
      hashed context (D4); fix `createContext` (D8); uniformly `typeTag: 'MultiSet'` (D2).
- [x] **4** — `public/hashed.ts` + `public/sorted.ts`: reduce each to a context const built by
      `MultiSet.createContext({ countMapContext })`, mirroring
      `packages/multimap/src/public/hash-key/hash-value.ts`.
- [x] **5** — `internal/context-factory.ts`: typeTag no longer per-variant; `createDefault`
      signature; `countMap` widening to `MapCollection`.
- [x] **6** — `internal/immutable/{empty,non-empty}.ts` + `internal/builder.ts`: adapt to the
      collapsed `Api`; widen `countMap` return types (D3).
- [x] **7** — `test/`: the runner takes a `MultiSet.Context`, so both variants run unchanged.
      Update `toString` expectations for D2 and `createContext` coverage for D8.
- [x] **8** — `test-d/`: **rewrite** `multiset-collection.test-d.ts` (obsolete, §0). Assert
      invariance instead of a now-tautological variant≡base identity.
- [x] **9** — `test-random/`: confirm both contexts still run.
- [ ] **10** — `packages/core/src/multiset.ts`: verify the wildcard still resolves; no edit
      expected.
- [ ] **11** — `packages/multiset/AGENTS.md`: rewrite for the collapsed shape. Its **layout
      block is currently stale and self-contradictory** — it lists only `internal/base.ts` and
      `internal/context-factory.ts`, while the real tree has `internal/builder.ts` and
      `internal/immutable/{empty,non-empty}.ts`, which its own later section already
      references correctly.
- [ ] **12** — changeset: `major` for `@rimbu/multiset` + `@rimbu/core`, documenting D2
      (`toString`), D3 (`countMap` widening), D5 (`DefaultFactory` → full `Context`).

## 4a. What actually changed (vs. the plan)

Two things differed from the plan once the code was in front of me:

1. **The root type was already collapsed.** `public/multiset.ts` already had a single
   `MultiSet<T>` with `MultiSet.Advanced.Family<T>`; only the *variants* were still
   separate interfaces. So D1 needed no new type — it was a deletion.
2. **`MultiSetContextImpl.createContext` already existed** as an instance property; it just
   was not on `MultiSetCollection.Advanced.ContextApi`. Rather than special-case the root
   const, `createContext` was hoisted onto the shared `ContextApi`, so **every** context has
   it. This also fixed the first attempt, which spread the frozen context instance into an
   object literal and silently lost its prototype methods.

`MultiSetCreators` is kept as a deprecated alias for `MultiSet.Context<any>` so existing
references resolve.

Three `test-d` files were deleted rather than patched:

- `hash-multiset.test-d.ts` and `sorted-multiset.test-d.ts` were **strict subsets** of
  `multiset.test-d.ts` (diffing the assertion groups: identical except the generic file also
  has `.intersection`). Their only unique content was the variant *types*, which no longer
  exist. Replaced by `contexts.test-d.ts`, which tests the genuinely new factory dimension.
- `multiset-collection.test-d.ts` was obsolete per §0 — its variant≡base identity assertion is
  now true by construction, so repairing the alias would have made it tautological.

## 5. Risks

- **D3 is the one that can surprise callers.** `HashMultiSet<T>['countMap']` stops being a
  `HashMap`. Anyone reaching for `HashMap`-specific members on it breaks. Mitigation: name it
  first in the changeset, and check `core` (the only consumer) does not rely on it — it does
  not, being a wildcard re-export.
- **D2 changes `toString()` output**, which tests may assert. Expected and intended.
- **D8 fixes a latent runtime bug** (`typeTag: undefined`). If any test snapshots a
  `createContext`-produced collection's `toString()`, it will change from `undefined(…)` to
  `MultiSet(…)`. That is the fix landing, not a regression.
- The `_FAM` / `_NEW_FAMILY` slots are load-bearing in the `DefaultFactory` → `Context`
  transition (D5); check they resolve before assuming the wildcard collapse is enough.

## 6. Explicitly not this change

- The `countMap`-backed representation itself. `MapCollection<T, number>` remains the storage.
- `removeAll` / `removeEach` semantics (D7).
- Adding `*AndReturn` variants — deferred across the whole series.
- Any rename of existing methods (§3: there are none).
