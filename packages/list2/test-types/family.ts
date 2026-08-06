import type { Collection } from '@rimbu/collection-types/capabilities';
import type { List } from '@rimbu/list';

/**
 * Conformance guard for the family/variant split.
 *
 * A package declares its family once and derives both type records from it.
 * The one slot that can silently go wrong is `_NEW_FAMILY`: if it is omitted
 * or points at the wrong family, re-typing degrades to `unknown` (or to the
 * parent collection type) with no error at the declaration site — every
 * `map`/`collect`/`flatMap` return type quietly decays.
 *
 * These checks pin the family down as a proper fixpoint.
 */

type NewNormal<F extends Collection.Advanced.FamilyBase<any>, E> = (F & {
	_NEW_E: E;
})['_NEW_FAMILY']['_NORMAL'];

type NewNonEmpty<F extends Collection.Advanced.FamilyBase<any>, E> = (F & {
	_NEW_E: E;
})['_NEW_FAMILY']['_NON_EMPTY'];

type NewBuilder<F extends Collection.Advanced.FamilyBase<any>, E> = (F & {
	_NEW_E: E;
})['_NEW_FAMILY']['_BUILDER'];

// re-typing must land back on List's own types, not on `unknown` and not on
// the IndexedCollection parent
const _normal: List<string> = null as unknown as NewNormal<
	List.Advanced.Family<number>,
	string
>;
const _nonEmpty: List.NonEmpty<string> = null as unknown as NewNonEmpty<
	List.Advanced.Family<number>,
	string
>;
const _builder: List.Builder<string> = null as unknown as NewBuilder<
	List.Advanced.Family<number>,
	string
>;

// both variants must agree on the family slots (this is the invariant the
// split exists to enforce; it is unrepresentable to break it, but pinning it
// documents the intent)
const _familyAgreesNormal: List.Advanced.Types<number>['_NORMAL'] =
	null as unknown as List.Advanced.TypesNonEmpty<number>['_NORMAL'];
const _familyAgreesNonEmpty: List.Advanced.Types<number>['_NON_EMPTY'] =
	null as unknown as List.Advanced.TypesNonEmpty<number>['_NON_EMPTY'];
const _familyAgreesBuilder: List.Advanced.Types<number>['_BUILDER'] =
	null as unknown as List.Advanced.TypesNonEmpty<number>['_BUILDER'];

// the variants must still differ where they should
const _variantDiffers: false =
	null as unknown as List.Advanced.TypesNonEmpty<number>['_isEmpty'];

console.log(
	_normal,
	_nonEmpty,
	_builder,
	_familyAgreesNormal,
	_familyAgreesNonEmpty,
	_familyAgreesBuilder,
	_variantDiffers,
);
