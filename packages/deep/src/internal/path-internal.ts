import type { IsAnyFunc, IsArray, IsPlainObj } from '@rimbu/base/plain-object';
import type { Tuple } from '@rimbu/deep/tuple';

export namespace PathInternal {
	/**
	 * Determines the allowed paths into a value of type `T`.
	 * @typeparam T - the source type
	 * @typeparam Write - if true the path should be writable (no optional chaining)
	 * @typeparam Maybe - if true the value at the current path is optional
	 * @typeparam First - if true this is the root call
	 * @note type is mapped as template literal to prevent non-string types to leak through
	 */
	export type Generic<
		T,
		Write extends boolean,
		Maybe extends boolean,
		First extends boolean = false,
	> = `${IsAnyFunc<T> extends true
		? // functions can not be further decomposed
			''
		: // empty string is always an option
			'' | PathInternal.NonEmpty<T, Write, Maybe, First>}`;

	/**
	 * Determines the allowed non-empty paths into a value of type `T`.
	 * @typeparam T - the source type
	 * @typeparam Write - if true the path should be writable (no optional chaining)
	 * @typeparam Maybe - if true the value at the current path is optional
	 * @typeparam First - if true this is the root call
	 */
	export type NonEmpty<
		T,
		Write extends boolean,
		Maybe extends boolean,
		First extends boolean,
	> = PathInternal.IsOptional<T> extends true
		? // the value T may be null or undefined, check whether further chaining is allowed
			Write extends false
			? // path is not used to write to, so optional chaining is allowed
				PathInternal.Generic<Exclude<T, undefined | null>, Write, true>
			: // path can be written to, no optional chaining allowed
				never
		: // determine separator, and continue with non-optional value
			`${PathInternal.Separator<
				First,
				Maybe,
				IsArray<T>
			>}${PathInternal.NonOptional<T, Write, Maybe>}`;

	/**
	 * Determines the allowed paths into a non-optional value of type `T`.
	 * @typeparam T - the source type
	 * @typeparam Write - if true the path should be writable (no optional chaining)
	 * @typeparam Maybe - if true the value at the current path is optional
	 */
	export type NonOptional<
		T,
		Write extends boolean,
		Maybe extends boolean,
	> = Tuple.IsTuple<T> extends true
		? // determine allowed paths for tuple
			PathInternal.Tup<T, Write, Maybe>
		: T extends readonly any[]
			? // determine allowed paths for array
				Write extends false
				? // path is not writable so arrays are allowed
					PathInternal.Arr<T>
				: // path is writable, no arrays allowed
					never
			: IsPlainObj<T> extends true
				? // determine allowed paths for object
					PathInternal.Obj<T, Write, Maybe>
				: // no match
					never;

	/**
	 * Determines the allowed paths for a tuple. Since tuples have fixed types, they do not
	 * need to be optional, in contrast to arrays.
	 * @typeparam T - the input tuple type
	 * @typeparam Write - if true the path should be writable (no optional chaining)
	 * @typeparam Maybe - if true the value at the current path is optional
	 */
	export type Tup<T, Write extends boolean, Maybe extends boolean> = {
		[K in Tuple.KeysOf<T>]: `[${K}]${PathInternal.Generic<T[K], Write, Maybe>}`;
	}[Tuple.KeysOf<T>];

	/**
	 * Determines the allowed paths for an array.
	 * @typeparam T - the input array type
	 */
	export type Arr<T extends readonly any[]> =
		// first `[index]` and then the rest of the path, which cannot be Write (since optional) and must be Maybe
		`[${number}]${PathInternal.Generic<T[number], false, true>}`;

	/**
	 * Determines the allowed paths for an object.
	 * @typeparam T - the input object type
	 * @typeparam Write - if true the path should be writable (no optional chaining)
	 * @typeparam Maybe - if true the value at the current path is optional
	 */
	export type Obj<T, Write extends boolean, Maybe extends boolean> = {
		[K in keyof T]: `${K & string}${PathInternal.Generic<
			T[K],
			Write,
			// If writable (not optional), Maybe is false. If value is optional, Maybe is true. Otherwise, forward current Maybe.
			Write extends true ? false : PathInternal.IsOptional<T[K], true, Maybe>
		>}`;
	}[keyof T];

	/**
	 * Determines the allowed path part separator based on the input types.
	 * @typeparam First - if true, this is the first call
	 * @typeparam Maybe - if true, the value is optional
	 * @typeparam IsArray - if true, the value is an array
	 */
	export type Separator<
		First extends boolean,
		Maybe extends boolean,
		IsArray extends boolean,
	> = Maybe extends true
		? First extends true
			? // first optional value cannot have separator
				never
			: // non-first optional value must have separator
				'?.'
		: First extends true
			? // first non-optional value has empty separator
				''
			: IsArray extends true
				? // array selectors do not have separator
					''
				: // normal separator
					'.';

	/**
	 * Determines whether the given type `T` is optional, that is, whether it can be null or undefined.
	 * @typeparam T - the input type
	 * @typeparam True - the value to return if `T` is optional
	 * @typeparam False - the value to return if `T` is mandatory
	 */
	export type IsOptional<T, True = true, False = false> = undefined extends T
		? // is optional
			True
		: null extends T
			? // is optional
				True
			: // not optional
				False;

	/**
	 * Returns type `T` if `Maybe` is false, `T | undefined` otherwise.
	 * @typeparam T - the input type
	 * @typeparam Maybe - if true, the return type value should be optional
	 */
	export type MaybeValue<T, Maybe extends boolean> = Maybe extends true
		? T | undefined
		: T;

	/**
	 * Utility type to only add non-empty string types to a string array.
	 * @typeparam A - the input string array
	 * @typeparam T - the string value to optionally add
	 */
	export type AppendIfNotEmpty<
		A extends string[],
		T extends string,
	> = T extends ''
		? // empty string, do not add
			A
		: // non-empty string, add to array
			[...A, T];
}

export namespace PathResultInternal {
	/**
	 * Determines the result type for an array of tokens representing subpaths in type `T`.
	 * @typeparam T - the current source type
	 * @typeparam Tokens - an array of elements indicating a path into the source type
	 * @typeparam Maybe - if true indicates that the path may be undefined
	 */
	export type For<
		T,
		Tokens,
		Maybe extends boolean = PathInternal.IsOptional<T>,
	> = Tokens extends []
		? // no more token
			PathInternal.MaybeValue<T, Maybe>
		: PathInternal.IsOptional<T> extends true
			? // T can be null or undefined, so continue with Maybe set to true
				PathResultInternal.For<Exclude<T, undefined | null>, Tokens, true>
			: Tokens extends ['?.', infer Key, ...infer Rest]
				? // optional chaining, process first part and set Maybe to true
					PathResultInternal.For<
						PathResultInternal.Part<T, Key, Maybe>,
						Rest,
						true
					>
				: Tokens extends ['.', infer Key, ...infer Rest]
					? // normal chaining, process first part and continue
						PathResultInternal.For<
							PathResultInternal.Part<T, Key, false>,
							Rest,
							Maybe
						>
					: Tokens extends [infer Key, ...infer Rest]
						? // process first part, and continue
							PathResultInternal.For<
								PathResultInternal.Part<T, Key, false>,
								Rest,
								Maybe
							>
						: never;

	/**
	 * Determines the result of getting the property/index `K` from type `T`, taking into
	 * account that the value may be optional.
	 * @typeparam T - the current source type
	 * @typeparam K - the key to get from the source type
	 * @typeparam Maybe - if true indicates that the path may be undefined
	 */
	export type Part<T, K, Maybe extends boolean> = IsArray<T> extends true
		? Tuple.IsTuple<T> extends true
			? // Tuple: use K to look up the specific per-index type
				PathInternal.MaybeValue<T[K & keyof T], Maybe>
			: // Regular array: all indices share the same element type T[number].
				// Using T[number] is explicit and avoids relying on TypeScript's implicit
				// string-to-number coercion when indexing arrays with a string literal key.
				// Array element access is always potentially out-of-bounds, so Maybe=true.
				PathInternal.MaybeValue<T[number & keyof T], true>
		: // Plain object or other: use K to look up the key
			PathInternal.MaybeValue<T[K & keyof T], Maybe>;

	/**
	 * Converts a path string into separate tokens in a string array.
	 * @typeparam P - the literal string path type
	 * @typeparam Token - the token currently being produced
	 * @typeparam Res - the resulting literal string token array
	 */
	export type Tokenize<
		P extends string,
		Token extends string = '',
		Res extends string[] = [],
	> = P extends ''
		? // no more input to process, return result
			PathInternal.AppendIfNotEmpty<Res, Token>
		: P extends `[${infer Index}]${infer Rest}`
			? // input is an array selector, append index to tokens. Continue with new token
				Tokenize<
					Rest,
					'',
					[...PathInternal.AppendIfNotEmpty<Res, Token>, Index]
				>
			: P extends `?.${infer Rest}`
				? // optional chaining, append to tokens. Continue with new token
					Tokenize<
						Rest,
						'',
						[...PathInternal.AppendIfNotEmpty<Res, Token>, '?.']
					>
				: P extends `.${infer Rest}`
					? // normal chaining, append to tokens. Continue with new token
						Tokenize<
							Rest,
							'',
							[...PathInternal.AppendIfNotEmpty<Res, Token>, '.']
						>
					: P extends `${infer First}${infer Rest}`
						? // process next character
							Tokenize<Rest, `${Token}${First}`, Res>
						: never;
}
