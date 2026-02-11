import { afterEach, describe, expect, it, vi } from 'bun:test';

import { Task } from '@rimbu/task';
import {
	CancellationError,
	RetryExhaustedError,
	TimeoutError,
} from '@rimbu/task/errors';
import {
	catchAll,
	catchError,
	combined,
	mapOutput,
	mapOutputArr,
	repeat,
	withArgs,
	withRetry,
	withTimeout,
} from '@rimbu/task/modifiers';
import { chain, delay, throwError } from '@rimbu/task/ops';

describe(withRetry.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should not retry if the task succeeds', async () => {
		let attempts = 0;
		const task = withRetry(
			3,
			[100, 200],
		)(() => {
			attempts++;
			return 'Success';
		});

		const result = await Task.launch(task).join();
		expect(result).toBe('Success');
		expect(attempts).toBe(1);
	});

	it('should retry the task the specified number of times', () => {
		let attempts = 0;
		const task = withRetry(
			3,
			[10, 20],
		)(() => {
			attempts++;
			throw new Error('Test error');
		});

		expect(Task.launch(task).join()).rejects.toThrow(RetryExhaustedError);
		expect(attempts).toBe(3);
	});

	it('should return the result of the last attempt if it succeeds', () => {
		let attempts = 0;
		const task = withRetry(
			3,
			[10, 20],
		)(() => {
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
		const task = withRetry(
			3,
			[10, 20],
		)(() => {
			attempts++;
			if (attempts === 1) {
				throw new CancellationError();
			}
			throw Error('failed');
		});

		expect(Task.launch(task).join()).rejects.toThrow(CancellationError);
		expect(attempts).toBe(1);
	});

	it('should throw RetryExhaustedError if times is set to 0', () => {
		const task = withRetry(0)(() => {
			throw new Error('Test error');
		});

		expect(Task.launch(task).join()).rejects.toThrow(RetryExhaustedError);
	});
});

describe(withTimeout.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should complete before timeout', () => {
		const task = withTimeout(100)(() => 'Completed');

		expect(Task.launch(task).join()).resolves.toBe('Completed');
	});

	it('should throw TimeoutError if task does not complete in time', () => {
		const task = withTimeout(50)(delay(100));

		expect(Task.launch(task).join()).rejects.toThrow(TimeoutError);
	});

	it('should cancel the task if timeout occurs', () => {
		const task = withTimeout(50)(
			() => new Promise((resolve) => setTimeout(resolve, 100)),
		);

		const job = Task.launch(task);
		job.cancel();

		expect(job.join()).rejects.toThrow(CancellationError);
	});
});

describe(withArgs.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should run task with provided arguments', () => {
		const task = Task.create((_, x: number, y: number) => x + y);

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
		const task = Task.create((_, x: number) => x * 2);

		const job = Task.launch(chain([task, mapOutput((x: number) => x + 1)]), {
			args: [3],
		});
		expect(job.join()).resolves.toBe(7);
	});
});

describe(mapOutputArr.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should map output of task with array input', () => {
		const task = Task.create(
			(_, x: number, y: number) => [x, y] as [number, number],
		);

		const job = Task.launch(
			chain([task, mapOutputArr((x: number, y: number) => x + y)]),
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

	it('receives the current index as an argument', async () => {
		const indices: number[] = [];
		const task = repeat(3)((_, index: number) => {
			indices.push(index);
		});
		await Task.launch(task).join();
		expect(indices).toEqual([0, 1, 2]);
	});

	it('should pass through original arguments', async () => {
		const results: string[] = [];
		const task = repeat(3)((_, msg: string, index: number) => {
			results.push(`${index}: ${msg}`);
		});
		await Task.launch(task, { args: ['Hello'] }).join();
		expect(results).toEqual(['0: Hello', '1: Hello', '2: Hello']);
	});
});

describe(combined.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('returns the given task when no modifiers are applied', () => {
		const task = Task.create((_, x: number) => x * 2);
		const promise = Task.launch(combined()(task), { args: [3] }).join();
		expect(promise).resolves.toBe(6);
	});

	it('applies a single modifier correctly', () => {
		const task = Task.create((_, x: number) => x * 2);
		const promise = Task.launch(combined(withTimeout(10))(task), {
			args: [3],
		}).join();
		expect(promise).resolves.toBe(6);
	});

	it('applies multiple modifiers in sequence', () => {
		let attempts = 0;
		const task = Task.create((_, x: number) => {
			attempts++;
			if (attempts < 2) {
				throw new Error('Test error');
			}
			return x * 2;
		});

		const modifiedTask = combined(withTimeout(100), withRetry(3, [10]))(task);
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
		const task = Task.create(() => {
			throw new Error('Test error');
		});

		const errorHandler = (error: any) => {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe('Test error');
			return Task.create(() => 'Recovered from error');
		};

		const modifiedTask = catchError(errorHandler)(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBe('Recovered from error');
	});

	it('should re-throw the error if the handler returns undefined', () => {
		const task = Task.create(() => {
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

	it('should not catch CancellationError', () => {
		const task = Task.create(() => {
			throw new CancellationError();
		});

		const errorHandler = vi.fn();

		const modifiedTask = catchError(errorHandler)(task);

		expect(Task.launch(modifiedTask).join()).rejects.toThrow(CancellationError);
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
			Task.launch([
				(context) => {
					context.cancel();
				},
				catchError(() => () => 1)(throwError(() => new Error('Test error'))),
			]).join(),
		).rejects.toThrow(CancellationError);
	});
});

describe(catchAll.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('should catch and handle errors thrown by the task with a provided task', () => {
		const task = Task.create(() => {
			throw new Error('Test error');
		});

		const recoveryTask = Task.create(() => 'Recovered from error');

		const modifiedTask = catchAll(recoveryTask)(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBe('Recovered from error');
	});

	it('should return undefined if no recovery task is provided', () => {
		const task = Task.create(() => {
			throw new Error('Test error');
		});

		const modifiedTask = catchAll()(task);

		const promise = Task.launch(modifiedTask).join();
		expect(promise).resolves.toBeUndefined();
	});

	it('should not catch CancellationError', () => {
		const task = Task.create(() => {
			throw new CancellationError();
		});

		const recoveryTask = vi.fn();

		const modifiedTask = catchAll(recoveryTask)(task);

		expect(Task.launch(modifiedTask).join()).rejects.toThrow(CancellationError);
		expect(recoveryTask).not.toHaveBeenCalled();
	});
});
