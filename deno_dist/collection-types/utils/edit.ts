import type { CollectFun } from 'https://deno.land/x/rimbu/common/mod.ts';
import type { Stream, StreamSource } from 'https://deno.land/x/rimbu/stream/mod.ts';
import type { WithElem, WithKeyValue, WithRow } from '../custom-base.ts';

/**
 * Returns the result of converting given `source` immutable collection to a builder, applying given `f` function
 * to that builder, and then building an immutable collection again from the builder.
 * @param source - the collection to edit
 * @param f - a function taking a builder instance based on given `source` and performing modifications
 * on the builder
 */
export function asBuilder<S extends { toBuilder(): { build(): any } }>(
  source: S,
  f: (builder: ReturnType<S['toBuilder']>) => void
): ReturnType<ReturnType<S['toBuilder']>['build']> {
  const builder = source.toBuilder();
  f(builder as any);
  return builder.build();
}

export const asStream: {
  // non empty element
  <
    T,
    T2,
    S extends {
      context: {
        _types: {
          normal: unknown;
          nonEmpty: unknown;
          limitElem: boolean;
        };
      };
    },
    SR extends StreamSource<T2>
  >(
    source: S & StreamSource.NonEmpty<T>,
    f: (stream: Stream.NonEmpty<T>) => StreamSource<T2> & SR
  ): [S['context']['_types']['limitElem'], T2] extends [true, T] | [false, any]
    ? SR extends StreamSource.NonEmpty<T2>
      ? WithElem<S['context']['_types'], T2>['nonEmpty']
      : WithElem<S['context']['_types'], T2>['normal']
    : never;
  // potentially empty element
  <
    T,
    T2,
    S extends {
      context: {
        _types: {
          normal: unknown;
          limitElem: boolean;
        };
      };
    }
  >(
    source: StreamSource<T> & S,
    f: (stream: Stream<T>) => StreamSource<T2>
  ): [S['context']['_types']['limitElem'], T2] extends [true, T] | [false, any]
    ? WithElem<S['context']['_types'], T2>['normal']
    : never;
  // non-empty key value
  <
    K,
    V,
    K2,
    V2,
    S extends {
      context: {
        _types: {
          normal: unknown;
          nonEmpty: unknown;
          limitKey: boolean;
          limitValue: boolean;
        };
      };
    },
    SR extends StreamSource<[K2, V2]>
  >(
    source: S & StreamSource.NonEmpty<readonly [K, V]>,
    f: (
      stream: Stream.NonEmpty<readonly [K, V]>
    ) => StreamSource<readonly [K2, V2]> & SR
  ): [
    S['context']['_types']['limitKey'],
    S['context']['_types']['limitValue'],
    K2,
    V2
  ] extends
    | [false, false, any, any]
    | [true, true, K, V]
    | [true, false, K, any]
    | [false, true, any, V]
    ? SR extends StreamSource.NonEmpty<[K2, V2]>
      ? WithKeyValue<S['context']['_types'], K2, V2>['nonEmpty']
      : WithKeyValue<S['context']['_types'], K2, V2>['normal']
    : never;
  // potentially empty key value
  <
    K,
    V,
    K2,
    V2,
    S extends {
      context: {
        _types: { normal: unknown; limitKey: boolean; limitValue: boolean };
      };
    }
  >(
    source: S & StreamSource<[K, V]>,
    f: (stream: Stream<[K, V]>) => StreamSource<[K2, V2]>
  ): [
    S['context']['_types']['limitKey'],
    S['context']['_types']['limitValue'],
    K2,
    V2
  ] extends
    | [false, false, any, any]
    | [true, true, K, V]
    | [true, false, K, any]
    | [false, true, any, V]
    ? WithKeyValue<S['context']['_types'], K2, V2>['normal']
    : never;
  // non-empty table
  <
    R,
    C,
    V,
    R2,
    C2,
    V2,
    S extends {
      context: {
        _types: { normal: unknown; nonEmpty: unknown; limitRow: boolean };
      };
    },
    SR extends StreamSource<[R2, C2, V2]>
  >(
    source: S & StreamSource.NonEmpty<[R, C, V]>,
    f: (stream: Stream.NonEmpty<[R, C, V]>) => StreamSource<[R2, C2, V2]> & SR
  ): [S['context']['_types']['limitRow'], R2, C2] extends
    | [true, R, C]
    | [false, any, any]
    ? SR extends StreamSource.NonEmpty<[R2, C2, V2]>
      ? WithRow<S['context']['_types'], R2, C2, V2>['nonEmpty']
      : WithRow<S['context']['_types'], R2, C2, V2>['normal']
    : never;
  // potentially empty table
  <
    R,
    C,
    V,
    R2,
    C2,
    V2,
    S extends { context: { _types: { normal: unknown; limitRow: boolean } } }
  >(
    source: S & StreamSource<[R, C, V]>,
    f: (stream: Stream<[R, C, V]>) => StreamSource<[R2, C2, V2]>
  ): [S['context']['_types']['limitRow'], R2, C2] extends
    | [true, R, C]
    | [false, any, any]
    ? WithRow<S['context']['_types'], R2, C2, V2>['normal']
    : never;
} = (source: any, f: any) => source.context.from(f(source.stream()));

export const collect: {
  <
    T,
    T2,
    S extends { context: { _types: { normal: unknown; limitElem: boolean } } }
  >(
    source: S & StreamSource<T>,
    collectFun: CollectFun<T, T2>
  ): [S['context']['_types']['limitElem'], T2] extends [true, T] | [false, any]
    ? WithElem<S['context']['_types'], T2>['normal']
    : never;
  <
    K,
    V,
    K2,
    V2,
    S extends {
      context: {
        _types: { normal: unknown; limitKey: boolean; limitValue: boolean };
      };
    }
  >(
    source: S & StreamSource<[K, V]>,
    collectFun: CollectFun<[K, V], [K2, V2]>
  ): [
    S['context']['_types']['limitKey'],
    S['context']['_types']['limitValue'],
    K2,
    V2
  ] extends
    | [false, false, any, any]
    | [true, true, K, V]
    | [true, false, K, any]
    | [false, true, any, V]
    ? WithKeyValue<S['context']['_types'], K2, V2>['normal']
    : never;
  <
    R,
    C,
    V,
    R2,
    C2,
    V2,
    S extends { context: { _types: { normal: unknown; limitRow: boolean } } }
  >(
    source: S & StreamSource<[R, C, V]>,
    collectFun: CollectFun<[R, C, V], [R2, C2, V2]>
  ): [S['context']['_types']['limitRow'], R2, C2] extends
    | [true, R, C]
    | [false, any, any]
    ? WithRow<S['context']['_types'], R2, C2, V2>['normal']
    : never;
} = (source: any, collectFun: any): any =>
  asStream(source, (stream: any) => stream.collect(collectFun));
