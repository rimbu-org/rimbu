# Plan: Migrate `@rimbu/bimultimap` to the capability/Family style

**Goal:** bring `packages/bimultimap` to the same capability/Family architecture as
`packages/multimap`, `packages/bimap` and `packages/multiset` — one `BiMultiMap<K, V>` type
closed over its own `Advanced.Family`, built on `@rimbu/collection-types` capabilities plus
a package-local `BiMultiMapCollection.Capability` suite in a new `advanced/` tier.

**Reference (already migrated):** `packages/multimap`, `packages/bimap`.

**Scope:** `@rimbu/bimultimap` only, plus one fix in `@rimbu/collection-types`.
`bimultimap` has **zero internal consumers** — only `@rimbu/core` re-exports it — so nothing
else can break. `graph` and `table` remain independent legacy packages, out of scope.

**Hard switch:** big bang, no aliases, no deprecation shims. `major` changeset, folded into
the **same lockstep major** as the unreleased multimap changeset so these renames cost
nothing extra.

---

## 0. Ordering — the bug fixes come first

An audit found **three live defects**, and a fourth surfaced while writing the harness.
They are shipped bugs independent of this migration, and they set the critical path: the
fixes are worth landing on their own merits regardless of whether the migration happens.

| # | Bug | Status |
|---|---|---|
| B1 | `removeValue` (singular) passes the **unpruned** reverse map — `immutable.ts:272` uses `this.valueKeyMultiMap` where the pruned `collection` belongs | Regression from `9d725a47f` ("refactor: add capabilities", 2026-10-01) |
| B2 | `hasEntry` is a **cross-product** test — `hasKey(k) && hasValue(v)` | Long-standing; unchanged since earliest history |
| B3 | `Builder.forEach` `_lock` leak — no `try`/`finally` | Long-standing |
| B4 | `setValues`/`setKeys` **throw** when the operation empties the collection | Found 2026-10-02 while writing `test-random` |

**B1 detail.** `removeValue` and `removeValues` now *disagree* on the reverse map:

```ts
const m = BiMultiMap.of([1,'a'], [1,'b'], [2,'a'], [2,'b']);
m.removeValue('b').hasValue('b');         // true  — wrong
m.removeValues(['b']).hasValue('b');      // false — right
```

The forward map is pruned correctly; the reverse map keeps every stale entry. The corruption
is **sticky** (`filter`, `from`, `toBuilder().build()` all pass it through; `setValues`
cannot heal it), desyncs `keyValueMultiMap.size` from `valueKeyMultiMap.size`, and can
**throw** — chaining `.removeValue('a')` on the result reaches mismatched emptiness guards
and raises "empty collection was assumed to be non-empty". `removeKey`, its exact mirror
image, is correct.

**Why it survived:** `expectEqual` in the existing suite compares only forward `stream()`,
and the reverse map is asserted solely via `.context` identity. No test checks
reverse-consistency.

**B2 detail.** `BiMultiMap.of([1,'a'], [2,'b']).hasEntry(1, 'b')` returns `true`. The
builder's copy is correct only when `source === undefined`; with a source it delegates to
the buggy immutable method.

**B3 detail.** Any throwing callback strands `_lock === 1` permanently; every mutator then
throws `ModifiedBuilderWhileLoopingOverItError`.

**B4 detail.** `immutable.ts:212`/`:218` route `setValues`/`setKeys` through
`builder.build().assumeNonEmpty()`, so emptying the collection throws. The declared overloads
already return `normal` for a possibly-empty source — the type is right, the runtime is wrong.
`removeKey` guards the same case correctly, so the asymmetry is internal:

```ts
BiMultiMap.of([1, 'a']).setValues(1, []).isEmpty  // throws
BiMultiMap.of([1, 'a']).setKeys('a', []).isEmpty    // throws
BiMultiMap.of([1, 'a']).removeKey(1).isEmpty       // true — correct
```

Same class as B1: a method that is *allowed* to empty the collection assumes it cannot.

### Commit sequence

1. `test-d` + `test-random` — **red**, four named failures
2. fix B1 (`removeValue`)
3. fix B2 (`hasEntry`)
4. fix B3 (`_lock` try/finally)
5. fix B4 (`setValues`/`setKeys` empty case)
6. collection-types: implement the `WithRemoveKeys` collector overload
7. migrate `bimultimap`
8. `packages/bimultimap/AGENTS.md` + extend the existing changeset

Step 1 lands red on purpose: the bugs are runtime defects, so `test-random` is what fails,
and its failing on arrival is the proof the harness works. `test-d` targets
*name-independent* invariants (NonEmpty in both directions, `RelatedTo` inference, factory
overload order, `of` literal inference) so most of it survives step 7 and only method names
change.

### Harness validation

The differential harness maintains a forward *and* a reverse model, asserts they are mutual
inverses, and compares both against the collection's two internal maps after every
operation. It reproduces the audit's verdict independently, including the singular/plural
split: `removeValues` (plural) passes while `removeValue` (singular) fails. Per-op results
against `HashBiMultiMap` and `SortedBiMultiMap`:

| passing | failing |
|---|---|
| `add`, `removeEntry`, `removeKey`, `removeValues`, `setValues`, `setKeys` | `removeValue`, `mixed` |

plus the five named regression tests (`B1`, `B1b`, `B2`, `B3`, `B4`). 12 pass / 14 fail per
context, with no spurious failures.

---

## 1. Settled decisions

| # | Decision |
|---|---|
| Q1 | **One `BiMultiMap<K,V>` type.** `HashBiMultiMap`/`SortedBiMultiMap` become `BiMultiMap.Context` constants. `typeTag` uniformly `'BiMultiMap'`. |
| Q2 | **`getValues` / `getKeys`** — symmetric, deviating from bimap's `get`/`getKey`. |
| Q3 | **`setEachValue` / `setEachKey`**, plus new **`modifyValuesAt` / `modifyKeysAt`**. No `updateAtKey`/`updateAtValue`. |
| Q4 | **Element type `readonly [K, V]`** everywhere. |
| Q5 | **Drop `toJSON`** (untested, mistyped empty impl). |
| Q6 | **`test-d` + `test-random` first**, landing red. |
| Q7 | **Fix all three bugs**, own commits, before migrating. |
| Q8 | **Keep `keyValueMultiMap` / `valueKeyMultiMap`** names. |
| Q9 | Builder `removeKey`/`removeValue` return the removed `SetCollection`. Fix the `WithRemoveKeys` collector overload upstream first. |
| Q10 | **Defer** `*AndReturn` side-results to a follow-up. |
| Q11 | **Adopt `invert()`** — new API, `BiMultiMap<V, K>`. |
| Q12 | **Do not claim `merge*`** on the context (follow bimap). |
| Q13 | **Adopt the full keyed capability set** — big bang, no legacy concerns. |
| Q14 | **Two named contexts** + `createContext` for asymmetric backings. **Drop `defaultContext()`.** |
| Q15 | Method table confirmed as derived below. |

---

## 2. Method table

### Renamed

| before | after | source of truth |
|---|---|---|
| `hasKey` | `has` | multimap, bimap key direction |
| `add(key, value)` | `addTo(key, value)` | multimap |
| `addEntries` | `addEach` | multimap |
| `setValues` | `setEachValue` | Q3 |
| `setKeys` | `setEachKey` | Q3 |
| `valuesAt` | `getValues` | Q2 |
| `keysAt` | `getKeys` | Q2 |
| `forEach` (3-param) | `forEachIndexed` | multimap |
| `filter` (3-param) | `filterIndexed` | multimap |
| `defaultContext()` | dropped | Q14 |

### Unchanged

`hasValue`, `hasEntry`, `removeKey`, `removeKeys`, `removeValue`, `removeValues`,
`removeEntry`, `removeEntries`, `toArray`, `stream`, `streamKeys`, `streamValues`,
`toBuilder`, `toString`, `size`, `keySize`, `isEmpty`, `nonEmpty`, `assumeNonEmpty`,
`asNormal`, `reducer`, `createContext`, `keyValueMultiMap`, `valueKeyMultiMap`.

### New

`modifyValuesAt`, `modifyKeysAt`, `invert`, `map`, `mapIndexed`, `flatMap`,
`flatMapIndexed`, `mutate`, `filter` (1-parameter + type guards).

### Removed

`toJSON`.

### Behaviour changes

- `Builder.removeKey` returns `SetCollection<V>`, `Builder.removeValue` returns
  `SetCollection<K>` (was `boolean`). Empty set = absent.
- `hasEntry` becomes a true association test (B2).
- `removeValue` stops corrupting the reverse map (B1).

---

## 3. Deliberate deviations from bimap

Each needs a written rationale in `packages/bimultimap/AGENTS.md`.

| deviation | reason |
|---|---|
| `getValues`/`getKeys`, not `get`/`getKey` | `get` returning a set was already rejected when multimap refused `WithGet`. Two set-valued directions, neither primary. |
| `keyValueMultiMap`/`valueKeyMultiMap`, not `keyValueMap`/`valueKeyMap` | the `MultiMap` suffix names the representation honestly; the type is visible in the signature anyway. |
| no `merge*` on context | bimap's documented refusal (its `_UPPER_E` narrowing makes the `WithMerge` return types unsatisfiable). multimap's looser adoption has an implementation that ignores its own callback. |
| `modifyValuesAt`/`modifyKeysAt`, not `updateAtKey`/`updateAtValue`/`modifyAtValue` | single-value ops do not survive sets. |
| two named contexts, not four | naming four needs a `<DirABacking×DirBBacking>` convention that exists nowhere else; asymmetric stays reachable via `createContext`. |

---

## 4. Architecture notes

- New `advanced/*` export tier hosting `BiMultiMapCollection.Capability` and
  `Advanced.{Api,BuilderApi,ContextApi,FamilyBase,Family}`. bimap and multimap both have one.
- Six variant HKT slots (`keyMultiMapValues`, `valueMultiMapValues`,
  `keyValueMultiMapNonEmpty`, `valueKeyMultiMapNonEmpty`, `keyValueMultiMap`,
  `valueKeyMultiMap`) collapse to the four multimap kept. This is what forces
  `getValues` → generic `SetCollection<V>` instead of `HashSet<V>`.
- **`NonEmpty` is forced in both directions:** any entry implies a non-empty forward *and*
  reverse map, so `keyValueMultiMap`/`valueKeyMultiMap` both narrow to `MultiMap.NonEmpty`.
- Adopts `_REMOVED_AT_KEY` / `_FOUND_AT_KEY` from the multimap change, pinned to
  `SetCollection<V>` / `SetCollection<K>`.
- The builder's two lazy getters (`builder.ts:25-51`) contain a **byte-identical duplicated
  body**, each assigning a field it does not guard. Correct today only because every write
  sets both fields. The migration rewrites the builder anyway — collapse to one initializer.
- `Builder.add` (`builder.ts:122-124`) gates on the forward add and returns the reverse
  add's boolean. Sound only under the inverse invariant; keep, but the harness now checks it.

---

## 5. Risks

- **The migration could silently "fix" B1 or B2** by routing singular ops through the
  builder. That is a behaviour change and must be called out in the changeset, not filed as
  refactoring noise.
- `map` on a bidirectional collection can rewrite both `K` and `V`. No collisions to resolve
  (neither direction is 1-to-1), so this is mechanically simpler than bimap's
  `mapValues`, which needed a last-iterated-wins policy.
- `getValues` returning generic `SetCollection<V>` loses per-variant narrowing. Accepted,
  matching multimap.

---

## 6. Explicitly not this change

- `removeKeyAndReturn` / `removeValueAndReturn` and other `*AndReturn` side-results (Q10).
- Root `AGENTS.md` §11 still claims the repo typechecks clean. That was false at HEAD for
  five packages (`deep`, `list`, `multiset`, `table`, `graph`) and is still false. Worth
  correcting separately.
