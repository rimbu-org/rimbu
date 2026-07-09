import type { CrossChannel } from '@rimbu/channel/cross-channel';
import type { RemoteChannelServer } from '@rimbu/channel/remote-channel-server';

import { Channel } from '@rimbu/channel';
import { RemoteChannel } from '@rimbu/channel/remote-channel';

/**
 * Namespace containing the control messages understood by a `RemoteChannelServer` implementation.
 */
export namespace RemoteChannelServerImpl {
	export interface OpenReadMessage {
		type: 'RCS_OPEN';
		channelType: 'read';
		channelId: string;
	}

	export interface OpenWriteMessage {
		type: 'RCS_OPEN';
		channelType: 'write';
		channelId: string;
	}

	export interface OpenCrossMessage {
		type: 'RCS_OPEN';
		channelType: 'cross';
		read: {
			channelId: string;
		};
		write: {
			channelId: string;
		};
	}

	export type Message = OpenReadMessage | OpenWriteMessage | OpenCrossMessage;
}

/**
 * Concrete factory used by `RemoteChannelServer.create` to construct a server over a given message port.
 */
export async function RemoteChannelServerImpl(config: {
	port: RemoteChannel.SimpleMessagePort;
	rcsChannelId?: string;
}): Promise<RemoteChannelServer> {
	const { port, rcsChannelId = 'RCS_CHANNEL' } = config;

	const rcsChannel =
		await RemoteChannel.createRead<RemoteChannelServerImpl.Message>(port, {
			channelId: rcsChannelId,
		});

	const newWriterCh = Channel.create<Channel.Write<unknown>>();
	const newReaderCh = Channel.create<Channel.Read<unknown>>();
	const newCrossCh = Channel.create<CrossChannel<unknown>>();

	const handler = async (): Promise<void> => {
		while (!rcsChannel.isExhausted) {
			const openMessage = await rcsChannel.receive();

			if (openMessage.type !== 'RCS_OPEN') {
				continue;
			}

			switch (openMessage.channelType) {
				case 'write': {
					const ch = await RemoteChannel.createWrite<unknown>(port, {
						channelId: openMessage.channelId,
					});
					await newWriterCh.send(ch);
					break;
				}
				case 'read': {
					const ch = await RemoteChannel.createRead<unknown>(port, {
						channelId: openMessage.channelId,
					});
					await newReaderCh.send(ch);
					break;
				}
				case 'cross': {
					const crossCh = await RemoteChannel.createCross<unknown>(port, {
						read: openMessage.read,
						write: openMessage.write,
					});
					await newCrossCh.send(crossCh);
					break;
				}
			}
		}
	};

	handler();

	return {
		newWriterCh,
		newReaderCh,
		newCrossCh,
	};
}
