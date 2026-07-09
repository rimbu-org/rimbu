import { describe, expect, it } from 'bun:test';

import { RemoteChannelClient } from '@rimbu/channel/remote-channel-client';
import { RemoteChannelServer } from '@rimbu/channel/remote-channel-server';
import { expectNotResolves } from './test-utils';

async function createClientServer() {
	const clientPromise = RemoteChannelClient.create({
		port: self,
	});
	const serverPromise = RemoteChannelServer.create({
		port: self,
	});

	return [await clientPromise, await serverPromise] as const;
}

describe('RemoteChannelServer', () => {
	it('creates read channels', async () => {
		const [client, server] = await createClientServer();

		const readCh = await client.createRead({ channelId: 'TEST' });
		const writeCh = await server.newWriterCh.receive();

		const sendPromise = writeCh.send('MSG');
		expectNotResolves(sendPromise);
		expect(readCh.receive()).resolves.toBe('MSG');
		await sendPromise;
	});

	it('creates write channels', async () => {
		const [client, server] = await createClientServer();

		const writeCh = await client.createWrite({ channelId: 'TEST' });
		const readCh = await server.newReaderCh.receive();

		const sendPromise = writeCh.send('MSG');
		expectNotResolves(sendPromise);
		expect(readCh.receive()).resolves.toBe('MSG');
		await sendPromise;
	});

	it('creates cross channels', async () => {
		const [client, server] = await createClientServer();

		const clientCh = await client.createCross<string, number>({
			read: { channelId: 'CROSS_READ' },
			write: { channelId: 'CROSS_WRITE' },
		});
		const serverCh = await server.newCrossCh.receive();

		const clientSendPromise = clientCh.send('MSG');
		expectNotResolves(clientSendPromise);
		expect(serverCh.receive()).resolves.toBe('MSG');
		await clientSendPromise;

		const serverSendPromise = serverCh.send(5);
		expectNotResolves(serverSendPromise);
		expect(clientCh.receive()).resolves.toBe(5);
		await serverSendPromise;
	});
});
