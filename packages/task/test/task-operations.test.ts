import { afterEach, describe, expect, it, vi } from 'bun:test';

import { Task, TaskCancellationError } from '@rimbu/task';
import {
	all,
	allSettled,
	any,
	cancelAllChildren,
	cancelContext,
	chain,
	delay,
	effect,
	joinAll,
	race,
	runSingleCancelNew,
	runSingleCancelPrevious,
	throwError,
	throwErrorClass,
} from '@rimbu/task/ops';

import { disposableDelay } from '#task/utils';

describe(effect.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('forwards arguments to the effect', async () => {
		const effectFn = vi.fn();
		const effectInstance = effect(effectFn);

		await Task.launch(effectInstance(1, 2, 3)).join();

		expect(effectFn).toHaveBeenCalledWith(1, 2, 3);
	});

	it('returns the result of the given effect function', () => {
		const effectFn = vi.fn(() => 42);
		const effectInstance = effect(effectFn);

		const promise = Task.launch(effectInstance()).join();

		expect(promise).resolves.toBe(42);
	});
});

describe(throwErrorClass.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('throws the given error when executed', () => {
		class CustomError extends Error {
			constructor() {
				super('Custom error');
			}
		}

		const error = throwErrorClass(CustomError);

		expect(Task.launch(error).join()).rejects.toThrow(CustomError);
	});
});

describe(delay.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('delays execution for the specified duration', async () => {
		const ms = 100;
		const start = Date.now();
		const delayInstance = delay(ms);

		await Task.launch(delayInstance).join();

		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(ms);
	});

	it('rejects with TaskCancellationError if cancelled', () => {
		const ms = 10;
		const delayInstance = delay(ms);

		const runPromise = Task.launch(async (context) => {
			await context.run(delayInstance);
			context.cancel();
		});

		expect(runPromise.join()).rejects.toThrow(TaskCancellationError);
	});

	it('resolves with void', () => {
		const ms = 10;
		expect(Task.launch(delay(ms)).join()).resolves.toBeUndefined();
	});
});

describe(chain.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('chains tasks and passes results to the next task', () => {
		const task1 = Task.fn(() => 1);
		const task2 = Task.fn((_, result: number) => result + 2);
		const task3 = Task.fn((_, result: number) => result * 3);

		const defer = Task.launch(chain(task1, task2, task3));

		expect(defer.join()).resolves.toBe(9);
	});

	it('executes tasks in sequence and collects last result', async () => {
		const task1 = Task.fn(() => 1);
		const task2 = Task.fn(() => 2);
		const task3 = Task.fn(() => 3);

		const result = await Task.launch(chain(task1, task2, task3)).join();

		expect(result).toEqual(3);
	});

	it('handles context cancellation correctly', async () => {
		const task1 = Task.fn(chain(delay(100), () => 1));
		const task2 = Task.fn(chain(delay(100), () => 2));
		const task3 = Task.fn(chain(delay(100), () => 3));

		const job = Task.launch(
			(context) => {
				return context.run(chain(task1, task2, task3));
			},
			{ isolated: true },
		);

		setTimeout(job.cancel, 150);

		expect(job.join()).rejects.toThrow(TaskCancellationError);
	});

	it('handles cancellation of run task correctly', () => {
		const task1 = Task.fn(chain(delay(100), () => 1));
		const task2 = Task.fn(chain(delay(100), () => '2'));
		const task3 = Task.fn(
			chain(delay(100), (context) => {
				context.cancel();
				return 3;
			}),
		);

		const job = Task.launch(chain(task1, task2, task3));

		expect(job.join()).rejects.toThrow(TaskCancellationError);
	});
});

describe(race.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with the result of the first completed task', () => {
		const defer = Task.launch(
			race(
				chain(delay(50), () => 1),
				chain(delay(80), () => 2),
				chain(delay(30), () => 3),
			),
		);
		expect(defer.join()).resolves.toBe(3);
	});

	it('rejects with TaskCancellationError if context is cancelled', async () => {
		const defer = Task.launch(
			race(
				chain(delay(100), () => 1),
				chain(delay(100), () => 2),
				chain(delay(100), () => 3),
			),
			{ isolated: true },
		);
		setTimeout(() => {
			defer.cancel();
		}, 50);
		expect(defer.join()).rejects.toThrow(TaskCancellationError);
	});

	it('handles cancellation of run task correctly', () => {
		const defer = Task.launch(
			race(
				chain(delay(50), () => 1),
				chain(delay(80), () => 2),
				chain(delay(30), (context) => {
					context.cancel();
					return 3;
				}),
			),
		);
		expect(defer.join()).rejects.toThrow(TaskCancellationError);
	});

	it('returns the first failed task result when all tasks fail', () => {
		expect(
			Task.launch(
				race(
					chain(delay(50), () => {
						throw new Error('Error 1');
					}),
					chain(delay(80), () => {
						throw new Error('Error 2');
					}),
					chain(delay(30), () => {
						throw new Error('Error 3');
					}),
				),
			).join(),
		).rejects.toThrow('Error 3');
	});

	it('respects maxBranch option', async () => {
		const tasks = {
			one: 0,
			two: 0,
			three: 0,
		};

		const defer = Task.launch(
			race(
				chain(
					() => {
						tasks.one = 1;
					},
					delay(60),
					() => {
						tasks.one = 2;
					},
				),
				chain(
					() => {
						tasks.two = 1;
					},
					delay(50),
					() => {
						tasks.two = 2;
					},
				),
				chain(
					() => {
						tasks.three = 1;
					},
					delay(40),
					() => {
						tasks.three = 2;
					},
				),
				{ maxBranch: 2 },
			),
		);

		expect(tasks).toEqual({ one: 0, two: 0, three: 0 });
		await disposableDelay(10);
		expect(tasks).toEqual({ one: 1, two: 1, three: 0 });
		await defer.join();
		expect(tasks).toEqual({ one: 1, two: 2, three: 1 });
	});
});

describe(any.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with the resolved value if any task resolves', () => {
		const defer = Task.launch(
			any(
				chain(
					delay(50),
					throwError(() => new Error('Error 1')),
				),
				chain(delay(80), () => 2),
				chain(
					delay(30),
					throwError(() => new Error('Error 3')),
				),
			),
		);
		expect(defer.join()).resolves.toBe(2);
	});

	it('rejects with AggregateError if all tasks reject', () => {
		const defer = Task.launch(
			any(
				chain(
					delay(50),
					throwError(() => new Error('Error 1')),
				),
				chain(
					delay(80),
					throwError(() => new Error('Error 2')),
				),
				chain(
					delay(30),
					throwError(() => new Error('Error 3')),
				),
			),
		);
		expect(defer.join()).rejects.toThrow(AggregateError);
	});
});

describe(all.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with an array of results from all tasks', () => {
		expect(
			Task.launch(
				all(
					() => 1,
					() => 2,
					() => 3,
				),
			).join(),
		).resolves.toEqual([1, 2, 3]);
	});

	it('rejects with TaskCancellationError if context is cancelled', async () => {
		const defer = Task.launch(all(delay(100), delay(100), delay(100)), {
			isolated: true,
		});

		setTimeout(() => {
			defer.cancel();
		}, 50);

		expect(defer.join()).rejects.toThrow(TaskCancellationError);
	});

	it('handles cancellation of run task correctly', () => {
		const defer = Task.launch(
			all(
				delay(100),
				delay(100),
				chain(delay(100), (context) => {
					context.cancel();
					return 3;
				}),
			),
		);

		expect(defer.join()).rejects.toThrow(TaskCancellationError);
	});

	it('returns failed task result when one task fails', () => {
		expect(
			Task.launch(
				all(
					() => 1,
					() => {
						throw new Error('Error in task 2');
					},
					() => 3,
				),
			).join(),
		).rejects.toThrow('Error in task 2');
	});

	it('rejects when a task fails', () => {
		expect(
			Task.launch(
				all(
					chain(
						delay(30),
						throwError(() => new Error('Error in task 1')),
					),
					chain(delay(10), () => 1),
				),
			).join(),
		).rejects.toThrow(Error);
	});
});

describe('cancelAllChildren', () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('cancels all child tasks of the context', async () => {
		const job = Task.launch(
			async (context) => {
				const child1 = context.launch(chain(delay(1000), () => 'a'));
				const child2 = context.launch(chain(delay(1000), () => 'b'));

				await disposableDelay(20);

				await context.run(cancelAllChildren);

				expect(child1.join()).rejects.toThrow(TaskCancellationError);
				expect(child2.join()).rejects.toThrow(TaskCancellationError);
			},
			{ isolated: true },
		);

		await job.join();
	});
});

describe(allSettled.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with an array of PromiseSettledResult for each task', () => {
		const promise = Task.launch(
			allSettled(
				() => 1,
				() => 2,
				() => 3,
			),
		).join();

		expect(promise).resolves.toEqual([
			{ status: 'fulfilled', value: 1 },
			{ status: 'fulfilled', value: 2 },
			{ status: 'fulfilled', value: 3 },
		]);
	});

	it('resolves with an array of PromiseSettledResult including rejected tasks', () => {
		expect(
			Task.launch(
				allSettled(
					() => 1,
					() => {
						throw new Error('Error in task 2');
					},
					() => 3,
				),
			).join(),
		).resolves.toEqual([
			{ status: 'fulfilled', value: 1 },
			{ status: 'rejected', reason: new Error('Error in task 2') },
			{ status: 'fulfilled', value: 3 },
		]);
	});

	it('rejects with TaskCancellationError if context is cancelled', async () => {
		const defer = Task.launch(allSettled(delay(100), delay(100), delay(100)), {
			isolated: true,
		});

		setTimeout(() => {
			defer.cancel();
		}, 50);

		expect(defer.join()).rejects.toThrow(TaskCancellationError);
	});

	it('handles cancellation of run task correctly', () => {
		expect(
			Task.launch(
				allSettled(
					delay(50),
					delay(30),
					chain(delay(40), (context) => {
						context.cancel();
						return 3;
					}),
				),
			).join(),
		).resolves.toHaveLength(3);
	});
});

describe(runSingleCancelPrevious.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('runs tasks, cancelling the previous one each time', async () => {
		const taskRunner = runSingleCancelPrevious();
		const results: number[] = [];
		const job1 = taskRunner(chain(delay(100), () => results.push(1)));
		await disposableDelay(50);
		const job2 = taskRunner(chain(delay(100), () => results.push(2)));
		await disposableDelay(150);
		const job3 = taskRunner(chain(delay(50), () => results.push(3)));
		expect(job1.join()).rejects.toThrow(TaskCancellationError);
		await joinAll([job2, job3]);

		expect(results).toEqual([2, 3]);
	});
});

describe(runSingleCancelNew.name, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('runs tasks, cancelling the new one if one is already running', async () => {
		const taskRunner = runSingleCancelNew();
		const results: number[] = [];
		const job1 = taskRunner(chain(delay(100), () => results.push(1)));
		await disposableDelay(50);
		const job2 = taskRunner(chain(delay(100), () => results.push(2)));
		await disposableDelay(150);
		const job3 = taskRunner(chain(delay(50), () => results.push(3)));
		await job1.join();
		expect(job2.join()).rejects.toThrow(TaskCancellationError);
		await job3.join();

		expect(results).toEqual([1, 3]);
	});
});

describe('cancelContext', () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('cancels the current context when run', () => {
		expect(Task.launch(cancelContext).join()).rejects.toThrow(
			TaskCancellationError,
		);
	});
});

// --- Additional edge-case tests ---

describe(`${delay.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('delay(0) resolves without error', () => {
		expect(Task.launch(delay(0)).join()).resolves.toBeUndefined();
	});

	it('delay throws when context is already cancelled before delay starts', () => {
		expect(
			Task.launch(async (context) => {
				context.cancel();
				await context.delay(100);
			}).join(),
		).rejects.toThrow(TaskCancellationError);
	});
});

describe(`${chain.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('single-step chain returns the task result directly', () => {
		expect(Task.launch(chain(Task.fn(() => 42))).join()).resolves.toBe(42);
	});

	it('cancellation between steps prevents subsequent steps from running', async () => {
		const executedSteps: number[] = [];

		const step1 = Task.fn(async (context) => {
			executedSteps.push(1);
			context.cancel();
		});
		const step2 = Task.fn(() => {
			executedSteps.push(2);
		});

		await Task.launch(chain(step1, step2)).join({ recover: () => {} });

		expect(executedSteps).toEqual([1]);
	});

	it('args are forwarded to the first task only', async () => {
		let firstArgs: number[] = [];
		let secondArg: unknown;

		const t1 = Task.fn((_ctx, a: number, b: number) => {
			firstArgs = [a, b];
			return a + b;
		});
		const t2 = Task.fn((_ctx, result: number) => {
			secondArg = result;
			return result * 2;
		});

		const result = await Task.launch(chain(t1, t2), { args: [3, 4] }).join();
		expect(firstArgs).toEqual([3, 4]);
		expect(secondArg).toBe(7);
		expect(result).toBe(14);
	});
});

describe(`${any.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves immediately with AggregateError for zero tasks', () => {
		expect(Task.launch(any()).join()).rejects.toBeInstanceOf(AggregateError);
	});

	it('resolves with the single task result', () => {
		expect(Task.launch(any(() => 42)).join()).resolves.toBe(42);
	});

	it('rejects with TaskCancellationError if context is cancelled externally', async () => {
		await Task.launch(
			async (context) => {
				const job = context.launch(any(delay(200), delay(200)));
				setTimeout(() => job.cancel(), 30);
				await job.join({ recover: () => {} });
				expect(context.isActive).toBe(true); // cancelling the child does not cancel us
			},
			{ isolated: true },
		).join();
	});
});

describe(`${all.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with empty array for zero tasks', () => {
		expect(Task.launch(all()).join()).resolves.toEqual([]);
	});

	it('resolves with single task result in array', () => {
		expect(Task.launch(all(() => 42)).join()).resolves.toEqual([42]);
	});
});

describe(`${allSettled.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('resolves with empty array for zero tasks', () => {
		expect(Task.launch(allSettled()).join()).resolves.toEqual([]);
	});

	it('self-cancel produces rejected settled results for cancelled siblings', async () => {
		const result = await Task.launch(
			allSettled(
				chain(delay(100), () => 'slow'),
				chain(delay(10), (ctx) => {
					ctx.cancel();
					return 'canceller';
				}),
			),
		).join();
		// Both entries are present; the slow one is rejected due to cancellation
		expect(result).toHaveLength(2);
		const statuses = result.map((r) => r.status);
		expect(statuses).toContain('rejected');
	});
});

describe(`${cancelAllChildren.name} — edge cases`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('parent context remains active after cancelAllChildren', async () => {
		await Task.launch(
			async (context) => {
				context.launch(delay(1000));
				await disposableDelay(10);
				await context.run(cancelAllChildren);
				expect(context.isActive).toBe(true);
			},
			{ isolated: true },
		).join();
	});

	it('is a no-op when there are no children', async () => {
		await Task.launch(async (context) => {
			expect(context.hasChildren).toBe(false);
			await context.run(cancelAllChildren);
			expect(context.isActive).toBe(true);
		}).join();
	});
});

describe(`${runSingleCancelPrevious.name} — post-completion reuse`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('can launch a new task after the previous one completes normally', async () => {
		const runner = runSingleCancelPrevious();
		const results: number[] = [];

		await runner(chain(delay(20), () => results.push(1))).join();
		await runner(chain(delay(20), () => results.push(2))).join();

		expect(results).toEqual([1, 2]);
	});
});

describe(`${runSingleCancelNew.name} — post-completion reuse`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('can launch a new task after the previous one completes normally', async () => {
		const runner = runSingleCancelNew();
		const results: number[] = [];

		await runner(chain(delay(20), () => results.push(1))).join();
		await runner(chain(delay(20), () => results.push(2))).join();

		expect(results).toEqual([1, 2]);
	});
});

// Regression: previously, both `runSingleCancelPrevious` and
// `runSingleCancelNew` cleared their internal `current` pointer
// unconditionally from the chained cleanup step of every completed job.
// If a subsequent invocation had already overwritten `current` with a
// newer job, that cleanup would stomp the pointer, leaving the fresh
// job orphaned and un-cancellable. The identity guard (`if (current
// === job) current = undefined`) fixes this.
//
// The exact race is hard to force deterministically from user code, so
// this test asserts the positive invariant across a rapid mixed
// sequence of invocations: every launched job must reach its natural
// end (either completed or cancelled) and no job may be silently
// orphaned.
describe(`${runSingleCancelPrevious.name} — rapid interleaved invocation`, () => {
	afterEach(() => {
		expect(Task.rootContext.hasChildren).toBe(false);
		expect(Task.rootContext.isCancelled).toBe(false);
	});

	it('every job reaches a terminal state under rapid re-invocation', async () => {
		const runner = runSingleCancelPrevious();
		const completed: number[] = [];
		const jobs: Task.Job<void>[] = [];

		// Fire five invocations back-to-back. Each cancels the prior.
		// Only the last should complete normally; the first four should
		// terminate with TaskCancellationError.
		for (let i = 0; i < 5; i++) {
			jobs.push(
				runner(
					chain(delay(30), () => {
						completed.push(i);
					}),
				),
			);
			// Tiny asynchronous gap so each launch actually starts before
			// the next one cancels it. Without this, some cancellations
			// arrive before the semaphore acquire, exercising a different
			// path — but the invariant still holds.
			await disposableDelay(2);
		}

		const outcomes = await Promise.all(
			jobs.map((job) => job.join({ recover: (e) => e })),
		);

		// Only the final job should have completed.
		expect(completed).toEqual([4]);
		// The first four should be cancellation errors; the last
		// should be undefined (successful void return).
		for (let i = 0; i < 4; i++) {
			expect(outcomes[i]).toBeInstanceOf(TaskCancellationError);
		}
		expect(outcomes[4]).toBeUndefined();
	});
});
