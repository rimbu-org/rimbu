---
name: maintain-skills
description: Lints all repo-health skills against the template, aggregates suite reports, and reconciles checklist drift with AGENTS.md/ADRs
disable-model-invocation: false
---

# Maintain-Skills — Caretaker & Orchestrator

Meta skill for the rimbu health suite. It is the only skill that may propose `AGENTS.md` or `docs/adr/` patches and the only one that aggregates the whole suite into one report.

## Purpose

Owns the **coherence** of the 12 repo-health skills. In **diagnose mode** it lints every `.opencode/skills/*/SKILL.md` against `../_template/SKILL.md` and `../_template/references/report-template.md`, checks that `## Normative refs` cite only `AGENTS.md` and `docs/adr/`, and that `## Output contract` references the shared report template. In **orchestrator mode** it runs all Wave 1 (+ optionally Wave 2) skills in dependency order on a given `<pkg>` and emits an aggregated report. In **fix mode** (`--fix`) it auto-patches missing frontmatter/sections to match the template. Scope is repository-wide for linting, single-package-scoped (`<pkg>`) for orchestration; `--workspace` sweep is optional. This skill is **hybrid** (diagnose by default, fix with `--fix`).

## Normative refs

- `AGENTS.md:626-638` Agent skills (issue tracker, triage labels, domain docs)
- `AGENTS.md:1-638` full normative source (wins over skill checklists per spec §2.5, Q5)
- `AGENTS.md:138-152` import rule (enforced via lint)
- `AGENTS.md:601-625` sandbox (`/tmp` + repo root)
- `docs/agents/issue-tracker.md:1-30` local markdown tracker conventions
- `docs/agents/triage-labels.md:1-15` label mapping
- `docs/agents/domain.md:1-36` `CONTEXT.md`/`docs/adr/` single-context repo
- `docs/adr/<nnnn>-*.md` — any ADR this caretaker implements; if `docs/adr/` does not exist, proceed silently per `docs/agents/domain.md:11-12` and note the gap in the report

No other sources are normative. If a skill enforces a rule absent from `AGENTS.md`/ADR, this caretaker emits a `warn` proposing a patch instead of silently enforcing.

## When to use

> When you edit `AGENTS.md`, add a new skill, touch `.opencode/skills/_template/`, suspect checklist drift, or want the whole health suite aggregated for a package, invoke `maintain-skills` in diagnose mode.

Additional triggers:
- After any §1.1/§3/§6 change — run `maintain-skills -- --lint` to ensure all skills still match `AGENTS.md`
- Before publishing a release — run `maintain-skills -- packages/<pkg>` to get the rolled-up Wave 1 report
- When a skill reports a finding that has no `AGENTS.md` § — this caretaker triages whether to open an ADR

## Procedure

### Diagnose (read-only, default)

1. **Lint all skills** — discover every `.opencode/skills/*/SKILL.md` except `_template` itself (but include `_template` as the baseline). For each skill invoke the validator from `../_template/scripts/validate.ts` (`validateSkill`) and collect `Errors`/`Warnings`:
   - Frontmatter must have `name`, `description`, `disable-model-invocation` (kebab-case for `name`)
   - Required headings `## Purpose`, `## Normative refs`, `## When to use`, `## Procedure`, `## Output contract`, `## Examples` must be present; `## Procedure` must contain `### Diagnose` and (optionally) `### Fix`
   - `## Output contract` must reference `../_template/references/report-template.md` (spec §2.8)
   - `## Normative refs` must cite at least one `AGENTS.md` § and must not cite checklist as normative (Q5)
   - Shared report template `../_template/references/report-template.md` must exist
2. **Drift check** — for each skill, scan `## Normative refs` and finding `Rule` ids: if a rule has no `AGENTS.md:XX-YY` or `docs/adr/NNNN` citation, emit a `warn` with `Suggested fix: Propose ADR or AGENTS.md patch` (Q5). Cite `AGENTS.md:626-638` and `docs/agents/*.md` as evidence.
3. **Report-contract adherence** — verify that each skill's `## Output contract` matches the skeleton in `../_template/references/report-template.md` (`# <skill> — <pkg>` → `## Summary` → `## Findings` table → `## Next actions`) and that severity `error`/`warn`/`info` and `--out` convention are documented (Q8).
4. **Orchestrator (when `<pkg>` given)** — resolve target package (`packages/stream` default if lint-only mode with no pkg). In dependency order (`_template` → Wave 1 `review-anatomy`/`review-api`/`scout-dead-code`/`audit-tests`/`audit-type-tests` → Wave 2 → `scout-improvements`), attempt to invoke each skill's `scripts/run.ts` if it exists; if not yet implemented, record `info` finding `skill-not-yet-implemented`. Aggregate all findings into one rolled-up table sorted by `Severity` (`error` first) then `Skill`.
5. Emit the report per **Output contract** to **stdout**; if `--out <path>` given, also write identical markdown to that path (convention `.scratch/reports/maintain-skills/<pkg>.md`). Be idempotent and safe to re-run (Q6). Never write outside repo root and `/tmp`.

### Fix (opt-in, `--fix` / `--force`)

1. Require explicit `--fix`. Without it, refuse to mutate and emit diagnose report instead.
2. For each skill that failed lint, auto-patch:
   - Missing frontmatter fields — insert `name: <dir>` (kebab-case), `description: TODO`, `disable-model-invocation: false` if absent
   - Missing headings — append the heading from `../_template/SKILL.md` with a `TODO` placeholder body
   - `## Output contract` missing `report-template.md` reference — insert link to `../_template/references/report-template.md`
   - `references/report-template.md` link drift — normalize to `../_template/references/report-template.md`
   - Do not overwrite existing prose without `--force`; with `--force`, replace the whole section from `_template`
3. Post-check: re-run `validateSkill` on each patched file and report `pass`/`fail` in the findings.
4. Re-emit the aggregated report with updated counts to stdout and optionally `--out`.

## Output contract

Conforms to `../_template/references/report-template.md` (spec §2.8).

Required structure for this skill:

```markdown
# maintain-skills — <target>

## Summary

Linted N skills; M error, W warn, I info. For orchestrator mode, also aggregate Wave 1 findings for <pkg>. State whether the skill suite is coherent.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|

## Next actions

- Bullet list: fix `--fix` candidates, propose ADRs, re-run after patch. If no findings: `No action required — skill suite is coherent.`
```

Severity for this caretaker:

- `error` — missing required heading/frontmatter, `## Output contract` not referencing shared template, or orchestrator cannot locate `AGENTS.md`
- `warn` — `## Normative refs` missing `AGENTS.md` § citation, checklist cited as normative (drift), or skill not yet implemented (info promoted to warn if Wave 1)
- `info` — pending Wave 2 skill not yet implemented, or `docs/adr/` gap noted per `docs/agents/domain.md:11-12`

Location: `file:line` for skill file findings, `package: <pkg>` or `skill: <name>` for aggregated findings. Output to stdout by default; with `--out .scratch/reports/maintain-skills/<pkg>.md` also write there (Q8).

## Examples

```bash
# Lint all skills to stdout (default, safe for agent auto-invoke)
bun .opencode/skills/maintain-skills/scripts/run.ts

# Lint with file output
bun .opencode/skills/maintain-skills/scripts/run.ts -- --out .scratch/reports/maintain-skills/lint.md

# Orchestrator: aggregate Wave 1 for a package
bun .opencode/skills/maintain-skills/scripts/run.ts -- packages/stream
bun .opencode/skills/maintain-skills/scripts/run.ts -- packages/stream --out .scratch/reports/maintain-skills/stream.md

# Workspace sweep (lint all skills + aggregate for each package)
bun .opencode/skills/maintain-skills/scripts/run.ts -- --workspace

# Fix mode: patch missing headings/frontmatter to match _template
bun .opencode/skills/maintain-skills/scripts/run.ts -- --fix
bun .opencode/skills/maintain-skills/scripts/run.ts -- --fix --force  # overwrite existing prose
```

## Allowed runtime

Scripts may only assume `bun`, `rg`, `jq` are present (Q3). No harness-specific JS APIs. See `../_template/scripts/README.md` and `AGENTS.md:138-152` import rule. This caretaker reuses `../_template/scripts/validate.ts` via relative import (allowed in `.opencode/skills/*/scripts/`).
