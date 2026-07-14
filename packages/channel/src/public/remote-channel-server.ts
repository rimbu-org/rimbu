import type { Channel } from '@rimbu/channel';
import type { CrossChannel } from '@rimbu/channel/cross-channel';
import type { RemoteChannel } from '@rimbu/channel/remote-channel';

import { Module } from '@rimbu/common/module';

import { RemoteChannelServerImpl } from '#channel/remote-channel-server-impl';

/**
 * A RemoteChannelServer communicates with a RemoteChannel client through the given message port, and allows clients to easily
 * create new channels to communicate with processes in the server context. The server needs to set up handlers to deal with
 * the created channels.
 */
export interface RemoteChannelServer {
	/**
	 * Receive from this channel to get a new `Channel.Write` each time a client requests a write channel.
	 * The received writer can be used to push data to that client.
	 */
	readonly newWriterCh: Channel.Read<Channel.Write<unknown>>;
	/**
	 * Receive from this channel to get a new `Channel.Read` each time a client requests a read channel.
	 * The received reader can be used to pull data sent by that client.
	 */
	readonly newReaderCh: Channel.Read<Channel.Read<unknown>>;
	/**
	 * Receive from this channel to get a new `CrossChannel` each time a client requests a cross channel.
	 * The received cross-channel supports bidirectional communication with that client.
	 */
	readonly newCrossCh: Channel.Read<CrossChannel<unknown, unknown>>;
}

const removeChannelServerModule = Module.create<typeof RemoteChannelServer>(
	() => ({
		create: RemoteChannelServerImpl,
	}),
);

export const RemoteChannelServer: {
	/**
	 * Resolves, if successful, to a new RemoteChannelServer that can listen to client requests to create new
	 * channels.
	 * @param config - the configuration for the RemoteChannelServer to be created:<br/>
	 * - port: the message port to communicate with the client
	 * - rcsChannelId: (optional) an alternative channel id to use for communication with the client
	 * @returns a `Promise` resolving to a `RemoteChannelServer`
	 */
	create(config: {
		port: RemoteChannel.SimpleMessagePort;
		rcsChannelId?: string;
	}): Promise<RemoteChannelServer>;
} = removeChannelServerModule.build();
