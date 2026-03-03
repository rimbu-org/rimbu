import type { Elem, WithElem } from '@rimbu/collection-types/common';

import { OptLazy } from '@rimbu/common/opt-lazy';

interface List<T> extends ListBase<T, ListInternal.Types> {}

namespace List {
	export interface NonEmpty<T>
		extends List<T>,
			ListBase.NonEmpty<T, ListInternal.Types> {}

	export interface Context extends ListBase.Context<ListInternal.Types> {
		readonly typeTag: 'List';
	}
}

namespace ListInternal {
	export interface Types extends ListBase.Types {
		readonly _UT: any;
		readonly context: List.Context;
		readonly normal: List<this['_T']>;
		readonly nonEmpty: List.NonEmpty<this['_T']>;
	}
}

interface ListBase<T, Tp extends ListBase.Types = ListBase.Types> {
	get length(): number;
	get(index: number): T;
	reversed(): List<T>;
}

namespace ListBase {
	export interface NonEmpty<T, Tp extends ListBase.Types = ListBase.Types>
		extends ListBase<T, Tp> {
		reversed(): List.NonEmpty<T>;
	}

	export interface Context<Tp extends ListBase.Types = ListBase.Types> {
		readonly typeTag: string;

		createContext(options: number): WithElem<Tp, Tp['_UT']>['context'];
		empty<T extends Tp['_UT']>(): WithElem<Tp, T>['nonEmpty'];
	}

	export interface Types extends Elem {
		readonly _UT: unknown;
		readonly context: ListBase.Context;
		readonly normal: ListBase<this['_T']>;
		readonly nonEmpty: ListBase.NonEmpty<this['_T']>;
	}
}

interface ListImpl<T, C> extends ListBase<T, ListImpl.Types<C>> {}

namespace ListImpl {
	export interface NonEmpty<T, C>
		extends ListImpl<T, C>,
			ListBase.NonEmpty<T, ListImpl.Types<C>> {}

	export interface Ops<C, Tp extends ListImpl.Types<C> = ListImpl.Types<C>> {
		length(c: C): number;
		get<T>(c: C, index: number): WithElem<Tp, T>['_T'];
	}

	export interface Context<C, Tp extends ListImpl.Types<C> = ListImpl.Types<C>>
		extends ListBase.Context {
		readonly ops: Ops<C, Tp>;
		leaf<T extends Tp['_UT']>(children: C): WithElem<Tp, T>['nonEmpty'];
		reversedLeaf<T extends Tp['_UT']>(children: C): WithElem<Tp, T>['nonEmpty'];
	}

	export interface Types<C> extends ListBase.Types {
		readonly context: ListImpl.Context<C>;
		readonly normal: ListImpl<this['_T'], C>;
		readonly nonEmpty: ListImpl.NonEmpty<this['_T'], C>;
	}
}

class Leaf<T, C, Tp extends ListImpl.Types<C> = ListImpl.Types<C>>
	implements ListImpl.NonEmpty<T, C>
{
	constructor(
		readonly context: Tp['context'],
		readonly children: C,
	) {
		this.length = context.ops.length(children);
	}

	get ops() {
		return this.context.ops;
	}

	readonly length: number;

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		if (index >= this.length) {
			return OptLazy(otherwise!);
		}

		return this.ops.get(this.children, index);
	}

	reversed(): List<T> {
		return this.context.reversedLeaf(this.children);
	}
}

class ReversedLeaf<T, C, Tp extends ListImpl.Types<C> = ListImpl.Types<C>>
	implements ListImpl.NonEmpty<T, C>
{
	constructor(
		readonly context: Tp['context'],
		readonly children: C,
		readonly ops = context.ops,
	) {
		this.length = context.ops.length(children);
	}

	readonly length: number;

	get<O>(index: number, otherwise?: OptLazy<O>): T | O {
		if (index < 0) {
			return this.get(this.length + index, otherwise);
		}

		if (index >= this.length) {
			return OptLazy(otherwise!);
		}

		// Access the children in reversed order
		const reversedIndex = this.length - 1 - index;
		return this.ops.get(this.children, reversedIndex);
	}

	reversed(): List<T> {
		return this.context.leaf(this.children);
	}
}

const l: List<string> = new Leaf<string, string>(0 as any, '');
const l2: List<number> = new Leaf<number, number[]>(0 as any, []);

const c: List.Context = 0 as any;

const r = c.empty<string>().length;

interface StringList extends ListBase<string, StringList.Types> {}

namespace StringList {
	export interface NonEmpty
		extends StringList,
			ListBase.NonEmpty<string, StringList.Types> {}

	export interface Context extends ListBase.Context<StringList.Types> {
		readonly typeTag: 'StringList';
	}

	export interface Types extends ListBase.Types {
		readonly _UT: string;
		readonly context: StringList.Context;
		readonly normal: StringList;
		readonly nonEmpty: StringList.NonEmpty;
	}
}

class StringListContext implements StringList.Context {
	readonly typeTag = 'StringList';
	createContext(options: number) {
		return new StringListContext();
	}
	empty(): StringList.NonEmpty {
		return 0 as any;
	}
}

const c2: StringList.Context = 0 as any;
const s = c2.empty().get(2);
