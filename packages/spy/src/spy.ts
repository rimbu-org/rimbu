/**
 * Convenience type for a function.
 * @typeparam A - the function argument array
 * @typeparam R - the function return type
 */
export type Func<A extends any[] = any[], R = any> = (...args: A) => R;

/**
 * Utility type to use a `Func` type in an interface.
 * @typeparam F - a function type
 */
export interface FuncInterface<F extends Func> {
  (...args: Parameters<F>): ReturnType<F>;
}

/**
 * Utility type to return the contained type of a promise.
 */
export type PromiseValue<P> = P extends Promise<infer R> ? R : never;

/**
 * Convenience type for any type having a constructor.
 * @typeparam A - the constructor argument array
 * @typeparam R - the constructor return type
 */
export type Construct<A extends any[] = any[], R = any> = {
  new (...args: A): R;
};

/**
 * The keys used for stub function results
 */
enum StubCommands {
  RETURNS = 'returns',
  THROWS = 'throws',
  RESOLVES = 'resolves',
  REJECTS = 'rejects',
}
/**
 * Contains functions that can be used to Spy, Stub, and partially Mock functions, objects and classes.
 */
export namespace Spy {
  export const META = Symbol('META');

  /**
   * The extra information added to spied functions.
   * @typeparam F - the spied function type
   */
  export interface FnMeta<F extends Func> {
    /**
     * Returns the number of calls this spy function has received.
     */
    get nrCalls(): number;
    /**
     * Returns true if the spy function has received at least one call.
     */
    get isCalled(): boolean;
    /**
     * Returns an array containing, for each received spy call, the given parameters.
     */
    get calls(): Parameters<F>[];
    /**
     * Sets a stub implementation for this spy function, which will be used instead of the current function implementation
     * upon the next received call.
     * @param stub - the stub implementation to use
     */
    setStub(stub: Spy.FnStub<F> | undefined): void;
    /**
     * Resets the implementation used for the next spy function call to the original one used at construction time.
     */
    resetStub(): void;
    /**
     * Clears the spy functions' `calls` and `nrCalls` history.
     */
    clearCalls(): void;
  }

  /**
   * The spied function type containing extra information about the function calls.
   * @typeparam F - the spied function type
   */
  export interface Fn<F extends Func> extends FuncInterface<F>, FnMeta<F> {}

  /**
   * A single function stub return item.
   * @typeparam F - the spied function type
   */
  export type FnStubItem<F extends Func> =
    | F
    | { [StubCommands.RETURNS]: ReturnType<F> }
    | { [StubCommands.THROWS]: any }
    | { [StubCommands.RESOLVES]: PromiseValue<ReturnType<F>> }
    | { [StubCommands.REJECTS]: any };

  /**
   * The allowed values to supply to a stub spy function implementation. Either a simple stub item or a sequence of stub items.
   * @typeparam F - the spied function type
   */
  export type FnStub<F extends Func> = FnStubItem<F> | Spy.FnStubItem<F>[];

  /**
   * Returns a spied function instance that tracks the function calls and optionally uses some original or stub implementation.
   * @typeparam F - the type of function to spy on
   * @param originalFn - (optional) the original function to spy on, if stubbed still useful to supply to get the correct types
   * @param originalStub - (optional) the default stub implementation to use when the function is called
   * @param onCall - (optional) a callback function that receives the parameters used on each function call
   */
  export function fn<F extends Func>(
    originalFn?: F,
    originalStub?: Spy.FnStub<F>,
    onCall?: (args: Parameters<F>) => void
  ): Spy.Fn<F> {
    // track sequence index for sequence stubs
    let iterator: Iterator<Spy.FnStubItem<F>> | undefined;

    let calls: Parameters<F>[] = [];
    let currentStub = originalStub;

    // use an empty function as our proxy target
    function proxyTarget(): void {
      //
    }

    const fnProxy = new Proxy(proxyTarget, {
      apply(_, thisArg, args: Parameters<F>): any {
        calls.push(args);
        onCall?.(args);

        if (undefined !== currentStub) {
          const getStubResult = (item: Spy.FnStubItem<F>): any => {
            if (typeof item === 'function') {
              // given stub is a simple function
              return item.apply(thisArg, args);
            }
            if (StubCommands.RETURNS in item) {
              // given stub is a simple return value
              return item[StubCommands.RETURNS];
            }
            if (StubCommands.THROWS in item) {
              throw item[StubCommands.THROWS];
            }
            if (StubCommands.RESOLVES in item) {
              return Promise.resolve(item[StubCommands.RESOLVES]);
            }
            if (StubCommands.REJECTS in item) {
              return Promise.reject(item[StubCommands.REJECTS]);
            }

            throw Error('Spy.fn: no valid stub found');
          };

          if (Array.isArray(currentStub)) {
            if (undefined === iterator) {
              iterator = currentStub[Symbol.iterator]();
            }

            const { done, value } = iterator.next();

            if (done) {
              throw Error('Spy.fn: stub sequence is exhasuted');
            }

            return getStubResult(value);
          }

          return getStubResult(currentStub);
        }

        if (undefined !== originalFn) {
          // no stub given, use original function
          return originalFn.apply(thisArg, args);
        }

        // no stub or original function
        return undefined;
      },
    });

    // add the call getters
    Object.defineProperties(proxyTarget, {
      calls: {
        get() {
          return calls;
        },
      },
      isCalled: {
        get() {
          return calls.length > 0;
        },
      },
      nrCalls: {
        get() {
          return calls.length;
        },
      },
    });

    // add the other methods
    Object.assign(proxyTarget, {
      setStub(stub: Spy.FnStub<F> | undefined): void {
        currentStub = stub;
        iterator = undefined;
      },
      resetStub(): void {
        this.setStub(originalStub);
      },
      clearCalls(): void {
        calls = [];
      },
    });

    return fnProxy as Spy.Fn<F>;
  }

  /**
   * The spied object type, where the object methods/functions are augmented with spy information.
   * @typeparam T - the original object type
   * @typeparam M - the metadata type associated with the object
   */
  export type Obj<T, M extends Spy.ObjMeta<T> = Spy.ObjMeta<T>> = {
    [K in keyof T]: T[K] extends Func ? Spy.Fn<T[K]> : T[K];
  } & { [Spy.META]: M };

  /**
   * The additional information available for spied objects.
   */
  export interface ObjMeta<T> {
    /**
     * Returns an array containing a sequence of the object methods called and the given parameters.
     */
    get callSequence(): Spy.MethodCall<T>[];
    /**
     * Returns the amount of calls that the object methods received.
     */
    get nrCalls(): number;
    /**
     * Empties this spied objects' callSequence.
     */
    clearCallSequence(): void;
    /**
     * Empties for each method its call history.
     */
    clearMethods(): void;
    /**
     * Empties both the spied objects' call sequence and its method call histories.
     */
    clearAll(): void;
    /**
     * Resets the stub implementations for all object methods.
     */
    resetMethodStubs(): void;
  }

  /**
   * A method call tuple containing the called method name first, and then the corresponding parameters used.
   */
  export type MethodCall<T, K extends keyof T = keyof T> = readonly [
    method: K,
    ...args: T[K] extends Func ? Parameters<T[K]> : unknown[]
  ];

  /**
   * A stub implementation type for objects of type T.
   * @typeparam T - the original object type
   */
  export type ObjStub<T> = {
    [K in keyof T]?: T[K] extends Func ? Spy.FnStub<T[K]> : T[K];
  };

  /**
   * Returns a tuple containing the spied object, and the metadata object giving more information about the stubbed object.
   * @typeparam T - the object type to spy on
   * @param originalObj - (optional) the original object to spy on
   * @param stubs - (optional) a partial implementation of the object type containing default stubs
   */
  export function obj<
    T extends { readonly [key: string | number | symbol]: any }
  >(originalObj?: T, stubs?: ObjStub<T>): Spy.Obj<T> {
    let callSequence: Spy.MethodCall<T>[] = [];

    function createAndCacheSpy<F extends Func>(
      prop: keyof T,
      originalMethod?: F,
      originalStub?: Spy.FnStub<F>
    ): Spy.Fn<F> {
      // create the spied method using the given existing method and stub
      const spyMethod = Spy.fn(originalMethod, originalStub, (args) => {
        callSequence.push([prop, ...args]);
      });

      // add the spied method to the original object
      proxyTarget[prop] = spyMethod as any;

      return spyMethod;
    }

    const proxyTarget = {} as Spy.Obj<T>;

    const spyObj = new Proxy(proxyTarget, {
      getPrototypeOf(protoTarget): any {
        if (protoTarget !== proxyTarget) {
          // somehow prototype was asked of some other object
          return Object.getPrototypeOf(protoTarget);
        }
        if (undefined === originalObj) {
          // no original object was given, we can only give the default object prototype as a best guess
          return Object.getPrototypeOf(Object);
        }

        // return the prototype of the original object
        return Object.getPrototypeOf(originalObj);
      },
      get(target, prop: keyof T): any {
        if (prop in target) {
          // property is already cached
          return target[prop];
        }

        if (undefined !== stubs && prop in stubs) {
          // stub has been defined for this property

          const propertyStub = stubs[prop] as any;

          if (!(propertyStub instanceof Function)) {
            // the stubbed property is not a method, just return the stubbed value
            return propertyStub;
          }

          // stubbed property is a method, create and cache the method
          return createAndCacheSpy(prop, originalObj?.[prop], propertyStub);
        }

        if (undefined !== originalObj && prop in originalObj) {
          // the property is present in the original object

          const originalValue = originalObj[prop] as any;

          if (!(originalValue instanceof Function)) {
            // the property in the original object is not a method, return the value
            return originalObj[prop as string];
          }

          // the property in the original object is a method, create and cache a spy version of it
          return createAndCacheSpy(prop, originalValue);
        }

        // the property is not present in the original object or stub. assume it's a method and create and
        // cache an empty method
        return createAndCacheSpy(prop);
      },
    });

    // create an add the metadata object
    spyObj[Spy.META] = {
      get callSequence(): typeof callSequence {
        return callSequence;
      },
      get nrCalls(): number {
        return callSequence.length;
      },
      clearCallSequence(): void {
        callSequence = [];
      },
      clearMethods(): void {
        for (const key in spyObj) {
          spyObj[key].clearCalls();
        }
      },
      clearAll(): void {
        this.clearCallSequence();
        this.clearMethods();
      },
      resetMethodStubs(): void {
        for (const key in spyObj) {
          spyObj[key].resetStub();
        }
      },
    };

    return spyObj;
  }

  /**
   * The metadata object type for a spied class.
   * @typeparam C - the class type
   * @typeparam A - the class constructor parameter array type
   */
  export interface ClsMeta<C, A extends any[]> {
    /**
     * Returns the number of class instances created from the spy.
     */
    get nrInstances(): number;
    /**
     * Returns an array of class instance metadata objects containing all instances created from the spy class.
     */
    get instances(): Spy.ClsObj<C, A>[];
    /**
     * Returns an array of received constructor call parameters.
     */
    get constructorCalls(): A[];
    /**
     * Empties the history of created spy class instances.
     */
    clearInstances(): void;
    /**
     * Resets the current spy class constructor stub and all the instances method stubs.
     */
    resetAllStubs(): void;
    /**
     * Resets all the current instance method stubs.
     */
    resetInstanceStubs(): void;
    /**
     * Sets the used constructor stub function for new instances of the spy class.
     * @param constructor - the function to use as constructor of the class
     */
    setConstructorStub(constructor: Func<A, C> | undefined): void;
    /**
     * Resets the used constructor to the originally given constructor.
     */
    resetConstructorStub(): void;
  }

  export interface ClsObjMeta<T, A extends any[]> extends Spy.ObjMeta<T> {
    /**
     * The arguments used to construct the instance.
     */
    readonly constructorArgs: A;
  }

  /**
   * Spy object type of a spied class, containing extra metadata compared to object spies.
   * @typeparam I - the class instance type
   * @typeparam A - the constructor parameter types
   */
  export type ClsObj<I, A extends any[]> = Spy.Obj<I, Spy.ClsObjMeta<I, A>>;

  /**
   * The resulting tuple type of the `Spy.cls` function containing the resulting spy class, and the
   * metadata object containing extra information about the created instances.
   * @typeparam I - the class instance type
   * @typeparam A - the constructor parameter types
   */
  export type Cls<I, A extends any[]> = Construct<A, Spy.ClsObj<I, A>> &
    Spy.ClsMeta<I, A>;

  /**
   * Returns a tuple containing a spied class and an object containing extra information about the created class
   * instances.
   * @typeparam I - the class instance type
   * @typeparam A - the constructor parameter types
   * @param originalClass - (optional) the class to spy on
   * @param originalStubs - (optional) the default stubs to use for each created instance
   * @param originalConstructorStub - (optional) a function to call instead of the class constructor
   */
  export function cls<
    I,
    A extends any[] = I extends Construct ? ConstructorParameters<I> : []
  >(
    originalClass?: Construct<A, I>,
    originalStubs?: Partial<I>,
    originalConstructorStub?: Func<A, I>
  ): Cls<I, A> {
    let instances: Spy.ClsObj<I, A>[] = [];
    let constructorCalls: A[] = [];

    let currentConstructorStub = originalConstructorStub;

    const proxyTarget = class {} as Construct<A, Spy.Obj<I>>;

    const proxy = new Proxy(proxyTarget, {
      construct(target, args: A): any {
        // add the constructor call arguments
        constructorCalls.push(args);

        let obj: any;

        if (undefined !== currentConstructorStub) {
          // use the given stub as constructor
          obj = currentConstructorStub(...args);
        } else if (undefined !== originalClass) {
          // no stub constructor defined, use the original class as constructor
          obj = new originalClass(...args);
        } else {
          // no stub constructor or original class defined, use the empty class constructor
          obj = new proxyTarget(...args);
        }

        // convert the created object to a spy object
        const spyObj = Spy.obj(obj, originalStubs);

        // add the extra meta information to the spy meta object
        (spyObj[Spy.META] as any).constructorArgs = args;

        // add the created instance meta object to the instances array
        instances.push(spyObj as any);

        return spyObj;
      },
    });

    // Add the metadata getters to the spy class
    Object.defineProperties(proxyTarget, {
      instances: {
        get() {
          return instances;
        },
      },
      nrInstances: {
        get() {
          return instances.length;
        },
      },
      constructorCalls: {
        get() {
          return constructorCalls;
        },
      },
    });

    // Add the other metadata properties to the spy class.
    Object.assign(proxyTarget, {
      clearInstances(): void {
        instances = [];
        constructorCalls = [];
      },
      resetAllStubs(): void {
        this.resetConstructorStub();
        this.resetInstanceStubs();
      },
      resetInstanceStubs(): void {
        for (const instance of instances) {
          instance[Spy.META].resetMethodStubs();
        }
      },
      setConstructorStub(constructorStub: Func<A, I> | undefined): void {
        currentConstructorStub = constructorStub;
      },
      resetConstructorStub(): void {
        this.setConstructorStub(originalConstructorStub);
      },
    });

    return proxy as any;
  }
}
