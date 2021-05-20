import { Err } from '../src';

describe('Err', () => {
  it('throws error', () => {
    expect(() => Err()).toThrow(Err.ForcedError);
  });

  it('throws error', () => {
    expect(() => Err.msg('test')()).toThrow(Err.ForcedError);
  });

  it('has name', () => {
    const msg = 'abc';
    const e = new Err.ForcedError(msg);
    expect(e.message).toBe(msg);
    expect(e.name).toBe('ForcedError');
  });
});
