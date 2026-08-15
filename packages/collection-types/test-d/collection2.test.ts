import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection2';

type Capabilities<E> = Collection.Capability.WithToBuilder<E> &
	Collection.Capability.WithMap<E> &
	Collection.Capability.WithMutate<E> &
	Collection.Capability.WithRecompose<E>;

type NormalTypes<E> = Collection.Advanced.Types<Capabilities<E>, E>;
type NonEmptyTypes<E> = Collection.Advanced.TypesNonEmpty<Capabilities<E>, E>;

const retypedNormal = 0 as unknown as Collection.Advanced.ReTyped<
	NormalTypes<number>,
	string
>;
const retypedNonEmpty = 0 as unknown as Collection.Advanced.ReTyped<
	NonEmptyTypes<number>,
	string
>;

const normalResult: NormalTypes<string> = retypedNormal;
const nonEmptyResult: NonEmptyTypes<string> = retypedNonEmpty;
const normalInput: Collection.Advanced.ReTyped<
	NormalTypes<number>,
	string
> = null as unknown as NormalTypes<string>;
const nonEmptyInput: Collection.Advanced.ReTyped<
	NonEmptyTypes<number>,
	string
> = null as unknown as NonEmptyTypes<string>;

void [normalResult, nonEmptyResult, normalInput, nonEmptyInput];

describe('Collection2.ReTyped', () => {
	it('preserves the normal kind and retypes the element', () => {
		expectTypeOf(retypedNormal).toExtend<NormalTypes<string>>();
		expectTypeOf(retypedNormal._SELF).toExtend<
			Collection<string, Capabilities<string>>
		>();
	});

	it('preserves the non-empty kind and retypes the element', () => {
		expectTypeOf(retypedNonEmpty).toExtend<NonEmptyTypes<string>>();
		expectTypeOf(retypedNonEmpty._SELF).toExtend<
			Collection.NonEmpty<string, Capabilities<string>>
		>();
	});
});
