import {
  expectAssignable,
  expectError,
  expectNotAssignable,
  expectType,
} from 'tsd';
import { StateTransformer as ST, StateTransformer } from '../src/interface.mjs';
import { Reducer } from '@rimbu/stream';

interface State {
  count: number;
  text: string;
}

type Tp<I = unknown, O = unknown> = ST.Types<State> & { _in: I; _out: O };

const C = ST.createContext<Tp>();

expectAssignable<Tp<any, number>['_fn']>(C.setValue(1));
expectAssignable<Tp<unknown, number>['_fn']>(C.setValue(1));
expectNotAssignable<Tp<never, number>['_fn']>(C.setValue(1));
expectNotAssignable<Tp<any, string>['_fn']>(C.setValue(1));

expectAssignable<Tp<any, any>['_fn']>(C.setState({ count: 1, text: 'a' }));
expectAssignable<Tp<unknown, unknown>['_fn']>(
  C.setState({ count: 1, text: 'a' })
);
expectNotAssignable<Tp<any, string>['_fn']>(
  C.setState({ count: 1, text: 'a' })
);

expectAssignable<Tp<unknown, unknown>['_fn']>(
  C.setState({ count: 1, text: 'a' })
);
expectAssignable<Tp<string, string>['_fn']>(
  C.setState<string>({ count: 1, text: 'a' })
);
expectAssignable<Tp<unknown, unknown>['_fn']>(
  C.setState({ count: 1, text: 'a' })
);
expectNotAssignable<Tp<string, number>['_fn']>(
  C.setState<string>({ count: 1, text: 'a' })
);
expectNotAssignable<Tp<number, string>['_fn']>(
  C.setState<string>({ count: 1, text: 'a' })
);

expectAssignable<Tp<string, number>['_fn']>(
  C.mapValue((value: string) => value.length)
);
expectNotAssignable<Tp<string, string>['_fn']>(
  C.mapValue((value: string) => value.length)
);
expectNotAssignable<Tp<number, number>['_fn']>(
  C.mapValue((value: string) => value.length)
);

expectAssignable<Tp<string, string>['_fn']>(
  C.mapState((state, value: string) => state)
);
expectNotAssignable<Tp<string, number>['_fn']>(
  C.mapState((state, value: string) => state)
);
expectNotAssignable<Tp<number, string>['_fn']>(
  C.mapState((state, value: string) => state)
);

expectAssignable<Tp<string, string>['_fn']>(
  C.effect((state, value: string) => {})
);
expectNotAssignable<Tp<number, string>['_fn']>(
  C.effect((state, value: string) => {})
);
expectNotAssignable<Tp<string, number>['_fn']>(
  C.effect((state, value: string) => {})
);
expectNotAssignable<Tp<unknown, string>['_fn']>(
  C.effect((state, value: string) => {})
);
expectNotAssignable<Tp<string, unknown>['_fn']>(
  C.effect((state, value: string) => {})
);

expectAssignable<Tp<number, number>['_fn']>(
  C.supply(
    'test',
    C.mapValue((value: string) => value.length)
  )
);
expectAssignable<Tp<unknown, number>['_fn']>(
  C.supply(
    'test',
    C.mapValue((value: string) => value.length)
  )
);
expectNotAssignable<Tp<number, string>['_fn']>(
  C.supply(
    'test',
    C.mapValue((value: string) => value.length)
  )
);

expectAssignable<Tp<unknown, unknown>['_fn']>(C.chain());
expectNotAssignable<Tp<number, number>['_fn']>(C.chain());

expectAssignable<Tp<string, number>['_fn']>(
  C.chain(C.mapValue((value: string) => value.length))
);
expectError<Tp<number, number>['_fn']>(
  C.chain(C.mapValue((value: string) => value.length))
);
expectError<Tp<string, string>['_fn']>(
  C.chain(C.mapValue((value: string) => value.length))
);
expectError<Tp<unknown, string>['_fn']>(
  C.chain(C.mapValue((value: string) => value.length))
);

expectAssignable<Tp<string, boolean>['_fn']>(
  C.chain(
    C.mapValue((value: string) => value.length),
    C.mapValue((value: number) => value > 10)
  )
);
expectError<Tp<number, boolean>['_fn']>(
  C.chain(
    C.mapValue((value: string) => value.length),
    C.mapValue((value: number) => value > 10)
  )
);
expectError<Tp<string, number>['_fn']>(
  C.chain(
    C.mapValue((value: string) => value.length),
    C.mapValue((value: number) => value > 10)
  )
);
expectError<Tp<string, boolean>['_fn']>(
  C.chain(
    C.mapValue((value: string) => value.length),
    C.mapValue((value: boolean) => value)
  )
);

expectAssignable<Tp<unknown, [number, string]>['_fn']>(
  C.combine([C.setValue(1), C.setValue('test')])
);
expectAssignable<Tp<boolean, [number, string]>['_fn']>(
  C.combine([C.setValue(1), C.setValue('test')])
);
expectNotAssignable<Tp<unknown, [number, number]>['_fn']>(
  C.combine([C.setValue(1), C.setValue('test')])
);
expectError(C.combine([C.mapValue((value: string) => value.length)]));
expectError(
  C.combine([C.setValue('test'), C.mapValue((value: string) => value.length)])
);

expectAssignable<Tp<unknown, boolean>['_fn']>(
  C.combine([C.setValue(1), C.setValue('test')], ([a, b]) => b.length === a)
);
expectNotAssignable<Tp<unknown, string>['_fn']>(
  C.combine([C.setValue(1), C.setValue('test')], ([a, b]) => b.length === a)
);
expectError(
  C.combine(
    [C.setValue('test'), C.mapValue((value: string) => value.length)],
    (a, b) => true
  )
);

expectType<(input: any) => number>(
  C.toFunction(C.setValue(1), { count: 1, text: 'a' })
);
expectType<(input: string) => number>(
  C.toFunction(
    C.mapValue((v: string) => v.length),
    { count: 1, text: 'a' }
  )
);

expectType<Reducer<any, number | undefined>>(
  C.toReducer(C.setValue(1), () => ({ count: 1, text: 'a' }))
);
expectType<Reducer<string, number | undefined>>(
  C.toReducer(
    C.mapValue((v: string) => v.length),
    () => ({ count: 1, text: 'a' })
  )
);

expectType<Reducer<any, number>>(
  C.toReducer(
    C.setValue(1),
    () => ({ count: 1, text: 'a' }),
    () => 0
  )
);
expectType<Reducer<string, number>>(
  C.toReducer(
    C.mapValue((v: string) => v.length),
    () => ({ count: 1, text: 'a' }),
    () => 0
  )
);

expectAssignable<Tp<string, number>['_fn']>(
  C.decide((state, value: string) => C.mapValue((v: string) => v.length))
);
expectAssignable<Tp<string, number>['_fn']>(
  C.decide((state, value: string) =>
    value === 'a' ? C.mapValue((v: string) => v.length) : C.setValue(1)
  )
);
expectNotAssignable<Tp<string, string>['_fn']>(
  C.decide((state, value: string) =>
    value === 'a' ? C.mapValue((v: string) => v.length) : C.setValue(1)
  )
);

const C2 = ST.createContext<StateTransformer.Types<string>>();

expectAssignable<Tp<unknown, string>['_fn']>(
  C.withModifiedState(C2)(
    (state) => state.text,
    C2.setValue('a'),
    (output) => ({ count: 0, text: output })
  )
);
expectAssignable<Tp<string, number>['_fn']>(
  C.withModifiedState(C2)(
    (state) => state.text,
    C2.mapValue((input: string, state) => state.length + input.length),
    (_, outerState, output) => ({ ...outerState, count: output })
  )
);
expectNotAssignable<Tp<unknown, number>['_fn']>(
  C.withModifiedState(C2)(
    (state) => state.text,
    C2.setValue('a'),
    (_, __, output) => ({ count: 0, text: output })
  )
);
expectNotAssignable<Tp<boolean, number>['_fn']>(
  C.withModifiedState(C2)(
    (state) => state.text,
    C2.mapValue((input: string, state) => state.length + input.length),
    (_, __, output) => ({ count: 0, text: String(output) })
  )
);

expectAssignable<Tp<string, number>['_fn']>(
  C.evaluateOutput(
    C.mapValue((value: string, state) => state.count + value.length)
  )
);
expectAssignable<Tp<unknown, number>['_fn']>(C.evaluateOutput(C.setValue(1)));
expectNotAssignable<Tp<unknown, number>['_fn']>(
  C.evaluateOutput(C.setValue('a'))
);
expectNotAssignable<Tp<boolean, number>['_fn']>(
  C.mapValue((value: string, state) => state.count + value.length)
);

expectAssignable<Tp<string, string>['_fn']>(
  C.execUntil(
    C.decide((state, value: string) =>
      state.count % 2 === 0
        ? C.mapState((state) => ({ ...state, count: state.count + 1 }))
        : C.mapState((state) => ({ ...state, count: state.count + 2 }))
    ),
    (state) => state.count >= 10
  )
);
expectNotAssignable<Tp<unknown, string>['_fn']>(
  C.execUntil(
    C.decide((state, value: string) =>
      state.count % 2 === 0
        ? C.mapState((state) => ({ ...state, count: state.count + 1 }))
        : C.mapState((state) => ({ ...state, count: state.count + 2 }))
    ),
    (state) => state.count >= 10
  )
);
expectNotAssignable<Tp<string, unknown>['_fn']>(
  C.execUntil(
    C.decide((state, value: string) =>
      state.count % 2 === 0
        ? C.mapState((state) => ({ ...state, count: state.count + 1 }))
        : C.mapState((state) => ({ ...state, count: state.count + 2 }))
    ),
    (state) => state.count >= 10
  )
);
