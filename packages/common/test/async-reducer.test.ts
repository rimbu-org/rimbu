import { AsyncStream } from '@rimbu/stream';
import { AsyncReducer } from '../src';

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
    const sumDouble = AsyncReducer.createMono(
      async () => 0,
      async (c, v) => c + v,
      async (s) => s * 2
    );

    expect(await AsyncStream.from([1, 2, 3]).reduce(sumDouble as any));
  });
});
