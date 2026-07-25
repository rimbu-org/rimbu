import type { OptLazy } from '@rimbu/common/opt-lazy';
import type { List } from '@rimbu/list';

import type { OuterBuilder } from '#list/mutable/common';

export class OuterTreeBuilder<T> implements OuterBuilder<T> {
	get size(): number {
		throw new Error('Method not implemented.');
	}

	at<O>(index: number, otherwise?: OptLazy<O> | undefined): O | T {
		throw new Error('Method not implemented.');
	}

	prepend(value: T): void {
		throw new Error('Method not implemented.');
	}

	append(value: T): void {
		throw new Error('Method not implemented.');
	}

	forEach(f: (value: T) => void): void {
		throw new Error('Method not implemented.');
	}

	build(): List<T> {
		throw new Error('Method not implemented.');
	}

	buildMap<T2>(f: (value: T) => T2): List<T2> {
		throw new Error('Method not implemented.');
	}

	normalized(): OuterBuilder<T> | undefined {
		throw new Error('Method not implemented.');
	}
}
