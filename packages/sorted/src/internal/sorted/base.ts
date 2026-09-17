import type { Comp } from '@rimbu/common/comp';

import * as Arr from '@rimbu/base/arr';
import * as RimbuError from '@rimbu/base/rimbu-error';
import { IndexRange } from '@rimbu/common/index-range';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Range } from '@rimbu/common/range';
import { TraverseState } from '@rimbu/common/traverse-state';
import { Stream } from '@rimbu/stream';

import { SortedIndex } from '#sorted/sorted-index';

/**
 * Describes the mutable surface of a leaf node used by the helper
 * functions that transform B‑tree leaves.
 * @typeparam TS - the concrete leaf type
 * @typeparam E - the stored entry type
 */
export interface LeafMutateSource<TS extends LeafMutateSource<TS, E>, E> {
	mutateEntries: E[];
	entries: readonly E[];
	copy(entries: readonly E[]): TS;
}

/**
 * Removes and returns the minimum entry from the given leaf node while
 * returning the updated leaf.
 * @param source - the leaf node to operate on
 */
export function leafDeleteMin<S extends LeafMutateSource<S, E>, E>(
	source: S,
): [E, S] {
	return [source.entries[0], source.copy(Arr.tail(source.entries))];
}

/**
 * Removes and returns the maximum entry from the given leaf node while
 * returning the updated leaf.
 * @param source - the leaf node to operate on
 */
export function leafDeleteMax<S extends LeafMutateSource<S, E>, E>(
	source: S,
): [E, S] {
	return [source.entries.at(-1)!, source.copy(Arr.init(source.entries))];
}

/**
 * Splits the given leaf node into two nodes and returns the promoted
 * separator entry together with the newly created right node.<br/>
 * <br/>
 * The split position can be customised through the optional `index`.
 * @param source - the leaf node to split
 * @param index - (optional) the split index, defaults to the middle entry
 */
export function leafMutateSplitRight<S extends LeafMutateSource<S, E>, E>(
	source: S,
	index = source.entries.length >>> 1,
): [E, S] {
	const rightEntries = source.mutateEntries.splice(index);
	const rightNode = source.copy(rightEntries);
	const upEntry = rightEntries.shift()!;
	return [upEntry, rightNode];
}

/**
 * Moves the given `toLeft` entry from `source` to the left sibling and
 * returns the separator entry that should be stored in the parent node.
 * @param source - the leaf that donates an entry to the left sibling
 * @param left - the left sibling leaf to receive the entry
 * @param toLeft - the entry that must end up in the left sibling
 */
export function leafMutateGiveToLeft<S extends LeafMutateSource<S, E>, E>(
	source: S,
	left: S,
	toLeft: E,
): [E, S] {
	const toUp = source.mutateEntries.shift()!;
	const newLeft = left.copy(Arr.append(left.entries, toLeft));
	return [toUp, newLeft];
}

/**
 * Moves the given `toRight` entry from `source` to the right sibling and
 * returns the separator entry that should be stored in the parent node.
 * @param source - the leaf that donates an entry to the right sibling
 * @param right - the right sibling leaf to receive the entry
 * @param toRight - the entry that must end up in the right sibling
 */
export function leafMutateGiveToRight<S extends LeafMutateSource<S, E>, E>(
	source: S,
	right: S,
	toRight: E,
): [E, S] {
	const toUp = source.mutateEntries.pop()!;
	const newRight = right.copy(Arr.prepend(right.entries, toRight));
	return [toUp, newRight];
}

/**
 * Pulls an entry from the left sibling into `source` and returns the
 * separator entry that should be stored in the parent node.
 * @param source - the leaf receiving an entry
 * @param left - the left sibling leaf to donate an entry
 * @param toMe - the entry that must end up in `source`
 */
export function leafMutateGetFromLeft<S extends LeafMutateSource<S, E>, E>(
	source: S,
	left: S,
	toMe: E,
): [E, S] {
	const toUp = left.entries.at(-1)!;
	const newLeft = left.copy(Arr.init(left.entries));
	source.mutateEntries.unshift(toMe);
	return [toUp, newLeft];
}

/**
 * Pulls an entry from the right sibling into `source` and returns the
 * separator entry that should be stored in the parent node.
 * @param source - the leaf receiving an entry
 * @param right - the right sibling leaf to donate an entry
 * @param toMe - the entry that must end up in `source`
 */
export function leafMutateGetFromRight<S extends LeafMutateSource<S, E>, E>(
	source: S,
	right: S,
	toMe: E,
): [E, S] {
	const toUp = right.entries[0];
	const newRight = right.copy(Arr.tail(right.entries));
	source.mutateEntries.push(toMe);
	return [toUp, newRight];
}

/**
 * Joins the given left sibling leaf and `source` into a single leaf by
 * inserting the given separator `entry` between them.
 * @param source - the right leaf that will absorb the left sibling
 * @param left - the left sibling leaf to merge
 * @param entry - the separator entry from the parent
 */
export function leafMutateJoinLeft<S extends LeafMutateSource<S, E>, E>(
	source: S,
	left: S,
	entry: E,
): void {
	source.mutateEntries.unshift(entry);
	source.entries = left.entries.concat(source.entries);
}

/**
 * Joins the given right sibling leaf and `source` into a single leaf by
 * inserting the given separator `entry` between them.
 * @param source - the left leaf that will absorb the right sibling
 * @param right - the right sibling leaf to merge
 * @param entry - the separator entry from the parent
 */
export function leafMutateJoinRight<S extends LeafMutateSource<S, E>, E>(
	source: S,
	right: S,
	entry: E,
): void {
	source.mutateEntries.push(entry);
	source.entries = source.entries.concat(right.entries);
}

/**
 * Describes the minimal interface required from an inner B‑tree node
 * used by the helper functions that transform inner nodes.
 * @typeparam E - the stored entry type
 */
export interface InnerChild<E> {
	readonly size: number;
	at<O>(index: number, otherwise?: OptLazy<O>): E | O;
	stream(options?: { reversed?: boolean }): Stream<E>;
	streamSlice(range: IndexRange, options?: { reversed?: boolean }): Stream<E>;
	readonly entries: readonly E[];
	takeInternal(amount: number): InnerChild<E>;
	dropInternal(amount: number): InnerChild<E>;
	deleteMin(): [E, InnerChild<E>];
	deleteMax(): [E, InnerChild<E>];
	mutateGiveToLeft(left: InnerChild<E>, toLeft: E): [E, InnerChild<E>];
	mutateGiveToRight(right: InnerChild<E>, toRight: E): [E, InnerChild<E>];
	mutateSplitRight(index?: number): [E, InnerChild<E>];
	mutateJoinLeft(left: InnerChild<E>, entry: E): void;
	mutateJoinRight(right: InnerChild<E>, entry: E): void;
	mutateGetFromLeft(left: InnerChild<E>, toMe: E): [E, InnerChild<E>];
	mutateGetFromRight(right: InnerChild<E>, toMe: E): [E, InnerChild<E>];
}

/**
 * Describes the mutable surface of an inner node used by the inner
 * transformation helper functions.
 * @typeparam TS - the concrete inner node type
 * @typeparam E - the stored entry type
 */
export interface InnerMutateSource<TS extends InnerMutateSource<TS, E>, E> {
	readonly context: {
		readonly minEntries: number;
		readonly maxEntries: number;
		inner(
			entries: readonly E[],
			children: readonly InnerChild<E>[],
			size: number,
		): TS;
	};
	size: number;
	entries: readonly E[];
	mutateEntries: E[];
	children: readonly InnerChild<E>[];
	mutateChildren: InnerChild<E>[];
	stream(options?: { reversed?: boolean }): Stream.NonEmpty<E>;
	copy(
		entries?: readonly E[],
		children?: readonly InnerChild<E>[],
		size?: number,
	): TS;
	addInternal(entry: E): TS;
	normalizeDownsizeChild(
		childIndex: number,
		newChild: InnerChild<E>,
		newSize: number,
	): TS;
	normalizeIncreaseChild(
		childIndex: number,
		newChild: InnerChild<E>,
		newSize: number,
	): TS;
}

/**
 * Removes and returns the minimum entry from the left‑most child of the
 * given inner node and returns the updated node.
 * @param source - the inner node to operate on
 */
export function innerDeleteMin<S extends InnerMutateSource<S, E>, E>(
	source: S,
): [E, S] {
	const [min, newFirst] = source.children[0].deleteMin();
	const newSelf = source.normalizeIncreaseChild(0, newFirst, source.size - 1);
	return [min, newSelf];
}

/**
 * Removes and returns the maximum entry from the right‑most child of the
 * given inner node and returns the updated node.
 * @param source - the inner node to operate on
 */
export function innerDeleteMax<S extends InnerMutateSource<S, E>, E>(
	source: S,
): [E, S] {
	const lastChildIndex = source.children.length - 1;
	const [max, newLast] = source.children[lastChildIndex].deleteMax();
	const newSelf = source.normalizeIncreaseChild(
		lastChildIndex,
		newLast,
		source.size - 1,
	);
	return [max, newSelf];
}

/**
 * Splits the given inner node into two nodes and returns the promoted
 * separator entry together with the new right node.<br/>
 * <br/>
 * The split position can be customised through the optional `index`.
 * @param source - the inner node to split
 * @param index - (optional) the split index, defaults to the middle entry
 */
export function innerMutateSplitRight<S extends InnerMutateSource<S, E>, E>(
	source: S,
	index = source.entries.length >>> 1,
): [E, S] {
	const size = source.size;
	const rightEntries = source.mutateEntries.splice(index - 1);
	const rightChildren = source.mutateChildren.splice(index);
	source.size = source.children.reduce(
		(r, c): number => r + c.size,
		source.entries.length,
	);
	const rightSize = size - source.size - 1;
	const upEntry = rightEntries.shift()!;
	const rightNode = source.copy(rightEntries, rightChildren, rightSize);

	return [upEntry, rightNode];
}

/**
 * Moves the given `toLeft` entry and its child from `source` to the left
 * sibling and returns the separator entry that should be stored in the
 * parent node.
 * @param source - the inner node donating an entry to the left sibling
 * @param left - the left sibling node to receive the entry and child
 * @param toLeft - the entry that must end up in the left sibling
 */
export function innerMutateGiveToLeft<S extends InnerMutateSource<S, E>, E>(
	source: S,
	left: S,
	toLeft: E,
): [E, S] {
	const toUp = source.mutateEntries.shift()!;
	const toLeftChild = source.mutateChildren.shift()!;
	source.size -= toLeftChild.size + 1;
	const newLeft = left.copy(
		Arr.append(left.entries, toLeft),
		Arr.append(left.children, toLeftChild),
		left.size + toLeftChild.size + 1,
	);
	return [toUp, newLeft];
}

/**
 * Moves the given `toRight` entry and its child from `source` to the right
 * sibling and returns the separator entry that should be stored in the
 * parent node.
 * @param source - the inner node donating an entry to the right sibling
 * @param right - the right sibling node to receive the entry and child
 * @param toRight - the entry that must end up in the right sibling
 */
export function innerMutateGiveToRight<S extends InnerMutateSource<S, E>, E>(
	source: S,
	right: S,
	toRight: E,
): [E, S] {
	const toUp = source.mutateEntries.pop()!;
	const toRightChild = source.mutateChildren.pop()!;
	source.size -= toRightChild.size + 1;
	const newRight = right.copy(
		Arr.prepend(right.entries, toRight),
		Arr.prepend(right.children, toRightChild),
		right.size + toRightChild.size + 1,
	);
	return [toUp, newRight];
}

/**
 * Pulls an entry and child from the left sibling into `source` and returns
 * the separator entry that should be stored in the parent node.
 * @param source - the inner node receiving the entry and child
 * @param left - the left sibling node to donate the entry and child
 * @param toMe - the entry that must end up in `source`
 */
export function innerMutateGetFromLeft<S extends InnerMutateSource<S, E>, E>(
	source: S,
	left: S,
	toMe: E,
): [E, S] {
	const toUp = left.entries.at(-1)!;
	const toMeChild = left.children.at(-1)!;
	const leftShrink = toMeChild.size + 1;
	const newLeft = left.copy(
		Arr.init(left.entries),
		Arr.init(left.children),
		left.size - leftShrink,
	);
	source.mutateEntries.unshift(toMe);
	source.mutateChildren.unshift(toMeChild);
	source.size += leftShrink;
	return [toUp, newLeft];
}

/**
 * Pulls an entry and child from the right sibling into `source` and returns
 * the separator entry that should be stored in the parent node.
 * @param source - the inner node receiving the entry and child
 * @param right - the right sibling node to donate the entry and child
 * @param toMe - the entry that must end up in `source`
 */
export function innerMutateGetFromRight<S extends InnerMutateSource<S, E>, E>(
	source: S,
	right: S,
	toMe: E,
): [E, S] {
	const toUp = right.entries[0];
	const toMeChild = right.children[0];
	const rightShrink = toMeChild.size + 1;
	const newLeft = right.copy(
		Arr.tail(right.entries),
		Arr.tail(right.children),
		right.size - rightShrink,
	);
	source.mutateEntries.push(toMe);
	source.mutateChildren.push(toMeChild);
	source.size += rightShrink;
	return [toUp, newLeft];
}

/**
 * Joins the given left sibling inner node and `source` into a single node by
 * inserting the given separator `entry` between them.
 * @param source - the right inner node that will absorb the left sibling
 * @param left - the left sibling node to merge
 * @param entry - the separator entry from the parent
 */
export function innerMutateJoinLeft<S extends InnerMutateSource<S, E>, E>(
	source: S,
	left: S,
	entry: E,
): void {
	source.mutateEntries.unshift(entry);
	source.entries = left.entries.concat(source.entries);
	source.children = left.children.concat(source.children);
	source.size += left.size + 1;
}

/**
 * Joins the given right sibling inner node and `source` into a single node by
 * inserting the given separator `entry` between them.
 * @param source - the left inner node that will absorb the right sibling
 * @param right - the right sibling node to merge
 * @param entry - the separator entry from the parent
 */
export function innerMutateJoinRight<S extends InnerMutateSource<S, E>, E>(
	source: S,
	right: S,
	entry: E,
): void {
	source.mutateEntries.push(entry);
	source.entries = source.entries.concat(right.entries);
	source.children = source.children.concat(right.children);
	source.size += right.size + 1;
}

/**
 * Normalises the given child after it has decreased in size so that it
 * satisfies the minimum entry constraint of the B‑tree.<br/>
 * <br/>
 * Depending on the neighbouring children this may rotate entries between
 * nodes or perform a split.
 * @param source - the inner node that contains the child
 * @param childIndex - the index of the child within `source`
 * @param newChild - the updated child node
 * @param newSize - the new total size for `source`
 */
export function innerNormalizeDownsizeChild<
	S extends InnerMutateSource<S, E>,
	E,
>(source: S, childIndex: number, newChild: InnerChild<E>, newSize: number): S {
	// try to shift
	const leftChild = source.children[childIndex - 1];
	const rightChild = source.children[childIndex + 1];

	if (
		(undefined === leftChild ||
			leftChild.entries.length >= source.context.maxEntries) &&
		(undefined === rightChild ||
			rightChild.entries.length >= source.context.maxEntries)
	) {
		// cannot shift
		const [upEntry, rightChild] = newChild.mutateSplitRight();
		const newEntries = Arr.insert(source.entries, childIndex, upEntry);
		const newChildren = source.children.toSpliced(
			childIndex,
			1,
			newChild,
			rightChild,
		);
		return source.copy(newEntries, newChildren, newSize);
	}

	if (
		undefined !== leftChild &&
		(undefined === rightChild ||
			rightChild.entries.length >= leftChild.entries.length)
	) {
		// shiftleft
		const [newSep, newLeft] = newChild.mutateGiveToLeft(
			leftChild,
			source.entries[childIndex - 1],
		);
		const newEntries = Arr.set(source.entries, childIndex - 1, newSep);
		const newChildren = source.children.toSpliced(
			childIndex - 1,
			2,
			newLeft,
			newChild,
		);
		return source.copy(newEntries, newChildren, newSize);
	}

	// shiftright
	const [newSep, newRight] = newChild.mutateGiveToRight(
		rightChild,
		source.entries[childIndex],
	);
	const newEntries = Arr.set(source.entries, childIndex, newSep);
	const newChildren = source.children.toSpliced(
		childIndex,
		2,
		newChild,
		newRight,
	);
	return source.copy(newEntries, newChildren, newSize);
}

/**
 * Normalises the given child after it has increased in size so that it
 * satisfies the maximum entry constraint of the B‑tree.<br/>
 * <br/>
 * Depending on the neighbouring children this may rotate entries between
 * nodes or merge nodes together.
 * @param source - the inner node that contains the child
 * @param childIndex - the index of the child within `source`
 * @param newChild - the updated child node
 * @param newSize - the new total size for `source`
 */
export function innerNormalizeIncreaseChild<
	S extends InnerMutateSource<S, E>,
	E,
>(source: S, childIndex: number, newChild: InnerChild<E>, newSize: number): S {
	if (newChild.entries.length >= source.context.minEntries) {
		const newChildren = Arr.set(source.children, childIndex, newChild);
		return source.copy(undefined, newChildren, newSize);
	}

	// try to shift
	const leftChild = source.children[childIndex - 1];
	const rightChild = source.children[childIndex + 1];

	if (
		(undefined === leftChild ||
			leftChild.entries.length <= source.context.minEntries) &&
		(undefined === rightChild ||
			rightChild.entries.length <= source.context.minEntries)
	) {
		// cannot shift
		if (undefined !== leftChild) {
			newChild.mutateJoinLeft(leftChild, source.entries[childIndex - 1]);
			const newEntries = source.entries.toSpliced(childIndex - 1, 1);
			const newChildren = source.children.toSpliced(
				childIndex - 1,
				2,
				newChild,
			);
			return source.copy(newEntries, newChildren, newSize);
		}

		newChild.mutateJoinRight(rightChild, source.entries[childIndex]);
		const newEntries = source.entries.toSpliced(childIndex, 1);
		const newChildren = source.children.toSpliced(childIndex, 2, newChild);
		return source.copy(newEntries, newChildren, newSize);
	}

	if (
		undefined !== leftChild &&
		(undefined === rightChild ||
			rightChild.entries.length <= leftChild.entries.length)
	) {
		// get from left
		const [newSep, newLeft] = newChild.mutateGetFromLeft(
			leftChild,
			source.entries[childIndex - 1],
		);
		const newEntries = Arr.set(source.entries, childIndex - 1, newSep);
		const newChildren = source.children.toSpliced(
			childIndex - 1,
			2,
			newLeft,
			newChild,
		);
		return source.copy(newEntries, newChildren, newSize);
	}

	// get from right
	const [newSep, newRight] = newChild.mutateGetFromRight(
		rightChild,
		source.entries[childIndex],
	);
	const newEntries = Arr.set(source.entries, childIndex, newSep);
	const newChildren = source.children.toSpliced(
		childIndex,
		2,
		newChild,
		newRight,
	);
	return source.copy(newEntries, newChildren, newSize);
}

/**
 * Returns the index of the element in the sources element array, or a tuple with the child index and the index within the child
 * @param source the collection to operate on
 * @param index the index to find
 */
export function innerGetSubIndex(
	source: InnerMutateSource<any, any>,
	index: number,
): number | [number, number] {
	let elemIndex = -1;
	let i = index;

	while (true) {
		if (elemIndex >= 0) {
			if (i === 0) return elemIndex;
			i--;
		} else {
			const childIndex = SortedIndex.next(elemIndex);
			const child = source.children[childIndex];
			if (i < child.size) return [childIndex, i];
			i -= child.size;
		}
		elemIndex = SortedIndex.next(elemIndex);
	}
}

/**
 * Returns the entry at the given `index` from the B‑tree represented by the
 * given inner node, or the provided fallback value if the index is out of
 * bounds.<br/>
 * <br/>
 * Negative indices are interpreted from the end of the collection.
 * @param source - the inner node to read from
 * @param index - the (possibly negative) index to look up
 * @param otherwise - (default: undefined) fallback value when out of bounds
 */
export function innerGetAtIndex<E, O>(
	source: InnerMutateSource<any, E>,
	index: number,
	otherwise?: OptLazy<O>,
): E | O {
	if (index >= source.size || -index > source.size)
		return OptLazy(otherwise) as O;
	if (index < 0) return innerGetAtIndex(source, source.size + index, otherwise);

	const subIndex = innerGetSubIndex(source, index);

	if (Array.isArray(subIndex))
		return source.children[subIndex[0]].at(subIndex[1], otherwise);
	return source.entries[subIndex];
}

/**
 * Returns a new inner node containing only the first `amount` of entries
 * and children of the given `source` node.<br/>
 * <br/>
 * The amount must be between `1` and `source.size - 1`.
 * @param source - the inner node to operate on
 * @param amount - the amount of entries to keep
 */
export function innerTakeInternal<S extends InnerMutateSource<S, E>, E>(
	source: S,
	amount: number,
): S {
	if (amount <= 0 || amount >= source.size) RimbuError.throwInvalidStateError();

	const indexResult = innerGetSubIndex(source, amount - 1);

	if (Array.isArray(indexResult)) {
		const [childIndex, inChildIndex] = indexResult;
		const untilChild = childIndex;
		const entries = source.entries.slice(0, untilChild);
		const children = source.children.slice(0, untilChild);
		const takeAmount = inChildIndex + 1;
		const lastChild = source.children[childIndex].takeInternal(takeAmount);
		children.push(lastChild);

		let result = source.context.inner(entries, children, amount);
		if (childIndex === 0) return result;

		while (result.children.at(-1)!.entries.length < source.context.minEntries) {
			result = result.normalizeIncreaseChild(
				result.entries.length,
				result.children.at(-1)!,
				amount,
			);
		}

		return result;
	}

	const elemIndex = indexResult;
	const entries = source.entries.slice(0, elemIndex);
	const children = source.children.slice(0, elemIndex + 1);
	return source.context
		.inner(entries, children, amount - 1)
		.addInternal(source.entries[elemIndex]);
}

/**
 * Returns a new inner node containing all entries and children of the given
 * `source` node except for the first `amount` entries.<br/>
 * <br/>
 * The amount must be between `1` and `source.size - 1`.
 * @param source - the inner node to operate on
 * @param amount - the amount of entries to drop
 */
export function innerDropInternal<S extends InnerMutateSource<S, E>, E>(
	source: S,
	amount: number,
): S {
	if (amount <= 0 || amount >= source.size) RimbuError.throwInvalidStateError();

	const newSize = source.size - amount;

	const indexResult = innerGetSubIndex(source, amount);

	if (Array.isArray(indexResult)) {
		const [childIndex, inChildIndex] = indexResult;
		const fromChild = childIndex;
		const entries = source.entries.slice(fromChild);
		const children = source.children.slice(fromChild + 1);
		const dropAmount = inChildIndex;
		const firstChild = source.children[childIndex].dropInternal(dropAmount);
		children.unshift(firstChild);

		let result = source.context.inner(entries, children, newSize);
		if (childIndex === source.entries.length) return result;

		while (result.children[0].entries.length < source.context.minEntries) {
			result = result.normalizeIncreaseChild(0, result.children[0], newSize);
		}

		return result;
	}

	const elemIndex = indexResult;
	const entries = source.entries.slice(elemIndex + 1);
	const children = source.children.slice(elemIndex + 1);
	return source.context
		.inner(entries, children, newSize - 1)
		.addInternal(source.entries[elemIndex]);
}

/**
 * Returns a `Stream` of entries of the given inner node limited to the
 * provided index `range`.<br/>
 * <br/>
 * When `reversed` is true, the stream iterates the selected range in
 * reverse order.
 * @param source - the inner node to stream from
 * @param range - the index range to include
 * @param reversed - (default: false) when true reverses the stream order
 */
export function innerStreamSlice<E>(
	source: InnerMutateSource<any, E>,
	range: IndexRange,
	reversed = false,
): Stream<E> {
	const result = IndexRange.getIndicesFor(range, source.size);

	if (result === 'all') return source.stream({ reversed });
	if (result === 'empty') return Stream.empty();

	const [startIndex, endIndex] = result;

	const startSubIndex = innerGetSubIndex(source, startIndex);
	const endSubIndex = innerGetSubIndex(source, endIndex);

	let startElemIndex = 0;
	let inStartElemIndex = 0;

	if (Array.isArray(startSubIndex)) {
		startElemIndex = SortedIndex.prev(startSubIndex[0]);
		inStartElemIndex = startSubIndex[1];
	} else {
		startElemIndex = startSubIndex;
	}

	let endElemIndex = 0;
	let inEndElemIndex = 0;

	if (Array.isArray(endSubIndex)) {
		endElemIndex = SortedIndex.prev(endSubIndex[0]);
		inEndElemIndex = endSubIndex[1];
	} else {
		endElemIndex = endSubIndex;
	}

	if (startElemIndex === endElemIndex) {
		if (startElemIndex >= 0) return Stream.of(source.entries[startElemIndex]);

		return source.children[SortedIndex.next(startElemIndex)].streamSlice(
			{
				start: inStartElemIndex,
				end: inEndElemIndex,
			},
			{ reversed },
		);
	}

	const indices = reversed
		? Stream.unfold(endElemIndex, (i, _, stop) =>
				SortedIndex.compare(i, startElemIndex) <= 0
					? stop
					: SortedIndex.prev(i),
			)
		: Stream.unfold(startElemIndex, (i, _, stop) =>
				SortedIndex.compare(i, endElemIndex) >= 0 ? stop : SortedIndex.next(i),
			);

	return indices.flatMap((index) => {
		if (index >= 0) return Stream.of(source.entries[index]);

		const childIndex = SortedIndex.next(index);
		const child = source.children[childIndex];

		if (index === startElemIndex) {
			return child.streamSlice({ start: inStartElemIndex }, { reversed });
		}
		if (index === endElemIndex) {
			return child.streamSlice({ end: inEndElemIndex }, { reversed });
		}

		return child.stream({ reversed });
	});
}

/**
 * The subset of a normal sorted collection that the shared node operations
 * need in order to chain `take`/`drop` on their results.
 * @typeparam TNormal - the normal (possibly empty) collection type
 */
export interface SortedNormal<TNormal> {
	take(amount: number): TNormal;
	drop(amount: number): TNormal;
}

/**
 * The part of a sorted B‑tree node that the shared node operations in
 * {@link SortedNode} rely on.
 *
 * It is intentionally structural so that the same implementations can serve
 * both the keyed `SortedMap` nodes (`E = readonly [K, V]`, `S = K`) and the
 * valued `SortedSet` nodes (`E = S = T`). `context` supplies the element
 * comparator and construction of an empty collection, while the B‑tree
 * specific operations (`getInsertIndexOf`, `takeInternal`, `dropInternal`, …)
 * are provided by the concrete leaf/inner nodes.
 * @typeparam E - the element type stored in the node
 * @typeparam S - the search/key type used for range and neighbour lookups
 * @typeparam TNormal - the normal (possibly empty) collection type
 */
export interface SortedNodeLike<E, S, TNormal> {
	readonly size: number;
	readonly context: {
		readonly comp: Comp<S>;
		empty(): TNormal;
	};
	getInsertIndexOf(search: S): number;
	at<O>(index: number, otherwise?: OptLazy<O>): E | O;
	streamSlice(range: IndexRange, options?: { reversed?: boolean }): Stream<E>;
	take(amount: number): TNormal;
	drop(amount: number): TNormal;
	takeInternal(amount: number): { normalize(): TNormal };
	dropInternal(amount: number): { normalize(): TNormal };
}

/**
 * The index‑based operations shared by the keyed `SortedMap` nodes and the
 * valued `SortedSet` nodes.
 *
 * They are expressed as functions over {@link SortedNodeLike} rather than as a
 * mixin because the keyed and valued collections bind the search type `S`
 * differently (`SortedMap` uses `S = K` with `E = readonly [K, V]`, whereas
 * `SortedSet` uses `S = E = T`). That binding is introduced by the
 * keyed/valued capability mixins and cannot be threaded through a single
 * shared mixin layer, so the logic lives here while each node keeps a thin,
 * correctly typed delegation.
 */
export namespace SortedNode {
	/**
	 * Returns the inclusive index range covered by the given key `range`, or
	 * the fallback indices when the range is unbounded.
	 * @param source - the node to operate on
	 * @param range - the key range to translate to indices
	 */
	export function getSliceRange<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		range: Range<S>,
	): { startIndex: number; endIndex: number } {
		const { start, end } = Range.getNormalizedRange(range);
		let startIndex = 0;
		let endIndex = source.size - 1;

		if (undefined !== start) {
			const [startValue, startInclude] = start;
			startIndex = source.getInsertIndexOf(startValue);

			if (startIndex < 0) {
				startIndex = SortedIndex.next(startIndex);
			} else if (!startInclude) {
				startIndex++;
			}
		}
		if (undefined !== end) {
			const [endValue, endInclude] = end;
			endIndex = source.getInsertIndexOf(endValue);

			if (endIndex < 0) endIndex = SortedIndex.prev(endIndex);
			else if (!endInclude) endIndex--;
		}

		return { startIndex, endIndex };
	}

	/**
	 * Streams the nodes elements whose key lies within the given `range`.
	 * @param source - the node to operate on
	 * @param range - the key range to include
	 * @param options - (optional) when `reversed`, streams in reverse order
	 */
	export function streamRange<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		range: Range<S>,
		options?: { reversed?: boolean },
	): Stream<E> {
		const { startIndex, endIndex } = getSliceRange(source, range);

		return source.streamSlice(
			{
				start: [startIndex, true],
				end: [endIndex, true],
			},
			options,
		);
	}

	/**
	 * Returns the index of the first element whose key is not less than
	 * `search`, or a negative insertion point when no such key exists.
	 * @param source - the node to operate on
	 * @param search - the key to look up
	 */
	export function lowerBound<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		search: S,
	): number {
		const index = source.getInsertIndexOf(search);
		return index >= 0 ? index : -index - 1;
	}

	/**
	 * Returns the index just past the last element whose key is not greater
	 * than `search`, or a negative insertion point when no such key exists.
	 * @param source - the node to operate on
	 * @param search - the key to look up
	 */
	export function upperBound<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		search: S,
	): number {
		const index = source.getInsertIndexOf(search);
		return index >= 0 ? index + 1 : -index - 1;
	}

	/**
	 * Returns the first element whose key is greater than `search`, or the
	 * fallback value when there is none.
	 * @param source - the node to operate on
	 * @param search - the key to look up
	 * @param options - (optional) `inclusive` includes equal keys, `otherwise`
	 * is the fallback value
	 */
	export function next<E, S, TNormal extends SortedNormal<TNormal>, O>(
		source: SortedNodeLike<E, S, TNormal>,
		search: S,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): E | O {
		const { inclusive = false, otherwise } = options;
		if (!source.context.comp.isComparable(search)) {
			return OptLazy(otherwise) as O;
		}

		const at = inclusive
			? lowerBound(source, search)
			: upperBound(source, search);

		return source.at(at, otherwise);
	}

	/**
	 * Returns the last element whose key is less than `search`, or the
	 * fallback value when there is none.
	 * @param source - the node to operate on
	 * @param search - the key to look up
	 * @param options - (optional) `inclusive` includes equal keys, `otherwise`
	 * is the fallback value
	 */
	export function previous<E, S, TNormal extends SortedNormal<TNormal>, O>(
		source: SortedNodeLike<E, S, TNormal>,
		search: S,
		options: { inclusive?: boolean | undefined; otherwise?: OptLazy<O> } = {},
	): E | O {
		const { inclusive = false, otherwise } = options;
		if (!source.context.comp.isComparable(search)) {
			return OptLazy(otherwise) as O;
		}

		const index = source.getInsertIndexOf(search);
		const at = index >= 0 ? (inclusive ? index : index - 1) : -index - 1 - 1;

		if (at < 0) return OptLazy(otherwise) as O;

		return source.at(at, otherwise);
	}

	/**
	 * Returns a collection with at most the first `amount` elements, or all but
	 * the last `-amount` elements when `amount` is negative.
	 * @param source - the node to operate on
	 * @param amount - the amount of elements to keep from the start
	 */
	export function take<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		amount: number,
	): TNormal {
		if (amount === 0) return source.context.empty();
		if (amount >= source.size || -amount > source.size) {
			return source as unknown as TNormal;
		}
		if (amount < 0) return drop(source, source.size + amount);

		return source.takeInternal(amount).normalize();
	}

	/**
	 * Returns a collection without the first `amount` elements, or with only
	 * the last `-amount` elements when `amount` is negative.
	 * @param source - the node to operate on
	 * @param amount - the amount of elements to drop from the start
	 */
	export function drop<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		amount: number,
	): TNormal {
		if (amount === 0) return source as unknown as TNormal;
		if (amount >= source.size || -amount > source.size) {
			return source.context.empty();
		}
		if (amount < 0) return take(source, source.size + amount);

		return source.dropInternal(amount).normalize();
	}

	/**
	 * Returns a collection containing only the elements within the given index
	 * `range`.
	 * @param source - the node to operate on
	 * @param range - the index range to keep
	 */
	export function sliceIndex<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		range: IndexRange,
	): TNormal {
		const indexRange = IndexRange.getIndicesFor(range, source.size);

		if (indexRange === 'empty') return source.context.empty();
		if (indexRange === 'all') return source as unknown as TNormal;

		const [start, end] = indexRange;

		return source.drop(start).take(end - start + 1);
	}

	/**
	 * Returns a collection containing only the elements within the given index
	 * range or key range.
	 * @param source - the node to operate on
	 * @param range - the index range or key range to keep
	 */
	export function slice<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		range: IndexRange | Range<S>,
	): TNormal {
		if (range && typeof range === 'object' && 'amount' in range) {
			return sliceIndex(source, range as IndexRange);
		}
		const { startIndex, endIndex } = getSliceRange(source, range as Range<S>);

		return sliceIndex(source, {
			start: [startIndex, true],
			end: [endIndex, true],
		});
	}

	/**
	 * Splits the node into the elements before and from the given `amount`.
	 * @param source - the node to operate on
	 * @param amount - the index at which to split
	 */
	export function splitAt<E, S, TNormal extends SortedNormal<TNormal>>(
		source: SortedNodeLike<E, S, TNormal>,
		amount: number,
	): [TNormal, TNormal] {
		return [take(source, amount), drop(source, amount)];
	}
}

/**
 * Abstract base class for mutable sorted builders used by the sorted map
 * and set implementations.<br/>
 * <br/>
 * It encapsulates the shared tree‑based logic for computing `min`, `max`,
 * index‑based access and traversal while allowing concrete builders to plug
 * in their own entry and child representations.
 * @typeparam E - the entry type stored in the builder
 */
export abstract class SortedBuilder<E> {
	abstract get context(): { minEntries: number; maxEntries: number };
	abstract source?:
		| undefined
		| {
				min<O>(otherwise?: OptLazy<O>): E | O;
				max<O>(otherwise?: OptLazy<O>): E | O;
				at<O>(index: number, otherwise?: OptLazy<O>): E | O;
				forEach(
					f: (entry: E, index: number, halt: () => void) => void,
					options?: { state?: TraverseState },
				): void;
		  };
	abstract _entries?: undefined | E[];
	abstract _children?: undefined | SortedBuilder<E>[];
	abstract get children(): any;
	abstract set children(value: any);
	abstract size: number;
	abstract prepareMutate(): void;
	abstract createNew(...args: any[]): SortedBuilder<E>;

	_lock = 0;

	/**
	 * Throws an error when the builder is mutated while it is being iterated,
	 * for example from within {@link SortedBuilder.forEach}.
	 */
	checkLock(): void {
		if (this._lock) RimbuError.throwModifiedBuilderWhileLoopingOverItError();
	}

	get entries(): E[] {
		this.prepareMutate();
		return this._entries!;
	}

	set entries(value: E[]) {
		this.prepareMutate();
		this.source = undefined;
		this._entries = value;
	}

	get hasChildren(): boolean {
		return undefined !== this._children && this._children.length > 0;
	}

	get isEmpty(): boolean {
		return this.size === 0;
	}

	// permissive indexed WithRemoveAt for builder
	removeAt(..._args: any[]): any {
		return undefined as any;
	}
	removeAtAndReturn?(..._args: any[]): any {}
	removeAmountAt(..._args: any[]): any {
		return false;
	}
	removeAllAt(..._args: any[]): any {
		return false;
	}

	/**
	 * Returns the minimum entry of the builder, or the given fallback value
	 * if the builder is empty.
	 * @param otherwise - (default: undefined) fallback value when empty
	 */
	min<O>(otherwise?: OptLazy<O>): E | O {
		if (undefined !== this.source) return this.source.min(otherwise);

		if (this.size === 0) return OptLazy(otherwise) as O;

		if (this.hasChildren) return this.children[0].min(otherwise);
		return this.entries[0];
	}

	/**
	 * Returns the maximum entry of the builder, or the given fallback value
	 * if the builder is empty.
	 * @param otherwise - (default: undefined) fallback value when empty
	 */
	max<O>(otherwise?: OptLazy<O>): E | O {
		if (undefined !== this.source) return this.source.max(otherwise);

		if (this.size === 0) return OptLazy(otherwise) as O;

		if (this.hasChildren) return this.children.at(-1)!.max(otherwise);
		else return this.entries.at(-1)!;
	}

	/**
	 * Returns the entry at the given `index`, or the provided fallback value
	 * when the index is out of bounds.<br/>
	 * <br/>
	 * Negative indices are interpreted from the end of the builder.
	 * @param index - the (possibly negative) index to look up
	 * @param otherwise - (default: undefined) fallback value when out of bounds
	 */
	at<O>(index: number, otherwise?: OptLazy<O>): E | O {
		if (undefined !== this.source) {
			return this.source.at(index, otherwise);
		}

		if (index >= this.size || -index > this.size) {
			return OptLazy(otherwise) as O;
		}

		if (index < 0) {
			return this.at(this.size + index, otherwise);
		}

		if (!this.hasChildren) return this.entries[index];

		let elemIndex = -1;
		let i = index;

		while (true) {
			if (elemIndex >= 0) {
				if (i === 0) return this.entries[elemIndex];
				i--;
			} else {
				const childIndex = SortedIndex.next(elemIndex);
				const child = this.children[childIndex];

				if (i < child.size) return child.at(i, otherwise);
				i -= child.size;
			}
			elemIndex = SortedIndex.next(elemIndex);
		}
	}

	/**
	 * Calls the given function `f` for every entry in the builder in key
	 * sort‑order, passing in the entry, its zero‑based index and a `halt`
	 * function that can be used to stop iteration early.
	 * @param f - the callback function to invoke for each entry
	 * @param options - (optional) traversal options including a custom state
	 */
	forEach(
		f: (entry: E, index: number, halt: () => void) => void,
		options: { state?: TraverseState } = {},
	): void {
		const { state = TraverseState() } = options;

		if (state.halted || this.isEmpty) return;

		this._lock++;

		if (undefined !== this.source) {
			this.source.forEach(f, { state });
		} else {
			if (!this.hasChildren) {
				Arr.forEach(this.entries, f, state);
			} else {
				let i = -1;
				const entryLength = this.entries.length;
				const { halt } = state;

				while (!state.halted && i < entryLength) {
					if (i >= 0) f(this.entries[i], state.nextIndex(), halt);
					else {
						const childIndex = SortedIndex.next(i);
						this.children[childIndex].forEach(f, { state });
					}
					i = SortedIndex.next(i);
				}
			}
		}

		this._lock--;
	}

	/**
	 * Restores the builder invariants after mutations by splitting the root
	 * node when it grows beyond the configured maximum block size.
	 */
	normalize(): void {
		if (this.entries.length === 0) {
			if (!this.hasChildren) return;

			const firstChild = this.children[0];
			this.entries = firstChild.entries;
			this.children = firstChild.children;
			this.size = firstChild.size;
			return;
		}

		if (this.entries.length <= this.context.maxEntries) return;

		const index = this.entries.length >>> 1;
		const leftEntries = this.entries;
		const rightEntries = leftEntries.splice(index);
		const upEntry = rightEntries.shift()!;

		if (!this.hasChildren) {
			const leftNode = this.createNew(
				undefined,
				leftEntries,
				undefined,
				leftEntries.length,
			);
			const rightNode = this.createNew(
				undefined,
				rightEntries,
				undefined,
				rightEntries.length,
			);
			this.entries = [upEntry];
			this.children = [leftNode, rightNode];
		} else {
			const leftChildren = this.children;
			const rightChildren = leftChildren.splice(index + 1);
			const leftSize = leftChildren.reduce(
				(r: number, c: SortedBuilder<E>): number => r + c.size,
				leftEntries.length,
			);
			const rightSize = this.size - leftSize - 1;
			const leftNode = this.createNew(
				undefined,
				leftEntries,
				leftChildren,
				leftSize,
			);
			const rightNode = this.createNew(
				undefined,
				rightEntries,
				rightChildren,
				rightSize,
			);
			this.entries = [upEntry];
			this.children = [leftNode, rightNode];
		}
	}

	// check whether child at given `childIndex` has gotten too small
	// get from neighbouring children if it is too small so child increases
	normalizeChildIncrease(childIndex: number): void {
		const child = this.children[childIndex];
		if (child.entries.length >= this.context.minEntries) return;

		const leftChild = this.children[childIndex - 1];
		const rightChild = this.children[childIndex + 1];

		if (
			(undefined === leftChild ||
				leftChild.entries.length <= this.context.minEntries) &&
			(undefined === rightChild ||
				rightChild.entries.length <= this.context.minEntries)
		) {
			// cannot shift
			if (undefined !== leftChild) {
				// join left
				leftChild.source = undefined;
				const [down] = this.entries.splice(childIndex - 1, 1);
				leftChild.entries.push(down);
				leftChild.entries = leftChild.entries.concat(child.entries);
				leftChild.size += child.size + 1;

				if (leftChild.hasChildren) {
					leftChild.children = leftChild.children.concat(child.children);
				}
				this.children.splice(childIndex, 1);
				return;
			}

			// join right
			rightChild.source = undefined;
			child.source = undefined;
			const [down] = this.entries.splice(childIndex, 1);
			rightChild.entries.unshift(down);
			rightChild.entries = child.entries.concat(rightChild.entries);
			rightChild.size += child.size + 1;

			if (rightChild.hasChildren) {
				rightChild.children = child.children.concat(rightChild.children);
			}
			this.children.splice(childIndex, 1);
			return;
		}

		if (
			undefined !== leftChild &&
			(undefined === rightChild ||
				rightChild.entries.length < leftChild.entries.length)
		) {
			// get from left
			child.source = undefined;
			leftChild.source = undefined;
			child.entries.unshift(this.entries[childIndex - 1]);
			child.size++;
			this.entries[childIndex - 1] = leftChild.entries.pop()!;
			leftChild.size--;

			if (leftChild.hasChildren) {
				const shiftChild = leftChild.children.pop()!;
				child.children.unshift(shiftChild);
				leftChild.size -= shiftChild.size;
				child.size += shiftChild.size;
			}

			return;
		}

		// get from right
		child.source = undefined;
		rightChild.source = undefined;
		child.entries.push(this.entries[childIndex]);
		child.size++;
		this.entries[childIndex] = rightChild.entries.shift()!;
		rightChild.size--;

		if (rightChild.hasChildren) {
			const shiftChild = rightChild.children.shift()!;
			child.children.push(shiftChild);
			rightChild.size -= shiftChild.size;
			child.size += shiftChild.size;
		}
	}

	// check whether child at given `childIndex` has gotten too large
	// shift to neighbouring children if it is too large so child decreases
	normalizeChildDecrease(childIndex: number): void {
		const child = this.children[childIndex];

		if (child.entries.length <= this.context.maxEntries) return;

		const leftChild = this.children[childIndex - 1];
		const rightChild = this.children[childIndex + 1];

		if (
			(undefined === leftChild ||
				leftChild.entries.length >= this.context.maxEntries) &&
			(undefined === rightChild ||
				rightChild.entries.length >= this.context.maxEntries)
		) {
			// need to split child
			child.source = undefined;
			const index = (child.entries.length >>> 1) + 1;
			const preSize = child.size;
			const rightEntries = child.entries.splice(index);
			const upEntry = child.entries.pop()!;
			let rightChildren: SortedBuilder<E>[] | undefined;

			if (child.hasChildren) {
				rightChildren = child.children.splice(index);

				child.size = child.children.reduce(
					(r: any, c: any): number => r + c.size,
					child.entries.length,
				);
			} else {
				child.size = child.entries.length;
			}
			const rightSize = preSize - child.size - 1;

			const rightNode = this.createNew(
				undefined,
				rightEntries,
				rightChildren,
				rightSize,
			);

			this.entries.splice(childIndex, 0, upEntry);
			this.children.splice(childIndex + 1, 0, rightNode);

			return;
		}

		if (
			undefined !== leftChild &&
			(undefined === rightChild ||
				rightChild.entries.length >= leftChild.entries.length)
		) {
			// shiftleft
			leftChild.source = undefined;
			child.source = undefined;

			leftChild.entries.push(this.entries[childIndex - 1]);
			leftChild.size++;
			this.entries[childIndex - 1] = child.entries.shift()!;
			child.size--;

			if (child.hasChildren) {
				const shiftChild = child.children.shift()!;
				leftChild.children.push(shiftChild);
				leftChild.size += shiftChild.size;
				child.size -= shiftChild.size;
			}

			return;
		}

		rightChild.source = undefined;
		child.source = undefined;
		rightChild.entries.unshift(this.entries[childIndex]);
		rightChild.size++;
		this.entries[childIndex] = child.entries.pop()!;
		child.size--;

		if (child.hasChildren) {
			const shiftChild = child.children.pop()!;
			rightChild.children.unshift(shiftChild);
			rightChild.size += shiftChild.size;
			child.size -= shiftChild.size;
		}
	}

	/**
	 * Removes and returns the minimum entry from the builder while keeping
	 * the internal B‑tree structure valid.
	 */
	deleteMin(): E {
		this.size--;

		if (!this.hasChildren) return this.entries.shift()!;

		const result = this.children[0].deleteMin();
		this.normalizeChildIncrease(0);
		return result;
	}

	/**
	 * Removes and returns the maximum entry from the builder while keeping
	 * the internal B‑tree structure valid.
	 */
	deleteMax(): E {
		this.size--;

		if (!this.hasChildren) return this.entries.pop()!;

		const lastChildIndex = this.children.length - 1;
		const result = this.children[lastChildIndex].deleteMax();
		this.normalizeChildIncrease(lastChildIndex);
		return result;
	}
}
