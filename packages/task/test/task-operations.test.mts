import { ErrBase } from '@rimbu/common';
import { CancellationError, Task } from '@rimbu/task';
import {
  all,
  allSettled,
  any,
  cancelAllChildren,
  chain,
  clog,
  clogArgs,
  delay,
  effect,
  joinAll,
  race,
  runSingleCancelNew,
  runSingleCancelPrevious,
  throwError,
  throwErrorClass,
} from '@rimbu/task/ops';
import { disposableDelay } from 'main/utils.mjs';

describe(effect.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('forwards arguments to the effect', async () => {
    const effectFn = vitest.fn();
    const effectInstance = effect(effectFn);

    await Task.launch(effectInstance(1, 2, 3)).join();

    expect(effectFn).toHaveBeenCalledWith(1, 2, 3);
  });

  it('returns the result of the given effect function', async () => {
    const effectFn = vitest.fn(() => 42);
    const effectInstance = effect(effectFn);

    const result = await Task.launch(effectInstance()).join();

    expect(result).toBe(42);
  });
});

describe(clog.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('logs the provided arguments to the console', async () => {
    const consoleSpy = vitest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const clogInstance = clog('Test log', 123, { key: 'value' });
    await Task.launch(clogInstance).join();

    expect(consoleSpy).toHaveBeenCalledWith('Test log', 123, { key: 'value' });

    consoleSpy.mockRestore();
  });
});

describe(clogArgs.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('logs the provided arguments to the console and returns them', async () => {
    const consoleSpy = vitest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    const args = [1, 'two', { three: 3 }] as const;
    const result = await Task.launch((context) =>
      clogArgs(context, ...args)
    ).join();

    expect(consoleSpy).toHaveBeenCalledWith(...args);
    expect(result).toEqual(args);

    consoleSpy.mockRestore();
  });
});

describe(throwErrorClass.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('throws the given error when executed', async () => {
    class CustomError extends ErrBase.CustomError {
      constructor() {
        super('Custom error');
      }
    }

    const error = throwErrorClass(CustomError);

    await expect(Task.launch(error).join()).rejects.toThrow(CustomError);
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

  it('rejects with CancellationError if cancelled', async () => {
    const ms = 10;
    const delayInstance = delay(ms);

    const runPromise = Task.launch(async (context) => {
      await context.run(delayInstance);
      context.cancel();
    });

    await expect(runPromise.join()).rejects.toThrow(CancellationError);
  });

  it('resolves with void', async () => {
    const ms = 10;
    await expect(Task.launch(delay(ms)).join()).resolves.toBeUndefined();
  });
});

describe('task array', () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('executes tasks in sequence and collects last result', async () => {
    const task1 = Task.create(() => 1);
    const task2 = Task.create(() => 2);
    const task3 = Task.create(() => 3);

    const result = await Task.launch([task1, task2, task3]).join();

    expect(result).toEqual(3);
  });

  it('handles context cancellation correctly', async () => {
    const task1 = Task.create([delay(100), () => 1]);
    const task2 = Task.create([delay(100), () => 2]);
    const task3 = Task.create([delay(100), () => 3]);

    const job = Task.launch((context) => {
      return context.run([task1, task2, task3]);
    });

    setTimeout(job.cancel, 150);

    await expect(job.join()).rejects.toThrow(CancellationError);
  });

  it('handles cancellation of run task correctly', async () => {
    const task1 = Task.create([delay(100), () => 1]);
    const task2 = Task.create([delay(100), () => '2']);
    const task3 = Task.create([
      delay(100),
      (context) => {
        context.cancel();
        return 3;
      },
    ]);

    const job = Task.launch([task1, task2, task3]);

    await expect(job.join()).rejects.toThrow(CancellationError);
  });
});

describe(chain.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('chains tasks and passes results to the next task', async () => {
    const task1 = Task.create(() => 1);
    const task2 = Task.create((_, result: number) => result + 2);
    const task3 = Task.create((_, result: number) => result * 3);

    const defer = Task.launch(chain([task1, task2, task3]));

    await expect(defer.join()).resolves.toBe(9);
  });
});

describe(race.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('resolves with the result of the first completed task', async () => {
    const defer = Task.launch(
      race([
        [delay(50), () => 1],
        [delay(80), () => 2],
        [delay(30), () => 3],
      ])
    );
    await expect(defer.join()).resolves.toBe(3);
  });

  it('rejects with CancellationError if context is cancelled', async () => {
    const defer = Task.launch(
      race([
        [delay(100), () => 1],
        [delay(100), () => 2],
        [delay(100), () => 3],
      ])
    );
    setTimeout(() => {
      defer.cancel();
    }, 50);
    await expect(defer.join()).rejects.toThrow(CancellationError);
  });

  it('handles cancellation of run task correctly', async () => {
    const defer = Task.launch(
      race([
        [delay(50), () => 1],
        [delay(80), () => 2],
        [
          delay(30),
          (context) => {
            context.cancel();
            return 3;
          },
        ],
      ])
    );
    await expect(defer.join()).rejects.toThrow(CancellationError);
  });

  it('returns the first failed task result when all tasks fail', async () => {
    await expect(
      Task.launch(
        race([
          [
            delay(50),
            () => {
              throw new Error('Error 1');
            },
          ],
          [
            delay(80),
            () => {
              throw new Error('Error 2');
            },
          ],
          [
            delay(30),
            () => {
              throw new Error('Error 3');
            },
          ],
        ])
      ).join()
    ).rejects.toThrow('Error 3');
  });

  it('respects max parallel option', async () => {
    let tasks = {
      one: 0,
      two: 0,
      three: 0,
    };

    const defer = Task.launch(
      race(
        [
          [
            () => {
              tasks.one = 1;
            },
            delay(60),
            () => {
              tasks.one = 2;
            },
          ],
          [
            () => {
              tasks.two = 1;
            },
            delay(50),
            () => {
              tasks.two = 2;
            },
          ],
          [
            () => {
              tasks.three = 1;
            },
            delay(50),
            () => {
              tasks.three = 2;
            },
          ],
        ],
        { maxBranch: 2 }
      )
    );

    expect(tasks).toEqual({ one: 0, two: 0, three: 0 });
    await disposableDelay(10);
    expect(tasks).toEqual({ one: 1, two: 1, three: 0 });
    await defer.join();
    expect(tasks).toEqual({ one: 1, two: 2, three: 0 });
  });
});

describe(any.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('resolves with the resolved value if any task resolves', async () => {
    const defer = Task.launch(
      any([
        [delay(50), throwError(() => new Error('Error 1'))],
        [delay(80), () => 2],
        [delay(30), throwError(() => new Error('Error 3'))],
      ])
    );
    await expect(defer.join()).resolves.toBe(2);
  });

  it('rejects with AggregateError if all tasks reject', async () => {
    const defer = Task.launch(
      any([
        [delay(50), throwError(() => new Error('Error 1'))],
        [delay(80), throwError(() => new Error('Error 2'))],
        [delay(30), throwError(() => new Error('Error 3'))],
      ])
    );
    await expect(defer.join()).rejects.toThrow(AggregateError);
  });
});

describe(all.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('resolves with an array of results from all tasks', async () => {
    await expect(
      Task.launch(all([() => 1, () => 2, () => 3])).join()
    ).resolves.toEqual([1, 2, 3]);
  });

  it('rejects with CancellationError if context is cancelled', async () => {
    const defer = Task.launch(all([delay(100), delay(100), delay(100)]));

    setTimeout(() => {
      defer.cancel();
    }, 50);

    await expect(defer.join()).rejects.toThrow(CancellationError);
  });

  it('handles cancellation of run task correctly', async () => {
    const defer = Task.launch(
      all([
        delay(100),
        delay(100),
        [
          delay(100),
          (context) => {
            context.cancel();
            return 3;
          },
        ],
      ])
    );

    await expect(defer.join()).rejects.toThrow(CancellationError);
  });

  it('returns failed task result when one task fails', async () => {
    await expect(
      Task.launch(
        all([
          () => 1,
          () => {
            throw new Error('Error in task 2');
          },
          () => 3,
        ])
      ).join()
    ).rejects.toThrow('Error in task 2');
  });

  it('returns first failed task result when multiple tasks fail', async () => {
    await expect(
      Task.launch(
        all([
          [delay(30), throwError(() => new Error('Error in task 1'))],
          [delay(50), throwError(() => new Error('Error in task 2'))],
          [delay(10), () => 1],
        ])
      ).join()
    ).rejects.toThrow('Error in task 1');
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
        const child1 = context.launch([delay(1000), clog('a')]);
        const child2 = context.launch([delay(1000), clog('b')]);

        await disposableDelay(20);

        await context.run(cancelAllChildren);

        await expect(child1.join()).rejects.toThrow(CancellationError);
        await expect(child2.join()).rejects.toThrow(CancellationError);
      },
      { isSupervisor: true }
    );

    await job.join();
  });
});

describe(allSettled.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('resolves with an array of PromiseSettledResult for each task', async () => {
    const result = await Task.launch(
      allSettled([() => 1, () => 2, () => 3])
    ).join();

    expect(result).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'fulfilled', value: 2 },
      { status: 'fulfilled', value: 3 },
    ]);
  });

  it('resolves with an array of PromiseSettledResult including rejected tasks', async () => {
    await expect(
      Task.launch(
        allSettled([
          () => 1,
          () => {
            throw new Error('Error in task 2');
          },
          () => 3,
        ])
      ).join()
    ).resolves.toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: new Error('Error in task 2') },
      { status: 'fulfilled', value: 3 },
    ]);
  });

  it('rejects with CancellationError if context is cancelled', async () => {
    const defer = Task.launch(allSettled([delay(100), delay(100), delay(100)]));

    setTimeout(() => {
      defer.cancel();
    }, 50);

    await expect(defer.join()).rejects.toThrow(CancellationError);
  });

  it('handles cancellation of run task correctly', async () => {
    await expect(
      Task.launch(
        allSettled([
          delay(50),
          delay(30),
          [
            delay(40),
            (context) => {
              context.cancel();
              return 3;
            },
          ],
        ])
      ).join()
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
    const job1 = taskRunner([delay(100), () => results.push(1)]);
    await disposableDelay(50);
    const job2 = taskRunner([delay(100), () => results.push(2)]);
    await disposableDelay(150);
    const job3 = taskRunner([delay(50), () => results.push(3)]);
    await expect(job1.join()).rejects.toThrow(CancellationError);
    await joinAll([job2, job3]);

    expect(results).toEqual([2, 3]);
  });
});

describe(runSingleCancelNew.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('runs tasks, cancelling the previous one each time', async () => {
    const taskRunner = runSingleCancelNew();
    const results: number[] = [];
    const job1 = taskRunner([delay(100), () => results.push(1)]);
    await disposableDelay(50);
    const job2 = taskRunner([delay(100), () => results.push(2)]);
    await disposableDelay(150);
    const job3 = taskRunner([delay(50), () => results.push(3)]);
    await job1.join();
    await expect(job2.join()).rejects.toThrow(CancellationError);
    await job3.join();

    expect(results).toEqual([1, 3]);
  });
});
