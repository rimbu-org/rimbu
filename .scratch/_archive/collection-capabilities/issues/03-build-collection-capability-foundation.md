# 03 — Build Collection Capability Foundation

**What to build:** Add the public collection capabilities, generic map/set families, advanced implementer bases, shared numeric normalization, exports, and contract tests while existing consumers continue to compile.

**Blocked by:** 02 — Prove Capability Composition

**Status:** done

- [x] Public Collection, Indexed, identity, filter, sorted, and indexed-edit capabilities are available.
- [x] MapCollection and SetCollection expose their normal, `NonEmpty`, and `Variant` family types.
- [x] Advanced bases preserve concrete `Self` and `NonEmptySelf` types.
- [x] Numeric normalization validates indices, insertion points, destinations, amounts, and ranges according to the plan.
- [x] Shared runtime and type contract suites pass, including the package build and typecheck.
- [x] Temporary migration aliases do not alter current consumers and are not exposed as final public API.

> **Evidence (verified 2026-10-04).** `packages/collection-types/src/public/` holds the
> capability surface (`collection.ts`, `collection/{keyed,valued,sorted,indexed,…}.ts`,
> `map.ts`, `set.ts`); `src/advanced/` holds the mixin bases and `default*` helpers.
> `collection-types` typechecks and its 18 `test-d` files pass.
> **Doc drift:** `packages/collection-types/AGENTS.md:7-29` still documents the
> pre-capability layout and does not mention `advanced/collection/*`,
> `advanced/collection-base.ts`, `advanced/map-base.ts`, `advanced/set-base.ts`, or
> `src/public/*`. Fix under issue 10.
