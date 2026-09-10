import { describe, expectTypeOf, it } from 'bun:test';

import type { Collection } from '@rimbu/collection-types/collection';

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

	it('normal is covariant', () => {
		expectTypeOf<Collection<number>>().toExtend<Collection<number | string>>();
		expectTypeOf<Collection<number | string>>().not.toExtend<
			Collection<number>
		>();
	});

	it('non-empty is assignable to normal', () => {
		expectTypeOf<Collection.NonEmpty<number>>().toExtend<Collection<number>>();
		expectTypeOf<Collection.NonEmpty<number>>().toExtend<
			Collection<number | string>
		>();
		expectTypeOf<Collection.NonEmpty<number | string>>().not.toExtend<
			Collection<number>
		>();
	});

	it('non-empty is covariant', () => {
		expectTypeOf<Collection.NonEmpty<number>>().toExtend<
			Collection.NonEmpty<number | string>
		>();
		expectTypeOf<Collection.NonEmpty<number | string>>().not.toExtend<
			Collection.NonEmpty<number>
		>();
	});

	it('WithAdd is invariant', () => {
		expectTypeOf<Collection.Capability.WithAddAll<number>>().not.toExtend<
			Collection.Capability.WithAddAll<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithAddAll<number | string>
		>().not.toExtend<Collection.Capability.WithAddAll<number>>();
	});

	it('WithToBuilder is invariant', () => {
		expectTypeOf<Collection.Capability.WithToBuilder<number>>().not.toExtend<
			Collection.Capability.WithToBuilder<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithToBuilder<number | string>
		>().not.toExtend<Collection.Capability.WithToBuilder<number>>();
	});

	it('WithMap is invariant', () => {
		expectTypeOf<Collection.Capability.WithMap<number>>().not.toExtend<
			Collection.Capability.WithMap<number | string>
		>();
		expectTypeOf<Collection.Capability.WithMap<number | string>>().not.toExtend<
			Collection.Capability.WithMap<number>
		>();
	});

	it('WithFlatmap is invariant', () => {
		expectTypeOf<Collection.Capability.WithFlatMap<number>>().not.toExtend<
			Collection.Capability.WithFlatMap<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithFlatMap<number | string>
		>().not.toExtend<Collection.Capability.WithFlatMap<number>>();
	});

	it('WithMutate is invariant', () => {
		expectTypeOf<Collection.Capability.WithMutate<number>>().not.toExtend<
			Collection.Capability.WithMutate<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithMutate<number | string>
		>().not.toExtend<Collection.Capability.WithMutate<number>>();
	});

	it('WithReducer is covariant', () => {
		expectTypeOf<Collection.Capability.WithReducer<number>>().toExtend<
			Collection.Capability.WithReducer<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithReducer<number | string>
		>().not.toExtend<Collection.Capability.WithReducer<number>>();
	});

	it('WithRecompose is invariant', () => {
		expectTypeOf<Collection.Capability.WithRecompose<number>>().not.toExtend<
			Collection.Capability.WithRecompose<number | string>
		>();
		expectTypeOf<
			Collection.Capability.WithRecompose<number | string>
		>().not.toExtend<Collection.Capability.WithRecompose<number>>();
	});
});
