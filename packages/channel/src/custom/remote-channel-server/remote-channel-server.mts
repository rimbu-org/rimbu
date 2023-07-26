import {
  RemoteChannelServerImpl,
  type Channel,
  type CrossChannel,
  type RemoteChannel,
} from '../index.mjs';

export interface RemoteChannelServer {
  readonly writeChannelCh: Channel<Channel.Write<unknown>>;
  readonly readChannelCh: Channel<Channel.Read<unknown>>;
  readonly crossChannelCh: Channel<CrossChannel<unknown, unknown>>;
}

export namespace RemoteChannelServer {
  export interface Constructors {
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
