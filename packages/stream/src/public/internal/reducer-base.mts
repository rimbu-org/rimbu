import { CollectFun } from '@rimbu/common/collect';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream, type FastIterator, type StreamSource } from '@rimbu/stream';
import { Reducer } from '@rimbu/stream/reducer';
import { ReducerInstanceImpl } from './reducer-instance.mjs';
import { identity } from './utils.mjs';

/**
 * A base class that can be used to easily Reducer.create `Reducer` instances.
 * @typeparam I - the input value type
 * @typeparam O - the output value type
 * @typeparam S - the internal state type
 */
export class ReducerBase<I, O, S> implements Reducer.Impl<I, O, S> {
	constructor(
		readonly init: (initHalt: () => void) => S,
		readonly next: (state: S, elem: I, index: number, halt: () => void) => S,
		readonly stateToResult: (state: S, index: number, halted: boolean) => O,
	) {}

	filterInput(
		pred: (value: I, index: number, halt: () => void) => boolean,
		options: { negate?: boolean | undefined } = {},
	): any {
		const { negate = false } = options;

		return Reducer.create<I, O, Reducer.Instance<I, O>>(
			() => this.compile(),
			(state, elem, index, halt) => {
				if (pred(elem, index, halt) !== negate) {
					state.next(elem);

					if (state.halted) {
						halt();
					}
				}

				return state;
			},
			(state): O => state.getOutput(),
		);
	}

	mapInput<I2>(mapFun: (value: I2, index: number) => I): Reducer<I2, O> {
		return Reducer.create(
			this.init,
			(state, elem, index, halt): S =>
				this.next(state, mapFun(elem, index), index, halt),
			this.stateToResult,
		);
	}

	flatMapInput<I2>(
		flatMapFun: (value: I2, index: number) => StreamSource<I>,
	): Reducer<I2, O> {
		return Reducer.create<I2, O, Reducer.Instance<I, O>>(
			() => this.compile(),
			(state, elem, index, halt) => {
				if (state.halted) {
					halt();
					return state;
				}

				const elems = flatMapFun(elem, index);

				const iter = Stream.from(elems)[Symbol.iterator]();
				const done = Symbol();
				let value: I | typeof done;

				while (done !== (value = iter.fastNext(done))) {
					state.next(value);

					if (state.halted) {
						halt();
						break;
					}
				}

				return state;
			},
			(state) => state.getOutput(),
		);
	}

	collectInput<I2>(collectFun: CollectFun<I2, I>): Reducer<I2, O> {
		return Reducer.create(
			() => this.compile(),
			(state, elem, index, halt) => {
				const nextElem = collectFun(elem, index, CollectFun.Skip, halt);

				if (CollectFun.Skip !== nextElem) {
					state.next(nextElem);
					if (state.halted) {
						halt();
					}
				}

				return state;
			},
			(state): O => state.getOutput(),
		);
	}

	mapOutput<O2>(
		mapFun: (value: O, index: number, halted: boolean) => O2,
	): Reducer<I, O2> {
		return Reducer.create(
			this.init,
			this.next,
			(state, index, halted): O2 =>
				mapFun(this.stateToResult(state, index, halted), index, halted),
		);
	}

	takeOutput(amount: number): Reducer<I, O> {
		if (amount <= 0) {
			return Reducer.create(
				(initHalt) => {
					initHalt();
					return this.init(initHalt);
				},
				this.next,
				this.stateToResult,
			);
		}

		return Reducer.create(
			this.init,
			(state, next, index, halt) => {
				if (index >= amount - 1) {
					halt();
				}
				return this.next(state, next, index, halt);
			},
			this.stateToResult,
		);
	}

	takeOutputUntil(
		pred: (value: O, index: number) => boolean,
		options: { negate?: boolean } = {},
	): Reducer<I, O> {
		const { negate = false } = options;

		return Reducer.create(
			this.init,
			(state, next, index, halt) => {
				const nextState = this.next(state, next, index, halt);

				const nextOutput = this.stateToResult(nextState, index, false);

				if (pred(nextOutput, index) !== negate) {
					halt();
				}

				return nextState;
			},
			this.stateToResult,
		);
	}

	takeInput(amount: number): Reducer<I, O> {
		if (amount <= 0) {
			return Reducer.create(this.init, identity, this.stateToResult);
		}

		return this.filterInput((_, i, halt): boolean => {
			if (i >= amount - 1) {
				halt();
			}

			return i < amount;
		});
	}

	dropInput(amount: number): Reducer<I, O> {
		if (amount <= 0) {
			return this;
		}

		return this.filterInput((_, i): boolean => i >= amount);
	}

	sliceInput(from = 0, amount?: number): Reducer<I, O> {
		if (undefined === amount) return this.dropInput(from);
		if (amount <= 0)
			return Reducer.create(this.init, identity, this.stateToResult);
		if (from <= 0) return this.takeInput(amount);

		return this.takeInput(amount).dropInput(from);
	}

	chain<O2 extends O>(
		nextReducers: StreamSource<OptLazy<Reducer<I, O2>, [O2]>>,
	): Reducer<I, O2> {
		return Reducer.create(
			(
				initHalt,
			): {
				activeInstance: Reducer.Instance<I, O2>;
				iterator: FastIterator<OptLazy<Reducer<I, O2>, [O2]>>;
			} => {
				const iterator = Stream.from(nextReducers)[Symbol.iterator]();
				let activeInstance = this.compile() as Reducer.Instance<I, O2>;

				if (undefined !== activeInstance && activeInstance.halted) {
					let output = activeInstance.getOutput();

					do {
						const creator = iterator.fastNext();

						if (undefined === creator) {
							initHalt();

							return {
								activeInstance,
								iterator,
							};
						}
						activeInstance = OptLazy(creator, output).compile();
						output = activeInstance.getOutput();
					} while (activeInstance.halted);
				}

				return {
					activeInstance,
					iterator,
				};
			},
			(state, next, index, halt) => {
				state.activeInstance.next(next);

				while (state.activeInstance.halted) {
					const output = state.activeInstance.getOutput();
					const creator = state.iterator.fastNext();

					if (undefined === creator) {
						halt();

						return state;
					}

					state.activeInstance = OptLazy(creator, output).compile();
				}

				return state;
			},
			(state) => state.activeInstance.getOutput(),
		);
	}

	compile(): Reducer.Instance<I, O> {
		return new ReducerInstanceImpl(this);
	}
}
