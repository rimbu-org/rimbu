import { describe, expect, it, vi } from 'bun:test';

import { Module } from '@rimbu/common/module';

describe('Module', () => {
	it('creates empty module', () => {
		const module = Module.create<object>(() => ({}));
		expect(module.build<object>()).toEqual({});
	});

	it('creates module with lazy value', () => {
		const fn = vi.fn(() => 42);

		const module = Module.create(() => ({
			lazyValue: Module.lazy(fn),
		}));
		const built = module.build();
		expect(fn).toHaveBeenCalledTimes(0);

		expect(built.lazyValue).toBe(42);
		expect(built.lazyValue).toBe(42);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('creates module with singleton factory value', () => {
		const fn = vi.fn(() => 42);

		const module = Module.create(() => ({
			singleValue: Module.single(fn),
		}));
		const built = module.build();
		expect(fn).toHaveBeenCalledTimes(1);

		expect(built.singleValue).toBe(42);
		expect(built.singleValue).toBe(42);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('creates module with factory value', () => {
		const fn = vi.fn(() => 42);

		const module = Module.create(() => ({
			factoryValue: Module.factory(fn),
		}));
		const built = module.build();
		expect(fn).toHaveBeenCalledTimes(0);

		expect(built.factoryValue()).toBe(42);
		expect(built.factoryValue()).toBe(42);
		expect(fn).toHaveBeenCalledTimes(2);
	});

	it('creates module with constant value', () => {
		const module = Module.create<{ constValue: number }>(() => ({
			constValue: Module.constant(42),
		}));
		const built = module.build();

		expect(built.constValue).toBe(42);
	});

	it.skip('throws on eager self dependency', () => {
		const module = Module.create<{
			value1: number;
			value2: number;
		}>((mod) => ({
			value1: Module.single(() => 10),
			value2: Module.single(() => mod.value1 + 1),
		}));

		expect(() => module.build()).toThrow(Module.EagerSelfDependencyError);
	});

	it.skip('throws on eager self dependency with constant', () => {
		const module = Module.create<{
			value1: number;
			value2: number;
		}>((mod) => ({
			value1: Module.single(() => 10),
			value2: Module.constant(mod.value1 + 1),
		}));

		expect(() => module.build()).toThrow(Module.EagerSelfDependencyError);
	});

	it.skip('throws on lazy circular dependency', () => {
		const module = Module.create<{
			value1: number;
			value2: number;
		}>((mod) => ({
			value1: Module.lazy(() => mod.value2 + 1),
			value2: Module.lazy(() => mod.value1 + 1),
		}));

		const built = module.build();

		expect(() => built.value1).toThrow(Module.CircularDependencyError);
		expect(() => built.value2).toThrow(Module.CircularDependencyError);
	});

	it('creates module with dependencies', () => {
		const module = Module.create<{
			value1: number;
			value2: number;
		}>((mod) => ({
			value1: Module.single(() => 10),
			value2: Module.lazy(() => mod.value1 + 5),
		}));

		const built = module.build();

		expect(built.value1).toBe(10);
		expect(built.value2).toBe(15);
	});

	it('can create and combine partial modules', () => {
		const partial1 = Module.createPartial<
			{
				value1: number;
				value2: number;
			},
			{
				value1: number;
				value2: number;
				value3: number;
			}
		>((mod) => ({
			value1: Module.constant(5),
			value2: Module.lazy(() => mod.value3 + 5),
		}));

		const partial2 = Module.createPartial<
			{
				value3: number;
			},
			{
				value1: number;
				value2: number;
				value3: number;
			}
		>((mod) => ({
			value3: Module.lazy(() => mod.value1 + 10),
		}));

		const combinedModule = Module.create<{
			value1: number;
			value2: number;
			value3: number;
		}>((mod) => ({
			...partial1(mod),
			...partial2(mod),
		}));

		const built = combinedModule.build();

		expect(built.value1).toBe(5);
		expect(built.value2).toBe(20);
		expect(built.value3).toBe(15);
	});
});
