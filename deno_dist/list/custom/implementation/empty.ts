import { EmptyBase } from '../../../collection-types/set-custom/index.ts';
import { type ArrayNonEmpty, OptLazy, type ToJSON } from '../../../common/mod.ts';
import { Stream, type StreamSource } from '../../../stream/mod.ts';

import type { List } from '../../../list/mod.ts';
import type { ListContext } from '../../../list/custom/index.ts';

export class Empty<T = any> extends EmptyBase implements List<T> {
  _NonEmptyType!: List.NonEmpty<T>;

  constructor(readonly context: ListContext) {
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

  prepend(value: T): List.NonEmpty<T> {
    return this.context.leafBlock([value]);
  }

  append(value: T): List.NonEmpty<T> {
    return this.context.leafBlock([value]);
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

  splice(options: { insert?: StreamSource<T> }): any {
    if (undefined === options.insert) return this;

    return this.context.from(options.insert);
  }

  insert(index: number, values: StreamSource<T>): any {
    return this.splice({ insert: values });
  }

  remove(): this {
    return this;
  }

  concat<T2>(...sources: ArrayNonEmpty<StreamSource<T2>>): any {
    return this.context.from(...sources);
  }

  repeat(): this {
    return this;
  }

  rotate(): this {
    return this;
  }

  padTo(length: number, fill: any): List<any> {
    if (length <= 0) return this;
    return this.append(fill).repeat(length);
  }

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

  toBuilder(): List.Builder<T> {
    return this.context.builder();
  }

  structure(): string {
    return '<empty>';
  }

  toString(): string {
    return `List()`;
  }

  toJSON(): ToJSON<any[], this['context']['typeTag']> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}

export function createEmptyList(context: ListContext): List<any> {
  return Object.freeze(new Empty(context));
}
