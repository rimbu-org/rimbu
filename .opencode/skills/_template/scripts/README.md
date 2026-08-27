# Scripts — Allowed Runtime & Import Rules

This directory holds the executable helpers for each health skill. Every skill's `scripts/` must obey the same harness-independent contract so the suite runs everywhere `bun` is present.

## Allowed runtime (Q3, spec §2.3)

- **Guaranteed present:** `bun` (≥ 1.0), `rg` (ripgrep), `jq`.
- **Not guaranteed:** `gh`, `fd`, `yq`, `bat`, `tree`, `codecov` etc. — do not require them. If a skill needs another tool, declare it in its `SKILL.md` and fail gracefully with a `warn` finding when the tool is absent.
- **No harness-specific JS APIs:** scripts are plain `bun` TypeScript/JavaScript or shell. Do not import from `opencode`, `claude`, or any host-specific SDK. The skill's markdown is the contract; scripts are just helpers that emit the report to stdout and optionally `--out`.

Invoke scripts via `bun`:

```bash
bun .opencode/skills/<kebab>/scripts/run.ts -- packages/stream --out .scratch/reports/<kebab>/stream.md
bun .opencode/skills/<kebab>/scripts/validate.ts -- .opencode/skills/<kebab>/SKILL.md
```

## Import rule (AGENTS.md:138-152 §3)

Inside `packages/*/src/` every import must use a **package path**, never a relative path:

```ts
// CORRECT
import { foo } from '#mypackage/internal-file';
import type { HashMap } from '@rimbu/hashed';
import type { HashMapBase } from '@rimbu/hashed/advanced/base';

// WRONG — banned by biome.json:27-35 `noRestrictedImports`
import { foo } from '../internal/foo';
import { bar } from './bar';
```

Skills must **enforce** this rule when they inspect `packages/*/src/` (e.g. `review-anatomy`, `review-impl`). Inside `.opencode/skills/*/scripts/` relative imports are fine — this directory is not part of a package's `src/` and is not linted by the package `biome.json`. Still prefer explicit paths for clarity.

## Script conventions

- One entry point per skill: `scripts/run.ts` (diagnose by default, `--fix` opt-in). This stub's `validate.ts` is a helper for `maintain-skills` to lint the template itself.
- Be idempotent and single-package-scoped by default (`<pkg>` arg). Support `--workspace` only if `SKILL.md` declares it.
- Keep scripts small; most logic is `rg` + `jq` pipelines. Example:

```bash
# find relative imports (evidence for review-anatomy)
rg -n "from\s+['\"]\./|from\s+['\"]\.\./" packages/<pkg>/src --no-heading
```

- Sandbox: never read/write outside the repo root and `/tmp` (`AGENTS.md:601-625`). When `--out` is given, create parent dirs (`mkdir -p`) and write the identical stdout markdown there.

## This stub — `validate.ts`

`validate.ts` checks that a skill's `SKILL.md` conforms to the `_template` skeleton (`SKILL.md`) and that `references/report-template.md` exists. It is used to verify that `maintain-skills` (02) can lint a dummy skill against the template (ticket 01's dry run).

```bash
bun .opencode/skills/_template/scripts/validate.ts -- .opencode/skills/<kebab>/SKILL.md
# exits 0 if valid, 1 with diagnostics if not
```
