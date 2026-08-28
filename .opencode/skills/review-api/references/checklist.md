# Review-API Checklist

Source: `AGENTS.md:16-31` §1.1, `AGENTS.md:287-478` §6, `spec.md:2.7` Q9, ticket `04`. Severity per Q9: (a)(b)(c)(d)(g)=`error`, (e)(f)=`warn`. Every finding must cite `AGENTS.md` §.

## (a) Consistent Naming — `AGENTS.md:20` §1.1

Same concept uses same name everywhere; never use synonyms.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `naming-consistent` | error | Public methods use canonical names `filter`/`map`/`flatMap`/`take`/`drop`/`takeWhile`/`dropWhile`/`flatMap` etc. across packages | `rg -n "filter\(|map\(|flatMap|take\(|drop\(" src/public --no-heading` | Rename to canonical name |
| `naming-synonym` | error | No synonyms `select`/`where`/`filterBy`/`collect`/`choose` for same concept appear as public methods | `rg -n "select\(|where\(|filterBy|collect\(" src/public` | Replace with `filter`/`map` |

Canonical list (non-exhaustive): `filter`, `map`, `flatMap`, `take`, `takeWhile`, `drop`, `dropWhile`, `slice`, `at`, `get`, `has`, `set`, `remove`, `update`, `forEach`, `reduce`, `stream`, `toArray`, `size`, `isEmpty`, `nonEmpty`, `assumeNonEmpty`.

## (b) Math-Index Contract — `AGENTS.md:21-25` §1.1

Non-negative count from start (0-based); negative count from end as `Array.at()` (`-1` = last). `Stream`/`AsyncStream` are exception: `at(-1)` returns fallback, use `last()`.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `math-index-negative` | error | Non-Stream collections document `-1` = last and handle `index < 0 ? size+index` | `rg -n "index.*<.*0|size \+ index" src/internal` + `src/public` JSDoc | Implement negative handling per `List` |
| `stream-at-negative` | error | `Stream`/`AsyncStream` `at(-1)` must return `otherwise`/`undefined`, not last element (check impl does NOT count from end) | `rg -n "at\(.*otherwise|Stream.*at" src/internal/stream --no-heading` | Return fallback for `index < 0` |
| `stream-no-negative` | error | `Stream` public JSDoc states `at(-1)` returns fallback, not last, and suggests `last()` | `rg -n "at\(-1\)|last\(\)" src/public/stream --no-heading` | Document exception per §1.1 |

## (c) OptLazy Overload Pair — `AGENTS.md:354-373` §6.3

Any method that may return `undefined` when empty provides eager/lazy fallback.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `optlazy-pair` | error | For each method with `): V \| undefined` or `): T \| undefined`, there is a sibling overload ` (..., otherwise: OptLazy<O>): V \| O` | `rg -n "\| undefined|OptLazy" src/public --no-heading` pairwise check per method | Add `OptLazy<O>` overload |
| `optlazy-both` | error | Both overloads present: without fallback and with `otherwise` | Same | Provide both |

Typical methods: `get`, `find`, `first`, `last`, `at`, `getAt`, `findEntry`, `getValue`.

## (d) NonEmpty Overload Order — `AGENTS.md:29-30` §1.1

When `NonEmpty` variant has two overloads (one returning `normal`, one `nonEmpty`), the `nonEmpty` overload must be **first**.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `nonempty-overload-order` | error | In `interface NonEmpty`, for methods with `StreamSource.NonEmpty` and `StreamSource`, the `NonEmpty` overload is declared first (TS picks first match) | `rg -n "StreamSource\.NonEmpty|StreamSource" src/public --no-heading` order check | Move `NonEmpty` overload first |
| `nonempty-return` | error | Methods that provably return non-empty (e.g. `prepend`, `append`, `concat` on `NonEmpty` source) encode `NonEmpty` in return type | `rg -n "NonEmpty" src/public --no-heading` | Return `NonEmpty` variant |

Applies to `List.NonEmpty`, `HashMap.NonEmpty`, `SortedMap.NonEmpty`, etc.; especially `transform` per example.

## (e) HKT Types Slot — `AGENTS.md:375-398` §6.4

Abstract bases preserve concrete return types via `Types` interface.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `hkt-types-slot` | warn | Concrete collection has `interface Types extends RMapBase.Types { readonly normal: Concrete<...>; readonly nonEmpty: Concrete.NonEmpty<...> }` (or `RSetBase`, `RMapBase` etc.) | `rg -n "interface Types extends.*RMapBase|RSetBase|RMapBase" src/public --no-heading` | Add `Types` slot |
| `hkt-normal-nonempty` | warn | `Types` contains both `normal` and `nonEmpty` slots | Same | Add missing slot |

If modifying abstract base, check all concretes still satisfy constraints.

## (f) Module Pattern — `AGENTS.md:467-476` §6.7

Factory objects are sealed via `Module`.

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `module-pattern` | warn | Value export uses `create...ContextModule().build()` (e.g. `createHashMapContextModule().build()`) | `rg -n "create.*ContextModule\(\)\.build\(\)" src --no-heading` | Use `Module` helper |
| `module-not-direct` | warn | Not directly constructing factory object via `new` or plain object | Same | Use `Module` |

## (g) Tier Leakage — `AGENTS.md:104-113` §3

Three tiers: `public` (`"./*"`), `advanced` (`"./advanced/*"`), `internal` (`#<pkg>/*` never exported).

| Rule | Severity | Check | Evidence | Fix |
|---|---|---|---|---|
| `tier-no-internal-export` | error | `src/public/` never imports from `src/internal/` via relative path; `exports` never contains `internal` | `rg -n "internal" src/public --no-heading` + `package.json:exports` vs `review-anatomy` | Move to `advanced` if needed |
| `tier-advanced-reexport` | error | `src/advanced/` only re-exports via `from '#<pkg>/*'` (never `../internal`) and implementation stays in `internal` | `rg -n "from '#.*'|from \"#.*\"" src/advanced --no-heading` | Re-export via `#` alias |
| `tier-public-clean` | error | `src/public/` does not contain implementation logic; it re-exports types + delegates to `internal` | `rg -n "class.*Impl|function.*Impl" src/public --no-heading` | Move impl to `internal` |

All findings use `rg` evidence, `file:line` location, and `AGENTS.md` normative ref. Use `API_SURFACE.md:1-10` aggregate (784 entities) as supplemental evidence when present.
