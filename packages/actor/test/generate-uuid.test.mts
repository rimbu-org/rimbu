import { generateUUID } from '../src/main/generate-uuid.mjs';

describe('generateUUID', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates UUID with crypto if crypto is defined in context', () => {
    const spyNow = vi.spyOn(performance, 'now');
    const randomUUID = vi.fn().mockReturnValue('abc');
    const context = {
      crypto: {
        randomUUID,
      },
    };

    expect(generateUUID(context)).toBe('abc');
    expect(randomUUID).toBeCalledTimes(1);
    expect(spyNow).not.toBeCalled();
  });

  it('generated UUID without crypto if crypto is not defined', () => {
    const spyNow = vi.spyOn(performance, 'now');
    expect(generateUUID({}).length).toBe(36);
    expect(spyNow).toBeCalledTimes(1);
  });
});
