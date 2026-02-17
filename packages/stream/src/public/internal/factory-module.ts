import type { Token } from '@rimbu/base/token';
import type { ArrayNonEmpty } from '@rimbu/common/types';
import type { FastIterator, Stream, StreamSource } from '@rimbu/stream';

import type { StreamFactory } from '#stream/factory';

import { ErrBase } from '@rimbu/common/err';
import { IndexRange } from '@rimbu/common/index-range';
import { Module } from '@rimbu/common/module';
import { Range } from '@rimbu/common/range';
import { Reducer } from '../reducer';

import {
	AlwaysStream,
	ArrayStream,
	EmptyStream,
	FilterApplyStream,
	FromIterable,
	FromStream,
	MapApplyStream,
	RangeStream,
	StreamBase,
} from '#stream/base';
import {
	RandomIntIterator,
	RandomIterator,
	UnfoldIterator,
	ZipAllWithItererator,
	ZipWithIterator,
} from '#stream/fast-iterator-base';

function isStream(obj: any): obj is Stream<any> {
	return obj instanceof StreamBase;
}

function* yieldObjKeys<K extends string | number | symbol>(
	obj: Record<K, any>,
): Generator<K> {
	for (const key in obj) {
		yield key;
	}
}

function* yieldObjValues<V>(obj: Record<any, V>): Generator<V> {
	for (const key in obj) {
		yield (obj as any)[key];
	}
}

function* yieldObjEntries<K extends string | number | symbol, V>(
	obj: Record<K, V>,
): Generator<[K, V]> {
	for (const key in obj) {
		yield [key, obj[key]];
	}
}

export const streamFactoryModule = Module.create<StreamFactory>((mod) => ({
	Constructors: () => mod,
	isEmptyStreamSourceInstance: (source: StreamSource<any>) => {
		if (source === '') return true;
		if (typeof source === 'object') {
			if (source === mod.empty() || source === null) return true;
			if (`length` in source && (source as any).length === 0) return true;
			if (`size` in source && (source as any).size === 0) return true;
			if (`isEmpty` in source && (source as any).isEmpty === true) return true;
		}

		return false;
	},
	fromStreamSource: (source: StreamSource<any>): any => {
		if (undefined === source || mod.isEmptyStreamSourceInstance(source))
			return mod.empty();
		if (isStream(source)) return source;
		if (typeof source === 'object' && `stream` in source)
			return source.stream();

		if (Array.isArray(source)) {
			if (source.length <= 0) return mod.empty();
			return new ArrayStream(source);
		}

		return new FromIterable(source);
	},
	empty: Module.lazy(<T>() => new EmptyStream<T>() as Stream<T>),
	of: <T>(...values: ArrayNonEmpty<T>): Stream.NonEmpty<T> =>
		mod.fromStreamSource(values),
	from: <T>(...sources: ArrayNonEmpty<StreamSource<T>>): any => {
		const [first, ...rest] = sources;
		if (rest.length <= 0) {
			return mod.fromStreamSource(first);
		}

		const [rest1, ...restOther] = rest;
		return mod.fromStreamSource(first).concat(rest1, ...restOther);
	},
	fromArray: <T>(
		array: readonly T[],
		options: {
			range?: IndexRange | undefined;
			reversed?: boolean;
		} = {},
	): any => {
		if (array.length === 0) return mod.empty();

		const { range, reversed = false } = options;

		if (undefined === range) {
			return new ArrayStream(array, undefined, undefined, reversed);
		}

		const result = IndexRange.getIndicesFor(range, array.length);

		if (result === 'empty') {
			return mod.empty();
		}
		if (result === 'all') {
			return new ArrayStream(array, undefined, undefined, reversed);
		}
		return new ArrayStream(array, result[0], result[1], reversed);
	},
	fromObjectKeys: <K extends string | number | symbol>(
		obj: Record<K, any>,
	): Stream<K> => {
		return mod.fromStreamSource(yieldObjKeys(obj));
	},
	fromObjectValues: <V>(obj: Record<any, V>): Stream<V> => {
		return mod.fromStreamSource(yieldObjValues(obj));
	},
	fromObject: <K extends string | number | symbol, V>(
		obj: Record<K, V>,
	): Stream<[K, V]> => {
		return mod.fromStreamSource(yieldObjEntries(obj));
	},
	fromString: (
		source: string,
		options: { range?: IndexRange | undefined; reversed?: boolean } = {},
	) => {
		return mod.fromArray(source as any, options) as any;
	},
	always: <T>(value: T): Stream.NonEmpty<T> => {
		return new AlwaysStream(value) as any;
	},
	applyForEach: <T extends readonly unknown[], A extends readonly unknown[]>(
		source: StreamSource<Readonly<T>>,
		f: (...args: [...T, ...A]) => void,
		...args: A
	): void => {
		const iter = mod.fromStreamSource(source)[Symbol.iterator]();

		const done = Symbol();
		let values: T | typeof done;
		while (done !== (values = iter.fastNext(done))) {
			f(...values, ...args);
		}
	},
	applyMap: <T extends readonly unknown[], A extends readonly unknown[], R>(
		source: StreamSource<Readonly<T>>,
		mapFun: (...args: [...T, ...A]) => R,
		...args: A
	) => {
		return new MapApplyStream(source, mapFun, args) as any;
	},
	applyFilter: <T extends readonly unknown[], A extends readonly unknown[]>(
		source: StreamSource<Readonly<T>>,
		options: { pred: (...args: [...T, ...A]) => boolean; negate?: boolean },
		...args: A
	): Stream<T> => {
		const { pred, negate = false } = options;

		return new FilterApplyStream(source, pred, args, negate) as any;
	},
	range: (
		range: IndexRange,
		options: { delta?: number } = {},
	): Stream<number> => {
		const { delta = 1 } = options;

		if (undefined !== range.amount) {
			if (range.amount <= 0) return mod.empty();

			let startIndex = 0;
			if (undefined !== range.start) {
				if (Array.isArray(range.start)) {
					startIndex = range.start[0];
					if (!range.start[1]) startIndex++;
				} else startIndex = range.start;
			}
			const endIndex = startIndex + range.amount - 1;

			return new RangeStream(startIndex, endIndex, delta);
		}

		const { start, end } = Range.getNormalizedRange(range);
		let startIndex = 0;
		let endIndex: number | undefined;
		if (undefined !== start) {
			startIndex = start[0];
			if (!start[1]) startIndex++;
		}
		if (undefined !== end) {
			endIndex = end[0];
			if (!end[1]) endIndex--;
		}

		if (undefined !== endIndex) {
			if (delta > 0 && endIndex < startIndex) return mod.empty();
			else if (delta < 0 && startIndex <= endIndex) return mod.empty();
		}

		return new RangeStream(startIndex, endIndex, delta);
	},
	random: (): Stream.NonEmpty<number> => {
		return new FromStream(
			(): FastIterator<number> => new RandomIterator(),
		) as unknown as Stream.NonEmpty<number>;
	},
	randomInt: (min: number, max: number): Stream.NonEmpty<number> => {
		if (min >= max) ErrBase.msg('min should be smaller than max');

		return new FromStream(
			(): FastIterator<number> => new RandomIntIterator(min, max),
		) as unknown as Stream.NonEmpty<number>;
	},
	unfold: <T>(
		init: T,
		next: (current: T, index: number, stop: Token) => T | Token,
	): Stream.NonEmpty<T> => {
		return new FromStream(
			(): FastIterator<T> => new UnfoldIterator<T>(init, next),
		) as unknown as Stream.NonEmpty<T>;
	},
	zipWith: (...sources) => {
		return (zipFun): any => {
			if (sources.some(mod.isEmptyStreamSourceInstance)) {
				return mod.empty();
			}

			return new FromStream(() => new ZipWithIterator(sources as any, zipFun));
		};
	},
	zip: (...sources) => {
		return mod.zipWith(...(sources as any))(Array);
	},
	zipAllWith: (...sources) => {
		return (fillValue, zipFun: any): any => {
			if (sources.every(mod.isEmptyStreamSourceInstance)) {
				return mod.empty();
			}

			return new FromStream(
				(): FastIterator<any> =>
					new ZipAllWithItererator(fillValue, sources as any, zipFun),
			);
		};
	},
	zipAll: (fillValue, ...sources) => {
		return mod.zipAllWith(...(sources as any))(fillValue, Array);
	},
	flatten: (source: any) => {
		return mod.fromStreamSource(source).flatMap((s: any) => s);
	},
	unzip: (source, options): any => {
		const { length } = options;
		if (mod.isEmptyStreamSourceInstance(source)) {
			return mod.of(mod.empty()).repeat(length).toArray();
		}

		const result: Stream<unknown>[] = [];
		let i = -1;

		while (++i < length) {
			const index = i;
			result[i] = source.map((t: any): unknown => t[index]);
		}

		return result;
	},
	groupBy: <T, K>(
		source: StreamSource<T>,
		valueToKey: (value: T, index: number) => K,
	): (<R>(options?: { collector?: any | undefined } | undefined) => R) => {
		return <R>(options = {}) => {
			return mod
				.fromStreamSource(source)
				.reduce(Reducer.groupBy(valueToKey, options as any)) as R;
		};
	},
	partition: <T>(
		source: StreamSource<T>,
		pred: (value: T, index: number) => boolean,
	): ((options?: { collectorTrue?: any; collectorFalse?: any }) => any) => {
		return (options = {}) => {
			if (mod.isEmptyStreamSourceInstance(source)) {
				const {
					collectorTrue = Reducer.toArray(),
					collectorFalse = Reducer.toArray(),
				} = options;

				return [
					collectorTrue.compile().getOutput(),
					collectorFalse.compile().getOutput(),
				];
			}

			return mod
				.fromStreamSource(source)
				.reduce(Reducer.partition(pred, options));
		};
	},
}));
