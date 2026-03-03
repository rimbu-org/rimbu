import type { Elem, WithElem } from '@rimbu/collection-types/common';
import type { LeafBlock } from './immutable/leaf-block';
import type { LeafTree } from './immutable/leaf-tree';
import type { NonLeafBlock } from './immutable/non-leaf-block';
import type { NonLeafTree } from './immutable/non-leaf-tree';

export interface ListBase<T, Tp extends ListBase.Types = ListBase.Types> {
	append(value: T): WithElem<Tp, T>['nonEmpty'];
}

export namespace ListBase {
	export interface NonEmpty<T, Tp extends ListBase.Types = ListBase.Types>
		extends ListBase<T, Tp> {}

	export interface Builder<T, Tp extends ListBase.Types = ListBase.Types> {
		a: 1;
	}

	export interface Context {
		leafBlock<T>(): LeafBlock<T>;
		leafTree<T>(): LeafTree<T>;
		nonLeafBlock<T>(): NonLeafBlock<T>;
		nonLeafTree<T>(): NonLeafTree<T>;
	}

	export interface Types extends Elem {
		readonly normal: ListBase<this['_T']>;
		readonly nonEmpty: ListBase.NonEmpty<this['_T']>;
		readonly builder: ListBase.Builder<this['_T']>;
	}
}
