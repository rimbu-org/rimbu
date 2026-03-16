import type { WithElem } from '@rimbu/collection-types/common';

import type { ListContext } from '#list/context';
import type { ListBase } from '#list/list-base';
import type { ListBuilder } from '#list/mutable/builder';

export interface ListImpl<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends ListBase<T, Tp> {
	_structure(): string;
}

export namespace ListImpl {
	export interface NonEmpty<T>
		extends ListBase.NonEmpty<T, ListImpl.Types>,
			Omit<ListImpl<T>, keyof ListBase.NonEmpty<any>> {
		_structure(): string;
	}

	export interface LeafChildrenOps<Tp extends ListImpl.Types = ListImpl.Types> {
		of<T extends Tp['_UT']>(values: T[]): WithElem<Tp, T>['leafChildren'];
		length(children: Tp['leafChildren']): number;
		get<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			index: number,
		): T;
		prepend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			value: T,
		): WithElem<Tp, T>['leafChildren'];
		append<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			value: T,
		): WithElem<Tp, T>['leafChildren'];
		concat<T extends Tp['_UT']>(
			children1: WithElem<Tp, T>['leafChildren'],
			children2: WithElem<Tp, T>['leafChildren'],
		): WithElem<Tp, T>['leafChildren'];
		toSpliced<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			start: number,
			deleteCount: number,
			items?: T[],
		): WithElem<Tp, T>['leafChildren'];
		toReversed<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
		): WithElem<Tp, T>['leafChildren'];
		join(
			children: Tp['leafChildren'],
			separator: string,
			reversed?: boolean,
		): string;
		toArray<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			startIndex?: number | undefined,
			endIndex?: number | undefined,
			reversed?: boolean | undefined,
		): T[];
		mutatePrepend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			value: T,
		): WithElem<Tp, T>['leafChildren'];
		mutateAppend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			value: T,
		): WithElem<Tp, T>['leafChildren'];
		mutateSplice<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
			start: number,
			deleteCount?: number | undefined,
			items?: T[],
		): [
			result: WithElem<Tp, T>['leafChildren'],
			deleted: WithElem<Tp, T>['leafChildren'],
		];
		safeCopy<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['leafChildren'],
		): WithElem<Tp, T>['leafChildren'];
	}

	export interface Types extends ListBase.Types {
		readonly normal: ListImpl<this['_T']>;
		readonly nonEmpty: ListImpl.NonEmpty<this['_T']>;
		readonly builder: ListBuilder<this['_T']>;
		readonly context: ListContext;
	}
}
