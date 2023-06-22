import { AsyncOptLazy } from '@rimbu/common';

describe('AsyncOptLazy', () => {
  it('toMaybePromise', async () => {
    expect(AsyncOptLazy.toMaybePromise(1)).toBe(1);
    expect(AsyncOptLazy.toMaybePromise(() => 1)).toBe(1);
    expect(await AsyncOptLazy.toMaybePromise(async () => 1)).toBe(1);
    expect(await AsyncOptLazy.toMaybePromise(Promise.resolve(1))).toBe(1);

    expect(AsyncOptLazy.toMaybePromise(async () => 1)).toBeInstanceOf(Promise);
    expect(AsyncOptLazy.toMaybePromise(Promise.resolve(1))).toBeInstanceOf(
      Promise
    );
  });

  it('toPromise', async () => {
    expect(await AsyncOptLazy.toPromise(1)).toBe(1);
    expect(await AsyncOptLazy.toPromise(() => 1)).toBe(1);
    expect(await AsyncOptLazy.toPromise(async () => 1)).toBe(1);
    expect(await AsyncOptLazy.toPromise(Promise.resolve(1))).toBe(1);

    expect(AsyncOptLazy.toPromise(1)).toBeInstanceOf(Promise);
    expect(AsyncOptLazy.toPromise(() => 1)).toBeInstanceOf(Promise);
    expect(AsyncOptLazy.toPromise(async () => 1)).toBeInstanceOf(Promise);
    expect(AsyncOptLazy.toPromise(Promise.resolve(1))).toBeInstanceOf(Promise);
  });
});
