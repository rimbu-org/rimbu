import { Obs, Command } from '@rimbu/actor';

describe('Command', () => {
  it('executes command', () => {
    const execute = jest.fn();

    const command = Command.create({
      execute: execute as () => void,
    });

    expect(command.state).toBe(true);
    expect(execute).not.toBeCalled();

    command.execute();

    expect(command.state).toBe(true);
    expect(execute).toBeCalledTimes(1);
  });

  it('executes command with given args', () => {
    const execute = jest.fn();

    const command = Command.create({
      execute: execute as (value: number) => void,
    });

    expect(command.state).toBe(true);
    expect(execute).not.toBeCalled();

    command.execute(5);

    expect(command.state).toBe(true);
    expect(execute).toBeCalledWith(5);
  });

  it('does not execute when not enabled', () => {
    const actor = Obs.create({ a: 1, b: '' });

    const execute = jest.fn();

    const command = Command.create({
      execute: execute as (value: number) => void,
      enabled: actor.mapReadonly((state) => state.a > 5),
    });

    expect(command.state).toBe(false);
    expect(execute).not.toBeCalled();

    command.execute(5);

    expect(command.state).toBe(false);
    expect(execute).not.toBeCalled();
  });

  it('executes when enabled', () => {
    const actor = Obs.create({ a: 1, b: '' });

    const execute = jest.fn();

    const command = Command.create({
      execute: execute as (value: number) => void,
      enabled: actor.mapReadonly((state) => state.a > 5),
    });

    command.execute(2);

    expect(command.state).toBe(false);
    expect(execute).not.toBeCalled();

    actor.patchState({ a: 10 });

    expect(command.state).toBe(true);
    expect(execute).not.toBeCalled();

    command.execute(5);

    expect(command.state).toBe(true);
    expect(execute).toBeCalledWith(5);
  });

  it('updates enabled', () => {
    const actor = Obs.create({ a: 1, b: '' });

    const execute = jest.fn();

    const command = Command.create({
      execute: execute as (value: number) => void,
      enabled: actor.mapReadonly((state) => state.a > 5),
    });

    expect(command.state).toBe(false);

    actor.patchState({ a: 10 });

    expect(command.state).toBe(true);

    actor.patchState({ a: 1 });

    expect(command.state).toBe(false);
  });
});
