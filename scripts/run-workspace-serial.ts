/**
 * Runs one package.json script across all workspaces, one package at a time,
 * in workspace dependency order.
 *
 * `bun --workspaces run <script>` starts packages in parallel (respecting
 * dependency order only as a lower bound), which makes tsc-heavy scripts such
 * as `build` and `typecheck` exhaust CPU and memory. Bun 1.3.8 has no way to
 * serialize workspace scripts: `bun run --parallel` / `--sequential` landed in
 * 1.3.9, and `--concurrent-scripts` applies to install lifecycle scripts only,
 * so the repo pinned to 1.3.8 got parallel builds silently.
 *
 * This script is kept instead of `bun run --sequential --workspaces` for two
 * reasons: it works on 1.3.8, and Bun's sequential runner sorts workspace
 * packages by name rather than by dependency graph. Order matters here — each
 * package's `tsconfig.common.json` only maps its own `@rimbu/<pkg>` paths, so
 * cross-package imports resolve through `node_modules` symlinks to
 * `dist/*.d.ts`, which must already exist.
 *
 * Usage:
 *   bun ./scripts/run-workspace-serial.ts build
 *   bun ./scripts/run-workspace-serial.ts typecheck
 *   bun ./scripts/run-workspace-serial.ts build --dry-run
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

type PackageJson = {
	name?: string;
	workspaces?: string[] | { packages?: string[] };
	scripts?: Record<string, string>;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
};

type Workspace = {
	name: string;
	dir: string;
	scripts: Record<string, string>;
	deps: string[];
};

function readPackageJson(dir: string): PackageJson | undefined {
	const file = join(dir, 'package.json');
	if (!existsSync(file)) return undefined;
	return JSON.parse(readFileSync(file, 'utf8')) as PackageJson;
}

function workspacePatterns(): string[] {
	const root = readPackageJson(ROOT);
	const workspaces = root?.workspaces;
	const patterns = Array.isArray(workspaces)
		? workspaces
		: (workspaces?.packages ?? []);
	if (patterns.length === 0) {
		throw new Error(`No workspaces found in ${join(ROOT, 'package.json')}`);
	}
	return patterns;
}

/** Expands the workspace globs used by this repo (`dir/*`, or a literal dir). */
function expandPattern(pattern: string): string[] {
	if (!pattern.endsWith('/*')) {
		const dir = join(ROOT, pattern);
		return existsSync(dir) ? [dir] : [];
	}
	const parent = join(ROOT, pattern.slice(0, -2));
	if (!existsSync(parent)) return [];
	return readdirSync(parent, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry) => join(parent, entry.name))
		.sort();
}

function collectWorkspaces(): Workspace[] {
	const workspaces: Workspace[] = [];
	const seen = new Set<string>();

	for (const pattern of workspacePatterns()) {
		if (pattern.includes('**')) {
			throw new Error(`Unsupported workspace glob: ${pattern}`);
		}
		for (const dir of expandPattern(pattern)) {
			if (seen.has(dir)) continue;
			seen.add(dir);
			const pkg = readPackageJson(dir);
			if (pkg === undefined) continue;
			workspaces.push({
				name: pkg.name ?? dir.slice(ROOT.length + 1),
				dir,
				scripts: pkg.scripts ?? {},
				// Only runtime deps constrain the order. Dev deps are deliberately
				// ignored: the workspace has dev-dep cycles (stream <-> hashed,
				// deep <-> sorted) that would make a topological sort impossible.
				deps: [
					...Object.keys(pkg.dependencies ?? {}),
					...Object.keys(pkg.peerDependencies ?? {}),
					...Object.keys(pkg.optionalDependencies ?? {}),
				],
			});
		}
	}

	return workspaces.sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * Kahn's algorithm over workspace-internal dependency edges, alphabetical by
 * name so the order is stable across machines.
 */
function sortByDependencies(workspaces: Workspace[]): Workspace[] {
	const byName = new Map(
		workspaces.map((workspace) => [workspace.name, workspace]),
	);

	// Pending workspace-internal dependencies per package.
	const pending = new Map<string, Set<string>>();
	for (const workspace of workspaces) {
		pending.set(
			workspace.name,
			new Set(
				workspace.deps.filter(
					(dep) => dep !== workspace.name && byName.has(dep),
				),
			),
		);
	}

	const sorted: Workspace[] = [];
	while (pending.size > 0) {
		let ready = [...pending.entries()]
			.filter(([, deps]) => deps.size === 0)
			.map(([name]) => name)
			.sort();

		if (ready.length === 0) {
			// Unexpected for runtime deps; keep going deterministically instead of
			// aborting the whole run.
			const first = [...pending.keys()].sort()[0];
			if (first === undefined) break;
			console.warn(
				`warn: circular dependency involving ${first}; running it before its dependencies.`,
			);
			ready = [first];
		}

		for (const name of ready) {
			const workspace = byName.get(name);
			if (workspace === undefined) continue;
			sorted.push(workspace);
			pending.delete(name);
			for (const deps of pending.values()) deps.delete(name);
		}
	}

	return sorted;
}

function main(): number {
	const [script, ...flags] = process.argv.slice(2);

	if (
		script === undefined ||
		flags.some((flag) => !['--dry-run'].includes(flag))
	) {
		console.error(
			'Usage: bun ./scripts/run-workspace-serial.ts <script> [--dry-run]',
		);
		return 1;
	}
	const dryRun = flags.includes('--dry-run');

	const workspaces = sortByDependencies(
		collectWorkspaces().filter(
			(workspace) => workspace.scripts[script] !== undefined,
		),
	);

	if (workspaces.length === 0) {
		console.error(`No workspace defines a "${script}" script.`);
		return 1;
	}

	console.log(
		`Running "${script}" in ${workspaces.length} workspace(s), serially:\n`,
	);

	for (const [index, workspace] of workspaces.entries()) {
		const label = `[${index + 1}/${workspaces.length}] ${workspace.name} (${script})`;
		console.log(`\n=== ${label} ===`);
		if (dryRun) continue;

		const result = spawnSync('bun', ['run', script], {
			cwd: workspace.dir,
			stdio: 'inherit',
		});
		if (result.error !== undefined) {
			console.error(
				`\nFailed to spawn ${script} in ${workspace.name}: ${result.error.message}`,
			);
			return 1;
		}
		if (result.status !== 0) {
			console.error(
				`\n${script} failed in ${workspace.name} (exit ${result.status ?? result.signal}).`,
			);
			return result.status ?? 1;
		}
	}

	console.log(`\nAll ${workspaces.length} workspace(s) completed "${script}".`);
	return 0;
}

process.exit(main());
