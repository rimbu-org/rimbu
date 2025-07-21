import { Actor } from 'main/index.mjs';
import { SlicePatch } from 'patch/index.mjs';

describe('Actor Select', () => {
  it('can select simple state', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });
    const actor = Actor.configure(slice).build();

    const selectCount = actor.asObservable().select((state) => state.count);

    expect(selectCount.value).toBe(0);
    actor.actions.inc();
    expect(selectCount.value).toBe(1);
  });

  it('does not invoke listeners on not selected state changes', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });
    const actor = Actor.configure(slice).build();

    const totalActor = actor.asObservable().select((state) => state.total);

    const listener = vi.fn();
    totalActor.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
    actor.actions.inc();
    expect(listener).toHaveBeenCalledTimes(1);
    actor.actions.inc();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not invoke listeners on not selected state changes for select object', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }],
      },
    });
    const actor = Actor.configure(slice).build();

    const totalActor = actor
      .asObservable()
      .select([
        'total',
        (state) => state.total,
        { c: 'total', d: (state) => state.total },
      ]);

    const listener = vi.fn();
    totalActor.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
    actor.actions.inc();
    expect(listener).toHaveBeenCalledTimes(1);
    actor.actions.inc();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('updates multiple selected values', () => {
    const slice = SlicePatch.create({
      initState: { count: 0, total: 10 },
      actions: {
        inc: () => [{ count: (v) => v + 1 }, { total: (v, p) => v + p.count }],
      },
    });
    const actor = Actor.configure(slice).build();

    const totalActor = actor
      .asObservable()
      .select([
        'total',
        (state) => state.total,
        { c: 'total', d: (state) => state.total },
      ]);

    const listener = vi.fn();
    totalActor.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
    expect(totalActor.value).toEqual([10, 10, { c: 10, d: 10 }]);
    actor.actions.inc();
    expect(totalActor.value).toEqual([11, 11, { c: 11, d: 11 }]);
    expect(listener).toHaveBeenCalledTimes(1);
    actor.actions.inc();
    expect(totalActor.value).toEqual([13, 13, { c: 13, d: 13 }]);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
