// ---------------------------------------------------------------------------
// Core
//
// `Col` / `Col.NonEmpty` take a *Family* (kind-free) and apply the Kind
// themselves. A capability is therefore declared exactly once — one Api and one
// Family — with no `NonEmpty`, `Types` or `TypesNonEmpty` counterparts, and is
// used as `Col<E, Col.WithMap<E>>` / `Col.NonEmpty<E, Col.WithMap<E>>`.
//
// Variance is decided per capability: the base `Col` is covariant in `E`, and a
// capability opts its collections into invariance by declaring the `_INVARIANT`
// witness on its Api (see `Col.WithMap.Api`). Invariance therefore travels with
// the capability — it reaches every collection that implements that Api, and it
// wins over covariant capabilities under intersection.
// ---------------------------------------------------------------------------

export type Col<E, F extends Col.FamilyBase<E> = Col.Family<E>> = Col.Types<
	F,
	E
>['_NORMAL'];

export namespace Col {
	export type NonEmpty<
		E,
		F extends Col.FamilyBase<E> = Col.Family<E>,
	> = Col.TypesNonEmpty<F, E>['_NON_EMPTY'];

	/**
	 * Binds a Family to a Kind. `_FAM` carries the *kind-free* family, so that a
	 * capability can refer back to the whole family it was composed into
	 * without dragging the current Kind along with it.
	 */
	export type Types<F extends Col.FamilyBase<any>, E> = F & {
		_FAM: F;
	} & Col.NormalKind<E>;

	export type TypesNonEmpty<F extends Col.FamilyBase<any>, E> = F & {
		_FAM: F;
	} & Col.NonEmptyKind<E>;

	// -- types record ---------------------------------------------------------

	export interface FamilyBase<E> {
		/** the kind-free family this record was built from */
		_FAM: Col.FamilyBase<E>;

		_NORMAL: unknown;
		_NON_EMPTY: unknown;

		_IS_EMPTY: unknown;
		_UPPER_E: unknown;

		_NEW_E: unknown;
		_NEW_FAMILY: Col.FamilyBase<this['_NEW_E']>;

		/** covariant witness, so `Col<number>` is a `Col<number | string>` */
		_COVARIANT: E;
	}

	export interface TypesBase extends Col.FamilyBase<any> {
		_SELF: unknown;
		_NEW_TYPES: Col.TypesBase;
	}

	export interface NormalKind<E> extends Col.FamilyBase<E> {
		_SELF: this['_NORMAL'];
		_IS_EMPTY: boolean;

		_NEW_TYPES: Col.Types<this['_NEW_FAMILY'], this['_NEW_E']>;
	}

	export interface NonEmptyKind<E> extends Col.FamilyBase<E> {
		_SELF: this['_NON_EMPTY'];
		_IS_EMPTY: false;

		_NEW_TYPES: Col.TypesNonEmpty<this['_NEW_FAMILY'], this['_NEW_E']>;
	}

	export type ReTyped<Tp extends Col.TypesBase, E2> = (Tp & {
		_NEW_E: E2;
	})['_NEW_TYPES'];

	// -- base api -------------------------------------------------------------

	export interface Api<E, Tp extends Col.TypesBase> {
		/** phantom carrier of the types record; keeps `E` and the family invariant */
		readonly _TYPES: Tp;

		readonly isEmpty: Tp['_IS_EMPTY'];
		readonly size: number;

		isNonEmpty(): this is Tp['_NON_EMPTY'];
		asNormal(): Tp['_NORMAL'];
		toArray(): E[];
	}

	export interface Family<E> extends Col.FamilyBase<E> {
		_NORMAL: Col.Api<E, Col.Types<this['_FAM'], E>>;
		_NON_EMPTY: Col.Api<E, Col.TypesNonEmpty<this['_FAM'], E>>;

		_FAM: Col.Family<E>;
		_NEW_FAMILY: Col.Family<this['_NEW_E']>;
	}

	// -- capability: WithMap ---------------------------------------------------

	export type WithMap<E> = Col.WithMap.Family<E>;

	export namespace WithMap {
		export interface Api<E, Tp extends Col.TypesBase> extends Col.Api<E, Tp> {
			/**
			 * `map` may only produce elements within `_UPPER_E`, so widening `E`
			 * would hand out a collection that accepts elements its family cannot
			 * hold. This capability therefore makes `E` invariant.
			 */
			readonly _INVARIANT: (e: E) => E;

			map<E2 extends Tp['_UPPER_E']>(
				f: (element: E) => E2,
			): Col.ReTyped<Tp, E2>['_SELF'];
		}

		export interface Family<E> extends Col.Family<E> {
			_NORMAL: WithMap.Api<E, Col.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithMap.Api<E, Col.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithMap.Family<E>;
			_NEW_FAMILY: WithMap.Family<this['_NEW_E']>;
		}
	}

	// -- capability: WithFilter (covariant) ------------------------------------

	export type WithFilter<E> = Col.WithFilter.Family<E>;

	export namespace WithFilter {
		export interface Api<E, Tp extends Col.TypesBase> extends Col.Api<E, Tp> {
			filter(pred: (element: E) => boolean): Tp['_NORMAL'];
		}

		export interface Family<E> extends Col.Family<E> {
			_NORMAL: WithFilter.Api<E, Col.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithFilter.Api<E, Col.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithFilter.Family<E>;
			_NEW_FAMILY: WithFilter.Family<this['_NEW_E']>;
		}
	}

	// -- capability: WithMutate ------------------------------------------------

	export type WithMutate<E> = Col.WithMutate.Family<E>;

	export namespace WithMutate {
		export interface Api<E, Tp extends Col.TypesBase> extends Col.Api<E, Tp> {
			mutate(f: (b: E[]) => void): Tp['_NORMAL'];
		}

		export interface Family<E> extends Col.Family<E> {
			_NORMAL: WithMutate.Api<E, Col.Types<this['_FAM'], E>>;
			_NON_EMPTY: WithMutate.Api<E, Col.TypesNonEmpty<this['_FAM'], E>>;

			_FAM: WithMutate.Family<E>;
			_NEW_FAMILY: WithMutate.Family<this['_NEW_E']>;
		}
	}
}

// ---------------------------------------------------------------------------
// Concrete collections
// ---------------------------------------------------------------------------

export interface List<T>
	extends Col.WithMap.Api<T, Col.Types<List.Family<T>, T>>,
		Col.WithMutate.Api<T, Col.Types<List.Family<T>, T>> {}

export namespace List {
	export interface NonEmpty<T>
		extends Col.WithMap.Api<T, Col.TypesNonEmpty<List.Family<T>, T>>,
			Col.WithMutate.Api<T, Col.TypesNonEmpty<List.Family<T>, T>> {}

	export interface Family<T> extends Col.FamilyBase<T> {
		_NORMAL: List<T>;
		_NON_EMPTY: List.NonEmpty<T>;

		_UPPER_E: any;

		_FAM: List.Family<T>;
		_NEW_FAMILY: List.Family<this['_NEW_E']>;
	}
}

// A collection with only covariant capabilities.
export interface Bag<T>
	extends Col.WithFilter.Api<T, Col.Types<Bag.Family<T>, T>> {}

export namespace Bag {
	export interface NonEmpty<T>
		extends Col.WithFilter.Api<T, Col.TypesNonEmpty<Bag.Family<T>, T>> {}

	export interface Family<T> extends Col.FamilyBase<T> {
		_NORMAL: Bag<T>;
		_NON_EMPTY: Bag.NonEmpty<T>;

		_UPPER_E: any;

		_FAM: Bag.Family<T>;
		_NEW_FAMILY: Bag.Family<this['_NEW_E']>;
	}
}

// A collection that is structurally just "a WithMap collection of booleans"
// needs no declarations of its own beyond the element bound.
export interface BitList extends Col<boolean, BitList.Family> {}

export namespace BitList {
	export interface NonEmpty extends Col.NonEmpty<boolean, BitList.Family> {}

	export interface Family extends Col.WithMap.Family<boolean> {
		_UPPER_E: boolean;
	}
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

type Assert<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

declare const c: Col<number, Col.WithMap<number>>;

// map keeps the family and changes the element type
const _c1: Assert<
	ReturnType<typeof c.map<string>>,
	Col<string, Col.WithMap<string>>
> = true;

// narrowing to non-empty makes map return a non-empty collection
declare function assertIsNonEmpty(
	c: Col.NonEmpty<number, Col.WithMap<number>>,
): void;
if (c.isNonEmpty()) {
	const _c2: Assert<
		ReturnType<typeof c.map<string>>,
		Col.NonEmpty<string, Col.WithMap<string>>
	> = true;
	const _c3: Assert<
		ReturnType<typeof c.asNormal>,
		Col<number, Col.WithMap<number>>
	> = true;
	// dropping back to normal does not leave the non-empty kind behind
	const n = c.asNormal();
	const _c4: Assert<
		ReturnType<typeof n.map<string>>,
		Col<string, Col.WithMap<string>>
	> = true;
	const _c5: Assert<typeof c.isEmpty, false> = true;
	assertIsNonEmpty(c);
	void [_c2, _c3, _c4, _c5];
}

// capabilities compose by intersection
declare const cm: Col<number, Col.WithMap<number> & Col.WithMutate<number>>;
const _cm1: Assert<
	ReturnType<typeof cm.map<string>>,
	Col<string, Col.WithMap<string> & Col.WithMutate<string>>
> = true;
const _cm2: Assert<
	ReturnType<typeof cm.mutate>,
	Col<number, Col.WithMap<number> & Col.WithMutate<number>>
> = true;

// concrete collections keep their own name in return position
declare const list: List<boolean>;
declare const listNE: List.NonEmpty<boolean>;
declare const bitlist: BitList;

const _l1: Assert<ReturnType<typeof list.map<string>>, List<string>> = true;
const _l2: Assert<ReturnType<typeof list.mutate>, List<boolean>> = true;
const _l3: Assert<
	ReturnType<typeof listNE.map<string>>,
	List.NonEmpty<string>
> = true;
const _l4: Assert<ReturnType<typeof listNE.asNormal>, List<boolean>> = true;

function acceptsWithMap<E>(col: Col<E, Col.WithMap<E>>): void {
	void col;
}
function acceptsWithMapNonEmpty<E>(col: Col.NonEmpty<E, Col.WithMap<E>>): void {
	void col;
}
acceptsWithMap<boolean>(list);
acceptsWithMap<boolean>(bitlist);
acceptsWithMap<boolean>(listNE);
acceptsWithMapNonEmpty<boolean>(listNE);
// @ts-expect-error - a possibly empty List is not a non-empty collection
acceptsWithMapNonEmpty<boolean>(list);

// a collection without the capability is rejected
declare const plain: Col<boolean>;
// @ts-expect-error - a plain Col has no `map`
acceptsWithMap<boolean>(plain);

// `_UPPER_E` of the BitList family pins the element type
// @ts-expect-error - a BitList may only contain booleans
bitlist.map(String);
list.map(String); // List has `_UPPER_E: any`

// element type is invariant: no widening
// @ts-expect-error - a Col<boolean> is not a Col<boolean | string>
acceptsWithMap<boolean | string>(bitlist);

// generic over both element type and family
function double<E, F extends Col.WithMap<E>>(
	col: Col<E, F>,
	f: (e: E) => E,
): Col<E, F> {
	return col.map(f);
}
const _g1: Assert<
	ReturnType<typeof double<boolean, List.Family<boolean>>>,
	List<boolean>
> = true;

// ---------------------------------------------------------------------------
// Variance
// ---------------------------------------------------------------------------

declare const plainNumber: Col<number>;
declare const plainWide: Col<number | string>;
declare const filtered: Col<number, Col.WithFilter<number>>;
declare const filteredWide: Col<
	number | string,
	Col.WithFilter<number | string>
>;
declare const mapped: Col<number, Col.WithMap<number>>;
declare const both: Col<number, Col.WithFilter<number> & Col.WithMap<number>>;
declare const bag: Bag<boolean>;

// the bare Col is covariant
const _v1: Col<number | string> = plainNumber;
// ...but not bivariant
// @ts-expect-error - a Col<number | string> is not a Col<number>
const _v2: Col<number> = plainWide;

// a covariant capability keeps it covariant
const _v3: Col<number | string, Col.WithFilter<number | string>> = filtered;
// @ts-expect-error - still not bivariant
const _v4: Col<number, Col.WithFilter<number>> = filteredWide;

// WithMap opts into invariance
// @ts-expect-error - a WithMap collection is invariant in its element type
const _v5: Col<number | string, Col.WithMap<number | string>> = mapped;

// invariance wins over covariance under intersection
// @ts-expect-error - WithMap makes the composed collection invariant
const _v6: Col<
	number | string,
	Col.WithFilter<number | string> & Col.WithMap<number | string>
> = both;

// non-empty variants follow the same rule
declare const mappedNE: Col.NonEmpty<number, Col.WithMap<number>>;
declare const filteredNE: Col.NonEmpty<number, Col.WithFilter<number>>;
const _v7: Col.NonEmpty<
	number | string,
	Col.WithFilter<number | string>
> = filteredNE;
// @ts-expect-error - invariant
const _v8: Col.NonEmpty<
	number | string,
	Col.WithMap<number | string>
> = mappedNE;

// concrete collections inherit the variance of the capabilities they implement
const _v9: Bag<boolean | string> = bag;
// @ts-expect-error - List implements WithMap, so it is invariant
const _v10: List<boolean | string> = list;
// @ts-expect-error - and so is a BitList
const _v11: Col<boolean | string, Col.WithMap<boolean | string>> = bitlist;

void [_c1, _cm1, _cm2, _l1, _l2, _l3, _l4, _g1];
void [_v1, _v2, _v3, _v4, _v5, _v6, _v7, _v8, _v9, _v10, _v11];
