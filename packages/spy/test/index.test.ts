import { Spy } from "../src";

describe("Spy.fn", () => {
  function add(x: number, y: number): number {
    return x + y;
  }

  async function asyncAdd(x: number, y: number): Promise<number> {
    return x + y;
  }

  it("initial values", () => {
    const fn = Spy.fn();
    expect(typeof fn).toEqual("function");
    expect(fn.calls).toEqual([]);
    expect(fn.nrCalls).toEqual(0);
  });

  it("function returns undefined when called", () => {
    const fn = Spy.fn();
    expect(fn()).toEqual(undefined);
    expect(fn.nrCalls).toEqual(1);
    expect(fn.calls).toEqual([[]]);
  });

  it("uses original function when no stub", () => {
    const fn = Spy.fn(add);
    expect(fn(3, 4)).toEqual(7);
    expect(fn.nrCalls).toEqual(1);
    expect(fn.calls[0]).toEqual([3, 4]);
  });

  it("uses stub function when no original", () => {
    const fn = Spy.fn<typeof add>(undefined, (x) => -x);
    expect(fn(3, 4)).toEqual(-3);
    expect(fn.nrCalls).toEqual(1);
    expect(fn.calls[0]).toEqual([3, 4]);
  });

  it("uses stub function when original", () => {
    const fn = Spy.fn(add, (x) => -x);
    expect(fn(3, 4)).toEqual(-3);
    expect(fn.nrCalls).toEqual(1);
    expect(fn.calls[0]).toEqual([3, 4]);
  });

  it("stub returns", () => {
    const fn = Spy.fn(add, { returns: -1 });
    expect(fn(3, 4)).toEqual(-1);
    expect(fn(5, 6)).toEqual(-1);
    expect(fn.nrCalls).toEqual(2);
  });

  it("stub throws", () => {
    const err = Error("test");

    const fn = Spy.fn(add, { throws: err });
    expect(() => fn(3, 4)).toThrow(err);
  });

  it("stub resolves", async () => {
    const fn = Spy.fn(asyncAdd, { resolves: -1 });
    expect(await fn(3, 4)).toEqual(-1);
    expect(await fn(5, 6)).toEqual(-1);
    expect(fn.nrCalls).toEqual(2);
    expect(fn.calls).toEqual([[3, 4], [5, 6]]);
  });

  it("stub rejects", async () => {
    const err = Error("test");
    const fn = Spy.fn(asyncAdd, { rejects: err });
    await expect(fn(3, 4)).rejects.toThrow(err);
  });

  it("stub returnsSeq", () => {
    const fn = Spy.fn(add, [{ returns: -1 }, { returns: -2 }]);
    expect(fn(3, 4)).toEqual(-1);
    expect(fn(5, 6)).toEqual(-2);
    expect(fn.nrCalls).toEqual(2);
    expect(() => fn(3, 4)).toThrow();
  });

  it("stub resolvesSeq", async () => {
    const fn = Spy.fn(asyncAdd, [{ resolves: -1 }, { resolves: -2 }]);
    expect(await fn(3, 4)).toEqual(-1);
    expect(await fn(5, 6)).toEqual(-2);
    expect(fn.nrCalls).toEqual(2);
    expect(fn.calls).toEqual([[3, 4], [5, 6]]);
  });

  it("stub stubSeq", () => {
    const fn = Spy.fn(add, [(x) => -x, (x, y) => -y]);
    expect(fn(3, 4)).toEqual(-3);
    expect(fn(3, 4)).toEqual(-4);
    expect(fn.nrCalls).toEqual(2);
    expect(() => fn(3, 4)).toThrow();
  });

  it("setStub", () => {
    const fn = Spy.fn(add);
    fn.setStub((x) => -x);
    expect(fn.nrCalls).toEqual(0);
    expect(fn(3, 4)).toEqual(-3);
    expect(fn.nrCalls).toEqual(1);
  });

  it("resetStub", () => {
    const fn = Spy.fn(add);
    fn.setStub((x) => -x);
    fn.resetStub();
    expect(fn(3, 4)).toEqual(7);
  });

  it("clearCalls", () => {
    const fn = Spy.fn(add, () => -1);
    expect(fn(3, 4)).toEqual(-1);
    fn.clearCalls();
    expect(fn.nrCalls).toEqual(0);
    expect(fn(3, 4)).toEqual(-1);
    expect(fn.nrCalls).toEqual(1);
  });

  it("onCall is called with stub", () => {
    const onCall = Spy.fn();
    const fn = Spy.fn(add, () => -1, onCall);
    expect(onCall.nrCalls).toEqual(0);
    expect(fn(3, 4)).toEqual(-1);
    expect(onCall.nrCalls).toEqual(1);
    expect(onCall.calls[0]).toEqual([[3, 4]]);
  });

  it("onCall is called without stub", () => {
    const onCall = Spy.fn();
    const fn = Spy.fn(add, undefined, onCall);
    expect(onCall.nrCalls).toEqual(0);
    expect(fn(3, 4)).toEqual(7);
    expect(onCall.nrCalls).toEqual(1);
    expect(onCall.calls[0]).toEqual([[3, 4]]);
  });

  it("throws on invalid stub", () => {
    const fn = Spy.fn(add, { a: 1 } as any);
    expect(() => fn(3, 4)).toThrow();
  });
});

describe("Spy.obj", () => {
  interface Foo {
    bar(x: number, y: number): number;
  }

  const fooObj: Foo = {
    bar(x, y) {
      return x + y;
    },
  };

  it("initial values", () => {
    const obj = Spy.obj<Foo>();
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj.bar.nrCalls).toEqual(0);
  });

  it("works without any initialization", () => {
    const obj = Spy.obj<Foo>();
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj.bar(3, 4)).toEqual(undefined);
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj[Spy.META].callSequence[0]).toEqual(["bar", 3, 4]);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.calls[0]).toEqual([3, 4]);
  });

  it("uses the original provided object if no stubs provided", () => {
    const obj = Spy.obj(fooObj);
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj.bar(3, 4)).toEqual(7);
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj[Spy.META].callSequence[0]).toEqual(["bar", 3, 4]);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.calls[0]).toEqual([3, 4]);
  });

  it("results in the same class instance", () => {
    class A {
      f() {
        return 1;
      }
    }
    const a = new A();
    const obj = Spy.obj(a);
    expect(obj).toBeInstanceOf(A);
  });

  it("uses the stubs object if no original provided", () => {
    const obj = Spy.obj<Foo>(undefined, {
      bar(x) {
        return -x;
      },
    });
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj.bar(3, 4)).toEqual(-3);
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj[Spy.META].callSequence[0]).toEqual(["bar", 3, 4]);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.calls[0]).toEqual([3, 4]);
  });

  it("uses the stubs object if original provided", () => {
    const obj = Spy.obj(fooObj, {
      bar(x) {
        return -x;
      },
    });
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj.bar(3, 4)).toEqual(-3);
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj[Spy.META].callSequence[0]).toEqual(["bar", 3, 4]);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.calls[0]).toEqual([3, 4]);
  });

  it("can access methods even is they are not called", () => {
    const obj = Spy.obj<Foo>();
    expect(obj.bar.nrCalls).toEqual(0);
  });

  it("can stub values", () => {
    const obj = Spy.obj({ a: 1 }, { a: 3 });
    expect(obj.a).toEqual(3);
  });

  it("clearCallSequence", () => {
    const obj = Spy.obj<Foo>();
    obj.bar(3, 4);
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj.bar.nrCalls).toEqual(1);
    obj[Spy.META].clearCallSequence();
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj.bar.nrCalls).toEqual(1);
  });

  it("clearMethods", () => {
    const obj = Spy.obj<Foo>();
    obj.bar(3, 4);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.nrCalls).toEqual(1);
    obj[Spy.META].clearMethods();
    expect(obj[Spy.META].nrCalls).toEqual(1);
    expect(obj[Spy.META].callSequence).toEqual([["bar", 3, 4]]);
    expect(obj.bar.nrCalls).toEqual(0);
  });

  it("clearAll", () => {
    const obj = Spy.obj<Foo>();
    obj.bar(3, 4);
    expect(obj.bar.nrCalls).toEqual(1);
    expect(obj.bar.calls).toEqual([[3, 4]]);
    obj[Spy.META].clearAll();
    expect(obj[Spy.META].nrCalls).toEqual(0);
    expect(obj[Spy.META].callSequence).toEqual([]);
    expect(obj.bar.nrCalls).toEqual(0);
  });

  it("resetMethodStubs", () => {
    const obj = Spy.obj<Foo>(fooObj);
    obj.bar.setStub({ returns: -1 });

    expect(obj.bar(3, 4)).toEqual(-1);
    obj[Spy.META].resetMethodStubs();
    expect(obj.bar(3, 4)).toEqual(7);
  });

  it("does not interfere with this", () => {
    const input = {
      x(value: number) {
        return -this.y(value + 1);
      },
      y(value: number) {
        return value * value;
      },
    };

    const obj = Spy.obj(input);
    expect(obj[Spy.META].nrCalls).toBe(0);
    expect(obj.x(4)).toBe(-25);
    expect(obj[Spy.META].nrCalls).toBe(2);
    expect(obj[Spy.META].callSequence).toEqual([["x", 4], ["y", 5]]);
    expect(obj.x.calls).toEqual([[4]]);
    expect(obj.y.calls).toEqual([[5]]);
  });

  it("can override internal 'this' call", () => {
    const input = {
      x(value: number) {
        return -this.y(value + 1);
      },
      y(value: number) {
        return value * value;
      },
    };

    const obj = Spy.obj(input, {
      y() {
        return 2;
      },
    });

    expect(obj[Spy.META].nrCalls).toBe(0);
    expect(obj.x(4)).toBe(-2);
    expect(obj[Spy.META].nrCalls).toBe(2);
    expect(obj[Spy.META].callSequence).toEqual([["x", 4], ["y", 5]]);
  });
});

describe("Spy.cls", () => {
  interface Foo {
    bar(x: number, y: number): number;
  }

  class FooImpl implements Foo {
    constructor(readonly value: number) {}

    bar(x: number, y: number) {
      return this.value + x + y;
    }
  }

  it("initial values", () => {
    const SpyFoo = Spy.cls<Foo>();
    expect(SpyFoo.nrInstances).toEqual(0);
    expect(SpyFoo.instances).toEqual([]);
  });

  it("can instantiate class without examples", () => {
    const SpyFoo = Spy.cls<Foo>();
    const instance = new SpyFoo();

    expect(SpyFoo.nrInstances).toEqual(1);
    expect(instance[Spy.META].nrCalls).toEqual(0);
    expect(instance.bar(5, 6)).toEqual(undefined);
    expect(instance[Spy.META].nrCalls).toEqual(1);
    expect(instance[Spy.META].constructorArgs).toEqual([]);
  });

  it("uses given class, including constructor", () => {
    const SpyFoo = Spy.cls(FooImpl);
    expect(SpyFoo.nrInstances).toEqual(0);

    const instance = new SpyFoo(5);

    expect(SpyFoo.nrInstances).toEqual(1);

    expect(instance[Spy.META].constructorArgs).toEqual([5]);
    expect(instance[Spy.META].nrCalls).toEqual(0);
    expect(instance.bar(5, 6)).toEqual(16);
    expect(instance[Spy.META].nrCalls).toEqual(1);
    expect(instance[Spy.META].callSequence).toEqual([["bar", 5, 6]]);
  });

  it("uses stubs without given class", () => {
    const SpyFoo = Spy.cls<Foo>(undefined, {
      bar(x) {
        return -x;
      },
    });

    expect(SpyFoo.nrInstances).toEqual(0);

    const instance = new SpyFoo();

    expect(SpyFoo.nrInstances).toEqual(1);

    expect(instance[Spy.META].constructorArgs).toEqual([]);
    expect(instance[Spy.META].nrCalls).toEqual(0);
    expect(instance.bar(5, 6)).toEqual(-5);
    expect(instance[Spy.META].nrCalls).toEqual(1);
    expect(instance[Spy.META].callSequence).toEqual([["bar", 5, 6]]);
  });

  it("uses stubs with given class", () => {
    const SpyFoo = Spy.cls(FooImpl, {
      bar(x) {
        return -x;
      },
    });

    expect(SpyFoo.nrInstances).toEqual(0);

    const instance = new SpyFoo(5);

    expect(instance[Spy.META].constructorArgs).toEqual([5]);
    expect(SpyFoo.nrInstances).toEqual(1);

    expect(instance[Spy.META].nrCalls).toEqual(0);
    expect(instance.bar(5, 6)).toEqual(-5);
    expect(instance[Spy.META].nrCalls).toEqual(1);
    expect(instance[Spy.META].callSequence).toEqual([["bar", 5, 6]]);
  });

  it("clearInstances", () => {
    const SpyFoo = Spy.cls<Foo>();
    new SpyFoo();
    new SpyFoo();
    expect(SpyFoo.nrInstances).toEqual(2);
    SpyFoo.clearInstances();
    expect(SpyFoo.nrInstances).toEqual(0);
  });

  it("reset without given class", () => {
    const SpyFoo = Spy.cls<Foo>();

    const instance = new SpyFoo();

    instance.bar.setStub({ returns: -1 });
    expect(instance.bar(5, 6)).toEqual(-1);
    SpyFoo.resetInstanceStubs();
    expect(instance.bar(5, 6)).toEqual(undefined);
  });

  it("reset with given class", () => {
    const SpyFoo = Spy.cls(FooImpl);

    const instance = new SpyFoo(5);

    instance.bar.setStub({ returns: -1 });
    expect(instance.bar(5, 6)).toEqual(-1);
    SpyFoo.resetInstanceStubs();
    expect(instance.bar(5, 6)).toEqual(16);
  });

  it("stub constructor", () => {
    const SpyFoo = Spy.cls<Foo>(
      undefined,
      undefined,
      () => new FooImpl(5),
    );

    const instance = new SpyFoo();
    expect(instance.bar(5, 6)).toEqual(16);
    expect(instance[Spy.META].constructorArgs).toEqual([]);
  });

  it("stub constructor with given class", () => {
    const SpyFoo = Spy.cls(
      FooImpl,
      undefined,
      () => new FooImpl(5),
    );

    const instance = new SpyFoo(-3);
    expect(instance[Spy.META].constructorArgs).toEqual([-3]);
    expect(instance.bar(5, 6)).toEqual(16);
  });

  it("setConstructurStub", () => {
    const SpyFoo = Spy.cls(
      FooImpl,
    );

    SpyFoo.setConstructorStub(() => new FooImpl(5));
    const instance = new SpyFoo(-3);

    expect(instance[Spy.META].constructorArgs).toEqual([-3]);
    expect(instance.bar(5, 6)).toEqual(16);
    expect(instance[Spy.META].constructorArgs).toEqual([-3]);
  });

  it("resetConstructorStub", () => {
    const SpyFoo = Spy.cls(FooImpl);

    SpyFoo.setConstructorStub(() => new FooImpl(5));
    SpyFoo.resetConstructorStub();
    const instance = new SpyFoo(-3);

    expect(instance[Spy.META].constructorArgs).toEqual([-3]);
    expect(instance.bar(5, 6)).toEqual(8);
    expect(instance[Spy.META].constructorArgs).toEqual([-3]);
  });

  it("resetAllStubs", () => {
    const SpyFoo = Spy.cls(FooImpl);
    SpyFoo.setConstructorStub(() => new FooImpl(5));
    const instance = new SpyFoo(-3);
    instance.bar.setStub({ returns: -1 });
    expect(instance.bar(5, 6)).toBe(-1);

    SpyFoo.resetAllStubs();

    const instance2 = new SpyFoo(-3);
    expect(instance2.bar(5, 6)).toBe(8);
  });

  it("results in objects that are instances of the given class", () => {
    const SpyFoo = Spy.cls(
      FooImpl,
    );

    const instance = new SpyFoo(5);
    expect(instance).toBeInstanceOf(FooImpl);
  });

  it("instances", () => {
    const SpyFoo = Spy.cls(
      FooImpl,
    );

    const instance1 = new SpyFoo(5);
    const instance2 = new SpyFoo(6);

    expect(SpyFoo.instances[0]).toBe(instance1);
    expect(SpyFoo.instances[1]).toBe(instance2);
    expect(SpyFoo.instances[0][Spy.META].nrCalls).toBe(0);
    expect(SpyFoo.instances[0][Spy.META].constructorArgs).toEqual([5]);
  });

  it("constructorCalls", () => {
    const SpyFoo = Spy.cls(
      FooImpl,
    );

    new SpyFoo(5);
    new SpyFoo(6);

    expect(SpyFoo.constructorCalls).toEqual([[5], [6]]);
  });
});
