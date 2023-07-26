import {
  RemoteChannelClientImpl,
  type Channel,
  type CrossChannel,
  type RemoteChannel,
} from '../index.ts';

/**
 * A RemoteChannelClient allows creating channels to communicate with a RemoteChannelServer. The server should be
 * configured to listen to channels with the channel ids provided to the channel creation functions in the client.
 */
export interface RemoteChannelClient {
  createRead<T>(
    config: RemoteChannelClient.ReadChannelConfig
  ): Promise<Channel.Read<T>>;
  createWrite<T>(
    config: RemoteChannelClient.WriteChannelConfig
  ): Promise<Channel.Write<T>>;
  createCross<TWrite = void, TRead = TWrite>(
    config: RemoteChannelClient.CrossChannelConfig
  ): Promise<CrossChannel<TWrite, TRead>>;
}

export namespace RemoteChannelClient {
  export interface Config {
    port: RemoteChannel.SimpleMessagePort;
    rcsChannelId?: string;
  }

  export interface ReadChannelConfig extends RemoteChannel.ReadConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  export interface WriteChannelConfig extends RemoteChannel.WriteConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  export interface CrossChannelConfig extends RemoteChannel.CrossConfig {
    /**
     * The amount of ms to wait when blocked sending to the RCS channel.
     */
    rcsChannelTimeoutMs?: number;
  }

  export interface Constructors {
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
