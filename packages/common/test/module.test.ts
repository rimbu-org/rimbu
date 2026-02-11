import { describe, expect, it, vi } from 'bun:test';

import { Module } from '@rimbu/common/module';

describe('Module', () => {
	it('creates empty module', () => {
		const moduleBuilder = Module.create<object>(() => ({}));
		expect(moduleBuilder.build<object>()).toEqual({});
	});

	it(Module.single.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value(): { content: number } }>(
			() => ({
				value: Module.single(creator),
			}),
		);
		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();
		expect(creator).toHaveBeenCalledTimes(1);

		const value1 = module.value();
		const value2 = module.value();
		expect(value1).toEqual({ content: 1 });
		expect(value1).toBe(value2);
		expect(creator).toHaveBeenCalledTimes(1);
	});

	it(Module.lazyGetter.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value: { content: number } }>(() => ({
			value: Module.lazyGetter(creator),
		}));
		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();
		expect(creator).toHaveBeenCalledTimes(0);

		const value1 = module.value;
		const value2 = module.value;
		expect(value1).toEqual({ content: 1 });
		expect(value1).toBe(value2);
		expect(creator).toHaveBeenCalledTimes(1);
	});

	it(Module.lazy.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value(): { content: number } }>(
			() => ({
				value: Module.lazy(creator),
			}),
		);
		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();
		expect(creator).toHaveBeenCalledTimes(0);

		const value1 = module.value();
		const value2 = module.value();
		expect(value1).toEqual({ content: 1 });
		expect(value1).toBe(value2);
		expect(creator).toHaveBeenCalledTimes(1);
	});
});
