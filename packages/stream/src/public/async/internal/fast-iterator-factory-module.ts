import type { AsyncFastIterator } from '@rimbu/stream/async';

import type { AsyncFastIteratorFactory } from '#async/fast-iterator-factory';

import { AsyncOptLazy, type MaybePromise } from '@rimbu/common/async-opt-lazy';
import { Module } from '@rimbu/common/module';

export const asyncFastIteratorFactoryModule =
	Module.create<AsyncFastIteratorFactory>((mod) => ({
		_fixedDoneAsyncIteratorResultInstance: Module.lazyGetter(() => {
			return Object.freeze(
				Promise.resolve(
					Object.freeze({
						done: true,
						value: undefined,
					}) as IteratorResult<any>,
				),
			);
		}),
		_emptyAsyncFastIteratorInstance: Module.lazyGetter(() => {
			return Object.freeze({
				fastNext<O>(otherwise?: AsyncOptLazy<O>): MaybePromise<O> {
					return AsyncOptLazy.toMaybePromise(otherwise!);
				},
				next(): Promise<IteratorResult<any>> {
					return mod._fixedDoneAsyncIteratorResultInstance;
				},
			});
		}),
		isAsyncFastIterator: <T>(
			iterator: AsyncIterator<T>,
		): iterator is AsyncFastIterator<T> => `fastNext` in iterator,
	}));
