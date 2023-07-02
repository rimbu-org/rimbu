import { Stream } from '@rimbu/stream';

import { Hasher } from '../src/main/index.mjs';

describe('Hasher', () => {
  it('defaultHasher', () => {
    expect(Hasher.defaultHasher()).toBe(Hasher.anyShallowHasher());
  });

  it('anyShallowHasher', () => {
    const h = Hasher.anyShallowHasher();

    expect(h.hash(1)).toEqual(h.hash(1));
    expect(h.hash('abc')).toEqual(h.hash('abc'));

    expect(h.hash(1)).not.toEqual(h.hash(2));
    expect(h.hash('abc')).not.toEqual(h.hash('cba'));

    // object
    expect(h.hash({})).toEqual(h.hash({}));
    expect(h.hash({ a: 1, b: 2 })).toEqual(h.hash({ b: 2, a: 1 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 2 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 1, b: 2 }));
    expect(h.hash({ a: 1, b: 2 })).not.toEqual(h.hash({ a: 1 }));

    // only shallow hash
    expect(h.hash({ a: { b: 1, c: 2 } })).not.toEqual(
      h.hash({ a: { c: 2, b: 1 } })
    );

    // stream
    expect(h.hash(Stream.range({ amount: 1 }))).not.toEqual(
      h.hash(Stream.range({ amount: 4 }))
    );
    expect(h.hash(Stream.range({ amount: 100 }))).not.toEqual(
      h.hash(Stream.range({ amount: 101 }))
    );

    expect(h.hash([1, 2])).toEqual(h.hash([1, 2]));
    expect(h.hash([1, 2])).not.toEqual(h.hash([2, 1]));

    // only shallow hash
    expect(h.hash([{ b: 1, c: 2 }])).not.toEqual(h.hash([{ c: 2, b: 1 }]));
  });

  it('anyDeepHasher', () => {
    const h = Hasher.anyDeepHasher();

    expect(h.hash(1)).toEqual(h.hash(1));
    expect(h.hash('abc')).toEqual(h.hash('abc'));

    expect(h.hash(1)).not.toEqual(h.hash(2));
    expect(h.hash('abc')).not.toEqual(h.hash('cba'));

    // object
    expect(h.hash({})).toEqual(h.hash({}));
    expect(h.hash({ a: 1, b: 2 })).toEqual(h.hash({ b: 2, a: 1 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 2 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 1, b: 2 }));
    expect(h.hash({ a: 1, b: 2 })).not.toEqual(h.hash({ a: 1 }));

    // deep hash
    expect(h.hash({ a: { b: 1, c: 2 } })).toEqual(
      h.hash({ a: { c: 2, b: 1 } })
    );

    // stream
    expect(h.hash(Stream.range({ amount: 1 }))).not.toEqual(
      h.hash(Stream.range({ amount: 4 }))
    );
    expect(h.hash(Stream.range({ amount: 100 }))).not.toEqual(
      h.hash(Stream.range({ amount: 101 }))
    );

    expect(h.hash([1, 2])).toEqual(h.hash([1, 2]));
    expect(h.hash([1, 2])).not.toEqual(h.hash([2, 1]));

    // deep element hash
    expect(h.hash([{ a: { b: 1, c: 2 } }])).toEqual(
      h.hash([{ a: { c: 2, b: 1 } }])
    );
  });

  it('objectHasher', () => {
    const h = Hasher.objectHasher();

    expect(h.hash({})).toEqual(h.hash({}));
    expect(h.hash({ a: 1, b: 2 })).toEqual(h.hash({ b: 2, a: 1 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 2 }));
    expect(h.hash({ a: 1 })).not.toEqual(h.hash({ a: 1, b: 2 }));
    expect(h.hash({ a: 1, b: 2 })).not.toEqual(h.hash({ a: 1 }));

    // only shallow hash
    expect(h.hash({ a: { b: 1, c: 2 } })).not.toEqual(
      h.hash({ a: { c: 2, b: 1 } })
    );
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
    expect(h.hash([1, 2])).not.toEqual(h.hash([2, 1]));

    // only shallow element hash
    expect(h.hash([{ a: { b: 1, c: 2 } }])).not.toEqual(
      h.hash([{ a: { c: 2, b: 1 } }])
    );
  });

  it('stringHasher', () => {
    const h = Hasher.stringHasher();

    expect(h.hash('abc')).toEqual(h.hash('abc'));

    expect(h.hash('abc')).not.toEqual(h.hash('cba'));
    expect(h.hash('abc')).not.toEqual(h.hash('ab'));
    expect(h.hash('abc')).not.toEqual(h.hash('abcd'));
    expect(h.hash('abc')).not.toEqual(h.hash('aBc'));
  });

  it('stringCaseInsensitiveHasher', () => {
    const h = Hasher.stringCaseInsensitiveHasher();

    expect(h.hash('abc')).toEqual(h.hash('abc'));
    expect(h.hash('abc')).toEqual(h.hash('aBc'));
    expect(h.hash('abc123')).toEqual(h.hash('aBc123'));

    expect(h.hash('abc')).not.toEqual(h.hash('cba'));
    expect(h.hash('abc')).not.toEqual(h.hash('ab'));
    expect(h.hash('abc')).not.toEqual(h.hash('abcd'));
  });

  it('tupleSymmetricHasher', () => {
    const h = Hasher.tupleSymmetric();

    expect(h.hash([1, 1])).toEqual(h.hash([1, 1]));
    expect(h.hash([1, 2])).toEqual(h.hash([1, 2]));
    expect(h.hash([1, 2])).toEqual(h.hash([2, 1]));

    expect(h.hash([1, 2])).not.toEqual(h.hash([2, 2]));

    expect(h.hash([{ a: 1 }, { b: 2 }])).toEqual(h.hash([{ b: 2 }, { a: 1 }]));
    expect(h.hash([[{ a: 1 }], [{ b: 2 }]])).toEqual(
      h.hash([[{ b: 2 }], [{ a: 1 }]])
    );
  });
});
