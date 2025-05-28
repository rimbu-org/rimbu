import { Stream } from '@rimbu/core';
import { positionsToString } from './show.mjs';

export interface Condition {
  min: number;
  max?: number | undefined;
}

export abstract class TreeNode {
  abstract get isNullable(): boolean;
  abstract get firstPositions(): bigint;
  abstract get lastPositions(): bigint;

  abstract stream(): Stream<TreeNode>;
}

export class EmptyNode extends TreeNode {
  get isNullable(): boolean {
    return true;
  }
  get firstPositions(): bigint {
    return 0n;
  }
  get lastPositions(): bigint {
    return 0n;
  }
  stream(): Stream<TreeNode> {
    return Stream.of(this);
  }

  override toString(): string {
    return `EmptyNode`;
  }

  toJSON(): any {
    return {
      type: 'EmptyNode',
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
    };
  }
}

export const EMPTY_NODE = new EmptyNode();

export abstract class PositionNode extends TreeNode {
  readonly #positions: bigint;

  constructor(readonly position: number) {
    super();
    this.#positions = 1n << BigInt(position);
  }

  abstract get keyInfo(): [key: any, isNeg: boolean];

  get firstPositions(): bigint {
    return this.#positions;
  }

  get lastPositions(): bigint {
    return this.#positions;
  }

  get positions(): bigint {
    return this.#positions;
  }

  override stream(): Stream<TreeNode> {
    return Stream.of(this);
  }
}

export const END_SYMBOL_KEY = Symbol('EndNode');

export class EndNode extends PositionNode {
  constructor(position: number) {
    super(position);
  }

  get isNullable(): boolean {
    return false;
  }

  override get keyInfo(): [key: any, isNeg: boolean] {
    return [END_SYMBOL_KEY, false];
  }

  override toString(): string {
    return `EndNode(${this.position})`;
  }

  toJSON(): any {
    return {
      type: 'EndNode',
      position: this.position,
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
    };
  }
}

export class MatchNode<T> extends PositionNode {
  constructor(
    readonly token: T,
    position: number,
    readonly neg: boolean
  ) {
    super(position);
  }

  get isNullable(): boolean {
    return false;
  }

  override get keyInfo(): any {
    return [this.token, this.neg];
  }

  override toString(): string {
    return `Match(${this.neg ? '!' : ''}${this.token},${this.position})`;
  }

  toJSON(): any {
    return {
      type: 'MatchNode',
      position: this.position,
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      token: this.token,
      neg: this.neg,
    };
  }
}

export class PredNode<T> extends PositionNode {
  constructor(
    readonly pred: (value: T) => boolean,
    position: number,
    readonly neg: boolean
  ) {
    super(position);
  }

  get isNullable(): boolean {
    return false;
  }

  override get keyInfo(): [key: any, isNeg: boolean] {
    return [this.pred, this.neg];
  }

  override toString(): string {
    return `Pred(${this.position})`;
  }

  toJSON(): any {
    return {
      type: 'PredNode',
      position: this.position,
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      neg: this.neg,
    };
  }
}

export class OrNode extends TreeNode {
  constructor(
    readonly left: TreeNode,
    readonly right: TreeNode
  ) {
    super();
  }

  get isNullable(): boolean {
    return this.left.isNullable || this.right.isNullable;
  }

  get firstPositions(): bigint {
    return this.left.firstPositions | this.right.firstPositions;
  }

  get lastPositions(): bigint {
    return this.left.lastPositions | this.right.lastPositions;
  }

  override stream(): Stream<TreeNode> {
    return Stream.from(this.left.stream(), [this], this.right.stream());
  }

  override toString(): string {
    return `Or(${this.left},${this.right})`;
  }

  toJSON(): any {
    return {
      type: 'OrNode',
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      left: this.left,
      right: this.right,
    };
  }
}

export class SeqNode extends TreeNode {
  constructor(
    readonly left: TreeNode,
    readonly right: TreeNode
  ) {
    super();
  }

  get isNullable(): boolean {
    return this.left.isNullable && this.right.isNullable;
  }

  get firstPositions(): bigint {
    return this.left.isNullable
      ? this.left.firstPositions | this.right.firstPositions
      : this.left.firstPositions;
  }

  get lastPositions(): bigint {
    return this.right.isNullable
      ? this.left.lastPositions | this.right.lastPositions
      : this.right.lastPositions;
  }

  override stream(): Stream<TreeNode> {
    return Stream.from(
      this.left.stream(),
      Stream.of(this),
      this.right.stream()
    );
  }

  override toString(): string {
    return `Seq(${this.left}, ${this.right})`;
  }

  toJSON(): any {
    return {
      type: 'SeqNode',
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      left: this.left,
      right: this.right,
    };
  }
}

export abstract class RepeatNode extends TreeNode {
  abstract get min(): number;
  abstract get max(): number | undefined;
  abstract get repeatNodeId(): number;
  abstract cloneWithRepeatNodeId(repeatNodeId: number): RepeatNode;

  constructor(readonly child: TreeNode) {
    super();
  }

  get firstPositions(): bigint {
    return this.child.firstPositions;
  }

  get lastPositions(): bigint {
    return this.child.lastPositions;
  }

  override stream(): Stream<TreeNode> {
    return Stream.from(this.child.stream()).prepend(this);
  }
}

export class ZeroOrMoreRepeatNode extends RepeatNode {
  constructor(child: TreeNode) {
    super(child);
  }

  get min(): number {
    return 0;
  }

  get max(): number | undefined {
    return undefined;
  }

  override get repeatNodeId(): number {
    throw new Error('Not implemented');
  }

  override cloneWithRepeatNodeId(repeatNodeId: number): RepeatNode {
    throw new Error('Not implemented');
  }

  get isNullable(): boolean {
    return true;
  }

  override toString(): string {
    return `Repeat(${this.child})[*]`;
  }

  toJSON(): any {
    return {
      type: 'ZeroOrMoreRepeatNode',
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      child: this.child,
    };
  }
}

export class ExactAmountRepeatNode extends RepeatNode {
  constructor(
    child: TreeNode,
    readonly amount: number,
    readonly repeatNodeId: number
  ) {
    super(child);

    if (amount <= 1) {
      throw new RangeError(
        `Amount must be greater than 1, received: ${amount}`
      );
    }
  }

  get min(): number {
    return this.amount;
  }

  get max(): number {
    return this.amount;
  }

  get isNullable(): boolean {
    return this.child.isNullable;
  }

  override cloneWithRepeatNodeId(repeatNodeId: number): RepeatNode {
    return new ExactAmountRepeatNode(this.child, this.amount, repeatNodeId);
  }

  override toString(): string {
    return `Repeat(${this.child}){${this.repeatNodeId}}[${this.amount}]`;
  }

  toJSON(): any {
    return {
      type: 'ExactAmountRepeatNode',
      amount: this.amount,
      repeatNodeId: this.repeatNodeId,
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      child: this.child,
    };
  }
}

export class MaxAmountRepeatNode extends RepeatNode {
  constructor(
    child: TreeNode,
    readonly max: number,
    readonly repeatNodeId: number
  ) {
    super(child);

    if (max <= 0) {
      throw new RangeError(`Max must be greater than 0: ${max}`);
    }
  }

  get min(): number {
    return 0;
  }

  get isNullable(): boolean {
    return true;
  }

  override cloneWithRepeatNodeId(repeatNodeId: number): RepeatNode {
    return new MaxAmountRepeatNode(this.child, this.max, repeatNodeId);
  }

  override toString(): string {
    return `Repeat(${this.child}){${this.repeatNodeId}}[0-${this.max}]`;
  }

  toJSON(): any {
    return {
      type: 'MaxAmountRepeatNode',
      max: this.max,
      repeatNodeId: this.repeatNodeId,
      firstPositions: positionsToString(this.firstPositions),
      lastPositions: positionsToString(this.lastPositions),
      child: this.child,
    };
  }
}

export function createSeq(node1: TreeNode, node2: TreeNode): TreeNode {
  if (node1 === EMPTY_NODE) {
    return node2;
  }
  if (node2 === EMPTY_NODE) {
    return node1;
  }

  if (node1 instanceof SeqNode) {
    return new SeqNode(node1.left, createSeq(node1.right, node2));
  }

  return new SeqNode(node1, node2);
}

export function createOr(node1: TreeNode, node2: TreeNode): TreeNode {
  if (node1 === EMPTY_NODE) {
    return node2;
  }
  if (node2 === EMPTY_NODE) {
    return node1;
  }

  if (node1 instanceof OrNode) {
    return new OrNode(node1.left, createOr(node1.right, node2));
  }

  return new OrNode(node1, node2);
}
