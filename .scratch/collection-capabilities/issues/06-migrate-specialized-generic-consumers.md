# 06 — Migrate Specialized Generic Consumers

**What to build:** Update specialized collection packages that depend on the generic map/set families so they compile and test against MapCollection and SetCollection without claiming unsupported capabilities.

**Blocked by:** 05 — Migrate Map/Set Families and Hash Collections

**Status:** ready-for-agent

- [ ] BiMap, BiMultiMap, MultiMap, MultiSet, Table, and Graph use the new generic family names.
- [ ] Their existing supported behavior and type-level contracts remain intact.
- [ ] No specialized collection claims a capability that has not passed its semantic audit.
- [ ] Package and repository builds find no stale generic map/set type references in these consumers.
