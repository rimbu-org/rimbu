import { AsyncOptLazy, type MaybePromise } from '@rimbu/common/async-opt-lazy';
import { type AsyncCollectFun, CollectFun } from '@rimbu/common/collect';
import {
	type AsyncFastIterator,
	AsyncStream,
	type AsyncStreamSource,
} from '@rimbu/stream/async';
import { AsyncReducer } from '@rimbu/stream/async/reducer';

import { AsyncReducerInstanceImpl } from '#async/reducer-instance';
import { identity } from '#stream/utils';

/**
 * A base class that can be used to easily AsyncReducer.create `AsyncReducer` instances.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 * @typeparam S - the internal state type
 */
export class AsyncReducerBase<I, O, S> implements AsyncReducer.Impl<I, O, S> {
	constructor(
		readonly init: (initHalt: () => void) => MaybePromise<S>,
		readonly next: (
			state: S,
			elem: I,
			index: number,
			halt: () => void,
		) => MaybePromise<S>,
		readonly stateToResult: (
			state: S,
			index: number,
			halted: boolean,
		) => MaybePromise<O>,
		readonly onClose?: (state: S, error?: unknown) => MaybePromise<void>,
	) {}

	filterInput(
		pred: (value: I, index: number, halt: () => void) => MaybePromise<boolean>,
		options: { negate?: boolean | undefined } = {},
	): any {
		const { negate = false } = options;

		return AsyncReducer.create<I, any>(
			() => this.compile(),
			async (state, elem, index, halt) => {
				if ((await pred(elem, index, halt)) !== negate) {
					await state.next(elem);

					if (state.halted) {
						halt();
					}
				}

				return state;
			},
			(state) => state.getOutput(),
			(state, err) => state.onClose(err),
		);
	}

	mapInput<I2>(
		mapFun: (value: I2, index: number) => MaybePromise<I>,
	): AsyncReducer<I2, O> {
		return AsyncReducer.create(
			this.init,
			async (state, elem, index, halt): Promise<S> =>
				this.next(state, await mapFun(elem, index), index, halt),
			this.stateToResult,
			this.onClose,
		);
	}

	flatMapInput<I2>(
		flatMapFun: (
			value: I2,
			index: number,
		) => MaybePromise<AsyncStreamSource<I>>,
	): AsyncReducer<I2, O> {
		return AsyncReducer.create<I2, O, AsyncReducer.Instance<I, O>>(
			() => this.compile(),
			async (state, elem, index, halt) => {
				if (state.halted) {
					halt();
					return state;
				}

				const elems = await flatMapFun(elem, index);

				const iter = AsyncStream.from(elems)[Symbol.asyncIterator]();
				const done = Symbol();
				let value: I | typeof done;

				while (done !== (value = await iter.fastNext(done))) {
					await state.next(value);

					if (state.halted) {
						halt();
						break;
					}
				}

				return state;
			},
			(state) => state.getOutput(),
			(state, err) => state.onClose(err),
		);
	}

	collectInput<I2>(collectFun: AsyncCollectFun<I2, I>): AsyncReducer<I2, O> {
		return AsyncReducer.create(
			() => this.compile(),
			async (state, elem, index, halt) => {
				const nextElem = await collectFun(elem, index, CollectFun.Skip, halt);

				if (CollectFun.Skip !== nextElem) {
					await state.next(nextElem);
					if (state.halted) {
						halt();
					}
				}

				return state;
			},
			(state) => state.getOutput(),
			(state, err) => state.onClose(err),
		);
	}

	mapOutput<O2>(
		mapFun: (value: O, index: number, halted: boolean) => MaybePromise<O2>,
	): AsyncReducer<I, O2> {
		return AsyncReducer.create(
			this.init,
			this.next,
			async (state, index, halted): Promise<O2> =>
				mapFun(await this.stateToResult(state, index, halted), index, halted),
			this.onClose,
		);
	}

	takeOutput(amount: number): AsyncReducer<I, O> {
		if (amount <= 0) {
			return AsyncReducer.create(
				(initHalt) => {
					initHalt();
					return this.init(initHalt);
				},
				this.next,
				this.stateToResult,
				this.onClose,
			);
		}

		return AsyncReducer.create(
			this.init,
			(state, next, index, halt) => {
				if (index >= amount - 1) {
					halt();
				}
				return this.next(state, next, index, halt);
			},
			this.stateToResult,
			this.onClose,
		);
	}

	takeOutputUntil(
		pred: (value: O, index: number) => MaybePromise<boolean>,
		options: { negate?: boolean } = {},
	): AsyncReducer<I, O> {
		const { negate = false } = options;

		return AsyncReducer.create(
			this.init,
			async (state, next, index, halt) => {
				const nextState = await this.next(state, next, index, halt);

				const nextOutput = await this.stateToResult(nextState, index, false);

				if ((await pred(nextOutput, index)) !== negate) {
					halt();
				}

				return nextState;
			},
			this.stateToResult,
			this.onClose,
		);
	}

	takeInput(amount: number): AsyncReducer<I, O> {
		if (amount <= 0) {
			return AsyncReducer.create(
				this.init,
				identity,
				this.stateToResult,
				this.onClose,
			);
		}

		return this.filterInput((_, i, halt): boolean => {
			if (i >= amount - 1) {
				halt();
			}

			return i < amount;
		});
	}

	dropInput(amount: number): AsyncReducer<I, O> {
		if (amount <= 0) {
			return this as AsyncReducer<I, O>;
		}

		return this.filterInput((_, i): boolean => i >= amount);
	}

	sliceInput(from = 0, amount?: number): AsyncReducer<I, O> {
		if (undefined === amount) return this.dropInput(from);
		if (amount <= 0)
			return AsyncReducer.create(this.init, identity, this.stateToResult);
		if (from <= 0) return this.takeInput(amount);

		return this.takeInput(amount).dropInput(from);
	}

	chain<O2 extends O>(
		nextReducers: AsyncStreamSource<
			AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O2]>
		>,
	): AsyncReducer<I, O2> {
		return AsyncReducer.create(
			async (
				initHalt,
			): Promise<{
				activeInstance: AsyncReducer.Instance<I, O2>;
				iterator: AsyncFastIterator<
					AsyncOptLazy<AsyncReducer.Accept<I, O2>, [O2]>
				>;
			}> => {
				const iterator = AsyncStream.from(nextReducers)[Symbol.asyncIterator]();
				let activeInstance = (await this.compile()) as AsyncReducer.Instance<
					I,
					O2
				>;

				if (undefined !== activeInstance && activeInstance.halted) {
					let output = await activeInstance.getOutput();

					do {
						const creator = await iterator.fastNext();

						if (undefined === creator) {
							initHalt();

							return {
								activeInstance,
								iterator,
							};
						}
						const nextReducer = await AsyncOptLazy.toMaybePromise(
							creator,
							output,
						);

						activeInstance = await AsyncReducer.from(nextReducer).compile();
						output = await activeInstance.getOutput();
					} while (activeInstance.halted);
				}

				return {
					activeInstance,
					iterator,
				};
			},
			async (state, next, index, halt) => {
				await state.activeInstance.next(next);

				while (state.activeInstance.halted) {
					const output = await state.activeInstance.getOutput();
					const creator = await state.iterator.fastNext();

					if (undefined === creator) {
						halt();

						return state;
					}

					const nextReducer = await AsyncOptLazy.toMaybePromise(
						creator,
						output,
					);

					state.activeInstance = await AsyncReducer.from(nextReducer).compile();
				}

				return state;
			},
			(state) => state.activeInstance.getOutput(),
		);
	}

	async compile(): Promise<AsyncReducer.Instance<I, O>> {
		const instance = new AsyncReducerInstanceImpl(this);
		await instance.initialize();
		return instance;
	}
}
