# 14 — Integrate Skills into AGENTS.md

**What to build:** Wire the 12 repo-health skills into the monorepo's contributor guide so agents and humans can discover them.

**Blocked by:** 01 — Scaffold Skill Template, 02 — Maintain-Skills Caretaker

**Status:** ready-for-agent

- [ ] Edit `AGENTS.md` to add a **"Repo-Health Skills"** table under `## Agent skills` (`AGENTS.md:626-638`) linking each of the 12 skills to `.opencode/skills/<kebab>/SKILL.md` with one-line `When to use` trigger ("when you edit `packages/*`, consider invoking `<skill>` in diagnose mode")
- [ ] Table columns: `Skill | Mode | When to use | Normative refs`; keep it concise — checklists stay in skills, not in `AGENTS.md` (Q16)
- [ ] Add a one-paragraph note that skills are harness-independent (Markdown + Bun, §12 sandbox: repo + `/tmp` only) and that `maintain-skills` is the caretaker for drift
- [ ] Verify: `rg` finds no broken links; `bun run typecheck:seq` and `bun run biome:check` unaffected (markdown-only change)

**Notes:** Do not duplicate skill checklists into `AGENTS.md`. This ticket closes the loop on discovery (Q16) and should be the last one merged.
