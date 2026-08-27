# Report Template — Shared across all rimbu health skills

Reference: `.scratch/rimbu-health-skills/spec.md:2.8` (Q8). All skills — diagnose or fix — must emit markdown that matches this skeleton. The template is harness-independent (plain markdown, no JSON v1).

## Skeleton

Every report is stdout markdown by default; when invoked with `--out <path>` the identical markdown is also written to that path (convention: `.scratch/reports/<skill>/<pkg>.md` per Q8). Never write outside the repo root and `/tmp` (`AGENTS.md:601-625`).

Required sections in order:

```markdown
# <skill> — <pkg>

## Summary

One paragraph describing the overall health for this concern.
Counts by severity: **X error, Y warn, Z info** (always include the counts, even when zero).
State whether the package is clean for this concern or requires follow-up.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|
| error | no-relative-imports | packages/hashed/src/internal/map/immutable.ts:12 | `import { foo } from '../foo'` | Use `#hashed/foo` per AGENTS.md:138-152 | AGENTS.md:138-152 §3 |
| warn | missing-jsdoc | packages/stream/src/stream.ts:88 | `export function of<T>(...` has no JSDoc | Add `/** ... @example ... */` | AGENTS.md:546-573 §9 |
| info | missing-test-random | packages/list/test-random: — | No `test-random/` suite | Consider property tests if package already has `test-random` infra | AGENTS.md:213-224 §4 |

If there are no findings, include a single row: `| — | — | — | No findings | — | — |` or omit the table body but keep the header.

## Next actions

- Bullet list of concrete follow-ups (e.g. `run with --fix`, `propose ADR for X`, `re-run after patch`).
- If no findings: single bullet `No action required — package is clean for <skill>.`
```

## Field definitions

- **Severity** — one of `error` / `warn` / `info` (Q8/Q9):
  - `error` — contract break that must be fixed before merge. Examples: `review-api` naming/index/`OptLazy`/`NonEmpty` order/tier leakage (`AGENTS.md:16-31` §1.1, `AGENTS.md:29-30`), `review-anatomy` shape violation (`AGENTS.md:76-284` §3-5, `biome.json:27-35`), broken `docs:verify-examples` example (`review-docs`).
  - `warn` — should fix, not blocking. Examples: HKT `Types` nuance (`AGENTS.md:375-398` §6.4), `Module` sealing (`AGENTS.md:467-476` §6.7), `any`/`!`/`console` in impl (`biome.json:15-44`), potential dead code (`scout-dead-code`), missing JSDoc (`review-docs`).
  - `info` — advisory. Examples: `test-random` gap (`audit-tests`), arch opportunity (`scout-improvements`).
- **Rule** — kebab-case rule id, stable across invocations (e.g. `no-relative-imports`, `optlazy-pair-missing`, `nonempty-overload-order`, `hkt-types-slot`, `unused-export`).
- **Location** — `file:line` (e.g. `packages/hashed/src/hashmap.ts:42`) or `package: <name>` / `package: <path>` for package-level findings. Always use repo-relative paths.
- **Evidence** — verbatim snippet from `rg`/`biome`/`tsc`/`docs:verify-examples` output, or the offending source line. Keep it under ~120 chars; quote with backticks.
- **Suggested fix** — one-line patch hint (e.g. `Replace '../foo' with '#pkg/foo'`, `Add OptLazy overload: get(key, otherwise)`, `Move NonEmpty overload first`).
- **Normative ref** — `AGENTS.md:XX-YY §Z` or `docs/adr/NNNN` only (spec §2.5, Q5). Do not cite skill checklists as normative.

## Location conventions

- Always repo-relative: `packages/<name>/...` not absolute.
- For multi-file findings, one row per location; do not collapse.
- For cross-package `--workspace` sweeps, include package prefix in `Location` (e.g. `packages/stream/src/stream.ts:120`).

## Severity contract per skill (Q9)

- `review-api`: (a) naming, (b) math indices, (c) `OptLazy` pair, (d) `NonEmpty` overload order, (g) tier leakage = `error`; (e) HKT `Types`, (f) `Module` = `warn`.
- Other skills define their mapping in `references/checklist.md`; default to `warn` for potential dead code, `info` for advisory gaps.

## Output location

- **Default:** stdout markdown only (safe for agent auto-invoke, Q6).
- **With `--out <path>`:** write identical markdown to `<path>` (create parent dirs if needed). Recommended convention: `.scratch/reports/<skill>/<pkg>.md` for human inspection; `.scratch/reports/<skill>/workspace.md` for workspace sweeps. Do not write elsewhere without explicit user path.

## Minimal valid report (no findings)

```markdown
# review-anatomy — packages/stream

## Summary

Package is clean for anatomy. Counts: 0 error, 0 warn, 0 info.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|
| — | — | — | No findings | — | — |

## Next actions

- No action required — package is clean for review-anatomy.
```

## Example with findings

```markdown
# review-api — packages/hashed

## Summary

Found 2 issues in public API surface. Counts: 1 error, 1 warn, 0 info. Requires fix before merge for the error.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|
| error | nonempty-overload-order | packages/hashed/src/hashmap.ts:120 | `get(k): V | undefined` before `get(k, otherwise)` | Move `StreamSource.NonEmpty` overload first | AGENTS.md:29-30 §1.1 |
| warn | hkt-types-slot | packages/hashed/src/hashmap.ts:45 | `Types` missing `nonEmpty` slot | Add `readonly nonEmpty: HashMap.NonEmpty<this['_K'], this['_V']>` | AGENTS.md:375-398 §6.4 |

## Next actions

- Fix the `error` (move overload) and re-run `review-api -- packages/hashed`.
- Consider the `warn` for the next minor; propose an ADR if the slot is intentionally omitted.
```
