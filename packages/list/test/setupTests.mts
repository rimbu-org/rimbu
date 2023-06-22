expect.extend({
  toBeArrayOf<R>(received: R[], expected: R[]) {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () => `Received instance ${received} if not an array`,
      };
    }

    if (received.length !== expected.length) {
      return {
        pass: false,
        message: () =>
          `lengths of array is expected to be ${expected.length} but was ${received.length}`,
      };
    }

    for (let i = 0; i < received.length; i++) {
      if (received[i] !== expected[i]) {
        return {
          pass: false,
          message: () =>
            `element at index ${i} is not the same as expected array`,
        };
      }
    }

    return {
      pass: true,
      message: () => 'pass',
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeArrayOf<E>(expected: E[]): CustomMatcherResult;
    }
  }
}

export {};
