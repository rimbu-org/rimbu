import { Arr, RimbuError } from '@rimbu/base';
import { IndexRange, TraverseState, Update } from '@rimbu/common';
import { Stream } from '@rimbu/stream';

import type { Block, Tree } from '@rimbu/list/custom';

export function treeStream<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: Tree<T, TS, TB, C>, range?: IndexRange, reversed = false): Stream<T> {
  const indexRange = IndexRange.getIndicesFor(
    range ?? { start: 0 },
    tree.length
  );

  if (indexRange === 'empty') return Stream.empty() as Stream.NonEmpty<T>;
  if (indexRange === 'all') {
    const rightStream = tree.right.stream(reversed);
    const leftStream = tree.left.stream(reversed);

    if (null === tree.middle) {
      if (reversed) return rightStream.concat(leftStream);
      return leftStream.concat(rightStream);
    }

    const middleStream = tree.middle.stream(reversed);

    if (reversed) return rightStream.concat(middleStream, leftStream);
    return leftStream.concat(middleStream, rightStream);
  }

  const [start, end] = indexRange;

  const leftStream = tree.left.streamRange({ start, end }, reversed);

  if (null === tree.middle) {
    const rightStart = Math.max(0, start - tree.left.length);
    const rightEnd = end - tree.left.length;

    if (rightEnd < 0) return leftStream;

    const rightStream = tree.right.streamRange(
      { start: rightStart, end: rightEnd },
      reversed
    );

    if (reversed) return rightStream.concat(leftStream);
    return leftStream.concat(rightStream);
  }

  const middleStart = Math.max(0, start - tree.left.length);
  const middleEnd = end - tree.left.length;

  if (middleEnd < 0) return leftStream;

  const middleStream = tree.middle.streamRange(
    { start: middleStart, end: middleEnd },
    reversed
  );

  const rightStart = Math.max(0, middleStart - tree.middle.length);
  const rightEnd = middleEnd - tree.middle.length;

  if (rightEnd < 0) {
    if (reversed) return middleStream.concat(leftStream);
    return leftStream.concat(middleStream);
  }
  const rightStream = tree.right.streamRange(
    { start: rightStart, end: rightEnd },
    reversed
  );

  if (reversed) return rightStream.concat(middleStream, leftStream);
  return leftStream.concat(middleStream, rightStream);
}

export function treeGet<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: Tree<T, TS, TB, C>, index: number): T {
  const middleIndex = index - tree.left.length;

  if (middleIndex < 0) {
    return tree.left.get(index, RimbuError.throwInvalidStateError);
  }

  if (null === tree.middle) {
    return tree.right.get(middleIndex, RimbuError.throwInvalidStateError);
  }

  const rightIndex = middleIndex - tree.middle.length;

  if (rightIndex < 0) return tree.middle.get(middleIndex);

  return tree.right.get(rightIndex, RimbuError.throwInvalidStateError);
}

export function treePrepend<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: Tree<T, TS, TB, C>, child: C): TS {
  if (tree.left.canAddChild) {
    const newLeft = tree.left.prependInternal(child);
    return tree.copy(newLeft);
  }

  if (null === tree.middle && tree.right.canAddChild) {
    if (tree.context.isReversedLeafBlock<any>(tree.left)) {
      const newLeftChildren = Arr.splice(tree.left.children, 0, 1);
      newLeftChildren.push(child);
      const moveRightChild = tree.left.children[0];
      const newLeftLength =
        tree.left.length -
        tree.getChildLength(moveRightChild) +
        tree.getChildLength(child);
      const newLeft = tree.left.copy(newLeftChildren, newLeftLength);
      const newRight = tree.right.prependInternal(moveRightChild);
      return tree.copy(newLeft, newRight);
    }

    const newLeftChildren = Arr.splice(
      tree.left.children,
      tree.context.maxBlockSize - 1,
      1
    );
    newLeftChildren.unshift(child);
    const moveRightChild = Arr.last(tree.left.children);
    const newLeftLength =
      tree.left.length -
      tree.getChildLength(moveRightChild) +
      tree.getChildLength(child);
    const newLeft = tree.left.copy(newLeftChildren, newLeftLength);
    const newRight = tree.right.prependInternal(moveRightChild);
    return tree.copy(newLeft, newRight);
  }

  const newMiddle = tree.prependMiddle(tree.left);
  const newLeft = tree.left.copy([child], tree.getChildLength(child));

  return tree.copy(newLeft, undefined, newMiddle);
}

export function treeAppend<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: Tree<T, TS, TB, C>, child: C): TS {
  if (tree.right.canAddChild) {
    const newRight = tree.right.appendInternal(child);
    return tree.copy(undefined, newRight);
  }

  if (null === tree.middle && tree.left.canAddChild) {
    if (tree.context.isReversedLeafBlock<any>(tree.right)) {
      const newRightChildren = Arr.splice(
        tree.right.children,
        tree.right.children.length - 1,
        1
      );
      newRightChildren.unshift(child);
      const moveLeftChild = Arr.last(tree.right.children);
      const newRightLength =
        tree.right.length -
        tree.getChildLength(moveLeftChild) +
        tree.getChildLength(child);
      const newRight = tree.right.copy(newRightChildren, newRightLength);
      const newLeft = tree.left.appendInternal(moveLeftChild);
      return tree.copy(newLeft, newRight);
    }

    const newRightChildren = Arr.splice(tree.right.children, 0, 1);
    newRightChildren.push(child);
    const moveLeftChild = tree.right.children[0];
    const newRightLength =
      tree.right.length -
      tree.getChildLength(moveLeftChild) +
      tree.getChildLength(child);
    const newRight = tree.right.copy(newRightChildren, newRightLength);
    const newLeft = tree.left.appendInternal(moveLeftChild);
    return tree.copy(newLeft, newRight);
  }

  const newMiddle = tree.appendMiddle(tree.right);
  const newRight = tree.right.copy([child], tree.getChildLength(child));

  return tree.copy(undefined, newRight, newMiddle);
}

export function treeUpdate<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: any, index: number, update: Update<T>): TS {
  const middleIndex = index - tree.left.length;

  if (middleIndex < 0) {
    const newLeft = tree.left.updateAt(index, update);
    return tree.copy(newLeft);
  }

  if (null === tree.middle) {
    const newRight = tree.right.updateAt(middleIndex, update);
    return tree.copy(undefined, newRight);
  }

  const rightIndex = middleIndex - tree.middle.length;

  if (rightIndex >= 0) {
    const newRight = tree.right.updateAt(rightIndex, update);
    return tree.copy(undefined, newRight);
  }

  const newMiddle = tree.middle.updateAt(middleIndex, update);
  return tree.copy(undefined, undefined, newMiddle);
}

export function treeToArray<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(tree: Tree<T, TS, TB, C>, range?: IndexRange, reversed = false): T[] {
  const indexRange = IndexRange.getIndicesFor(
    range ?? { start: 0 },
    tree.length
  );

  if (indexRange === 'empty') return [];
  if (indexRange === 'all') {
    const leftArray = tree.left.toArray(undefined, reversed);
    const rightArray = tree.right.toArray(undefined, reversed);

    if (null === tree.middle) {
      if (reversed) return rightArray.concat(leftArray);
      return leftArray.concat(rightArray);
    }

    const middleArray = tree.middle.toArray(undefined, reversed);

    if (reversed) return rightArray.concat(middleArray, leftArray);
    return leftArray.concat(middleArray, rightArray);
  }

  const [start, end] = indexRange;

  const leftArray = tree.left.toArray({ start, end }, reversed);

  if (null === tree.middle) {
    const rightStart = Math.max(0, start - tree.left.length);
    const rightEnd = end - tree.left.length;

    if (rightEnd < 0) return leftArray;

    const rightArray = tree.right.toArray(
      { start: rightStart, end: rightEnd },
      reversed
    );

    if (reversed) return rightArray.concat(leftArray);
    return leftArray.concat(rightArray);
  }

  const middleStart = Math.max(0, start - tree.left.length);
  const middleEnd = end - tree.left.length;

  if (middleEnd < 0) return leftArray;

  const middleArray = tree.middle.toArray(
    { start: middleStart, end: middleEnd },
    reversed
  );

  const rightStart = Math.max(0, middleStart - tree.middle.length);
  const rightEnd = middleEnd - tree.middle.length;

  if (rightEnd < 0) {
    if (reversed) return middleArray.concat(leftArray);
    return leftArray.concat(middleArray);
  }

  const rightArray = tree.right.toArray(
    { start: rightStart, end: rightEnd },
    reversed
  );

  if (reversed) return rightArray.concat(middleArray, leftArray);
  return leftArray.concat(middleArray, rightArray);
}

export function treeForEach<
  T,
  TS extends Tree<T, TS, TB, C>,
  TB extends Block<T, TB, C>,
  C
>(
  tree: Tree<T, TS, TB, C>,
  f: (value: T, index: number, halt: () => void) => void,
  state: TraverseState
): void {
  if (state.halted) return;

  tree.left.forEach(f, state);

  if (state.halted) return;

  if (null !== tree.middle) {
    tree.middle.forEach(f, state);
  }

  if (state.halted) return;

  tree.right.forEach(f, state);
}
