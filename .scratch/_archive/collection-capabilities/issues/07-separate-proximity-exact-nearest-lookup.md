# 07 — Separate Proximity Exact and Nearest Lookup

**What to build:** Make ProximityMap and its builder distinguish exact-key lookup from distance-based lookup through consistent APIs and documented semantics.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** done

- [x] `get` and `has` perform exact-key lookup.
- [x] `getNearest` provides distance-based lookup explicitly.
- [x] `remove`, `update`, and `modify` remain exact-key operations.
- [x] Immutable and builder lookup behavior is consistent.
- [x] Exact/nearest runtime and type tests pass.

> **Evidence (verified 2026-10-04).** `ProximityMap.Advanced.Family` at
> `packages/proximity/src/public/map.ts:224`, with the `WithMixin` chain in
> `internal/{empty,non-empty}.ts`. `getNearest` is documented as the
> distance-based counterpart at `src/proximity.ts:7` and implemented on the builder
> at `src/internal/builder.ts:189-207`, alongside a `getNearestMatch` variant.
