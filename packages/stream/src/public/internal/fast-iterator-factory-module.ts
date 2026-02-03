import type { FastIterator } from '@rimbu/stream';

import type { FastIteratorFactory } from '#stream/fast-iterator-factory';

import { Module } from '@rimbu/common/module';
import { OptLazy } from '@rimbu/common/opt-lazy';

export const fastIteratorFactoryModule = Module.create<FastIteratorFactory>(
	(mod) => ({
		_fixedDoneIteratorResult: Module.lazy(() =>
			Object.freeze({
				done: true,
				value: undefined,
			}),
		),
		_emptyFastIteratorInstance: Module.lazy(() =>
			Object.freeze({
				fastNext<O>(otherwise?: OptLazy<O>): O {
					return OptLazy(otherwise) as O;
				},
				next(): IteratorResult<any> {
					return mod._fixedDoneIteratorResult;
				},
			}),
		),
		isFastIterator: Module.factory(
			<T>(iterator: Iterator<T>): iterator is FastIterator<T> =>
				`fastNext` in iterator,
		),
	}),
);
