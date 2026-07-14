import { Module } from '@rimbu/common/module';

import { WaitGroupError } from '#channel/wait-group-error';
import { WaitGroupImpl } from '#channel/wait-group-impl';

export { WaitGroupError };

/**
 * A WaitGroup is a way to perform fork-join logic in an asynchronous context. It allows a process to create an
 * arbitrary amount of sub-processes, and wait for all of them to finish before continuing.
 */
export interface WaitGroup {
	/**
	 * Adds the given amount of processes to the WaitGroup.
	 * @param amount - (default: 1) the amount of processes to add
	 * @returns `void`
	 */
	add(amount?: number): void;
	/**
	 * Informs the WaitGroup that a process has completed. Throws `WaitGroupError.UnderflowError` if called
	 * more times than `add()`.
	 * @param amount - (default: 1) the amount of processes to mark as done
	 * @returns `void`
	 */
	done(amount?: number): void;
	/**
	 * Blocks until all the processes in the WaitGroup have completed.
	 * @param options - optional wait options
	 * @param options.signal - an `AbortSignal` that can be used to abort the wait
	 * @param options.timeoutMs - optional timeout in milliseconds after which the wait will reject
	 * @returns a `Promise` that resolves when all processes have completed
	 */
	wait(options?: {
		signal?: AbortSignal | undefined;
		timeoutMs?: number | undefined;
	}): Promise<void>;
}

export namespace WaitGroup {
	/**
	 * The WaitGroup Error type.
	 */
	export type Error = WaitGroupError;
}

const waitGroupModule = Module.create<typeof WaitGroup>(() => ({
	create: () => new WaitGroupImpl(),
}));

export const WaitGroup: {
	/**
	 * Returns a new `WaitGroup` that can be used to wait for fan-out processes to complete.
	 * @returns a new `WaitGroup` instance
	 */
	create(): WaitGroup;
} = waitGroupModule.build();
