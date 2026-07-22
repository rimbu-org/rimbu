# 08 — Migrate Sorted Collections

**What to build:** Make SortedMap and SortedSet compose indexed, sorted, identity, filter, and removal capabilities with unified positional and comparator-range APIs.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** ready-for-agent

- [ ] SortedMap and SortedSet expose the unified indexed and sorted capability contracts.
- [ ] Positional, comparator-range, neighbor, endpoint, and identity lookup names use the target API.
- [ ] `comp` is available on collection instances and concrete comparator types are preserved.
- [ ] `removeAt` uses order-statistic access and identity removal with correct no-op behavior.
- [ ] Negative indexing, ranges, `NonEmpty` returns, and complexity paths have runtime and type coverage.
- [ ] Removed sorted aliases and min/max projection APIs are absent from the public surface.
