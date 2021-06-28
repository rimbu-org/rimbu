import { CustomBase } from 'https://deno.land/x/rimbu/collection-types/mod.ts';
import { ArrayNonEmpty, OptLazy, ToJSON } from 'https://deno.land/x/rimbu/common/mod.ts';
import { Stream, StreamSource } from 'https://deno.land/x/rimbu/stream/mod.ts';
import type { List } from '../internal.ts';
import type { ListContext } from '../list-custom.ts';

export class Empty<T = any> extends CustomBase.EmptyBase implements List<T> {
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

  concat(...sources: ArrayNonEmpty<StreamSource<T>>): any {
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

  filter(): this {
    return this;
  }

  collect(): any {
    return this;
  }

  map(): any {
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

  extendType(): List<any> {
    return this as any;
  }

  unzip(length: number): any {
    return Stream.of(this).repeat(length).toArray();
  }

  flatten(): any {
    return this;
  }
}
