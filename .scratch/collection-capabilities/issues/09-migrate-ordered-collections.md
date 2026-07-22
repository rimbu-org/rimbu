# 09 — Migrate Ordered Collections

**What to build:** Make every OrderedMap and OrderedSet variant support indexed identity access, synchronized order editing, bulk position options, builder parity, and model-tested immutable semantics.

**Blocked by:** 08 — Migrate Sorted Collections

**Status:** ready-for-agent

- [ ] All Ordered variants compose indexed identity, removal, swapping, order-editing, and reordering capabilities.
- [ ] Positional reads delegate through the indicator SortedMap while preserving dual-map invariants.
- [ ] Set, update, modify, prepend, append, place, move, remove, and swap semantics preserve identity and payload rules.
- [ ] Bulk position options and duplicate-source rules are implemented for ordered maps and sets.
- [ ] Mutable builders mirror the ordered vocabulary and position options.
- [ ] Deterministic boundary tests and randomized model tests pass for every Ordered variant.
