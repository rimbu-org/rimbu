export class SubscribableImpl implements Subscribable.WithSubscription {
  readonly #listeners: Set<Subscribable.Listener> = new Set();
  readonly #onFirstListener?: Subscribable.Listener | undefined;
  readonly #onNoMoreListeners?: Subscribable.Unsubscribe | undefined;

  constructor(options?: Subscribable.Options) {
    this.#onFirstListener = options?.onFirstListener;
    this.#onNoMoreListeners = options?.onNoMoreListeners;
  }

  get hasListeners(): boolean {
    return this.#listeners.size > 0;
  }

  notifyListeners(): void {
    const currentListeners = new Set(this.#listeners);
    for (const listener of currentListeners) {
      listener();
    }
  }

  subscribe = (listener: Subscribable.Listener): Subscribable.Unsubscribe => {
    if (this.#listeners.size === 0) {
      this.#onFirstListener?.();
    }
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);

      if (this.#listeners.size === 0) {
        this.#onNoMoreListeners?.();
      }
    };
  };
}

export interface Subscribable extends Subscribable.WithSubscription {
  get hasListeners(): boolean;
  notifyListeners(): void;
}

export namespace Subscribable {
  export type Listener = () => void;

  export type Unsubscribe = () => void;

  export type Fn = (
    listener: Subscribable.Listener
  ) => Subscribable.Unsubscribe;

  export interface Options {
    onFirstListener?: Subscribable.Listener | undefined;
    onNoMoreListeners?: Subscribable.Unsubscribe | undefined;
  }

  export interface WithSubscription {
    subscribe: Subscribable.Fn;
  }

  export function create(options?: Subscribable.Options): Subscribable {
    return new SubscribableImpl(options);
  }
}
