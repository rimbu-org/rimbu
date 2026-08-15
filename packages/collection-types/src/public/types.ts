/**
 * The key under which a collection carries its HKT types record.
 *
 * A `unique symbol` is used deliberately rather than a string-named property:
 * a symbol-keyed member cannot be reached with dot syntax, so it never appears
 * in `.` autocomplete on a collection, while remaining fully usable as a type
 * slot (`this[TypesKey]['_NORMAL']`) and discoverable via element access.
 *
 * The same-named type alias lets call sites write `this[TypesKey]` instead of
 * the noisier `this[typeof TypesKey]`, mirroring the `Token` idiom in
 * `@rimbu/base`.
 */
export declare const TypesKey: unique symbol;

/**
 * Type alias representing the {@link TypesKey} symbol.
 */
export type TypesKey = typeof TypesKey;

export declare namespace Op {
	export type WithResult<Col, Result, HasResult extends boolean = boolean> = {
		collection: Col;
		hasResult: HasResult;
		result: Result;
		hasChanged: boolean;
	};

	export type DynamicResult<
		ColNoResult,
		NoResult,
		Result = NoResult,
		ColWithResult = ColNoResult,
	> =
		| WithResult<ColNoResult, NoResult, false>
		| WithResult<ColWithResult, Result, true>;
}
