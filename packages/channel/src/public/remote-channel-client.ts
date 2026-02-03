import type { Channel } from '@rimbu/channel';
import type { CrossChannel } from '@rimbu/channel/cross-channel';
import type { RemoteChannel } from '@rimbu/channel/remote-channel';

import { RemoteChannelClientImpl } from '#channel/remote-channel-client-impl';

/**
 * A RemoteChannelClient allows creating channels to communicate with a RemoteChannelServer. The server should be
 * configured to listen to channels with the channel ids provided to the channel creation functions in the client.
 */
export interface RemoteChannelClient {
  /**
   * Resolves, if successful, to a new remote read channel.
   * @typeparam T - the channel message type
   * @param config - the remote channel configuration
   */
  createRead<T>(
    config: RemoteChannelClient.ReadChannelConfig
  ): Promise<Channel.Read<T>>;
  /**
   * Resolves, if successful, to a new remote write channel.
   * @typeparam T - the channel message type
   * @param config - the remote channel configuration
   */
  createWrite<T>(
    config: RemoteChannelClient.WriteChannelConfig
  ): Promise<Channel.Write<T>>;
  /**
   * Resolves, if successful, to a new remote cross channel.
   * @typeparam TSend - the send message type
   * @typeparam TReceive - the receive message type
   * @param config - the remote channel configuration
   */
  createCross<TSend = void, TReceive = TSend>(
    config: RemoteChannelClient.CrossChannelConfig
  ): Promise<CrossChannel<TSend, TReceive>>;
}

export namespace RemoteChannelClient {
  /**
   * Interface defining the configuration options for a RemoteChannelClient
   */
  export interface Config {
    /**
     * The message port to use for communication with a server.
     */
    port: RemoteChannel.SimpleMessagePort;
    /**
     * (Optional) an alternative id for the remote channel server
     */
    rcsChannelId?: string;
  }

  /**
   * Interface defining the configuration options for creating a remote Channel.Read channel
   */
  export interface ReadChannelConfig extends RemoteChannel.ReadConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  /**
   * Interface defining the configuration options for creating a remote Channel.Write channel
   */
  export interface WriteChannelConfig extends RemoteChannel.WriteConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  /**
   * Interface defining the configuration options for creating a remote Channel.Cross channel
   */
  export interface CrossChannelConfig extends RemoteChannel.CrossConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  /**
   * Defines the static `RemoteChannelClient` API.
   */
  export interface Constructors {
    /**
     * Creates a new RemoteChannelClient instance with the given configuration.
     * @param config - the configuration for the client:<br/>
     */
    create(config: RemoteChannelClient.Config): Promise<RemoteChannelClient>;
  }
}

export const RemoteChannelClient: RemoteChannelClient.Constructors =
  Object.freeze(
    class {
      static async create(
        config: RemoteChannelClient.Config
      ): Promise<RemoteChannelClient> {
        return RemoteChannelClientImpl(config);
      }
    }
  );
