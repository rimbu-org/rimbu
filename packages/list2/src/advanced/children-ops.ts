import type { ArrayNonEmpty, IndexRange, OptLazy } from '@rimbu/common';
import type { Stream } from '@rimbu/stream';

export interface ChildrenOps<Tp extends ChildrenOps.Types = ChildrenOps.Types> {
	// Creates a children collection from an array of values
	of<T>(values: T[]): (Tp & { _T: T })['_C'];
	// Returns the number of elements in the children collection
	size(children: Tp['_C']): number;
	// Returns the element at the specified index in the children collection. No bounds checking is performed.
	at<T, O = undefined>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		otherwise?: OptLazy<O>,
	): T | O;
	// Returns a new children collection with the given value set at the specified index. No bounds checking is performed.
	// If the value is the same as the current value at that index, it returns the original children collection.
	setAt<T>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		value: T,
	): (Tp & { _T: T })['_C'];
	// Returns a new children collection with the element at the specified index updated using the provided update function. No bounds checking is performed.
	// If the updated value is the same as the current value at that index, it returns the original children collection.
	updateAt<T>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		update: (current: T) => T,
	): (Tp & { _T: T })['_C'];
	// Returns a stream of elements from the children collection, optionally reversed.
	stream<T>(
		children: (Tp & { _T: T })['_C'],
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream.NonEmpty<T>;
	// Returns a stream of elements from the children collection within the specified range, optionally reversed.
	streamRange<T>(
		children: (Tp & { _T: T })['_C'],
		range: IndexRange,
		options?: { reversed?: boolean | undefined } | undefined,
	): Stream<T>;
	// Returns a new children collection with the specified value prepended to the beginning.
	prepend<T>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	// Returns a new children collection with the specified value appended to the end.
	append<T>(children: (Tp & { _T: T })['_C'], value: T): (Tp & { _T: T })['_C'];
	// Returns a new children collection that is the concatenation of two children collections.
	// If one of the children collections is empty, it returns the other collection.
	concat<T>(
		children1: (Tp & { _T: T })['_C'],
		children2: (Tp & { _T: T })['_C'],
	): (Tp & { _T: T })['_C'];
	toSpliced<T>(
		children: (Tp & { _T: T })['_C'],
		start: number,
		deleteCount: number,
		items?: (Tp & { _T: T })['_C'] | undefined,
	): (Tp & { _T: T })['_C'];
	// Returns a new children collection that is the reverse of the original collection.
	// If the collection has 0 or 1 elements, it returns the original collection.
	toReversed<T>(children: (Tp & { _T: T })['_C']): (Tp & { _T: T })['_C'];
	// Returns a string representation of the children collection, with elements joined by the specified separator.
	join(children: Tp['_C'], separator: string, reversed?: boolean): string;
	// Returns a new children collection with the elements filtered by the provided predicate function.
	// If the length of the filtered collection is the same as the original, it returns the original collection.
	filter<T>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => boolean,
	): (Tp & { _T: T })['_C'];
	// Returns a new children collection with the elements transformed by the provided mapping function.
	map<T, T2>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => T2,
	): (Tp & { _T: T2 })['_C'];
	reverseMap<T, T2>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => T2,
	): (Tp & { _T: T2 })['_C'];
	// Iterates over each element in the children collection, applying the provided function.
	forEach<T>(
		children: (Tp & { _T: T })['_C'],
		f: (value: T) => void,
		options?: { reversed?: boolean | undefined } | undefined,
	): void;
	// Returns an array containing the elements of the children collection. If start and end indices are provided, it returns a slice of the array.
	toArray<T>(children: (Tp & { _T: T })['_C']): ArrayNonEmpty<T>;
	toArray<T>(
		children: (Tp & { _T: T })['_C'],
		start?: number | undefined,
		end?: number | undefined,
		reversed?: boolean | undefined,
	): T[];
	// Returns the same children collection with the element at the specified index set to the provided value. No bounds checking is performed.
	mutateSet<T>(
		children: (Tp & { _T: T })['_C'],
		index: number,
		value: T,
	): (Tp & { _T: T })['_C'];
	// Returns the same children collection with the specified value prepended to the beginning. No bounds checking is performed.
	mutatePrepend<T>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	// Returns the same children collection with the specified value appended to the end. No bounds checking is performed.
	mutateAppend<T>(
		children: (Tp & { _T: T })['_C'],
		value: T,
	): (Tp & { _T: T })['_C'];
	mutateSplice<T>(
		children: (Tp & { _T: T })['_C'],
		start: number,
		deleteCount?: number | undefined,
		items?: (Tp & { _T: T })['_C'] | undefined,
	): [result: (Tp & { _T: T })['_C'], deleted: (Tp & { _T: T })['_C']];
	// Returns a tuple containing the same children collection with the first element removed and the removed element. No bounds checking is performed.
	mutateDropFirst<T>(
		children: (Tp & { _T: T })['_C'],
	): [result: (Tp & { _T: T })['_C'], dropped: T];
	// Returns a tuple containing the same children collection with the last element removed and the removed element. No bounds checking is performed.
	mutateDropLast<T>(
		children: (Tp & { _T: T })['_C'],
	): [result: (Tp & { _T: T })['_C'], dropped: T];
	// Makes the children collection immutable if possible.
	guard<T>(children: (Tp & { _T: T })['_C']): (Tp & { _T: T })['_C'];
	safeCopy<T>(children: (Tp & { _T: T })['_C']): (Tp & { _T: T })['_C'];
}

export interface OuterChildren<T> {
	__outerChildrenTag?: T;
}

export declare namespace ChildrenOps {
	export interface Types {
		_T: unknown;
		_C: OuterChildren<this['_T']>;
	}
}
