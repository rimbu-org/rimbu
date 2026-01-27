import { describe, it, expect } from 'bun:test';
import { Update } from '../src/update.mjs';

describe('Update', () => {
  it('updates', () => {
    expect(Update(5, 6)).toBe(6);
    expect(Update(5, () => 6)).toBe(6);
  });
});
