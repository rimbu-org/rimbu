import { afterEach, describe, expect, it } from 'bun:test';

import {
	Task,
	TaskCancellationError,
	TaskRetryExhaustedError,
	TaskTimeoutError,
} from '@rimbu/task';
import { cancelContext, delay } from '@rimbu/task/ops';

import { disposableDelay } from '#task/utils';

describe('Task.Context', () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('correctly maintains context values and parent child relation for launch', async () => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
		expect([...Task.rootContext.children]).toEqual([]);

		await Task.launch(async (context) => {
			expect(context.parent).toBe(Task.rootContext);
			expect(context.hasChildren).toBe(false);
			expect(context.isCancelled).toBe(false);
			expect([...context.children]).toEqual([]);

			expect(Task.rootContext.hasChildren).toBe(true);
			expect(Task.rootContext.isCancelled).toBe(false);
			expect([...Task.rootContext.children]).toEqual([context]);
		}).join();

		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
		expect([...Task.rootContext.children]).toEqual([]);
	});

	it('rootContext.parent is undefined', () => {
		expect(Task.rootContext.parent).toBeUndefined();
	});

	it('cancelledSignal is not aborted initially, becomes aborted after cancel', async () => {
		await Task.launch(async (context) => {
			expect(context.cancelledSignal.aborted).toBe(false);
			context.cancel();
			expect(context.cancelledSignal.aborted).toBe(true);
		}).join({ recover: () => {} });
	});

	it('cancelledSignal fires abort event on cancel', async () => {
		await Task.launch(async (context) => {
			let fired = false;
			context.cancelledSignal.addEventListener('abort', () => {
				fired = true;
			});
			context.cancel();
			expect(fired).toBe(true);
		}).join({ recover: () => {} });
	});

	it('throwIfCancelled does not throw on an active context', async () => {
		await Task.launch(async (context) => {
			expect(() => context.throwIfCancelled()).not.toThrow();
		}).join();
	});

	it('throwIfCancelled throws TaskCancellationError on a cancelled context', async () => {
		await Task.launch(async (context) => {
			context.cancel();
			expect(() => context.throwIfCancelled()).toThrow(TaskCancellationError);
		}).join({ recover: () => {} });
	});

	it('run on an already-cancelled context throws without executing the task', async () => {
		let executed = false;
		await Task.launch(async (context) => {
			context.cancel();
			await context.run(() => {
				executed = true;
			});
		}).join({ recover: () => {} });
		expect(executed).toBe(false);
	});

	it('onCancelled registers a cleanup that fires on cancel', async () => {
		let cleanupCalled = false;
		await Task.launch(async (context) => {
			context.onCancelled(() => {
				cleanupCalled = true;
			});
			context.cancel();
		}).join({ recover: () => {} });
		expect(cleanupCalled).toBe(true);
	});

	it('onCancelled — disposing the returned handle prevents the cleanup from firing', async () => {
		let cleanupCalled = false;
		await Task.launch(async (context) => {
			const unsubscribe = context.onCancelled(() => {
				cleanupCalled = true;
			});
			unsubscribe[Symbol.dispose]();
			context.cancel();
		}).join({ recover: () => {} });
		expect(cleanupCalled).toBe(false);
	});

	it('onCancelled fires immediately when context is already cancelled', async () => {
		let cleanupCalled = false;
		await Task.launch(async (context) => {
			context.cancel();
			context.onCancelled(() => {
				cleanupCalled = true;
			});
		}).join({ recover: () => {} });
		expect(cleanupCalled).toBe(true);
	});

	it('yield() completes without error on an active context', async () => {
		await Task.launch(async (context) => {
			expect(context.yield()).resolves.toBeUndefined();
		}).join();
	});

	it('yield() throws TaskCancellationError when context is already cancelled', async () => {
		await Task.launch(async (context) => {
			context.cancel();
			expect(context.yield()).rejects.toThrow(TaskCancellationError);
		}).join({ recover: () => {} });
	});

	it('yield() releases the event loop (a queued microtask runs between yield calls)', async () => {
		const order: number[] = [];
		await Task.launch(async (context) => {
			Promise.resolve().then(() => order.push(2));
			order.push(1);
			await context.yield();
			order.push(3);
		}).join();
		expect(order).toEqual([1, 2, 3]);
	});

	it('isolated child error does not cancel the parent context', async () => {
		let parentStillActive = false;
		await Task.launch(
			async (context) => {
				const child = context.launch(
					async () => {
						throw new Error('child failure');
					},
					{ isolated: true },
				);
				await child.join({ recover: () => {} });
				parentStillActive = context.isActive;
			},
			{ isolated: true },
		).join();
		expect(parentStillActive).toBe(true);
	});

	it('non-isolated context cancels itself when a child fails', async () => {
		// A context that is NOT isolated will cancel itself if a child throws.
		// We verify by checking the context's isCancelled state after a failing child.
		let contextCancelledAfterChildError = false;
		await Task.launch(
			async (outerCtx) => {
				// Launch a non-isolated inner context (default: isolated = false)
				const job = outerCtx.launch(async (context) => {
					// context.#isolated = false (default)
					context.launch(async () => {
						throw new Error('child failure');
					});
					await disposableDelay(20);
					contextCancelledAfterChildError = context.isCancelled;
				});
				await job.join({ recover: () => {} });
			},
			{ isolated: true },
		).join();
		expect(contextCancelledAfterChildError).toBe(true);
	});

	it('cancel() on an already-cancelled context is idempotent', async () => {
		await Task.launch(async (context) => {
			context.cancel();
			expect(() => context.cancel()).not.toThrow();
			expect(context.isCancelled).toBe(true);
		}).join({ recover: () => {} });
	});

	it('context launched with a custom id uses that id', async () => {
		await Task.launch(
			async (context) => {
				const child = context.launch(
					async (ctx) => {
						expect(ctx.id).toBe('my-custom-id');
					},
					{ id: 'my-custom-id' },
				);
				await child.join();
			},
			{ isolated: true },
		).join();
	});

	it('cancelling parent cancels child and grandchild transitively', async () => {
		const cancelled: string[] = [];
		await Task.launch(
			async (context) => {
				await context
					.launch(async (child) => {
						child.onCancelled(() => cancelled.push('child'));
						await child
							.launch(async (grandchild) => {
								grandchild.onCancelled(() => cancelled.push('grandchild'));
								await grandchild.delay(1000);
							})
							.join({ recover: () => {} });
					})
					.join({ recover: () => {} });

				context.cancel();
			},
			{ isolated: true },
		).join({ recover: () => {} });

		expect(cancelled).toContain('child');
		expect(cancelled).toContain('grandchild');
	});
});

describe('Task.Job', () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('join() can be called multiple times and always returns the same result', async () => {
		const job = Task.launch(() => 42);
		const [r1, r2, r3] = await Promise.all([
			job.join(),
			job.join(),
			job.join(),
		]);
		expect(r1).toBe(42);
		expect(r2).toBe(42);
		expect(r3).toBe(42);
	});

	it('join({ timeoutMs }) throws when job takes too long', async () => {
		await Task.launch(
			async (context) => {
				const job = context.launch(delay(500));
				const err = await job.join({ timeoutMs: 30, recover: (e) => e });
				expect(err).toBeInstanceOf(Error);
				await job.cancelAndJoin();
			},
			{ isolated: true },
		).join();
	});

	it('join({ timeoutMs, recover }) recovers from timeout', async () => {
		await Task.launch(
			async (context) => {
				const job = context.launch(delay(500));
				const result = await job.join({
					timeoutMs: 30,
					recover: () => 'recovered',
				});
				expect(result).toBe('recovered');
				await job.cancelAndJoin();
			},
			{ isolated: true },
		).join();
	});

	it('cancel() on a completed job is safe', async () => {
		await Task.launch(
			async (context) => {
				const job = context.launch(() => 42);
				await job.join();
				expect(() => job.cancel()).not.toThrow();
			},
			{ isolated: true },
		).join();
	});

	it('cancelAndJoin() when task throws non-cancellation error re-throws', async () => {
		await Task.launch(
			async (context) => {
				const job = context.launch(async (ctx) => {
					// Task completes before cancel fires
					throw new Error('boom');
				});
				// Wait for the job to finish, then cancelAndJoin should re-throw
				await disposableDelay(20);
				const err = await job.cancelAndJoin().then(
					() => null,
					(e) => e,
				);
				expect(err?.message).toBe('boom');
			},
			{ isolated: true },
		).join();
	});

	it('Symbol.dispose on Job cancels it', async () => {
		await Task.launch(
			async (context) => {
				let wasCancelled = false;
				const job = context.launch(async (ctx) => {
					ctx.onCancelled(() => {
						wasCancelled = true;
					});
					await ctx.delay(1000);
				});
				await disposableDelay(10);
				job[Symbol.dispose]();
				await job.join({ recover: () => {} });
				expect(wasCancelled).toBe(true);
			},
			{ isolated: true },
		).join();
	});

	it('cancel() does not cancel the parent context', async () => {
		let parentActive = false;
		await Task.launch(
			async (context) => {
				const child = context.launch(delay(1000), { isolated: true });
				await disposableDelay(10);
				child.cancel();
				await child.join({ recover: () => {} });
				parentActive = context.isActive;
			},
			{ isolated: true },
		).join();
		expect(parentActive).toBe(true);
	});
});

describe('Error classes', () => {
	it('TaskCancellationError has correct name and message', () => {
		const e = new TaskCancellationError();
		expect(e.name).toBe('TaskCancellationError');
		expect(e.message).toBe('Task was cancelled');
		expect(e).toBeInstanceOf(Error);
	});

	it('TaskTimeoutError has correct name and message', () => {
		const e = new TaskTimeoutError();
		expect(e.name).toBe('TaskTimeoutError');
		expect(e.message).toBe('Task timed out');
		expect(e).toBeInstanceOf(Error);
	});

	it('TaskRetryExhaustedError has correct name and message', () => {
		const e = new TaskRetryExhaustedError();
		expect(e.name).toBe('TaskRetryExhaustedError');
		expect(e.message).toBe('Task retry exhausted');
		expect(e).toBeInstanceOf(Error);
	});

	it('error classes are distinct', () => {
		const cancellation = new TaskCancellationError();
		expect(cancellation).not.toBeInstanceOf(TaskTimeoutError);
	});

	it('cancelContext results in TaskCancellationError, not TaskTimeoutError or other', async () => {
		const err = await Task.launch(cancelContext).join({ recover: (e) => e });
		expect(err).toBeInstanceOf(TaskCancellationError);
	});
});

describe('Task.Context.cancelWithTimeout', () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('returns { timedOut: false, pendingChildren: 0 } when no children are pending', async () => {
		await Task.launch(
			async (context) => {
				const result = await context.cancelWithTimeout(100);
				expect(result).toEqual({ timedOut: false, pendingChildren: 0 });
				expect(context.isCancelled).toBe(true);
			},
			{ isolated: true },
		).join({ recover: () => {} });
	});

	it('drains cooperative children within the deadline', async () => {
		await Task.launch(
			async (context) => {
				// Launch two children that respect cancellation via context.delay.
				const job1 = context.launch(async (ctx) => {
					await ctx.delay(1000);
				});
				const job2 = context.launch(async (ctx) => {
					await ctx.delay(1000);
				});

				// Give both children a chance to start.
				await disposableDelay(5);

				const result = await context.cancelWithTimeout(100);
				expect(result.timedOut).toBe(false);
				expect(result.pendingChildren).toBe(0);
				expect(context.hasChildren).toBe(false);

				// Both jobs should have terminated with TaskCancellationError.
				const err1 = await job1.join({ recover: (e) => e });
				const err2 = await job2.join({ recover: (e) => e });
				expect(err1).toBeInstanceOf(TaskCancellationError);
				expect(err2).toBeInstanceOf(TaskCancellationError);
			},
			{ isolated: true },
		).join({ recover: () => {} });
	});

	it('reports timedOut with pending count when a child ignores cancellation', async () => {
		// This test uses raw setTimeout inside a child so the child does not
		// react to context cancellation. The context's shutdown must still
		// complete within the deadline.
		const started = performance.now();
		const runawayStartTicks: number[] = [];

		await Task.launch(
			async (context) => {
				// Runaway child: does not observe cancellation.
				context.launch(async () => {
					runawayStartTicks.push(performance.now());
					await new Promise((r) => setTimeout(r, 200));
				});
				// Cooperative child that will unwind promptly on cancel.
				context.launch(async (ctx) => {
					await ctx.delay(1000);
				});

				// Ensure both jobs have started.
				await disposableDelay(10);

				const result = await context.cancelWithTimeout(30);
				expect(result.timedOut).toBe(true);
				// The cooperative child should have completed within 30ms of
				// cancellation; the runaway child should still be pending.
				expect(result.pendingChildren).toBe(1);
			},
			{ isolated: true },
		).join({ recover: () => {} });

		// The cancelWithTimeout call should have returned close to 30ms
		// after being invoked — well before the runaway child's 200ms
		// completes. A generous upper bound accounts for scheduling.
		const elapsed = performance.now() - started;
		expect(elapsed).toBeLessThan(150);
		// Sanity: the runaway did start.
		expect(runawayStartTicks).toHaveLength(1);
	});

	it('ms <= 0 does not wait and reports current pending count', async () => {
		await Task.launch(
			async (context) => {
				context.launch(async () => {
					await new Promise((r) => setTimeout(r, 100));
				});
				context.launch(async () => {
					await new Promise((r) => setTimeout(r, 100));
				});
				// Let both launches register (their `#childrenWaitGroup.add()`
				// happens synchronously at the top of the launch IIFE, but
				// the IIFE runs after the current synchronous frame).
				await disposableDelay(5);

				const result = await context.cancelWithTimeout(0);
				expect(result.timedOut).toBe(true);
				expect(result.pendingChildren).toBe(2);
			},
			{ isolated: true },
		).join({ recover: () => {} });
	});

	it('late completion of a detached child does not underflow bookkeeping', async () => {
		// After cancelWithTimeout has detached a pending child, the child
		// may still complete later. Its `done()` on the WaitGroup and
		// decrement of our internal counter must remain safe (no throw,
		// no negative count).
		await Task.launch(
			async (context) => {
				context.launch(async () => {
					// Sleep past the shutdown deadline, then finish.
					await new Promise((r) => setTimeout(r, 40));
				});
				await disposableDelay(5);

				const result = await context.cancelWithTimeout(10);
				expect(result.timedOut).toBe(true);
				expect(result.pendingChildren).toBe(1);

				// Wait for the runaway to actually complete. This should not
				// throw or cause any observable underflow.
				await disposableDelay(60);
				// A fresh cancelWithTimeout should see zero pending children
				// now — the late completion decremented but was floored at zero.
				const result2 = await context.cancelWithTimeout(10);
				expect(result2).toEqual({ timedOut: false, pendingChildren: 0 });
			},
			{ isolated: true },
		).join({ recover: () => {} });
	});

	it('unblocks a parent run() call that would otherwise wait for a runaway child', async () => {
		// Regression scenario documented in the AGENTS notes: a child that
		// ignores cancellation causes `run` to hang. `cancelWithTimeout`
		// gives the parent an escape hatch.
		const started = performance.now();

		await Task.launch(
			async (outerCtx) => {
				await outerCtx
					.launch(
						async (innerCtx) => {
							// Runaway child.
							innerCtx.launch(async () => {
								await new Promise((r) => setTimeout(r, 300));
							});
							await disposableDelay(5);
							// Cancel with a tight deadline.
							const result = await innerCtx.cancelWithTimeout(20);
							expect(result.timedOut).toBe(true);
							expect(result.pendingChildren).toBe(1);
							// Returning here should not hang despite the
							// runaway child still executing.
						},
						{ isolated: true },
					)
					.join({ recover: () => {} });
			},
			{ isolated: true },
		).join({ recover: () => {} });

		const elapsed = performance.now() - started;
		// If cancelWithTimeout did not unblock run(), this would take at
		// least 300ms (the runaway's setTimeout). It should be < 100ms.
		expect(elapsed).toBeLessThan(150);
	});
});
