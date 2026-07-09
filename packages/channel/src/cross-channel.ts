import { Channel } from '@rimbu/channel';
import { Module } from '@rimbu/common/module';

/**
 * A CrossChannel is a channel of which the send and receive modules are not internally connected. This means
 * that the send and receive message types can also differ. A normal Channel can receive its own message, but a
 * CrossChannel cannot, and so they are usually created in pairs to perform bidirectional communication with some
 * other entity.
 * @typeparam TSend - the send message type
 * @typeparam TReceive - the receive message type
 */
export interface CrossChannel<TSend = void, TReceive = TSend>
	extends Channel.Read<TReceive>,
		Channel.Write<TSend> {}

export namespace CrossChannel {
	/**
	 * A pair of CrossChannels in which the send module of the first is connected to the receive of the second,
	 * and the send module of the second is connected to the receive module of the first.
	 * @typeparam TSend - the send message type
	 * @typeparam TReceive - the receive message type
	 */
	export type Pair<TSend, TReceive> = readonly [
		crossSendCh: CrossChannel<TSend, TReceive>,
		crossReceiveCh: CrossChannel<TReceive, TSend>,
	];

	/**
	 * Configuration options for creating a CrossChannel
	 */
	export interface Config {
		/**
		 * The write channel configuration.
		 */
		write?: Channel.Config;
		/**
		 * The read channel configuration.
		 */
		read?: Channel.Config;
	}
}

const crossChannelModule = Module.create<typeof CrossChannel>((mod) => ({
	createPair: <TSend = void, TReceive = TSend>(
		config: CrossChannel.Config = {},
	): CrossChannel.Pair<TSend, TReceive> => {
		const sendCh = Channel.create<TSend>(config.write);
		const receiveCh = Channel.create<TReceive>(config.read);

		const crossReceiveCh = mod.combine(receiveCh, sendCh);
		const crossSendCh = mod.combine(sendCh, receiveCh);

		return [crossSendCh, crossReceiveCh];
	},
	combine: <TSend = void, TReceive = TSend>(
		writeCh: Channel.Write<TSend>,
		readCh: Channel.Read<TReceive>,
	): CrossChannel<TSend, TReceive> => {
		const result: CrossChannel<TSend, TReceive> = {
			get capacity() {
				return readCh.capacity;
			},
			get length() {
				return readCh.length;
			},
			get isClosed() {
				return writeCh.isClosed;
			},
			get isExhausted() {
				return readCh.isExhausted;
			},
			[Symbol.asyncIterator]() {
				return readCh[Symbol.asyncIterator]();
			},
			asyncStream() {
				return readCh.asyncStream();
			},
			readable() {
				return readCh;
			},
			writable() {
				return writeCh;
			},
			receive<RT>(options?: {
				signal?: AbortSignal | undefined;
				timeoutMs?: number | undefined;
				recover?: ((channelError: Channel.Error) => RT) | undefined;
			}): Promise<any> {
				return readCh.receive(options as any);
			},
			tryReceive() {
				return readCh.tryReceive();
			},
			send<RT>(
				value: TSend,
				options?: {
					signal?: AbortSignal | undefined;
					timeoutMs?: number | undefined;
					recover?: ((channelError: Channel.Error) => RT) | undefined;
				},
			): Promise<any> {
				return writeCh.send(value, options as any);
			},
			sendAll<RT>(
				source: any,
				options?: {
					signal?: AbortSignal | undefined;
					timeoutMs?: number | undefined;
					recover?: ((channelError: Channel.Error) => RT) | undefined;
				},
			): Promise<any> {
				return writeCh.sendAll(source, options as any);
			},
			trySend(value: TSend) {
				return writeCh.trySend(value);
			},
			close() {
				return writeCh.close();
			},
		};

		return result;
	},
}));

export const CrossChannel: {
	/**
	 * Returns a pair of connected CrossChannels of which the send module of the first is connected to the
	 * receive module of the second, and the send module of the second is connected to the receive module
	 * of the first.
	 * @typeparam TSend - the send message type
	 * @typeparam TReceive - the receive message type
	 * @returns a pair of connected CrossChannels `[sendChannel, receiveChannel]`
	 */
	createPair<TSend = void, TReceive = TSend>(
		config?: CrossChannel.Config,
	): CrossChannel.Pair<TSend, TReceive>;

	/**
	 * Returns a CrossChannel where the send module comprises the given `writeCh`, and the receive module
	 * consists of the given `readCh`.
	 * @typeparam TSend - the send message type
	 * @typeparam TReceive - the receive message type
	 * @param writeCh - the write channel to use for sending messages
	 * @param readCh - the read channel to use for receiving messages
	 * @returns a `CrossChannel` whose send module uses `writeCh` and receive module uses `readCh`
	 */
	combine<TSend = void, TReceive = TSend>(
		writeCh: Channel.Write<TSend>,
		readCh: Channel.Read<TReceive>,
	): CrossChannel<TSend, TReceive>;
} = crossChannelModule.build();
