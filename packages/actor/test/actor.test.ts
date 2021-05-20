import { Actor, Obs } from '../src';

describe('Actor', () => {
  it('sets initial state', () => {
    const initState = Obs.create({ a: 1, b: '' });
    const actor = Actor.from(initState, {});
    expect(actor.state).toBe(initState.state);
  });

  it('setState works', () => {
    const actor = Actor.from(Obs.create({ a: 1, b: '' }), {});
    const newState = { a: 2, b: 'a' };
    actor.obs.setState(newState);
    expect(actor.state).toBe(newState);
  });

  it('patch works', () => {
    const actor = Actor.from(Obs.create({ a: 1, b: '' }), {});
    actor.obs.patchState({ a: (v) => v + 1 });
    expect(actor.state).toEqual({ a: 2, b: '' });
  });

  it('subscribe', () => {
    const actor = Actor.from(Obs.create({ a: 1, b: '' }), {});
    const onChange = jest.fn();
    const unsubscribe = actor.obs.subscribe(onChange);

    actor.obs.patchState({ a: 1 });
    expect(onChange).not.toBeCalled();

    actor.obs.patchState({ a: 5 });
    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 5, b: '' }, { a: 1, b: '' });
    onChange.mockClear();

    unsubscribe();

    actor.obs.patchState({ a: 1 });
    expect(onChange).not.toBeCalled();
  });

  it('actions', () => {
    const obs = Obs.create(
      { a: 1, b: '' },
      { derive: (state) => ({ c: state.a + state.b }) }
    );

    const actor = Actor.from(obs, {
      exec(p: number) {
        obs.patchState({ a: (v) => v + p });
      },
    });

    actor.exec(10);

    expect(actor.state).toEqual({ a: 11, b: '', c: '11' });
  });
});
