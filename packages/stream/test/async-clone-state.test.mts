import { AsyncReducer } from 'main/index.mjs';

describe('AsyncReducer.cloneState', () => {
  it('returns plain state for simple reducers', () => {
    expect(AsyncReducer.min().cloneState(5)).toBe(5);
    expect(AsyncReducer.first().cloneState(undefined)).toBe(undefined);
    expect(AsyncReducer.min().cloneState('abc')).toBe('abc');
  });

  it('returns compound state for reducers with extra state', async () => {
    const reducer = AsyncReducer.last<number>().filterInput(() => true);
    const initState: any = await reducer.init(() => {});
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

  it('combine can clone nested states', async () => {
    const reducer = AsyncReducer.combine({
      a: AsyncReducer.last<number>().filterInput(() => true),
      b: [AsyncReducer.first<number>(), AsyncReducer.min()],
    });

    const initState: any = await reducer.init(() => {});
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
