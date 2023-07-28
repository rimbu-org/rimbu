import { timeout } from '../src/custom/index.mjs';
import { Semaphore } from '../src/main/index.mjs';

describe('Semaphore', () => {
  it('throws if maxSize < 1', () => {
    expect(() => Semaphore.create({ maxSize: 0 })).toThrow(
      Semaphore.Error.InvalidConfigError
    );
  });

  it('does not block acquiring when capacity available', async () => {
    const sem = Semaphore.create({ maxSize: 1 });

    await sem.acquire();
    await timeout(100);

    expect(() => sem.release()).not.toThrow();
  });

  it('does not block when acquiring 0 or negative capacity', async () => {
    const sem = Semaphore.create({ maxSize: 1 });

    await sem.acquire();
    await sem.acquire(0);
  });

  it('blocks acquiring when at full capacity', async () => {
    const sem = Semaphore.create({ maxSize: 1 });

    (async () => {
      await sem.acquire();
      await timeout(100);
      sem.release();
    })();

    await sem.acquire();

    expect(() => sem.release()).not.toThrow();
  });

  it('throws when acquiring more than size', async () => {
    const sem = Semaphore.create({ maxSize: 1 });

    await expect(sem.acquire(2)).rejects.toThrow(
      Semaphore.Error.InsufficientCapacityError
    );
  });

  it('throws when releasing more than current size', async () => {
    const sem = Semaphore.create({ maxSize: 1 });

    expect(() => sem.release()).toThrow(Semaphore.Error.CapacityUnderflowError);
  });

  it('will provide access first to later smaller task', async () => {
    const sem = Semaphore.create({ maxSize: 2 });

    await sem.acquire();

    await sem.acquire();

    const fn = vi.fn();

    const promise = (async () => {
      await sem.acquire(2);
      fn();
    })();

    expect(fn).not.toBeCalled();

    sem.release();

    await timeout(10);

    expect(fn).not.toBeCalled();

    await timeout(10);

    expect(fn).not.toBeCalled();

    sem.release();

    await promise;

    expect(fn).toBeCalledTimes(1);
  });

  it('will provide access to bigger task once capacity is available', async () => {
    const sem = Semaphore.create({ maxSize: 2 });

    await sem.acquire();

    const fn = vi.fn();

    const promise = (async () => {
      await sem.acquire(2);
      fn();
    })();

    expect(fn).not.toBeCalled();

    await sem.acquire();

    await timeout(10);

    sem.release();

    await timeout(10);

    sem.release();

    expect(fn).not.toBeCalled();

    await timeout(10);

    sem.release();

    await promise;

    expect(fn).toBeCalledTimes(1);
  });

  it('canAcquire returns correct values', async () => {
    const sem = Semaphore.create({ maxSize: 2 });

    expect(sem.canAcquire()).toBe(true);
    expect(sem.canAcquire(0)).toBe(true);
    expect(sem.canAcquire(-3)).toBe(true);
    expect(sem.canAcquire(2)).toBe(true);
    expect(sem.canAcquire(3)).toBe(false);
    expect(sem.canAcquire(4)).toBe(false);

    await sem.acquire();

    expect(sem.canAcquire()).toBe(true);
    expect(sem.canAcquire(0)).toBe(true);
    expect(sem.canAcquire(-3)).toBe(true);
    expect(sem.canAcquire(2)).toBe(false);
    expect(sem.canAcquire(3)).toBe(false);
    expect(sem.canAcquire(4)).toBe(false);
  });
});
