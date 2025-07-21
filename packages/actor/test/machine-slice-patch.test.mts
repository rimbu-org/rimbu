import { Action, Actor } from 'main/index.mjs';
import { MachineSlicePatch } from 'patch/machine-slice-patch.mjs';

describe('MachineSlicePatch', () => {
  it('can work without states', () => {
    const actions = {
      inc: Action.create(),
      setTo: Action.create<number>(),
    };
    const slice = MachineSlicePatch.create({
      states: undefined,
      actions,
      context: { count: 0 },
      transitions: (on) => [
        on(actions.inc, { update: [{ count: (v) => v + 1 }] }),
        on(actions.setTo, (value) => ({ update: [{ count: value }] })),
      ],
    });

    const actor = Actor.configure(slice).build();
    expect(actor.state.context).toEqual({ count: 0 });
    actor.actions.inc();
    expect(actor.state.context).toEqual({ count: 1 });
    actor.actions.setTo(10);
    expect(actor.state.context).toEqual({ count: 10 });
  });

  it('can handle states', () => {
    const actions = {
      inc: Action.create(),
      activate: Action.create(),
      deactivate: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      context: { active: false, count: 0 },
      initState: 'inactive',
      states: {
        active: {
          states: undefined,
          transitions: (on) => [
            on(actions.inc, { update: [{ count: (v) => v + 1 }] }),
            on(actions.deactivate, {
              update: [{ active: true }],
              to: '.active',
            }),
          ],
        },
        inactive: {
          states: undefined,
          transitions: (on) => [
            on(actions.activate, { update: [{ active: true }], to: '.active' }),
          ],
        },
      },
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state).toEqual({
      state: '.inactive',
      context: { active: false, count: 0 },
    });
    actor.actions.inc();
    expect(actor.state).toEqual({
      state: '.inactive',
      context: { active: false, count: 0 },
    });
    actor.actions.activate();
    expect(actor.state).toEqual({
      state: '.active',
      context: { active: true, count: 0 },
    });
    actor.actions.inc();
    expect(actor.state).toEqual({
      state: '.active',
      context: { active: true, count: 1 },
    });
  });

  it('handles state guards', () => {
    const actions = {
      inc: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      states: undefined,
      actions,
      context: { count: 0 },
      transitions: (on) => [
        on(actions.inc, {
          guard: { count: (v) => v < 2 },
          update: [{ count: (v) => v + 1 }],
        }),
      ],
    });

    const actor = Actor.configure(slice).build();
    expect(actor.state.context).toEqual({ count: 0 });
    actor.actions.inc();
    expect(actor.state.context).toEqual({ count: 1 });
    actor.actions.inc();
    expect(actor.state.context).toEqual({ count: 2 });
    actor.actions.inc();
    expect(actor.state.context).toEqual({ count: 2 });
  });

  it('correctly sets nested init state', () => {
    const slice = MachineSlicePatch.create({
      initState: 'a',
      states: {
        a: {
          initState: 'b',
          states: {
            b: { states: undefined },
            c: { states: undefined },
          },
        },
        d: { states: undefined },
      },
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state.state).toEqual('.a.b');
  });

  it('correctly changes to nested state', () => {
    const actions = {
      action: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      initState: 'a',
      states: {
        a: {
          initState: 'b',
          states: {
            b: {
              states: undefined,
              transitions: (on) => [on(actions.action, { to: '.a.c' })],
            },
            c: {
              states: undefined,
              transitions: (on) => [on(actions.action, { to: '.d' })],
            },
          },
        },
        d: {
          states: undefined,
          transitions: (on) => [on(actions.action, { to: '.a.b' })],
        },
      },
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state.state).toEqual('.a.b');
    actor.actions.action();
    expect(actor.state.state).toEqual('.a.c');
    actor.actions.action();
    expect(actor.state.state).toEqual('.d');
    actor.actions.action();
    expect(actor.state.state).toEqual('.a.b');
  });

  it('correctly performs enter actions', () => {
    const actions = {
      action: Action.create(),
    };

    const slice = MachineSlicePatch.create(
      {
        actions,
        context: { level0: 'init', level1: 'init', level2: 'init' },
        initState: 'a',
        states: {
          a: {
            initState: 'b',
            enter: { update: [{ level1: 'enter a' }] },
            states: {
              b: {
                states: undefined,
                enter: { update: [{ level2: 'enter a.b' }] },
                transitions: (on) => [on(actions.action, { to: '.a.c' })],
              },
              c: {
                states: undefined,
                enter: { update: [{ level2: 'enter a.c' }] },
                transitions: (on) => [on(actions.action, { to: '.d' })],
              },
            },
          },
          d: {
            enter: { update: [{ level1: 'enter d' }] },
            states: undefined,
            transitions: (on) => [on(actions.action, { to: '.a.b' })],
          },
        },
        enter: { update: [{ level0: 'entered' }] },
      },
      { skipEnterActionsOnInit: true }
    );

    const actor = Actor.configure(slice).build();

    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'init',
      level2: 'init',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'init',
      level2: 'enter a.c',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'enter d',
      level2: 'enter a.c',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'enter a',
      level2: 'enter a.b',
    });
  });

  it('correctly performs exit actions', () => {
    const actions = {
      action: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      context: { level0: 'init', level1: 'init', level2: 'init' },
      initState: 'a',
      states: {
        a: {
          initState: 'b',
          exit: { update: [{ level1: 'exit a' }] },
          states: {
            b: {
              states: undefined,
              exit: { update: [{ level2: 'exit a.b' }] },
              transitions: (on) => [on(actions.action, { to: '.a.c' })],
            },
            c: {
              states: undefined,
              exit: { update: [{ level2: 'exit a.c' }] },
              transitions: (on) => [on(actions.action, { to: '.d' })],
            },
          },
        },
        d: {
          exit: { update: [{ level1: 'exit d' }] },
          states: undefined,
          transitions: (on) => [on(actions.action, { to: '.a.b' })],
        },
      },
      enter: {
        update: [{ level0: 'entered' }],
      },
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'init',
      level2: 'init',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'init',
      level2: 'exit a.b',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'exit a',
      level2: 'exit a.c',
    });
    actor.actions.action();
    expect(actor.state.context).toEqual({
      level0: 'init',
      level1: 'exit d',
      level2: 'exit a.c',
    });
  });

  it('correctly applies most specific handler', () => {
    const actions = {
      notify: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      initState: 'a',
      states: {
        a: {
          states: undefined,
          transitions: (on) => [
            on(actions.notify, {
              to: '.b',
            }),
          ],
        },
        b: { states: undefined },
      },
      transitions: (on) => [on(actions.notify, { to: '.a' })],
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state.state).toEqual('.a');
    actor.actions.notify();
    expect(actor.state.state).toEqual('.b');
    actor.actions.notify();
    expect(actor.state.state).toEqual('.a');
  });

  it('correctly applies most specific handler with guards', () => {
    const actions = {
      notify: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      context: { count: 0, outer: false },
      initState: 'a',
      states: {
        a: {
          states: undefined,
          transitions: (on) => [
            on(actions.notify, {
              guard: { count: (v) => v < 1 },
              update: [{ count: (v) => v + 1, outer: false }],
              to: '.b',
            }),
          ],
        },
        b: { states: undefined },
      },
      transitions: (on) => [
        on(actions.notify, {
          to: '.a',
          update: [{ outer: true }],
        }),
      ],
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state).toEqual({
      state: '.a',
      context: { count: 0, outer: false },
    });
    actor.actions.notify();
    expect(actor.state).toEqual({
      state: '.b',
      context: { count: 1, outer: false },
    });
    actor.actions.notify();
    expect(actor.state).toEqual({
      state: '.a',
      context: { count: 1, outer: true },
    });
    actor.actions.notify();
    expect(actor.state).toEqual({
      state: '.a',
      context: { count: 1, outer: true },
    });
  });

  it('applies guards on enter and exit actions', () => {
    const actions = {
      action: Action.create(),
      setValue: Action.create<number>(),
    };
    const slice = MachineSlicePatch.create({
      actions,
      context: { value: 0 },
      initState: 'a',
      states: {
        a: {
          states: undefined,
          transitions: (on) => [
            on(actions.action, {
              to: '.b',
            }),
          ],
          enter: {
            guard: { value: (v) => v > 0 },
            update: [{ value: -5 }],
          },
          exit: {
            guard: { value: (v) => v > 0 },
            update: [{ value: -7 }],
          },
        },
        b: {
          states: undefined,
          transitions: (on) => [
            on(actions.action, {
              to: '.a',
            }),
          ],
        },
      },
      transitions: (on) => [
        on(actions.setValue, (value) => ({
          update: [{ value }],
        })),
      ],
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state).toEqual({
      state: '.a',
      context: { value: 0 },
    });
    actor.actions.action();
    expect(actor.state).toEqual({
      state: '.b',
      context: { value: 0 },
    });

    actor.actions.action();
    expect(actor.state).toEqual({
      state: '.a',
      context: { value: 0 },
    });

    actor.actions.setValue(5);
    actor.actions.action();

    expect(actor.state).toEqual({
      state: '.b',
      context: { value: -7 },
    });

    actor.actions.setValue(5);
    actor.actions.action();

    expect(actor.state).toEqual({
      state: '.a',
      context: { value: -5 },
    });
  });

  it('handles relative transitions', () => {
    const actions = {
      action: Action.create(),
    };

    const slice = MachineSlicePatch.create({
      actions,
      initState: 'a',
      states: {
        a: {
          initState: 'b',
          states: {
            b: {
              states: undefined,
              transitions: (on) => [on(actions.action, { to: 'c' })],
            },
            c: {
              states: undefined,
              transitions: (on) => [on(actions.action, { to: '.d' })],
            },
          },
        },
        d: {
          states: undefined,
          transitions: (on) => [on(actions.action, { to: 'a.b' })],
        },
      },
    });

    const actor = Actor.configure(slice).build();

    expect(actor.state.state).toEqual('.a.b');
    actor.actions.action();
    expect(actor.state.state).toEqual('.a.c');
    actor.actions.action();
    expect(actor.state.state).toEqual('.d');
    actor.actions.action();
    expect(actor.state.state).toEqual('.a.b');
  });
});
