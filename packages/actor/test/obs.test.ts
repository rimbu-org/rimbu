import { Obs } from '@rimbu/actor';
import { OrderedHashMap } from '@rimbu/core';
import { Deep } from '@rimbu/deep';

describe('Obs', () => {
  it('asReadonly', () => {
    const obs = Obs.create({ a: 5 });

    expect(obs.asReadonly()).toBe(obs);
  });

  it('primitive valued state', () => {
    const obs = Obs.create(5);

    expect(obs.state).toEqual(5);

    obs.setState(6);

    expect(obs.state).toEqual(6);

    obs.setState((v) => v + 1);

    expect(obs.state).toEqual(7);
  });

  it('object state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
  });

  it('derived state', () => {
    const obs = Obs.create(
      { a: 5, b: { c: 3 } },
      {
        derive: (s) => ({ d: s.a + s.b.c }),
      }
    );

    expect(obs.state).toEqual({ a: 5, b: { c: 3 }, d: 8 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 }, d: 5 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 }, d: 6 });
  });

  it('subscribe', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: 1 }, { derive: (s) => ({ b: s.a * 2 }) });

    const unsubscribe = obs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs.setState({ a: 2 });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 2, b: 4 }, { a: 1, b: 2 });

    onChange.mockReset();

    obs.patchState([{ a: (v) => v + 1 }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 3, b: 6 }, { a: 2, b: 4 });

    onChange.mockReset();

    obs.patchState([{ a: 3 }]);

    expect(onChange).not.toBeCalled();

    unsubscribe();
    onChange.mockReset();

    obs.patchState({ a: 12 });

    expect(onChange).not.toBeCalled();
  });

  it('hasSubscribers', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: 5 });

    expect(obs.hasSubscribers).toBe(false);

    obs.subscribe(onChange);

    expect(obs.hasSubscribers).toBe(true);
  });
});

describe('Obs.mapReadonly', () => {
  it('primitive valued state', () => {
    const obs = Obs.create(5);
    const mappedObs = obs.mapReadonly((s) => s);

    expect(obs.state).toEqual(5);
    expect(mappedObs.state).toEqual(5);

    obs.setState(6);

    expect(obs.state).toEqual(6);
    expect(mappedObs.state).toEqual(6);

    obs.setState((v) => v + 1);

    expect(obs.state).toEqual(7);
    expect(mappedObs.state).toEqual(7);
  });

  it('object state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });
    const mappedObs = obs.mapReadonly((s) => s);

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ a: 5, b: { c: 3 } });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 4 } });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 5 } });
  });

  it('derived state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });

    const mappedObs = obs.mapReadonly((s) => s, {
      derive: (s) => ({ d: s.a + s.b.c }),
    });

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ a: 5, b: { c: 3 }, d: 8 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 4 }, d: 5 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 5 }, d: 6 });
  });

  it('subscribe', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: 1 });

    const mappedObs = obs.mapReadonly((s) => s, {
      derive: (s) => ({ b: s.a * 2 }),
    });

    const unsubscribe = mappedObs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs.setState({ a: 2 });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 2, b: 4 }, { a: 1, b: 2 });

    onChange.mockReset();

    obs.patchState([{ a: (v) => v + 1 }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 3, b: 6 }, { a: 2, b: 4 });

    onChange.mockReset();

    obs.patchState([{ a: 3 }]);

    expect(onChange).not.toBeCalled();

    unsubscribe();
    onChange.mockReset();

    obs.patchState([{ a: (v) => v + 1 }]);

    expect(onChange).not.toBeCalled();
  });

  it('hasSubscribers', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: 5 });
    const mappedObs = obs.mapReadonly((s) => s);

    expect(obs.hasSubscribers).toBe(false);
    expect(mappedObs.hasSubscribers).toBe(false);

    mappedObs.subscribe(onChange);

    expect(obs.hasSubscribers).toBe(true);
    expect(mappedObs.hasSubscribers).toBe(true);
  });
});

describe('Obs.map', () => {
  it('primitive valued state', () => {
    const obs = Obs.create(5);
    const mappedObs = obs.map(
      (s) => s,
      (s) => s
    );

    expect(obs.state).toEqual(5);
    expect(mappedObs.state).toEqual(5);

    obs.setState(6);

    expect(obs.state).toEqual(6);
    expect(mappedObs.state).toEqual(6);

    mappedObs.setState(7);

    expect(obs.state).toEqual(7);
    expect(mappedObs.state).toEqual(7);

    obs.setState((v) => v + 1);

    expect(obs.state).toEqual(8);
    expect(mappedObs.state).toEqual(8);

    mappedObs.setState((v) => v + 1);

    expect(obs.state).toEqual(9);
    expect(mappedObs.state).toEqual(9);
  });

  it('object state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });
    const mappedObs = obs.map(
      (s) => s,
      (s) => s
    );

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ a: 5, b: { c: 3 } });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 4 } });

    mappedObs.setState({ a: 2, b: { c: 5 } });

    expect(obs.state).toEqual({ a: 2, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 5 } });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 2, b: { c: 6 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 6 } });

    mappedObs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 2, b: { c: 7 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 7 } });
  });

  it('derived state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });

    const mappedObs = obs.map(
      (s) => s,
      (s) => s,
      {
        derive: (s) => ({ d: s.a + s.b.c }),
      }
    );

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ a: 5, b: { c: 3 }, d: 8 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ a: 1, b: { c: 4 }, d: 5 });

    mappedObs.setState({ a: 2, b: { c: 5 } });

    expect(obs.state).toEqual({ a: 2, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 5 }, d: 7 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 2, b: { c: 6 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 6 }, d: 8 });

    mappedObs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 2, b: { c: 7 } });
    expect(mappedObs.state).toEqual({ a: 2, b: { c: 7 }, d: 9 });
  });

  it('subscribe', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: { b: 1 } });

    const mappedObs = obs.map(
      (s) => s.a,
      (a) => ({ a })
    );

    const unsubscribe = mappedObs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs.setState({ a: { b: 2 } });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 2 }, { b: 1 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: (v) => v + 1 }] }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 3 }, { b: 2 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: 3 }] }]);

    expect(onChange).not.toBeCalled();

    mappedObs.patchState([{ b: (v) => v + 1 }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 4 }, { b: 3 });

    unsubscribe();
    onChange.mockReset();

    obs.patchState([{ a: [{ b: (v) => v + 1 }] }]);
    mappedObs.patchState({ b: 12 });

    expect(onChange).not.toBeCalled();
  });

  it('hasSubscribers', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: 5 });
    const mappedObs = obs.map(
      (s) => s,
      (s) => s
    );

    expect(obs.hasSubscribers).toBe(false);
    expect(mappedObs.hasSubscribers).toBe(false);

    mappedObs.subscribe(onChange);

    expect(obs.hasSubscribers).toBe(true);
    expect(mappedObs.hasSubscribers).toBe(true);
  });
});

describe('Obs.combineReadonly', () => {
  it('updates combined state from sources', () => {
    const obs1 = Obs.create({ a: 5 });
    const obs2 = Obs.create({ b: 'a' });

    const obs = obs1.combineReadonly(obs2, (v1, v2) => ({ ...v1, ...v2 }));

    expect(obs.state).toEqual({ a: 5, b: 'a' });

    obs1.setState({ a: 8 });

    expect(obs.state).toEqual({ a: 8, b: 'a' });

    obs2.setState({ b: 'b' });

    expect(obs.state).toEqual({ a: 8, b: 'b' });
  });

  it('subscription triggers when sources change', () => {
    const obs1 = Obs.create({ a: 5 });
    const obs2 = Obs.create({ b: 'a' });

    const obs = obs1.combineReadonly(obs2, (v1, v2) => ({ ...v1, ...v2 }));

    const onChange = jest.fn();

    const unsubscribe = obs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs1.setState({ a: 8 });

    expect(onChange).toBeCalledWith({ a: 8, b: 'a' }, { a: 5, b: 'a' });

    onChange.mockReset();

    obs2.setState({ b: 'b' });

    expect(onChange).toBeCalledWith({ a: 8, b: 'b' }, { a: 8, b: 'a' });

    unsubscribe();
    onChange.mockReset();

    obs1.setState({ a: 10 });
    obs2.setState({ b: 'b' });

    expect(onChange).not.toBeCalled();
  });
});

describe('Obs.combine', () => {
  it('updates combined state from sources', () => {
    const obs1 = Obs.create({ a: 5 });
    const obs2 = Obs.create({ b: 'a' });

    const obs = obs1.combine(
      obs2,
      (v1, v2) => ({ ...v1, ...v2 }),
      ({ a, b }) => [{ a }, { b }]
    );

    expect(obs.state).toEqual({ a: 5, b: 'a' });

    obs1.setState({ a: 8 });

    expect(obs.state).toEqual({ a: 8, b: 'a' });

    obs2.setState({ b: 'b' });

    expect(obs.state).toEqual({ a: 8, b: 'b' });
  });

  it('updates sources from combined state', () => {
    const obs1 = Obs.create({ a: 5 });
    const obs2 = Obs.create({ b: 'a' });

    const obs = obs1.combine(
      obs2,
      (v1, v2) => ({ ...v1, ...v2 }),
      ({ a, b }) => [{ a }, { b }]
    );

    expect(obs1.state.a).toBe(5);
    expect(obs2.state.b).toBe('a');

    obs.patchState([{ a: (v) => v + 1 }]);

    expect(obs1.state.a).toBe(6);
    expect(obs2.state.b).toBe('a');

    obs.patchState([{ b: 'b' }]);

    expect(obs1.state.a).toBe(6);
    expect(obs2.state.b).toBe('b');
  });

  it('subscription triggers when sources change', () => {
    const obs1 = Obs.create({ a: 5 });
    const obs2 = Obs.create({ b: 'a' });

    const obs = obs1.combine(
      obs2,
      (v1, v2) => ({ ...v1, ...v2 }),
      ({ a, b }) => [Deep.patchWith([{ a }]), Deep.patchWith([{ b }])]
    );

    const onChange = jest.fn();

    const unsubscribe = obs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs1.setState({ a: 8 });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 8, b: 'a' }, { a: 5, b: 'a' });

    onChange.mockReset();

    obs2.setState({ b: 'b' });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ a: 8, b: 'b' }, { a: 8, b: 'a' });

    unsubscribe();
    onChange.mockReset();

    obs1.setState({ a: 12 });
    obs2.setState({ b: 'z' });
    obs.setState({ a: 13, b: 'zz' });

    expect(onChange).not.toBeCalled();
  });
});

describe('Obs.selectReadonly', () => {
  it('object state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });
    const mappedObs = obs.selectReadonly('b');

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ c: 3 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ c: 4 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ c: 5 });
  });

  it('derived state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });

    const mappedObs = obs.selectReadonly('b', {
      derive: (s) => ({ d: s.c * 2 }),
    });

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ c: 3, d: 6 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ c: 4, d: 8 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ c: 5, d: 10 });
  });

  it('subscribe', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: { b: 1 } });

    const mappedObs = obs.selectReadonly('a', {
      derive: (s) => ({ c: s.b * 2 }),
    });

    const unsubscribe = mappedObs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs.setState({ a: { b: 2 } });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 2, c: 4 }, { b: 1, c: 2 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: (v) => v + 1 }] }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 3, c: 6 }, { b: 2, c: 4 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: 3 }] }]);

    expect(onChange).not.toBeCalled();

    unsubscribe();
    onChange.mockReset();

    obs.patchState([{ a: [{ b: (v) => v + 1 }] }]);

    expect(onChange).not.toBeCalled();
  });

  it('hasSubscribers', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: { b: 1 } });
    const mappedObs = obs.selectReadonly('a');

    expect(obs.hasSubscribers).toBe(false);
    expect(mappedObs.hasSubscribers).toBe(false);

    mappedObs.subscribe(onChange);

    expect(obs.hasSubscribers).toBe(true);
    expect(mappedObs.hasSubscribers).toBe(true);
  });
});

describe('Obs.select', () => {
  it('object state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });
    const mappedObs = obs.select('b');

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ c: 3 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ c: 4 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ c: 5 });

    mappedObs.patchState([{ c: (v) => v + 1 }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 6 } });
    expect(mappedObs.state).toEqual({ c: 6 });
  });

  it('derived state', () => {
    const obs = Obs.create({ a: 5, b: { c: 3 } });

    const mappedObs = obs.select('b', {
      derive: (s) => ({ d: s.c * 2 }),
    });

    expect(obs.state).toEqual({ a: 5, b: { c: 3 } });
    expect(mappedObs.state).toEqual({ c: 3, d: 6 });

    obs.setState({ a: 1, b: { c: 4 } });

    expect(obs.state).toEqual({ a: 1, b: { c: 4 } });
    expect(mappedObs.state).toEqual({ c: 4, d: 8 });

    obs.patchState([{ b: [{ c: (v) => v + 1 }] }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 5 } });
    expect(mappedObs.state).toEqual({ c: 5, d: 10 });

    mappedObs.patchState([{ c: (v) => v + 1 }]);

    expect(obs.state).toEqual({ a: 1, b: { c: 6 } });
    expect(mappedObs.state).toEqual({ c: 6, d: 12 });
  });

  it('subscribe', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: { b: 1 } });

    const mappedObs = obs.select('a', {
      derive: (s) => ({ c: s.b * 2 }),
    });

    const unsubscribe = mappedObs.subscribe(onChange);

    expect(onChange).not.toBeCalled();

    obs.setState({ a: { b: 2 } });

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 2, c: 4 }, { b: 1, c: 2 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: (v) => v + 1 }] }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 3, c: 6 }, { b: 2, c: 4 });

    onChange.mockReset();

    obs.patchState([{ a: [{ b: 3 }] }]);

    expect(onChange).not.toBeCalled();

    onChange.mockReset();

    mappedObs.patchState([{ b: (v) => v + 1 }]);

    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toBeCalledWith({ b: 4, c: 8 }, { b: 3, c: 6 });

    unsubscribe();
    onChange.mockReset();

    obs.patchState({ a: { b: 10 } });
    mappedObs.patchState({ b: 12 });

    expect(onChange).not.toBeCalled();
  });

  it('hasSubscribers', () => {
    const onChange = jest.fn();

    const obs = Obs.create({ a: { b: 1 } });
    const mappedObs = obs.select('a');

    expect(obs.hasSubscribers).toBe(false);
    expect(mappedObs.hasSubscribers).toBe(false);

    mappedObs.subscribe(onChange);

    expect(obs.hasSubscribers).toBe(true);
    expect(mappedObs.hasSubscribers).toBe(true);
  });
});

describe('additional tests', () => {
  it('updates nested immutable collection', () => {
    const onChange = jest.fn();

    const obs = Obs.create({
      a: OrderedHashMap.of([1, { label: 'a', done: false }]),
    });

    obs.subscribe(onChange);

    obs.patchState([{ a: (v) => v.set(1, { label: 'a', done: true }) }]);

    expect(onChange).toBeCalledTimes(1);
  });
});
