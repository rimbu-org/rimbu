import type { List } from '@rimbu/list';

import type { HashSetContext } from '#set/context';
import type { HashSetCollision } from '#set/immutable/collision';

export class HashSetCollisionBuilder<T> {
	constructor(
		readonly context: HashSetContext<T>,
		public source?: undefined | HashSetCollision<T>,
		public _entries?: undefined | List.Builder<T>,
	) {
		// super();
	}

	get entries(): List.Builder<T> {
		if (undefined === this._entries) {
			if (undefined !== this.source) {
				this._entries = this.source.entries.toBuilder();
			} else {
				this._entries = this.context.listContext.builder();
			}
		}

		return this._entries!;
	}

	get size(): number {
		if (undefined !== this.source) return this.source.size;

		return this.entries.length;
	}

	hasInternal(value: T, hash?: number): boolean {
		if (undefined !== this.source) return this.source.has(value, hash);

		let result = false;
		this.entries.forEach((v, _, halt): void => {
			if (this.context.eq(v, value)) {
				result = true;
				halt();
			}
		});
		return result;
	}

	addInternal(value: T): boolean {
		let index = -1;
		this.entries.forEach((v, i, halt): void => {
			if (this.context.eq(v, value)) {
				index = i;
				halt();
			}
		});

		if (index < 0) {
			this.source = undefined;

			this.entries.append(value);
			return true;
		}

		const token = Symbol();
		const oldValue = this.entries.set(index, value, token);

		const changed = token === oldValue || !this.context.eq(oldValue, value);

		if (changed) this.source = undefined;

		return changed;
	}

	removeInternal(value: T): boolean {
		let index = -1;

		this.entries.forEach((v, i, halt): void => {
			if (this.context.eq(v, value)) {
				index = i;
				halt();
			}
		});

		if (index < 0) return false;

		this.source = undefined;

		this.entries.remove(index);
		return true;
	}

	forEach(f: (value: T) => void): void {
		this.entries.forEach(f);
	}

	buildNE(): HashSetCollision<T> {
		return (
			this.source ??
			this.context.collision(this.entries.build().assumeNonEmpty())
		);
	}
}
