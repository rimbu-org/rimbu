import {
  CancellationError,
  RetryExhaustedError,
  Task,
  TimeoutError,
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
  throwError,
  withArgs,
  withRetry,
  withTimeout,
} from '@rimbu/task/ops';

describe(withRetry.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should not retry if the task succeeds', async () => {
    let attempts = 0;
    const task = withRetry(
      3,
      [100, 200]
    )(() => {
      attempts++;
      return 'Success';
    });

    const result = await Task.launch(task).join();
    expect(result).toBe('Success');
    expect(attempts).toBe(1);
  });

  it('should retry the task the specified number of times', async () => {
    let attempts = 0;
    const task = withRetry(
      3,
      [10, 20]
    )(() => {
      attempts++;
      throw new Error('Test error');
    });

    await expect(Task.launch(task).join()).rejects.toThrow(RetryExhaustedError);
    expect(attempts).toBe(3);
  });

  it('should return the result of the last attempt if it succeeds', async () => {
    let attempts = 0;
    const task = withRetry(
      3,
      [10, 20]
    )(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Test error');
      }
      return 'Final success';
    });

    const result = await Task.launch(task).join();
    expect(result).toBe('Final success');
    expect(attempts).toBe(3);
  });

  it('should throw immediately on CancellationError', async () => {
    let attempts = 0;
    const task = withRetry(
      3,
      [10, 20]
    )(() => {
      attempts++;
      if (attempts === 1) {
        throw new CancellationError();
      }
      throw Error('failed');
    });

    await expect(Task.launch(task).join()).rejects.toThrow(CancellationError);
    expect(attempts).toBe(1);
  });

  it('should throw RetryExhaustedError if times is set to 0', async () => {
    const task = withRetry(0)(() => {
      throw new Error('Test error');
    });

    await expect(Task.launch(task).join()).rejects.toThrow(RetryExhaustedError);
  });
});

describe(withTimeout.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should complete before timeout', async () => {
    const task = withTimeout(100)(() => 'Completed');

    await expect(Task.launch(task).join()).resolves.toBe('Completed');
  });

  it('should throw TimeoutError if task does not complete in time', async () => {
    const task = withTimeout(50)(delay(100));

    await expect(Task.launch(task).join()).rejects.toThrow(TimeoutError);
  });

  it('should cancel the task if timeout occurs', async () => {
    const task = withTimeout(50)(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const job = Task.launch(task);
    job.cancel();

    await expect(job.join()).rejects.toThrow(CancellationError);
  });
});

describe(withArgs.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should run task with provided arguments', async () => {
    const task = Task.create((_, x: number, y: number) => x + y);

    const taskWithArgs = withArgs(task, 2, 3);

    const defer = Task.launch(taskWithArgs);
    await expect(defer.join()).resolves.toBe(5);
  });
});

describe(mapOutput.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should map output of task', async () => {
    const task = Task.create((_, x: number) => x * 2);

    const job = Task.launch(chain([task, mapOutput((x: number) => x + 1)]), {
      args: [3],
    });
    await expect(job.join()).resolves.toBe(7);
  });
});

describe(mapOutputArr.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should map output of task with array input', async () => {
    const task = Task.create(
      (_, x: number, y: number) => [x, y] as [number, number]
    );

    const job = Task.launch(
      chain([task, mapOutputArr((x: number, y: number) => x + y)]),
      { args: [3, 4] }
    );
    await expect(job.join()).resolves.toBe(7);
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

  it('returns the given task when no modifiers are applied', async () => {
    const task = Task.create((_, x: number) => x * 2);
    const result = await Task.launch(combined()(task), { args: [3] }).join();
    expect(result).toBe(6);
  });

  it('applies a single modifier correctly', async () => {
    const task = Task.create((_, x: number) => x * 2);
    const result = await Task.launch(combined(withTimeout(10))(task), {
      args: [3],
    }).join();
    expect(result).toBe(6);
  });

  it('applies multiple modifiers in sequence', async () => {
    let attempts = 0;
    const task = Task.create((_, x: number) => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Test error');
      }
      return x * 2;
    });

    const modifiedTask = combined(withTimeout(100), withRetry(3, [10]))(task);
    const result = await Task.launch(modifiedTask, { args: [3] }).join();
    expect(result).toBe(6);
    expect(attempts).toBe(2);
  });
});

describe(catchError.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should catch and handle errors thrown by the task', async () => {
    const task = Task.create(() => {
      throw new Error('Test error');
    });

    const errorHandler = (error: any) => {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
      return Task.create(() => 'Recovered from error');
    };

    const modifiedTask = catchError(errorHandler)(task);

    const result = await Task.launch(modifiedTask).join();
    expect(result).toBe('Recovered from error');
  });

  it('should re-throw the error if the handler returns undefined', async () => {
    const task = Task.create(() => {
      throw new Error('Test error');
    });

    const errorHandler = (error: any) => {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Test error');
      return undefined;
    };

    const modifiedTask = catchError(errorHandler)(task);

    await expect(Task.launch(modifiedTask).join()).rejects.toThrow(
      'Test error'
    );
  });

  it('should not catch CancellationError', async () => {
    const task = Task.create(() => {
      throw new CancellationError();
    });

    const errorHandler = vi.fn();

    const modifiedTask = catchError(errorHandler)(task);

    await expect(Task.launch(modifiedTask).join()).rejects.toThrow(
      CancellationError
    );
    expect(errorHandler).not.toHaveBeenCalled();
  });

  it('passes the task result through if no error occurs', async () => {
    await expect(
      Task.launch(catchError(() => () => 1)(() => 'Success')).join()
    ).resolves.toBe('Success');
  });

  it('catches errors from the task and returns a default task', async () => {
    await expect(
      Task.launch(
        catchError((err) => {
          expect(err.message).toBe('Test error');
          return () => 'Default value';
        })(throwError(() => new Error('Test error')))
      ).join()
    ).resolves.toBe('Default value');
  });

  it('returns the original error if no default task is provided', async () => {
    await expect(
      Task.launch(
        catchError((err) => {
          expect(err.message).toBe('Test error');
          return undefined;
        })(throwError(() => new Error('Test error')))
      ).join()
    ).rejects.toThrow('Test error');
  });

  it('does not catch if the context is cancelled', async () => {
    await expect(
      Task.launch([
        (context) => {
          context.cancel();
        },
        catchError(() => () => 1)(throwError(() => new Error('Test error'))),
      ]).join()
    ).rejects.toThrow(CancellationError);
  });
});

describe(catchAll.name, () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should catch and handle errors thrown by the task with a provided task', async () => {
    const task = Task.create(() => {
      throw new Error('Test error');
    });

    const recoveryTask = Task.create(() => 'Recovered from error');

    const modifiedTask = catchAll(recoveryTask)(task);

    const result = await Task.launch(modifiedTask).join();
    expect(result).toBe('Recovered from error');
  });

  it('should return undefined if no recovery task is provided', async () => {
    const task = Task.create(() => {
      throw new Error('Test error');
    });

    const modifiedTask = catchAll()(task);

    const result = await Task.launch(modifiedTask).join();
    expect(result).toBeUndefined();
  });

  it('should not catch CancellationError', async () => {
    const task = Task.create(() => {
      throw new CancellationError();
    });

    const recoveryTask = vi.fn();

    const modifiedTask = catchAll(recoveryTask)(task);

    await expect(Task.launch(modifiedTask).join()).rejects.toThrow(
      CancellationError
    );
    expect(recoveryTask).not.toHaveBeenCalled();
  });
});
