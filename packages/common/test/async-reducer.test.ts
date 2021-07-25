import { AsyncStream } from '@rimbu/stream';
import { AsyncReducer } from '..';
// import { AsyncReducer } from '../src';

describe('AsyncReducer', () => {
  it('create', async () => {
    const r = AsyncReducer.create<number, number>(
      async () => 5,
      async (v, n, i) => v + n + i,
      async (v) => v + 1
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(6);
  });

  it('createMono', async () => {
    const r = AsyncReducer.createMono(
      async () => 5,
      async (v, n, i) => v + n + i,
      async (v) => v + 1
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(6);
  });

  it('createOutput', async () => {
    const r = AsyncReducer.createOutput<number>(
      async () => 5,
      async (v, n, i) => v + n + i
    );
    expect(await r.next(6, 7, 8, () => {})).toBe(6 + 7 + 8);
    expect(await r.stateToResult(5)).toBe(5);
  });

  it('async sum', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    );

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble)).toBe(12);
    expect(close).toBeCalledTimes(1);
  });

  it('filterInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).filterInput((v) => v > 1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble as any)).toBe(10);
    expect(close).toBeCalledTimes(1);
  });

  it('mapInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).mapInput((v: string) => Number.parseInt(v));

    expect(await AsyncStream.of('1', '2', '3').reduce(sumDouble as any)).toBe(
      12
    );
    expect(close).toBeCalledTimes(1);
  });

  it('collectInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).collectInput((v: string, _, skip, halt) => {
      const value = Number.parseInt(v);
      if (value === 1) return skip;
      if (value === 3) {
        halt();
        return skip;
      }
      return value;
    });

    expect(await AsyncStream.of('1', '2', '3').reduce(sumDouble as any)).toBe(
      4
    );
    expect(close).toBeCalledTimes(1);
  });

  it('mapOutput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).mapOutput((v) => v / 2);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble as any)).toBe(6);
    expect(close).toBeCalledTimes(1);
  });

  it('takeInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).takeInput(2);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble as any)).toBe(6);
    expect(close).toBeCalledTimes(1);
  });

  it('dropInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).dropInput(1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble as any)).toBe(10);
    expect(close).toBeCalledTimes(1);
  });

  it('sliceInput', async () => {
    const close = jest.fn();
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2,
      close
    ).sliceInput(1, 1);

    expect(await AsyncStream.of(1, 2, 3).reduce(sumDouble as any)).toBe(4);
    expect(close).toBeCalledTimes(1);
  });
});
