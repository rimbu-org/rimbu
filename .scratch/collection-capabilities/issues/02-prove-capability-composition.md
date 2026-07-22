# 02 — Prove Capability Composition

**What to build:** Prove that representative List, SortedMap, and OrderedSet normal and `NonEmpty` types compose the proposed capabilities with precise concrete return types and overload behavior.

**Blocked by:** 01 — Establish Redesign Baseline

**Status:** ready-for-agent

- [ ] Representative capability bindings compile without runtime implementation migration.
- [ ] Indexed, filter, removal, swap, and order-edit return types preserve concrete and `NonEmpty` types.
- [ ] Negative indexing, map entry typing, comparator types, fallback inference, and overload order are asserted.
- [ ] The spike uses no `any`, broad casts, or `Omit`-based `NonEmpty` reconstruction.
