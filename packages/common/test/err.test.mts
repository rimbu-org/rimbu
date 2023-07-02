import { Err, ErrBase } from '../src/index.mjs';

describe('Err/Base', () => {
  it('throws error', () => {
    expect(() => Err()).toThrow(ErrBase.ForcedError);
  });

  it('throws error', () => {
    expect(() => ErrBase.msg('test')()).toThrow(ErrBase.ForcedError);
  });

  it('has name', () => {
    const msg = 'abc';
    const e = new ErrBase.ForcedError(msg);
    expect(e.message).toBe(msg);
    expect(e.name).toBe('ForcedError');
  });
});
