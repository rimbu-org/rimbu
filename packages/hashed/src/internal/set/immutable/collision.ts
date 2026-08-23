import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { HashSet } from '@rimbu/hashed/set';
import type { List } from '@rimbu/list';
import type { Stream } from '@rimbu/stream';

import type { HashSetContext } from '#set/context';

import { TraverseState } from '@rimbu/common/traverse-state';

import { HashSetNonEmptyBase } from '#set/immutable/non-empty';

export class HashSetCollision<T> extends HashSetNonEmptyBase<T> {
	constructor(
		context: HashSetContext<T>,
		readonly entries: List.NonEmpty<T>,
	) {
		super(context);
	}

	get size(): number {
		return this.entries.length;
	}

	copy(entries = this.entries): HashSetCollision<T> {
		if (entries === this.entries) return this;
		return new HashSetCollision(this.context, entries);
	}

	stream(): Stream.NonEmpty<T> {
		return this.entries.stream();
	}

	hasInternal(value: T, _hash: number): boolean {
		if (!this.context.hasher.isValid(value)) return false;
		return this.stream().contains(value, { eq: this.context.eq });
	}

	add(value: T): HashSetCollision<T> {
		const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

		if (undefined === currentIndex) {
			return this.copy(this.entries.append(value));
		}

		return this.copy(this.entries.with(currentIndex, value));
	}

	remove(value: T, _hash?: number): HashSet<T> {
		if (!this.context.hasher.isValid(value)) return this;

		const currentIndex = this.stream().indexOf(value, { eq: this.context.eq });

		if (undefined === currentIndex) return this;

		const newEntries = this.entries.remove(currentIndex).assumeNonEmpty();
		return this.copy(newEntries);
	}

	forEach(
		f: (entry: T, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted) return;

		this.entries.forEach(f, { state });
	}

	toArray(): ArrayNonEmpty<T> {
		return this.entries.toArray();
	}
}
