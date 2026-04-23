import { describe, expect, it } from 'bun:test';

import type { BuilderCommon } from '@rimbu/list/internal/mutable/builder-base';

import { List } from '@rimbu/list2';
import { Stream } from '@rimbu/stream';

describe('List Builder Structure', () => {
	it('prepending results in valid structure', () => {
		const builder = List.builder<number>();

		for (let i = 0; i < 20000; i++) {
			builder.prepend(i);
			const messages = (
				builder as unknown as BuilderCommon<number>
			)._verifyStructure();
			if (messages.length > 0) {
				console.log(i);
				console.log((builder.build() as any)._structure());
			}
			expect(messages).toEqual([]);
		}
	});

	it('appending results in valid structure', () => {
		const builder = List.builder<number>();

		for (let i = 0; i < 20000; i++) {
			builder.append(i);
			const messages = (
				builder as unknown as BuilderCommon<number>
			)._verifyStructure();
			if (messages.length > 0) {
				console.log(i);
				console.log((builder.build() as any)._structure());
			}
			expect(messages).toEqual([]);
		}
	});

	it('inserting results in valid structure', () => {
		const builder = List.builder<number>();

		for (let i = 0; i < 20000; i++) {
			const index = Math.round((i / 10) * (i % 8));
			builder.insert(index, i);
			const messages = (
				builder as unknown as BuilderCommon<number>
			)._verifyStructure();
			if (messages.length > 0) {
				console.log(i);
				console.log((builder.build() as any)._structure());
			}
			expect(messages).toEqual([]);
		}
	});

	it('removing results in valid structure', () => {
		for (let max = 1; max <= 2000; max += 10) {
			const amount = max;
			const builder = List.from(Stream.range({ amount })).toBuilder();

			for (let i = 0; i < amount; i++) {
				const index = Math.round((builder.length / 10) * (i % 8));
				const before = builder.build();
				builder.remove(index, i);
				const messages = (
					builder as unknown as BuilderCommon<number>
				)._verifyStructure();
				if (messages.length > 0) {
					console.log('before', (before as any)._structure());
					console.log({ i, index });
					console.log((builder.build() as any)._structure());
				}
				expect(messages).toEqual([]);
			}
		}
	});
});
