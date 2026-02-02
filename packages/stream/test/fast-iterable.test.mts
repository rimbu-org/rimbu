import { describe, expect, it } from 'bun:test';

import { OptLazy } from '@rimbu/common/opt-lazy';

import { FastIteratorBase } from '#stream/fast-iterator-base';
import { StreamFactory } from '@rimbu/stream/internal/factory';

const { _emptyFastIteratorInstance, _fixedDoneIteratorResult } =
	StreamFactory().fastIteratorFactory;

describe('FastIterator', () => {
	it('fixedDone', () => {
		expect(_fixedDoneIteratorResult).toEqual({ done: true, value: undefined });
	});

	it('emptyFastIterator', () => {
		expect(_emptyFastIteratorInstance.fastNext()).toEqual(undefined);
		expect(_emptyFastIteratorInstance.fastNext(1)).toEqual(1);
		expect(_emptyFastIteratorInstance.fastNext(() => 1)).toEqual(1);
		expect(_emptyFastIteratorInstance.next()).toBe(_fixedDoneIteratorResult);
	});

	it('Base', () => {
		class Test1 extends FastIteratorBase<number> {
			readonly deps = StreamFactory();

			fastNext(): number {
				return 1;
			}
		}

		class Test2 extends FastIteratorBase<number> {
			readonly deps = StreamFactory();

			fastNext<O>(otherwise?: OptLazy<O>): number | O {
				return OptLazy(otherwise)!;
			}
		}

		const t1 = new Test1();
		expect(t1.next()).toEqual({ done: false, value: 1 });

		const t2 = new Test2();
		expect(t2.next()).toEqual({ done: true, value: undefined });
	});
});
