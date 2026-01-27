import { describe, expect, it } from 'bun:test';

import { RemoteObjectImpl } from '#channel/remote-object-impl';
import { CrossChannel } from '@rimbu/channel/cross-channel';

import { RemoteObject, RemoteObjectError } from '@rimbu/channel/remote-object';

function createRemoteChannels(sourceObj: any) {
  const [clientCommCh, serverCommCh] = CrossChannel.createPair<
    RemoteObject.Call,
    RemoteObject.Response
  >();

  return [
    RemoteObject.createClient<typeof obj>(clientCommCh),
    RemoteObject.createServer(sourceObj, serverCommCh),
  ] as const;
}

const obj = {
  prop: 1,
  func1: () => 2,
  func2: async (arg1: string, arg2: string) => ({ q: `${arg1}${arg2}` }),
};

describe('RemoteObject client', () => {
  it('returns properties and function call results from remote object', async () => {
    const [client] = createRemoteChannels(obj);

    await expect(client.exec((c) => c.prop)).resolves.toBe(1);
    await expect(client.exec((c) => c.func1())).resolves.toBe(2);
    await expect(client.exec((c) => c.func2('a', 'b'))).resolves.toEqual({
      q: 'ab',
    });
    await expect(client.exec((c) => c.func2('a', 'b').q)).resolves.toBe('ab');
  });

  it('throws when performing wrong calls', async () => {
    const [client] = createRemoteChannels(obj);

    await expect(client.exec((c: any) => c.a)).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidAccessError
    );
    await expect(client.exec((c: any) => c.prop.q)).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidAccessError
    );
    await expect(client.exec((c: any) => c.prop())).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidFunctionApplicationError
    );
    await expect(client.exec((c: any) => c.func1)).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidFunctionApplicationError
    );
    await expect(client.exec((c: any) => c.func1().z)).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidAccessError
    );
  });

  it('prevents prototype pollution', async () => {
    const [client] = createRemoteChannels(obj);

    await expect(client.exec((c: any) => c.__proto__)).rejects.toThrow(
      RemoteObjectError.RemoteObjectSecurityError
    );
  });
});

describe('RemoteObjectImpl', () => {
  const obj = {
    prop: 1,
    func1: () => 2,
    func2: (arg1: string, arg2: string) => ({ q: 5 }),
  };

  it('gets the correct values from the source object', async () => {
    const handler = RemoteObjectImpl(obj);
    expect(await handler([])).toBe(obj);
    expect(await handler(['prop'])).toBe(1);
    expect(await handler(['func1', []])).toBe(2);
    expect(await handler(['func2', ['a', 'b']])).toEqual({ q: 5 });
    expect(await handler(['func2', ['a', 'b'], 'q'])).toBe(5);
  });

  it('errors when path is invalid', async () => {
    const handler = RemoteObjectImpl(obj);
    await expect(handler(['a'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidAccessError
    );
    await expect(handler([[1, 2]])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidFunctionApplicationError
    );
    await expect(handler(['prop', [1, 2]])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidFunctionApplicationError
    );
    await expect(handler(['func1'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidFunctionApplicationError
    );
    await expect(handler(['func1', [], 'q'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidAccessError
    );
    await expect(handler([Symbol() as any])).rejects.toThrow(
      RemoteObjectError.RemoteObjectInvalidPathPartTypeError
    );
  });

  it('does not allow prototype access', async () => {
    const handler = RemoteObjectImpl(obj);
    await expect(handler(['__proto__'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectSecurityError
    );
    await expect(handler(['prop', '__proto__'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectSecurityError
    );
    await expect(handler(['func1', '__proto__'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectSecurityError
    );
    await expect(handler(['func1', [], '__proto__'])).rejects.toThrow(
      RemoteObjectError.RemoteObjectSecurityError
    );
  });
});
