import {
  RemoteChannel,
  type Channel,
  type CrossChannel,
  type RemoteChannelClient,
  type RemoteChannelServerImpl,
} from '../index.mjs';

/**
 * Concrete factory used by `RemoteChannelClient.create` to construct a client over a given message port.
 */
export async function RemoteChannelClientImpl(config: {
  port: RemoteChannel.SimpleMessagePort;
  rcsChannelId?: string;
}): Promise<RemoteChannelClient> {
  const { port, rcsChannelId = 'RCS_CHANNEL' } = config;

  const rcsChannel =
    await RemoteChannel.createWrite<RemoteChannelServerImpl.Message>(port, {
      channelId: rcsChannelId,
    });

  return {
    async createRead<T>(
      config: RemoteChannelClient.ReadChannelConfig
    ): Promise<Channel.Read<T>> {
      const { channelId, rcsChannelTimeoutMs } = config;

      await rcsChannel.send(
        {
          type: 'RCS_OPEN',
          channelType: 'write',
          channelId,
        },
        { timeoutMs: rcsChannelTimeoutMs }
      );

      return RemoteChannel.createRead(port, config);
    },
    async createWrite<T>(
      config: RemoteChannelClient.WriteChannelConfig
    ): Promise<Channel.Write<T>> {
      const { channelId, rcsChannelTimeoutMs } = config;

      await rcsChannel.send(
        {
          type: 'RCS_OPEN',
          channelType: 'read',
          channelId,
        },
        { timeoutMs: rcsChannelTimeoutMs }
      );

      return RemoteChannel.createWrite(port, config);
    },
    async createCross<TSend = void, TReceive = TSend>(
      config: RemoteChannelClient.CrossChannelConfig
    ): Promise<CrossChannel<TSend, TReceive>> {
      const { read, write, rcsChannelTimeoutMs } = config;

      await rcsChannel.send(
        {
          type: 'RCS_OPEN',
          channelType: 'cross',
          read: { channelId: write.channelId },
          write: { channelId: read.channelId },
        },
        { timeoutMs: rcsChannelTimeoutMs }
      );

      return RemoteChannel.createCross(port, config);
    },
  };
}
