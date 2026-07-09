import { describe, expect, it, vi } from 'bun:test';

import { Task, TaskCancellationError } from '@rimbu/task';
import { cancelContext, chain, delay, throwError } from '@rimbu/task/ops';

import { disposableDelay } from '#task/utils';

describe('Task exceptions', () => {
	it('run throws if context is cancelled', () => {
		expect(
			Task.launch(async (context) => {
				await context.run(cancelContext);
			}).join(),
		).rejects.toThrow(TaskCancellationError);
	});

	it('run throws if task throws exception', () => {
		expect(
			Task.launch(async (context) => {
				await context.run(throwError(() => new Error('Test')));
			}).join(),
		).rejects.toThrow('Test');
	});

	it('launch throws if its context is cancelled', () => {
		expect(Task.launch(cancelContext).join()).rejects.toThrow(
			TaskCancellationError,
		);
	});

	it('launch throws if task throws exception', () => {
		expect(
			Task.launch(throwError(() => new Error('Error 3'))).join(),
		).rejects.toThrow('Error 3');
	});

	it('normal context cancels children and itself on child cancel', async () => {
		// Wrap in an isolated outer context so the cancellation is contained
		await Task.launch(async (outerCtx) => {
			const job = outerCtx.launch(async (context) => {
				const job1 = context.launch(chain(delay(10), cancelContext));
				let job2Done = false;
				const job2 = context.launch(
					chain(delay(30), () => {
						job2Done = true;
					}),
				);

				expect(job1.join()).rejects.toThrow(TaskCancellationError);
				expect(job2Done).toBe(false);
				expect(job2.join()).rejects.toThrow(TaskCancellationError);
				await disposableDelay(50);
				expect(job2Done).toBe(false);
			});

			await expect(job.join()).rejects.toThrow(TaskCancellationError);
		}, { isolated: true }).join();
	});

	it('recover catches thrown errors', () => {
		const job = Task.launch(throwError(() => new Error('Error 5')));
		expect(
			job.join({
				recover: (e) => {
					expect(e).toBeInstanceOf(Error);
					expect((e as Error).message).toBe('Error 5');
					return 42;
				},
			}),
		).resolves.toBe(42);
	});

	it('recover returns value even if parent is canceled', async () => {
		await Task.launch(async (context) => {
			const job = context.launch(throwError(() => new Error('Error 6')));

			expect(
				job.join({
					recover: (e) => {
						expect(e).toBeInstanceOf(Error);
						expect((e as Error).message).toBe('Error 6');
						return 43;
					},
				}),
			).resolves.toBe(43);
			expect(context.isActive).toBe(false);
		}).join({ recover: () => {} });
	});

	it('recover catches cancellation errors', () => {
		const job = Task.launch(cancelContext);

		const fn = vi.fn().mockResolvedValue(42);

		expect(
			job.join({
				recover: fn,
			}),
		).resolves.toBe(42);
	});

	it('throws cancellation error if cancelled during delay', async () => {
		const job = Task.launch(async (context) => {
			setTimeout(() => context.cancel(), 10);
			await context.delay(50);
			return 42;
		}, { isolated: true });

		await expect(job.join()).rejects.toThrow(TaskCancellationError);
	});

	// Regression: previously, `run`'s finally block awaited the children
	// WaitGroup with the context's cancelled signal. If a child ignored
	// cancellation and the context was cancelled, the wait rejected with a
	// foreign `ChannelError.OperationAbortedError` from `@rimbu/channel`,
	// which replaced the user's original error via the finally-throw semantics.
	// The task API must never surface channel-package errors.
	it('run preserves user errors even when the context is cancelled with pending children', async () => {
		let capturedError: unknown;

		await Task.launch(
			async (outerCtx) => {
				capturedError = await outerCtx
					.launch(
						async (innerCtx) => {
							// Launch a grandchild that ignores cancellation.
							// It keeps the WaitGroup count above zero when
							// innerCtx's run enters its finally block.
							innerCtx.launch(async () => {
								await new Promise((r) => setTimeout(r, 100));
							});
							// Ensure the grandchild has been added to the
							// WaitGroup before we cancel.
							await new Promise((r) => setTimeout(r, 5));
							// Cancel own context so the wait's signal is aborted.
							innerCtx.cancel();
							// Throw a user error. The finally must not
							// replace this with a channel-abort error.
							throw new Error('user error');
						},
						// Isolate so the parent's cancel-propagation does not
						// interfere with what we are testing on innerCtx.
						{ isolated: true },
					)
					.join({ recover: (e) => e });
			},
			{ isolated: true },
		).join();

		// Assertions live outside the task body so a failure surfaces to the
		// test runner rather than being swallowed by the task's own error
		// handling.
		expect(capturedError).toBeInstanceOf(Error);
		expect((capturedError as Error).message).toBe('user error');
		expect(capturedError).not.toBeInstanceOf(TaskCancellationError);
		// A foreign `ChannelError.OperationAbortedError` would have its
		// constructor name set to "OperationAbortedError" — guard against
		// that class of leak.
		expect((capturedError as Error).constructor.name).toBe('Error');
	});

	// Regression: when a job is queued on the maxBranch semaphore and its
	// parent context is cancelled, the queued acquire rejects. Previously
	// this rejection was a `ChannelError.OperationAbortedError` from the
	// semaphore's abort signal; the task layer must translate this into
	// `TaskCancellationError` before surfacing to the caller.
	it('queued jobs cancelled via parent yield TaskCancellationError', async () => {
		let capturedError: unknown;

		await Task.launch(
			async (context) => {
				// job1 holds the single semaphore slot with a long delay.
				const job1 = context.launch(async (ctx) => {
					await ctx.delay(1000);
				});
				// job2 queues on the semaphore.
				const job2 = context.launch(async () => {
					// Body will not run — cancelled before acquire.
				});

				// Give job2 time to reach the semaphore acquire.
				await new Promise((r) => setTimeout(r, 5));
				context.cancel();

				capturedError = await job2.join({ recover: (e) => e });

				// Clean up job1 so the outer join does not hang.
				await job1.join({ recover: () => {} });
			},
			{ isolated: true, maxBranch: 1 },
		).join({ recover: () => {} });

		// Assertions live outside the task body so a failure surfaces to the
		// test runner rather than being swallowed by the outer `recover`.
		expect(capturedError).toBeInstanceOf(TaskCancellationError);
		expect((capturedError as Error).constructor.name).toBe(
			'TaskCancellationError',
		);
	});
});
