import { CHAIN_SYMBOL } from 'node:constants.mjs';
import type { StateTransformer } from './interface.ts';

export function executeTransformers(
  transformers: StateTransformer<any>[],
  start: [any, any]
): [any, any] {
  let acc = start;

  const length = transformers.length;
  let i = -1;

  while (++i < length) {
    let transformer = transformers[i];

    let executed = false;

    while (CHAIN_SYMBOL in transformer) {
      const chain = (transformer as any)[CHAIN_SYMBOL];

      if (chain.length <= 1) {
        if (chain.length === 0) {
          executed = true;
          break;
        }
        transformer = chain[0];
      } else {
        acc = executeTransformers(chain, acc);
        executed = true;
        break;
      }
    }

    if (!executed) {
      acc = transformer(acc[0], acc[1]);
    }
  }

  return acc;
}

export function chainTransformers(
  transformers: StateTransformer<any>[]
): StateTransformer<any> {
  const transformer = (state: any, input: any): any =>
    executeTransformers(transformers, [state, input]);
  transformer[CHAIN_SYMBOL] = transformers;

  return transformer;
}
