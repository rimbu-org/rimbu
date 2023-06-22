import { TraverseState } from '../src/index.mjs';

describe('TraverseState', () => {
  it('default', () => {
    const t = TraverseState();
    expect(t.halted).toBe(false);
    expect(t.currentIndex).toBe(0);
  });

  it('halt', () => {
    const t = TraverseState();
    t.halt();
    expect(t.halted).toBe(true);
    expect(t.currentIndex).toBe(0);
  });

  it('nextIndex', () => {
    const t = TraverseState();
    expect(t.nextIndex()).toBe(0);
    expect(t.halted).toBe(false);
    expect(t.currentIndex).toBe(1);
  });

  it('nextIndex 2', () => {
    const t = TraverseState(10);
    expect(t.nextIndex()).toBe(10);
    expect(t.halted).toBe(false);
    expect(t.currentIndex).toBe(11);
  });

  it('reset', () => {
    const t = TraverseState(10);
    t.halt();
    t.nextIndex();
    t.reset();

    expect(t.currentIndex).toBe(10);
    expect(t.halted).toBe(false);
  });
});
