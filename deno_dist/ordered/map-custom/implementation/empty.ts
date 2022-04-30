import { Token } from '../../../base/mod.ts';
import { EmptyBase, WithKeyValue } from '../../../collection-types/map-custom/index.ts';
import { OptLazy, OptLazyOr, ToJSON } from '../../../common/mod.ts';
import type { List } from '../../../list/mod.ts';
import type {
  OrderedMapBase,
  OrderedMapTypes,
} from '../../../ordered/map-custom/index.ts';
import { Stream, StreamSource } from '../../../stream/mod.ts';

export class OrderedMapEmpty<
    K = any,
    V = any,
    Tp extends OrderedMapTypes = OrderedMapTypes
  >
  extends EmptyBase
  implements OrderedMapBase<K, V, Tp>
{
  constructor(readonly context: WithKeyValue<Tp, K, V>['context']) {
    super();
  }

  get keyOrder(): List<K> {
    return this.context.listContext.empty();
  }

  get sourceMap(): WithKeyValue<Tp, K, V>['sourceMap'] {
    return this.context.mapContext.empty();
  }

  streamKeys(): Stream<K> {
    return Stream.empty();
  }

  streamValues(): Stream<V> {
    return Stream.empty();
  }

  hasKey(): false {
    return false;
  }

  get<O>(key: K, otherwise?: OptLazy<O>): O {
    return OptLazy(otherwise) as O;
  }

  set(key: K, value: V): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.addEntry([key, value]);
  }

  addEntry(entry: readonly [K, V]): WithKeyValue<Tp, K, V>['nonEmpty'] {
    return this.context.createNonEmpty<K, V>(
      this.context.listContext.of(entry[0]),
      this.context.mapContext.of(entry)
    ) as any;
  }

  addEntries(
    entries: StreamSource<readonly [K, V]>
  ): WithKeyValue<Tp, K, V>['normal'] | any {
    if (StreamSource.isEmptyInstance(entries)) return this;

    return this.context.from(entries);
  }

  modifyAt(
    key: K,
    options: { ifNew?: OptLazyOr<V, Token> }
  ): WithKeyValue<Tp, K, V>['normal'] {
    if (undefined === options.ifNew) return this as any;

    const value = OptLazyOr(options.ifNew, Token);

    if (Token === value) return this as any;

    return this.addEntry([key, value]) as any;
  }

  removeKey(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeys(): WithKeyValue<Tp, K, V>['normal'] {
    return this as any;
  }

  removeKeyAndGet(): undefined {
    return undefined;
  }

  mapValues(): any {
    return this;
  }

  updateAt(): any {
    return this;
  }

  toBuilder(): WithKeyValue<Tp, K, V>['builder'] {
    return this.context.builder() as any;
  }

  toString(): string {
    return 'OrderedMap()';
  }

  toJSON(): ToJSON<any[]> {
    return {
      dataType: this.context.typeTag,
      value: [],
    };
  }
}
