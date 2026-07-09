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
});
