# 07 — Separate Proximity Exact and Nearest Lookup

**What to build:** Make ProximityMap and its builder distinguish exact-key lookup from distance-based lookup through consistent APIs and documented semantics.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** ready-for-agent

- [ ] `get` and `has` perform exact-key lookup.
- [ ] `getNearest` provides distance-based lookup explicitly.
- [ ] `remove`, `update`, and `modify` remain exact-key operations.
- [ ] Immutable and builder lookup behavior is consistent.
- [ ] Exact/nearest runtime and type tests pass.
