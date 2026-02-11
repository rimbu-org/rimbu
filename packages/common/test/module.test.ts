import { describe, expect, it, vi } from 'bun:test';

import { Module } from '@rimbu/common/module';

describe('Module', () => {
	it('creates empty module', () => {
		const moduleBuilder = Module.create<object>(() => ({}));
		expect(moduleBuilder.build<object>()).toEqual({});
	});

	it(Module.constant.name, () => {
		const moduleBuilder = Module.create<{ value: number }>(() => ({
			value: Module.constant(42),
		}));
		expect(moduleBuilder.build().value).toBe(42);
	});

	it(Module.constantGet.name, () => {
		const obj = {
			content: 1,
		};
		const moduleBuilder = Module.create<{ value(): { content: number } }>(
			() => ({
				value: Module.constantGet(obj),
			}),
		);

		const module = moduleBuilder.build();
		expect(module.value()).toBe(obj);
		expect(module.value()).toBe(obj);
	});

	it(Module.single.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value: { content: number } }>(() => ({
			value: Module.single(creator),
		}));

		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();

		expect(creator).toHaveBeenCalledTimes(1);

		const value1 = module.value;
		const value2 = module.value;
		expect(value1).toEqual({ content: 1 });
		expect(value1).toBe(value2);
	});

	it(Module.singleGet.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value(): { content: number } }>(
			() => ({
				value: Module.singleGet(creator),
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

	it(Module.lazy.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value: { content: number } }>(() => ({
			value: Module.lazy(creator),
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

	it(Module.lazyGet.name, () => {
		const creator = vi.fn(() => ({ content: 1 }));

		const moduleBuilder = Module.create<{ value(): { content: number } }>(
			() => ({
				value: Module.lazyGet(creator),
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

	it(Module.factory.name, () => {
		const creator = vi.fn((value: number) => ({ content: value }));

		const moduleBuilder = Module.create<{
			value(value: number): { content: number };
		}>(() => ({
			value: Module.factory(creator),
		}));
		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();
		expect(creator).toHaveBeenCalledTimes(0);

		const value1 = module.value(1);
		const value2 = module.value(2);
		expect(value1).toEqual({ content: 1 });
		expect(value2).toEqual({ content: 2 });
		expect(creator).toHaveBeenCalledTimes(2);
	});

	it(Module.factoryGet.name, () => {
		const creator = vi.fn((value: number) => ({ content: value }));

		const moduleBuilder = Module.create<{
			value(): (value: number) => { content: number };
		}>(() => ({
			value: Module.factoryGet(creator),
		}));
		expect(creator).toHaveBeenCalledTimes(0);

		const module = moduleBuilder.build();
		expect(creator).toHaveBeenCalledTimes(0);

		const factory = module.value();
		const value1 = factory(1);
		const value2 = factory(2);
		expect(value1).toEqual({ content: 1 });
		expect(value2).toEqual({ content: 2 });
		expect(creator).toHaveBeenCalledTimes(2);
	});

	// it('creates module with lazy value', () => {
	// 	const fn = vi.fn(() => 42);

	// 	const module = Module.create(() => ({
	// 		lazyValue: Module.lazy(fn),
	// 	}));
	// 	const built = module.build();
	// 	expect(fn).toHaveBeenCalledTimes(0);

	// 	expect(built.lazyValue).toBe(42);
	// 	expect(built.lazyValue).toBe(42);
	// 	expect(fn).toHaveBeenCalledTimes(1);
	// });

	// it('creates module with singleton factory value', () => {
	// 	const obj = {};
	// 	const fn = vi.fn(() => obj);

	// 	const module = Module.create<{ singleValue: {} }>(() => ({
	// 		singleValue: Module.single(fn),
	// 	}));
	// 	const built = module.build();
	// 	expect(fn).toHaveBeenCalledTimes(1);

	// 	expect(built.singleValue).toBe(obj);
	// 	expect(built.singleValue).toBe(obj);
	// 	expect(fn).toHaveBeenCalledTimes(1);
	// });

	// it('creates module with factory value', () => {
	// 	const fn = vi.fn(() => 42);

	// 	const module = Module.create(() => ({
	// 		factoryValue: Module.factory(fn),
	// 	}));
	// 	const built = module.build();
	// 	expect(fn).toHaveBeenCalledTimes(0);

	// 	expect(built.factoryValue()).toBe(42);
	// 	expect(built.factoryValue()).toBe(42);
	// 	expect(fn).toHaveBeenCalledTimes(2);
	// });

	// it('creates module with constant value', () => {
	// 	const module = Module.create<{ constValue: number }>(() => ({
	// 		constValue: Module.constant(42),
	// 	}));
	// 	const built = module.build();

	// 	expect(built.constValue).toBe(42);
	// });

	// it('creates module with dependencies', () => {
	// 	const module = Module.create<{
	// 		value1: number;
	// 		value2: number;
	// 	}>((mod) => ({
	// 		value1: Module.single(() => 10),
	// 		value2: Module.lazy(() => mod.value1 + 5),
	// 	}));

	// 	const built = module.build();

	// 	expect(built.value1).toBe(10);
	// 	expect(built.value2).toBe(15);
	// });

	// it('can create and combine partial modules', () => {
	// 	const partial1 = Module.createPartial<
	// 		{
	// 			value1: number;
	// 			value2: number;
	// 		},
	// 		{
	// 			value1: number;
	// 			value2: number;
	// 			value3: number;
	// 		}
	// 	>((mod) => ({
	// 		value1: Module.constant(5),
	// 		value2: Module.lazy(() => mod.value3 + 5),
	// 	}));

	// 	const partial2 = Module.createPartial<
	// 		{
	// 			value3: number;
	// 		},
	// 		{
	// 			value1: number;
	// 			value2: number;
	// 			value3: number;
	// 		}
	// 	>((mod) => ({
	// 		value3: Module.lazy(() => mod.value1 + 10),
	// 	}));

	// 	const combinedModule = Module.create<{
	// 		value1: number;
	// 		value2: number;
	// 		value3: number;
	// 	}>((mod) => ({
	// 		...partial1(mod),
	// 		...partial2(mod),
	// 	}));

	// 	const built = combinedModule.build();

	// 	expect(built.value1).toBe(5);
	// 	expect(built.value2).toBe(20);
	// 	expect(built.value3).toBe(15);
	// });
});
