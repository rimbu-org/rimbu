import { compile } from '../src/compile.mjs';

describe('compile', () => {
  it('matches empty input for empty tree', () => {
    const match = compile<string>([]);
    expect(match('')).toBe(true);
    expect(match('a')).toBe(false);
  });

  it('matches single input', () => {
    const match = compile<string>(['a']);
    expect(match('')).toBe(false);
    expect(match('a')).toBe(true);
    expect(match('b')).toBe(false);
  });

  it('matches seq inputs', () => {
    const match = compile<string>(['a', 'b']);
    expect(match('')).toBe(false);
    expect(match('ab')).toBe(true);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('abc')).toBe(false);
    expect(match('ad')).toBe(false);
    expect(match('bb')).toBe(false);
  });

  it('matches or inputs', () => {
    const match = compile<string>({ _or: ['a', 'b', 'c'] });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(true);
    expect(match('b')).toBe(true);
    expect(match('c')).toBe(true);
    expect(match('d')).toBe(false);
    expect(match('ab')).toBe(false);
  });

  it('matches simple repeat', () => {
    const match = compile<string>({ _repeat: ['a'] });
    expect(match('')).toBe(true);
    expect(match('a')).toBe(true);
    expect(match('aa')).toBe(true);
    expect(match('aaa')).toBe(true);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aaab')).toBe(false);
  });

  it('matches simple repeat seq', () => {
    const match = compile<string>({ _repeat: ['a', 'b'] });
    expect(match('')).toBe(true);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(true);
    expect(match('ac')).toBe(false);
    expect(match('bb')).toBe(false);
    expect(match('aba')).toBe(false);
    expect(match('abab')).toBe(true);
    expect(match('abababababab')).toBe(true);
  });

  it('matches exact repeat', () => {
    const match = compile<string>({ _repeat: ['a'], min: 2, max: 2 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('aa')).toBe(true);
    expect(match('aaa')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
  });

  it('matches exact repeat seq', () => {
    const match = compile<string>({ _repeat: ['a', 'b'], min: 2, max: 2 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aa')).toBe(false);
    expect(match('bb')).toBe(false);
    expect(match('aba')).toBe(false);
    expect(match('abab')).toBe(true);
    expect(match('abababababab')).toBe(false);
  });

  it('matches max repeat', () => {
    const match = compile<string>({ _repeat: ['a'], max: 3 });
    expect(match('')).toBe(true);
    expect(match('a')).toBe(true);
    expect(match('aa')).toBe(true);
    expect(match('aaa')).toBe(true);
    expect(match('aaaa')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aaab')).toBe(false);
  });

  it('matches max repeat seq', () => {
    const match = compile<string>({ _repeat: ['a', 'b'], max: 3 });
    expect(match('')).toBe(true);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(true);
    expect(match('aa')).toBe(false);
    expect(match('bb')).toBe(false);
    expect(match('aba')).toBe(false);
    expect(match('abab')).toBe(true);
    expect(match('ababab')).toBe(true);
    expect(match('abababab')).toBe(false);
  });

  it('matches min repeat', () => {
    const match = compile<string>({ _repeat: ['a'], min: 2 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('aa')).toBe(true);
    expect(match('aaa')).toBe(true);
    expect(match('aaaa')).toBe(true);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aaab')).toBe(false);
  });

  it('matches min repeat seq', () => {
    const match = compile<string>({ _repeat: ['a', 'b'], min: 2 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aa')).toBe(false);
    expect(match('bb')).toBe(false);
    expect(match('aba')).toBe(false);
    expect(match('abab')).toBe(true);
    expect(match('ababab')).toBe(true);
    expect(match('abababab')).toBe(true);
  });

  it('matches min and max repeat', () => {
    const match = compile<string>({ _repeat: ['a'], min: 2, max: 4 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('aa')).toBe(true);
    expect(match('aaa')).toBe(true);
    expect(match('aaaa')).toBe(true);
    expect(match('aaaaa')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aaab')).toBe(false);
  });

  it.only('matches min and max repeat seq', () => {
    const match = compile<string>({ _repeat: ['a', 'b'], min: 2, max: 4 });
    expect(match('')).toBe(false);
    expect(match('a')).toBe(false);
    expect(match('b')).toBe(false);
    expect(match('ab')).toBe(false);
    expect(match('aa')).toBe(false);
    expect(match('bb')).toBe(false);
    expect(match('aba')).toBe(false);
    expect(match('abab')).toBe(true);
    expect(match('ababab')).toBe(true);
    expect(match('abababab')).toBe(true);
    expect(match('ababababab')).toBe(false);
  });
});
