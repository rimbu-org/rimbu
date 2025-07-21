import { expectError, expectType } from 'tsd';
import { MachineSlice } from '@rimbu/actor';
import { Action, Slice } from '@rimbu/actor';

expectError(MachineSlice.create());
expectError(MachineSlice.create({}));
expectError(MachineSlice.create({ states: 1 }));
expectType<Slice<{ context: unknown; state: string }, never>>(
  MachineSlice.create({
    states: undefined,
  })
);
expectType<Slice<{ context: { count: number }; state: string }, never>>(
  MachineSlice.create({
    states: undefined,
    context: { count: 0 },
  })
);
expectType<Slice<{ context: unknown; state: string }, { a: number }>>(
  MachineSlice.create({
    states: undefined,
    actions: { a: 1 },
  })
);
expectError(MachineSlice.create({ initState: 'a' }));
expectError(MachineSlice.create({ initState: 'a', states: undefined }));
expectError(MachineSlice.create({ states: {} }));
expectError(MachineSlice.create({ initState: 'a', states: {} }));
expectError(
  MachineSlice.create({ initState: 'a', states: { b: { states: undefined } } })
);
expectError(
  MachineSlice.create({
    initState: 'a',
    states: { b: { states: undefined } },
    transitions: (on) => [],
  })
);
const action = Action.create<string>();

expectError(
  MachineSlice.create({
    initState: 'a',
    states: {
      a: { states: undefined },
    },
    transitions: (on) => [on(action, { to: '.b' })],
  })
);

expectError(
  MachineSlice.create({
    states: undefined,
    transitions: (on) => [on(action, { to: '.b' })],
  })
);
