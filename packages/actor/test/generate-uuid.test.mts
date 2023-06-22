import { generateUUID } from '../src/main/generate-uuid';

describe('generateUUID', () => {
  beforeEach(() => {
    window.crypto = undefined as any;
    global.crypto = undefined as any;
    jest.resetAllMocks();
  });

  it('generates UUID with crypto if crypto is defined in window', () => {
    const spyNow = jest.spyOn(performance, 'now');
    const randomUUID = jest.fn().mockReturnValue('abc');
    window.crypto = {
      randomUUID,
    } as any;

    expect(generateUUID()).toBe('abc');
    expect(randomUUID).toBeCalledTimes(1);
    expect(spyNow).not.toBeCalled();
  });

  it('generates UUID with crypto if crypto is defined in global', () => {
    const spyNow = jest.spyOn(performance, 'now');
    const randomUUID = jest.fn().mockReturnValue('abc');
    global.crypto = {
      randomUUID,
    } as any;

    expect(generateUUID()).toBe('abc');
    expect(randomUUID).toBeCalledTimes(1);
    expect(spyNow).not.toBeCalled();
  });

  it('generated UUID without crypto if crypto is not defined', () => {
    const spyNow = jest.spyOn(performance, 'now');
    expect(generateUUID().length).toBe(36);
    expect(spyNow).toBeCalledTimes(1);
  });
});
