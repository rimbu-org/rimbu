#!/usr/bin/env bun
/**
 * validate.ts — lint a skill's SKILL.md against the _template skeleton.
 *
 * Allowed runtime: bun + rg/jq only (spec §2.3). This script uses only
 * node:fs and no harness APIs, so it is harness-independent.
 *
 * Usage:
 *   bun .opencode/skills/_template/scripts/validate.ts -- .opencode/skills/<kebab>/SKILL.md
 *   bun .opencode/skills/_template/scripts/validate.ts -- .opencode/skills/review-api/SKILL.md --verbose
 *
 * Exits 0 if valid, 1 with diagnostics if not. Also exports `validateSkill` for
 * programmatic use (TDD seam).
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Config — must match _template/SKILL.md skeleton (spec §2.11)
// ---------------------------------------------------------------------------

export const REQUIRED_FRONTMATTER_FIELDS = [
	'name',
	'description',
	'disable-model-invocation',
] as const;

export const REQUIRED_HEADINGS = [
	'## Purpose',
	'## Normative refs',
	'## When to use',
	'## Procedure',
	'## Output contract',
	'## Examples',
] as const;

// Procedure must contain these sub-headings (spec says Diagnose / Fix)
export const REQUIRED_PROCEDURE_SUBHEADINGS = ['### Diagnose', '### Fix'] as const;

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export interface ValidationResult {
	valid: boolean;
	errors: string[];
	warnings: string[];
	skillPath: string;
}

function parseFrontmatter(content: string): Record<string, string> | null {
	const match = content.match(FRONTMATTER_RE);
	if (!match) return null;
	const yaml = match[1] ?? '';
	const frontmatter: Record<string, string> = {};
	for (const line of yaml.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const colon = trimmed.indexOf(':');
		if (colon === -1) continue;
		const key = trimmed.slice(0, colon).trim();
		const value = trimmed.slice(colon + 1).trim();
		if (key) frontmatter[key] = value;
	}
	return frontmatter;
}

function stripFrontmatter(content: string): string {
	return content.replace(FRONTMATTER_RE, '');
}

export function validateSkill(skillPath: string): ValidationResult {
	const absPath = resolve(skillPath);
	const errors: string[] = [];
	const warnings: string[] = [];

	if (!existsSync(absPath)) {
		return {
			valid: false,
			errors: [`SKILL.md not found: ${absPath}`],
			warnings: [],
			skillPath: absPath,
		};
	}

	const raw = readFileSync(absPath, 'utf-8');

	// 1. Frontmatter
	const fm = parseFrontmatter(raw);
	if (!fm) {
		errors.push('Missing or malformed YAML frontmatter (expected ---\\nname: ...\\n---)');
	} else {
		for (const field of REQUIRED_FRONTMATTER_FIELDS) {
			if (!(field in fm) || fm[field] === undefined || fm[field] === '') {
				errors.push(`Frontmatter missing required field: ${field}`);
			}
		}
		// name should be kebab-case or _template
		if (fm['name'] && !/^([a-z0-9]+(-[a-z0-9]+)*|_template)$/.test(fm['name'])) {
			warnings.push(
				`Frontmatter 'name' should be kebab-case (or _template): got "${fm['name']}"`,
			);
		}
	}

	const body = stripFrontmatter(raw);

	// 2. Required headings (exact match)
	for (const heading of REQUIRED_HEADINGS) {
		if (!body.includes(heading)) {
			errors.push(`Missing required heading: ${heading}`);
		}
	}

	// 3. Procedure sub-headings
	for (const sub of REQUIRED_PROCEDURE_SUBHEADINGS) {
		if (!body.includes(sub)) {
			// Diagnose-only skills may omit Fix — treat as warning, not error
			if (sub === '### Fix') {
				warnings.push(
					`Missing sub-heading: ${sub} (ok if this skill is diagnose-only; document "This skill has no fix mode.")`,
				);
			} else {
				errors.push(`Missing required sub-heading under ## Procedure: ${sub}`);
			}
		}
	}

	// 4. Normative refs must cite AGENTS.md and/or docs/adr/ only
	const normativeSection = extractSection(body, '## Normative refs');
	if (normativeSection) {
		// Check that at least one normative ref is present
		if (!normativeSection.includes('AGENTS.md')) {
			warnings.push('## Normative refs should cite at least one AGENTS.md § (spec §2.5: AGENTS.md wins)');
		}
		// Flag if skill cites checklist itself as normative (drift) — look for phrases like "checklist is normative" or "checklist as normative"
		if (/checklist\s+(is|as)\s+normative/i.test(normativeSection)) {
			warnings.push('Checklist should not be cited as normative — only AGENTS.md and docs/adr/ are normative (Q5)');
		}
	}

	// 5. Output contract must reference report-template.md
	const outputSection = extractSection(body, '## Output contract');
	if (outputSection && !outputSection.includes('report-template.md')) {
		warnings.push('## Output contract should reference ../_template/references/report-template.md (spec §2.8)');
	}

	// 6. Check that shared report template exists (for _template itself or when validating any skill)
	const skillDir = dirname(absPath);
	const sharedTemplate = resolve(skillDir, '../_template/references/report-template.md');
	const ownTemplate = resolve(skillDir, 'references/report-template.md');
	// For _template itself, the report template lives at references/report-template.md
	// For other skills, the shared template lives at ../_template/references/report-template.md
	const isTemplate = skillDir.endsWith('_template');
	const templatePath = isTemplate ? ownTemplate : sharedTemplate;
	if (!existsSync(templatePath)) {
		warnings.push(`Shared report template not found: ${templatePath} (expected per spec §2.8)`);
	}

	// 7. Allowed runtime note
	if (!body.includes('Allowed runtime') && !body.includes('allowed runtime')) {
		warnings.push('Consider documenting allowed runtime (bun + rg/jq) in the skill (see scripts/README.md)');
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
		skillPath: absPath,
	};
}

function extractSection(body: string, heading: string): string | null {
	const idx = body.indexOf(heading);
	if (idx === -1) return null;
	const rest = body.slice(idx);
	// Find next ## heading at same level
	const next = rest.slice(heading.length).search(/\n## /);
	if (next === -1) return rest;
	return rest.slice(0, heading.length + next);
}

function formatResult(result: ValidationResult, verbose: boolean): string {
	const lines: string[] = [];
	lines.push(`Skill: ${result.skillPath}`);
	lines.push(`Valid: ${result.valid ? 'yes' : 'no'}`);
	if (result.errors.length) {
		lines.push(`Errors (${result.errors.length}):`);
		for (const e of result.errors) lines.push(`  - ${e}`);
	}
	if (result.warnings.length) {
		lines.push(`Warnings (${result.warnings.length}):`);
		for (const w of result.warnings) lines.push(`  - ${w}`);
	}
	if (result.valid && result.warnings.length === 0) {
		lines.push('No issues — skill conforms to _template skeleton.');
	}
	if (verbose) {
		lines.push('');
		lines.push('(Run with --verbose for full details; this is the default.)');
	}
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (import.meta.main) {
	const args = process.argv.slice(2).filter((a) => a !== '--');
	const verbose = args.includes('--verbose');
	const skillArg = args.find((a) => !a.startsWith('--'));

	if (!skillArg) {
		console.error(
			'Usage: bun .opencode/skills/_template/scripts/validate.ts -- <path-to-SKILL.md> [--verbose]\n' +
				'Example: bun .opencode/skills/_template/scripts/validate.ts -- .opencode/skills/review-api/SKILL.md',
		);
		process.exit(1);
	}

	const result = validateSkill(skillArg);
	console.log(formatResult(result, verbose));
	process.exit(result.valid ? 0 : 1);
}
