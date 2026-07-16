import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import ts from 'ts6';

const ROOT = resolve(import.meta.dirname, '..');
const PACKAGES_DIR = join(ROOT, 'packages');

const ORDER = [
	'base',
	'common',
	'collection-types',
	'stream',
	'hashed',
	'sorted',
	'ordered',
	'list',
	'multimap',
	'multiset',
	'bimap',
	'bimultimap',
	'graph',
	'table',
	'proximity',
	'deep',
	'channel',
	'task',
	'actor',
	'reactor',
	'spy',
	'typical',
	'core',
];

// Collect entry .d.ts files for a package (public tier + root + esm root).
function entryFiles(pkg: string): string[] {
	const dist = join(PACKAGES_DIR, pkg, 'dist');
	if (!existsSync(dist)) return [];
	const files: string[] = [];

	const scan = (dir: string, isPublicRoot: boolean) => {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) {
				if (entry === 'internal' || entry === 'advanced') continue;
				// only descend into public/ (and esm for reactor-like layouts)
				if (isPublicRoot || entry === 'public' || entry === 'esm')
					scan(full, false);
			} else if (entry.endsWith('.d.ts') && !entry.includes('.map')) {
				if (statSync(full).isFile()) files.push(full);
			}
		}
	};
	scan(dist, true);
	return files;
}

// Build a program over the whole dist tree so imports resolve via workspace symlinks.
function buildProgram(): ts.Program {
	const allDts: string[] = [];
	for (const pkg of ORDER) {
		allDts.push(...entryFiles(pkg));
		// also include internal base files so cross-file resolution works
		const dist = join(PACKAGES_DIR, pkg, 'dist');
		if (existsSync(dist)) {
			const walk = (d: string) => {
				for (const e of readdirSync(d)) {
					const f = join(d, e);
					if (statSync(f).isDirectory()) walk(f);
					else if (e.endsWith('.d.ts') && !e.includes('.map')) allDts.push(f);
				}
			};
			// include internal too (needed for checker to resolve ListBase etc.)
			walk(dist);
		}
	}
	const program = ts.createProgram(allDts, {
		declaration: true,
		skipLibCheck: true,
		types: [],
		target: ts.ScriptTarget.ES2022,
		moduleResolution: ts.ModuleResolutionKind.Bundler,
	});
	return program;
}

function main() {
	const program = buildProgram();
	const checker = program.getTypeChecker();

	const out: string[] = [];
	out.push('# Rimbu Public API Surface (resolved)');
	out.push('');
	out.push(
		'Generated via the TypeScript TypeChecker from each package entry point, ' +
			'resolving inherited members within the same package so that collection ' +
			'interfaces list their own methods plus those inherited from base classes ' +
			'(e.g. List shows methods from ListBase). Cross-package types are kept as ' +
			'references (covered by their own package section). Base-class declarations ' +
			'live in the package internal/ and advanced/ tiers and are pulled in when ' +
			'reachable from a public type, so collection interfaces show their full ' +
			'method set including inherited members.',
	);
	out.push('');

	let covered = 0;
	let totalLines = 0;

	for (const pkg of ORDER) {
		const entries = entryFiles(pkg);
		if (entries.length === 0) continue;
		covered++;

		out.push(`## @rimbu/${pkg}`);
		out.push('');
		out.push('```ts');

		const seen = new Set<string>();
		const emitted: string[] = [];

		const emitSymbol = (symbol: ts.Symbol, depth: number) => {
			const decls = symbol.getDeclarations();
			if (!decls || decls.length === 0) return;
			// determine owning package of the declaration file
			const declFile = decls[0].getSourceFile().fileName;
			const isSamePkg = declFile.includes(join('packages', pkg, 'dist'));

			// Only emit declarations that belong to this package (within-package scope).
			// Cross-package symbols are left as references.
			if (!isSamePkg) return;
			if (symbol.declarations) {
				for (const d of symbol.declarations) {
					if (
						ts.isInterfaceDeclaration(d) ||
						ts.isTypeAliasDeclaration(d) ||
						ts.isEnumDeclaration(d) ||
						ts.isClassDeclaration(d) ||
						ts.isFunctionDeclaration(d) ||
						ts.isVariableDeclaration(d) ||
						ts.isModuleDeclaration(d) ||
						ts.isNamespaceExportDeclaration(d)
					) {
						const key = d.getSourceFile().fileName + ':' + d.pos + ':' + d.end;
						if (seen.has(key)) return;
						seen.add(key);
						// getFullText captures leading doc comments/trivia; trim trailing newline
						const text = d.getFullText().trim();
						emitted.push(text);
					}
				}
			}

			// For interfaces/classes, also resolve inherited members from base types
			// declared in the same package, and emit those base declarations.
			for (const d of decls) {
				if (
					(ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d)) &&
					d.heritageClauses
				) {
					for (const hc of d.heritageClauses) {
						for (const t of hc.types) {
							const baseType = checker.getTypeAtLocation(t);
							if (!baseType) continue;
							const baseSym =
								baseType.symbol ??
								(t.expression
									? checker.getSymbolAtLocation(t.expression)
									: undefined);
							if (baseSym) emitSymbol(baseSym, depth + 1);
							if (baseType && typeof baseType === 'object') {
								const bases = checker.getBaseTypes
									? checker.getBaseTypes(baseType)
									: typeof baseType.getBaseTypes === 'function'
										? baseType.getBaseTypes()
										: [];
								for (const b of bases) {
									if (b.symbol) emitSymbol(b.symbol, depth + 1);
								}
							}
						}
					}
				}
			}
		};

		// enumerate exported symbols from each entry file
		for (const file of entries) {
			const sf = program.getSourceFile(file);
			if (!sf) continue;
			const fileSym = checker.getSymbolAtLocation(sf);
			const exports = fileSym?.exports;
			if (exports) {
				exports.forEach((sym, name) => {
					if (name.startsWith('__')) return;
					emitSymbol(sym, 0);
				});
			}
			// also handle `export * from` re-exports
			for (const stmt of sf.statements) {
				if (
					ts.isExportDeclaration(stmt) &&
					stmt.moduleSpecifier &&
					ts.isStringLiteral(stmt.moduleSpecifier)
				) {
					const modSym = checker.getSymbolAtLocation(stmt.moduleSpecifier);
					const modExports = modSym?.exports;
					if (modExports) {
						modExports.forEach((sym) => emitSymbol(sym, 0));
					}
				}
			}
		}

		if (emitted.length === 0) {
			out.push(`// (no resolvable declarations)`);
		} else {
			out.push(emitted.join('\n\n'));
		}
		out.push('```');
		out.push('');
	}

	const text = out.join('\n');
	totalLines = text.split('\n').length;
	writeFileSync(join(ROOT, 'API_SURFACE.md'), text);

	console.log(`Packages covered: ${covered}/${ORDER.length}`);
	console.log(`Total lines: ${totalLines}`);
	console.log(`Output: ${join(ROOT, 'API_SURFACE.md')}`);
}

main();
