import { select, type Selector } from '@rimbu/deep';
import { Subscribable } from './internal.mjs';

export interface Observable<T> extends Subscribable.WithSubscription {
  get value(): T;

  select<const SL extends Selector<T>>(
    selector: SL
  ): Observable<Selector.Result<T, SL>>;
}

abstract class ObservableBase<T> implements Observable<T> {
  abstract get value(): T;
  abstract get subscribable(): Subscribable;

  get subscribe(): (
    listener: Subscribable.Listener
  ) => Subscribable.Unsubscribe {
    return this.subscribable.subscribe;
  }

  select<SL extends Selector<T>>(
    selector: SL
  ): Observable<Selector.Result<T, SL>> {
    if (selector === '') {
      return this as any;
    }

    return new LazyObservableImpl<Selector.Result<T, SL>>(
      (currentValue) => select(this.value, selector as any, currentValue),
      this.subscribable
    );
  }
}

const STALE_SYMBOL = Symbol('stale-state');
type STALE_SYMBOL = typeof STALE_SYMBOL;

class SourceObservableImpl<T>
  extends ObservableBase<T>
  implements Observable.Source<T>
{
  readonly #subscribable: Subscribable = Subscribable.create();

  #value: T;

  constructor(initValue: T) {
    super();
    this.#value = initValue;
  }

  get value(): T {
    return this.#value;
  }

  get subscribable(): Subscribable {
    return this.#subscribable;
  }

  setValue(newValue: T): void {
    if (!Object.is(this.#value, newValue)) {
      this.#value = newValue;
      this.#subscribable.notifyListeners();
    }
  }
}

class LazyObservableImpl<T>
  extends ObservableBase<T>
  implements Observable.Lazy<T>
{
  readonly #subscribable: Subscribable;
  readonly #sourceSubscribable?: Subscribable | undefined;
  readonly #getNewValue: (currentValue?: T | undefined) => T;

  #cachedValue: T | STALE_SYMBOL = STALE_SYMBOL;

  #unsubscribe: Subscribable.Unsubscribe | undefined;

  constructor(
    getNewValue: (currentValue: T | undefined) => T,
    sourceSubscribable?: Subscribable | undefined
  ) {
    super();
    this.#getNewValue = getNewValue;
    this.#sourceSubscribable = sourceSubscribable;

    this.#subscribable = Subscribable.create({
      onFirstListener: (): void => {
        this.#unsubscribe?.();
        this.#unsubscribe = this.#sourceSubscribable?.subscribe(() => {
          this.notifyChange();
        });
      },
      onNoMoreListeners: (): void => {
        this.#unsubscribe?.();
        this.#unsubscribe = undefined;
      },
    });
  }

  get subscribable(): Subscribable {
    return this.#subscribable;
  }

  get value(): T {
    if (this.subscribable.hasListeners) {
      if (this.#cachedValue === STALE_SYMBOL) {
        this.#cachedValue = this.#getNewValue();
      }

      return this.#cachedValue;
    }

    if (this.#cachedValue === STALE_SYMBOL) {
      this.#cachedValue = this.#getNewValue();
    }

    if (!this.#unsubscribe) {
      this.#unsubscribe = this.#sourceSubscribable?.subscribe(() => {
        this.#unsubscribe?.();
        this.#unsubscribe = undefined;
        this.#cachedValue = STALE_SYMBOL;
      });
    }

    return this.#cachedValue;
  }

  notifyChange(): void {
    if (!this.subscribable.hasListeners) {
      this.#cachedValue = STALE_SYMBOL;
      return;
    }

    if (this.#cachedValue === STALE_SYMBOL) {
      this.#cachedValue = this.#getNewValue();
    } else {
      const newValue = this.#getNewValue(this.#cachedValue);

      if (Object.is(newValue, this.#cachedValue)) {
        return;
      }

      this.#cachedValue = newValue;
    }

    this.#subscribable.notifyListeners();
  }
}

export namespace Observable {
  export interface Source<T> extends Observable<T> {
    setValue(newValue: T): void;
  }

  export interface Lazy<T> extends Observable<T> {
    notifyChange(): void;
  }

  export function create<T>(initValue: T): Observable.Source<T> {
    return new SourceObservableImpl<T>(initValue);
  }

  export function createLazy<T>(
    getNewValue: (currentValue: T | undefined) => T
  ): Observable.Lazy<T> {
    return new LazyObservableImpl<T>(getNewValue);
  }
}
