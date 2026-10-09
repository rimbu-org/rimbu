import { describe, expect, it } from 'bun:test';

import { OrderedMap } from '@rimbu/ordered/map';
import { OrderedSet } from '@rimbu/ordered/set';

/**
 * Deterministic LCG so a failure is reproducible from the seed alone.
 */
function makeRandom(seed: number): () => number {
	let state = seed >>> 0;

	return (): number => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}

function normalize(index: number, finalSize: number): number {
	let dest = Math.trunc(index);
	if (dest < 0) dest = finalSize + dest;
	if (dest < 0) dest = 0;
	if (dest > finalSize - 1) dest = finalSize - 1;
	return dest;
}

type Position = 'preserve' | 'append' | 'prepend';

interface MapModel {
	order: number[];
	values: Map<number, number>;
}

function modelSet(m: MapModel, key: number, value: number): void {
	if (!m.values.has(key)) m.order.push(key);
	m.values.set(key, value);
}

function modelRemove(m: MapModel, key: number): void {
	if (!m.values.has(key)) return;
	m.order.splice(m.order.indexOf(key), 1);
	m.values.delete(key);
}

function modelPlace(
	m: MapModel,
	index: number,
	key: number,
	value: number,
): void {
	modelRemove(m, key);
	const finalSize = m.order.length + 1;
	m.order.splice(normalize(index, finalSize), 0, key);
	m.values.set(key, value);
}

function modelMove(m: MapModel, index: number, key: number): void {
	if (!m.values.has(key)) return;
	const at = m.order.indexOf(key);
	if (at < 0) return;
	m.order.splice(at, 1);
	const finalSize = m.order.length + 1;
	m.order.splice(normalize(index, finalSize), 0, key);
}

function modelRemoveAt(m: MapModel, index: number, amount: number): void {
	const size = m.order.length;
	let at = Math.trunc(index);
	if (at < 0) at = size + at;
	if (at < 0 || at >= size || amount <= 0) return;
	const count = Math.min(amount, size - at);
	const removed = m.order.splice(at, count);
	for (const key of removed) m.values.delete(key);
}

function modelAddEach(
	m: MapModel,
	entries: [number, number][],
	position: Position,
): void {
	if (entries.length === 0) return;

	if (position === 'preserve') {
		for (const [key, value] of entries) modelSet(m, key, value);
		return;
	}

	const firstOrder: number[] = [];
	const lastValue = new Map<number, number>();
	for (const [key, value] of entries) {
		if (!lastValue.has(key)) firstOrder.push(key);
		lastValue.set(key, value);
	}

	for (const key of firstOrder) modelRemove(m, key);
	const block = firstOrder.map(
		(key) => [key, lastValue.get(key) as number] as const,
	);

	if (position === 'append') {
		for (const [key, value] of block) {
			m.order.push(key);
			m.values.set(key, value);
		}
	} else {
		m.order.unshift(...firstOrder);
		for (const [key, value] of block) m.values.set(key, value);
	}
}

function expectMap(col: OrderedMap<number, number>, m: MapModel): void {
	const expected = m.order.map(
		(key) => [key, m.values.get(key) as number] as const,
	);
	expect(col.toArray()).toEqual(expected);
	expect(col.size).toBe(m.order.length);

	for (let i = 0; i < m.order.length; i++) {
		const key = m.order[i];
		const entry = col.at(i);
		expect(entry?.[0]).toBe(key);
		expect(col.indexOf(key)).toBe(i);
	}
}

interface SetModel {
	order: number[];
}

function modelSetAdd(s: SetModel, value: number): void {
	if (!s.order.includes(value)) s.order.push(value);
}

function modelSetRemove(s: SetModel, value: number): void {
	const at = s.order.indexOf(value);
	if (at >= 0) s.order.splice(at, 1);
}

function modelSetPlace(s: SetModel, index: number, value: number): void {
	modelSetRemove(s, value);
	const finalSize = s.order.length + 1;
	s.order.splice(normalize(index, finalSize), 0, value);
}

function modelSetMove(s: SetModel, index: number, value: number): void {
	const at = s.order.indexOf(value);
	if (at < 0) return;
	s.order.splice(at, 1);
	const finalSize = s.order.length + 1;
	s.order.splice(normalize(index, finalSize), 0, value);
}

function modelSetRemoveAt(s: SetModel, index: number, amount: number): void {
	const size = s.order.length;
	let at = Math.trunc(index);
	if (at < 0) at = size + at;
	if (at < 0 || at >= size || amount <= 0) return;
	s.order.splice(at, Math.min(amount, size - at));
}

function modelSetAddEach(
	s: SetModel,
	elements: number[],
	position: Position,
): void {
	if (elements.length === 0) return;

	if (position === 'preserve') {
		for (const element of elements) modelSetAdd(s, element);
		return;
	}

	const block: number[] = [];
	for (const element of elements) {
		if (!block.includes(element)) block.push(element);
	}

	for (const element of block) modelSetRemove(s, element);

	if (position === 'append') {
		s.order.push(...block);
	} else {
		s.order.unshift(...block);
	}
}

function expectSet(col: OrderedSet<number>, s: SetModel): void {
	expect(col.toArray()).toEqual(s.order);
	expect(col.size).toBe(s.order.length);

	for (let i = 0; i < s.order.length; i++) {
		expect(col.at(i)).toBe(s.order[i]);
		expect(col.indexOf(s.order[i])).toBe(i);
	}
}

const POSITIONS: Position[] = ['preserve', 'append', 'prepend'];

describe('OrderedMap randomized model', () => {
	for (const seed of [1, 2, 3, 42, 123456]) {
		it(`seed ${seed}`, () => {
			const rnd = makeRandom(seed);
			const randInt = (n: number): number => Math.floor(rnd() * n);
			const key = (): number => randInt(10);
			const value = (): number => randInt(1000);

			let col: OrderedMap<number, number> = OrderedMap.empty();
			const model: MapModel = { order: [], values: new Map() };

			for (let step = 0; step < 2000; step++) {
				const previous = col;
				const previousArray = col.toArray();
				const op = randInt(8);

				switch (op) {
					case 0: {
						const k = key();
						const v = value();
						col = col.set(k, v);
						modelSet(model, k, v);
						break;
					}
					case 1: {
						const k = key();
						col = col.removeKey(k);
						modelRemove(model, k);
						break;
					}
					case 2: {
						const entry: [number, number] = [key(), value()];
						col = col.prepend(entry);
						modelPlace(model, 0, entry[0], entry[1]);
						break;
					}
					case 3: {
						const entry: [number, number] = [key(), value()];
						col = col.append(entry);
						modelPlace(model, -1, entry[0], entry[1]);
						break;
					}
					case 4: {
						const entry: [number, number] = [key(), value()];
						const index = randInt(12) - 3;
						col = col.placeAt(index, entry);
						modelPlace(model, index, entry[0], entry[1]);
						break;
					}
					case 5: {
						const index = randInt(12) - 3;
						const k = key();
						col = col.moveTo(index, k);
						modelMove(model, index, k);
						break;
					}
					case 6: {
						const index = randInt(12) - 3;
						const amount = randInt(4);
						col = col.removeAt(index, amount);
						modelRemoveAt(model, index, amount);
						break;
					}
					default: {
						const count = randInt(4);
						const entries: [number, number][] = [];
						for (let i = 0; i < count; i++) {
							entries.push([key(), value()]);
						}
						const position = POSITIONS[randInt(3)];
						col = col.addEach(entries, { position });
						modelAddEach(model, entries, position);
						break;
					}
				}

				// Immutable results never mutate earlier versions.
				expect(previous.toArray()).toEqual(previousArray);

				expectMap(col, model);
			}
		});
	}
});

describe('OrderedSet randomized model', () => {
	for (const seed of [7, 8, 9, 99, 777]) {
		it(`seed ${seed}`, () => {
			const rnd = makeRandom(seed);
			const randInt = (n: number): number => Math.floor(rnd() * n);
			const value = (): number => randInt(10);

			let col: OrderedSet<number> = OrderedSet.empty();
			const model: SetModel = { order: [] };

			for (let step = 0; step < 2000; step++) {
				const previous = col;
				const previousArray = col.toArray();
				const op = randInt(8);

				switch (op) {
					case 0: {
						const v = value();
						col = col.add(v);
						modelSetAdd(model, v);
						break;
					}
					case 1: {
						const v = value();
						col = col.remove(v);
						modelSetRemove(model, v);
						break;
					}
					case 2: {
						const v = value();
						col = col.prepend(v);
						modelSetPlace(model, 0, v);
						break;
					}
					case 3: {
						const v = value();
						col = col.append(v);
						modelSetPlace(model, -1, v);
						break;
					}
					case 4: {
						const v = value();
						const index = randInt(12) - 3;
						col = col.placeAt(index, v);
						modelSetPlace(model, index, v);
						break;
					}
					case 5: {
						const index = randInt(12) - 3;
						const v = value();
						col = col.moveTo(index, v);
						modelSetMove(model, index, v);
						break;
					}
					case 6: {
						const index = randInt(12) - 3;
						const amount = randInt(4);
						col = col.removeAt(index, amount);
						modelSetRemoveAt(model, index, amount);
						break;
					}
					default: {
						const count = randInt(4);
						const elements: number[] = [];
						for (let i = 0; i < count; i++) elements.push(value());
						const position = POSITIONS[randInt(3)];
						col = col.addEach(elements, { position });
						modelSetAddEach(model, elements, position);
						break;
					}
				}

				// Immutable results never mutate earlier versions.
				expect(previous.toArray()).toEqual(previousArray);

				expectSet(col, model);
			}
		});
	}
});
