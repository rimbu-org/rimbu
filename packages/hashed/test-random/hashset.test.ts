import { runSetRandomTestsWith } from '@rimbu/collection-types/test-utils/set/set-random';
// import { Eq } from '@rimbu/common';
import { HashSet } from '@rimbu/hashed';

// runSetRandomTestsWith('HashSet default', HashSet.defaultContext());

runSetRandomTestsWith('HashSet 2', HashSet.createContext({ blockSizeBits: 2 }));

// runSetRandomTestsWith('HashSet 3', HashSet.createContext({ blockSizeBits: 3 }));

// describe('HashSet collision', () => {
//   const ColHashSet = HashSet.createContext({ eq: Eq.objectIs });

//   it('add', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.of(v1);
//     expect(m.add(v2).size).toBe(2);
//   });

//   it('has', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.of(v1, v2);
//     expect(m.has(v1)).toBe(true);
//     expect(m.has(v2)).toBe(true);
//   });

//   it('remove', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.of(v1, v2);
//     expect(m.remove(v1).size).toBe(1);
//     expect(m.remove(v2).size).toBe(1);
//     expect(m.remove(v1).has(v1)).toBe(false);
//     expect(m.remove(v1).has(v2)).toBe(true);
//   });
// });

// describe('HashSet.Builder collision', () => {
//   const ColHashSet = HashSet.createContext({ eq: Eq.objectIs });

//   it('add', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.builder();
//     m.add(v1);
//     m.add(v2);
//     expect(m.size).toBe(2);
//   });

//   it('has', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.builder();
//     m.add(v1);
//     m.add(v2);
//     expect(m.has(v1)).toBe(true);
//     expect(m.has(v2)).toBe(true);
//   });

//   it('remove', () => {
//     const v1 = {};
//     const v2 = {};
//     const m = ColHashSet.of(v1, v2);
//     {
//       const b = m.toBuilder();
//       expect(b.remove(1)).toBe(false);
//       expect(b.remove(v1)).toBe(true);
//       expect(b.size).toBe(1);
//       expect(b.has(v1)).toBe(false);
//       expect(b.has(v2)).toBe(true);
//     }

//     {
//       const b = m.toBuilder();
//       expect(b.remove(v2)).toBe(true);
//       expect(b.size).toBe(1);
//       expect(b.has(v1)).toBe(true);
//       expect(b.has(v2)).toBe(false);
//     }
//   });
// });
