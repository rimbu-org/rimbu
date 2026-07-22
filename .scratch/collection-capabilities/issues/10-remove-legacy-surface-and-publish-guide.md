# 10 — Remove Legacy Surface and Publish Migration Guide

**What to build:** Complete the public API redesign by removing temporary aliases, updating exports and documentation, and publishing the migration guidance and major release changeset.

**Blocked by:** 04 — Migrate List Capabilities; 06 — Migrate Specialized Generic Consumers; 07 — Separate Proximity Exact and Nearest Lookup; 08 — Migrate Sorted Collections; 09 — Migrate Ordered Collections

**Status:** ready-for-agent

- [ ] Temporary generic and method aliases are removed from source, tests, and emitted declarations.
- [ ] Core exports, examples, comments, package guides, and capability matrix use the target vocabulary.
- [ ] The migration guide covers List, Map, Sorted, Set algebra, Ordered reordering, and Proximity lookup changes.
- [ ] A major changeset describes the breaking redesign and migration mappings.
- [ ] Repository-wide build, typecheck, Biome, and test commands pass.
- [ ] No deprecated public names remain in the final emitted declarations.
