import { describe, expect, it, vi } from 'bun:test';

import {
  attachAbort,
  createCleaner,
  defer,
  timeout,
  timeoutAction,
} from '#channel/utils';

describe('utils', () => {
  describe('attachAbort', () => {
    it('returns undefined if no signal or signal is aborted', () => {
      expect(attachAbort(undefined, () => {})).toBeUndefined();

      const controller = new AbortController();
      controller.abort();
      expect(attachAbort(controller.signal, () => {})).toBeUndefined();
    });

    it('executes given functions on abort', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();

      const controller = new AbortController();
      const clean1 = attachAbort(controller.signal, fn1);
      expect(clean1).not.toBeUndefined();
      expect(fn1).not.toBeCalled();

      const clean2 = attachAbort(controller.signal, fn2);
      expect(clean2).not.toBeUndefined();
      expect(fn2).not.toBeCalled();

      controller.abort();

      expect(fn1).toBeCalledTimes(1);
      expect(fn2).toBeCalledTimes(1);
    });

    it('does not execute given functions on abort after unsubscribe', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();

      const controller = new AbortController();
      const clean1 = attachAbort(controller.signal, fn1)!;
      expect(clean1).not.toBeUndefined();
      expect(fn1).not.toBeCalled();

      const clean2 = attachAbort(controller.signal, fn2)!;
      expect(clean2).not.toBeUndefined();
      expect(fn2).not.toBeCalled();

      clean1();
      clean2();

      controller.abort();

      expect(fn1).not.toBeCalledTimes(1);
      expect(fn2).not.toBeCalledTimes(1);
    });
  });

  describe('timeout', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('resolves immediately when undefined', async () => {
      const spy = vi.spyOn(window, 'setTimeout');
      await timeout();
      expect(spy).not.toBeCalled();
    });

    it('resolves to undefined after given time', async () => {
      const spy = vi.spyOn(window, 'setTimeout');

      let resolved = false;
      const result = timeout(100);
      result.then(() => (resolved = true));
      expect(resolved).toBe(false);
      await expect(result).resolves.toBeUndefined();
      expect(resolved).toBe(true);

      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('defer', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('called setTimeout internally', async () => {
      const spy = vi.spyOn(window, 'setTimeout');

      await defer();

      expect(spy).toBeCalledTimes(1);
    });
  });

  describe('timeoutAction', () => {
    it('returns undefined if timeout is undefined', async () => {
      const fn = vi.fn();
      expect(timeoutAction(fn)).toBeUndefined();
      await timeout(100);
      expect(fn).not.toBeCalled();
    });

    it('performs given action after timeout', async () => {
      const fn = vi.fn();
      timeoutAction(fn, 10);
      expect(fn).not.toBeCalled();

      await timeout(100);
      expect(fn).toBeCalledTimes(1);
    });

    it('does not perform action after cancel', async () => {
      const fn = vi.fn();
      const cancel = timeoutAction(fn, 10)!;
      expect(fn).not.toBeCalled();

      cancel();

      await timeout(100);
      expect(fn).not.toBeCalled();
    });
  });

  describe('createCleaner', () => {
    it('performs added actions on cleanup', () => {
      const cleaner = createCleaner();

      const fn1 = vi.fn();
      const fn2 = vi.fn();
      const fn3 = vi.fn();

      cleaner.add(fn1, fn2);
      cleaner.add(fn3);

      expect(fn1).not.toBeCalled();
      expect(fn2).not.toBeCalled();
      expect(fn3).not.toBeCalled();

      cleaner.cleanup();

      expect(fn1).toBeCalledTimes(1);
      expect(fn2).toBeCalledTimes(1);
      expect(fn3).toBeCalledTimes(1);
    });
  });
});
