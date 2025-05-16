import { Reducer } from '@rimbu/stream';
import { chainTransformers } from './chain-transformers.mjs';
import type { StateTransformer } from './interface.mjs';

export const Impl: StateTransformer.Context = {
  setValue: (value) => (state) => [state, value],
  setState: (state) => (_, input) => [state, input],
  mapValue: (mapFn) => (state, value) => [state, mapFn(value, state)],
  mapState: (mapFn) => (state, value) => [mapFn(state, value), value],
  effect: (fn) => (state, value) => {
    fn(state, value);
    return [state, value];
  },
  supply:
    (value, transformer): StateTransformer<any> =>
    (state) =>
      transformer(state, value),
  chain: (...transformers: any[]) => chainTransformers(transformers as any[]),
  combine: (
    transformers: any[],
    combineFn = (outputs: any[], _state: any, _value: any): any[] => outputs
  ): StateTransformer<any> => {
    return (state, input) => {
      const outputs = [];

      let index = -1;
      const length = transformers.length;

      let acc = [state, input] as [any, any];

      while (++index < length) {
        acc = transformers[index](acc[0], input);
        outputs.push(acc[1]);
      }

      return [acc[0], combineFn(outputs, acc[0], input)];
    };
  },
  toFunction: (transformer, initState) => {
    return (input) => transformer(initState, input)[1];
  },
  toReducer: ((transformer: any, createInitState: any, ifEmpty: any) => {
    return Reducer.create(
      () => [createInitState(), undefined] as [any, any],
      ([state], input) => transformer(state, input),
      ([, output], index) => (index === 0 ? ifEmpty?.() : output)
    );
  }) as any,
  decide: (createTransformer): StateTransformer<any> => {
    return (state, input) => {
      const transformer = createTransformer(state, input);
      return transformer(state, input);
    };
  },
  withModifiedState:
    () =>
    (
      toModifiedState,
      transformer,
      fromModifiedState
    ): StateTransformer<any> => {
      return (outerState, input) => {
        const modifiedState = toModifiedState(outerState, input);
        const [newModifiedState, output] = transformer(modifiedState, input);
        return [
          fromModifiedState(newModifiedState, outerState, output as any),
          output,
        ];
      };
    },
  evaluateOutput: (transformer: StateTransformer<any>) => (state, input) => {
    const [, value] = transformer(state, input);
    return [state, value];
  },
  execUntil: (transformer, condition): StateTransformer<any> => {
    return (state, input) => {
      let acc = [state, input] as [any, any];
      do {
        acc = transformer(acc[0], acc[1]);
      } while (!condition(acc[0], acc[1]));

      return acc;
    };
  },
};
