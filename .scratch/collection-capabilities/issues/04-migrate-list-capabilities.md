# 04 — Migrate List Capabilities

**What to build:** Make every List variant and builder expose the new indexed vocabulary and semantics, including precise `NonEmpty` behavior, `swapAt`, validated numeric operations, and immutable no-op identity guarantees.

**Blocked by:** 03 — Build Collection Capability Foundation

**Status:** ready-for-agent

- [ ] All List variants compose Collection, Indexed, Filterable, RemovableAt, and SwappableAt capabilities.
- [ ] List and builder names use `size`, `setAt`, `insertAt`, `removeAt`, and `streamSlice` as specified.
- [ ] Positional slicing no longer accepts reversed collection output; reverse projections remain stream behavior.
- [ ] Negative indices, invalid values, amounts, ranges, and no-op edits follow the shared contracts.
- [ ] Immutable Lists and builders support `swapAt`.
- [ ] Removed List aliases and method-form `*AndGet` APIs are absent from the public surface.
