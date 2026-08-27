# Maintain-Skills Checklist

Source: `.scratch/rimbu-health-skills/spec.md:2.5/2.11/2.8` and ticket `02`. This caretaker is the only skill that may propose `AGENTS.md`/`docs/adr/` patches.

## Lint — per-skill skeleton (from `../_template/SKILL.md`)

For each `.opencode/skills/*/SKILL.md` (excluding `_template`):

| Rule | Severity | Check | Normative ref |
|---|---|---|---|
| `frontmatter-fields` | error | Frontmatter has `name`, `description`, `disable-model-invocation`; `name` is kebab-case or `_template` | `AGENTS.md:626-638` |
| `required-headings` | error | Contains `## Purpose`, `## Normative refs`, `## When to use`, `## Procedure`, `## Output contract`, `## Examples` | `spec.md:2.11` |
| `procedure-subheadings` | error/warn | `## Procedure` contains `### Diagnose`; `### Fix` missing = `warn` (diagnose-only allowed) | `spec.md:2.11` |
| `output-contract-ref` | error | `## Output contract` references `../_template/references/report-template.md` | `spec.md:2.8` |
| `report-template-exists` | warn | Shared template `../_template/references/report-template.md` exists | `spec.md:2.8` |
| `allowed-runtime-note` | warn | Body mentions `Allowed runtime` or `allowed runtime` (docs `bun`+`rg`+`jq` only) | `spec.md:2.3` |

## Normative refs validity (drift)

| Rule | Severity | Check | Normative ref |
|---|---|---|---|
| `normative-refs-cite-agents` | warn | `## Normative refs` cites at least one `AGENTS.md:XX-YY` | `AGENTS.md:1-638` |
| `no-checklist-as-normative` | warn | Does not contain phrase `checklist is normative` / `checklist as normative` (Q5) | `AGENTS.md:626-638` |
| `only-agents-or-adr` | warn | If a rule `Rule` id has no `AGENTS.md` or `docs/adr/NNNN` citation, propose ADR/`AGENTS.md` patch instead of silently enforcing | `spec.md:2.5` Q5, `docs/agents/domain.md:11-12` |

## Report-contract adherence

| Rule | Severity | Check |
|---|---|---|
| `report-skeleton` | error | Each skill's `## Output contract` documents skeleton `# <skill> — <pkg>` → `## Summary` → `## Findings` table `Severity \| Rule \| Location \| Evidence \| Suggested fix \| Normative ref` → `## Next actions` |
| `severity-semantics` | warn | Docs `error`/`warn`/`info` semantics and `--out .scratch/reports/<skill>/<pkg>.md` convention (Q8) |

## Orchestrator (when `<pkg>` given)

| Rule | Severity | Check |
|---|---|---|
| `skill-not-yet-implemented` | info (warn if Wave 1) | Skill `scripts/run.ts` missing — record `info` (promote to `warn` if Wave 1 per spec §2.7) |
| `workspace-order` | info | Runs in dependency order: `_template` → Wave 1 → Wave 2 → meta; aggregate sorted by `Severity` then `Skill` |
| `aggregate-report` | info | Emit rolled-up table with same columns plus `Skill` prefix in `Rule` or separate column |

## Fix mode (`--fix`)

| Action | When |
|---|---|
| Add missing frontmatter fields | Insert `name: <dir>`, `description: TODO`, `disable-model-invocation: false` |
| Append missing headings | Append heading from `../_template/SKILL.md` with `TODO` body |
| Normalize `report-template.md` link | Replace bare `report-template.md` refs with `../_template/references/report-template.md` |
| `--force` | Overwrite existing prose with template section |

All fix actions are idempotent; re-running lint after fix should be clean.
