import type { Task } from '@rimbu/task';

import { Semaphore } from '@rimbu/channel/semaphore';
import { WaitGroup } from '@rimbu/channel/wait-group';
import { TaskCancellationError } from '@rimbu/task';

import {
	type Cleanup,
	cleanupOn,
	type DisposableCallback,
	disposableDelay,
	withTimeout,
} from '#task/utils';

type LaunchResult<R> =
	| { type: 'result'; value: R }
	| { type: 'error'; error: any };

export class TaskContextImpl implements Task.Context {
	readonly #cancelController: AbortController = new AbortController();
	readonly #childrenWaitGroup = WaitGroup.create();

	readonly #parent: Task.Context | undefined;
	readonly #children: Set<Task.Context> = new Set();
	readonly #maxBranchSemaphore: Semaphore | undefined;
	readonly #isolated: boolean;

	#nextChildId = 0;

	constructor(
		readonly id: string,
		isolated: boolean,
		parent: Task.Context | undefined,
		maxBranch?: number | undefined,
	) {
		this.#parent = parent;
		this.#isolated = isolated;

		if (undefined !== maxBranch && maxBranch > 0) {
			this.#maxBranchSemaphore = Semaphore.create({ maxSize: maxBranch });
		}
	}

	get parent(): Task.Context | undefined {
		return this.#parent;
	}

	get children(): Iterable<Task.Context> {
		return this.#children;
	}

	get hasChildren(): boolean {
		return this.#children.size > 0;
	}

	get isCancelled(): boolean {
		return this.#cancelController.signal.aborted;
	}

	get isActive(): boolean {
		return !this.isCancelled;
	}

	get [Symbol.dispose](): () => void {
		return this.cancel;
	}

	cancel = (): void => {
		if (!this.isCancelled) {
			this.#cancelController.abort();
		}
	};

	cancelAllChildren = (): void => {
		for (const child of this.#children) {
			child.cancel();
		}
	};

	onCancelled = (cleanup: Cleanup): DisposableCallback => {
		return cleanupOn(this.cancelledSignal, cleanup);
	};

	get cancelledSignal(): AbortSignal {
		return this.#cancelController.signal;
	}

	#createChildContext = (
		options: {
			id?: string | undefined;
			isolated?: boolean | undefined;
			maxBranch?: number | undefined;
		} = {},
	): Task.Context => {
		const {
			id:
				childId = `${this.id}_${this.#isolated ? 'I-' : ''}${this.#nextChildId++}`,
			isolated = false,
			maxBranch,
		} = options;

		const childContext = new TaskContextImpl(
			childId,
			isolated,
			this,
			maxBranch,
		);
		this.#children.add(childContext);

		const unsubscribe = this.onCancelled(childContext);

		childContext.onCancelled(() => {
			unsubscribe();
			this.#children.delete(childContext);
		});

		return childContext;
	};

	throwIfCancelled = (): void => {
		if (this.isCancelled) {
			throw new TaskCancellationError();
		}
	};

	yield = async (): Promise<void> => {
		this.throwIfCancelled();
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
		this.throwIfCancelled();
	};

	delay = async (delayMs: number): Promise<void> => {
		this.throwIfCancelled();
		using delayPromise = disposableDelay(delayMs);
		using _ = this.onCancelled(delayPromise);
		await delayPromise;
		this.throwIfCancelled();
	};

	run = async <R, A extends readonly any[]>(
		task: Task<R, A>,
		args: A = [] as any as A,
	): Promise<R> => {
		try {
			return await unpackTask(task)(this, ...args);
		} finally {
			await this.#childrenWaitGroup.wait({ signal: this.cancelledSignal });
		}
	};

	launch = <R, A extends readonly any[]>(
		task: Task<R, A>,
		options: {
			id?: string | undefined;
			isolated?: boolean | undefined;
			maxBranch?: number | undefined;
			args?: A | undefined;
		} = {},
	): Task.Job<R> => {
		const cancelChildController = new AbortController();

		const promise = (async (): Promise<LaunchResult<R>> => {
			this.throwIfCancelled();
			const childContext = this.#createChildContext(options);
			const unsubscribeCancel = cleanupOn(cancelChildController.signal, childContext);
			let branchAcquired = false;
			let launchResult: LaunchResult<R>;

			try {
				// ensure parent waits for child to complete
				this.#childrenWaitGroup.add();

				// if max branching set, wait for permission to start
				await this.#maxBranchSemaphore?.acquire(1, {
					signal: this.cancelledSignal,
				});
				branchAcquired = true;

				const { args = [] as unknown as A } = options;

				const result = await childContext.run(task, args);
				launchResult = { type: 'result', value: result };
			} catch (error) {
				if (!this.#isolated) {
					this.cancel();
				}
				launchResult = { type: 'error', error };
			} finally {
				// Explicitly cancel the child context so #children.delete fires
				// synchronously here, before done() and before the promise resolves.
				// This ensures join() callers observe hasChildren = false immediately.
				unsubscribeCancel[Symbol.dispose]();
				childContext.cancel();

				if (branchAcquired) {
					// if max branching set, release the slot
					this.#maxBranchSemaphore?.release();
				}
				// ensure parent stops waiting for child
				this.#childrenWaitGroup.done();
			}

			return launchResult!;
		})();

		const result: Task.Job<R> = {
			join: async (options = {}): Promise<any> => {
				try {
					const result = await withTimeout(promise, options.timeoutMs);

					if (result.type === 'result') {
						return result.value;
					} else {
						throw result.error;
					}
				} catch (error) {
					if (options.recover) {
						return options.recover(error);
					}

					if (!this.#isolated) {
						// if not isolated, cancel the parent context on error
						this.cancel();
					}

					throw error;
				}
			},
			cancel: (): void => {
				cancelChildController.abort();
			},
			get [Symbol.dispose](): () => void {
				return result.cancel;
			},
			cancelAndJoin: async (): Promise<void> => {
				result.cancel();
				await result.join({
					recover: (error) => {
						if (error instanceof TaskCancellationError) {
							return;
						}
						throw error;
					},
				});
			},
		};

		return result;
	};
}

function unpackTask<R, A extends readonly any[]>(
	task: Task<R, A>,
): Task.Fun<R, A> {
	if (typeof task === 'function') {
		return async (context, ...args) => {
			context.throwIfCancelled();
			const result = await task(context, ...args);
			context.throwIfCancelled();
			return result;
		};
	} else {
		throw new Error('Invalid task type');
	}
}
