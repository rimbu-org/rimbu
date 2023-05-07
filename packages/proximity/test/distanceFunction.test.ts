import { DistanceFunction } from '../src/common';

describe('Default distance function', () => {
  describe.each([
    {
      type: 'numbers',
      oneValue: 90,
      differentValue: 7,
    },

    {
      type: 'strings',
      oneValue: 'yogi',
      differentValue: 'bubu',
    },

    {
      type: 'booleans',
      oneValue: true,
      differentValue: false,
    },

    {
      type: 'objects',
      oneValue: { name: 'ciop' },
      differentValue: { name: 'ciop' },
    },
  ])('with $type', ({ oneValue, differentValue }) => {
    describe('when the operands are the very same', () => {
      it('should return 0', () =>
        expect(DistanceFunction.defaultFunction(oneValue, oneValue)).toBe(0));
    });

    describe('when the operands are different', () => {
      it('should return +Inf', () =>
        expect(DistanceFunction.defaultFunction(oneValue, differentValue)).toBe(
          Number.POSITIVE_INFINITY
        ));
    });
  });
});
