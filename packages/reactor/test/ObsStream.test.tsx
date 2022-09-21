import { Obs } from '@rimbu/actor';
import { List } from '@rimbu/core';
import { act, render } from '@testing-library/react';
import React from 'react';
import { ObsStream } from '@rimbu/reactor';

describe('ObsStream', () => {
  it('renders empty list', () => {
    const source = Obs.create([] as number[]);

    const Component = (props: { item: number }) => <div>{props.item}</div>;

    const { container } = render(
      <ObsStream
        source={() => source}
        toKey={String}
        toProps={(item) => ({ item })}
        component={Component}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('renders non-empty list', () => {
    const source = Obs.create([1, 2, 3] as number[]);
    const Component = (props: { item: number }) => <div>{props.item}</div>;

    const { container } = render(
      <ObsStream
        source={() => source}
        toKey={String}
        toProps={(item) => ({ item })}
        component={Component}
      />
    );

    expect(container).toMatchSnapshot();
  });

  it('creates only elements for newly added values', () => {
    const Component = jest
      .fn()
      .mockImplementation((props: { item: number }) => <div>{props.item}</div>);

    const itemObs = Obs.create({
      items: List.of(1, 2, 3),
      value: 'a',
    });

    const Control = React.memo(() => {
      return (
        <ObsStream
          source={() => itemObs.mapReadonly((s) => s.items)}
          component={Component}
          toKey={String}
          toProps={(item) => ({ item })}
        />
      );
    });

    const { container } = render(<Control />);

    expect(container.children.length).toBe(3);

    expect(Component).toBeCalledTimes(3);
    Component.mockClear();

    act(() => itemObs.patchState([{ items: (v) => v.concat([4, 5]) }]));

    expect(container.children.length).toBe(5);
    expect(Component).toBeCalledTimes(2);
  });

  it('does rerender when observable value changes', () => {
    const Component = jest
      .fn()
      .mockImplementation((props: { item: number }) => <div>{props.item}</div>);

    const itemObs = Obs.create({ items: List.of(1, 2, 3), value: 'a' });

    const Control = React.memo(() => {
      return (
        <ObsStream
          source={() => itemObs.mapReadonly((s) => s.items)}
          component={Component}
          toKey={String}
          toProps={(item) => ({ item })}
        />
      );
    });

    const { container } = render(<Control />);

    expect(container.children.length).toBe(3);

    expect(Component).toBeCalledTimes(3);
    Component.mockClear();

    act(() =>
      itemObs.patchState([{ items: (v) => v.concat([4, 5]), value: 'b' }])
    );

    expect(container.children.length).toBe(5);
    expect(Component).toBeCalledTimes(2);
  });

  it('removes items', () => {
    const Component = jest
      .fn()
      .mockImplementation((props: { item: number }) => <div>{props.item}</div>);

    const itemObs = Obs.create({
      items: List.of(1, 2, 3).asNormal(),
    });

    const Control = React.memo(() => {
      return (
        <ObsStream
          source={() => itemObs.mapReadonly((s) => s.items)}
          component={Component}
          toKey={String}
          toProps={(item) => ({ item })}
        />
      );
    });

    const { container } = render(<Control />);

    expect(container.children.length).toBe(3);

    expect(Component).toBeCalledTimes(3);
    Component.mockClear();

    act(() => itemObs.patchState([{ items: (v) => v.drop(1) }]));

    expect(container.children.length).toBe(2);
    expect(Component).not.toBeCalled();
  });
});
