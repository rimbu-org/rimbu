import type { Task } from '@rimbu/task';

import { Semaphore } from '@rimbu/channel/semaphore';
import { WaitGroup } from '@rimbu/channel/wait-group';
import { TaskCancellationError } from '@rimbu/task';

import {
	type Cleanup,
	cleanupOn,
	type DisposableCallback,
	disposableDelay,
	toDisposableCallback,
	withTimeout,
} from '#task/utils';

type LaunchResult<R> =
	| { type: 'result'; value: R }
	| { type: 'error'; error: any };

// Never let internal WaitGroup abort errors escape from the task layer.
// The task's own error (or a TaskCancellationError) already conveys the
// correct signal to the caller.
async function waitIgnoringAbort(
	waitGroup: WaitGroup,
	signal: AbortSignal,
): Promise<void> {
	try {
		await waitGroup.wait({ signal });
	} catch {
		// aborted because this context was cancelled; nothing more to wait for.
	}
}

export class TaskContextImpl implements Task.Context {
	readonly #cancelController: AbortController = new AbortController();
	readonly #childrenWaitGroup = WaitGroup.create();

	readonly #parent: Task.Context | undefined;
	readonly #children: Set<Task.Context> = new Set();
	readonly #maxBranchSemaphore: Semaphore | undefined;
	readonly #isolated: boolean;

	// Mirrors the count in `#childrenWaitGroup`. Maintained in lockstep
	// with add()/done() calls in `launch`. Exposed only via
	// `cancelWithTimeout` to report the number of children still pending
	// past the shutdown deadline.
	#pendingChildren = 0;

	// Number of children that were force-detached by `cancelWithTimeout`.
	// Each of these will still call `#childrenWaitGroup.done()` when they
	// eventually finish; we intercept those calls and skip them so the
	// WaitGroup (now at count 0 after the forced drain) does not underflow.
	#detachedChildren = 0;

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

	[Symbol.dispose](): void {
		this.cancel();
	}

	cancel = (): void => {
		if (!this.isCancelled) {
			this.#cancelController.abort();
		}
	};

	cancelWithTimeout = async (
		ms: number,
	): Promise<{ timedOut: boolean; pendingChildren: number }> => {
		this.cancel();

		// Fast path: no children pending, nothing to wait for.
		if (this.#pendingChildren === 0) {
			return { timedOut: false, pendingChildren: 0 };
		}

		// If ms <= 0, do not wait beyond a single microtask. Report
		// current state and detach so `run` on this context is unblocked.
		if (ms <= 0) {
			const remaining = this.#pendingChildren;
			this.#detachPendingChildren();
			return { timedOut: true, pendingChildren: remaining };
		}

		// Race the WaitGroup drain against a hard deadline. Both sides
		// are turned into sentinel values so that neither an unhandled
		// rejection from the losing side nor a foreign channel error
		// can escape.
		const DEADLINE = Symbol('deadline');
		const DRAINED = Symbol('drained');
		using deadline = disposableDelay(ms);
		const drainPromise = this.#childrenWaitGroup.wait().then(
			() => DRAINED,
			// If wait rejects (should not happen here — no signal passed
			// — but defensively), treat as drained; the deadline path
			// will do the same accounting.
			() => DRAINED,
		);
		const deadlinePromise = deadline.then(
			() => DEADLINE,
			// If the deadline promise is disposed early (i.e. the drain
			// won and `using` disposed the delay), it rejects with
			// TaskCancellationError. We map that away so no unhandled
			// rejection leaks.
			() => DEADLINE,
		);

		const result = await Promise.race([drainPromise, deadlinePromise]);
		if (result === DRAINED) {
			return { timedOut: false, pendingChildren: 0 };
		}
		const remaining = this.#pendingChildren;
		this.#detachPendingChildren();
		return { timedOut: true, pendingChildren: remaining };
	};

	// Force the WaitGroup to consider all currently-pending children as
	// done, so that any parent `run` awaiting on this context's children
	// can proceed. The actual child work may still be running in the
	// background — we cannot forcibly terminate arbitrary async code —
	// but the context bookkeeping no longer blocks the shutdown path.
	//
	// Rather than calling `done(count)` on the WaitGroup directly (which
	// would cause the still-running children's eventual `done()` calls to
	// underflow), we record how many slots we are pre-paying and skip the
	// corresponding number of future `done()` calls in `launch`'s finally.
	#detachPendingChildren = (): void => {
		const count = this.#pendingChildren;
		if (count <= 0) return;
		this.#detachedChildren += count;
		this.#pendingChildren = 0;
		this.#childrenWaitGroup.done(count);
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
	): {
		context: TaskContextImpl;
		cleanup: DisposableCallback;
	} => {
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

		// If the parent is cancelled, cancel the child too.
		const unsubscribeParentCancel = this.onCancelled(childContext);

		// Cleanup must be idempotent: it may be triggered by either the child
		// completing normally (via `cleanup()` in launch's finally) or by the
		// child being cancelled (via its own onCancelled). Removing the child
		// from `#children` only when it is cancelled would leak entries on
		// normal completion.
		let cleanedUp = false;
		const cleanup = toDisposableCallback((): void => {
			if (cleanedUp) return;
			cleanedUp = true;
			unsubscribeParentCancel();
			this.#children.delete(childContext);
		});

		childContext.onCancelled(cleanup);

		return { context: childContext, cleanup };
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
			// Wait for any children launched in this context to complete before
			// returning. If the context is cancelled while waiting, we silently
			// stop waiting — the original error (or cancellation) is already
			// captured on the throw path and children have been notified.
			await waitIgnoringAbort(this.#childrenWaitGroup, this.cancelledSignal);
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
			const { context: childContext, cleanup: childCleanup } =
				this.#createChildContext(options);
			const unsubscribeCancel = cleanupOn(
				cancelChildController.signal,
				childContext,
			);
			// Ensure parent waits for child to complete. Registered here (rather
			// than inside the try) so it is guaranteed to be paired with a
			// matching done() in the finally, even if a synchronous throw occurs
			// before we enter the try body.
			this.#childrenWaitGroup.add();
			this.#pendingChildren++;
			let branchAcquired = false;
			let launchResult: LaunchResult<R>;

			try {
				// if max branching set, wait for permission to start
				if (this.#maxBranchSemaphore !== undefined) {
					try {
						await this.#maxBranchSemaphore.acquire(1, {
							signal: this.cancelledSignal,
						});
					} catch (error) {
						// Translate any abort from the semaphore into a
						// TaskCancellationError so foreign channel errors do
						// not leak out of the task API.
						if (this.isCancelled) {
							throw new TaskCancellationError();
						}
						throw error;
					}
					branchAcquired = true;
				}

				const { args = [] as unknown as A } = options;

				const result = await childContext.run(task, args);
				launchResult = { type: 'result', value: result };
			} catch (error) {
				if (!this.#isolated) {
					this.cancel();
				}
				launchResult = { type: 'error', error };
			} finally {
				unsubscribeCancel[Symbol.dispose]();
				// Cancel the child so its onCancelled observers fire and any
				// pending delays/waits inside it unwind.
				childContext.cancel();
				// Idempotent — safe even if the child was already cancelled by
				// a parent-cancel propagation. Removes the child from
				// this.#children and unregisters the parent-cancel listener.
				childCleanup();

				if (branchAcquired) {
					// release the max-branch slot
					this.#maxBranchSemaphore?.release();
				}
				// ensure parent stops waiting for child.
				// If this child was forcibly detached by `cancelWithTimeout`,
				// the WaitGroup was already credited on its behalf — skip the
				// `done()` to avoid underflowing the now-zero count. Otherwise
				// decrement normally.
				if (this.#detachedChildren > 0) {
					this.#detachedChildren--;
				} else {
					this.#childrenWaitGroup.done();
				}
				if (this.#pendingChildren > 0) this.#pendingChildren--;
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
			[Symbol.dispose](): void {
				result.cancel();
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
