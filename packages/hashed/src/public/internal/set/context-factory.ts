import type { HashSet } from '@rimbu/hashed/set';

import type { HashSetCreators } from '#set/creators';

import { RSetContextBase } from '@rimbu/collection-types/set/base-module';
import { Eq } from '@rimbu/common/eq';
import { Module } from '@rimbu/common/module';
import { Hasher } from '@rimbu/hashed';
import { List } from '@rimbu/list';
import { createHashMapContext } from '../map/context';
import { HashSetBlockBuilder } from './builder';
import { HashSetEmpty, HashSetNonEmptyBase } from './immutable';

export function createHashSetContextModule<UT>(
	options: {
		hasher?: Hasher<UT>;
		eq?: Eq<UT>;
		blockSizeBits?: number;
		listContext?: List.Context;
	} = {},
) {
	const baseModule = RSetContextBase.createContextModuleBase<
		UT,
		HashSet.Types
	>();

	const {
		hasher = Hasher.defaultInstance,
		eq = Eq.defaultInstance,
		blockSizeBits = 5,
		listContext = List.defaultContext(),
	} = options;

	return Module.create<
		HashSetCreators & RSetContextBase.TotalModule<UT, HashSet.Types>
	>((mod) => ({
		...baseModule(mod),
		// this.blockCapacity = 1 << blockSizeBits;
		// this.blockMask = this.blockCapacity - 1;
		// this.maxDepth = Math.ceil(32 / blockSizeBits);

		blockCapacity: Module.constant(1 << blockSizeBits),
		blockMask: Module.constant((1 << blockSizeBits) - 1),
		maxDepth: Module.constant(Math.ceil(32 / blockSizeBits)),
    hasher: Module.constant(hasher),
    leq: Module.constant(eq),
    listContext: Module.constant(listContext),

		createContext: Module.factory(createHashMapContext),
		defaultContext: 0 as any,
		empty: Module.factory(<T>() => new HashSetEmpty<T>(mod)),
		builder: Module.factory(<T>() => new HashSetBlockBuilder<T>(mod)),
		typeTag: 0 as any,
		hasher: 0 as any,
		eq: 0 as any,
		_fixedElementType: 0 as any,
		_types: 0 as any,
		isValidValue: Module.factory((value: unknown): value is UT => {
		return mod.hasher.isValid(value);
  }),
		isNonEmptyInstance: Module.factory((source: any): source is any {
        return source instanceof HashSetNonEmptyBase;
      }),
	}));
}
