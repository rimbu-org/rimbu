import {
  type Channel,
  CrossChannel,
  RemoteChannelRead,
  RemoteChannelWrite,
} from '../index.mjs';

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
      options?: boolean | { once?: boolean }
    ): void;
    /**
     * Removes a message listener from the message port.
     * @param type - only 'message' is supported.
     * @param listener - a callback function receiving the message data
     */
    removeEventListener(
      type: 'message',
      listener: (ev: { data: any }) => any
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
     * The maximum amount of messages the Channel can buffer. If 0, the channel is unbuffered and the communication is synchronous.
     */
    capacity?: number;
    /**
     * A function taking a message and returning true if the message is of a valid type, false otherwise
     * @param value - the value to validate
     */
    validator?: (value: any) => boolean;
    /**
     * The amount of handshake attempts to make before failing.
     */
    maxHandshakeAttempts?: number;
    /**
     * The amount of milliseconds to wait for a response to each handshake.
     */
    handshakeAttemptTimeoutMs?: number;
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
     * A function taking a message and returning true if the message is of a valid type, false otherwise
     * @param value - the value to validate
     */
    validator?: (value: any) => boolean;
    /**
     * The amount of handshake attempts to make before failing.
     */
    maxHandshakeAttempts?: number;
    /**
     * The amount of milliseconds to wait for a response to each handshake.
     */
    handshakeAttemptTimeoutMs?: number;
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
       * The maximum amount of messages the Channel can buffer. If 0, the channel is unbuffered and the communication is synchronous.
       */
      capacity?: number;
      /**
       * A function taking a message and returning true if the message is of a valid type, false otherwise
       * @param value - the value to validate
       */
      validator?: (value: any) => boolean;
      /**
       * The amount of handshake attempts to make before failing.
       */
      maxHandshakeAttempts?: number;
      /**
       * The amount of milliseconds to wait for a response to each handshake.
       */
      handshakeAttemptTimeoutMs?: number;
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
       * The maximum amount of messages the Channel can buffer. If 0, the channel is unbuffered and the communication is synchronous.
       */
      capacity?: number;
      /**
       * A function taking a message and returning true if the message is of a valid type, false otherwise
       * @param value - the value to validate
       */
      validator?: (value: any) => boolean;
      /**
       * The amount of handshake attempts to make before failing.
       */
      maxHandshakeAttempts?: number;
      /**
       * The amount of milliseconds to wait for a response to each handshake.
       */
      handshakeAttemptTimeoutMs?: number;
    };
  }

  /**
   * Defines the static `RemoteChannel` API.
   */
  export interface Constructors {
    /**
     * Resolves to a new read-only RemoteChannel using the given configuration.
     * @typeparam T - the message type
     * @param config - the channel configuration
     */
    createRead<T = void>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.ReadConfig
    ): Promise<Channel.Read<T>>;

    /**
     * Resolves to a new write-only RemoteChannel using the given configuration.
     * @typeparam T - the message type
     * @param config - the channel configuration
     */
    createWrite<T = void>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.WriteConfig
    ): Promise<Channel.Write<T>>;

    /**
     * Resolves to a new cross-channel RemoteChannel using the given configuration.
     * @typeparam TSend - the send message type
     * @typeparam TReceive - the receive message type
     * @param config - the channel configuration
     */
    createCross<TSend = void, TReceive = TSend>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.CrossConfig
    ): Promise<CrossChannel<TSend, TReceive>>;
  }
}

export const RemoteChannel: RemoteChannel.Constructors = Object.freeze(
  class {
    static async createRead<T = void>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.ReadConfig
    ): Promise<Channel.Read<T>> {
      const ch = new RemoteChannelRead<T>(port, config);
      await ch.initialized;
      return ch;
    }

    static async createWrite<T = void>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.WriteConfig
    ): Promise<Channel.Write<T>> {
      const ch = new RemoteChannelWrite<T>(port, config);
      await ch.initialized;
      return ch;
    }

    static async createCross<TSend = void, TReceive = TSend>(
      port: RemoteChannel.SimpleMessagePort,
      config: RemoteChannel.CrossConfig
    ): Promise<CrossChannel<TSend, TReceive>> {
      const { write, read } = config;
      const [writeCh, readCh] = await Promise.all([
        RemoteChannel.createWrite<TSend>(port, write),
        RemoteChannel.createRead<TReceive>(port, read),
      ]);

      return CrossChannel.combine(writeCh, readCh);
    }
  }
);
