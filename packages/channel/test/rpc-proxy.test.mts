import { RpcProxy } from '../src/custom/index.mjs';

interface Obj {
  [Symbol.iterator]: () => 1;
  prop: number;
  func1(): number;
  func2(arg1: string, arg2: boolean): { q: number };
}

describe('RpcProxy', () => {
  it('calls onGet with given path', () => {
    const onGet = vi.fn();
    const proxy = RpcProxy.create<Obj>(onGet);
    proxy.exec((c) => c);
    expect(onGet).toBeCalledWith([]);

    onGet.mockReset();
    proxy.exec((c) => c.prop);
    expect(onGet).toBeCalledWith(['prop']);

    onGet.mockReset();
    proxy.exec((c) => c.func1());
    expect(onGet).toBeCalledWith(['func1', []]);

    onGet.mockReset();
    proxy.exec((c) => c.func2('a', true));
    expect(onGet).toBeCalledWith(['func2', ['a', true]]);

    onGet.mockReset();
    proxy.exec((c) => c.func2('a', true).q);
    expect(onGet).toBeCalledWith(['func2', ['a', true], 'q']);
  });

  it('throws when accessing non-string properties', () => {
    const onGet = vi.fn();
    const proxy = RpcProxy.create<Obj>(onGet);

    expect(() => proxy.exec((c) => c[Symbol.iterator])).toThrow(
      RpcProxy.Error.InvalidPathType
    );
  });
});
