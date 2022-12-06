import { generateUUID } from '../src/generate-uuid';

describe('generateUUID', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('generates UUID with crypto if crypto is defined in window', () => {
    const spyMathRandom = jest.spyOn(Math, 'random');
    const randomUUID = jest.fn().mockReturnValue('abc');

    const preWindow = global.window;

    (global as any).window = {
      crypto: {
        randomUUID,
      },
    };

    expect(generateUUID()).toBe('abc');
    expect(randomUUID).toBeCalledTimes(1);
    expect(spyMathRandom).not.toBeCalled();

    global.window = preWindow;
  });

  it('generates UUID with crypto if crypto is defined in global', () => {
    const spyRandomUUID = jest.spyOn(Math, 'random');
    const randomUUID = jest.fn().mockReturnValue('abc');

    const preGlobalCrypto = global.crypto;
    const preGlobalWindow = global.window;

    (global as any).window = undefined;

    global.crypto = {
      randomUUID,
    } as any;

    expect(generateUUID()).toBe('abc');
    expect(randomUUID).toBeCalledTimes(1);
    expect(spyRandomUUID).not.toBeCalled();

    global.crypto = preGlobalCrypto;
    global.window = preGlobalWindow;
  });

  it('generated UUID without crypto if crypto is not defined', () => {
    const spyRandomUUID = jest.spyOn(Math, 'random');

    const preGlobalCrypto = global.crypto;
    const preGlobalWindow = global.window;

    (global as any).window = undefined;

    global.crypto = undefined as any;

    expect(generateUUID().length).toBe(36);
    expect(spyRandomUUID).not.toBeCalledTimes(0);

    global.crypto = preGlobalCrypto;
    global.window = preGlobalWindow;
  });
});
