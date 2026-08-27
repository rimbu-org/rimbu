#!/usr/bin/env bun
/**
 * run.ts — maintain-skills caretaker & orchestrator
 *
 * Allowed runtime: bun + rg/jq only (spec §2.3, AGENTS.md:601-625 sandbox)
 * Reuses ../_template/scripts/validate.ts via relative import (allowed in scripts/).
 *
 * Usage:
 *   bun .opencode/skills/maintain-skills/scripts/run.ts
 *   bun .opencode/skills/maintain-skills/scripts/run.ts -- packages/stream
 *   bun .opencode/skills/maintain-skills/scripts/run.ts -- packages/stream --out .scratch/reports/maintain-skills/stream.md
 *   bun .opencode/skills/maintain-skills/scripts/run.ts -- --workspace
 *   bun .opencode/skills/maintain-skills/scripts/run.ts -- --fix
 *   bun .opencode/skills/maintain-skills/scripts/run.ts -- --fix --force
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
	validateSkill,
	REQUIRED_FRONTMATTER_FIELDS,
	REQUIRED_HEADINGS,
	REQUIRED_PROCEDURE_SUBHEADINGS,
} from '../../_template/scripts/validate.ts';

// ---------------------------------------------------------------------------
// Constants — must match spec §2.7 roster
// ---------------------------------------------------------------------------

const TEMPLATE_DIR = resolve(import.meta.dir, '../../_template');
const SKILLS_ROOT = resolve(import.meta.dir, '../..');
const REPO_ROOT = resolve(SKILLS_ROOT, '../..');
const REPORT_TEMPLATE_PATH = join(TEMPLATE_DIR, 'references/report-template.md');

const WAVE_1 = ['review-anatomy', 'review-api', 'scout-dead-code', 'audit-tests', 'audit-type-tests'] as const;
const WAVE_2 = ['review-impl', 'review-docs', 'write-docs', 'write-unit-tests', 'write-type-tests'] as const;
const META = ['scout-improvements', 'maintain-skills'] as const;
const EXPECTED_SKILLS = [...WAVE_1, ...WAVE_2, ...META] as const;

type Severity = 'error' | 'warn' | 'info';

interface Finding {
	severity: Severity;
	rule: string;
	location: string;
	evidence: string;
	suggestedFix: string;
	normativeRef: string;
	skill?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function discoverSkills(): string[] {
	const entries = readdirSync(SKILLS_ROOT, { withFileTypes: true });
	const skills: string[] = [];
	for (const e of entries) {
		if (!e.isDirectory()) continue;
		if (e.name.startsWith('.')) continue;
		const skillPath = join(SKILLS_ROOT, e.name, 'SKILL.md');
		if (existsSync(skillPath)) skills.push(join(SKILLS_ROOT, e.name));
	}
	return skills.sort();
}

function readSkillBody(skillDir: string): string {
	const raw = readFileSync(join(skillDir, 'SKILL.md'), 'utf-8');
	return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

function extractSection(body: string, heading: string): string | null {
	const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const re = new RegExp(`(^|\\n)${escaped}(?=\\n|$)`);
	const match = body.match(re);
	if (!match || match.index === undefined) return null;
	const idx = match.index + (match[1]?.length ?? 0);
	const rest = body.slice(idx);
	const next = rest.slice(heading.length).search(/\n## /);
	if (next === -1) return rest;
	return rest.slice(0, heading.length + next);
}

function skillNameFromDir(skillDir: string): string {
	return skillDir.split('/').pop() ?? skillDir;
}

function toRepoRelative(absPath: string): string {
	// Report Location must be repo-relative per spec §2.8 (e.g. packages/... or .opencode/...)
	const rel = absPath.startsWith(REPO_ROOT + '/') ? absPath.slice(REPO_ROOT.length + 1) : absPath;
	return rel;
}

// ---------------------------------------------------------------------------
// Lint — per skill
// ---------------------------------------------------------------------------

export function lintAllSkills(): Finding[] {
	const findings: Finding[] = [];
	const skillDirs = discoverSkills();

	for (const dir of skillDirs) {
		const name = skillNameFromDir(dir);
		if (name === '_template') continue; // baseline, not linted as a real skill (but we do validate template separately)

		const skillPath = join(dir, 'SKILL.md');
		const result = validateSkill(skillPath);

		for (const e of result.errors) {
			let rule = 'skeleton';
			if (e.includes('Frontmatter')) rule = 'frontmatter-fields';
			else if (e.includes('Missing required heading')) rule = 'required-headings';
			else if (e.includes('Missing required sub-heading')) rule = 'procedure-subheadings';
			findings.push({
				severity: 'error',
				rule,
				location: `skill: ${name} — ${toRepoRelative(skillPath)}:1`,
				evidence: e,
				suggestedFix: 'Copy missing section from ../_template/SKILL.md with TODO placeholder',
				normativeRef: 'spec.md:2.11',
			});
		}
		for (const w of result.warnings) {
			let rule = 'skeleton-warn';
			let normativeRef = 'spec.md:2.11';
			if (w.includes('Normative refs should cite')) {
				rule = 'normative-refs-cite-agents';
				normativeRef = 'AGENTS.md:626-638';
			} else if (w.includes('Checklist should not be cited')) {
				rule = 'no-checklist-as-normative';
				normativeRef = 'AGENTS.md:626-638 Q5';
			} else if (w.includes('report-template.md')) {
				rule = 'output-contract-ref';
				normativeRef = 'spec.md:2.8';
			} else if (w.includes('Shared report template')) {
				rule = 'report-template-exists';
				normativeRef = 'spec.md:2.8';
			} else if (w.includes('Allowed runtime')) {
				rule = 'allowed-runtime-note';
				normativeRef = 'spec.md:2.3';
			} else if (w.includes('Missing sub-heading: ### Fix')) {
				rule = 'procedure-subheadings';
				normativeRef = 'spec.md:2.11';
			} else if (w.includes('kebab-case')) {
				rule = 'frontmatter-fields';
				normativeRef = 'AGENTS.md:626-638';
			}
			findings.push({
				severity: 'warn',
				rule,
				location: `skill: ${name} — ${toRepoRelative(skillPath)}:1`,
				evidence: w,
				suggestedFix: w.includes('Fix') ? 'Add "This skill has no fix mode." under ## Procedure if diagnose-only' : 'Update SKILL.md per ../_template/SKILL.md',
				normativeRef,
			});
		}

		// Drift check: normative refs should cite AGENTS.md or docs/adr/
		const body = readSkillBody(dir);
		const normative = extractSection(body, '## Normative refs');
		if (normative) {
			// If skill has any Rule-like evidence but no AGENTS.md citation, already warned above
			// Additional drift: check for rules without citation — simplified: if body contains "Rule" but normative lacks AGENTS.md, already handled
		}
	}

	// Check expected skills missing (info vs warn)
	for (const expected of EXPECTED_SKILLS) {
		const expectedDir = join(SKILLS_ROOT, expected);
		if (!existsSync(join(expectedDir, 'SKILL.md'))) {
			const isWave1 = (WAVE_1 as readonly string[]).includes(expected);
			findings.push({
				severity: isWave1 ? 'warn' : 'info',
				rule: 'skill-not-yet-implemented',
				location: `skill: ${expected}`,
				evidence: `Expected skill .opencode/skills/${expected}/SKILL.md not found`,
				suggestedFix: `Implement .opencode/skills/${expected}/SKILL.md per _template`,
				normativeRef: 'spec.md:2.7',
			});
		}
	}

	// Check template itself
	const templatePath = join(TEMPLATE_DIR, 'SKILL.md');
	if (existsSync(templatePath)) {
		const tmplResult = validateSkill(templatePath);
		if (!tmplResult.valid) {
			for (const e of tmplResult.errors) {
				findings.push({
					severity: 'error',
					rule: 'template-skeleton',
					location: `_template — ${toRepoRelative(templatePath)}:1`,
					evidence: e,
					suggestedFix: 'Fix _template/SKILL.md to match spec §2.11',
					normativeRef: 'spec.md:2.11',
				});
			}
		}
		if (!existsSync(REPORT_TEMPLATE_PATH)) {
			findings.push({
				severity: 'error',
				rule: 'report-template-exists',
				location: `_template — ${toRepoRelative(REPORT_TEMPLATE_PATH)}`,
				evidence: 'Shared report template missing',
				suggestedFix: 'Restore .opencode/skills/_template/references/report-template.md per spec §2.8',
				normativeRef: 'spec.md:2.8',
			});
		}
	}

	return findings;
}

// ---------------------------------------------------------------------------
// Fix mode — minimal patch to match template
// ---------------------------------------------------------------------------

export function fixAllSkills(force: boolean): Finding[] {
	const findings: Finding[] = [];
	const templateRaw = readFileSync(join(TEMPLATE_DIR, 'SKILL.md'), 'utf-8');
	const templateFrontmatter = templateRaw.match(/^---\n([\s\S]*?)\n---\n/)?.[0] ?? '';
	const templateBody = templateRaw.replace(/^---\n[\s\S]*?\n---\n/, '');

	// Extract template sections for patching
	const templateSections: Record<string, string> = {};
	for (const h of REQUIRED_HEADINGS) {
		const sec = extractSection(templateBody, h);
		if (sec) templateSections[h] = sec;
	}

	const skillDirs = discoverSkills();
	for (const dir of skillDirs) {
		const name = skillNameFromDir(dir);
		if (name === '_template') continue;
		const skillPath = join(dir, 'SKILL.md');
		let raw = readFileSync(skillPath, 'utf-8');
		let patched = false;
		let fm = raw.match(/^---\n([\s\S]*?)\n---\n/);

		// Fix frontmatter
		if (!fm) {
			const newFm = `---\nname: ${name}\ndescription: TODO — add one-line purpose\ndisable-model-invocation: false\n---\n`;
			raw = newFm + raw;
			patched = true;
			findings.push({
				severity: 'info',
				rule: 'fix-frontmatter',
				location: `skill: ${name} — ${toRepoRelative(skillPath)}:1`,
				evidence: 'Added missing frontmatter',
				suggestedFix: 'Re-run lint to verify',
				normativeRef: 'spec.md:2.11',
			});
		} else {
			const fmContent = fm[0];
			let newFmContent = fmContent;
			for (const field of REQUIRED_FRONTMATTER_FIELDS) {
				if (!fmContent.includes(`${field}:`)) {
					const insert = field === 'name' ? `name: ${name}` : field === 'description' ? 'description: TODO' : 'disable-model-invocation: false';
					newFmContent = newFmContent.replace('---\n', `---\n${insert}\n`);
					patched = true;
				}
			}
			if (patched) raw = raw.replace(fm[0], newFmContent);
		}

		// Fix missing headings (gap-fill only unless force)
		const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
		for (const h of REQUIRED_HEADINGS) {
			if (!body.includes(h)) {
				const templateSec = templateSections[h] ?? `${h}\n\nTODO — fill per template.\n`;
				raw = raw.trimEnd() + `\n\n${templateSec.trim()}\n`;
				patched = true;
				findings.push({
					severity: 'info',
					rule: 'fix-missing-heading',
					location: `skill: ${name} — ${toRepoRelative(skillPath)}`,
					evidence: `Added missing heading ${h}`,
					suggestedFix: 'Fill TODO per template',
					normativeRef: 'spec.md:2.11',
				});
			} else if (force) {
				// With --force, replace section with template (preserve heading)
				const currentSec = extractSection(body, h);
				const templateSec = templateSections[h];
				if (currentSec && templateSec && currentSec.trim() !== templateSec.trim()) {
					// Only replace if template has more canonical content — skip for now to avoid overwriting real skills
					// Minimal force: ensure Output contract references report-template.md
					if (h === '## Output contract' && !currentSec.includes('report-template.md')) {
						raw = raw.replace(currentSec, templateSec);
						patched = true;
					}
				}
			}
		}

		// Normalize report-template link
		if (raw.includes('report-template.md') && !raw.includes('../_template/references/report-template.md')) {
			raw = raw.replaceAll('references/report-template.md', '../_template/references/report-template.md');
			raw = raw.replaceAll('_template/report-template.md', '../_template/references/report-template.md');
			patched = true;
		}

		if (patched) writeFileSync(skillPath, raw, 'utf-8');
	}

	if (findings.length === 0) {
		findings.push({
			severity: 'info',
			rule: 'fix-noop',
			location: 'skills: all',
			evidence: 'No fix needed — all skills already match template',
			suggestedFix: 'No action',
			normativeRef: 'spec.md:2.11',
		});
	}

	return findings;
}

// ---------------------------------------------------------------------------
// Report generation — per ../_template/references/report-template.md
// ---------------------------------------------------------------------------

function severityOrder(s: Severity): number {
	return s === 'error' ? 0 : s === 'warn' ? 1 : 2;
}

export function generateReport(target: string, findings: Finding[]): string {
	const counts = {
		error: findings.filter((f) => f.severity === 'error').length,
		warn: findings.filter((f) => f.severity === 'warn').length,
		info: findings.filter((f) => f.severity === 'info').length,
	};

	const sorted = [...findings].sort((a, b) => {
		const se = severityOrder(a.severity) - severityOrder(b.severity);
		if (se !== 0) return se;
		return a.rule.localeCompare(b.rule);
	});

	const lines: string[] = [];
	lines.push(`# maintain-skills — ${target}`);
	lines.push('');
	lines.push('## Summary');
	lines.push('');
	if (findings.length === 0) {
		lines.push(`Linted ${discoverSkills().length} skills; no issues. Skill suite is coherent. Counts: 0 error, 0 warn, 0 info.`);
	} else {
		const total = findings.length;
		const coherent = counts.error === 0 ? 'Requires attention for warn/info but no blocking errors.' : 'Requires fix before merge for errors.';
		lines.push(`Linted ${discoverSkills().length} skills; found ${total} findings. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info. ${coherent}`);
		if (target.startsWith('packages/')) {
			lines.push('');
			lines.push(`Orchestrator mode for \`${target}\`: Wave 1 skills missing are reported as warn/info; run individual skills for package-specific findings.`);
		}
	}
	lines.push('');
	lines.push('## Findings');
	lines.push('');
	lines.push('| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |');
	lines.push('|---|---|---|---|---|---|');
	if (sorted.length === 0) {
		lines.push('| — | — | — | No findings | — | — |');
	} else {
		for (const f of sorted) {
			// Escape pipe in evidence
			const ev = f.evidence.replaceAll('|', '\\|').slice(0, 120);
			const fix = f.suggestedFix.replaceAll('|', '\\|').slice(0, 120);
			lines.push(`| ${f.severity} | ${f.rule} | ${f.location} | \`${ev}\` | ${fix} | ${f.normativeRef} |`);
		}
	}
	lines.push('');
	lines.push('## Next actions');
	lines.push('');
	if (sorted.length === 0) {
		lines.push('- No action required — skill suite is coherent.');
	} else {
		if (counts.error > 0) lines.push(`- Fix ${counts.error} error(s) — run with --fix for auto-patch, or edit manually per ../_template/SKILL.md`);
		if (counts.warn > 0) lines.push(`- Review ${counts.warn} warn(s) — propose ADR or AGENTS.md patch per Q5 if rule has no AGENTS.md §`);
		if (counts.info > 0) lines.push(`- ${counts.info} info — pending skills (Wave 2/meta) not yet implemented; implement per spec §2.7`);
		lines.push('- Re-run `bun .opencode/skills/maintain-skills/scripts/run.ts` to verify');
		if (target.startsWith('packages/')) lines.push(`- For package-specific findings, run Wave 1 skills individually: review-anatomy, review-api, scout-dead-code, audit-tests, audit-type-tests`);
	}
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): {
	out?: string;
	fix: boolean;
	force: boolean;
	workspace: boolean;
	target?: string;
} {
	const args = argv.slice(2);
	let out: string | undefined;
	let fix = false;
	let force = false;
	let workspace = false;
	let target: string | undefined;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--out' && i + 1 < args.length) {
			out = args[++i];
		} else if (a?.startsWith('--out=')) {
			out = a.split('=')[1];
		} else if (a === '--fix') fix = true;
		else if (a === '--force') force = true;
		else if (a === '--workspace') workspace = true;
		else if (a === '--verbose') {
			// accepted but unused for now
		} else if (a === '--') {
			// separator — next args are positional
			continue;
		} else if (!a?.startsWith('-')) {
			target = a;
		}
	}
	return { out, fix, force, workspace, target };
}

if (import.meta.main) {
	const { out, fix, force, workspace, target } = parseArgs(process.argv);

	// Fix mode takes precedence
	if (fix) {
		const fixFindings = fixAllSkills(force);
		const report = generateReport('fix', fixFindings);
		console.log(report);
		if (out) {
			const absOut = resolve(out);
			mkdirSync(dirname(absOut), { recursive: true });
			writeFileSync(absOut, report, 'utf-8');
		}
		process.exit(0);
	}

	// Lint all skills (always)
	let findings = lintAllSkills();

	// Orchestrator: if target is a package, add orchestrator findings
	let reportTarget = 'lint';
	if (workspace) {
		reportTarget = 'workspace';
		// For workspace, we could aggregate per package, but for now lint suffices
		// Add info that workspace sweep was requested
		findings.push({
			severity: 'info',
			rule: 'workspace-sweep',
			location: 'workspace: all packages',
			evidence: 'Workspace mode requested — aggregated lint for all skills',
			suggestedFix: 'Run per-package orchestrator for package-specific findings',
			normativeRef: 'spec.md:2.7',
		});
	} else if (target) {
		// Validate package exists
		const pkgPath = resolve(target);
		if (!existsSync(pkgPath) || !statSync(pkgPath).isDirectory()) {
			findings.push({
				severity: 'error',
				rule: 'invalid-target',
				location: `package: ${target}`,
				evidence: `Target package not found: ${target}`,
				suggestedFix: 'Pass a valid packages/<name> path',
				normativeRef: 'AGENTS.md:45-68',
			});
		} else {
			reportTarget = target;
			// Check if Wave 1 skills exist for orchestrator aggregation
			const missingWave1 = WAVE_1.filter((s) => !existsSync(join(SKILLS_ROOT, s, 'SKILL.md')));
			if (missingWave1.length) {
				// Already reported as findings via lintAllSkills (skill-not-yet-implemented), so just ensure target reflects orchestrator
			}
			// Placeholder for future per-package skill invocations
			findings.push({
				severity: 'info',
				rule: 'orchestrator-pending',
				location: `package: ${target}`,
				evidence: `Orchestrator for ${target}: per-package skill runs pending (Wave 1 skills not yet implemented)`,
				suggestedFix: 'Implement review-anatomy/review-api/scout-dead-code/audit-tests to enable package aggregation',
				normativeRef: 'spec.md:2.7',
			});
		}
	}

	const report = generateReport(reportTarget, findings);
	console.log(report);
	if (out) {
		const absOut = resolve(out);
		mkdirSync(dirname(absOut), { recursive: true });
		writeFileSync(absOut, report, 'utf-8');
	}

	const hasError = findings.some((f) => f.severity === 'error');
	process.exit(hasError ? 1 : 0);
}
