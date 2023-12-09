import { HashMap } from '../src/main/index.mjs';

describe('HashMap issues fixed by PRs', () => {
  it('issue #186: HashMap "forgets" about colliding keys, unlike HashSet', () => {
    const hm = HashMap.from([
      [[6, 29], 'a'],
      [[2, 91], 'b'],
    ]);
    expect(hm.hasKey([6, 29])).toBe(true);
    expect(hm.hasKey([2, 91])).toBe(true);
    expect(hm.get([6, 29])).toBe('a');
    expect(hm.modifyAt([6, 29], { ifExists: () => 'g' }).get([6, 29])).toBe(
      'g'
    );
    expect(hm.removeKey([6, 29]).size).toBe(1);

    const hm2 = HashMap.from([
      [[6, 30], 'a'],
      [[2, 91], 'b'],
    ]);
    expect(hm2.hasKey([6, 30])).toBe(true);
    expect(hm2.hasKey([2, 91])).toBe(true);
    expect(hm2.get([6, 30])).toBe('a');
    expect(hm2.modifyAt([6, 30], { ifExists: () => 'g' }).get([6, 30])).toBe(
      'g'
    );
    expect(hm2.removeKey([6, 30]).size).toBe(1);

    const hm3 = HashMap.from([
      [[6, 29], 'c'],
      [[2, 91], 'd'],
    ]);
    expect(hm3.hasKey([6, 29])).toBe(true);
    expect(hm3.hasKey([2, 91])).toBe(true);
    expect(hm3.get([6, 29])).toBe('c');
    expect(hm3.modifyAt([6, 29], { ifExists: () => 'g' }).get([6, 29])).toBe(
      'g'
    );
    expect(hm3.removeKey([6, 29]).size).toBe(1);
  });

  it('issue #186 for builder: HashMap "forgets" about colliding keys, unlike HashSet', () => {
    const hm = HashMap.builder<[number, number], string>();
    hm.addEntries([
      [[6, 29], 'a'],
      [[2, 91], 'b'],
    ]);
    expect(hm.hasKey([6, 29])).toBe(true);
    expect(hm.hasKey([2, 91])).toBe(true);
    expect(hm.get([6, 29])).toBe('a');

    hm.modifyAt([6, 29], { ifExists: () => 'g' });
    expect(hm.get([6, 29])).toBe('g');
    hm.removeKey([6, 29]);

    expect(hm.size).toBe(1);
  });
});
