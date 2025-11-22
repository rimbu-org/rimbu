import { CancellationError, Task } from '@rimbu/task';

import { disposableDelay } from 'main/internal.mjs';

describe('Task factory methods', () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('create should return the given Task instance', async () => {
    const task: Task<number> = (taskContext) => {
      expect([...Task.rootContext.children]).toContain(taskContext);
      return 1;
    };

    const createdTask = Task.create(task);
    expect(createdTask).toBe(task);

    await expect(Task.launch(createdTask).join()).resolves.toBe(1);
  });
});

describe('Task.launch', () => {
  afterEach(() => {
    expect(Task.rootContext.hasChildren).toBe(false);
    expect(Task.rootContext.isCancelled).toBe(false);
  });

  it('should execute the task and return its result', async () => {
    const message = 'Hello, World!';
    const task: Task<string> = () => message;
    await expect(Task.launch(task).join()).resolves.toBe(message);
  });

  it('should throw if the given task cancels the context', async () => {
    const task: Task<void> = (context) => {
      context.cancel();
    };
    await expect(Task.launch(task).join()).rejects.toThrow(CancellationError);
  });

  it('cancelAndJoin should cancel the task and wait for its completion', async () => {
    let wasCancelled = false;
    const task: Task<void> = async (context) => {
      try {
        await context.delay(1000);
      } catch (e) {
        if (e instanceof CancellationError) {
          wasCancelled = true;
          throw e;
        }
      }
    };

    const job = Task.launch(task);
    await disposableDelay(10);
    await job.cancelAndJoin();
    expect(wasCancelled).toBe(true);
  });

  it('should queue sequential launch calls with maxBranch=1, part 1', async () => {
    await Task.launch(
      async (context) => {
        const job1 = context.launch(async (context) => {
          await context.delay(100);
          return 1;
        });

        let started = false;

        const job2 = context.launch(async (context) => {
          started = true;
          await context.delay(50);
          throw Error();
        });

        await disposableDelay(10);
        expect(started).toBe(false);
        await expect(job1.join()).resolves.toBe(1);
        await expect(job2.join()).rejects.toThrow();
        expect(started).toBe(true);
      },
      { isSupervisor: true, maxBranch: 1 }
    ).join();
  });

  it('should queue sequential launch calls with maxBranch=1, part 2', async () => {
    await Task.launch(
      async (context) => {
        const job1 = context.launch(async (context) => {
          await context.delay(50);
          throw Error();
        });

        let started = false;
        const job2 = context.launch(async (context) => {
          started = true;
          await context.delay(100);
          return 1;
        });

        await disposableDelay(10);
        expect(started).toBe(false);
        await expect(job1.join()).rejects.toThrow();
        await expect(job2.join()).resolves.toBe(1);
        expect(started).toBe(true);
      },
      { isSupervisor: true, maxBranch: 1 }
    ).join();
  });

  it('should execute the task and wait until the job is finished without joining', async () => {
    const message = 'Hello, World!';
    const task = Task.create(async (context) => {
      await context.delay(200);
      return message;
    });

    await Task.launch(async (context) => {
      await context
        .launch(async (context) => {
          const job = context.launch(task);

          let jobDone = false;
          job.join().then(() => {
            jobDone = true;
          });

          expect(jobDone).toBe(false);

          await new Promise((resolve) => setTimeout(resolve, 10));

          expect(jobDone).toBe(false);

          await job.join();
          expect(jobDone).toBe(true);
        })
        .join();
    }).join();
  });

  it('can relaunch a job with the same supervisor context', async () => {
    const task = Task.create(async (context, value: number) => {
      await context.delay(50);
      return value;
    });

    await Task.launch(
      async (context) => {
        const defer1 = context.launch(task, { args: [1] });

        await disposableDelay(10);
        context.cancelAllChildren();
        const defer2 = context.launch(task, { args: [2] });

        await expect(defer1.join()).rejects.toThrow();
        await expect(defer2.join()).resolves.toBe(2);
      },
      { isSupervisor: true }
    ).join();
  });

  it('parent waits for children to complete before completing itself, even without join', async () => {
    const results: number[] = [];

    const task = Task.create(async (context, value: number) => {
      await context.delay(value * 10);
      results.push(value);
      return value;
    });

    await Task.launch(async (context) => {
      context.launch(async (context) => {
        context.launch(task, { args: [1] });
        context.launch(task, { args: [2] });
      });
      context.launch(task, { args: [3] });
    }).join();

    expect(results).toEqual([1, 2, 3]);
  });
});
