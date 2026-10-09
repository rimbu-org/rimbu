# 02 — Prove Capability Composition

**What to build:** Prove that representative List, SortedMap, and OrderedSet normal and `NonEmpty` types compose the proposed capabilities with precise concrete return types and overload behavior.

**Blocked by:** 01 — Establish Redesign Baseline

**Status:** done

- [x] Representative capability bindings compile without runtime implementation migration.
- [x] Indexed, filter, removal, swap, and order-edit return types preserve concrete and `NonEmpty` types.
- [x] Negative indexing, map entry typing, comparator types, fallback inference, and overload order are asserted.
- [x] The spike uses no `any`, broad casts, or `Omit`-based `NonEmpty` reconstruction.

> **Evidence (verified 2026-10-04).** Spike lives at
> `packages/collection-types/docs/blueprint.ts` (382 lines, type-only).
> Note the shipped implementation diverges from the spike in one respect: the
> blueprint puts `_INVARIANT` on each capability's `Api`, whereas the
> implementation puts it on the capability **family** interface
> (`collection-types/src/public/collection.ts:227`, `collection/keyed.ts:420`).
> The `_UPPER_E`-on-family mechanism survived verbatim.
