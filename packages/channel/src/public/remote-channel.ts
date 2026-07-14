import type { Channel } from '@rimbu/channel';

import { CrossChannel } from '@rimbu/channel/cross-channel';
import { Module } from '@rimbu/common/module';

import {
	RemoteChannelRead,
	RemoteChannelWrite,
} from '#channel/remote-channel-impl';

/**
 * A RemoteChannel is a channel that communicates through a message port of the `RemoteChannel.SimpleMessagePort` type. This
 * makes it usable for cross-environment channel communication, e.g. cross threads or even cross network. Like `CrossChannel`,
 * `RemoteChannel` does not receive its own sent messages, but requires another end to communicate.
 */
export namespace RemoteChannel {
	/**
	 * Interface used to perform low-level message communication between processes.
	 * Compatible with browser, Node, and Worker contexts.
	 */
	export interface SimpleMessagePort {
		/**
		 * Sends a message to the message port.
		 * @param message - the message to send
		 */
		postMessage(message: any): void;
		/**
		 * Adds a message listener to the message port.
		 * @param type - only 'message' is supported.
		 * @param listener - a callback function receiving the message data
		 * @param options - (optional) callback options
		 */
		addEventListener(
			type: 'message',
			listener: (ev: { data: any }) => any,
			options?: boolean | { once?: boolean },
		): void;
		/**
		 * Removes a message listener from the message port.
		 * @param type - only 'message' is supported.
		 * @param listener - a callback function receiving the message data
		 */
		removeEventListener(
			type: 'message',
			listener: (ev: { data: any }) => any,
		): void;
	}

	/**
	 * Interface defining the write configuration for a RemoteChannel.
	 */
	export interface WriteConfig {
		/**
		 * An ID used for the client and server to connect the correct channels to each other.
		 */
		channelId: string;
		/**
		 * The maximum amount of messages the Channel can buffer. If 0 (or `Channel.UNBUFFERED`), the channel is
		 * unbuffered and the communication is synchronous.
		 */
		capacity?: number;
		/**
		 * A validation function applied to each message before sending. Since remote channel values are
		 * deserialized from `postMessage`, runtime validation is recommended.
		 * @param value - the value to validate
		 */
		validator?: (value: unknown) => boolean;
		/**
		 * Total time budget (in milliseconds) to complete the handshake with the remote read side.
		 * If the handshake does not complete within this time, a `ChannelError.HandshakeError` is thrown.
		 * @default 10000
		 */
		handshakeTimeoutMs?: number;
	}

	/**
	 * Interface defining the read configuration for a RemoteChannel.
	 */
	export interface ReadConfig {
		/**
		 * An ID used for the client and server to connect the correct channels to each other.
		 */
		channelId: string;
		/**
		 * A validation function applied to each received message. Since remote channel values are
		 * deserialized from `postMessage`, runtime validation is recommended.
		 * @param value - the value to validate
		 */
		validator?: (value: unknown) => boolean;
		/**
		 * Total time budget (in milliseconds) to complete the handshake with the remote write side.
		 * If the handshake does not complete within this time, a `ChannelError.HandshakeError` is thrown.
		 * @default 10000
		 */
		handshakeTimeoutMs?: number;
	}

	/**
	 * Interface defining the cross-channel configuration for a RemoteChannel.
	 */
	export interface CrossConfig {
		/**
		 * The channel write configuration.
		 */
		write: {
			/**
			 * An ID used for the client and server to connect the correct channels to each other.
			 */
			channelId: string;
			/**
			 * The maximum amount of messages the Channel can buffer.
			 */
			capacity?: number;
			/**
			 * A validation function applied to each message before sending.
			 */
			validator?: (value: unknown) => boolean;
			/**
			 * Total time budget (in milliseconds) to complete the handshake.
			 */
			handshakeTimeoutMs?: number;
		};
		/**
		 * The channel read configuration.
		 */
		read: {
			/**
			 * An ID used for the client and server to connect the correct channels to each other.
			 */
			channelId: string;
			/**
			 * The maximum amount of messages the Channel can buffer.
			 */
			capacity?: number;
			/**
			 * A validation function applied to each received message.
			 */
			validator?: (value: unknown) => boolean;
			/**
			 * Total time budget (in milliseconds) to complete the handshake.
			 */
			handshakeTimeoutMs?: number;
		};
	}
}

const remoteChannelModule = Module.create<typeof RemoteChannel>((mod) => ({
	createRead: async (
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.ReadConfig,
	) => {
		const ch = new RemoteChannelRead<any>(port, config);
		await ch.initialized;
		return ch;
	},
	createWrite: async (
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.WriteConfig,
	) => {
		const ch = new RemoteChannelWrite<any>(port, config);
		await ch.initialized;
		return ch;
	},
	createCross: async <TSend = void, TReceive = TSend>(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.CrossConfig,
	) => {
		const { write, read } = config;
		const [writeCh, readCh] = await Promise.all([
			mod.createWrite<TSend>(port, write),
			mod.createRead<TReceive>(port, read),
		]);

		return CrossChannel.combine(writeCh, readCh);
	},
}));

export const RemoteChannel: {
	/**
	 * Resolves to a new read-only RemoteChannel using the given configuration.
	 * @typeparam T - the message type
	 * @param port - the message port to use for communication
	 * @param config - the channel configuration
	 * @returns a `Promise` resolving to a `Channel.Read<T>`
	 */
	createRead<T = void>(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.ReadConfig,
	): Promise<Channel.Read<T>>;

	/**
	 * Resolves to a new write-only RemoteChannel using the given configuration.
	 * @typeparam T - the message type
	 * @param port - the message port to use for communication
	 * @param config - the channel configuration
	 * @returns a `Promise` resolving to a `Channel.Write<T>`
	 */
	createWrite<T = void>(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.WriteConfig,
	): Promise<Channel.Write<T>>;

	/**
	 * Resolves to a new cross-channel RemoteChannel using the given configuration.
	 * @typeparam TSend - the send message type
	 * @typeparam TReceive - the receive message type
	 * @param port - the message port to use for communication
	 * @param config - the channel configuration
	 * @returns a `Promise` resolving to a `CrossChannel<TSend, TReceive>`
	 */
	createCross<TSend = void, TReceive = TSend>(
		port: RemoteChannel.SimpleMessagePort,
		config: RemoteChannel.CrossConfig,
	): Promise<CrossChannel<TSend, TReceive>>;
} = remoteChannelModule.build();
