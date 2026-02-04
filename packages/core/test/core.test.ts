import { describe, expect, it } from 'bun:test';

import { List } from '@rimbu/core';
import { List as ListOriginal } from '@rimbu/list';

describe('Core package', () => {
	it('exports correctly', async () => {
		expect(List).toBe(ListOriginal);
	});
});
