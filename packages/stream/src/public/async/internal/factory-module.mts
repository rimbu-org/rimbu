import type { Token } from '@rimbu/base/token';
import type { AsyncOptLazy, MaybePromise } from '@rimbu/common/async-opt-lazy';
import { Module } from '@rimbu/common/module';

import type { AsyncStreamFactory } from '#async/factory';
import {
  AsyncUnfoldIterator,
  AsyncZipAllWithItererator,
  AsyncZipWithIterator,
} from '#async/fast-iterator-base';
import { asyncFastIteratorFactoryModule } from '#async/fast-iterator-factory-module';
import {
  AsyncEmptyStream,
  AsyncFromStream,
  AsyncOfStream,
  AsyncStreamBase,
  FromResource,
  FromSource,
} from '#async/stream-base';
import type { StreamSource } from '#private/stream-types';
import { StreamFactory } from '#stream/factory';
import type {
  AsyncFastIterator,
  AsyncStream,
  AsyncStreamSource,
} from '@rimbu/stream/async';

export const asyncStreamFactoryModule = Module.create<AsyncStreamFactory>(
  (mod) => ({
    _emptyInstance: Module.lazy(() => new AsyncEmptyStream(mod)),
    isAsyncStream: Module.factory((obj: any) => {
      return obj instanceof AsyncStreamBase;
    }),
    isEmptyAsyncStreamSourceInstance: Module.factory(
      (source: AsyncStreamSource<any>): boolean => {
        return (
          source === mod._emptyInstance ||
          StreamFactory().isEmptyStreamSourceInstance(
            source as StreamSource<any>
          )
        );
      }
    ),
    fromAsyncStreamSource: Module.factory(
      <T,>(source: AsyncStreamSource<T>): any => {
        if (undefined === source) return mod._emptyInstance;
        if (mod.isAsyncStream(source)) return source;
        if (mod.isEmptyAsyncStreamSourceInstance(source))
          return mod._emptyInstance;

        return new FromSource(mod, source);
      }
    ),
    empty: Module.factory(<T,>(): AsyncStream<T> => {
      return mod._emptyInstance;
    }),
    of: Module.factory((...values) => {
      return new AsyncOfStream(mod, values) as any;
    }),
    from: Module.factory((...sources): any => {
      const [first, ...rest] = sources;

      if (rest.length <= 0) {
        return mod.fromAsyncStreamSource(first);
      }

      const [rest1, ...restOther] = rest;

      return mod.fromAsyncStreamSource(first).concat(rest1, ...restOther);
    }),
    fromResource: Module.factory((options): any => {
      const { open, createSource, close } = options;
      return new FromResource(mod, open, createSource, close);
    }),
    zipWith: Module.factory((...sources): any => {
      return (zipFun: any): any => {
        if (sources.some(mod.isEmptyAsyncStreamSourceInstance)) {
          return mod._emptyInstance;
        }

        return new AsyncFromStream(
          mod,
          () => new AsyncZipWithIterator(mod, sources, zipFun)
        );
      };
    }),
    zip: Module.factory((...sources): any => {
      return mod.zipWith(...(sources as any))(Array);
    }),
    zipAllWith: Module.factory((...sources): any => {
      return (fillValue: any, zipFun: any): any => {
        if (sources.every(mod.isEmptyAsyncStreamSourceInstance)) {
          return mod._emptyInstance;
        }

        return new AsyncFromStream(
          mod,
          (): AsyncFastIterator<any> =>
            new AsyncZipAllWithItererator(mod, fillValue, sources, zipFun)
        );
      };
    }),
    zipAll: Module.factory((fillValue, ...sources): any => {
      return mod.zipAllWith(...(sources as any))(fillValue, Array);
    }),
    flatten: Module.factory((source: any) => {
      return mod.fromAsyncStreamSource(source).flatMap((s: any) => s);
    }),
    unzip: Module.factory((source, options) => {
      const { length } = options;

      if (mod.isEmptyAsyncStreamSourceInstance(source)) {
        return StreamFactory().of(mod._emptyInstance).repeat(length).toArray();
      }

      const result: AsyncStream<unknown>[] = [];
      let i = -1;

      while (++i < length) {
        const index = i;
        result[i] = source.map((t: any): unknown => t[index]);
      }

      return result as any;
    }),
    always: Module.factory(
      <T,>(value: AsyncOptLazy<T>): AsyncStream.NonEmpty<T> => {
        return mod.of(value).repeat();
      }
    ),
    unfold: Module.factory(
      <T,>(
        init: T,
        next: (
          current: T,
          index: number,
          stop: Token
        ) => MaybePromise<T | Token>
      ): AsyncStream.NonEmpty<T> => {
        return new AsyncFromStream(
          mod,
          (): AsyncFastIterator<T> =>
            new AsyncUnfoldIterator<T>(mod, init, next)
        ) as unknown as AsyncStream.NonEmpty<T>;
      }
    ),
    asyncFastIteratorFactory: Module.lazy(() =>
      asyncFastIteratorFactoryModule.build()
    ),
  })
);
