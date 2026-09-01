// import type { Collection } from '@rimbu/collection-types/collection';
// import type { KeyedCollection } from '@rimbu/collection-types/collection/keyed';
// import type { Op } from '@rimbu/collection-types/types';

// import {
// 	CollectionBuilderBase,
// 	CollectionEmptyBase,
// 	CollectionNonEmptyBase,
// } from '@rimbu/collection-types/advanced/collection-base';
// import { OptLazy, type RelatedTo } from '@rimbu/common';
// import { Stream, type StreamSource } from '@rimbu/stream';

// export class KeyedCollectionContextBase<
// 	UK,
// 	UV,
// 	FAM extends KeyedCollection.Advanced.Family<UK, UV>,
// > implements KeyedCollection.Advanced.KeyedContextApi<FAM>
// {
// 	constructor(readonly collectionContext: FAM['_CONTEXT']) {}

// 	get empty(): <
// 		K extends FAM['_UPPER_K'],
// 		V extends FAM['_UPPER_V'],
// 	>() => Collection.Advanced.Types<FAM, readonly [K, V]>['_NORMAL'] {
// 		return this.collectionContext.empty as any;
// 	}

// 	get of(): <K extends FAM['_UPPER_K'], V extends FAM['_UPPER_V']>(
// 		...entries: readonly [K, V][]
// 	) => Collection.Advanced.Types<FAM, readonly [K, V]>['_NON_EMPTY'] {
// 		return this.collectionContext.of as any;
// 	}

// 	get from(): <K extends FAM['_UPPER_K'], V extends FAM['_UPPER_V']>(
// 		source: StreamSource<readonly [K, V]>,
// 	) => Collection.Advanced.Types<FAM, readonly [K, V]>['_NON_EMPTY'] {
// 		return this.collectionContext.from as any;
// 	}

// 	get builder(): <
// 		K extends FAM['_UPPER_K'],
// 		V extends FAM['_UPPER_V'],
// 	>() => Collection.Advanced.Types<FAM, readonly [K, V]>['_BUILDER'] {
// 		return this.collectionContext.builder as any;
// 	}
// }

// export abstract class KeyedCollectionEmptyBase<
// 		K,
// 		V,
// 		FAM extends KeyedCollection.Advanced.Family<
// 			K,
// 			V
// 		> = KeyedCollection.Advanced.Family<K, V>,
// 		Tp extends Collection.Advanced.Types<
// 			FAM,
// 			readonly [K, V]
// 		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
// 	>
// 	extends CollectionEmptyBase<any, readonly [K, V], FAM, Tp>
// 	implements
// 		KeyedCollection.Advanced.Api<K, V, Tp>,
// 		KeyedCollection.Capability.WithRemove.Api<K, V, Tp>,
// 		KeyedCollection.Capability.WithMapValues.Api<K, V, Tp>,
// 		KeyedCollection.Capability.WithFlatMap.Api<K, V, Tp>,
// 		KeyedCollection.Capability.WithMap.Api<K, V, Tp>,
// 		KeyedCollection.Capability.WithRecompose.Api<K, V, Tp>
// {
// 	get<UK, O>(_: RelatedTo<K, UK>, otherwise?: OptLazy<O>): O {
// 		return OptLazy(otherwise) as O;
// 	}

// 	has(): false {
// 		return false;
// 	}

// 	streamKeys(): Stream.NonEmpty<K> {
// 		return Stream.empty<K>() as any;
// 	}

// 	streamValues(): Stream.NonEmpty<V> {
// 		return Stream.empty<V>() as any;
// 	}

// 	removeKey<UK>(_: RelatedTo<K, UK>): this {
// 		return this;
// 	}

// 	removeKeys<UK>(_: StreamSource<RelatedTo<K, UK>>): this {
// 		return this;
// 	}

// 	removeKeyAndReturn<UK, O>(
// 		_: RelatedTo<K, UK>,
// 		otherwise?: OptLazy<O>,
// 	): Op.WithResult<this, O, false> {
// 		return {
// 			collection: this,
// 			hasResult: false,
// 			result: OptLazy(otherwise) as O,
// 			hasChanged: false,
// 		};
// 	}

// 	map<K2, V2>(): Collection.Advanced.ReTyped<Tp, readonly [K2, V2]>['_SELF'] {
// 		return this as any;
// 	}

// 	mapIndexed<K2, V2>(): Collection.Advanced.ReTyped<
// 		Tp,
// 		readonly [K2, V2]
// 	>['_NORMAL'] {
// 		return this as any;
// 	}

// 	flatMap(): this {
// 		return this;
// 	}

// 	flatMapIndexed(): this {
// 		return this;
// 	}

// 	mapValues<V2>(): Collection.Advanced.ReTyped<
// 		Tp,
// 		readonly [K, V2]
// 	>['_NORMAL'] {
// 		return this as any;
// 	}

// 	recompose(): Collection.Advanced.FamToTypes<
// 		FAM,
// 		readonly [unknown, unknown]
// 	>['_NORMAL'] {
// 		return this;
// 	}

// 	mutate(f: (builder: FAM['_BUILDER']) => void): FAM['_NORMAL'] {
// 		const builder = this.context.keyedContext.builder<K, V>();
// 		f(builder);
// 		return builder.build();
// 	}
// }

// export abstract class KeyedCollectionNonEmptyBase<
// 		K,
// 		V,
// 		FAM extends KeyedCollection.Advanced.Family<
// 			K,
// 			V
// 		> = KeyedCollection.Advanced.Family<K, V>,
// 		Tp extends Collection.Advanced.TypesNonEmpty<
// 			FAM,
// 			readonly [K, V]
// 		> = Collection.Advanced.TypesNonEmpty<FAM, readonly [K, V]>,
// 	>
// 	extends CollectionNonEmptyBase<readonly [K, V], FAM, Tp>
// 	implements KeyedCollection.Advanced.Api<K, V, Tp>
// {
// 	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;

// 	has<UK>(key: RelatedTo<K, UK>): boolean {
// 		const token = Symbol();
// 		return token !== this.get(key, token as any);
// 	}

// 	streamKeys(): Stream.NonEmpty<K> {
// 		return this.stream().map(([k]) => k);
// 	}

// 	streamValues(): Stream.NonEmpty<V> {
// 		return this.stream().map(([, v]) => v);
// 	}
// }

// export abstract class KeyedCollectionBuilderBase<
// 		K,
// 		V,
// 		FAM extends KeyedCollection.Advanced.Family<
// 			K,
// 			V
// 		> = KeyedCollection.Advanced.Family<K, V>,
// 		Tp extends Collection.Advanced.Types<
// 			FAM,
// 			readonly [K, V]
// 		> = Collection.Advanced.Types<FAM, readonly [K, V]>,
// 	>
// 	extends CollectionBuilderBase<readonly [K, V], FAM, Tp>
// 	implements KeyedCollection.Advanced.BuilderApi<K, V, Tp>
// {
// 	abstract get<UK, O>(key: RelatedTo<K, UK>, otherwise?: OptLazy<O>): V | O;

// 	has<UK>(key: RelatedTo<K, UK>): boolean {
// 		const token = Symbol();
// 		return token !== this.get(key, token as any);
// 	}
// }
