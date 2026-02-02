import {
	ReducerClosedError,
	ReducerHaltedError,
	ReducerNotInitializedError,
} from '#async/reducer-errors';
import type { AsyncReducer } from '@rimbu/stream/async/reducer';

/**
 * The default `AsyncReducer.Impl` implementation.
 * @typeparam I - the input element type
 * @typeparam O - the output element type
 * @typeparam S - the reducer state type
 */
export class AsyncReducerInstanceImpl<I, O, S>
	implements AsyncReducer.Instance<I, O>
{
	constructor(readonly reducer: AsyncReducer.Impl<I, O, S>) {}

	#state: S | undefined;
	#index = 0;
	#initialized = false;
	#halted = false;
	#closed = false;

	async initialize(): Promise<void> {
		if (this.#closed) {
			throw new ReducerClosedError();
		}

		this.#state = await this.reducer.init(this.halt);
		this.#initialized = true;
	}

	halt = (): void => {
		if (this.#closed) {
			throw new ReducerClosedError();
		}

		this.#halted = true;
	};

	get halted(): boolean {
		return this.#halted;
	}

	get index(): number {
		return this.#index;
	}

	next = async (value: I): Promise<void> => {
		if (!this.#initialized) {
			throw new ReducerNotInitializedError();
		}
		if (this.#closed) {
			throw new ReducerClosedError();
		}
		if (this.#halted) {
			throw new ReducerHaltedError();
		}

		this.#state = await this.reducer.next(
			this.#state!,
			value,
			this.#index++,
			this.halt,
		);
	};

	async getOutput(): Promise<O> {
		if (!this.#initialized) {
			throw new ReducerNotInitializedError();
		}

		return this.reducer.stateToResult(this.#state!, this.index, this.halted);
	}

	async onClose(err?: unknown): Promise<void> {
		if (this.#closed) {
			throw new ReducerClosedError();
		}

		this.#closed = true;

		await this.reducer.onClose?.(this.#state!, err);
	}
}
