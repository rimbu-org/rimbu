import { describe, expect, it } from 'bun:test';

import type { BiMultiMap } from '@rimbu/bimultimap';

import { Stream } from '@rimbu/stream';

/**
 * A bidirectional association model: forward `key -> set of values` and reverse
 * `value -> set of keys`, maintained independently so that a desync in either
 * direction is detectable.
 */
class Model {
	fwd = new Map<number, Set<number>>();

	rev = new Map<number, Set<number>>();

	associations(): number {
		let count = 0;
		for (const values of this.fwd.values()) count += values.size;
		return count;
	}

	private link(key: number, value: number): void {
		let values = this.fwd.get(key);
		if (undefined === values) {
			values = new Set();
			this.fwd.set(key, values);
		}
		values.add(value);

		let keys = this.rev.get(value);
		if (undefined === keys) {
			keys = new Set();
			this.rev.set(value, keys);
		}
		keys.add(key);
	}

	private unlink(key: number, value: number): void {
		const values = this.fwd.get(key);
		if (undefined !== values) {
			values.delete(value);
			if (values.size <= 0) this.fwd.delete(key);
		}

		const keys = this.rev.get(value);
		if (undefined !== keys) {
			keys.delete(key);
			if (keys.size <= 0) this.rev.delete(value);
		}
	}

	add(key: number, value: number): void {
		this.link(key, value);
	}

	setEachValue(key: number, values: number[]): void {
		const previous = this.fwd.get(key);
		if (undefined !== previous)
			for (const value of previous) this.unlink(key, value);
		for (const value of values) this.link(key, value);
	}

	setEachKey(value: number, keys: number[]): void {
		const previous = this.rev.get(value);
		if (undefined !== previous)
			for (const key of previous) this.unlink(key, value);
		for (const key of keys) this.link(key, value);
	}

	removeEntry(key: number, value: number): void {
		this.unlink(key, value);
	}

	removeKey(key: number): void {
		const values = this.fwd.get(key);
		if (undefined === values) return;
		for (const value of [...values]) this.unlink(key, value);
	}

	removeValue(value: number): void {
		const keys = this.rev.get(value);
		if (undefined === keys) return;
		for (const key of [...keys]) this.unlink(key, value);
	}

	/** The reverse map must be the exact inverse of the forward map. */
	checkSelfConsistent(): void {
		const rebuilt = new Map<number, Set<number>>();
		for (const [key, values] of this.fwd) {
			for (const value of values) {
				let keys = rebuilt.get(value);
				if (undefined === keys) {
					keys = new Set();
					rebuilt.set(value, keys);
				}
				keys.add(key);
			}
		}
		expect([...rebuilt.keys()].sort(byNumber)).toEqual(
			[...this.rev.keys()].sort(byNumber),
		);
		for (const [value, keys] of rebuilt) {
			expect([...(this.rev.get(value) ?? [])].sort(byNumber)).toEqual(
				[...keys].sort(byNumber),
			);
		}
	}
}

function byNumber(a: number, b: number): number {
	return a - b;
}

function readSide(
	side: { getValues(key: number): { stream(): Stream<number> } },
	keys: number[],
): [number, number[]][] {
	return keys.map((key) => [
		key,
		side.getValues(key).stream().toArray().sort(byNumber),
	]);
}

export function runBiMultiMapRandomTestsWith(
	name: string,
	context: BiMultiMap.Context<any, any>,
): void {
	/**
	 * Applies each operation to an immutable instance and a builder in lockstep
	 * with the model, then verifies both against it — including the collection's
	 * two internal maps, which no existing test inspects.
	 */
	class Entangled {
		model = new Model();

		builder = context.builder<readonly [number, number]>();

		immm = context.empty<readonly [number, number]>();

		ops: string[] = [];

		trace(...parts: unknown[]): void {
			this.ops.push(parts.map((p) => JSON.stringify(p)).join(' '));
			if (this.ops.length > 12) this.ops.shift();
		}

		check(): void {
			this.model.checkSelfConsistent();

			const keys = [...this.model.fwd.keys()].sort((a, b) => a - b);
			const values = [...this.model.rev.keys()].sort((a, b) => a - b);
			const modelForward = keys.map(
				(key) =>
					[key, [...(this.model.fwd.get(key) ?? [])].sort(byNumber)] as [
						number,
						number[],
					],
			);
			const modelReverse = values.map(
				(value) =>
					[value, [...(this.model.rev.get(value) ?? [])].sort(byNumber)] as [
						number,
						number[],
					],
			);

			const associations = this.model.associations();
			const built = this.builder.build();

			expect({
				ops: this.ops,
				immutableForward: readSide(this.immm.keyValueMultiMap, keys),
				immutableReverse: readSide(this.immm.valueKeyMultiMap, values),
				builderForward: readSide(built.keyValueMultiMap, keys),
				builderReverse: readSide(built.valueKeyMultiMap, values),
				modelForward,
				modelReverse,
				immutableSize: this.immm.size,
				builderSize: built.size,
				modelAssociations: associations,
			}).toEqual({
				ops: this.ops,
				immutableForward: modelForward,
				immutableReverse: modelReverse,
				builderForward: modelForward,
				builderReverse: modelReverse,
				modelForward,
				modelReverse,
				immutableSize: associations,
				builderSize: associations,
				modelAssociations: associations,
			});

			expect(this.immm.keySize).toBe(keys.length);
			expect(built.keySize).toBe(keys.length);

			// Every association must be visible from both directions.
			for (const [key, entries] of modelForward) {
				for (const value of entries) {
					expect(this.immm.hasEntry(key, value)).toBe(true);
					expect(built.hasEntry(key, value)).toBe(true);
					expect(
						[...this.immm.getKeys(value).stream().toArray()].sort(),
					).toContain(key);
				}
			}
		}

		add(key: number, value: number): void {
			this.trace('add', key, value);
			this.model.add(key, value);
			this.builder.addTo(key, value);
			this.immm = this.immm.addTo(key, value);
		}

		setEachValue(key: number, values: number[]): void {
			this.trace('setEachValue', key, values);
			this.model.setEachValue(key, values);
			this.builder.setEachValue(key, values);
			this.immm = this.immm.setEachValue(key, values);
		}

		setEachKey(value: number, keys: number[]): void {
			this.trace('setEachKey', value, keys);
			this.model.setEachKey(value, keys);
			this.builder.setEachKey(value, keys);
			this.immm = this.immm.setEachKey(value, keys);
		}

		removeEntry(key: number, value: number): void {
			this.trace('removeEntry', key, value);
			this.model.removeEntry(key, value);
			this.builder.removeEntry(key, value);
			this.immm = this.immm.removeEntry(key, value);
		}

		removeKey(key: number): void {
			this.trace('removeKey', key);
			this.model.removeKey(key);
			this.builder.removeKey(key);
			this.immm = this.immm.removeKey(key);
		}

		removeValue(value: number): void {
			this.trace('removeValue', value);
			this.model.removeValue(value);
			this.builder.removeValue(value);
			this.immm = this.immm.removeValue(value);
		}

		removeValues(values: number[]): void {
			this.trace('removeValues', values);
			for (const value of values) this.model.removeValue(value);
			this.builder.removeValues(values);
			this.immm = this.immm.removeValues(values);
		}
	}

	describe(`${name} BiMultiMap regressions`, (): void => {
		it('B1: removeValue prunes the reverse map', (): void => {
			const m = context.of([1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']);
			const r = m.removeValue('b');

			expect(r.hasValue('b')).toBe(false);
			expect(r.getKeys('b').stream().toArray()).toEqual([]);
			expect(r.streamValues().toArray()).not.toContain('b');
			expect(r.keyValueMultiMap.size).toBe(r.valueKeyMultiMap.size);
			expect(r.size).toBe(2);

			// Singular and plural must agree.
			expect(r.getKeys('b').toArray()).toEqual(
				m.removeValues(['b']).getKeys('b').toArray(),
			);
		});

		it('B1b: corruption does not survive further operations', (): void => {
			const m = context.of([1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']);
			const r = m.removeValue('b');

			for (const next of [
				r.filter(() => true),
				r.toBuilder().build(),
				context.from(r.toArray()),
			]) {
				expect(next.hasValue('b')).toBe(false);
				expect(next.size).toBe(next.keyValueMultiMap.size);
			}

			// Removing the last value must empty the collection, not throw.
			const r2 = m.removeValue('b').removeValue('a');
			expect(r2.isEmpty).toBe(true);
		});

		it('B2: hasEntry tests the association, not the cross product', (): void => {
			const m = context.of([1, 'a'], [2, 'b']);

			expect(m.hasEntry(1, 'b')).toBe(false);
			expect(m.hasEntry(2, 'a')).toBe(false);
			expect(m.hasEntry(1, 'a')).toBe(true);
			expect(m.hasEntry(2, 'b')).toBe(true);

			// The builder must agree, with and without a source.
			expect(context.builder<readonly [number, string]>().hasEntry(1, 'b')).toBe(false);
			expect(m.toBuilder().hasEntry(1, 'b')).toBe(false);
			expect(m.toBuilder().hasEntry(1, 'a')).toBe(true);
		});

		it('B3: builder forEach releases its lock when the callback throws', (): void => {
			const b = context.of([1, 'a'], [2, 'b']).toBuilder();

			expect((): void => {
				b.forEach((): void => {
					throw new Error('boom');
				});
			}).toThrow('boom');

			// Must remain usable.
			expect(b.addTo(3, 'c')).toBe(true);
			expect(b.size).toBe(3);
			expect(b.build().hasEntry(3, 'c')).toBe(true);

			// A clean traversal must not leak either.
			const b2 = context.of([1, 'a'], [2, 'b']).toBuilder();
			b2.forEach(() => {
				/* no mutation */
			});
			expect(b2.addTo(4, 'd')).toBe(true);
		});

		it('B4: setEachValue and setEachKey may empty the collection', (): void => {
			expect(context.of([1, 'a']).setEachValue(1, []).isEmpty).toBe(true);
			expect(context.of([1, 'a']).setEachKey('a', []).isEmpty).toBe(true);

			const m = context.of([1, 'a'], [2, 'b']);
			const r = m.setEachValue(1, []);
			expect(r.isEmpty).toBe(false);
			expect(r.has(1)).toBe(false);
			expect(r.size).toBe(1);

			const r2 = m.setEachKey('a', []);
			expect(r2.hasValue('a')).toBe(false);
			expect(r2.size).toBe(1);

			// Matches what removeKey/removeValue already do.
			expect(context.of([1, 'a']).setEachValue(1, []).isEmpty).toBe(
				context.of([1, 'a']).removeKey(1).isEmpty,
			);
			expect(context.of([1, 'a']).setEachKey('a', []).isEmpty).toBe(
				context.of([1, 'a']).removeValue('a').isEmpty,
			);
		});
	});

	describe(`${name} BiMultiMap differential`, (): void => {
		it('add', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
					ent.check();
				});
		}, 30_000);

		it('removeEntry', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.removeEntry(key, value);
					ent.check();
				});
		}, 30_000);

		it('removeKey', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.randomInt(0, 20)
				.take(600)
				.forEach((key): void => {
					ent.removeKey(key);
					ent.check();
				});
		}, 30_000);

		it('removeValue', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.randomInt(0, 10)
				.take(600)
				.forEach((value): void => {
					ent.removeValue(value);
					ent.check();
				});
		}, 30_000);

		it('removeValues', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.zip(Stream.randomInt(0, 4), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([count, seed]): void => {
					const values: number[] = [];
					for (let i = 0; i <= count; ++i) values.push((seed + i) % 10);
					ent.removeValues(values);
					ent.check();
				});
		}, 30_000);

		it('setEachValue', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 4))
				.take(600)
				.forEach(([key, count]): void => {
					const values: number[] = [];
					for (let i = 0; i < count; ++i) values.push((key + i) % 10);
					ent.setEachValue(key, values);
					ent.check();
				});
		}, 30_000);

		it('setEachKey', (): void => {
			const ent = new Entangled();

			Stream.zip(Stream.randomInt(0, 20), Stream.randomInt(0, 10))
				.take(600)
				.forEach(([key, value]): void => {
					ent.add(key, value);
				});

			Stream.zip(Stream.randomInt(0, 10), Stream.randomInt(0, 4))
				.take(600)
				.forEach(([value, count]): void => {
					const keys: number[] = [];
					for (let i = 0; i < count; ++i) keys.push((value + i) % 20);
					ent.setEachKey(value, keys);
					ent.check();
				});
		}, 30_000);

		it('mixed operations preserve the inverse invariant', (): void => {
			const ent = new Entangled();

			Stream.randomInt(0, 40)
				.take(900)
				.forEach((selector): void => {
					const key = selector % 20;
					const value = selector % 10;
					switch (selector % 7) {
						case 0:
							ent.add(key, value);
							break;
						case 1:
							ent.removeKey(key);
							break;
						case 2:
							ent.removeValue(value);
							break;
						case 3:
							ent.removeEntry(key, value);
							break;
						case 4:
							ent.setEachValue(key, [value, (value + 3) % 10]);
							break;
						case 5:
							ent.setEachKey(value, [key, (key + 3) % 20]);
							break;
						default:
							ent.removeValues([value]);
							break;
					}
					ent.check();
				});
		}, 30_000);
	});
}
