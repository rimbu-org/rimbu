import { describe, expect, it } from 'bun:test';

import type { ListCommon } from '@rimbu/list/internal/immutable/utils';

import { List } from '@rimbu/list2';
import { Stream } from '@rimbu/stream';

describe('List Structure', () => {
	it('appending results in valid structure', () => {
		let list = List.empty<number>();

		for (let i = 0; i < 20000; i++) {
			// console.log(i);
			list = list.append(i);
			const messages = (
				list as unknown as ListCommon<number>
			)._verifyStructure();
			expect(messages).toEqual([]);
		}
	});

	it('prepending results in valid structure', () => {
		let list = List.empty<number>();

		for (let i = 0; i < 20000; i++) {
			// console.log(i);
			list = list.prepend(i);
			const messages = (
				list as unknown as ListCommon<number>
			)._verifyStructure();
			expect(messages).toEqual([]);
		}
	});

	it('drop results in valid structure', () => {
		const list = List.from(Stream.range({ amount: 200 }));

		expect((list as any)._verifyStructure()).toEqual([]);

		for (let i = 0; i < 20000; i++) {
			// console.log(i);
			const dropList = list.drop(i) as unknown as ListCommon<number>;
			const messages = dropList._verifyStructure();
			if (messages.length > 0) {
				console.log(i);
				console.log(dropList._structure());
			}
			expect(messages).toEqual([]);
		}
	});

	it('take results in valid structure', () => {
		const list = List.from(Stream.range({ amount: 200 }));

		for (let i = 0; i < 20000; i++) {
			const takeList = list.take(i) as unknown as ListCommon<number>;
			const messages = takeList._verifyStructure();
			if (messages.length > 0) {
				console.log(i);
				console.log(takeList._structure());
			}
			expect(messages).toEqual([]);
		}
	});
});
