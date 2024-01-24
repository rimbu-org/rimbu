import { generateUUID } from '../src/main/generate-uuid.mjs';

describe('generateUUID', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates UUID with crypto if crypto is defined in context', () => {
    const mockGenerateRandomUUID = vi.fn();
    const mockPerformanceNow = vi.fn();

    const context = {
      crypto: { randomUUID: mockGenerateRandomUUID.mockReturnValue('abc') },
      performance: {
        now: mockPerformanceNow,
      },
    };

    expect(generateUUID(context)).toBe('abc');
    expect(mockGenerateRandomUUID).toBeCalledTimes(1);
    expect(mockPerformanceNow).not.toBeCalled();
  });

  it('generates UUID without crypto but with performance now if crypto is not defined', () => {
    const mockPerformanceNow = vi.fn().mockReturnValue(2521256);
    const context = { performance: { now: mockPerformanceNow } };

    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023/01/01'));
    expect(generateUUID(context)).toBe('80151e2e-d098-4c8d-bce1-888888888888');
    expect(mockPerformanceNow).toBeCalledTimes(1);
  });

  it('generates UUID if both crypto and performance not defined', () => {
    const context = {};
    const spyMathRandom = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023/01/01'));
    expect(generateUUID(context)).toBe('80151e2e-d098-4888-8888-888888888888');
    expect(spyMathRandom).toBeCalledTimes(31);
  });
});
