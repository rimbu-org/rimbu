import { Reducer } from 'main/reducer.mjs';

describe('Reducer.cloneState', () => {
  it('returns plain state for simple reducers', () => {
    expect(Reducer.count.cloneState(5)).toBe(5);
    expect(Reducer.first().cloneState(undefined)).toBe(undefined);
    expect(Reducer.min().cloneState('abc')).toBe('abc');
  });

  it('returns compound state for reducers with extra state', () => {
    const reducer = Reducer.last<number>().filterInput(() => true);
    const initState: any = reducer.init(() => {});
    const clonedState: any = reducer.cloneState(initState);

    expect(initState).toMatchInlineSnapshot(`
      {
        "index": 0,
        "state": Symbol(none),
      }
    `);

    expect(clonedState).toEqual(initState);
    expect(clonedState).not.toBe(initState);
  });

  it('combine can clone nested states', () => {
    const reducer = Reducer.combine({
      a: Reducer.last<number>().filterInput(() => true),
      b: [Reducer.first<number>(), Reducer.min()],
    });

    const initState: any = reducer.init(() => {});
    const clonedState: any = reducer.cloneState(initState);

    expect(initState).toMatchInlineSnapshot(`
      {
        "a": {
          "halted": false,
          "index": 0,
          "state": {
            "index": 0,
            "state": Symbol(none),
          },
        },
        "b": {
          "halted": false,
          "index": 0,
          "state": [
            {
              "halted": false,
              "index": 0,
              "state": Symbol(none),
            },
            {
              "halted": false,
              "index": 0,
              "state": undefined,
            },
          ],
        },
      }
    `);

    expect(clonedState).toEqual(initState);
    expect(clonedState).not.toBe(initState);
    expect(clonedState.a).not.toBe(initState.a);
    expect(clonedState.a.state).not.toBe(initState.a.state);
    expect(clonedState.b).not.toBe(initState.b);
    expect(clonedState.b.state).not.toBe(initState.b.state);
  });
});
