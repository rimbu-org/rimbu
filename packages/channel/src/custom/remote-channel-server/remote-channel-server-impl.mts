import {
  Channel,
  RemoteChannel,
  type CrossChannel,
  type RemoteChannelServer,
} from '../index.mjs';

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

export async function RemoteChannelServerImpl(config: {
  port: RemoteChannel.SimpleMessagePort;
  rcsChannelId?: string;
}): Promise<RemoteChannelServer> {
  const { port, rcsChannelId = 'RCS_CHANNEL' } = config;

  const rcsChannel =
    await RemoteChannel.createRead<RemoteChannelServerImpl.Message>(port, {
      channelId: rcsChannelId,
    });

  const writeChannelCh = Channel.create<Channel.Write<unknown>>();
  const readChannelCh = Channel.create<Channel.Read<unknown>>();
  const crossChannelCh = Channel.create<CrossChannel<unknown>>();

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
          await writeChannelCh.send(ch);
          break;
        }
        case 'read': {
          const ch = await RemoteChannel.createRead<unknown>(port, {
            channelId: openMessage.channelId,
          });
          await readChannelCh.send(ch);
          break;
        }
        case 'cross': {
          const crossCh = await RemoteChannel.createCross<unknown>(port, {
            read: openMessage.read,
            write: openMessage.write,
          });
          await crossChannelCh.send(crossCh);
          break;
        }
      }
    }
  };

  handler();

  return {
    writeChannelCh,
    readChannelCh,
    crossChannelCh,
  };
}
