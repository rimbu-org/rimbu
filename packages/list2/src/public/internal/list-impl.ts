import type { WithElem } from '@rimbu/collection-types/common';
import type { IndexRange } from '@rimbu/common/index-range';
import type { TraverseState } from '@rimbu/common/traverse-state';
import type { Stream } from '@rimbu/stream';

import type { ListContext } from '#list/context-module';
import type { ListBase } from '#list/list-base';
import type { ListBuilder } from '#list/mutable/builder';

export interface ListImpl<T, Tp extends ListImpl.Types = ListImpl.Types>
	extends ListBase<T, Tp> {
	_structure(): string;
}

export namespace ListImpl {
	export interface NonEmpty<T, Tp extends ListImpl.Types = ListImpl.Types>
		extends ListBase.NonEmpty<T, Tp>,
			Omit<ListImpl<T>, keyof ListBase.NonEmpty<any>> {
		_structure(): string;
	}

	export interface OuterChildrenOps<
		Tp extends ListImpl.Types = ListImpl.Types,
	> {
		of<T extends Tp['_UT']>(values: T[]): WithElem<Tp, T>['outerChildren'];
		length(children: Tp['outerChildren']): number;
		at<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			index: number,
		): T;
		updateAt<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			index: number,
			update: (current: T) => T,
		): WithElem<Tp, T>['outerChildren'];
		stream<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			options?: { reversed?: boolean } | undefined,
		): Stream.NonEmpty<T>;
		streamRange<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			options: { range?: IndexRange; reversed?: boolean },
		): Stream<T>;
		prepend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			value: T,
		): WithElem<Tp, T>['outerChildren'];
		append<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			value: T,
		): WithElem<Tp, T>['outerChildren'];
		concat<T extends Tp['_UT']>(
			children1: WithElem<Tp, T>['outerChildren'],
			children2: WithElem<Tp, T>['outerChildren'],
		): WithElem<Tp, T>['outerChildren'];
		toSpliced<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			start: number,
			deleteCount: number,
			items?: WithElem<Tp, T>['outerChildren'] | undefined,
		): WithElem<Tp, T>['outerChildren'];
		toReversed<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
		): WithElem<Tp, T>['outerChildren'];
		join(
			children: Tp['outerChildren'],
			separator: string,
			reversed?: boolean,
		): string;
		map<T extends Tp['_UT'], T2 extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			f: (value: T, index: number) => T2,
			indexOffset?: number | undefined,
		): WithElem<Tp, T2>['outerChildren'];
		reverseMap<T extends Tp['_UT'], T2 extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			f: (value: T, index: number) => T2,
			indexOffset?: number | undefined,
		): WithElem<Tp, T2>['outerChildren'];
		forEach<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			f: (value: T, index: number, halt: () => void) => void,
			options: { reversed: boolean; state: TraverseState },
		): void;
		toArray<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			start?: number | undefined,
			end?: number | undefined,
			reversed?: boolean | undefined,
		): T[];
		mutateSet<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			index: number,
			value: T,
		): WithElem<Tp, T>['outerChildren'];
		mutatePrepend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			value: T,
		): WithElem<Tp, T>['outerChildren'];
		mutateAppend<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			value: T,
		): WithElem<Tp, T>['outerChildren'];
		mutateSplice<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
			start: number,
			deleteCount?: number | undefined,
			items?: WithElem<Tp, T>['outerChildren'] | undefined,
		): [
			result: WithElem<Tp, T>['outerChildren'],
			deleted: WithElem<Tp, T>['outerChildren'],
		];
		mutateDropFirst<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
		): [result: WithElem<Tp, T>['outerChildren'], dropped: T];
		mutateDropLast<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
		): [result: WithElem<Tp, T>['outerChildren'], dropped: T];
		safeCopy<T extends Tp['_UT']>(
			children: WithElem<Tp, T>['outerChildren'],
		): WithElem<Tp, T>['outerChildren'];
	}

	export interface Types extends ListBase.Types {
		readonly normal: ListImpl<this['_T']>;
		readonly nonEmpty: ListImpl.NonEmpty<this['_T']>;
		readonly builder: ListBuilder<this['_T']>;
		readonly context: ListContext;
	}
}
