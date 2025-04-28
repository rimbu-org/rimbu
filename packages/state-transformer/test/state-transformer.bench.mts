import { StateTransformer } from 'interface.mjs';
import { bench } from 'vitest';

interface State {
  count: number;
  text: string;
}

const initState: State = {
  count: 5,
  text: 'a',
};

const C = StateTransformer.createContext<StateTransformer.Types<State>>();

const program = C.execUntil(
  C.decide((state) =>
    state.count % 2 === 0
      ? C.mapState((state) => ({ ...state, count: state.count + 1 }))
      : C.mapState((state) => ({ ...state, count: state.count + 2 }))
  ),
  (state) => state.count > 100000
);

const progFun = C.toFunction(program, initState);

describe('test', () => {
  bench('works', () => {
    progFun(0);
  });
});
