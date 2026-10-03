import { describe, expect, it } from 'bun:test';

import type { MapCollection } from '@rimbu/collection-types/map';

import { Stream } from '@rimbu/stream';

/**
 * Structural on purpose: the maps under test are typed by the family below,
 * whose `Types` record is not the same `Types` as a bare `MapCollection<K, V>`,
 * so naming that type here would reject every call.
 */
function expectMap<K, V>(m: {
	toArray(): readonly (readonly [K, V])[];
}): {
	toEqual(expected: Iterable<readonly [K, V]>): void;
} {
	return {
		toEqual(expected: Iterable<readonly [K, V]>): void {
			expect(new Map(m.toArray())).toEqual(new Map(expected));
		},
	};
}

/**
 * The family these random tests run against.
 *
 * Note: this must be a *named* interface extending the aggregate
 * `MapCollection.Advanced.Family`, not an ad-hoc intersection of the individual
 * `Capability.*` families. An anonymous intersection is not cacheable by
 * symbol, so every slot resolution re-intersects all members recursively
 * through `_TYPES` / `_TYPES_NON_EMPTY`, and it does not reconstruct the real
 * `BuilderApi` (so `get` / `has` / `size` / `removeKeys` go missing). An
 * interface extending the aggregate *and* individual capability families is
 * rejected outright (TS2320), because their `_BUILDER` / `_CONTEXT` / `_NORMAL`
 * slots are not identical. See root `AGENTS.md` §6.4 and the identical note in
 * `map-collection-standard.ts`.
 */
interface Capabilities extends MapCollection.Advanced.Family<any, any> {}

type Context = MapCollection.Context<Capabilities>['keyedContext'];

/**
 * How many operations may pass between two full re-verifications. See
 * `Entangled.check`.
 */
const CHECK_FULL_EVERY = 20;

export function runMapRandomTestsWith(name: string, context: Context): void {
	class Entangled {
		map = new Map<number, number>();
		builder = context.builder();
		immm = context.empty();
		log: string[] = [];
		sinceCheckFull = 0;

		check(): void {
			// O(1) invariants run after every operation.
			expect(this.builder.size).toEqual(this.map.size);
			expect(this.immm.size).toEqual(this.map.size);

			// The full re-verification is O(size), so running it after each of
			// ~1000 operations makes the case O(n^2). Every case finishes with an
			// explicit `checkFull()`.
			if (++this.sinceCheckFull < CHECK_FULL_EVERY) return;
			this.checkFull();
		}

		checkFull(): void {
			try {
				this.sinceCheckFull = 0;
				this.map.forEach((value, key): void => {
					expect(this.builder.get(key, 'a')).toEqual(value);
					expect(this.immm.get(key, 'a')).toEqual(value);
				});
			} catch (e) {
				console.log('sizes', this.map.size, this.immm.size, this.builder.size);
				throw e;
			}
		}

		addLog(action: string, ...values: any[]): void {
			if (values.length > 0) this.log.push(`${action}: ${values}`);
			else this.log.push(`${action}`);
		}

		checkGet(index: number): void {
			const getmap = this.map.get(index);
			const gethm = this.immm.get(index, undefined);
			const gethb = this.builder.get(index, undefined);

			try {
				expect(gethm).toEqual(getmap);
				expect(gethb).toEqual(getmap);
			} catch (e) {
				console.log(this.log);
				console.log('size', this.map.size, this.immm.size, this.builder.size);
				console.log([...this.map].sort());
				console.log(this.immm.toArray().sort());
				throw e;
			}
		}

		set(key: number, value: number): void {
			this.addLog('set', key, value);
			this.map.set(key, value);
			this.builder.set(key, value);
			this.immm = this.immm.set(key, value);
		}

		addEntry(entry: [number, number]): void {
			this.addLog('addEntry', entry);
			this.map.set(entry[0], entry[1]);
			this.builder.set(entry[0], entry[1]);
			this.immm = this.immm.set(entry[0], entry[1]);
		}

		removeKey(key: number): void {
			this.addLog('remove', key);
			this.map.delete(key);
			this.builder.removeKey(key);
			this.immm = this.immm.removeKey(key);
		}
	}

	describe(`${name} RMap`, (): void => {
		it('empty', (): void => {
			const m = context.empty();
			const empty = context.empty();

			expect(m).toBe(empty);
			expect(m.size).toBe(0);
			expect(m.isEmpty).toBe(true);
			expect(m.nonEmpty()).toBe(false);
			expect(m.set(1, 2).isEmpty).toBe(false);
			expect(m.assumeNonEmpty).toThrowError();
			expect(m.filter((): boolean => false)).toBe(empty);
			expect(m.get(0, 'a')).toBe('a');
			// expect(m.keySet().isEmpty).toBe(true);
			expect(m.mapValues((): number => 1)).toBe<any>(empty);
			expect(m.modifyAtKey(0, { ifExists: { update: (): number => 5 } })).toBe(
				empty,
			);
			expect(m.removeKey(0)).toBe(empty);
			expect(m.set(1, 2).isEmpty).toBe(false);
			expect(m.stream()).toBe(Stream.empty());
			expect(m.streamKeys()).toBe(Stream.empty());
			expect(m.streamValues()).toBe(Stream.empty());
			expect(m.has(1)).toBe(false);
			expect(m.toBuilder().build()).toBe(empty);
		});

		it('set', (): void => {
			const ent = new Entangled();

			Stream.randomInt(0, 1000)
				.take(1000)
				.forEach((v): void => {
					ent.set(v, v);
					ent.check();
				});

			ent.checkFull();
		});

		it('addEntry', (): void => {
			const ent = new Entangled();

			Stream.randomInt(0, 1000)
				.take(1000)
				.forEach((v): void => {
					ent.addEntry([v, v]);
					ent.check();
				});

			ent.checkFull();
		});

		it('get', (): void => {
			const ent = new Entangled();

			const len = 3000;
			let i = 0;
			Stream.randomInt(0, len)
				.take(len)
				.forEach((v): void => {
					ent.set(v, i++);
				});

			Stream.range({ amount: len }).forEach((v): void => {
				ent.checkGet(v);
			});
		});

		it('remove', (): void => {
			const ent = new Entangled();

			const len = 1000;
			let i = 0;
			Stream.randomInt(0, len)
				.take(len)
				.forEach((v): void => {
					ent.set(v, i++);
				});

			Stream.range({ amount: len }).forEach((): void => {
				const r = Math.round(Math.random() * ent.map.size);
				ent.removeKey(r);
				ent.check();
			});

			ent.checkFull();
		});

		it('set existing key overrides', (): void => {
			const m = context.of([1, 1], [2, 2], [3, 3]);
			expect(m.set(1, 4).get(1, 'a')).toEqual(4);
		});

		it('isEmpty', (): void => {
			expect(context.empty().isEmpty).toBe(true);
			expect(context.of([1, 1]).isEmpty).toBe(false);
		});

		it('nonEmpty', (): void => {
			expect(context.empty().nonEmpty()).toBe(false);
			expect(context.of([1, 1]).nonEmpty()).toBe(true);
		});

		it('assumeNonEmpty', (): void => {
			expect((): any => context.empty().assumeNonEmpty()).toThrow();
			const m = context.of([1, 1]);
			expect(m.assumeNonEmpty()).toBe(m);
		});

		it('filter', (): void => {
			const m = context.from(Stream.range({ amount: 100 }).indexed());
			expect(m.size).toBe(100);
			expect(m.filter((v) => v[0] % 2 === 0).size).toBe(50);
			expect(m.filter((v) => true)).toBe(m);
			expect(m.filter((v) => false).isEmpty).toBe(true);
		});

		it('foreach', (): void => {
			const m = context.from(Stream.range({ amount: 100 }).indexed());

			let state = 0;
			m.forEachIndexed((e, i): void => {
				state += e[0] + e[1] + i;
			});
			expect(state).toBe(14850);

			// cannot test order due to hashmap
			state = 0;
			m.forEachIndexed((_, i, halt): void => {
				state += i;
				if (i > 10) halt();
			});
			expect(state).toBe(66);
		});

		it('get', (): void => {
			expect(context.empty().get(1, 'a')).toBe('a');
			expect(context.of([1, 1]).get(1, 'a')).toBe(1);
			expect(context.of([1, 1]).get(2, 'a')).toBe('a');
		});

		it('hasKey', (): void => {
			expect(context.empty().has(1)).toBe(false);
			expect(context.of([1, 1]).has(1)).toBe(true);
			expect(context.of([1, 1]).has(2)).toBe(false);
		});

		it('mapValues', (): void => {
			expect(context.empty().mapValues((v) => 1)).toBe(context.empty());
			expectMap(context.of([1, 1]).mapValues((v) => v + 1)).toEqual([[1, 2]]);
			expectMap(
				context.of([1, 1], [2, 2], [3, 3]).mapValues((v) => v + 1),
			).toEqual([
				[1, 2],
				[2, 3],
				[3, 4],
			]);
		});

		it('modifyAtKey', (): void => {
			expect(context.empty().modifyAtKey(1, {})).toBe(context.empty());
			expectMap(context.empty().modifyAtKey(1, { ifNew: { set: 1 } })).toEqual([
				[1, 1],
			]);
			expectMap(
				context.empty().modifyAtKey(1, { ifNew: { create: () => 1 } }),
			).toEqual([[1, 1]]);
			expect(
				context.empty().modifyAtKey(1, { ifExists: { update: () => 1 } }),
			).toBe(context.empty());
			expect(
				context.empty().modifyAtKey(1, {
					ifExists: { update: (_: any, remove: any) => remove },
				}),
			).toBe(context.empty());
			const m = context.of([1, 1], [2, 2], [3, 3]);
			expect(m.modifyAtKey(1, { ifNew: { set: 2 } })).toBe(m);
			expect(m.modifyAtKey(1, { ifNew: { create: () => 2 } })).toBe(m);
			expectMap(
				m.modifyAtKey(1, { ifExists: { update: (v) => v + 1 } }),
			).toEqual([
				[1, 2],
				[2, 2],
				[3, 3],
			]);
			expectMap(
				m.modifyAtKey(2, { ifExists: { update: (_, remove) => remove } }),
			).toEqual([
				[1, 1],
				[3, 3],
			]);
			expectMap(m.modifyAtKey(4, { ifNew: { set: 4 } })).toEqual([
				[1, 1],
				[2, 2],
				[3, 3],
				[4, 4],
			]);
			expectMap(m.modifyAtKey(4, { ifNew: { create: () => 4 } })).toEqual([
				[1, 1],
				[2, 2],
				[3, 3],
				[4, 4],
			]);
			expect(m.modifyAtKey(4, { ifExists: { update: (v) => v + 1 } })).toBe(m);
			expect(
				m.modifyAtKey(4, { ifExists: { update: (_, remove) => remove } }),
			).toBe(m);
			expect(
				context
					.of([1, 1])
					.modifyAtKey(1, { ifExists: { update: (_, remove) => remove } }),
			).toBe(context.empty());
		});

		it('remove', (): void => {
			expect(context.empty().removeKey(1)).toBe(context.empty());
			const m = context.of([1, 1], [2, 2]);
			expectMap(m.removeKey(1)).toEqual([[2, 2]]);
			expect(m.removeKey(4)).toBe(m);
			expect(context.of([1, 1]).removeKey(1)).toBe(context.empty());
		});

		it('removeKeyAndReturn', (): void => {
			const empty = context.empty();
			expect(empty.removeKeyAndReturn(1)).toEqual({
				collection: empty,
				hasResult: false,
				result: undefined,
				hasChanged: false,
			});
			const m = context.of([1, 1], [2, 2]);
			const r = m.removeKeyAndReturn(1);
			expect(r.hasChanged).toBe(true);
			expect(r.hasResult).toBe(true);
			expect(r.result).toBe(1);
			expectMap(r.collection).toEqual([[2, 2]]);

			const absent = m.removeKeyAndReturn(4);
			expect(absent.hasChanged).toBe(false);
			expect(absent.hasResult).toBe(false);
			expect(absent.collection).toBe(m);

			expect(m.removeKeyAndReturn(4, 'a').result).toBe('a');
		});

		it('updateAtKey', (): void => {
			expect(context.empty<number, number>().updateAtKey(1, (v) => v + 1)).toBe(
				context.empty(),
			);
			const m = context.of([1, 1], [2, 2], [3, 3]);
			expectMap(m.updateAtKey(2, () => 3)).toEqual([
				[1, 1],
				[2, 3],
				[3, 3],
			]);
			expectMap(m.updateAtKey(2, (v) => v + 1)).toEqual([
				[1, 1],
				[2, 3],
				[3, 3],
			]);
			expect(m.updateAtKey(4, () => 3)).toBe(m);
		});

		it('updateAtKeyAndReturn', (): void => {
			const m = context.of([1, 1], [2, 2], [3, 3]);

			const r = m.updateAtKeyAndReturn(2, (v) => v + 1);
			expect(r.hasResult).toBe(true);
			expect(r.hasChanged).toBe(true);
			expect(r.result).toEqual([2, 3]);
			expectMap(r.collection).toEqual([
				[1, 1],
				[2, 3],
				[3, 3],
			]);

			const absent = m.updateAtKeyAndReturn(4, () => 3);
			expect(absent.hasResult).toBe(false);
			expect(absent.hasChanged).toBe(false);
			expect(absent.result).toEqual([undefined, undefined]);
			expect(absent.collection).toBe(m);
		});

		it('stream', (): void => {
			expect(context.empty().stream().toArray()).toEqual([]);

			expectMap(context.of([1, 1], [2, 2], [3, 3])).toEqual([
				[1, 1],
				[2, 2],
				[3, 3],
			]);
		});

		it('streamKeys', (): void => {
			expect(context.empty().streamKeys().toArray()).toEqual([]);

			expect(
				context.of([1, 10], [2, 20], [3, 30]).streamKeys().toArray(),
			).toEqual([1, 2, 3]);
		});

		it('streamValues', (): void => {
			expect(context.empty().streamValues().toArray()).toEqual([]);

			expect(
				context.of([1, 10], [2, 20], [3, 30]).streamValues().toArray(),
			).toEqual([10, 20, 30]);
		});
	});

	describe(`${name} RMap builder`, (): void => {
		it('empty', (): void => {
			const b = context.builder();

			expect(b.isEmpty).toBe(true);
			expect(b.size).toBe(0);
			expect(b.get(0, 'a')).toBe('a');
			expect(b.has(0)).toBe(false);
			expect(b.build()).toBe(context.empty());
		});

		it('set existing key overrides', (): void => {
			const b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.get(1, 'a')).toBe(1);
			b.set(1, 4);
			expect(b.get(1, 'a')).toBe(4);
		});

		it('foreach', (): void => {
			const b = context.builder<number, number>();
			Stream.range({ amount: 100 })
				.indexed()
				.forEach((e) => {
					b.set(e[0], e[1]);
				});

			let state = 0;
			b.forEachIndexed((e, i): void => {
				state += e[0] + e[1] + i;
			});
			expect(state).toBe(14850);

			// cannot test order due to hashmap
			state = 0;
			b.forEachIndexed((_, i, halt): void => {
				state += i;
				if (i > 10) halt();
			});
			expect(state).toBe(66);
		});

		it('foreach checklock', (): void => {
			// Each case gets a fresh builder, and asserts the builder is still
			// usable afterwards. Reusing one builder makes every case after the
			// first pass for the wrong reason: once the lock leaks, all later
			// mutators throw regardless of whether they are guarded.
			const filled = (): MapCollection.Builder<number, number> => {
				const b = context.builder<number, number>();
				Stream.range({ amount: 100 })
					.indexed()
					.forEach((e) => {
						b.set(e[0], e[1]);
					});
				return b;
			};

			for (const mutate of [
				(b: MapCollection.Builder<number, number>): void => {
					b.forEach((): void => {
						b.set(10, 100);
					});
				},
				(b: MapCollection.Builder<number, number>): void => {
					b.forEach((): void => {
						b.set(10, 100);
					});
				},
				(b: MapCollection.Builder<number, number>): void => {
					b.forEach((): void => {
						b.modifyAtKey(1, {
							ifNew: { set: 2 },
							ifExists: { update: (v: any) => v },
						});
					});
				},
				(b: MapCollection.Builder<number, number>): void => {
					b.forEach((): void => {
						b.removeKey(1);
					});
				},
				(b: MapCollection.Builder<number, number>): void => {
					b.forEach((): void => {
						b.updateAtKey(1, () => 3);
					});
				},
			]) {
				const b = filled();
				expect((): void => {
					mutate(b);
				}).toThrow();

				// The lock must have been released, or the builder is bricked.
				expect((): void => {
					b.set(1000, 1000);
				}).not.toThrow();
			}
		});

		it('halt does not leak the lock', (): void => {
			const b = context.builder<number, number>();
			Stream.range({ amount: 100 })
				.indexed()
				.forEach((e) => {
					b.set(e[0], e[1]);
				});

			b.forEachIndexed((_, _i, halt): void => {
				halt();
			});

			expect((): void => {
				b.set(1000, 1000);
			}).not.toThrow();
		});

		it('get', (): void => {
			expect(context.builder().get(1, 'a')).toBe('a');
			const b = context.builder();
			b.set(1, 1);
			expect(b.get(1, 'a')).toBe(1);
			expect(b.get(2, 'a')).toBe('a');
		});

		it('hasKey', (): void => {
			expect(context.builder().has(1)).toBe(false);
			const b = context.builder();
			b.set(1, 1);
			expect(b.has(1)).toBe(true);
			expect(b.has(2)).toBe(false);
		});

		it('modifyAt', (): void => {
			let b = context.builder<number, number>();
			expect(b.modifyAtKey(1, {})).toBe(false);
			expect(b.size).toBe(0);

			b = context.builder();
			expect(b.modifyAtKey(1, { ifNew: { set: 1 } })).toBe(true);
			expect(b.get(1, 'a')).toBe(1);

			b = context.builder();
			expect(b.modifyAtKey(1, { ifNew: { create: () => 1 } })).toBe(true);
			expect(b.get(1, 'a')).toBe(1);

			b = context.builder();
			expect(b.modifyAtKey(1, { ifExists: { update: () => 1 } })).toBe(false);
			expect(b.size).toBe(0);

			b = context.builder();
			expect(
				b.modifyAtKey(1, { ifExists: { update: (_, remove) => remove } }),
			).toBe(false);
			expect(b.size).toBe(0);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(1, { ifNew: { set: 2 } })).toBe(false);
			expect(b.get(1, 'a')).toBe(1);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(1, { ifNew: { create: () => 2 } })).toBe(false);
			expect(b.get(1, 'a')).toBe(1);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(1, { ifExists: { update: (v) => v + 1 } })).toBe(
				true,
			);
			expect(b.get(1, 'a')).toBe(2);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(
				b.modifyAtKey(2, { ifExists: { update: (_, remove) => remove } }),
			).toBe(true);
			expect(b.get(2, 'a')).toBe('a');

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(4, { ifNew: { set: 4 } })).toBe(true);
			expect(b.get(4, 'a')).toBe(4);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(4, { ifNew: { create: () => 4 } })).toBe(true);
			expect(b.get(4, 'a')).toBe(4);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.modifyAtKey(4, { ifExists: { update: (v) => v + 1 } })).toBe(
				false,
			);
			expect(b.get(4, 'a')).toBe('a');

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(
				b.modifyAtKey(4, { ifExists: { update: (_, remove) => remove } }),
			).toBe(false);
			expect(b.get(4, 'a')).toBe('a');
		});

		it('remove', (): void => {
			let b = context.builder<number, number>();

			expect(b.removeKey(1)).toBe(undefined);
			expect(b.removeKey(1, 'a')).toBe('a');
			expect(b.build()).toBe(context.empty());

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.removeKey(1)).toBe(1);
			expectMap(b.build()).toEqual([[2, 2]]);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.removeKey(4)).toBe(undefined);
			expect(b.removeKey(4, 'a')).toBe('a');
			expectMap(b.build()).toEqual([
				[1, 1],
				[2, 2],
			]);
		});

		it('updateAtKey', (): void => {
			let b = context.builder<number, number>();

			// Absent key: both slots fall back to `otherwise` (default undefined).
			expect(b.updateAtKey(1, (v) => v + 1)).toEqual([undefined, undefined]);
			expect(b.updateAtKey(1, (v) => v + 1, 'a')).toEqual(['a', 'a']);
			expect(b.build()).toBe(context.empty());

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.updateAtKey(2, () => 3)).toEqual([2, 3]);
			expectMap(b.build()).toEqual([
				[1, 1],
				[2, 3],
				[3, 3],
			]);

			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.updateAtKey(2, (v) => v + 1)).toEqual([2, 3]);
			expectMap(b.build()).toEqual([
				[1, 1],
				[2, 3],
				[3, 3],
			]);

			// Absent key stays absent: `updateAtKey` has no `ifNew` arm.
			b = context.builder();
			Stream.of<[number, number]>([1, 1], [2, 2], [3, 3]).forEach((e) => {
				b.set(e[0], e[1]);
			});
			expect(b.updateAtKey(4, () => 3, 'a')).toEqual(['a', 'a']);
			expectMap(b.build()).toEqual([
				[1, 1],
				[2, 2],
				[3, 3],
			]);
		});
	});

	describe(`${name} RMap Builder`, (): void => {
		it('builds from existing map', () => {
			const source = context.of([1, 1], [2, 2], [3, 3]);
			const builder = source.toBuilder();
			expect(builder.size).toBe(3);
			expect(builder.build()).toBe(source);
			builder.set(4, 4);
			builder.set(1, 5);
			expect(builder.size).toBe(4);
			expectMap(builder.build()).toEqual([
				[1, 5],
				[2, 2],
				[3, 3],
				[4, 4],
			]);
		});
	});
}
