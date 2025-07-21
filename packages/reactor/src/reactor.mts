import { type Actor } from '@rimbu/actor';
import { type Deep } from '@rimbu/deep';
import { useEffect, useMemo, useState } from 'react';

export interface Reactor<S, Tp extends Actor.Types = Actor.Types> {
  useSelect(): S;
  useSelect<SL extends Deep.Selector<S>>(
    selector: SL
  ): Deep.Selector.Result<S, SL>;
  useSelect<
    P extends Deep.Path.Set<S>,
    SL extends Deep.Selector<Deep.Path.Result<S, P>>,
  >(
    path: P,
    selector: SL
  ): Deep.Selector.Result<Deep.Path.Result<S, P>, SL>;
  useSelectBy<SL extends Deep.Selector<S>>(
    selector: SL,
    byFn: (state: S) => any
  ): Deep.Selector.Result<S, SL>;
  useActions(): readonly [
    Actor.ActionsToDispatch<Tp['_actions'], Tp['_dispatch']>,
    Tp['_dispatch'],
  ];
}

export namespace Reactor {
  export function toReact<S, Tp extends Actor.Types>(
    actor: Actor<S, Tp>
  ): Reactor<S, Tp> {
    return {
      useSelect(arg1: any = '', arg2?: any): any {
        const selectedActor = useMemo(() => {
          const result = actor.asObservable().select(arg1);
          if (arg2 === undefined) {
            return result;
          }
          return result.select(arg2);
        }, []);

        const [state, setState] = useState(selectedActor.value);

        useEffect(() => {
          return selectedActor.subscribe(() => {
            setState(selectedActor.value);
          });
        }, [selectedActor]);

        return state;
      },
      useSelectBy(selector: any, byFn: (state: any) => any): any {
        const selectedActor = useMemo(() => {
          return actor.asObservable().select(selector);
        }, []);

        const [state, setState] = useState(selectedActor.value);

        useEffect(() => {
          let lastValue: any = Symbol('novalue');
          return selectedActor.subscribe(() => {
            const byValue = byFn(actor.state);
            if (Object.is(lastValue, byValue)) {
              return;
            }
            lastValue = byValue;
            setState(selectedActor.value);
          });
        }, [selectedActor]);

        return state;
      },
      useActions(): any {
        return useMemo(() => [actor.actions, actor.dispatch] as const, [actor]);
      },
    } as any;
  }
}
