# write-docs — packages/hashed

## Summary

Found 25 docs findings. Counts: 0 error, 25 warn, 0 info. Requires attention for warn.

## Findings

| Severity | Rule | Location | Evidence | Suggested fix | Normative ref |
|---|---|---|---|---|---|
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:10 | `export interface HashMap<K, V> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:17 | `export namespace HashMap { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:18 | `export interface NonEmpty<K, V> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:25 | `export interface Builder<K, V> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:32 | `export interface Context<UK> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:35 | `export namespace Advanced { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:36 | `export interface Api<K, V, Tp extends Collection.Advanced.TypesBase> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:50 | `export interface BuilderApi<K, V, Tp extends Collection.Advanced.TypesBase> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:59 | `export interface ContextApi< has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:71 | `export interface KeyedContextApi< has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:87 | `export interface Family<K, V> extends MapCollection.Advanced.Family<K, V> { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:101 | `export type DefaultFactory = KeyedContextApi<any, Family<any, any>>; has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/map.ts:105 | `export const HashMap: HashMap.Advanced.DefaultFactory = has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:9 | `export interface HashSet<E> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:15 | `export namespace HashSet { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:16 | `export interface NonEmpty<E> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:22 | `export interface Builder<E> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:28 | `export interface Context<UE> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:31 | `export namespace Advanced { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:32 | `export interface Api<E, Tp extends Collection.Advanced.TypesBase> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:44 | `export interface BuilderApi<E, Tp extends Collection.Advanced.TypesBase> has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:49 | `export interface ContextApi< has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:59 | `export interface Family<E> extends SetCollection.Advanced.Family<E> { has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:72 | `export type DefaultFactory = Pick< has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |
| warn | missing-jsdoc | packages/hashed/src/public/set.ts:86 | `export const HashSet: HashSet.Advanced.DefaultFactory = has no JSDoc` | Add /** ... @example ```ts console.log(1); // => 1 ``` */ | AGENTS.md:546-573 §9, package.json:56-64 |

## Next actions

- Add 25 missing JSDoc/@example (warn) — run with --fix per AGENTS.md:546-573; with --force to augment existing /** without @example
- Run `bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --fix` to gap-fill 25 warn(s) (one block at a time, tabs/single quotes)
- Re-run `bun .opencode/skills/write-docs/scripts/run.ts -- packages/hashed --with-tools` to verify