import type { RelatedTo } from '@rimbu/common/types';
import type { HashMap } from '@rimbu/hashed/map';
import type { List } from '@rimbu/list';

import type { HashMapContext } from '#map/context';
import type { HashMapCollision } from '#map/immutable/collision';

import {
	checkEmptyModifyOptions,
	type ModifyOptions,
} from '@rimbu/collection-types/advanced/common';
import { OptLazy } from '@rimbu/common/opt-lazy';

import { CollisionBuilderBase } from '#common/base';

export class HashMapCollisionBuilder<K, V> extends CollisionBuilderBase<
	readonly [K, V]
> {
	constructor(
		readonly context: HashMapContext<K>,
		public source?: undefined | HashMapCollision<K, V>,
		public _entries?: undefined | List.Builder<readonly [K, V]>,
	) {
		super();
	}

	get<UK, O>(
		key: RelatedTo<K, UK>,
		otherwise?: OptLazy<O>,
		_hash?: number,
	): V | O {
		if (!this.context.hasher.isValid(key)) return OptLazy(otherwise) as O;

		if (undefined !== this.source) return this.source.get(key, otherwise);

		const token = Symbol();
		let result: V | typeof token = token;
		this.entries.forEach((e, _, halt): void => {
			if (this.context.eq(key, e[0])) {
				result = e[1];
				halt();
			}
		});

		if (token === result) return OptLazy(otherwise) as O;
		return result as V | O;
	}

	has<UK>(key: RelatedTo<K, UK>): boolean {
		const token = Symbol();
		return token !== this.get(key, token);
	}

	addInternal(entry: readonly [K, V]): boolean {
		let index = -1;
		this.entries.forEach((e, i, halt) => {
			if (this.context.eq(e[0], entry[0])) {
				index = i;
				halt();
			}
		});

		if (index < 0) {
			this.source = undefined;

			this.entries.append(entry);
			return true;
		}

		const oldEntry = this.entries.updateAt(
			index,
			(currentEntry): readonly [K, V] => {
				if (Object.is(currentEntry[1], entry[1])) return currentEntry;
				return entry;
			},
		);

		const changed =
			undefined === oldEntry ||
			!Object.is(oldEntry[1], entry[1]) ||
			!Object.is(oldEntry[0], entry[0]);

		if (changed) {
			this.source = undefined;
		}

		return changed;
	}

	// set(key: K, value: V): boolean {
	// 	return this.addInternal([key, value]);
	// }

	modifyAt(atKey: K, options: ModifyOptions<V>): boolean {
		if (checkEmptyModifyOptions(options)) return false;
		const { ifNew, ifExists } = options;

		let index = -1;
		let foundEntry: readonly [K, V] | undefined;

		this.entries.forEach((e, i, halt) => {
			if (this.context.eq(e[0], atKey)) {
				index = i;
				foundEntry = e;
				halt();
			}
		});

		if (undefined === foundEntry) {
			if (undefined === ifNew) return false;

			const { set, create } = ifNew;
			const token = Symbol();
			const newValue = create !== undefined ? create(token) : set;

			if (token === newValue) return false;

			this.source = undefined;
			this.entries.append([atKey, newValue as V]);

			return true;
		}

		if (undefined === ifExists) return false;

		const { set, update } = ifExists;
		const token = Symbol();
		const newValue = update !== undefined ? update(foundEntry[1], token) : set;

		if (Object.is(newValue, foundEntry[1])) return false;
		if (token === newValue) {
			this.source = undefined;
			this.entries.remove(index);
			return true;
		}

		const result = this.entries.set(index, [atKey, newValue as V]);
		const changed = undefined !== result;

		if (changed) this.source = undefined;

		return changed;
	}

	buildNE(): HashMapCollision<K, V> {
		if (undefined !== this.source) return this.source;

		return this.context.collision(this.entries.build().assumeNonEmpty());
	}

	buildMapValues<V2>(f: (value: V, key: K) => V2): HashMap<K, V2> {
		if (undefined !== this.source) return this.source.mapValues(f);

		return this.context.collision(
			this.entries
				.buildMap((entry): readonly [K, V2] => [
					entry[0],
					f(entry[1], entry[0]),
				])
				.assumeNonEmpty(),
		);
	}
}
