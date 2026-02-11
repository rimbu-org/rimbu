import type { ReducerFactory } from '#stream/reducer-factory';

import * as RimbuError from '@rimbu/base/rimbu-error';
import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { type FastIterator, Stream, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';

import { ReducerBase } from '#stream/reducer-base';
import { InvalidCombineShapeError } from '#stream/reducer-errors';
import { identity } from '#stream/utils';

/**
 * Combines multiple reducers in an object's values of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an object containing
 * the corresponding output of each reducer at the matching object property.
 */
function combineObj<T, R extends { readonly [key: string]: unknown }>(
	reducerObj: { readonly [K in keyof R]: Reducer<T, R[K]> } & Record<
		string,
		Reducer<T, unknown>
	>,
): Reducer<T, R> {
	return Reducer.create(
		(initHalt) => {
			const result: Record<string, Reducer.Instance<T, any>> = {};

			let allHalted = true;

			for (const key in reducerObj) {
				const instance = reducerObj[key].compile();

				allHalted = allHalted && instance.halted;

				result[key] = instance;
			}

			if (allHalted) {
				initHalt();
			}

			return result;
		},
		(state, elem, index, halt) => {
			let allHalted = true;

			for (const key in state) {
				const reducerInstance = state[key];

				if (!reducerInstance.halted) {
					reducerInstance.next(elem);

					allHalted = allHalted && reducerInstance.halted;
				}
			}

			if (allHalted) {
				halt();
			}

			return state;
		},
		(state) => {
			const result: any = {};

			for (const key in state) {
				result[key] = state[key].getOutput();
			}

			return result as R;
		},
	);
}

/**
 * Combines multiple reducers in an array of the same input type into a single reducer that
 * forwards each incoming value to all reducers, and when output is requested will return an array containing
 * the corresponding output of each reducer.
 */
function combineArr<T, R extends readonly [unknown, unknown, ...unknown[]]>(
	...reducers: { [K in keyof R]: Reducer<T, R[K]> } & Reducer<T, unknown>[]
): Reducer<T, R> {
	return Reducer.create<T, any, Reducer.Instance<T, unknown>[]>(
		(initHalt) => {
			let allHalted = true;

			const result = reducers.map((reducer) => {
				const instance = reducer.compile();

				allHalted = allHalted && instance.halted;

				return instance;
			});

			if (allHalted) {
				initHalt();
			}

			return result;
		},
		(state, elem, index, halt) => {
			let allHalted = true;

			let i = -1;
			const len = state.length;

			while (++i < len) {
				const reducerInstance = state[i];

				if (!reducerInstance.halted) {
					reducerInstance.next(elem);

					allHalted = allHalted && reducerInstance.halted;
				}
			}

			if (allHalted) {
				halt();
			}

			return state;
		},
		(state) => state.map((reducerInstance) => reducerInstance.getOutput()),
	);
}

export const reducerFactoryModule = Module.create<ReducerFactory>((mod) => ({
	create: Module.factory(
		(init, next, stateToResult) => new ReducerBase(init, next, stateToResult),
	),
	createMono: Module.factory((init, next, stateToResult) =>
		mod.create(init, next, stateToResult ?? identity),
	),
	createOutput: Module.factory((init, next, stateToResult) => {
		return mod.create(init, next, stateToResult ?? identity);
	}),
	fold: Module.factory((init, next) =>
		Reducer.createOutput(() => OptLazy(init), next),
	),
	sum: Module.lazy(() =>
		mod.createMono(
			() => 0,
			(state, next) => state + next,
		),
	),
	product: Module.lazy(() =>
		mod.createMono(
			() => 1,
			(state, next, _, halt) => {
				if (0 === next) halt();
				return state * next;
			},
		),
	),
	average: Module.lazy(() =>
		mod.createMono(
			() => 0,
			(avg, value, index) => avg + (value - avg) / (index + 1),
		),
	),
	minBy: Module.factory(
		<T, O>(
			compFun: (v1: T, v2: T) => number,
			otherwise?: OptLazy<O>,
		): Reducer<T, T | O> => {
			const token = Symbol();

			return mod.create(
				() => token as T | typeof token,
				(state, next) => {
					if (token === state) {
						return next;
					}

					return compFun(state, next) < 0 ? state : next;
				},
				(state) => (token === state ? OptLazy(otherwise!) : state),
			);
		},
	),
	min: Module.factory(<O>(otherwise?: OptLazy<O>) => {
		return mod.create<number, number | O, number | undefined>(
			() => undefined,
			(state, next): number =>
				undefined !== state && state < next ? state : next,
			(state): number | O => state ?? OptLazy(otherwise!),
		);
	}),
	maxBy: Module.factory(
		<T, O>(
			compFun: (v1: T, v2: T) => number,
			otherwise?: OptLazy<O>,
		): Reducer<T, T | O> => {
			const token = Symbol();

			return mod.create<T, T | O, T | typeof token>(
				() => token,
				(state, next): T => {
					if (token === state) {
						return next;
					}
					return compFun(state, next) > 0 ? state : next;
				},
				(state): T | O => (token === state ? OptLazy(otherwise!) : state),
			);
		},
	),
	max: Module.factory(
		<O>(otherwise?: OptLazy<O>): Reducer<number, number | O> => {
			return mod.create<number, number | O, number | undefined>(
				() => undefined,
				(state, next): number =>
					undefined !== state && state > next ? state : next,
				(state): number | O => state ?? OptLazy(otherwise!),
			);
		},
	),
	join: Module.factory(
		<T>({
			sep = '',
			start = '',
			end = '',
			valueToString = String as (value: T) => string,
		} = {}): Reducer<T, string> => {
			return mod.create(
				() => '',
				(state, next, index) => {
					const valueString = valueToString(next);

					if (index <= 0) {
						return start.concat(valueString);
					}

					return state.concat(sep, valueToString(next));
				},
				(state): string => state.concat(end),
			);
		},
	),
	count: Module.lazy(() =>
		mod.create(
			() => {},
			identity,
			(_, index) => index,
		),
	),
	first: Module.factory(<T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
		return mod.create<T, T | O, T | undefined>(
			() => undefined,
			(_, next, __, halt): T => {
				halt();
				return next;
			},
			(state, index): T | O => (index <= 0 ? OptLazy(otherwise!) : state!),
		);
	}),
	last: Module.factory(<T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
		return mod.create<T, T | O, T | undefined>(
			() => undefined,
			(_, next): T => next,
			(state, index): T | O => (index <= 0 ? OptLazy(otherwise!) : state!),
		);
	}),
	single: Module.factory(<T, O>(otherwise?: OptLazy<O>): Reducer<T, T | O> => {
		return mod.create<T, T | O, T | undefined>(
			() => undefined,
			(state, next, index, halt): T => {
				if (index > 1) {
					halt();
				}

				return next;
			},
			(state, index): T | O => (index !== 1 ? OptLazy(otherwise!) : state!),
		);
	}),
	some: Module.factory((pred, options = {}) => {
		return mod.nonEmpty.filterInput(pred, options);
	}),
	every: Module.factory((pred, options = {}) => {
		const { negate = false } = options;

		return mod.isEmpty.filterInput(pred, { negate: !negate });
	}),
	equals: Module.factory(
		<T>(
			other: StreamSource<T>,
			options: { eq?: Eq<T>; negate?: boolean } = {},
		): Reducer<T, boolean> => {
			const { eq = Eq.objectIs, negate = false } = options;

			const sliceStream = Stream.from(other);
			const done = Symbol();

			return Reducer.create<
				T,
				boolean,
				{ iter: FastIterator<T>; nextSeq: T | typeof done; result: boolean }
			>(
				() => {
					const iter = sliceStream[Symbol.iterator]();

					const nextSeq = iter.fastNext(done);

					return { iter, nextSeq, result: false };
				},
				(state, next, _, halt) => {
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

					state.nextSeq = state.iter.fastNext(done);

					if (done === state.nextSeq) {
						state.result = true;
					}

					return state;
				},
				(state, index, halted) => !halted && done === state.nextSeq,
			);
		},
	),
	contains: Module.factory((elem, options = {}) => {
		const { amount = 1, eq = Object.is, negate = false } = options;

		return Reducer.create(
			(initHalt) => {
				if (amount <= 0) {
					initHalt();
				}

				return amount;
			},
			(state, next, _, halt): number => {
				const satisfies = eq(next as any, elem) !== negate;

				if (!satisfies) {
					return state;
				}

				const newRemain = state - 1;

				if (newRemain <= 0) {
					halt();
				}

				return newRemain;
			},
			(state) => state <= 0,
		);
	}),
	startsWithSlice: Module.factory(
		<T>(
			slice: StreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number } = {},
		): Reducer<T, boolean> => {
			const sliceStream = Stream.from(slice);
			const done = Symbol();
			const { eq = Eq.objectIs, amount = 1 } = options;

			return Reducer.create<
				T,
				boolean,
				{
					sliceIter: FastIterator<T>;
					sliceValue: T | typeof done;
					remain: number;
				}
			>(
				(initHalt) => {
					const sliceIter = sliceStream[Symbol.iterator]();
					const sliceValue = sliceIter.fastNext(done);

					if (done === sliceValue || amount <= 0) {
						initHalt();
						return { sliceIter, sliceValue, remain: 0 };
					}

					return {
						sliceIter,
						sliceValue: sliceValue,
						remain: amount,
					};
				},
				(state, next, _, halt) => {
					if (done === state.sliceValue) {
						RimbuError.throwInvalidStateError();
					}

					if (eq(next, state.sliceValue)) {
						state.sliceValue = state.sliceIter.fastNext(done);

						if (done === state.sliceValue) {
							state.remain--;
							if (state.remain <= 0) {
								halt();
							} else {
								state.sliceIter = sliceStream[Symbol.iterator]();
								state.sliceValue = state.sliceIter.fastNext(done);
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
	),
	endsWithSlice: Module.factory(
		<T>(
			slice: StreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number } = {},
		): Reducer<T, boolean> => {
			const sliceStream = Stream.from(slice);
			const done = Symbol();

			const newReducerSpec = Reducer.startsWithSlice(slice, options);

			return Reducer.create<T, boolean, Set<Reducer.Instance<T, boolean>>>(
				(initHalt) => {
					const sliceIter = sliceStream[Symbol.iterator]();
					const sliceValue = sliceIter.fastNext(done);

					if (done === sliceValue) {
						initHalt();
					}

					return new Set([newReducerSpec.compile()]);
				},
				(state, nextValue) => {
					for (const instance of state) {
						if (instance.halted) {
							state.delete(instance);
						} else {
							instance.next(nextValue);
						}
					}

					const newReducerInstance = newReducerSpec.compile();
					newReducerInstance.next(nextValue);

					state.add(newReducerInstance);

					return state;
				},
				(state) =>
					state.size === 0 ||
					Stream.from(state).some((instance) => instance.getOutput()),
			);
		},
	),
	containsSlice: Module.factory(
		<T>(
			slice: StreamSource<T>,
			options: { eq?: Eq<T> | undefined; amount?: number } = {},
		): Reducer<T, boolean> => {
			const { eq, amount = 1 } = options;

			return Reducer.pipe(
				mod.endsWithSlice(slice, { eq }),
				Reducer.contains(true, { amount }),
			);
		},
	),
	and: Module.lazy(() =>
		mod.createMono(
			() => true,
			(state, next, _, halt): boolean => {
				if (!next) {
					halt();
				}

				return next;
			},
		),
	),
	or: Module.lazy(() =>
		mod.createMono(
			() => false,
			(state, next, _, halt): boolean => {
				if (next) {
					halt();
				}

				return next;
			},
		),
	),
	isEmpty: Module.lazy(() => {
		return mod.createOutput(
			() => true,
			(_, __, ___, halt) => {
				halt();
				return false;
			},
		);
	}),
	nonEmpty: Module.lazy(() =>
		mod.createOutput(
			() => false,
			(_, __, ___, halt) => {
				halt();
				return true;
			},
		),
	),
	constant: Module.factory(<T>(value: OptLazy<T>): Reducer<any, T> => {
		return Reducer.create<any, T, void>(
			(initHalt) => {
				initHalt();
			},
			identity,
			() => OptLazy(value),
		);
	}),
	partition: Module.factory(
		<T, RT, RF = RT>(
			pred: (value: T, index: number) => boolean,
			options: any = {},
		): any => {
			const collectorTrue: Reducer<T, RT> =
				options.collectorTrue ?? Reducer.toArray();
			const collectorFalse: Reducer<T, RF> =
				options.collectorFalse ?? Reducer.toArray();

			return Reducer.create<
				T,
				[RT, RF],
				[Reducer.Instance<T, RT>, Reducer.Instance<T, RF>]
			>(
				() => [collectorTrue.compile(), collectorFalse.compile()],
				(state, value, index) => {
					const instanceIndex = pred(value, index) ? 0 : 1;

					state[instanceIndex].next(value);

					return state;
				},
				(state) => state.map((v) => v.getOutput()) as [RT, RF],
			);
		},
	),
	groupBy: Module.factory(
		<T, K, R>(
			valueToKey: (value: T, index: number) => K,
			options: {
				collector?: Reducer<readonly [K, T], R> | undefined;
			} = {},
		): Reducer<T, R> => {
			const {
				collector = Reducer.toJSMultiMap() as Reducer<readonly [K, T], R>,
			} = options;

			return Reducer.create(
				() => collector.compile(),
				(state, value, index) => {
					const key = valueToKey(value, index);
					state.next([key, value]);
					return state;
				},
				(state) => state.getOutput(),
			);
		},
	),
	race: Module.factory(
		<T, R, O>(
			reducers: StreamSource<Reducer<T, R>>,
			otherwise?: OptLazy<O>,
		) => {
			return Reducer.create<
				T,
				R | O,
				{
					instances: Reducer.Instance<T, R>[];
					doneInstance: Reducer.Instance<T, R> | undefined;
				}
			>(
				(initHalt) => {
					const instances = Stream.from(reducers)
						.map((reducer) => reducer.compile())
						.toArray();
					const doneInstance = instances.find((instance) => instance.halted);

					if (undefined !== doneInstance) {
						initHalt();
					}

					return { instances, doneInstance };
				},
				(state, next, _, halt) => {
					for (const instance of state.instances) {
						instance.next(next);

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
						? OptLazy(otherwise)!
						: state.doneInstance.getOutput(),
			);
		},
	),
	toArray: Module.factory(
		<T>(options: { reversed?: boolean } = {}): Reducer<T, T[]> => {
			const { reversed = false } = options;

			return mod.create(
				(): T[] => [],
				(state, next): T[] => {
					if (reversed) state.unshift(next);
					else state.push(next);

					return state;
				},
				(state): T[] => state.slice(),
			);
		},
	),
	toJSMap: Module.lazyGet(<K, V>(): Reducer<readonly [K, V], Map<K, V>> => {
		return mod.create(
			(): Map<K, V> => new Map(),
			(state, next): Map<K, V> => {
				state.set(next[0], next[1]);
				return state;
			},
			(state): Map<K, V> => new Map(state),
		);
	}),
	toJSMultiMap: Module.lazyGet(
		<K, V>(): Reducer<readonly [K, V], Map<K, V[]>> => {
			return mod.create(
				(): Map<K, V[]> => new Map(),
				(state, [key, value]) => {
					const entry = state.get(key);
					if (undefined === entry) {
						state.set(key, [value]);
					} else {
						entry.push(value);
					}
					return state;
				},
				(state) => new Map(state),
			);
		},
	),
	toJSSet: Module.lazyGet(<T>(): Reducer<T, Set<T>> => {
		return mod.create(
			(): Set<T> => new Set<T>(),
			(state, next): Set<T> => {
				state.add(next);
				return state;
			},
			(s): Set<T> => new Set(s),
		);
	}),
	toJSObject: Module.lazyGet(
		<K extends string | number | symbol, V>(): Reducer<
			readonly [K, V],
			Record<K, V>
		> => {
			return mod.create(
				() => ({}) as Record<K, V>,
				(state, entry) => {
					state[entry[0]] = entry[1];
					return state;
				},
				(s) => ({ ...s }),
			);
		},
	),
	combine: Module.factory(
		<T, const S extends Reducer.CombineShape<T>>(
			shape: S & Reducer.CombineShape<T>,
		): any => {
			if (shape instanceof ReducerBase) {
				return shape as any;
			}

			if (Array.isArray(shape)) {
				return combineArr(
					...(shape.map((item) => Reducer.combine(item)) as any),
				) as any;
			}

			if (typeof shape === 'object' && shape !== null) {
				const result: any = {};

				for (const key in shape) {
					result[key] = Reducer.combine((shape as any)[key]);
				}

				return combineObj(result) as any;
			}

			throw new InvalidCombineShapeError();
		},
	),
	pipe: Module.factory((...nextReducers: Reducer<any, any>[]): any => {
		if (nextReducers.length < 2) {
			RimbuError.throwInvalidUsageError(
				'Reducer.pipe should have at least two arguments',
			);
		}

		const [current, next, ...others] = nextReducers as Reducer<any, any>[];

		if (others.length > 0) {
			return Reducer.pipe(current, (Reducer.pipe as any)(next, ...others));
		}

		return Reducer.create(
			(inithalt) => {
				const currentInstance = current.compile();
				const nextInstance = next.compile();

				if (currentInstance.halted || nextInstance.halted) {
					inithalt();
				}

				return {
					currentInstance,
					nextInstance,
				};
			},
			(state, next, index, halt) => {
				const { currentInstance, nextInstance } = state;

				currentInstance.next(next);
				nextInstance.next(currentInstance.getOutput());

				if (currentInstance.halted || nextInstance.halted) {
					halt();
				}

				return state;
			},
			(state, index, halted) => {
				if (halted && index === 0) {
					state.nextInstance.next(state.currentInstance.getOutput());
				}

				return state.nextInstance.getOutput();
			},
		);
	}),
}));
