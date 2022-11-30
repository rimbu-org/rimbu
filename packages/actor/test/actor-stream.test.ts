import { Actor } from '../src/main';
import { SlicePatch } from '../src/patch';
import { ActorStream } from '../src/stream';
import { Spy } from '@rimbu/spy';

function delay(amount = 100) {
  return new Promise((res) => setTimeout(res, amount));
}

describe('ActorStream.enhancer', () => {
  it('emits actions and states', async () => {
    const slice = SlicePatch.create({
      name: 'countslice',
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: ActorStream.enhancer,
    });

    const stream = actor.stream();

    const func = Spy.fn();

    stream.forEachPure(func);

    const action = actor.actionCreators.inc();
    actor.dispatch(action);

    expect(actor.getState()).toEqual({ count: 1 });

    await delay();

    expect(func.nrCalls).toBe(1);
    expect(func.calls[0][0]).toMatchObject({
      prevState: { count: 0 },
      state: { count: 1 },
      action,
    });
  });

  it('supports closing the stream', async () => {
    const slice = SlicePatch.create({
      name: 'countslice',
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: ActorStream.enhancer,
    });

    const stream = actor.stream();

    const func = Spy.fn();

    stream.forEach((v, _, halt) => {
      halt();
      func(v);
    });

    const action = actor.actionCreators.inc();

    actor.dispatch(action);

    expect(actor.getState()).toEqual({ count: 1 });

    await new Promise((res) => setTimeout(res, 100));

    expect(func.nrCalls).toBe(1);
    expect(func.calls[0][0]).toMatchObject({
      prevState: { count: 0 },
      state: { count: 1 },
      action,
    });

    func.clearCalls();

    actor.dispatch(action);

    expect(actor.getState()).toEqual({ count: 2 });

    await delay();

    expect(func.nrCalls).toBe(0);
  });

  it('supports multiple listeners', async () => {
    const slice = SlicePatch.create({
      name: 'countslice',
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: ActorStream.enhancer,
    });

    const stream = actor.stream();

    const func1 = Spy.fn();
    const func2 = Spy.fn();

    stream.forEachPure(func1);
    stream.forEachPure(func2);

    actor.actions.inc();

    expect(actor.getState()).toEqual({ count: 1 });

    await delay();

    expect(func1.nrCalls).toBe(1);
    expect(func2.nrCalls).toBe(1);
    expect(func1.calls[0]).toEqual(func2.calls[0]);
  });

  it('can dispatch from stream', async () => {
    const slice = SlicePatch.create({
      name: 'countslice',
      initState: { count: 0 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });

    const actor = Actor.configure({
      ...slice,
      enhancer: ActorStream.enhancer,
    });

    const stream = actor.stream();

    stream.forEachPure(async ({ actor }) => {
      await delay();
      actor.actions.inc();
    });

    actor.actions.inc();

    expect(actor.getState()).toEqual({ count: 1 });

    await delay(200);

    expect(actor.getState()).toEqual({ count: 2 });
  });
});
