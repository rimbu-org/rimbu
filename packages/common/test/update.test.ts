import { describe, expect, it } from 'bun:test';

import { Update } from '@rimbu/common/update';

describe('Update', () => {
	it('updates', () => {
		expect(Update(5, 6)).toBe(6);
		expect(Update(5, () => 6)).toBe(6);
	});
});
