import type {
	AsyncFastIterator,
	AsyncStreamSource,
} from '@rimbu/stream/async/async-stream-types';

import type { AsyncReducerFactory } from '#async/reducer-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { AsyncOptLazy, type MaybePromise } from '@rimbu/common/async-opt-lazy';
import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { Stream } from '@rimbu/stream';
import { AsyncStream } from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';
import { Reducer } from '@rimbu/stream/reducer';

import { AsyncReducerBase } from '#async/reducer-base';
import { InvalidCombineShapeError } from '#async/reducer-errors';
import { ReducerBase } from '#stream/reducer-base';
import { identity } from '#stream/utils';

/**
 * Combines multiple (asynchronous) reducers in an array of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an array containing
 * the corresponding output of each reducer.
 */
function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
	...reducers: { [K in keyof R]: AsyncReducer.Accept<T, R[K]> } & AsyncReducer<
		T,
		unknown
	>[]
): AsyncReducer<T, R> {
	return AsyncReducer.create<T, any, AsyncReducer.Instance<T, unknown>[]>(
		async (initHalt) => {
			let allHalted = true;

			const result = await Promise.all(
				reducers.map(async (reducer) => {
					const instance = await AsyncReducer.from(reducer).compile();

					allHalted = allHalted && instance.halted;

					return instance;
				}),
			);

			if (allHalted) {
				initHalt();
			}

			return result;
		},
		async (state, elem, index, halt) => {
			let allHalted = true;

			await Promise.all(
				Stream.from(state).mapPure(async (reducer) => {
					if (reducer.halted) return;

					await reducer.next(elem);

					allHalted = allHalted && reducer.halted;
				}),
			);

			if (allHalted) {
				halt();
			}

			return state;
		},
		(state) =>
			Promise.all(
				Stream.from(state).mapPure((reducerInstance) =>
					reducerInstance.getOutput(),
				),
			),
		async (state, err) => {
			await Promise.all(
				Stream.from(state).mapPure((reducer) => reducer.onClose(err)),
			);
		},
	);
}

/**
 * Combines multiple (asynchronous) reducers in an object's values of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an object containing
 * the corresponding output of each reducer at the matching object property.
 */
function combineObj<T, R extends { readonly [key: string]: unknown }>(
	reducerObj: {
		readonly [K in keyof R]: AsyncReducer.Accept<T, R[K]>;
	} & Record<string, AsyncReducer.Accept<T, unknown>>,
): AsyncReducer<T, R> {
	return AsyncReducer.create(
		async (initHalt) => {
			const result: Record<string, AsyncReducer.Instance<T, any>> = {};

			let allHalted = true;

			await Promise.all(
				Stream.fromObject(
					reducerObj as Record<string, AsyncReducer.Accept<T, unknown>>,
				).mapPure(async ([key, reducer]) => {
					const instance = await AsyncReducer.from(reducer).compile();
					result[key] = instance;

					allHalted = allHalted && instance.halted;
				}),
			);

			if (allHalted) {
				initHalt();
			}

			return result;
		},
		async (state, elem, index, halt) => {
			let allHalted = true;

			await Promise.all(
				Stream.fromObjectValues(state).mapPure(async (reducerInstance) => {
					if (!reducerInstance.halted) {
						await reducerInstance.next(elem);

						allHalted = allHalted && reducerInstance.halted;
					}
				}),
			);

			if (allHalted) {
				halt();
			}

			return state;
		},
		async (state) => {
			const result: any = {};

			await Promise.all(
				Stream.fromObject(state).mapPure(async ([key, reducerInstance]) => {
					result[key] = await reducerInstance.getOutput();
				}),
			);

			return result;
		},
		async (state, err) => {
			await Promise.all(
				Stream.fromObjectValues(state).mapPure((reducerInstance) =>
					reducerInstance.onClose(err),
				),
			);
		},
	);
}

export const asyncReducerFactoryModule = Module.create<AsyncReducerFactory>(
	(mod) => ({
		create: (init, next, stateToResult, onClose): any => {
			return new AsyncReducerBase(init, next, stateToResult, onClose);
		},
		createMono: (init, next, stateToResult, onClose) => {
			return mod.create(init, next, stateToResult ?? identity, onClose);
		},
		createOutput: (init, next, stateToResult, onClose) => {
			return mod.create(init, next, stateToResult ?? identity, onClose);
		},
		fold: (init, next) => {
			return AsyncReducer.createOutput(
				() => AsyncOptLazy.toMaybePromise(init),
				next,
			);
		},
		from: (reducer) => {
			if (reducer instanceof AsyncReducerBase) {
				return reducer;
			}

			return AsyncReducer.create(
				reducer.init,
				reducer.next,
				reducer.stateToResult as any,
			);
		},
		minBy: <T, O>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
			otherwise?: AsyncOptLazy<O>,
		) => {
			const token = Symbol();

			return mod.create<T, T | O, T | typeof token>(
				() => token,
				async (state, next): Promise<T> => {
					if (token === state) return next;
					return (await compFun(state, next)) < 0 ? state : next;
				},
				(state): MaybePromise<T | O> =>
					token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state,
			);
		},
		min: <O>(otherwise?: AsyncOptLazy<O>) => {
			return mod.create<number, number | O, number | undefined>(
				() => undefined,
				(state, next): number =>
					undefined !== state && state < next ? state : next,
				(state): MaybePromise<number | O> =>
					state ?? AsyncOptLazy.toMaybePromise(otherwise!),
			);
		},
		maxBy: <T, O>(
			compFun: (v1: T, v2: T) => MaybePromise<number>,
			otherwise?: AsyncOptLazy<O>,
		): AsyncReducer<T, T | O> => {
			const token = Symbol();

			return mod.create<T, T | O, T | typeof token>(
				() => token,
				async (state, next): Promise<T> => {
					if (token === state) return next;
					return (await compFun(state, next)) > 0 ? state : next;
				},
				(state): MaybePromise<T | O> =>
					token === state ? AsyncOptLazy.toMaybePromise(otherwise!) : state,
			);
		},
		max: <O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<number, number | O> => {
			return mod.create<number, number | O, number | undefined>(
				() => undefined,
				(state, next): number =>
					undefined !== state && state > next ? state : next,
				(state): MaybePromise<number | O> =>
					state ?? AsyncOptLazy.toMaybePromise(otherwise!),
			);
		},
		first: <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
			return mod.create<T, T | O, T | undefined>(
				() => undefined,
				(_, next, __, halt): T => {
					halt();
					return next;
				},
				(state, index): MaybePromise<T | O> =>
					index <= 0 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!,
			);
		},
		last: <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
			return mod.create<T, T | O, T | undefined>(
				() => undefined,
				(_, next): T => next,
				(state, index): MaybePromise<T | O> =>
					index <= 0 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!,
			);
		},
		single: <T, O>(otherwise?: AsyncOptLazy<O>): AsyncReducer<T, T | O> => {
			return mod.create<T, T | O, T | undefined>(
				() => undefined,
				(state, next, index, halt): T => {
					if (index > 1) {
						halt();
					}
					return next;
				},
				(state, index): MaybePromise<T | O> =>
					index !== 1 ? AsyncOptLazy.toMaybePromise(otherwise!) : state!,
			);
		},
		some: <T>(
			pred: (value: T, index: number) => MaybePromise<boolean>,
			options: { negate?: boolean | undefined } = {},
		): AsyncReducer<T, boolean> => {
			return mod.nonEmpty.filterInput(pred, options);
		},
		every: <T>(
			pred: (value: T, index: number) => MaybePromise<boolean>,
			options: { negate?: boolean | undefined } = {},
		): AsyncReducer<T, boolean> => {
			const { negate = false } = options;

			return mod.isEmpty.filterInput(pred, { negate: !negate });
		},
		equals: <T>(
			other: AsyncStreamSource<T>,
			options: { eq?: Eq<T> | undefined; negate?: boolean | undefined } = {},
		): AsyncReducer<T, boolean> => {
			const { eq = Eq.objectIs, negate = false } = options;

			const sliceStream = AsyncStream.from(other);
			const done = Symbol();

			return AsyncReducer.create<
				T,
				boolean,
				{
					iter: AsyncFastIterator<T>;
					nextSeq: T | typeof done;
					result: boolean;
				}
			>(
				async () => {
					const iter = sliceStream[Symbol.asyncIterator]();

					const nextSeq = await iter.fastNext(done);

					return { iter, nextSeq, result: false };
				},
				async (state, next, _, halt) => {
					if (done === state.nextSeq) {
						halt();
						state.result = false;
						return state;
					}

					if (eq(next, state.nextSeq) === negate) {
						halt();
						state.result = false;
						return state;
					}

					state.nextSeq = await state.iter.fastNext(done);

					if (done === state.nextSeq) {
						state.result = true;
					}

					return state;
				},
				(state, index, halted) => !halted && done === state.nextSeq,
			);
		},
		isEmpty: Module.lazyGetter(() =>
			mod.createOutput<any, boolean>(
				() => true,
				(_, __, ___, halt): false => {
					halt();
					return false;
				},
			),
		),
		nonEmpty: Module.lazyGetter(() =>
			mod.createOutput<any, boolean>(
				() => false,
				(_, __, ___, halt): true => {
					halt();
					return true;
				},
			),
		),
		startsWithSlice: <T>(
			slice: AsyncStreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number } = {},
		): AsyncReducer<T, boolean> => {
			const sliceStream = AsyncStream.from(slice);
			const done = Symbol();
			const { eq = Eq.objectIs, amount = 1 } = options;

			return AsyncReducer.create<
				T,
				boolean,
				{
					sliceIter: AsyncFastIterator<T>;
					sliceValue: T | typeof done;
					remain: number;
				}
			>(
				async (initHalt) => {
					const sliceIter = sliceStream[Symbol.asyncIterator]();
					const sliceValue = await sliceIter.fastNext(done);

					if (done === sliceValue || amount <= 0) {
						initHalt();
						return { sliceIter, sliceValue, remain: 0 };
					}

					return {
						sliceIter,
						sliceValue,
						remain: amount,
					};
				},
				async (state, next, _, halt) => {
					if (done === state.sliceValue) {
						RimbuError.throwInvalidStateError();
					}

					if (eq(next, state.sliceValue)) {
						state.sliceValue = await state.sliceIter.fastNext(done);

						if (done === state.sliceValue) {
							state.remain--;
							if (state.remain <= 0) {
								halt();
							} else {
								state.sliceIter = sliceStream[Symbol.asyncIterator]();
								state.sliceValue = await state.sliceIter.fastNext(done);
							}
						}
					} else {
						halt();
					}

					return state;
				},
				(state) => state.remain <= 0,
			);
		},
		endsWithSlice: <T>(
			slice: AsyncStreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number } = {},
		): AsyncReducer<T, boolean> => {
			const sliceStream = AsyncStream.from(slice);
			const done = Symbol();

			const newReducerSpec = AsyncReducer.startsWithSlice(slice, options);

			return AsyncReducer.create<
				T,
				boolean,
				Set<AsyncReducer.Instance<T, boolean>>
			>(
				async (initHalt) => {
					const sliceIter = sliceStream[Symbol.asyncIterator]();
					const sliceValue = await sliceIter.fastNext(done);

					if (done === sliceValue) {
						initHalt();
					}

					return new Set([await newReducerSpec.compile()]);
				},
				async (state, nextValue) => {
					for (const instance of state) {
						if (instance.halted) {
							state.delete(instance);
						} else {
							await instance.next(nextValue);
						}
					}

					const newReducerInstance = await newReducerSpec.compile();
					await newReducerInstance.next(nextValue);

					state.add(newReducerInstance);

					return state;
				},
				(state) =>
					state.size === 0 ||
					AsyncStream.from(state).some((instance) => instance.getOutput()),
			);
		},
		containsSlice: <T>(
			slice: AsyncStreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number | undefined } = {},
		): AsyncReducer<T, boolean> => {
			const { eq, amount = 1 } = options;

			return AsyncReducer.pipe(
				mod.endsWithSlice(slice, { eq }),
				Reducer.contains(true, { amount }),
			);
		},
		partition: <T, RT, RF = RT>(
			pred: (value: T, index: number) => MaybePromise<boolean>,
			options: {
				collectorTrue?: any;
				collectorFalse?: any;
			} = {},
		): AsyncReducer<T, [true: RT, false: RF]> => {
			const {
				collectorTrue = Reducer.toArray() as AsyncReducer.Accept<T, RT>,
				collectorFalse = Reducer.toArray() as AsyncReducer.Accept<T, RF>,
			} = options;

			return AsyncReducer.create(
				() =>
					Promise.all([
						AsyncReducer.from(collectorTrue).compile(),
						AsyncReducer.from(collectorFalse).compile(),
					]),
				async (state, value, index) => {
					const instanceIndex = (await pred(value, index)) ? 0 : 1;

					await state[instanceIndex].next(value);

					return state;
				},
				(state) =>
					Promise.all(
						Stream.from(state).mapPure((v) => v.getOutput()),
					) as Promise<[RT, RF]>,
			);
		},
		groupBy: <T, K, R>(
			valueToKey: (value: T, index: number) => MaybePromise<K>,
			options: {
				collector?: AsyncReducer.Accept<readonly [K, T], R> | undefined;
			} = {},
		): AsyncReducer<T, R> => {
			const {
				collector = Reducer.toJSMultiMap() as AsyncReducer.Accept<
					readonly [K, T],
					R
				>,
			} = options;

			return AsyncReducer.create(
				() => AsyncReducer.from(collector).compile(),
				async (state, value, index) => {
					const key = await valueToKey(value, index);
					await state.next([key, value]);
					return state;
				},
				(state) => state.getOutput(),
			);
		},
		race: <T, R, O>(
			reducers: AsyncReducer.Accept<T, R>[],
			otherwise?: AsyncOptLazy<O>,
		) => {
			return AsyncReducer.create<
				T,
				R | O,
				{
					instances: AsyncReducer.Instance<T, R>[];
					doneInstance: AsyncReducer.Instance<T, R> | undefined;
				}
			>(
				async (initHalt) => {
					const instances = await Promise.all(
						Stream.from(reducers).mapPure((reducer) =>
							AsyncReducer.from(reducer).compile(),
						),
					);
					const doneInstance = instances.find((instance) => instance.halted);

					if (undefined !== doneInstance) {
						initHalt();
					}

					return { instances, doneInstance };
				},
				async (state, next, _, halt) => {
					for (const instance of state.instances) {
						await instance.next(next);

						if (instance.halted) {
							state.doneInstance = instance;
							halt();
							return state;
						}
					}

					return state;
				},
				(state) =>
					state.doneInstance === undefined
						? AsyncOptLazy.toMaybePromise(otherwise!)
						: state.doneInstance.getOutput(),
			);
		},
		combine: <T, const S extends AsyncReducer.CombineShape<T>>(
			shape: S & AsyncReducer.CombineShape<T>,
		): any => {
			if (shape instanceof AsyncReducerBase) {
				return shape as any;
			}
			if (shape instanceof ReducerBase) {
				return AsyncReducer.from(shape) as any;
			}

			if (Array.isArray(shape)) {
				return combineArr(
					...(shape.map((item) => AsyncReducer.combine(item as any)) as any),
				) as any;
			}

			if (typeof shape === 'object' && shape !== null) {
				const result: any = {};

				for (const key in shape) {
					result[key] = AsyncReducer.combine((shape as any)[key]);
				}

				return combineObj(result) as any;
			}

			throw new InvalidCombineShapeError();
		},
		pipe: (...nextReducers: AsyncReducer.Accept<any, any>[]): any => {
			if (nextReducers.length < 2) {
				RimbuError.throwInvalidUsageError(
					'Reducer.pipe should have at least two arguments',
				);
			}

			const [current, next, ...others] = nextReducers as AsyncReducer.Accept<
				any,
				any
			>[];

			if (others.length > 0) {
				return AsyncReducer.pipe(
					current,
					(AsyncReducer.pipe as any)(next, ...others),
				);
			}

			return AsyncReducer.create(
				async (inithalt) => {
					const currentInstance = await AsyncReducer.from(current).compile();
					const nextInstance = await AsyncReducer.from(next).compile();

					if (currentInstance.halted || nextInstance.halted) {
						inithalt();
					}

					return {
						currentInstance,
						nextInstance,
					};
				},
				async (state, next, index, halt) => {
					const { currentInstance, nextInstance } = state;

					await currentInstance.next(next);
					await nextInstance.next(await currentInstance.getOutput());

					if (currentInstance.halted || nextInstance.halted) {
						halt();
					}

					return state;
				},
				async (state, index, halted) => {
					if (halted && index === 0) {
						await state.nextInstance.next(
							await state.currentInstance.getOutput(),
						);
					}

					return state.nextInstance.getOutput();
				},
				async (state, err) => {
					await Promise.all([
						state.currentInstance.onClose(err),
						state.nextInstance.onClose(err),
					]);
				},
			);
		},
	}),
);
