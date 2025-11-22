import { CancellationError, Task } from '@rimbu/task';
import { cancelContext, delay, throwError } from '@rimbu/task/ops';
import { disposableDelay } from 'main/utils.mjs';

describe('Task exceptions', () => {
  it('run throws if context is cancelled', async () => {
    await expect(
      Task.launch(async (context) => {
        await context.run(cancelContext);
      }).join()
    ).rejects.toThrow(CancellationError);
  });

  it('run throws if task throws exception', async () => {
    await expect(
      Task.launch(async (context) => {
        await context.run(throwError(() => new Error('Test')));
      }).join()
    ).rejects.toThrow('Test');
  });

  it('launch throws if its context is cancelled', async () => {
    await expect(Task.launch(cancelContext).join()).rejects.toThrow(
      CancellationError
    );
  });

  it('launch throws if task throws exception', async () => {
    await expect(
      Task.launch(throwError(() => new Error('Error 3'))).join()
    ).rejects.toThrow('Error 3');
  });

  it('normal context cancels children and itself on child cancel', async () => {
    const job = Task.launch(async (context) => {
      const job1 = context.launch([delay(10), cancelContext]);
      let job2Done = false;
      const job2 = context.launch([
        delay(30),
        () => {
          job2Done = true;
        },
      ]);

      await expect(job1.join()).rejects.toThrow(CancellationError);
      expect(job2Done).toBe(false);
      await expect(job2.join()).rejects.toThrow(CancellationError);
      await disposableDelay(50);
      expect(job2Done).toBe(false);
    });

    await expect(job.join()).rejects.toThrow(CancellationError);
  });

  it('recover catches thrown errors', async () => {
    const job = Task.launch(throwError(() => new Error('Error 5')));
    const result = await job.join({
      recover: (e) => {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Error 5');
        return 42;
      },
    });
    expect(result).toBe(42);
  });

  it('recover returns value even if parent is canceled', async () => {
    await Task.launch(async (context) => {
      const job = context.launch(throwError(() => new Error('Error 6')));

      const result = await job.join({
        recover: (e) => {
          expect(e).toBeInstanceOf(Error);
          expect((e as Error).message).toBe('Error 6');
          return 43;
        },
      });

      expect(result).toBe(43);
      expect(context.isActive).toBe(false);
    }).join({ recover: () => {} });
  });

  it('recover catches cancellation errors', async () => {
    const job = Task.launch(cancelContext);

    const fn = vi.fn().mockResolvedValue(42);

    await expect(
      job.join({
        recover: fn,
      })
    ).resolves.toBe(42);
  });

  it('throws cancellation error if cancelled during delay', async () => {
    const job = Task.launch(async (context) => {
      setTimeout(() => context.cancel(), 10);
      await context.delay(50);
      return 42;
    });

    await expect(job.join()).rejects.toThrow(CancellationError);
  });
});
