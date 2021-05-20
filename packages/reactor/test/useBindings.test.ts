import { Command, Obs } from '@rimbu/actor';
import { act, renderHook } from '@testing-library/react-hooks';
import { Binding, useBindings } from '../src';

describe('useBindings', () => {
  it('Binding.command works', () => {
    const execute = jest.fn();

    const enabled = Obs.create(true);

    const command = Command.create({
      execute,
      enabled,
    });

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.command(command) }))
    );

    const props1 = result.current.b;

    expect(props1.disabled).toBe(false);

    expect(execute).toBeCalledTimes(0);

    props1.onClick();

    expect(execute).toBeCalledTimes(1);

    act(() => enabled.setState(false));

    const props2 = result.current.b;

    expect(props2.disabled).toBe(true);
  });

  it('Binding.command works with arguments', () => {
    const execute = jest.fn();

    const enabled = Obs.create(true);

    const command = Command.create<[number, string]>({
      execute,
      enabled,
    });

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.command(command, 1, 'a') }))
    );

    const props1 = result.current.b;

    expect(props1.disabled).toBe(false);

    expect(execute).toBeCalledTimes(0);

    props1.onClick();

    expect(execute).toBeCalledTimes(1);
    expect(execute).toBeCalledWith(1, 'a');

    act(() => enabled.setState(false));

    const props2 = result.current.b;

    expect(props2.disabled).toBe(true);
  });

  it('Binding.commandArgs works', () => {
    const execute = jest.fn();

    const enabled = Obs.create(true);

    const command = Command.create<[number, string]>({
      execute,
      enabled,
    });

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.commandArgs(command) }))
    );

    const props1 = result.current.b(1, 'a');

    expect(props1.disabled).toBe(false);

    expect(execute).toBeCalledTimes(0);

    props1.onClick();

    expect(execute).toBeCalledTimes(1);
    expect(execute).toBeCalledWith(1, 'a');

    act(() => enabled.setState(false));

    const props2 = result.current.b(1, 'a');

    expect(props2.disabled).toBe(true);
  });

  it('Binding.inputChecked from observable', () => {
    const obs = Obs.create(false);
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputChecked(obs, enabled) }))
    );

    expect(result.current.b.checked).toBe(false);
    expect(result.current.b.disabled).toBe(false);

    act(() => obs.setState(true));

    expect(result.current.b.checked).toBe(true);
    expect(result.current.b.disabled).toBe(false);

    act(() => enabled.setState(false));

    expect(result.current.b.checked).toBe(true);
    expect(result.current.b.disabled).toBe(true);
  });

  it('Binding.inputChecked from input', () => {
    const obs = Obs.create(false);
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputChecked(obs, enabled) }))
    );

    act(() => result.current.b.onChange({ target: { checked: true } } as any));

    expect(obs.state).toBe(true);
  });

  it('Binding.inputCheckedReadonly from observable', () => {
    const obs = Obs.create(false);
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputCheckedReadonly(obs, enabled) }))
    );

    expect(result.current.b.checked).toBe(false);
    expect(result.current.b.disabled).toBe(false);

    act(() => obs.setState(true));

    expect(result.current.b.checked).toBe(true);
    expect(result.current.b.disabled).toBe(false);

    act(() => enabled.setState(false));

    expect(result.current.b.checked).toBe(true);
    expect(result.current.b.disabled).toBe(true);
  });

  it('Binding.inputValue from observable', () => {
    const obs = Obs.create('a');
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputValue(obs, enabled) }))
    );

    expect(result.current.b.value).toBe('a');
    expect(result.current.b.disabled).toBe(false);

    act(() => obs.setState('b'));

    expect(result.current.b.value).toBe('b');
    expect(result.current.b.disabled).toBe(false);

    act(() => enabled.setState(false));

    expect(result.current.b.value).toBe('b');
    expect(result.current.b.disabled).toBe(true);
  });

  it('Binding.inputValue from input', () => {
    const obs = Obs.create('a');
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputValue(obs, enabled) }))
    );

    act(() => result.current.b.onChange({ target: { value: 'b' } } as any));

    expect(obs.state).toBe('b');
  });

  it('Binding.inputValueReadonly from observable', () => {
    const obs = Obs.create('a');
    const enabled = Obs.create(true);

    const { result } = renderHook(() =>
      useBindings(() => ({ b: Binding.inputValueReadonly(obs, enabled) }))
    );

    expect(result.current.b.value).toBe('a');
    expect(result.current.b.disabled).toBe(false);

    act(() => obs.setState('b'));

    expect(result.current.b.value).toBe('b');
    expect(result.current.b.disabled).toBe(false);

    act(() => enabled.setState(false));

    expect(result.current.b.value).toBe('b');
    expect(result.current.b.disabled).toBe(true);
  });
});
