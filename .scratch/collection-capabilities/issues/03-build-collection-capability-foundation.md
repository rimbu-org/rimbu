# 03 — Build Collection Capability Foundation

**What to build:** Add the public collection capabilities, generic map/set families, advanced implementer bases, shared numeric normalization, exports, and contract tests while existing consumers continue to compile.

**Blocked by:** 02 — Prove Capability Composition

**Status:** ready-for-agent

- [ ] Public Collection, Indexed, identity, filter, sorted, and indexed-edit capabilities are available.
- [ ] MapCollection and SetCollection expose their normal, `NonEmpty`, and `Variant` family types.
- [ ] Advanced bases preserve concrete `Self` and `NonEmptySelf` types.
- [ ] Numeric normalization validates indices, insertion points, destinations, amounts, and ranges according to the plan.
- [ ] Shared runtime and type contract suites pass, including the package build and typecheck.
- [ ] Temporary migration aliases do not alter current consumers and are not exposed as final public API.
