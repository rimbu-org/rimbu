import type { ListBase } from './list-base';

export interface ListImpl<T> extends ListBase<T, ListImpl.Types> {
	a: 1;
}

export namespace ListImpl {
	export interface NonEmpty<T> extends ListBase.NonEmpty<T, ListImpl.Types> {}
  
	export interface Types extends ListBase.Types {
		a: 1;
	}
}
