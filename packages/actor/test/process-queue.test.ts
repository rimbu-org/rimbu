import { ProcessQueue } from '../src';

async function wait() {
  return new Promise((res) => setTimeout(res, 100));
}

describe('ProcessQueue', () => {
  it('immediately start first task', async () => {
    const queue = ProcessQueue.create();

    const f = jest.fn().mockResolvedValue(1);
    const p = queue.add(f);

    expect(f).toBeCalledTimes(1);

    await p;
  });

  it('does not start second before first task finished', async () => {
    const queue = ProcessQueue.create();

    const f = jest.fn().mockResolvedValue(1);
    queue.add(wait);
    const p = queue.add(f);

    expect(f).not.toBeCalled();

    await p;

    expect(f).toBeCalledTimes(1);
  });

  it('does not execute planned tasks if task throws exception', async () => {
    const queue = ProcessQueue.create();

    const f = jest.fn().mockResolvedValue(1);

    const p1 = queue.add(async () => {
      await wait();
      throw Error('error');
    });
    const p2 = queue.add(f);

    await expect(p1).rejects.toThrow();
    await expect(p2).rejects.toThrow();

    expect(f).not.toBeCalled();
  });

  it('updates isProcessing', async () => {
    const queue = ProcessQueue.create();

    const onChange = jest.fn();

    queue.isProcessing.subscribe(() => onChange(queue.isProcessing.state));

    expect(onChange).not.toBeCalled();

    const p = queue.add(wait);

    expect(onChange).toBeCalledWith(true);

    onChange.mockClear();

    await p;

    await wait();

    expect(onChange).toBeCalledWith(false);

    expect(queue.isProcessing.state).toBe(false);
  });
});
