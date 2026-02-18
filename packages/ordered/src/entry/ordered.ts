import type { Elem, WithElem } from '@rimbu/collection-types/common';

export interface OSB<T, Tp extends OSB.Types = OSB.Types> {
	readonly context: WithElem<Tp, T>['context'];
	add(value: T): Tp['nonEmpty'];
}

namespace OSB {
	export interface NonEmpty<T, Tp extends OSB.Types = OSB.Types>
		extends OSB<T, Tp> {}

	export interface Context<UT, Tp extends OSB.Types = OSB.Types> {
		empty<T extends UT>(): WithElem<Tp, T>['normal'];
	}

	export interface ContextImpl<UT> extends OSB.Context<UT, OSB.TypesImpl> {
		create<T>(): NonEmptyBase<T>;
	}

	export interface Types extends Elem {
		readonly context: OSB.Context<this['_T'], this>;
		readonly normal: OSB<this['_T']>;
		readonly nonEmpty: OSB.NonEmpty<this['_T']>;
	}

	export interface TypesImpl extends Types {
		readonly context: OSB.ContextImpl<this['_T']>;
	}
}

class EmptyBase implements OSB<any, OSB.TypesImpl> {
	constructor(readonly context: OSB.ContextImpl<any>) {}

	add(value: any) {
		return this.context.create();
	}
}

class NonEmptyBase<T> implements OSB.NonEmpty<T, OSB.TypesImpl> {
	constructor(readonly context: OSB.ContextImpl<T>) {}

	add(value: T): NonEmptyBase<T> {
		return this.context.create<T>();
	}
}

export interface OS<T> extends OSB<T, OS.Types> {}

namespace OS {
	export interface NonEmpty<T> extends OSB.NonEmpty<T, OS.Types> {}

	export interface Context<UT> extends OSB.Context<UT, OS.Types> {}

	export interface Types extends OSB.Types {
		readonly context: OS.Context<this['_T']>;
		readonly normal: OS<this['_T']>;
		readonly nonEmpty: OS.NonEmpty<this['_T']>;
	}
}

function create<T>(): OS.Context<T> {
	const context: OSB.ContextImpl<T> = {
		empty<T>() {
			return new EmptyBase(context);
		},
		create<T>() {
			return new NonEmptyBase<T>(context);
		},
	};

	return context;
}

const c = create<number>();
const e = c.empty<number>();
e.context;
