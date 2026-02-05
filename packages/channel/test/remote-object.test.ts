import { describe, expect, it } from 'bun:test';

import { CrossChannel } from '@rimbu/channel/cross-channel';
import { RemoteObject, RemoteObjectError } from '@rimbu/channel/remote-object';

import { RemoteObjectImpl } from '#channel/remote-object-impl';

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
	it('returns properties and function call results from remote object', () => {
		const [client] = createRemoteChannels(obj);

		expect(client.exec((c) => c.prop)).resolves.toBe(1);
		expect(client.exec((c) => c.func1())).resolves.toBe(2);
		expect(client.exec((c) => c.func2('a', 'b'))).resolves.toEqual({
			q: 'ab',
		});
		expect(client.exec((c) => c.func2('a', 'b').q)).resolves.toBe('ab');
	});

	it('throws when performing wrong calls', () => {
		const [client] = createRemoteChannels(obj);

		expect(client.exec((c: any) => c.a)).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidAccessError,
		);
		expect(client.exec((c: any) => c.prop.q)).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidAccessError,
		);
		expect(client.exec((c: any) => c.prop())).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidFunctionApplicationError,
		);
		expect(client.exec((c: any) => c.func1)).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidFunctionApplicationError,
		);
		expect(client.exec((c: any) => c.func1().z)).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidAccessError,
		);
	});

	it('prevents prototype pollution', () => {
		const [client] = createRemoteChannels(obj);

		expect(client.exec((c: any) => c.__proto__)).rejects.toThrow(
			RemoteObjectError.RemoteObjectSecurityError,
		);
	});
});

describe('RemoteObjectImpl', () => {
	const obj = {
		prop: 1,
		func1: () => 2,
		func2: (arg1: string, arg2: string) => ({ q: 5 }),
	};

	it('gets the correct values from the source object', () => {
		const handler = RemoteObjectImpl(obj);
		expect(handler([])).resolves.toBe(obj);
		expect(handler(['prop'])).resolves.toBe(1);
		expect(handler(['func1', []])).resolves.toBe(2);
		expect(handler(['func2', ['a', 'b']])).resolves.toEqual({ q: 5 });
		expect(handler(['func2', ['a', 'b'], 'q'])).resolves.toBe(5);
	});

	it('errors when path is invalid', () => {
		const handler = RemoteObjectImpl(obj);
		expect(handler(['a'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidAccessError,
		);
		expect(handler([[1, 2]])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidFunctionApplicationError,
		);
		expect(handler(['prop', [1, 2]])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidFunctionApplicationError,
		);
		expect(handler(['func1'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidFunctionApplicationError,
		);
		expect(handler(['func1', [], 'q'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidAccessError,
		);
		expect(handler([Symbol() as any])).rejects.toThrow(
			RemoteObjectError.RemoteObjectInvalidPathPartTypeError,
		);
	});

	it('does not allow prototype access', () => {
		const handler = RemoteObjectImpl(obj);
		expect(handler(['__proto__'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectSecurityError,
		);
		expect(handler(['prop', '__proto__'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectSecurityError,
		);
		expect(handler(['func1', '__proto__'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectSecurityError,
		);
		expect(handler(['func1', [], '__proto__'])).rejects.toThrow(
			RemoteObjectError.RemoteObjectSecurityError,
		);
	});
});
