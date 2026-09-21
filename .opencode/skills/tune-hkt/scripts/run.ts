#!/usr/bin/env bun
/**
 * run.ts — tune-hkt: HKT correctness & type-level cost
 *
 * Hybrid: diagnose by default, mechanical fixes with --fix (auto-reverting).
 * Allowed runtime: bun + rg/jq only. Writes only inside repo root and /tmp.
 *
 * Usage:
 *   bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted
 *   bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/sorted --probe --measure
 *   bun .opencode/skills/tune-hkt/scripts/run.ts -- packages/collection-types --fix
 *   bun .opencode/skills/tune-hkt/scripts/run.ts -- --workspace
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

type Severity = 'error' | 'warn' | 'info';
interface Finding {
	severity: Severity;
	rule: string;
	location: string;
	evidence: string;
	suggestedFix: string;
	normativeRef: string;
}

const REPO_ROOT = resolve(import.meta.dir, '../../../..');
const PACKAGES_ROOT = join(REPO_ROOT, 'packages');
const TSC = join(REPO_ROOT, 'node_modules/.bin/tsc');
const REF_MIXIN = 'AGENTS.md §6.4 (shared mixin _TP rule)';
const REF_FAMILY = 'AGENTS.md §6.4 (named family rule)';
const REF_HKT = 'AGENTS.md:375-398 §6.4';

// Cost budget defaults. Derived from observed healthy packages; override via flags.
const DEFAULT_MAX_MEMORY_MB = 2048;
const DEFAULT_MAX_TYPES_PER_LINE = 500;

function toRepoRel(p: string): string {
	return p.startsWith(`${REPO_ROOT}/`) ? p.slice(REPO_ROOT.length + 1) : p;
}

function rg(pattern: string, dir: string, extraArgs: string[] = []): string {
	if (!existsSync(dir)) return '';
	const res = spawnSync('rg', ['-n', pattern, dir, '--no-heading', ...extraArgs], {
		encoding: 'utf-8',
	});
	return res.status === 0 ? (res.stdout ?? '') : '';
}

function lineOf(content: string, index: number): number {
	return content.slice(0, index).split('\n').length;
}

/**
 * Blank out comments while preserving offsets, so `lineOf` stays accurate and
 * prose that merely *mentions* a pattern is never reported as code. Without
 * this the rule fires on its own documentation.
 */
function stripComments(src: string): string {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
		.replace(/\/\/[^\n]*/g, (m) => ' '.repeat(m.length));
}

// ---------------------------------------------------------------------------
// Static check: aggregate Family used where FamilyBase suffices
// ---------------------------------------------------------------------------

function checkFamilyInConstraint(pkgDir: string, findings: Finding[]): void {
	const advDir = join(pkgDir, 'src/advanced');
	const pubDir = join(pkgDir, 'src/public');
	for (const dir of [advDir, pubDir]) {
		if (!existsSync(dir)) continue;
		const out = rg("Tp extends Collection\\.Advanced\\.Types", dir, ['-A3']);
		if (!out.trim()) continue;

		const files = new Set<string>();
		for (const line of out.split('\n')) {
			const m = /^(.*?):\d+[:-]/.exec(line);
			if (m?.[1]) files.add(m[1]);
		}

		for (const file of files) {
			let content: string;
			try {
				content = readFileSync(file, 'utf-8');
			} catch {
				continue;
			}
			// `Tp extends Collection.Advanced.Types<X.Advanced.Family<...>` —
			// the aggregate pins _NORMAL/_BUILDER/_CONTEXT and blocks collapse.
			const code = stripComments(content);
			// Only *undefaulted* constraints. A defaulted `Tp extends X = Y` is a
			// fallback the caller normally overrides (class bases, the explicit
			// WithMixin overload); the undefaulted form is what every use site
			// must satisfy, and is where the aggregate actually pins the slots.
			const re =
				/Tp extends Collection\.Advanced\.Types(?:NonEmpty)?<\s*\n?\s*([A-Za-z]+)\.Advanced\.Family<[^>]*>,?\s*[^>]*>,(?!\s*=)/g;
			let m: RegExpExecArray | null;
			// biome-ignore lint/suspicious/noAssignInExpressions: standard exec loop
			while ((m = re.exec(code)) !== null) {
				const owner = m[1] as string;
				findings.push({
					severity: 'warn',
					rule: 'family-in-constraint',
					location: `${toRepoRel(file)}:${lineOf(code, m.index)}`,
					evidence: `undefaulted Tp constraint names aggregate ${owner}.Advanced.Family`,
					suggestedFix: `Use ${owner}.Advanced.FamilyBase (or the nearest FamilyBase) — the aggregate pins _NORMAL/_BUILDER/_CONTEXT and blocks intersection collapse`,
					normativeRef: REF_HKT,
				});
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Static check: distributive conditional over a boolean-defaulted parameter
// ---------------------------------------------------------------------------

function checkDistributiveConditional(pkgDir: string, findings: Finding[]): void {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return;
	const out = rg('extends boolean = boolean', srcDir);
	if (!out.trim()) return;

	const files = new Set<string>();
	for (const line of out.split('\n')) {
		const m = /^(.*?):\d+:/.exec(line);
		if (m?.[1]) files.add(m[1]);
	}

	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		const code = stripComments(content);
		const params = new Set<string>();
		const pre = /(\w+)\s+extends\s+boolean\s*=\s*boolean/g;
		let pm: RegExpExecArray | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: standard exec loop
		while ((pm = pre.exec(code)) !== null) params.add(pm[1] as string);

		for (const p of params) {
			// naked `P extends true` (not already wrapped as `[P] extends [true]`)
			const re = new RegExp(`(^|[^[\\w])${p}\\s+extends\\s+(true|false)\\b`, 'g');
			let m: RegExpExecArray | null;
			// biome-ignore lint/suspicious/noAssignInExpressions: standard exec loop
			while ((m = re.exec(code)) !== null) {
				findings.push({
					severity: 'warn',
					rule: 'distributive-conditional',
					location: `${toRepoRel(file)}:${lineOf(code, m.index)}`,
					evidence: `${p} extends ${m[2]} — naked param distributes over boolean`,
					suggestedFix: `Wrap in a tuple: [${p}] extends [${m[2]}] — otherwise both branches are instantiated and unioned on every use`,
					normativeRef: REF_HKT,
				});
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Delegated: reuse review-api's (h)/(i) so one invocation covers the concern
// ---------------------------------------------------------------------------

function reuseReviewApi(target: string, findings: Finding[]): void {
	const script = join(REPO_ROOT, '.opencode/skills/review-api/scripts/run.ts');
	if (!existsSync(script)) {
		findings.push({
			severity: 'info',
			rule: 'review-api-unavailable',
			location: 'package: —',
			evidence: 'review-api script not found; (h)/(i) not checked',
			suggestedFix: 'Restore .opencode/skills/review-api/scripts/run.ts',
			normativeRef: REF_MIXIN,
		});
		return;
	}
	const res = spawnSync('bun', [script, '--', target], {
		encoding: 'utf-8',
		cwd: REPO_ROOT,
	});
	const stdout = res.stdout ?? '';
	for (const line of stdout.split('\n')) {
		if (!line.startsWith('|')) continue;
		const cells = line.split('|').map((c) => c.trim());
		// | severity | rule | location | evidence | fix | ref |
		const [, sev, rule, loc, ev, fix, ref] = cells;
		if (!rule || (rule !== 'mixin-shared-tp' && rule !== 'family-adhoc-intersection'))
			continue;
		findings.push({
			severity: (sev as Severity) ?? 'error',
			rule,
			location: loc ?? '—',
			evidence: (ev ?? '').replace(/^`|`$/g, ''),
			suggestedFix: fix ?? '',
			normativeRef: ref ?? (rule === 'mixin-shared-tp' ? REF_MIXIN : REF_FAMILY),
		});
	}
}

// ---------------------------------------------------------------------------
// Probe: how do the family slots actually resolve?
// ---------------------------------------------------------------------------

interface ChainInfo {
	file: string;
	mixins: string[]; // capability namespaces, seed-first
	kind: 'Empty' | 'NonEmpty';
	familyExpr: string; // e.g. "SortedMap.Advanced.Family"
	familyNs: string; // e.g. "SortedMap"
	arity: number;
	importLines: string[];
}

/**
 * Parse a package's `WithMixin` chain.
 *
 * Reading slots off the *concrete* family always looks clean — the redundant
 * intersection only appears on the record `ApiMixin.Apply` actually composes
 * (`(C & { _TP: Tp })['_TP']`). So the probe must reconstruct `C` from the real
 * chain, which is what this extracts.
 */
function findChains(pkgDir: string): ChainInfo[] {
	const srcDir = join(pkgDir, 'src');
	if (!existsSync(srcDir)) return [];
	const out = rg('\\.WithMixin\\(', srcDir);
	const files = new Set<string>();
	for (const line of out.split('\n')) {
		const m = /^(.*?):\d+:/.exec(line);
		if (m?.[1]) files.add(m[1]);
	}

	const chains: ChainInfo[] = [];
	for (const file of files) {
		let content: string;
		try {
			content = readFileSync(file, 'utf-8');
		} catch {
			continue;
		}
		const code = stripComments(content);
		const mixins: string[] = [];
		for (const m of code.matchAll(/(\w+)\.WithMixin\(/g)) mixins.push(m[1] as string);
		const seed = /(\w+)\.Constructor\b/.exec(code);
		if (mixins.length === 0 || !seed) continue;
		// seed first, then inner-to-outer (matchAll is outer-to-inner)
		const ordered = [seed[1] as string, ...mixins.reverse()];
		const kind: 'Empty' | 'NonEmpty' = (seed[1] as string).includes('NonEmpty')
			? 'NonEmpty'
			: 'Empty';

		// the class that binds the base: `extends <Base><A, B, Ns.Advanced.Family<...>>`
		const bind = /extends\s+\w+<[^>]*?(\w+)\.Advanced\.Family<([^>]*)>/.exec(code);
		if (!bind) continue;
		const familyNs = bind[1] as string;
		const arity = (bind[2] as string).split(',').filter((x) => x.trim()).length;

		const importLines: string[] = [];
		for (const ns of [...ordered, familyNs]) {
			const im = new RegExp(
				`import(?: type)?\\s*\\{[^}]*\\b${ns}\\b[^}]*\\}\\s*from\\s*'([^']+)'`,
			).exec(content);
			if (im) importLines.push(`import type { ${ns} } from '${im[1]}';`);
		}
		if (importLines.length < ordered.length + 1) continue;

		chains.push({
			file,
			mixins: ordered,
			kind,
			familyExpr: `${familyNs}.Advanced.Family`,
			familyNs,
			arity,
			importLines: [...new Set(importLines)],
		});
	}
	return chains;
}

function probeSlots(pkgDir: string, findings: Finding[]): void {
	const chains = findChains(pkgDir);
	if (chains.length === 0) {
		findings.push({
			severity: 'info',
			rule: 'probe-inconclusive',
			location: `package: ${toRepoRel(pkgDir)}`,
			evidence: 'No WithMixin chain found to probe',
			suggestedFix:
				'Probe manually per the SKILL.md template if the package has HKT machinery',
			normativeRef: REF_HKT,
		});
		return;
	}

	const probePath = join(pkgDir, '__tune_hkt_probe.ts');
	const cfgPath = join(pkgDir, 'tsconfig.__tune_hkt.json');

	for (const ch of chains) {
		const args = Array.from({ length: ch.arity }, () => 'number').join(', ');
		const elem = ch.arity >= 2 ? 'readonly [number, number]' : 'number';
		const tpAlias = ch.kind === 'NonEmpty' ? 'TypesNonEmpty' : 'Types';

		// Not every capability in a chain exposes a `Mixin` — some (notably
		// `CollectionEmpty`, `IndexedSortedCollectionEmpty`) contribute their API
		// through the `Base` half of the construct signature instead. Start with
		// the full chain and adaptively drop whatever TypeScript reports as
		// missing (TS2694), retrying until it composes.
		let variant = [...ch.mixins];
		let slots: Record<string, string> = {};
		let lastErr = '';

		for (let attempt = 0; attempt < 4 && variant.length > 0; attempt++) {
			const C = variant.map((m) => `${m}.Mixin`).join(' &\n\t');
			const needed = new Set([...variant, ch.familyNs]);
			const imports = ch.importLines.filter((l) =>
				[...needed].some((n) => l.includes(`{ ${n} }`)),
			);
			const src = [
				"import type { Collection } from '@rimbu/collection-types/collection';",
				...imports,
				'',
				`type E = ${elem};`,
				`type RealTp = Collection.Advanced.${tpAlias}<${ch.familyExpr}<${args}>, E>;`,
				`type C = ${C};`,
				"type ComposedTp = (C & { _E: E; _S: number; _TP: RealTp })['_TP'];",
				'',
				"declare const nrm: ComposedTp['_NORMAL'];",
				"declare const bld: ComposedTp['_BUILDER'];",
				"declare const ctx: ComposedTp['_CONTEXT'];",
				'',
				'export const a: null = nrm;',
				'export const b: null = bld;',
				'export const c: null = ctx;',
				'',
			].join('\n');
			const firstAssign = src.split('\n').indexOf('export const a: null = nrm;') + 1;

			try {
				writeFileSync(probePath, src, 'utf-8');
				writeFileSync(
					cfgPath,
					JSON.stringify({
						extends: ['../../config/tsconfig.base.json', './tsconfig.common.json'],
						files: ['__tune_hkt_probe.ts'],
						compilerOptions: { rootDir: '..', incremental: false },
					}),
					'utf-8',
				);
				const res = spawnSync(TSC, ['-p', cfgPath, '--noEmit', '--noErrorTruncation'], {
					encoding: 'utf-8',
					cwd: REPO_ROOT,
				});
				const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
				lastErr = out;
				slots = {};
				for (const m of out.matchAll(
					/__tune_hkt_probe\.ts\((\d+),\d+\): error TS2322: Type '([\s\S]*?)' is not assignable to type 'null'/g,
				)) {
					const ln = Number(m[1]);
					const name =
						ln === firstAssign
							? '_NORMAL'
							: ln === firstAssign + 1
								? '_BUILDER'
								: '_CONTEXT';
					slots[name] = (m[2] as string).replace(/\s+/g, ' ');
				}
			} finally {
				rmSync(probePath, { force: true });
				rmSync(cfgPath, { force: true });
			}
			if (Object.keys(slots).length > 0) break;

			const missing = new Set<string>();
			for (const m of lastErr.matchAll(
				/Namespace '[^']*?\.?(\w+)' has no exported member 'Mixin'/g,
			))
				missing.add(m[1] as string);
			if (missing.size === 0) break;
			variant = variant.filter((v) => !missing.has(v));
		}

		if (Object.keys(slots).length === 0) {
			const why = /error TS\d+: [^\n]*/.exec(lastErr)?.[0] ?? 'no diagnostic';
			findings.push({
				severity: 'info',
				rule: 'probe-inconclusive',
				location: toRepoRel(ch.file),
				evidence: `Probe for ${ch.familyNs} (${ch.kind}) did not resolve: ${why.slice(0, 70)}`,
				suggestedFix: 'Probe manually per the SKILL.md template',
				normativeRef: REF_HKT,
			});
			continue;
		}
		for (const [slot, ty] of Object.entries(slots)) {
			if (ty.includes('&')) {
				findings.push({
					severity: 'error',
					rule: 'slot-intersection',
					location: toRepoRel(ch.file),
					evidence: `${ch.familyNs} ${ch.kind} ${slot} → ${ty.slice(0, 90)}`,
					suggestedFix:
						'Slot must resolve to a single named type; an intersection defeats the nominal fast path. Look for a Mixin declaring its own _TP, or an aggregate Family in an undefaulted Tp constraint',
					normativeRef: REF_MIXIN,
				});
			}
		}
	}
}


// ---------------------------------------------------------------------------
// Measure: cold type-level cost against budget
// ---------------------------------------------------------------------------

function measureCost(
	pkgDir: string,
	findings: Finding[],
	maxMemMb: number,
	maxTypesPerLine: number,
): void {
	const cfg = join(pkgDir, 'tsconfig.json');
	if (!existsSync(cfg)) return;
	// incremental is on repo-wide — a warm run reports ~0 types and is meaningless
	rmSync(join(pkgDir, 'tsconfig.tsbuildinfo'), { force: true });

	const res = spawnSync(TSC, ['-p', cfg, '--noEmit', '--extendedDiagnostics'], {
		encoding: 'utf-8',
		cwd: REPO_ROOT,
	});
	const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
	const num = (label: string): number => {
		const m = new RegExp(`^${label}:\\s+(\\d+)`, 'm').exec(out);
		return m ? Number(m[1]) : 0;
	};
	const types = num('Types');
	const inst = num('Instantiations');
	const memK = num('Memory used');
	const memMb = Math.round(memK / 1024);
	if (types === 0) return;

	const srcLines = countSrcLines(join(pkgDir, 'src'));
	const perLine = srcLines > 0 ? Math.round(types / srcLines) : 0;
	const loc = `package: ${toRepoRel(pkgDir)}`;
	const evidence = `types=${types} instantiations=${inst} memory=${memMb}MB srcLines=${srcLines} types/line=${perLine}`;

	if (memMb > maxMemMb || perLine > maxTypesPerLine) {
		findings.push({
			severity: 'warn',
			rule: 'cost-budget',
			location: loc,
			evidence,
			suggestedFix: `Over budget (memory>${maxMemMb}MB or types/line>${maxTypesPerLine}) — re-run with --probe to see whether a family slot resolves to an intersection`,
			normativeRef: REF_HKT,
		});
	} else {
		findings.push({
			severity: 'info',
			rule: 'cost-budget',
			location: loc,
			evidence,
			suggestedFix: 'Within budget',
			normativeRef: REF_HKT,
		});
	}
}

function countSrcLines(dir: string): number {
	if (!existsSync(dir)) return 0;
	let total = 0;
	const walk = (d: string): void => {
		for (const e of readdirSync(d, { withFileTypes: true })) {
			const p = join(d, e.name);
			if (e.isDirectory()) walk(p);
			else if (e.name.endsWith('.ts'))
				total += readFileSync(p, 'utf-8').split('\n').length;
		}
	};
	walk(dir);
	return total;
}

// ---------------------------------------------------------------------------
// Fix: the two mechanically safe repairs, auto-reverting
// ---------------------------------------------------------------------------

function applyFixes(pkgDir: string, findings: Finding[]): void {
	const baseline = errorCount(pkgDir);
	const touched = new Map<string, string>();

	const record = (file: string): string => {
		if (!touched.has(file)) touched.set(file, readFileSync(file, 'utf-8'));
		return readFileSync(file, 'utf-8');
	};

	let applied = 0;

	// NOTE: `distributive-conditional` is deliberately NOT auto-fixed.
	// The tuple wrapper looks semantics-preserving — for a resolved `boolean` the
	// distributed union and the non-distributed branch are the same type — but a
	// *deferred* conditional (unresolved generic `IsNonEmpty`) relates far more
	// permissively during assignability than a tuple-wrapped one. Applying it
	// mechanically to `FirstLast`/`MinMax`/`ElementStream` kept collection-types'
	// own src at 0 errors while taking @rimbu/list from 0 to 39. Report it, let a
	// human apply it, and verify every downstream package.

	// family-in-constraint -> FamilyBase
	for (const f of findings.filter((x) => x.rule === 'family-in-constraint')) {
		const file = join(REPO_ROOT, f.location.split(':')[0] as string);
		if (!existsSync(file)) continue;
		const content = record(file);
		const next = content.replace(
			/(Tp extends Collection\.Advanced\.Types(?:NonEmpty)?<\s*\n?\s*[A-Za-z]+\.Advanced\.)Family</g,
			'$1FamilyBase<',
		);
		if (next !== content) {
			writeFileSync(file, next, 'utf-8');
			applied++;
		}
	}

	if (applied === 0) {
		findings.push({
			severity: 'info',
			rule: 'fix-noop',
			location: `package: ${toRepoRel(pkgDir)}`,
			evidence: 'No mechanically-fixable findings',
			suggestedFix: 'Remaining findings need a human (see SKILL.md ### Fix)',
			normativeRef: REF_HKT,
		});
		return;
	}

	const after = errorCount(pkgDir);
	if (after !== baseline) {
		for (const [file, original] of touched) writeFileSync(file, original, 'utf-8');
		findings.push({
			severity: 'error',
			rule: 'fix-reverted',
			location: `package: ${toRepoRel(pkgDir)}`,
			evidence: `Post-check error count ${after} != baseline ${baseline}; all ${applied} edit(s) reverted`,
			suggestedFix: 'Apply the change manually and inspect the new errors',
			normativeRef: REF_HKT,
		});
		return;
	}
	findings.push({
		severity: 'info',
		rule: 'fix-applied',
		location: `package: ${toRepoRel(pkgDir)}`,
		evidence: `${applied} mechanical fix(es) applied; post-check error count unchanged (${after})`,
		suggestedFix: 'Rebuild dist and re-run downstream typechecks',
		normativeRef: REF_HKT,
	});
}

/**
 * Post-check baseline. Uses the *full* package config (src + test + test-d), not
 * `tsconfig.esm.json`, because a src-only check misses changes that alter what
 * the type tests assert — which is exactly how an unsafe fix slipped through
 * during this skill's own development.
 */
function errorCount(pkgDir: string): number {
	const cfg = join(pkgDir, 'tsconfig.json');
	if (!existsSync(cfg)) return -1;
	rmSync(join(pkgDir, 'tsconfig.tsbuildinfo'), { force: true });
	const res = spawnSync(TSC, ['-p', cfg, '--noEmit'], {
		encoding: 'utf-8',
		cwd: REPO_ROOT,
	});
	const out = `${res.stdout ?? ''}${res.stderr ?? ''}`;
	return out.split('\n').filter((l) => l.includes('error TS')).length;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function generateReport(target: string, findings: Finding[]): string {
	const counts = {
		error: findings.filter((f) => f.severity === 'error').length,
		warn: findings.filter((f) => f.severity === 'warn').length,
		info: findings.filter((f) => f.severity === 'info').length,
	};
	const order = (s: Severity) => (s === 'error' ? 0 : s === 'warn' ? 1 : 2);
	const sorted = [...findings].sort(
		(a, b) => order(a.severity) - order(b.severity) || a.rule.localeCompare(b.rule),
	);

	const lines: string[] = [];
	lines.push(`# tune-hkt — ${target}`, '', '## Summary', '');
	const clean = counts.error === 0 && counts.warn === 0;
	lines.push(
		`HKT machinery ${clean ? 'is clean' : 'has issues'}. Counts: ${counts.error} error, ${counts.warn} warn, ${counts.info} info.`,
	);
	const cost = findings.find((f) => f.rule === 'cost-budget');
	if (cost) lines.push('', `Cost: ${cost.evidence}`);
	lines.push('', '## Findings', '');
	lines.push('| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |');
	lines.push('|---|---|---|---|---|---|');
	if (sorted.length === 0) {
		lines.push('| — | — | — | No findings | — | — |');
	} else {
		for (const f of sorted) {
			const ev = f.evidence.replaceAll('|', '\\|').slice(0, 120);
			const fx = f.suggestedFix.replaceAll('|', '\\|').slice(0, 120);
			lines.push(
				`| ${f.severity} | ${f.rule} | ${f.location} | \`${ev}\` | ${fx} | ${f.normativeRef} |`,
			);
		}
	}
	lines.push('', '## Next actions', '');
	if (sorted.length === 0) {
		lines.push('- No action required — package is clean for tune-hkt.');
	} else {
		if (counts.error > 0)
			lines.push(
				`- Fix ${counts.error} error(s) — slot intersections and mixin/family shape break the nominal fast path`,
			);
		if (counts.warn > 0)
			lines.push(`- Review ${counts.warn} warn(s); \`--fix\` applies the mechanical ones`);
		if (!findings.some((f) => f.rule === 'slot-intersection' || f.rule === 'probe-inconclusive'))
			lines.push('- Re-run with `--probe` to confirm how the family slots actually resolve');
		if (!cost) lines.push('- Re-run with `--measure` for the cold cost budget');
	}
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function discoverPackages(): string[] {
	return readdirSync(PACKAGES_ROOT, { withFileTypes: true })
		.filter((e) => e.isDirectory() && existsSync(join(PACKAGES_ROOT, e.name, 'src')))
		.map((e) => join(PACKAGES_ROOT, e.name))
		.sort();
}

function main(argv: string[]): void {
	const args = argv.slice(2);
	let out: string | undefined;
	let target: string | undefined;
	let workspace = false;
	let probe = false;
	let measure = false;
	let fix = false;
	let maxMem = DEFAULT_MAX_MEMORY_MB;
	let maxTpl = DEFAULT_MAX_TYPES_PER_LINE;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === '--out' && i + 1 < args.length) out = args[++i];
		else if (a?.startsWith('--out=')) out = a.split('=')[1];
		else if (a === '--workspace') workspace = true;
		else if (a === '--probe') probe = true;
		else if (a === '--measure') measure = true;
		else if (a === '--fix') fix = true;
		else if (a?.startsWith('--max-memory-mb=')) maxMem = Number(a.split('=')[1]);
		else if (a?.startsWith('--max-types-per-line=')) maxTpl = Number(a.split('=')[1]);
		else if (a === '--') continue;
		else if (a && !a.startsWith('-')) target = a;
	}

	if (!workspace && !target) {
		console.error('tune-hkt: provide <pkg> (e.g. packages/sorted) or --workspace');
		process.exit(2);
	}

	const dirs = workspace
		? discoverPackages()
		: [
				target?.startsWith('packages/')
					? join(REPO_ROOT, target)
					: join(PACKAGES_ROOT, target as string),
			];

	const all: Finding[] = [];
	for (const dir of dirs) {
		if (!existsSync(dir)) {
			console.error(`tune-hkt: no such package: ${toRepoRel(dir)}`);
			process.exit(2);
		}
		const f: Finding[] = [];
		checkFamilyInConstraint(dir, f);
		checkDistributiveConditional(dir, f);
		reuseReviewApi(toRepoRel(dir), f);
		if (probe) probeSlots(dir, f);
		if (measure) measureCost(dir, f, maxMem, maxTpl);
		if (fix) applyFixes(dir, f);
		for (const x of f)
			all.push(workspace ? { ...x, location: `${toRepoRel(dir)}: ${x.location}` } : x);
	}

	const report = generateReport(workspace ? 'workspace' : toRepoRel(dirs[0] as string), all);
	console.log(report);
	if (out) {
		const abs = resolve(REPO_ROOT, out);
		if (!abs.startsWith(REPO_ROOT) && !abs.startsWith('/tmp')) {
			console.error(`Refusing to write outside repo and /tmp: ${abs}`);
			process.exit(2);
		}
		mkdirSync(dirname(abs), { recursive: true });
		writeFileSync(abs, report, 'utf-8');
	}
	process.exit(all.some((x) => x.severity === 'error') ? 1 : 0);
}

main(process.argv);
