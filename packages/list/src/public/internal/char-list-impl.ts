import type { ListContext } from '#list/context-module';
import type { ListBase } from '#list/list-base';
import type { ListBuilder } from '#list/mutable/builder';

export interface CharListImpl extends ListBase<string, CharListImpl.Types> {
	_structure(): string;
}

export namespace CharListImpl {
	export interface NonEmpty
		extends ListBase.NonEmpty<string, CharListImpl.Types>,
			Omit<CharListImpl, keyof ListBase.NonEmpty<any>> {
		_structure(): string;
	}

	export interface Types extends ListBase.Types {
		readonly _UT: string;
		readonly normal: CharListImpl;
		readonly nonEmpty: CharListImpl.NonEmpty;
		readonly builder: ListBuilder<this['_T']>;
		readonly context: ListContext;
	}
}
