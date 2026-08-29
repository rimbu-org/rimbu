import type { Op } from '@rimbu/collection-types/types';

import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';

import { type ArrayNonEmpty, type IndexRange, OptLazy } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

/**
 * String-backed outer children for `CharList`.
 *
 * Encoding is the string itself: each UTF-16 code unit is one element.
 * Unlike `BitOuterChildrenOps` no extra length field is needed because
 * `string.length` already stores the size. The string is immutable, so
 * `guard`/`safeCopy` and the `mutate*` helpers just return new strings
 * (same as in `packages/list/src/internal/char-list-helpers.ts`).
 *
 * Behaviour mirrors `ArrayOuterChildrenOps` but adapted to string:
 * - `of` takes the first code unit of each input string (`value[0]`)
 * - `prepend`/`append` prepend/append the first code unit of `value`
 * - `at` supports `OptLazy` fallback and negative indices
 * - `toReversed`/`join`/`filter`/`reverseFilter`/`map`/`reverseMap` etc.
 *   are implemented via `split('')` / `Stream.fromString` and re-joined
 * - All `mutate*` helpers return new strings (strings are immutable)
 */
export class CharOuterChildrenOps
	implements ChildrenOps<CharOuterChildrenOps.Types>
{
	of<T extends string>(values: T[]): string {
		return values.map((v) => v[0] ?? '').join('');
	}

	size(children: string): number {
		return children.length;
	}

	at<T extends string, O>(
		children: string,
		index: number,
		otherwise?: OptLazy<O>,
	): T | O {
		if (-index > children.length || index >= children.length) {
			return OptLazy(otherwise) as O;
		}
		return children.at(index) as T;
	}

	setAt<T extends string>(children: string, index: number, value: T): string {
		const len = children.length;
		const i = index < 0 ? len + index : index;
		const current = children.at(i);
		if (Object.is(current, value)) return children;
		const strValue = String(value);
		const char = strValue[0] ?? '';
		return children.slice(0, i) + char + children.slice(i + 1);
	}

	updateAt<T extends string>(
		children: string,
		index: number,
		update: (current: T) => T,
	): Op.WithResult<string, [previous: T, current: T], true> {
		const len = children.length;
		const i = index < 0 ? len + index : index;
		const previous = children.at(i) as T;
		const current = update(previous);
		const hasChanged = !Object.is(previous, current);
		return {
			collection: hasChanged
				? children.slice(0, i) + current + children.slice(i + 1)
				: children,
			hasResult: true,
			result: [previous, current],
			hasChanged,
		};
	}

	stream<T extends string>(
		children: string,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T> {
		return Stream.fromString(children, options as never) as Stream.NonEmpty<T>;
	}

	streamRange<T extends string>(
		children: string,
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T> {
		return Stream.fromString(children, {
			...options,
			range,
		} as never) as Stream<T>;
	}

	prepend<T extends string>(children: string, value: T): string {
		const char = value[0] ?? '';
		return char + children;
	}

	append<T extends string>(children: string, value: T): string {
		const char = value[0] ?? '';
		return children + char;
	}

	concat(children1: string, children2: string): string {
		if (children1.length === 0) return children2;
		if (children2.length === 0) return children1;
		return children1.concat(children2);
	}

	toSpliced(
		children: string,
		start: number,
		deleteCount: number,
		items: string = '',
	): string {
		const before = children.slice(0, start);
		const after = children.slice(start + deleteCount);
		return before + (items ?? '') + after;
	}

	toReversed(children: string): string {
		if (children.length <= 1) return children;
		return children.split('').reverse().join('');
	}

	join(children: string, separator: string, reversed?: boolean): string {
		if (reversed) {
			return children.split('').reverse().join(separator);
		}
		return children.split('').join(separator);
	}

	filter<T extends string>(
		children: string,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): string | undefined {
		const negate = options?.negate === true;
		const arr = children.split('');
		const result = arr.filter((v) => (negate ? !f(v as T) : f(v as T)));
		if (result.length === arr.length) return undefined;
		return result.join('');
	}

	reverseFilter<T extends string>(
		children: string,
		f: (value: T) => boolean,
		options?: { negate?: boolean | undefined },
	): string | undefined {
		const len = children.length;
		const negate = options?.negate === true;
		const result: string[] = [];
		for (let i = len - 1; i >= 0; i--) {
			const value = children[i] as T;
			if (f(value) !== negate) result.push(value);
		}
		if (result.length === len) return undefined;
		return result.join('');
	}

	map<T extends string, T2 extends string>(
		children: string,
		f: (value: T) => T2,
	): string {
		const arr = children.split('');
		const mapped = arr.map((v) => f(v as T));
		return mapped.join('');
	}

	reverseMap<T extends string, T2 extends string>(
		children: string,
		f: (value: T) => T2,
	): string {
		const len = children.length;
		const result: string[] = new Array(len);
		for (let i = 0; i < len; i++) {
			const value = children[len - 1 - i] as T;
			result[i] = f(value);
		}
		return result.join('');
	}

	forEach<T extends string>(
		children: string,
		f: (value: T) => void,
		options?: { reversed?: boolean },
	): void {
		if (options?.reversed) {
			for (let i = children.length - 1; i >= 0; i--) {
				f(children[i] as T);
			}
		} else {
			for (let i = 0; i < children.length; i++) {
				f(children[i] as T);
			}
		}
	}

	toArray<T extends string>(
		children: string,
		reversed = false,
	): ArrayNonEmpty<T> {
		const arr = children.split('');
		if (reversed) return arr.reverse() as ArrayNonEmpty<T>;
		return arr as ArrayNonEmpty<T>;
	}

	sliceArray<T>(
		children: string,
		start: number,
		end: number,
		reversed?: boolean | undefined,
	): T[] {
		const slice = children.slice(start, end);
		if (reversed) return slice.split('').reverse() as T[];
		if (start === 0 && end >= children.length) return children.split('') as T[];
		return slice.split('') as T[];
	}

	mutateUpdate<T>(
		children: string,
		index: number,
		f: (value: T) => T,
	): [result: string, previous: T, current: T] {
		const len = children.length;
		const i = index < 0 ? len + index : index;
		const previous = children.at(i) as T;
		const current = f(previous);
		if (Object.is(previous, current)) return [children, previous, current];
		const result = children.slice(0, i) + current + children.slice(i + 1);
		return [result, previous, current];
	}

	mutatePrepend<T extends string>(children: string, value: T): string {
		return this.prepend(children, value);
	}

	mutateAppend<T extends string>(children: string, value: T): string {
		return this.append(children, value);
	}

	mutateSplice(
		children: string,
		start: number,
		deleteCount = children.length - start,
		items?: string | undefined,
	): [result: string, deleted: string] {
		const deleted = children.slice(start, start + deleteCount);
		const before = children.slice(0, start);
		const after = children.slice(start + deleteCount);
		const result = before + (items ?? '') + after;
		return [result, deleted];
	}

	mutateDropFirst<T extends string>(
		children: string,
	): [result: string, dropped: T] {
		return [children.slice(1), children[0] as T];
	}

	mutateDropLast<T extends string>(
		children: string,
	): [result: string, dropped: T] {
		return [children.slice(0, -1), children.at(-1) as T];
	}

	guard(children: string): string {
		return children;
	}

	safeCopy(children: string): string {
		return children;
	}
}

export declare namespace CharOuterChildrenOps {
	export interface Types extends ChildrenOps.Types {
		_T: string;
		_C: OuterChildren<this['_T']> & string;
	}
}
