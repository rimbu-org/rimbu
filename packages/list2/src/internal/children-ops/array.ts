import type { ChildrenOps, OuterChildren } from '#advanced/children-ops';

import {
	type ArrayNonEmpty,
	type IndexRange,
	OptLazy,
	TraverseState,
} from '@rimbu/common';
import { Stream } from '@rimbu/stream';

export class ArrayOuterChildrenOps
	implements ChildrenOps<ArrayOuterChildrenOps.Types>
{
	of<T>(values: T[]): T[] {
		return values;
	}
	size(children: unknown[]): number {
		return children.length;
	}
	at<T, O>(children: T[], index: number, otherwise?: OptLazy<O>): T | O {
		if (-index > children.length || index >= children.length) {
			return OptLazy(otherwise) as O;
		}
		return children.at(index) as T;
	}
	setAt<T>(children: T[], index: number, value: T): T[] {
		const current = children.at(index);
		if (Object.is(current, value)) {
			return children;
		}
		return children.with(index, value);
	}
	updateAt<T>(children: T[], index: number, update: (current: T) => T): T[] {
		const current = children.at(index);
		const newValue = update(current as T);
		if (Object.is(current, newValue)) {
			return children;
		}
		return children.with(index, newValue);
	}
	stream<T>(
		children: T[],
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T> {
		return Stream.fromArray(children, options).assumeNonEmpty();
	}
	streamRange<T>(
		children: T[],
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T> {
		return Stream.fromArray(children, { ...options, range });
	}
	prepend<T>(children: T[], value: T): T[] {
		const result = children.slice();
		result.unshift(value);
		return result;
	}
	append<T>(children: T[], value: T): T[] {
		const result = children.slice();
		result.push(value);
		return result;
	}
	concat<T>(children1: T[], children2: T[]): T[] {
		if (children1.length === 0) return children2;
		if (children2.length === 0) return children1;
		return children1.concat(children2);
	}
	toSpliced<T>(
		children: T[],
		start: number,
		deleteCount: number,
		items: T[] = [],
	): T[] {
		return children.toSpliced(start, deleteCount, ...items);
	}
	toReversed<T>(children: T[]): T[] {
		return children.toReversed();
	}
	join(children: unknown[], separator: string, reversed?: boolean): string {
		if (reversed) {
			let result = '';
			for (let i = children.length - 1; i >= 0; i--) {
				if (i < children.length - 1) result += separator;
				result += String(children[i]);
			}
			return result;
		}
		return children.join(separator);
	}
	filter<T>(children: T[], f: (value: T) => boolean): T[] {
		const result = children.filter(f);
		if (result.length === children.length) return children;
		return result;
	}
	filterIndexed<T>(
		children: T[],
		f: (value: T, index: number, halt: () => void) => boolean,
		options: {
			reversed?: boolean | undefined;
			negate?: boolean | undefined;
			state?: TraverseState | undefined;
		} = {},
	): T[] {
		const {
			reversed = false,
			negate = false,
			state = TraverseState(),
		} = options;

		if (state.halted) return children;

		const result: T[] = [];

		const len = children.length;

		if (reversed) {
			for (let i = len - 1; i >= 0; i--) {
				const value = children[i];
				const include = f(value, state.nextIndex(), state.halt);
				if (negate !== include) {
					result.push(value);
				}

				if (state.halted) break;
			}
		} else {
			for (let i = 0; i < len; i++) {
				const value = children[i];
				const include = f(value, state.nextIndex(), state.halt);
				if (negate !== include) {
					result.push(value);
				}

				if (state.halted) break;
			}
		}

		if (result.length === children.length) return children;

		return result;
	}
	map<T, T2>(children: T[], f: (value: T) => T2): T2[] {
		return children.map(f);
	}
	reverseMap<T, T2>(children: T[], f: (value: T) => T2): T2[] {
		const len = children.length;
		const result: T2[] = new Array(len);
		let resultIndex = len - 1;

		for (let i = 0; i < len; i++) {
			result[resultIndex--] = f(children[i]);
		}

		return result;
	}
	forEach<T>(
		children: T[],
		f: (value: T) => void,
		options?: { reversed?: boolean },
	): void {
		if (options?.reversed) {
			for (let i = children.length - 1; i >= 0; i--) {
				f(children[i]);
			}
		} else {
			children.forEach(f);
		}
	}
	toArray<T>(children: T[], reversed = false): ArrayNonEmpty<T> {
		if (reversed) {
			return children.toReversed() as ArrayNonEmpty<T>;
		}

		return children as ArrayNonEmpty<T>;
	}

	sliceArray<T>(
		children: T[],
		start: number,
		end: number,
		reversed?: boolean | undefined,
	): T[] {
		if (reversed) {
			return children.slice(start, end).reverse();
		}
		if (start === 0 && end >= children.length) return children;
		return children.slice(start, end);
	}
	mutateSet<T>(children: T[], index: number, value: T): T[] {
		children[index] = value;
		return children;
	}
	mutatePrepend<T>(children: T[], value: T): T[] {
		children.unshift(value);
		return children;
	}
	mutateAppend<T>(children: T[], value: T): T[] {
		children.push(value);
		return children;
	}
	mutateSplice<T>(
		children: T[],
		start: number,
		deleteCount = children.length - start,
		items?: T[] | undefined,
	): [result: T[], deleted: T[]] {
		const deleted = children.splice(start, deleteCount, ...(items ?? []));
		return [children, deleted];
	}
	mutateDropFirst<T>(children: T[]): [result: T[], dropped: T] {
		const dropped = children.shift()!;
		return [children, dropped];
	}
	mutateDropLast<T>(children: T[]): [result: T[], dropped: T] {
		const dropped = children.pop()!;
		return [children, dropped];
	}
	guard<T>(children: T[]): T[] {
		return Object.freeze(children) as T[];
	}
	safeCopy<T>(children: T[]): T[] {
		return children.slice();
	}
}

export declare namespace ArrayOuterChildrenOps {
	export interface Types extends ChildrenOps.Types {
		_T: unknown;
		_C: OuterChildren<this['_T']> & this['_T'][];
	}
}
