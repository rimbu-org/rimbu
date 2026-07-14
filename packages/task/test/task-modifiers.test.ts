import { afterEach, describe, expect, it, vi } from 'bun:test';

import {
	Task,
	TaskCancellationError,
	TaskRetryExhaustedError,
	TaskTimeoutError,
} from '@rimbu/task';
import {
	catchAll,
	catchError,
	chain,
	combined,
	delay,
	mapOutput,
	mapOutputArr,
	repeat,
	repeatWithIndex,
	retryWhen,
	throwError,
	withArgs,
	withRetry,
	withTimeout,
} from '@rimbu/task/ops';

import { disposableDelay } from '#task/task-utils';

describe(withRetry.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should not retry if the task succeeds', async () => {
		let attempts = 0;
		const task = withRetry(3, { delays: [100, 200] })(() => {
			attempts++;
			return 'Success';
		});

		const result = await Task.launch(task).join();
		expect(result).toBe('Success');
		expect(attempts).toBe(1);
	});

	it('should retry the task the specified number of times', () => {
		let attempts = 0;
		const task = withRetry(3, { delays: [10, 20] })(() => {
			attempts++;
			throw new Error('Test error');
		});

		expect(Task.launch(task).join()).rejects.toThrow(Error);
		expect(attempts).toBe(3);
	});

	it('should return the result of the last attempt if it succeeds', () => {
		let attempts = 0;
		const task = withRetry(3, { delays: [10, 20] })(() => {
			attempts++;
			if (attempts < 3) {
				throw new Error('Test error');
			}
			return 'Final success';
		});

		expect(Task.launch(task).join()).resolves.toBe('Final success');
		expect(attempts).toBe(3);
	});

	it('should throw immediately on CancellationError', () => {
		let attempts = 0;
		const task = withRetry(3, { delays: [10, 20] })(() => {
			attempts++;
			if (attempts === 1) {
				throw new TaskCancellationError();
			}
			throw Error('failed');
		});

		expect(Task.launch(task).join()).rejects.toThrow(TaskCancellationError);
		expect(attempts).toBe(1);
	});

	it('should throw last error if times is 0', () => {
		const task = withRetry(0)(() => {
			throw new Error('Test error');
		});

		expect(Task.launch(task).join()).rejects.toThrow(Error);
	});

	it('should call onRetry for each failed attempt', async () => {
		const retries: Array<{ error: unknown; attempt: number }> = [];
		let attempts = 0;

		const task = withRetry(3, {
			delays: [10],
			onRetry: (error, attempt) => retries.push({ error, attempt }),
		})(() => {
			attempts++;
			throw new Error('fail');
		});

		await Task.launch(task).join({ recover: () => {} });

		expect(attempts).toBe(3);
		expect(retries).toHaveLength(2);
		expect(retries[0].attempt).toBe(0);
		expect(retries[1].attempt).toBe(1);
	});
});

describe(retryWhen.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('stops retrying when control fn returns false', () => {
		let attempts = 0;
		const task = retryWhen((_, attempt) => (attempt < 2 ? 0 : false))(() => {
			attempts++;
			throw new Error('fail');
		});

		expect(Task.launch(task).join()).rejects.toThrow(Error);
		expect(attempts).toBe(3); // 0, 1, 2 — stops at attempt 2
	});

	it('succeeds when task eventually resolves', async () => {
		let attempts = 0;
		const task = retryWhen(() => 0)(() => {
			attempts++;
			if (attempts < 3) throw new Error('not yet');
			return 'done';
		});

		expect(await Task.launch(task).join()).toBe('done');
		expect(attempts).toBe(3);
	});

	it('stops immediately on CancellationError', () => {
		let attempts = 0;
		const task = retryWhen(() => 0)(() => {
			attempts++;
			throw new TaskCancellationError();
		});

		expect(Task.launch(task).join()).rejects.toThrow(TaskCancellationError);
		expect(attempts).toBe(1);
	});
});

describe(withTimeout.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should complete before timeout', async () => {
		const task = withTimeout(100)(() => 'Completed');

		expect(Task.launch(task).join()).resolves.toBe('Completed');
	});

	it('should throw TimeoutError if task does not complete in time', () => {
		const task = withTimeout(50)(delay(100));

		expect(Task.launch(task).join()).rejects.toThrow(TaskTimeoutError);
	});

	it('should cancel the task if timeout occurs', () => {
		const task = withTimeout(50)(
			() => new Promise((resolve) => setTimeout(resolve, 100)),
		);

		const job = Task.launch(task);
		job.cancel();

		expect(job.join()).rejects.toThrow(TaskCancellationError);
	});
});

describe(withArgs.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should run task with provided arguments', () => {
		const task = Task.fn((_, x: number, y: number) => x + y);

		const taskWithArgs = withArgs(task, 2, 3);

		const defer = Task.launch(taskWithArgs);
		expect(defer.join()).resolves.toBe(5);
	});
});

describe(mapOutput.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should map output of task', () => {
		const task = Task.fn((_, x: number) => x * 2);

		const job = Task.launch(
			chain(
				task,
				mapOutput((x: number) => x + 1),
			),
			{
				args: [3],
			},
		);
		expect(job.join()).resolves.toBe(7);
	});
});

describe(mapOutputArr.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should map output of task with array input', () => {
		const task = Task.fn(
			(_, x: number, y: number) => [x, y] as [number, number],
		);

		const job = Task.launch(
			chain(
				task,
				mapOutputArr((x: number, y: number) => x + y),
			),
			{ args: [3, 4] },
		);
		expect(job.join()).resolves.toBe(7);
	});
});

describe(repeat.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should repeat task specified number of times', async () => {
		let count = 0;
		const task = repeat(5)(() => {
			count++;
		});
		await Task.launch(task).join();
		expect(count).toBe(5);
	});

	it('should pass through original arguments', async () => {
		const results: string[] = [];
		const task = repeat(3)((_ctx, msg: string) => {
			results.push(msg);
		});
		await Task.launch(task, { args: ['Hello'] }).join();
		expect(results).toEqual(['Hello', 'Hello', 'Hello']);
	});
});

describe(repeatWithIndex.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('receives the current index via the factory', async () => {
		const indices: number[] = [];
		const task = repeatWithIndex(3, (i) => () => {
			indices.push(i);
		});
		await Task.launch(task).join();
		expect(indices).toEqual([0, 1, 2]);
	});
});

describe(combined.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('returns the given task when no modifiers are applied', () => {
		const task = Task.fn((_, x: number) => x * 2);
		const promise = Task.launch(combined()(task), { args: [3] }).join();
		expect(promise).resolves.toBe(6);
	});

	it('applies a single modifier correctly', () => {
		const task = Task.fn((_, x: number) => x * 2);
		const promise = Task.launch(combined(withTimeout(10))(task), {
			args: [3],
		}).join();
		expect(promise).resolves.toBe(6);
	});

	it('applies multiple modifiers in sequence', () => {
		let attempts = 0;
		const task = Task.fn((_, x: number) => {
			attempts++;
			if (attempts < 2) {
				throw new Error('Test error');
			}
			return x * 2;
		});

		const modifiedTask = combined(
			withTimeout(100),
			withRetry(3, { delays: [10] }),
		)(task);
		const promise = Task.launch(modifiedTask, { args: [3] }).join();
		expect(promise).resolves.toBe(6);
		expect(attempts).toBe(2);
	});
});

describe(catchError.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should catch and handle errors thrown by the task', () => {
		const task = Task.fn(() => {
			throw new Error('Test error');
		});

		const errorHandler = (error: any) => {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe('Test error');
			return Task.fn(() => 'Recovered from error');
		};

		const modifiedTask = catchError(errorHandler)(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBe('Recovered from error');
	});

	it('should re-throw the error if the handler returns undefined', () => {
		const task = Task.fn(() => {
			throw new Error('Test error');
		});

		const errorHandler = (error: any) => {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe('Test error');
			return undefined;
		};

		const modifiedTask = catchError(errorHandler)(task);

		expect(Task.launch(modifiedTask).join()).rejects.toThrow('Test error');
	});

	it('should not catch TaskCancellationError', () => {
		const task = Task.fn(() => {
			throw new TaskCancellationError();
		});

		const errorHandler = vi.fn();

		const modifiedTask = catchError(errorHandler)(task);

		expect(Task.launch(modifiedTask).join()).rejects.toThrow(
			TaskCancellationError,
		);
		expect(errorHandler).not.toHaveBeenCalled();
	});

	it('passes the task result through if no error occurs', () => {
		expect(
			Task.launch(catchError(() => () => 1)(() => 'Success')).join(),
		).resolves.toBe('Success');
	});

	it('catches errors from the task and returns a default task', () => {
		expect(
			Task.launch(
				catchError((err) => {
					expect(err.message).toBe('Test error');
					return () => 'Default value';
				})(throwError(() => new Error('Test error'))),
			).join(),
		).resolves.toBe('Default value');
	});

	it('returns the original error if no default task is provided', () => {
		expect(
			Task.launch(
				catchError((err) => {
					expect(err.message).toBe('Test error');
					return undefined;
				})(throwError(() => new Error('Test error'))),
			).join(),
		).rejects.toThrow('Test error');
	});

	it('does not catch if the context is cancelled', () => {
		expect(
			Task.launch(
				chain(
					(context) => {
						context.cancel();
					},
					catchError(() => () => 1)(throwError(() => new Error('Test error'))),
				),
			).join(),
		).rejects.toThrow(TaskCancellationError);
	});
});

describe(catchAll.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should catch and handle errors thrown by the task with a provided task', () => {
		const task = Task.fn(() => {
			throw new Error('Test error');
		});

		const recoveryTask = Task.fn(() => 'Recovered from error');

		const modifiedTask = catchAll(recoveryTask)(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBe('Recovered from error');
	});

	it('should return undefined if no recovery task is provided', () => {
		const task = Task.fn(() => {
			throw new Error('Test error');
		});

		const modifiedTask = catchAll()(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBeUndefined();
	});

	it('should not catch TaskCancellationError', () => {
		const task = Task.fn(() => {
			throw new TaskCancellationError();
		});

		const recoveryTask = vi.fn();

		const modifiedTask = catchAll(recoveryTask)(task);

		expect(Task.launch(modifiedTask).join()).rejects.toThrow(
			TaskCancellationError,
		);
		expect(recoveryTask).not.toHaveBeenCalled();
	});
});

describe(TaskRetryExhaustedError.name, () => {
	it('is exported from @rimbu/task', () => {
		expect(new TaskRetryExhaustedError()).toBeInstanceOf(Error);
	});
});

// --- Additional edge-case tests ---

describe(`${retryWhen.name} — positive delay between retries`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('waits the returned number of ms before retrying', async () => {
		const timestamps: number[] = [];
		let attempts = 0;

		const task = retryWhen((_, attempt) => (attempt < 2 ? 50 : false))(
			Task.fn(() => {
				timestamps.push(Date.now());
				attempts++;
				throw new Error('fail');
			}),
		);

		await Task.launch(task).join({ recover: () => {} });

		expect(attempts).toBe(3);
		// Each retry should be at least 50ms after the previous attempt
		expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(40);
		expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(40);
	});

	it('cancellation during inter-retry delay aborts the retry loop', async () => {
		let attempts = 0;

		const task = retryWhen(() => 500)(
			Task.fn(async () => {
				attempts++;
				throw new Error('fail');
			}),
		);

		await Task.launch(
			async (context) => {
				const job = context.launch(task);
				await disposableDelay(50);
				job.cancel();
				await job.join({ recover: () => {} });
				expect(attempts).toBe(1);
			},
			{ isolated: true },
		).join();
	});
});

describe(`${withRetry.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('reuses the last delay value when retries exceed the delays array length', async () => {
		const timestamps: number[] = [];

		const task = withRetry(4, { delays: [10] })(
			Task.fn(() => {
				timestamps.push(Date.now());
				throw new Error('fail');
			}),
		);

		await Task.launch(task).join({ recover: () => {} });

		expect(timestamps).toHaveLength(4);
		// All three inter-retry gaps should use the single delay value (10ms)
		for (let i = 1; i < timestamps.length; i++) {
			expect(timestamps[i] - timestamps[i - 1]).toBeGreaterThanOrEqual(5);
		}
	});

	it('cancellation during an inter-retry delay propagates as TaskCancellationError', async () => {
		let attempts = 0;

		const task = withRetry(10, { delays: [500] })(
			Task.fn(async () => {
				attempts++;
				throw new Error('fail');
			}),
		);

		await Task.launch(
			async (context) => {
				const job = context.launch(task);
				await disposableDelay(50);
				job.cancel();
				await job.join({ recover: () => {} });
				expect(attempts).toBe(1);
			},
			{ isolated: true },
		).join();
	});

	it('withRetry(1) executes exactly once and re-throws on failure', async () => {
		let attempts = 0;
		const task = withRetry(1)(
			Task.fn(() => {
				attempts++;
				throw new Error('single attempt');
			}),
		);
		const err = await Task.launch(async (context) => context.run(task), {
			isolated: true,
		}).join({ recover: (e) => e });
		expect((err as Error).message).toBe('single attempt');
		expect(attempts).toBe(1);
	});
});

describe(`${repeat.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('repeat(0) never executes the task', async () => {
		let count = 0;
		await Task.launch(
			repeat(0)(() => {
				count++;
			}),
		).join();
		expect(count).toBe(0);
	});

	it('repeat(1) executes exactly once', async () => {
		let count = 0;
		await Task.launch(
			repeat(1)(() => {
				count++;
			}),
		).join();
		expect(count).toBe(1);
	});

	it('cancellation mid-loop stops iteration immediately', async () => {
		const executed: number[] = [];
		let iteration = 0;

		const task = repeat(10)(
			Task.fn(async (context) => {
				const i = iteration++;
				executed.push(i);
				if (i === 2) context.cancel();
			}),
		);

		await Task.launch(async (context) => context.run(task), {
			isolated: true,
		}).join({ recover: () => {} });

		// Should stop at iteration 2 (inclusive)
		expect(executed.length).toBeLessThan(10);
		expect(executed).toContain(2);
	});

	it('task throwing propagates the error immediately', async () => {
		let count = 0;
		const task = repeat(5)(
			Task.fn(() => {
				count++;
				if (count === 3) throw new Error('stop');
			}),
		);
		const err = await Task.launch(task, { isolated: true }).join({
			recover: (e) => e,
		});
		expect((err as Error).message).toBe('stop');
		expect(count).toBe(3);
	});
});

describe(`${repeatWithIndex.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('repeatWithIndex(0, factory) never calls the factory', async () => {
		let called = false;
		await Task.launch(
			repeatWithIndex(0, () => {
				called = true;
				return () => {};
			}),
		).join();
		expect(called).toBe(false);
	});

	it('factory throwing propagates the error', async () => {
		const task = repeatWithIndex(3, (i) =>
			Task.fn(() => {
				if (i === 1) throw new Error('factory error');
			}),
		);
		const err = await Task.launch(task, { isolated: true }).join({
			recover: (e) => e,
		});
		expect((err as Error).message).toBe('factory error');
	});
});

describe(`${combined.name} — modifier order`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('applies modifiers left-to-right (outer wraps inner)', async () => {
		const order: string[] = [];

		const modA = Task.modifier(
			<R, A extends readonly any[]>(task: Task<R, A>): Task<R, A> =>
				async (ctx, ...args) => {
					order.push('A-before');
					const r = await ctx.run(task, args);
					order.push('A-after');
					return r;
				},
		);
		const modB = Task.modifier(
			<R, A extends readonly any[]>(task: Task<R, A>): Task<R, A> =>
				async (ctx, ...args) => {
					order.push('B-before');
					const r = await ctx.run(task, args);
					order.push('B-after');
					return r;
				},
		);

		const base = Task.fn(() => {
			order.push('base');
		});

		await Task.launch(combined(modA, modB)(base)).join();
		// combined(A, B) means A wraps B(base): A → B → base → B → A
		expect(order).toEqual([
			'A-before',
			'B-before',
			'base',
			'B-after',
			'A-after',
		]);
	});
});
