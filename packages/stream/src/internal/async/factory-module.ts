import type { Token } from '@rimbu/base/token';
import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import type {
	AsyncFastIterator,
	AsyncStream,
	AsyncStreamSource,
} from '@rimbu/stream/async';

import type { AsyncStreamFactory } from '#async/factory';
import type { StreamSource } from '#private/stream-types';

import { Module } from '@rimbu/common/module';
import { AsyncReducer } from '@rimbu/stream/async/reducer';

import {
	AsyncUnfoldIterator,
	AsyncZipAllWithItererator,
	AsyncZipWithIterator,
} from '#async/fast-iterator-base';
import { asyncFastIteratorFactoryModule } from '#async/fast-iterator-factory-module';
import {
	AsyncEmptyStream,
	AsyncEmptyStreamToken,
	AsyncFromStream,
	AsyncOfStream,
	AsyncStreamBase,
	FromResource,
	FromSource,
} from '#async/stream-base';
import { StreamFactory } from '#stream/factory';

export const asyncStreamFactoryModule = Module.create<AsyncStreamFactory>(
	(mod) => ({
		Constructors: () => mod,
		isAsyncStream: (obj: any) => {
			return obj instanceof AsyncStreamBase;
		},
		isEmptyAsyncStreamSourceInstance: (
			source: AsyncStreamSource<any>,
		): boolean => {
			return (
				(typeof source === 'object' &&
					null !== source &&
					AsyncEmptyStreamToken in source) ||
				StreamFactory().isEmptyStreamSourceInstance(source as StreamSource<any>)
			);
		},
		fromAsyncStreamSource: <T>(source: AsyncStreamSource<T>): any => {
			if (undefined === source) return mod.empty();
			if (mod.isAsyncStream(source)) return source;
			if (mod.isEmptyAsyncStreamSourceInstance(source)) return mod.empty();

			return new FromSource(source);
		},
		empty: Module.lazy(
			<T>(): AsyncStream<T> => new AsyncEmptyStream() as AsyncStream<T>,
		),
		of: (...values) => {
			return new AsyncOfStream(values) as any;
		},
		from: (...sources): any => {
			const [first, ...rest] = sources;

			if (rest.length <= 0) {
				return mod.fromAsyncStreamSource(first);
			}

			const [rest1, ...restOther] = rest;

			return mod.fromAsyncStreamSource(first).concat(rest1, ...restOther);
		},
		fromResource: (options): any => {
			const { open, createSource, close } = options;
			return new FromResource(open, createSource, close);
		},
		zip: (...sources): any => {
			if ((sources as any[]).some(mod.isEmptyAsyncStreamSourceInstance)) {
				return mod.empty();
			}

			return new AsyncFromStream(
				() => new AsyncZipWithIterator(sources, Array),
			);
		},
		zipAll: (fillValue, ...sources): any => {
			if ((sources as any[]).every(mod.isEmptyAsyncStreamSourceInstance)) {
				return mod.empty();
			}

			return new AsyncFromStream(
				(): AsyncFastIterator<any> =>
					new AsyncZipAllWithItererator(fillValue, sources, Array),
			);
		},
		flatten: (source: any) => {
			return mod.fromAsyncStreamSource(source).flatMap((s: any) => s);
		},
		unzip: (source, options) => {
			const { length } = options;

			if (mod.isEmptyAsyncStreamSourceInstance(source)) {
				return StreamFactory().of(mod.empty()).repeat(length).toArray();
			}

			const result: AsyncStream<unknown>[] = [];
			let i = -1;

			while (++i < length) {
				const index = i;
				result[i] = source.map((t: any): unknown => t[index]);
			}

			return result as any;
		},
		always: <T>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> => {
			return mod.of(value).repeat();
		},
		unfold: <T>(
			init: T,
			next: (current: T, index: number, stop: Token) => MaybePromise<T | Token>,
		): AsyncStream.NonEmpty<T> => {
			return new AsyncFromStream(
				(): AsyncFastIterator<T> => new AsyncUnfoldIterator<T>(init, next),
			) as unknown as AsyncStream.NonEmpty<T>;
		},
		asyncFastIteratorFactory: Module.lazyGetter(() =>
			asyncFastIteratorFactoryModule.build(),
		),
		partition: <T>(
			source: AsyncStreamSource<T>,
			pred: (value: T, index: number) => MaybePromise<boolean>,
		): ((options?: { collectorTrue?: any; collectorFalse?: any }) => any) => {
			return (options = {}) => {
				return mod
					.fromAsyncStreamSource(source)
					.reduce(AsyncReducer.partition(pred, options));
			};
		},
	}),
);
