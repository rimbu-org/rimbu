import { Stream } from '@rimbu/stream';
import { StateTransformer } from '../src/index.mjs';

interface State {
  count: number;
  text: string;
}

const C = StateTransformer.createContext<StateTransformer.Types<State>>();

const initState: State = {
  count: 5,
  text: 'a',
};

describe('StateTransformer', () => {
  it('should set value', () => {
    const transformer = C.setValue(1);
    const [state, value] = transformer(initState, 0);
    expect(value).toBe(1);
    expect(state).toBe(initState);
  });

  it('should set state', () => {
    const newState: State = { count: 1, text: 'test' };
    const transformer = C.setState(newState);
    const [state, value] = transformer(initState, 0);
    expect(value).toBe(0);
    expect(state).toBe(newState);
  });

  it('should map to value', () => {
    const transformer = C.mapValue(
      (value: number, state) => value + state.count
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(6);
    expect(state).toBe(initState);
  });

  it('should map to state', () => {
    const transformer = C.mapState((state, value: number) => ({
      ...state,
      count: state.count + value,
    }));
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(1);
    expect(state).toEqual({ count: 6, text: 'a' });
  });

  it('should perform effect', () => {
    const effectFn = vi.fn();
    const transformer = C.effect(effectFn);
    const [state, value] = transformer(initState, 1);
    expect(effectFn).toBeCalledWith(initState, 1);
    expect(value).toBe(1);
    expect(state).toBe(initState);
  });

  it('should supply value', () => {
    const transformer = C.supply(
      1,
      C.mapValue((value) => value + 1)
    );
    const [state, value] = transformer(initState, 0);
    expect(value).toBe(2);
    expect(state).toBe(initState);
  });

  it('should chain transformers', () => {
    const transformer = C.chain(
      C.setValue(1),
      C.mapValue((value: number) => value + 1),
      C.mapValue((value: number) => value * 2)
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(4);
    expect(state).toBe(initState);
  });

  it('chain 0 trensformers returns empty transformer', () => {
    const transformer = C.chain();
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(1);
    expect(state).toBe(initState);
  });

  it('chain 1 transformer returns the transformer', () => {
    const transformer = C.chain(C.setValue(1));
    const [state, value] = transformer(initState, 0);
    expect(value).toBe(1);
    expect(state).toBe(initState);
  });

  it('nested chain works', () => {
    const transformer = C.chain(
      C.setValue(1),
      C.chain(
        C.mapValue((value: number) => value + 1),
        C.mapValue((value: number) => value * 2)
      ),
      C.chain(C.mapValue((value: number) => value * 3))
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(12);
    expect(state).toBe(initState);
  });

  it('should combine transformers', () => {
    const transformer = C.combine(
      [C.setValue(3), C.setValue(4)],
      ([output1, output2], state, input) => ({
        sum: output1 + output2,
        input,
        state,
      })
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toEqual({ sum: 7, input: 1, state: initState });
    expect(state).toBe(initState);
  });

  it('should convert to function', () => {
    const transformer = C.toFunction(
      C.mapValue((value: number) => value + 1),
      initState
    );
    const value = transformer(1);
    expect(value).toBe(2);
  });

  it('should convert to reducer', () => {
    const transformer = C.toReducer(
      (state: State, value: number) => [
        { ...state, count: state.count + 1 },
        value * state.count,
      ],
      () => initState
    );
    const result = Stream.of(1, 2, 3).reduce(transformer);
    expect(result).toBe(21);
  });

  it('should decide', () => {
    const transformer = C.decide((state, value: number) => {
      if (value > 0) {
        return C.setValue(value + state.count);
      }
      return C.setValue(value - state.count);
    });
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(6);
    expect(state).toBe(initState);
  });

  it('should modify state', () => {
    const C2 = StateTransformer.createContext<StateTransformer.Types<number>>();

    const transformer = C.withModifiedState()(
      (state) => state.count,
      C2.mapState((state) => state + 1),
      (newState, oldState) => ({ ...oldState, count: newState })
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toBe(1);
    expect(state).toEqual({ count: 6, text: 'a' });
  });

  it('should evaluate output', () => {
    const transformer = C.evaluateOutput(
      C.chain(
        C.setState({ count: 1, text: 'test' }),
        C.mapValue((_, state) => state.text)
      )
    );
    const [state, value] = transformer(initState, 1);
    expect(value).toBe('test');
    expect(state).toBe(initState);
  });

  it('execUntil', () => {
    const transformer = C.execUntil(
      C.decide(({ count }) => {
        if (count % 2 === 0) {
          return C.mapState((state) => ({ ...state, count: count + 1 }));
        }
        return C.mapState((state) => ({ ...state, count: count + 2 }));
      }),
      ({ count }) => count >= 10
    );
    const [state, value] = transformer(initState, 0);
    expect(value).toBe(0);
    expect(state).toEqual({ count: 11, text: 'a' });
  });

  it('bench works', () => {
    const program = C.execUntil(
      C.decide((state) =>
        state.count % 2 === 0
          ? C.mapState((state) => ({ ...state, count: state.count + 1 }))
          : C.mapState((state) => ({ ...state, count: state.count + 2 }))
      ),
      (state) => state.count > 10000
    );

    const [state, value] = program(initState, 0);

    expect(value).toBe(0);
    expect(state).toEqual({ count: 10001, text: 'a' });
  });
});
