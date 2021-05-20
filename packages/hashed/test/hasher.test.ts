import { Stream } from '@rimbu/stream';
import { Hasher } from '../src';

describe('Hasher', () => {
  it('objectHasher', () => {
    const h = Hasher.objectHasher();

    expect(h.hash({})).toEqual(h.hash({}));
    expect(h.hash({ a: 1, b: 2 })).toEqual(h.hash({ b: 2, a: 1 }));
    expect(h.hash({ a: 1 })).not.toEqual({ a: 2 });
    expect(h.hash({ a: 1 })).not.toEqual({ a: 1, b: 2 });
    expect(h.hash({ a: 1, b: 2 })).not.toEqual({ a: 1 });

    // only shallow hash
    expect(h.hash({ a: { b: 1, c: 2 } })).not.toEqual({ a: { c: 2, b: 1 } });
  });

  it('streamSourceHasher', () => {
    const h = Hasher.streamSourceHasher();

    expect(h.hash(Stream.range({ amount: 1 }))).not.toEqual(
      h.hash(Stream.range({ amount: 4 }))
    );
    expect(h.hash(Stream.range({ amount: 100 }))).not.toEqual(
      h.hash(Stream.range({ amount: 101 }))
    );

    expect(h.hash([1, 2])).toEqual(h.hash([1, 2]));
  });
});
