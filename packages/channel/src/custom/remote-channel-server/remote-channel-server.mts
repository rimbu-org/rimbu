import {
  RemoteChannelServerImpl,
  type Channel,
  type CrossChannel,
  type RemoteChannel,
} from '../index.mjs';

/**
 * A RemoteChannel server communicates with a RemoteChannel client through the given message port, and allows clients to easily
 * create new channels to communicate with processes in the server context. The server needs to set up handlers to deal with
 * the created channels.
 */
export interface RemoteChannelServer {
  /**
   * Channel that will send new write channels requested by the client.
   */
  readonly writeChannelCh: Channel.Read<Channel.Write<unknown>>;
  /**
   * Channel that will send new read channels requested by the client.
   */
  readonly readChannelCh: Channel.Read<Channel.Read<unknown>>;

  /**
   * Channel that will send new cross channels requested by the client.
   */
  readonly crossChannelCh: Channel.Read<CrossChannel<unknown, unknown>>;
}

export namespace RemoteChannelServer {
  /**
   * Defines the static `RemoteChannelServer` API.
   */
  export interface Constructors {
    /**
     * Resolves, if successful, to a new RemoteChannelServer that can listen to client requests to create new
     * channels.
     * @param config - the configuration for the RemoteChannelServer to be created:<br/>
     * - port: the message port to communicate with the client
     * - rcsChannelId: (optional) an alternative channel id to use for communication with the client
     */
    create(config: {
      port: RemoteChannel.SimpleMessagePort;
      rcsChannelId?: string;
    }): Promise<RemoteChannelServer>;
  }
}

export const RemoteChannelServer: RemoteChannelServer.Constructors =
  Object.freeze(
    class {
      static async create(config: {
        port: RemoteChannel.SimpleMessagePort;
        rcsChannelId?: string;
      }): Promise<RemoteChannelServer> {
        return RemoteChannelServerImpl(config);
      }
    }
  );
