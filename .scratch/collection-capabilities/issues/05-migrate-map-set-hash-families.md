# 05 — Migrate Map/Set Families and Hash Collections

**What to build:** Migrate the generic map/set families and HashMap/HashSet to the new capability vocabulary while preserving concrete, `NonEmpty`, `RelatedTo`, `OptLazy`, context, builder, and reducer behavior.

**Blocked by:** 03 — Build Collection Capability Foundation

**Status:** ready-for-agent

- [ ] HashMap and HashSet use MapCollection and SetCollection family types.
- [ ] Map and set method renames and set algebra renames are implemented consistently.
- [ ] Contexts, builders, reducers, fallback inference, and `NonEmpty` behavior remain correct.
- [ ] Shared map/set runtime and type contracts pass for HashMap and HashSet.
- [ ] Direct consumers can begin migrating without requiring legacy generic names in new declarations.
