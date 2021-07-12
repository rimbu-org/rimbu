import { AsyncStream } from '../src';

// const streamRange1 = Stream.range({ amount: 100 });
// const streamRange2 = Stream.from(streamRange1.toArray());
// const streamRange3 = Stream.from(new Set(streamRange1.toArray()));
// const streamRange4 = Stream.range({ amount: 10 }).concat(
//   Stream.range({ start: 10, end: [100, false] }).toArray()
// );
// const streamRange5 = Stream.range({ amount: 100 }).map((v) => v);
// const streamRange6 = Stream.range({ amount: 99 }).append(99);
// const streamRange7 = Stream.range({ start: 1, amount: 99 }).prepend(0);
// const streamRange8 = Stream.range({ amount: 100 }).filter(() => true);
// const arr = Stream.range({ start: 99, end: 0 }, -1).toArray();
// const streamRange9 = Stream.fromArray(arr, undefined, true);

// const sources = [
//   streamRange1,
//   streamRange2,
//   streamRange3,
//   streamRange4,
//   streamRange5,
//   streamRange6,
//   streamRange7,
//   streamRange8,
//   streamRange9,
// ];

describe('AsyncStream constructors', () => {
  it('empty', async () => {
    const e = AsyncStream.empty();
    expect(e).toBe(AsyncStream.empty());
    expect(await e.toArray()).toEqual([]);
    expect(e.concat(e)).toBe(e);
  });

  it('of', async () => {
    expect(await AsyncStream.of(1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(Promise.resolve(1)).toArray()).toEqual([1]);
    expect(await AsyncStream.of(() => 1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(async () => 1).toArray()).toEqual([1]);
    expect(await AsyncStream.of(1, 2, 3).toArray()).toEqual([1, 2, 3]);
  });

  it('from', async () => {
    expect(AsyncStream.from([])).toBe(AsyncStream.empty());
    expect(await AsyncStream.from([1]).toArray()).toEqual([1]);
    expect(await AsyncStream.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
    expect(await AsyncStream.from(new Set()).toArray()).toEqual([]);
    expect(await AsyncStream.from(new Set([1, 2, 3])).toArray()).toEqual([
      1, 2, 3,
    ]);
    expect(await AsyncStream.from(() => [1]).toArray()).toEqual([1]);
    expect(await AsyncStream.from(Promise.resolve([1])).toArray()).toEqual([1]);
    expect(await AsyncStream.from(async () => [1]).toArray()).toEqual([1]);
    expect(
      await AsyncStream.from(async function* (): AsyncGenerator<
        number,
        number
      > {
        yield 1;
        yield 2;
        return 3;
      }).toArray()
    );
  });

  it('from multi', async () => {
    expect(AsyncStream.from([], [])).toBe(AsyncStream.empty());
    expect(
      await AsyncStream.from(
        () => [],
        () => []
      ).toArray()
    ).toEqual([]);
    expect(
      await AsyncStream.from(
        [1, 2],
        () => [3, 4],
        Promise.resolve([5, 6]),
        async () => [7, 8],
        async function* () {
          yield 9;
          yield 10;
          return 'a';
        }
      ).toArray()
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('always', () => {
    expect(AsyncStream.always(5).take(5).toArray()).toEqual([5, 5, 5, 5, 5]);
    // expect(AsyncStream.always(5).first()).toBe(5);
    // expect(AsyncStream.always(5).last()).toBe(5);
    // expect(AsyncStream.always(5).elementAt(10000)).toBe(5);
  });

  //   it('flatten', () => {
  //     expect(AsyncStream.empty().flatten()).toBe(AsyncStream.empty());
  //     expect(AsyncStream.of([]).flatten().toArray()).toEqual([]);
  //     expect(AsyncStream.of([1, 2]).flatten().toArray()).toEqual([1, 2]);
  //     expect(AsyncStream.of([1, 2], [3], [4]).flatten().toArray()).toEqual([
  //       1, 2, 3, 4,
  //     ]);
  //   });

  //   it('range', () => {
  //     expect(AsyncStream.range({ start: 0, end: 5 }).toArray()).toEqual([
  //       0, 1, 2, 3, 4, 5,
  //     ]);
  //     expect(AsyncStream.range({ start: 5, end: 0 }, -1).toArray()).toEqual([
  //       5, 4, 3, 2, 1, 0,
  //     ]);
  //     expect(AsyncStream.range({ start: 0, end: -5 })).toBe(AsyncStream.empty());
  //     expect(AsyncStream.range({ start: 0, end: 5 }, -1)).toBe(AsyncStream.empty());
  //     expect([...AsyncStream.range({ start: 0, end: 5 })]).toEqual([0, 1, 2, 3, 4, 5]);
  //     expect(AsyncStream.range({ end: 5 }).toArray()).toEqual([0, 1, 2, 3, 4, 5]);
  //     expect(AsyncStream.range({ amount: 5 }).toArray()).toEqual([0, 1, 2, 3, 4]);
  //     expect(AsyncStream.range({ start: 2, amount: 5 }).toArray()).toEqual([
  //       2, 3, 4, 5, 6,
  //     ]);
  //     expect(
  //       AsyncStream.range({ start: [0, true], end: [3, true] }).toArray()
  //     ).toEqual([0, 1, 2, 3]);
  //     expect(
  //       AsyncStream.range({ start: [0, false], end: [3, false] }).toArray()
  //     ).toEqual([1, 2]);
  //   });

  //   it('random', () => {
  //     const arr = AsyncStream.random().take(5).toArray();
  //     expect(arr.length).toBe(5);
  //   });

  //   it('randomInt', () => {
  //     const arr = AsyncStream.randomInt(0, 100).take(5).toArray();
  //     expect(arr.length).toBe(5);
  //   });

  //   it('unfold', () => {
  //     expect(AsyncStream.unfold(0, (c, n, stop) => stop).toArray()).toEqual([0]);
  //     expect(
  //       AsyncStream.unfold(0, (c, i, stop) => (c > 2 ? stop : c + i)).toArray()
  //     ).toEqual([0, 1, 3]);
  //   });

  // it('forEachApply', () => {
  //   AsyncStream.forEachApply(
  //     AsyncStream.of<[number, string]>([1, 'a'], [2, 'b']),
  //     (n: number, s: string, b: boolean) => {
  //       console.log({ n, s, b });
  //     },
  //     true
  //   );
  // });
});

// describe('Stream methods', () => {
//   it('stream', () => {
//     expect(AsyncStream.empty<number>().stream()).toBe(AsyncStream.empty<string>());
//     const s = AsyncStream.of(1, 2, 3);
//     expect(s.stream()).toBe(s);

//     sources.forEach((source) => {
//       expect(source.stream()).toBe(source);
//     });
//   });

//   it('equals', () => {
//     const s1 = AsyncStream.empty<number>();
//     const s2 = AsyncStream.of(1, 2, 3);
//     expect(s1.equals(s1)).toBe(true);
//     expect(s1.equals([])).toBe(true);
//     expect(s1.equals(s2)).toBe(false);
//     expect(s2.equals(s1)).toBe(false);
//     expect(s2.equals([])).toBe(false);
//     expect(s2.equals(s2)).toBe(true);
//     expect(AsyncStream.of('a', 'b').equals(['A', 'B'])).toBe(false);
//     expect(
//       AsyncStream.of('a', 'b').equals(['A', 'B'], Eq.stringCaseInsentitiveEq())
//     ).toBe(true);

//     sources.forEach((source) => {
//       expect(source.equals([])).toBe(false);
//       expect(source.equals(source)).toBe(true);
//     });
//   });

//   it('assumeNonEmpty', () => {
//     expect(() => AsyncStream.empty<number>().assumeNonEmpty()).toThrow();
//     const s = AsyncStream.of(1, 2, 3);
//     expect(s.assumeNonEmpty()).toBe(s);

//     sources.forEach((source) => {
//       expect(source.assumeNonEmpty()).toBe(source);
//     });
//   });

//   it('asNormal', () => {
//     const s = AsyncStream.of(1, 2, 3);
//     expect(s.asNormal()).toBe(s);
//   });

//   it('prepend', () => {
//     expect(AsyncStream.empty<number>().prepend(5).toArray()).toEqual([5]);

//     expect(AsyncStream.of(1, 2, 3).prepend(5).toArray()).toEqual([5, 1, 2, 3]);

//     sources.forEach((source) => {
//       const arr = [5, ...source.toArray()];
//       expect(source.prepend(5).toArray()).toEqual(arr);
//     });
//   });

//   it('append', () => {
//     expect(AsyncStream.empty<number>().append(5).toArray()).toEqual([5]);

//     expect(AsyncStream.of(1, 2, 3).append(5).toArray()).toEqual([1, 2, 3, 5]);

//     sources.forEach((source) => {
//       const arr = [...source.toArray(), 5];
//       expect(source.append(5).toArray()).toEqual(arr);
//     });
//   });

//   it('forEach', () => {
//     AsyncStream.empty().forEach(() => {
//       expect(true).toBe(false);
//     });
//     AsyncStream.of(1).forEach((v) => {
//       expect(v).toBe(1);
//     });
//     let result = 0;
//     AsyncStream.of(1, 2, 3).forEach((v) => {
//       result += v;
//     });
//     expect(result).toBe(6);
//     result = 0;
//     AsyncStream.of(1, 2, 3).forEach((v, _, halt) => {
//       if (v > 2) return halt();
//       result += v;
//     });
//     expect(result).toBe(3);

//     sources.forEach((source) => {
//       result = 0;
//       source.forEach((v) => {
//         result += v;
//       });
//       expect(result).toBe(4950);
//       result = 0;
//       source.forEach((v, _, halt): void => {
//         if (v > 70) return halt();
//         result += v;
//       });
//       expect(result).toBe(2485);
//       result = 0;
//       source.forEach((v, _, halt) => {
//         if (v > 5) return halt();
//         result += v;
//       });
//       expect(result).toBe(15);
//     });
//   });

//   it('indexed', () => {
//     expect(AsyncStream.empty().indexed()).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).indexed().toArray()).toEqual([[0, 1]]);
//     expect(AsyncStream.of(1, 2, 3).indexed().toArray()).toEqual([
//       [0, 1],
//       [1, 2],
//       [2, 3],
//     ]);
//     expect(AsyncStream.of(1, 2, 3).indexed(5).toArray()).toEqual([
//       [5, 1],
//       [6, 2],
//       [7, 3],
//     ]);
//   });

//   it('map', () => {
//     expect(AsyncStream.empty().map((v) => v)).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .map((v) => v + 1)
//         .toArray()
//     ).toEqual([2, 3, 4]);

//     sources.forEach((source) => {
//       expect(source.map((v) => v).toArray()).toEqual(source.toArray());
//     });
//   });

//   it('flatMap', () => {
//     expect(AsyncStream.empty().flatMap((v) => AsyncStream.of(1))).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1)
//         .flatMap((v) => AsyncStream.empty())
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1)
//         .flatMap((v) => AsyncStream.of(2, 3))
//         .toArray()
//     ).toEqual([2, 3]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .flatMap((v) => AsyncStream.of(v + 1))
//         .toArray()
//     ).toEqual([2, 3, 4]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .flatMap((v, i) => [i + 1])
//         .toArray()
//     ).toEqual([1, 2, 3]);

//     expect(
//       AsyncStream.of(1, 2, 3)
//         .flatMap((v, i) => [v, v])
//         .toArray()
//     ).toEqual([1, 1, 2, 2, 3, 3]);

//     sources.forEach((source) => {
//       expect(source.flatMap((v) => [v]).toArray()).toEqual(source.toArray());
//     });
//   });

//   it('filter', () => {
//     expect(AsyncStream.empty().filter((v) => true)).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .filter((v) => true)
//         .toArray()
//     ).toEqual([1, 2, 3]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .filter((v) => false)
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .filter((v) => v % 2 === 1)
//         .toArray()
//     ).toEqual([1, 3]);

//     sources.forEach((source) => {
//       expect(source.filter((v) => false).toArray()).toEqual([]);
//       expect(source.filter((v) => v % 30 === 0).toArray()).toEqual([
//         0, 30, 60, 90,
//       ]);
//       expect(source.filter((v, i) => i % 30 === 0).toArray()).toEqual([
//         0, 30, 60, 90,
//       ]);
//       expect(
//         source
//           .filter((v) => v % 15 === 0)
//           .filter((v) => v % 20 === 0)
//           .toArray()
//       ).toEqual([0, 60]);
//     });
//   });

//   it('collect', () => {
//     expect(AsyncStream.empty<number>().collect((v) => v + 1)).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1)
//         .collect((v) => v + 1)
//         .toArray()
//     ).toEqual([2]);
//     expect(
//       AsyncStream.of(1)
//         .collect((v, i, skip) => skip)
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .collect((v) => v + 1)
//         .toArray()
//     ).toEqual([2, 3, 4]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .collect((v, i, skip) => (v === 2 ? skip : v))
//         .toArray()
//     ).toEqual([1, 3]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .collect((v, i, skip) => (i === 1 ? skip : v))
//         .toArray()
//     ).toEqual([1, 3]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .collect((v, i, skip, halt) => {
//           if (v === 1) {
//             halt();
//             return v;
//           }
//           return v;
//         })
//         .toArray()
//     ).toEqual([1]);

//     sources.forEach((source) => {
//       expect(
//         source
//           .collect((v, i, skip, halt) => {
//             if (v < 50) return skip;
//             if (v > 55) {
//               halt();
//               return skip;
//             }
//             return v - 50;
//           })
//           .toArray()
//       ).toEqual([0, 1, 2, 3, 4, 5]);
//     });
//   });

//   it('first', () => {
//     expect(AsyncStream.empty<number>().first()).toBeUndefined();
//     expect(AsyncStream.empty<number>().first(1)).toBe(1);
//     expect(AsyncStream.of(1, 2, 3).first()).toBe(1);

//     expect(AsyncStream.range({ start: 0 }).first()).toBe(0);

//     sources.forEach((source) => {
//       const first = source.toArray()[0];
//       expect(source.first()).toBe(first);
//       expect(source.first('a')).toBe(first);
//     });
//   });

//   it('last', () => {
//     expect(AsyncStream.empty<number>().last()).toBeUndefined();
//     expect(AsyncStream.empty<number>().last(1)).toBe(1);
//     expect(AsyncStream.of(1, 2, 3).last()).toBe(3);

//     sources.forEach((source) => {
//       const last = Arr.last(source.toArray());
//       expect(source.last()).toBe(last);
//       expect(source.last('a')).toBe(last);
//     });
//   });

//   it('count', () => {
//     expect(AsyncStream.empty<number>().count()).toBe(0);
//     expect(AsyncStream.of(1, 2, 3).count()).toBe(3);

//     sources.forEach((source) => {
//       expect(source.count()).toEqual(source.toArray().length);
//       expect(source.filter((v) => v % 2 === 0).count()).toEqual(
//         source.toArray().length / 2
//       );
//     });
//   });

//   it('find', () => {
//     expect(AsyncStream.empty().find((v) => false, 1)).toBe(undefined);
//     expect(AsyncStream.empty().find((v) => false, 1, 'a')).toBe('a');
//     expect(AsyncStream.empty().find((v) => true, 1)).toBe(undefined);
//     expect(AsyncStream.empty().find((v) => true, 1, 'a')).toBe('a');
//     expect(AsyncStream.of(1, 2, 3).find((v) => v === 2, 1, 'a')).toBe(2);
//     expect(AsyncStream.of(1, 2, 3).find((v) => v === 10, 1, 'a')).toBe('a');
//     expect(AsyncStream.of(1, 2, 1, 4).find((v) => v > 1, 2, 'a')).toBe(4);

//     sources.forEach((source) => {
//       expect(source.find((v) => v === 70, 1, 'a')).toBe(70);
//       expect(source.find((v) => v === -10, 1, 'a')).toBe('a');
//     });
//   });

//   it('elementAt', () => {
//     expect(AsyncStream.empty().elementAt(0, 'a')).toBe('a');
//     expect(AsyncStream.of(1).elementAt(0, 'a')).toBe(1);
//     expect(AsyncStream.of(1).elementAt(1, 'a')).toBe('a');
//     sources.forEach((source) => {
//       expect(source.elementAt(0, 'a')).toBe(0);
//       expect(source.elementAt(50, 'a')).toBe(50);
//       expect(source.elementAt(99, 'a')).toBe(99);
//       expect(source.elementAt(100, 'a')).toBe('a');
//     });
//   });

//   it('indicesWhere', () => {
//     expect(AsyncStream.empty<number>().indicesWhere((v) => v > 0)).toBe(
//       AsyncStream.empty()
//     );
//     expect(
//       AsyncStream.of(1)
//         .indicesWhere((v) => v > 0)
//         .toArray()
//     ).toEqual([0]);
//     expect(
//       AsyncStream.of(1)
//         .indicesWhere((v) => v < 0)
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 1)
//         .indicesWhere((v) => v < 2)
//         .toArray()
//     ).toEqual([0, 2]);
//     sources.forEach((source) => {
//       expect(source.indicesWhere((v) => v >= 97).toArray()).toEqual([
//         97, 98, 99,
//       ]);
//       expect(source.indicesWhere((v) => v < 0).toArray()).toEqual([]);
//     });
//   });

//   it('indicesOf', () => {
//     expect(AsyncStream.empty<number>().indicesOf(1)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).indicesOf(1).toArray()).toEqual([0]);
//     expect(AsyncStream.of(1).indicesOf(2).toArray()).toEqual([]);
//     expect(AsyncStream.of(1, 2, 1).indicesOf(1).toArray()).toEqual([0, 2]);
//     sources.forEach((source) => {
//       expect(source.indicesOf(50).toArray()).toEqual([50]);
//       expect(source.indicesOf(-1).toArray()).toEqual([]);
//     });
//   });

//   it('indexWhere', () => {
//     expect(AsyncStream.empty<number>().indexWhere((v) => v >= 0)).toBe(undefined);
//     expect(AsyncStream.of(1).indexWhere((v) => v >= 0)).toBe(0);
//     expect(AsyncStream.of(1).indexWhere((v) => v < 0)).toBe(undefined);
//     expect(AsyncStream.of(1).indexWhere((v) => v >= 0, 2)).toBe(undefined);
//     expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v >= 2)).toBe(1);
//     expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v < 0)).toBe(undefined);
//     expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, 2)).toBe(2);
//     expect(AsyncStream.of(1, 2, 1).indexWhere((v) => v < 2, 3)).toBe(undefined);
//     sources.forEach((source) => {
//       expect(source.indexWhere((v) => v >= 50)).toEqual(50);
//       expect(source.indexWhere((v) => v >= 50, 10)).toEqual(59);
//       expect(source.indexWhere((v) => v < 0)).toEqual(undefined);
//     });
//   });

//   it('indexOf', () => {
//     expect(AsyncStream.empty<number>().indexOf(1)).toBe(undefined);
//     expect(AsyncStream.of(1).indexOf(1)).toBe(0);
//     expect(AsyncStream.of(1).indexOf(2)).toBe(undefined);
//     expect(AsyncStream.of(1).indexOf(1, 2)).toBe(undefined);
//     expect(AsyncStream.of(1, 2, 1).indexOf(2)).toBe(1);
//     expect(AsyncStream.of(1, 2, 1).indexOf(3)).toBe(undefined);
//     expect(AsyncStream.of(1, 2, 1).indexOf(1, 2)).toBe(2);
//     expect(AsyncStream.of(1, 2, 1).indexOf(1, 3)).toBe(undefined);
//     sources.forEach((source) => {
//       expect(source.indexOf(50)).toEqual(50);
//       expect(source.indexOf(50, 2)).toEqual(undefined);
//       expect(source.indexOf(-1)).toEqual(undefined);
//     });
//   });

//   it('some', () => {
//     expect(AsyncStream.empty().some((v) => true)).toBe(false);
//     expect(AsyncStream.empty().some((v) => false)).toBe(false);
//     expect(AsyncStream.of(1, 2, 3).some((v) => v === 2)).toBe(true);
//     expect(AsyncStream.of(1, 2, 3).some((v) => v === 10)).toBe(false);
//     sources.forEach((source) => {
//       expect(source.some((v) => v === 50)).toBe(true);
//       expect(source.some((v) => v === -50)).toBe(false);
//       expect(source.some((v, i) => i === 50)).toBe(true);
//       expect(source.some((v, i) => i === -50)).toBe(false);
//     });
//   });

//   it('every', () => {
//     expect(AsyncStream.empty().every(() => true)).toBe(true);
//     expect(AsyncStream.empty().every(() => false)).toBe(true);
//     expect(AsyncStream.of(1, 2, 3).every((v) => v > 0)).toBe(true);
//     expect(AsyncStream.of(1, 2, 3).every((v) => v < 3)).toBe(false);
//     expect(AsyncStream.of(1, 2, 3).every((v, i) => i >= 0)).toBe(true);
//     expect(AsyncStream.of(1, 2, 3).every((v, i) => i < 2)).toBe(false);
//     sources.forEach((source) => {
//       expect(source.every((v) => v < 50)).toBe(false);
//       expect(source.every((v) => v >= 0)).toBe(true);
//       expect(source.every((v, i) => i < 50)).toBe(false);
//       expect(source.every((v, i) => i >= 0)).toBe(true);
//     });
//   });

//   it('contains', () => {
//     expect(AsyncStream.empty().contains(1)).toBe(false);
//     expect(AsyncStream.of(1).contains(1)).toBe(true);
//     expect(AsyncStream.of(1).contains(1, 2)).toBe(false);
//     expect(AsyncStream.of(1).contains(1, 0)).toBe(true);
//     expect(AsyncStream.of(1).contains(2)).toBe(false);
//     expect(AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 2)).toBe(true);
//     expect(AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 3)).toBe(true);
//     expect(AsyncStream.of(1, 2, 1, 2, 1, 2).contains(2, 4)).toBe(false);
//     sources.forEach((source) => {
//       expect(source.contains(50)).toBe(true);
//       expect(source.contains(50, 2)).toBe(false);
//       expect(source.contains(-50)).toBe(false);
//       expect(source.contains(-50, 2)).toBe(false);
//     });
//   });

//   it('takeWhile', () => {
//     expect(AsyncStream.empty().takeWhile((v) => true)).toBe(AsyncStream.empty());
//     expect(AsyncStream.empty().takeWhile((v) => false)).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1)
//         .takeWhile((v) => true)
//         .toArray()
//     ).toEqual([1]);
//     expect(
//       AsyncStream.of(1)
//         .takeWhile((v) => false)
//         .toArray()
//     ).toEqual([]);

//     sources.forEach((source) => {
//       expect(source.takeWhile((v) => false).toArray()).toEqual([]);
//       expect(source.takeWhile((v) => v < 3).toArray()).toEqual([0, 1, 2]);
//     });
//   });

//   it('dropWhile', () => {
//     expect(AsyncStream.empty().dropWhile((v) => true)).toBe(AsyncStream.empty());
//     expect(AsyncStream.empty().dropWhile((v) => false)).toBe(AsyncStream.empty());
//     expect(
//       AsyncStream.of(1)
//         .dropWhile((v) => true)
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1)
//         .dropWhile((v) => false)
//         .toArray()
//     ).toEqual([1]);
//     sources.forEach((source) => {
//       expect(source.dropWhile((v) => true).toArray()).toEqual([]);
//       expect(source.dropWhile((v) => v < 97).toArray()).toEqual([97, 98, 99]);
//       expect(source.dropWhile((v, i) => i < 97).toArray()).toEqual([
//         97, 98, 99,
//       ]);
//     });
//   });

//   it('take', () => {
//     expect(AsyncStream.empty().take(1)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).take(0)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).take(10).toArray()).toEqual([1]);
//     const e = AsyncStream.of(1, 2, 3);
//     expect(e.take(10)).toBe(e);
//     expect(AsyncStream.of(1, 2, 3).take(2).toArray()).toEqual([1, 2]);
//     sources.forEach((source) => {
//       expect(source.take(3).toArray()).toEqual([0, 1, 2]);
//     });
//   });

//   it('drop', () => {
//     expect(AsyncStream.empty().drop(1)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).drop(1)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).drop(10)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1, 2, 3).drop(10)).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1, 2, 3).drop(1).toArray()).toEqual([2, 3]);
//     sources.forEach((source) => {
//       expect(source.drop(97).toArray()).toEqual([97, 98, 99]);
//     });
//   });

//   it('repeat', () => {
//     const nonStandardEmpty = AsyncStream.range({ amount: -1 });
//     expect(AsyncStream.empty().repeat(10)).toBe(AsyncStream.empty());
//     expect(nonStandardEmpty.repeat(10).first('a')).toBe('a');
//     const one = AsyncStream.of(1);
//     expect(one.repeat(1)).toBe(one);
//     expect(one.repeat(0)).toBe(one);
//     expect(one.repeat(3).toArray()).toEqual([1, 1, 1]);
//     expect(AsyncStream.of(1, 2, 3).repeat(2).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
//     sources.forEach((source) => {
//       expect(source.repeat(0)).toBe(source);
//       expect(source.repeat(2).toArray()).toEqual(
//         source.toArray().concat(source.toArray())
//       );
//     });
//   });

//   it('concat', () => {
//     const e = AsyncStream.empty<number>();
//     const ne = AsyncStream.of(1, 2, 3);
//     expect(e.concat(e)).toBe(e);
//     expect(e.concat(ne)).toBe(ne);
//     expect(ne.concat(e)).toBe(ne);
//     isNonEmpty(ne);
//     isNonEmpty(e.concat(ne));
//     isNonEmpty(ne.concat(e));
//     isNonEmpty(ne.concat(ne));
//     expect(e.concat(e).toArray()).toEqual([]);
//     expect(e.concat(ne).toArray()).toEqual([1, 2, 3]);
//     expect(ne.concat(e).toArray()).toEqual([1, 2, 3]);
//     expect(ne.concat(ne).toArray()).toEqual([1, 2, 3, 1, 2, 3]);
//     expect(ne.concat(ne).concat(ne).toArray()).toEqual([
//       1, 2, 3, 1, 2, 3, 1, 2, 3,
//     ]);
//     expect([...ne.concat(ne).concat(ne)]).toEqual([1, 2, 3, 1, 2, 3, 1, 2, 3]);

//     sources.forEach((source) => {
//       const arr = source.toArray();
//       expect(source.concat(source).toArray()).toEqual(arr.concat(arr));
//     });
//   });

//   it('min', () => {
//     expect(AsyncStream.empty().min(undefined)).toBe(undefined);
//     expect(AsyncStream.of(1).min()).toBe(1);
//     expect(AsyncStream.of(1, -10, 5).min()).toBe(-10);

//     sources.forEach((source) => {
//       expect(source.min(undefined)).toBe(0);
//     });
//   });

//   it('minBy', () => {
//     function comp(s1: string, s2: string) {
//       return s1.length - s2.length;
//     }

//     expect(AsyncStream.empty<string>().minBy(comp)).toBe(undefined);
//     expect(AsyncStream.empty<string>().minBy(comp, 1)).toBe(1);
//     expect(AsyncStream.of('a').minBy(comp)).toBe('a');
//     expect(AsyncStream.of('ab', 'c', 'def').minBy(comp)).toBe('c');
//   });

//   it('max', () => {
//     expect(AsyncStream.empty().max(undefined)).toBe(undefined);
//     expect(AsyncStream.of(1).max()).toBe(1);
//     expect(AsyncStream.of(1, 10, 5).max()).toBe(10);

//     sources.forEach((source) => {
//       expect(source.max(undefined)).toBe(99);
//     });
//   });

//   it('maxBy', () => {
//     function comp(s1: string, s2: string) {
//       return s1.length - s2.length;
//     }

//     expect(AsyncStream.empty<string>().maxBy(comp)).toBe(undefined);
//     expect(AsyncStream.empty<string>().maxBy(comp, 1)).toBe(1);
//     expect(AsyncStream.of('a').maxBy(comp)).toBe('a');
//     expect(AsyncStream.of('ab', 'c', 'def').maxBy(comp)).toBe('def');
//   });

//   it('intersperse', () => {
//     expect(AsyncStream.empty().intersperse([1])).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).intersperse([0]).toArray()).toEqual([1]);
//     expect(AsyncStream.of(1, 2, 3).intersperse([0]).toArray()).toEqual([
//       1, 0, 2, 0, 3,
//     ]);
//     expect(AsyncStream.of(1, 2, 3).intersperse([0, 10]).toArray()).toEqual([
//       1, 0, 10, 2, 0, 10, 3,
//     ]);
//     expect(AsyncStream.of(1, 2, 3).intersperse([]).toArray()).toEqual([1, 2, 3]);
//   });

//   it('join', () => {
//     expect(AsyncStream.empty().join()).toBe('');
//     expect(AsyncStream.empty().join({ start: '<', end: '>', sep: '-' })).toBe('<>');
//     expect(AsyncStream.of(1).join({ start: '<', end: '>', sep: '-' })).toBe('<1>');
//     expect(AsyncStream.of(1, 2, 3).join({ start: '<', end: '>', sep: '-' })).toBe(
//       '<1-2-3>'
//     );
//     expect(AsyncStream.of(1, 2, 3).join()).toBe('123');
//   });

//   it('mkGroup', () => {
//     expect(
//       AsyncStream.empty()
//         .mkGroup({ start: [-1], end: [-2], sep: [-3] })
//         .toArray()
//     ).toEqual([-1, -2]);
//     expect(AsyncStream.of(1).mkGroup({}).toArray()).toEqual([1]);
//     expect(
//       AsyncStream.of(1)
//         .mkGroup({ start: [-1], end: [-2], sep: [-3] })
//         .toArray()
//     ).toEqual([-1, 1, -2]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .mkGroup({ start: [-1], end: [-2], sep: [-3] })
//         .toArray()
//     ).toEqual([-1, 1, -3, 2, -3, 3, -2]);
//   });

//   it('splitWhere', () => {
//     function isEven(v: number) {
//       return v % 2 === 0;
//     }

//     expect(AsyncStream.empty<number>().splitWhere(isEven).toArray()).toEqual([]);

//     expect(AsyncStream.of(1, 3, 5).splitWhere(isEven).toArray()).toEqual([
//       [1, 3, 5],
//     ]);

//     expect(AsyncStream.of(1, 2, 5).splitWhere(isEven).toArray()).toEqual([[1], [5]]);

//     expect(AsyncStream.of(2, 2, 5).splitWhere(isEven).toArray()).toEqual([
//       [],
//       [],
//       [5],
//     ]);

//     expect(AsyncStream.of(2, 5, 2).splitWhere(isEven).toArray()).toEqual([[], [5]]);

//     expect(AsyncStream.of(2, 2, 2).splitWhere(isEven).toArray()).toEqual([
//       [],
//       [],
//       [],
//     ]);
//   });

//   it('splitOn', () => {
//     expect(AsyncStream.empty<number>().splitOn(2).toArray()).toEqual([]);

//     expect(AsyncStream.of(1, 3, 5).splitOn(2).toArray()).toEqual([[1, 3, 5]]);

//     expect(AsyncStream.of(1, 2, 5).splitOn(2).toArray()).toEqual([[1], [5]]);

//     expect(AsyncStream.of(2, 2, 5).splitOn(2).toArray()).toEqual([[], [], [5]]);

//     expect(AsyncStream.of(2, 5, 2).splitOn(2).toArray()).toEqual([[], [5]]);

//     expect(AsyncStream.of(2, 2, 2).splitOn(2).toArray()).toEqual([[], [], []]);
//   });

//   it('fold', () => {
//     function sum(
//       current: number,
//       value: number,
//       index: number,
//       halt: () => void
//     ) {
//       if (value > 10) {
//         halt();
//         return current;
//       }
//       return current + value;
//     }
//     expect(AsyncStream.empty<number>().fold(0, sum)).toBe(0);
//     expect(AsyncStream.of(1, 2, 3).fold(0, sum)).toBe(6);
//     expect(AsyncStream.of(1, 20, 3).fold(0, sum)).toBe(1);
//   });

//   it('foldStream', () => {
//     function sum(
//       current: number,
//       value: number,
//       index: number,
//       halt: () => void
//     ) {
//       if (value > 10) {
//         halt();
//         return current;
//       }
//       return current + value;
//     }
//     expect(AsyncStream.empty<number>().foldStream(0, sum).toArray()).toEqual([]);
//     expect(AsyncStream.of(1, 2, 3).foldStream(0, sum).toArray()).toEqual([1, 3, 6]);
//     expect(AsyncStream.of(1, 20, 3).foldStream(0, sum).toArray()).toEqual([1, 1]);
//   });

//   it('reduce', () => {
//     expect(AsyncStream.empty<number>().reduce(Reducer.sum)).toBe(0);
//     expect(AsyncStream.of(1, 2, 3).reduce(Reducer.sum)).toBe(6);
//   });

//   it('reduceStream', () => {
//     expect(AsyncStream.empty<number>().reduceStream(Reducer.sum).toArray()).toEqual(
//       []
//     );
//     expect(AsyncStream.of(1, 2, 3).reduceStream(Reducer.sum).toArray()).toEqual([
//       1, 3, 6,
//     ]);
//   });

//   it('reduceAll', () => {
//     expect(
//       AsyncStream.empty<number>().reduceAll(Reducer.sum, Reducer.count())
//     ).toEqual([0, 0]);
//     expect(AsyncStream.of(1, 2, 3).reduceAll(Reducer.sum, Reducer.count())).toEqual([
//       6, 3,
//     ]);

//     expect(
//       AsyncStream.range({ start: 0 }).reduceAll(
//         Reducer.first<number>(),
//         Reducer.first<number>()
//       )
//     ).toEqual([0, 0]);
//   });

//   it('reduceAllStream', () => {
//     expect(
//       AsyncStream.empty<number>()
//         .reduceAllStream(Reducer.sum, Reducer.count())
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3).reduceAllStream(Reducer.sum, Reducer.count()).toArray()
//     ).toEqual([
//       [1, 1],
//       [3, 2],
//       [6, 3],
//     ]);
//   });

//   it('toArray', () => {
//     expect(AsyncStream.empty().toArray()).toEqual([]);
//     expect(AsyncStream.of(1).toArray()).toEqual([1]);
//     expect(AsyncStream.from([1, 2, 3]).toArray()).toEqual([1, 2, 3]);
//     const a1 = streamRange1.toArray();

//     sources.forEach((source) => {
//       expect(source.toArray()).toEqual(a1);
//     });
//   });

//   it('toString', () => {
//     expect(AsyncStream.empty<string>().toString()).toBe('Stream(<empty>)');
//     expect(AsyncStream.of(1).toString()).toBe('Stream(...<potentially empty>)');
//   });

//   it('zipWith', () => {
//     expect(
//       AsyncStream.empty<number>()
//         .zipWith((a, b) => a + b, [])
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipWith((a, b) => a + b, [])
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.empty<number>()
//         .zipWith((a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipWith((a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([2, 4, 6]);
//     expect(
//       AsyncStream.of(1)
//         .zipWith((a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([2]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipWith((a, b) => a + b, [1])
//         .toArray()
//     ).toEqual([2]);
//   });

//   it('zip', () => {
//     expect(AsyncStream.empty().zip(AsyncStream.empty())).toBe(AsyncStream.empty());
//     expect(AsyncStream.empty().zip(AsyncStream.of(1))).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).zip(AsyncStream.empty())).toBe(AsyncStream.empty());
//     expect(AsyncStream.of(1).zip(AsyncStream.of(2)).toArray()).toEqual([[1, 2]]);
//     expect(AsyncStream.of(1, 2, 3).zip(AsyncStream.of(2)).toArray()).toEqual([[1, 2]]);
//     expect(AsyncStream.of(1).zip(AsyncStream.of(2, 3, 4)).toArray()).toEqual([[1, 2]]);
//     expect(
//       AsyncStream.of(1, 2, 3, 4, 5)
//         .zip(AsyncStream.of(2, 3, 4), AsyncStream.of(3, 4, 5, 6))
//         .toArray()
//     ).toEqual([
//       [1, 2, 3],
//       [2, 3, 4],
//       [3, 4, 5],
//     ]);
//     sources.forEach((source) => {
//       expect(source.zip(source).toArray()).toEqual(
//         source.map((v) => [v, v]).toArray()
//       );
//     });
//     const ne = AsyncStream.of(1);
//     isNonEmpty(ne.zip(ne));
//     isNonEmpty(ne.zip(ne, ne, ne));
//   });

//   it('zipAllWith', () => {
//     expect(
//       AsyncStream.empty<number>()
//         .zipAllWith(10, (a, b) => a + b, [])
//         .toArray()
//     ).toEqual([]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipAllWith(10, (a, b) => a + b, [])
//         .toArray()
//     ).toEqual([11, 12, 13]);
//     expect(
//       AsyncStream.empty<number>()
//         .zipAllWith(10, (a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([11, 12, 13]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipAllWith(10, (a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([2, 4, 6]);
//     expect(
//       AsyncStream.of(1)
//         .zipAllWith(10, (a, b) => a + b, [1, 2, 3])
//         .toArray()
//     ).toEqual([2, 12, 13]);
//     expect(
//       AsyncStream.of(1, 2, 3)
//         .zipAllWith(10, (a, b) => a + b, [1])
//         .toArray()
//     ).toEqual([2, 12, 13]);
//   });

//   it('zipAll', () => {
//     expect(AsyncStream.empty().zipAll(undefined, AsyncStream.empty()).toArray()).toEqual(
//       []
//     );
//     expect(AsyncStream.of(1).zipAll(undefined, AsyncStream.empty()).toArray()).toEqual([
//       [1, undefined],
//     ]);
//     expect(AsyncStream.empty().zipAll(undefined, AsyncStream.of(1)).toArray()).toEqual([
//       [undefined, 1],
//     ]);
//     expect(AsyncStream.of(1).zipAll(undefined, AsyncStream.of(2)).toArray()).toEqual([
//       [1, 2],
//     ]);
//     expect(
//       AsyncStream.of(1, 2, 3).zipAll(undefined, AsyncStream.of(10, 11)).toArray()
//     ).toEqual([
//       [1, 10],
//       [2, 11],
//       [3, undefined],
//     ]);
//   });

//   it('unzip', () => {
//     const [u1l, u1r] = AsyncStream.empty<[number, string]>().unzip(2);
//     expect(u1l.toArray()).toEqual([]);
//     expect(u1r.toArray()).toEqual([]);

//     const [u2l, u2r] = AsyncStream.of<[number, string]>([1, 'a'], [2, 'b']).unzip(2);
//     expect(u2l.toArray()).toEqual([1, 2]);
//     expect(u2r.toArray()).toEqual(['a', 'b']);
//   });
// });
