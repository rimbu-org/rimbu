import { MachineSliceImmer } from '@rimbu/actor/immer';
import { Action, Actor } from 'main/index.mjs';

describe('MachineSliceImmer', () => {
  it('can work without states', () => {
    const actions = {
      inc: Action.create(),
      setTo: Action.create<number>(),
    };
    const slice = MachineSliceImmer.create({
      states: undefined,
      actions,
      context: { count: 0 },
      transitions: (on) => [
        on(actions.inc, {
          update: (context) => {
            context.count++;
          },
        }),
        on(actions.setTo, (count) => ({
          update: (context) => {
            context.count = count;
          },
        })),
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

    const slice = MachineSliceImmer.create({
      actions,
      context: { active: false, count: 0 },
      initState: 'inactive',
      states: {
        active: {
          states: undefined,
          transitions: (on) => [
            on(actions.inc, {
              update: (context) => {
                context.count++;
              },
            }),
            on(actions.deactivate, {
              update: (context) => {
                context.active = true;
              },
              to: '.active',
            }),
          ],
        },
        inactive: {
          states: undefined,
          transitions: (on) => [
            on(actions.activate, {
              update: (context) => {
                context.active = true;
              },
              to: '.active',
            }),
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

    const slice = MachineSliceImmer.create({
      states: undefined,
      actions,
      context: { count: 0 },
      transitions: (on) => [
        on(actions.inc, {
          guard: (context) => context.count < 2,
          update: (context) => {
            context.count++;
          },
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
    const slice = MachineSliceImmer.create({
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

    const slice = MachineSliceImmer.create({
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

    const slice = MachineSliceImmer.create(
      {
        actions,
        context: { level0: 'init', level1: 'init', level2: 'init' },
        initState: 'a',
        states: {
          a: {
            initState: 'b',
            enter: {
              update: (context) => {
                context.level1 = 'enter a';
              },
            },
            states: {
              b: {
                states: undefined,
                enter: {
                  update: (context) => {
                    context.level2 = 'enter a.b';
                  },
                },
                transitions: (on) => [on(actions.action, { to: '.a.c' })],
              },
              c: {
                states: undefined,
                enter: {
                  update: (context) => {
                    context.level2 = 'enter a.c';
                  },
                },
                transitions: (on) => [on(actions.action, { to: '.d' })],
              },
            },
          },
          d: {
            enter: {
              update: (context) => {
                context.level1 = 'enter d';
              },
            },
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

    const slice = MachineSliceImmer.create({
      actions,
      context: { level0: 'init', level1: 'init', level2: 'init' },
      initState: 'a',
      states: {
        a: {
          initState: 'b',
          exit: {
            update: (context) => {
              context.level1 = 'exit a';
            },
          },
          states: {
            b: {
              states: undefined,
              exit: {
                update: (context) => {
                  context.level2 = 'exit a.b';
                },
              },
              transitions: (on) => [on(actions.action, { to: '.a.c' })],
            },
            c: {
              states: undefined,
              exit: {
                update: (context) => {
                  context.level2 = 'exit a.c';
                },
              },
              transitions: (on) => [on(actions.action, { to: '.d' })],
            },
          },
        },
        d: {
          exit: {
            update: (context) => {
              context.level1 = 'exit d';
            },
          },
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

    const slice = MachineSliceImmer.create({
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

    const slice = MachineSliceImmer.create({
      actions,
      context: { count: 0, outer: false },
      initState: 'a',
      states: {
        a: {
          states: undefined,
          transitions: (on) => [
            on(actions.notify, {
              guard: (context) => context.count < 1,
              update: (context) => {
                context.count++;
                context.outer = false;
              },
              to: '.b',
            }),
          ],
        },
        b: { states: undefined },
      },
      transitions: (on) => [
        on(actions.notify, {
          to: '.a',
          update: (context) => {
            context.outer = true;
          },
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
    const slice = MachineSliceImmer.create({
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
            guard: (context) => context.value > 0,
            update: (context) => {
              context.value = -5;
            },
          },
          exit: {
            guard: (context) => context.value > 0,
            update: (context) => {
              context.value = -7;
            },
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
          update: (context) => {
            context.value = value;
          },
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

    const slice = MachineSliceImmer.create({
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
