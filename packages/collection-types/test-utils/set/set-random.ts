import { describe, expect, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';
import type { ValuedCollection } from '@rimbu/collection-types/collection/valued';
import type { SetCollection } from '@rimbu/collection-types/set';

import { Stream } from '@rimbu/stream';

function byNumber(a: number, b: number): number {
	return a - b;
}

/**
 * Structural on purpose: the sets under test are typed by the capability
 * intersection above, whose `Types` record is not the same `Types` as a bare
 * `SetCollection<number>`, so naming that type here would reject every call.
 */
function expectSet<T extends number>(s: {
	toArray(): T[];
}): {
	toEqual(i: Iterable<T>): void;
} {
	return {
		toEqual(i: Iterable<T>): void {
			expect(s.toArray().sort(byNumber)).toEqual([...i].sort(byNumber));
		},
	};
}

/**
 * The family these random tests run against.
 *
 * Passed as a type argument rather than through an `extends` clause: an
 * interface cannot extend both the aggregate `SetCollection.Advanced.Family` and
 * an individual `Capability.*` family, because their `_BUILDER` / `_CONTEXT` /
 * `_NORMAL` / … slots are not identical (TS2320). See root `AGENTS.md` §6.4.
 */
type Context = SetCollection.Context<
	Collection.Capability.WithToBuilder<any> &
		Collection.Capability.WithReducer<any> &
		Collection.Capability.WithAddEach<any> &
		ValuedCollection.Capability.WithDifference<any> &
		ValuedCollection.Capability.WithIntersection<any> &
		ValuedCollection.Capability.WithRemove<any> &
		ValuedCollection.Capability.WithSymmetricDifference<any> &
		ValuedCollection.Capability.WithUnion<any>
>;

/**
 * How many operations may pass between two full re-verifications. See
 * `Entangled.check`.
 */
const CHECK_FULL_EVERY = 20;

export function runSetRandomTestsWith(name: string, context: Context): void {
	class Entangled {
		jsset = new Set<number>();
		builder = context.builder();
		immm = context.empty<number>();
		log: string[] = [];
		sinceCheckFull = 0;

		check(): void {
			// O(1) invariants run after every operation.
			expect(this.builder.size).toEqual(this.jsset.size);
			expect(this.immm.size).toEqual(this.jsset.size);

			// The full re-verification is O(size), so running it after each of
			// ~1000 operations makes the case O(n^2). Every case finishes with an
			// explicit `checkFull()`.
			if (++this.sinceCheckFull < CHECK_FULL_EVERY) return;
			this.checkFull();
		}

		checkFull(): void {
			try {
				this.sinceCheckFull = 0;
				this.jsset.forEach((key): void => {
					expect(this.builder.has(key)).toBe(true);
					expect(this.immm.has(key)).toBe(true);
				});
			} catch (e) {
				console.log(
					'sizes',
					this.jsset.size,
					this.immm.size,
					this.builder.size,
				);
				throw e;
			}
		}

		addLog(action: string, ...values: any[]): void {
			if (values.length > 0) this.log.push(`${action}: ${values}`);
			else this.log.push(`${action}`);
		}

		add(value: number): void {
			this.addLog('add', value);
			this.jsset.add(value);
			this.builder.add(value);
			this.immm = this.immm.add(value);
		}

		remove(value: number): void {
			this.addLog('remove', value);
			this.jsset.delete(value);
			this.builder.remove(value);
			this.immm = this.immm.remove(value);
		}
	}

	describe(`${name} RSet`, (): void => {
		it('create', (): void => {
			context.empty<number>();
			context.of<number>(1);
			context.from([1, 1]);
		});

		it('empty', (): void => {
			const m = context.empty<number>();
			const empty = context.empty<number>();

			expect(m).toBe(empty);
			expect(m.size).toBe(0);
			expect(m.isEmpty).toBe(true);
			expect(m.nonEmpty()).toBe(false);
			expect(m.add(1).isEmpty).toBe(false);
			expect((): any => m.assumeNonEmpty()).toThrowError();
			expect(m.filter((v): boolean => false)).toBe(empty);
			expect(m.has(0)).toBe(false);
			// expect(m.keySet().isEmpty).toBe(true);
			expect(m.remove(0)).toBe(empty);
			expect(m.stream()).toBe(Stream.empty());
			expect(m.toBuilder().build()).toBe(empty);
		});

		it('add', (): void => {
			const ent = new Entangled();

			Stream.randomInt(0, 1000)
				.take(1000)
				.forEach((v): void => {
					ent.add(v);
					ent.check();
				});

			ent.checkFull();
		});

		it('remove', (): void => {
			const ent = new Entangled();

			const len = 1000;

			Stream.randomInt(0, len)
				.take(len)
				.forEach((v): void => {
					ent.add(v);
				});

			Stream.range({ amount: len }).forEach((v): void => {
				const r = Math.round(Math.random() * ent.jsset.size);
				ent.remove(r);
				ent.check();
			});

			ent.checkFull();
		});

		it('isEmpty', (): void => {
			expect(context.empty<number>().isEmpty).toBe(true);
			expect(context.of<number>(1).isEmpty).toBe(false);
		});

		it('nonEmpty', (): void => {
			expect(context.empty<number>().nonEmpty()).toBe(false);
			expect(context.of<number>(1).nonEmpty()).toBe(true);
		});

		it('assumeNonEmpty', (): void => {
			expect((): any => context.empty<number>().assumeNonEmpty()).toThrow();
			const m = context.of<number>(1);
			expect(m.assumeNonEmpty()).toBe(m);
		});

		it('removes duplicates', (): void => {
			expectSet(context.of<number>(1, 2, 2, 3, 3, 3)).toEqual([1, 2, 3]);
		});

		it('difference', (): void => {
			const s1 = context.of<number>(1, 2, 3, 4, 5);
			const s2 = context.of<number>(4, 5, 6, 7, 8);
			const s3 = context.of<number>(10, 11);
			expect(context.empty<number>().difference(context.empty<number>())).toBe(
				context.empty<number>(),
			);
			expect(s1.difference(context.empty<number>())).toBe(s1);
			expect(context.empty<number>().difference(s1)).toBe(
				context.empty<number>(),
			);
			expect(s1.difference(s1)).toBe(context.empty<number>());
			expectSet(s1.difference(s2)).toEqual([1, 2, 3]);
			expectSet(s2.difference(s1)).toEqual([6, 7, 8]);
			expect(s1.difference(s3)).toBe(s1);
			expect(s3.difference(context.of<number>(10, 11))).toBe(
				context.empty<number>(),
			);
		});

		it('union', (): void => {
			const s1 = context.of<number>(1, 2, 3, 4, 5);
			const s2 = context.of<number>(4, 5, 6, 7, 8);
			const s3 = context.of<number>(10, 11);
			expect(context.empty<number>().union(context.empty<number>())).toBe(
				context.empty<number>(),
			);
			expect(s1.union(context.empty<number>())).toBe(s1);
			expect(context.empty<number>().union(s1)).toBe(s1);
			expect(s1.union(s1)).toBe(s1);
			expectSet(s1.union(s2)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expectSet(s2.union(s1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
			expectSet(s1.union(s3)).toEqual([1, 2, 3, 4, 5, 10, 11]);
			expect(s3.union(context.of<number>(10, 11))).toBe(s3);
		});

		it('intersection', (): void => {
			const s1 = context.of<number>(1, 2, 3, 4, 5);
			const s2 = context.of<number>(4, 5, 6, 7, 8);
			const s3 = context.of<number>(10, 11);
			expect(
				context.empty<number>().intersection(context.empty<number>()),
			).toBe(context.empty<number>());
			expect(s1.intersection(context.empty<number>())).toBe(
				context.empty<number>(),
			);
			expect(context.empty<number>().intersection(s1)).toBe(
				context.empty<number>(),
			);
			expect(s1.intersection(s1)).toBe(s1);
			expectSet(s1.intersection(s2)).toEqual([4, 5]);
			expectSet(s1.intersection([4, 5, 6, 7, 8])).toEqual([4, 5]);
			expectSet(s2.intersection(s1)).toEqual([4, 5]);
			expect(s1.intersection(s3)).toBe(context.empty<number>());
			expect(s3.intersection(context.of<number>(10, 11))).toBe(s3);
		});

		it('symmetricDifference', (): void => {
			const s1 = context.of<number>(1, 2, 3, 4, 5);
			const s2 = context.of<number>(4, 5, 6, 7, 8);
			const s3 = context.of<number>(10, 11);
			expect(
				context.empty<number>().symmetricDifference(context.empty<number>()),
			).toBe(context.empty<number>());
			expect(s1.symmetricDifference(context.empty<number>())).toBe(s1);
			expect(context.empty<number>().symmetricDifference(s1)).toBe(s1);
			expect(s1.symmetricDifference(s1)).toBe(context.empty<number>());
			expectSet(s1.symmetricDifference(s2)).toEqual([1, 2, 3, 6, 7, 8]);
			expectSet(s2.symmetricDifference(s1)).toEqual([1, 2, 3, 6, 7, 8]);
			expectSet(s1.symmetricDifference(s3)).toEqual([1, 2, 3, 4, 5, 10, 11]);
			expect(s3.symmetricDifference(context.of<number>(10, 11))).toBe(
				context.empty<number>(),
			);
		});

		it('filter', (): void => {
			const m = context.from(Stream.range({ amount: 100 }));
			expect(m.size).toBe(100);
			expect(m.filter((v) => v % 2 === 0).size).toBe(50);
			expect(m.filter((v) => true)).toBe(m);
			expect(m.filter((v) => false).isEmpty).toBe(true);
		});

		it('foreach', (): void => {
			const m = context.from(Stream.range({ amount: 100 }));

			let state = 0;
			m.forEachIndexed((v, i): void => {
				state += v + i;
			});
			expect(state).toBe(9900);

			// cannot test order due to hashset
			state = 0;
			m.forEachIndexed((_, i, halt): void => {
				state += i;
				if (i > 10) halt();
			});
			expect(state).toBe(66);
		});

		it('has', (): void => {
			expect(context.empty<number>().has(1)).toBe(false);
			expect(context.of<number>(1, 2, 3).has(1)).toBe(true);
			expect(context.of<number>(1, 2, 3).has(8)).toBe(false);
		});

		it('remove', (): void => {
			expect(context.empty<number>().remove(1)).toBe(context.empty<number>());
			const m = context.of<number>(1, 2, 3);
			expectSet(m.remove(2)).toEqual([1, 3]);
			expect(m.remove(4)).toBe(m);
		});

		it('stream', (): void => {
			expect(context.empty<number>().stream().toArray()).toEqual([]);

			expectSet(context.of<number>(1, 2, 3)).toEqual([1, 2, 3]);
		});
	});

	describe(`${name} RSet builder`, (): void => {
		it('empty', (): void => {
			const b = context.builder<number>();

			expect(b.build()).toBe(context.empty<number>());
			expect(b.size).toBe(0);
			expect(b.isEmpty).toBe(true);
			expect(b.has(0)).toBe(false);
			b.remove(0);
			expect(b.build()).toBe(context.empty<number>());
			b.add(1);
			expect(b.isEmpty).toBe(false);
		});

		it('isEmpty', (): void => {
			expect(context.builder().isEmpty).toBe(true);
			expect(context.of<number>(1).toBuilder().isEmpty).toBe(false);
		});

		it('removes duplicates', (): void => {
			const b = context.builder<number>();
			expect(b.add(1)).toBe(true);
			expect(b.add(2)).toBe(true);
			expect(b.add(2)).toBe(false);
			expect(b.add(3)).toBe(true);
			expect(b.add(3)).toBe(false);
			expect(b.add(3)).toBe(false);
			expectSet(b.build()).toEqual([1, 2, 3]);
		});

		it('foreach', (): void => {
			const b = context.builder<number>();
			Stream.range({ amount: 100 }).forEach((v): void => {
				b.add(v);
			});

			let state = 0;
			b.forEachIndexed((v, i): void => {
				state += v + i;
			});
			expect(state).toBe(9900);

			// cannot test order due to hashset
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
			const filled = (): SetCollection.Builder<number> => {
				const b = context.builder<number>();
				b.addEach(Stream.range({ amount: 100 }));
				return b;
			};

			for (const mutate of [
				(b: SetCollection.Builder<number>): void => {
					b.forEach((): void => {
						b.add(5);
					});
				},
				(b: SetCollection.Builder<number>): void => {
					b.forEach((): void => {
						b.remove(5);
					});
				},
			]) {
				const b = filled();
				expect((): void => {
					mutate(b);
				}).toThrow();

				// The lock must have been released, or the builder is bricked.
				expect((): void => {
					b.add(1000);
				}).not.toThrow();
			}
		});

		it('halt does not leak the lock', (): void => {
			const b = context.builder<number>();
			b.addEach(Stream.range({ amount: 100 }));

			b.forEachIndexed((_, _i, halt): void => {
				halt();
			});

			expect((): void => {
				b.add(1000);
			}).not.toThrow();
		});

		it('has', (): void => {
			const b = context.builder<number>();
			expect(b.has(1)).toBe(false);

			b.addEach(Stream.range({ start: 1, end: 4 }));
			expect(b.has(1)).toBe(true);
			expect(b.has(8)).toBe(false);
		});

		it('remove', (): void => {
			const b = context.builder<number>();
			expect(b.remove(1)).toBe(false);

			b.addEach(Stream.range({ start: 1, end: 3 }));
			expect(b.remove(2)).toBe(true);
			expect(b.remove(4)).toBe(false);
		});
	});

	describe(`${name} RSet Builder`, (): void => {
		it('builds from existing set', () => {
			const source = context.of<number>(1, 2, 3);
			const builder = source.toBuilder();
			expect(builder.size).toBe(3);
			expect(builder.build()).toBe(source);
			builder.add(4);
			builder.add(1);
			expect(builder.size).toBe(4);
			expectSet(builder.build()).toEqual([1, 2, 3, 4]);
		});
	});
}
