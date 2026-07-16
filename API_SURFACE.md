# Rimbu Public API Surface (resolved)

Generated via the TypeScript TypeChecker from each package entry point, resolving inherited members within the same package so that collection interfaces list their own methods plus those inherited from base classes (e.g. List shows methods from ListBase). Cross-package types are kept as references (covered by their own package section). Base-class declarations live in the package internal/ and advanced/ tiers and are pulled in when reachable from a public type, so collection interfaces show their full method set including inherited members.

## @rimbu/reactor

```ts
export declare function updateSelectorValue<S>(state: S, selector: Deep.Selector.Shape<any>, selectorCache: SelectorCache): any;

/**
 * React hook that returns a callback forcing the calling component to re-render.
 * @returns a function that, when called, triggers a re-render of the component
 */
export declare function useForceRerender(): () => void;

export type SelectorEntry = {
    value: unknown;
    listeners: Map<Actor.Listener, {
        count: number;
    }>;
};

export type SelectorCache = Map<Deep.Selector.Shape<any>, SelectorEntry>;

/**
 * An actor augmented with React hook support: `use()` returns the dispatch plus a
 * `useSelect` hook that re-renders the component only when the selected slice of state changes.
 * @typeparam A - the underlying actor type
 * @typeparam S - the actor state type
 * @typeparam D - the dispatch function type
 */
export type Reactor<A extends Actor.Base<S> & Actor.Dispatch<D>, S, D extends (...args: any[]) => any> = A & {
    use(): Actor.Dispatch<D> & {
        useSelect<SL extends Deep.Selector<S>>(selector: Deep.Selector.Shape<SL>, deps?: React.DependencyList): Deep.Selector.Result<S, SL>;
    };
};

export declare namespace Reactor {
    /**
     * Actor enhancer that adds React reactive selector support. Wrap an actor with this
     * enhancer so components can subscribe to fine-grained slices of state via `actor.use().useSelect(...)`.
     * @typeparam S - the actor state type
     * @typeparam A - the actor type
     * @typeparam D - the dispatch type
     * @param actor - the base actor to enhance
     * @returns the enhanced reactor actor exposing `use()`
     * @example
     * ```ts
     * const reactor = Reactor.enhancer(actor);
     * function Comp() {
     *   const count = reactor.use().useSelect((s) => s.count);
     *   return <button onClick={() => reactor.dispatch(...)}>{count}</button>;
     * }
     * ```
     */
    function enhancer<S, A extends Actor.Base<S> & Actor.Dispatch<D>, D extends (...args: any[]) => any>(actor: A & Actor.Base<S>): Reactor<A, S, D>;
}

export declare function unregisterSelector(selector: Deep.Selector.Shape<any>, listener: Actor.Listener, selectorCache: SelectorCache): void;

export declare function registerSelector<S>(state: S, selector: Deep.Selector.Shape<any>, listener: Actor.Listener, selectorCache: SelectorCache): SelectorEntry;
```
