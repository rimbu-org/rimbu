import type { Collection } from '@rimbu/collection-types/collection';
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

// The family must pin the concrete public types — this is the single place the
// slots are declared, so a regression here would silently degrade every method
// that resolves through `_NORMAL` / `_NON_EMPTY` / `_BUILDER`.
const _familyNormal: List<number> =
	null as unknown as List.Advanced.Family<number>['_NORMAL'];
const _familyNonEmpty: List.NonEmpty<number> =
	null as unknown as List.Advanced.Family<number>['_NON_EMPTY'];
const _familyBuilder: List.Builder<number> =
	null as unknown as List.Advanced.Family<number>['_BUILDER'];

// `_FAM` must be the fixpoint of itself, and `_NEW_FAMILY` must re-enter the
// same family at the new element type — not `unknown`, and not the
// IndexedCollection parent. `_NEW_E` is not pinned on the family (it stays
// `unknown`), so the new element type is supplied the same way the capability
// machinery does it: by intersecting it in.
const _famIsFixpoint: List.Advanced.Family<number> =
	null as unknown as List.Advanced.Family<number>['_FAM'];
const _newFamilyIsFixpoint: List.Advanced.Family<string> =
	null as unknown as (List.Advanced.Family<number> & {
		_NEW_E: string;
	})['_NEW_FAMILY'];

console.log(
	_normal,
	_nonEmpty,
	_builder,
	_familyNormal,
	_familyNonEmpty,
	_familyBuilder,
	_famIsFixpoint,
	_newFamilyIsFixpoint,
);
