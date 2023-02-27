import * as Collections from '@rimbu/core';
import { HashTableHashColumn, List, Stream, Streamable } from '@rimbu/core';

interface ContextType {
  typeTag: keyof typeof Collections;
  contextId: string;
}

const itemsStream = Stream.fromObjectValues(Collections).collect(
  (v, _, skip) => {
    if (
      typeof v === 'object' &&
      `defaultContext` in v &&
      typeof v.defaultContext === 'function'
    ) {
      const context = (v.defaultContext as () => ContextType)();

      return [context.typeTag, context.contextId, context] as const;
    }

    return skip;
  }
);

const defaultContextTable = HashTableHashColumn.from(itemsStream);

export function createSerializer(): any {
  const contextTable = defaultContextTable.toBuilder();

  return {
    serialize(
      obj: Streamable<any> & {
        toJSON(): any;
        context: { typeTag: keyof typeof Collections; contextId: string };
      }
    ): any {
      contextTable.modifyAt(obj.context.typeTag, obj.context.contextId, {
        ifNew: obj.context,
      });
      return obj.toJSON();
    },
    deserialize(obj: Record<string, any>): any {
      const contextInfo = obj.attributes?.context;

      if (undefined === contextInfo) {
        return obj;
      }
      const { typeTag, contextId } = contextInfo as ContextType;

      const context = contextTable.get(typeTag, contextId, () => {
        if (contextId === 'default') {
          return (Collections[typeTag] as any).defaultContext();
        }

        switch (typeTag) {
          case 'List':
            return List.createContext({
              blockSizeBits: contextInfo.blockSizeBits,
            });

          default:
            throw Error(`unknown context: ${typeTag}`);
        }
      });

      return context.from(obj.value);
    },
  };
}
