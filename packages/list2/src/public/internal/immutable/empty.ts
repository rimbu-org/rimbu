import type { ListContext } from '#list/context';
import type { ListImpl } from '#list/list-impl';

import { EmptyBase } from '@rimbu/collection-types/common/empty-base';
import { OptLazy } from '@rimbu/common/opt-lazy';
import { Stream } from '@rimbu/stream';

export class ListEmpty<T> extends EmptyBase implements ListImpl<T> {
	constructor(
		readonly context: ListContext,
		readonly ops = context.leafChildrenOps,
	) {
		super();
	}

	streamRange(): Stream<T> {
		return Stream.empty();
	}

	first<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	last<O>(otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	get<O>(index: number, otherwise?: OptLazy<O>): O {
		return OptLazy(otherwise) as O;
	}

	prepend(value: T): ListImpl.NonEmpty<T> {
		return this.context.leafBlock(this.ops.of(value));
	}

	append(value: T): ListImpl.NonEmpty<T> {
		return this.context.leafBlock(this.ops.of(value));
	}

	take(): this {
		return this;
	}

	drop(): this {
		return this;
	}

	slice(): this {
		return this;
	}

	sort(): this {
		return this;
	}

	// splice(options: { insert?: StreamSource<T> }): any {
	// 	if (undefined === options.insert) return this;

	// 	return this.context.from(options.insert);
	// }

	// insert(index: number, values: StreamSource<T>): any {
	// 	return this.splice({ insert: values });
	// }

	remove(): this {
		return this;
	}

	// concat<T2>(...sources: ArrayNonEmpty<StreamSource<T2>>): any {
	// 	return this.context.from(...sources);
	// }

	repeat(): this {
		return this;
	}

	rotate(): this {
		return this;
	}

	// padTo(length: number, fill: any): List<any> {
	// 	if (length <= 0) return this;
	// 	return this.append(fill).repeat(length);
	// }

	updateAt(): this {
		return this;
	}

	filter(): any {
		return this;
	}

	collect(): any {
		return this;
	}

	map(): any {
		return this;
	}

	mapPure(): any {
		return this;
	}

	flatMap(): any {
		return this;
	}

	reversed(): this {
		return this;
	}

	toArray(): [] {
		return [];
	}

	// toBuilder(): List.Builder<T> {
	// 	return this.context.builder();
	// }

	_structure(): string {
		return 'Empty';
	}

	toString(): string {
		return `List()`;
	}

	// toJSON(): ToJSON<any[], this['context']['typeTag']> {
	// 	return {
	// 		dataType: this.context.typeTag,
	// 		value: [],
	// 	};
	// }
}
