import { defer } from '../src/custom/index.mjs';
import { Channel, RemoteChannel } from '../src/main/index.mjs';
import { expectNotResolves } from './test-utils.mjs';

const MSG = 'MESSAGE!';

const CHANNEL_OPTIONS_READ = {
  channelId: 'TEST_CHANNEL',
};

const CHANNEL_OPTIONS_WRITE = {
  channelId: 'TEST_CHANNEL',
};

async function createInitializedChannels<T = void>(
  writeOptions: {
    capacity?: number;
    channelId?: string;
    validator?: (value: any) => boolean;
  } = {},
  readOptions = writeOptions
) {
  const writeChPromise = RemoteChannel.createWrite<T>(self, {
    ...CHANNEL_OPTIONS_WRITE,
    ...writeOptions,
  });
  const readChPromise = RemoteChannel.createRead<T>(self, {
    ...CHANNEL_OPTIONS_READ,
    ...readOptions,
  });

  return [await writeChPromise, await readChPromise] as const;
}

describe('RemoteChannel basic', () => {
  it('basic API works', async () => {
    const [chWrite, chRead] = await createInitializedChannels();
    expect(chWrite.writable()).toBe(chWrite);
    expect(chRead.readable()).toBe(chRead);
  });
});

describe('RemoteChannel buffer 0', () => {
  it('handshake succeeds', async () => {
    for (let i = 0; i < 10; i++) {
      const [chWrite] = await createInitializedChannels();

      chWrite.close();
    }
  });

  it('starts with initial values', async () => {
    const [chWrite, chRead] = await createInitializedChannels();

    try {
      expect(chRead.capacity).toBe(0);
      expect(chRead.length).toBe(0);
      expect(chRead.isExhausted).toBe(false);

      expect(chWrite.isClosed).toBe(false);
    } finally {
      chWrite.close();
    }
  });

  it('close works', async () => {
    const [chWrite, chRead] = await createInitializedChannels();

    chWrite.close();
    expect(chRead.capacity).toBe(0);
    expect(chRead.length).toBe(0);
    await defer();
    expect(chRead.isExhausted).toBe(true);

    expect(chWrite.isClosed).toBe(true);
  });

  it('cannot send after close', async () => {
    const [chWrite] = await createInitializedChannels();

    chWrite.close();
    await expect(chWrite.send()).rejects.toThrow(
      Channel.Error.ChannelClosedError
    );
  });

  it('cannot close after close', async () => {
    const [chWrite] = await createInitializedChannels();

    chWrite.close();
    expect(() => chWrite.close()).toThrow(Channel.Error.ChannelClosedError);
  });

  it('does not send invalid messages', async () => {
    const [chWrite, chRead] = await createInitializedChannels<any>(
      {
        validator: (value) => typeof value === 'number',
      },
      {}
    );

    await expect(chWrite.send('A')).rejects.toThrow(
      Channel.Error.InvalidMessageTypeError
    );

    const sendPromise = chWrite.send(5);
    await expect(chRead.receive()).resolves.toBe(5);
    await sendPromise;
  });

  it('does not send invalid messages when receiver does not accept', async () => {
    const [chWrite] = await createInitializedChannels<any>(
      {},
      {
        validator: (value) => typeof value === 'number',
      }
    );

    await expect(chWrite.send('A')).rejects.toThrow(
      Channel.Error.InvalidMessageTypeError
    );

    // const sendPromise = chWrite.send(5);
    // await expect(chRead.receive()).resolves.toBe(5);
    // await sendPromise;
  });

  it('can send and then receive', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    try {
      const sendPromise = chWrite.send(MSG);
      expect(chRead.length).toBe(0);
      await expectNotResolves(sendPromise);
      await expect(chRead.receive()).resolves.toBe(MSG);
      await sendPromise;
    } finally {
      chWrite.close();
    }
  });

  it('send throws closed error when closed while sending', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    const sendPromise = chWrite.send(MSG);
    expect(chRead.length).toBe(0);
    await expectNotResolves(sendPromise);
    chWrite.close();
    await expect(sendPromise).rejects.toThrow(Channel.Error.ChannelClosedError);
  });

  it('send returns closed error when closed while sending and catchChannelErrors', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    const sendPromise = chWrite.send(MSG, { catchChannelErrors: true });
    expect(chRead.length).toBe(0);
    chWrite.close();
    await expect(sendPromise).resolves.toBeInstanceOf(
      Channel.Error.ChannelClosedError
    );
  });

  it('can receive and then send', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    try {
      const receivePromise = chRead.receive();
      expect(chRead.length).toBe(0);
      await expectNotResolves(receivePromise);
      await chWrite.send(MSG);
      expect(chRead.length).toBe(0);
      await expect(receivePromise).resolves.toBe(MSG);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('send with timeout waits then throws', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      await expect(chWrite.send(MSG, { timeoutMs: 10 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
    } finally {
      chWrite.close();
    }
  });

  it('send with catchChannelErrors returns channel error', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      await expect(
        chWrite.send(MSG, {
          timeoutMs: 100,
          catchChannelErrors: true,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
    } finally {
      chWrite.close();
    }
  });

  it('send with catchChannelErrors and timeout returns channel error after timeout', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      await expect(
        chWrite.send(MSG, {
          catchChannelErrors: true,
          timeoutMs: 100,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
    } finally {
      chWrite.close();
    }
  });

  it('send with aborted signal throws', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      const controller = new AbortController();
      controller.abort();
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
        })
      ).rejects.toThrow(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with signal that is aborted after some time throws', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
        })
      ).rejects.toThrow(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with aborted signal and catchChannelErrors returns channel error', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      const controller = new AbortController();
      controller.abort();
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
          catchChannelErrors: true,
        })
      ).resolves.toBeInstanceOf(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with signal that is aborted after some time and catchChannelErrors returns channel error', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
          catchChannelErrors: true,
        })
      ).resolves.toBeInstanceOf(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with timeout waits then throws', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      await expect(chWrite.send(MSG, { timeoutMs: 100 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
    } finally {
      chWrite.close();
    }
  });

  it('receive with recover returns channel error', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    try {
      await expect(
        chRead.receive({
          timeoutMs: 100,
          recover: (err) => err,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('receive with catchChannelErrors and timeout returns channel error after timeout', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    try {
      await expect(
        chRead.receive({
          recover: (err) => err,
          timeoutMs: 100,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('cannot send multiple times without await', async () => {
    const [chWrite] = await createInitializedChannels<string>();

    try {
      const sendPromise = chWrite.send('A', {
        timeoutMs: 10,
        catchChannelErrors: true,
      });
      await expect(chWrite.send('B')).rejects.toThrow();
      await sendPromise;
    } finally {
      chWrite.close();
    }
  });

  it('cannot receive multiple times without await', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>();

    try {
      const receivePromise = chRead.receive();
      await expect(chRead.receive()).rejects.toThrow();
      chWrite.send(MSG);
      await expect(receivePromise).resolves.toBe(MSG);
    } finally {
      chWrite.close();
    }
  });

  it('handshake write channel fails when no counterpart', async () => {
    await expect(
      RemoteChannel.createWrite(self, {
        ...CHANNEL_OPTIONS_WRITE,
        maxHandshakeAttempts: 5,
        handshakeAttemptTimeoutMs: 100,
      })
    ).rejects.toThrow();
  });

  it('handshake read channel fails when no counterpart', async () => {
    await expect(
      RemoteChannel.createRead(self, {
        ...CHANNEL_OPTIONS_READ,
        maxHandshakeAttempts: 5,
        handshakeAttemptTimeoutMs: 100,
      })
    ).rejects.toThrow();
  });

  it('can perform sendAll', async () => {
    const [chWrite, chRead] = await createInitializedChannels<number>();

    const sendPromise = chWrite.sendAll([3, 2, 1]);

    await expect(chRead.receive()).resolves.toBe(3);
    await expect(chRead.receive()).resolves.toBe(2);
    await expect(chRead.receive()).resolves.toBe(1);

    await sendPromise;
  });
});

describe('RemoteChannel buffer 1', () => {
  it('starts with initial values', async () => {
    const [chWrite, chRead] = await createInitializedChannels({ capacity: 1 });

    try {
      expect(chWrite.isClosed).toBe(false);

      expect(chRead.capacity).toBe(1);
      expect(chRead.length).toBe(0);
      expect(chRead.isExhausted).toBe(false);
    } finally {
      chWrite.close();
    }
  });

  it('can send and then receive', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      await chWrite.send(MSG);
      expect(chRead.length).toBe(1);
      await expect(chRead.receive()).resolves.toBe(MSG);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('send throws closed error when closed while sending', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    const sendPromise = chWrite.send(MSG);
    expect(chRead.length).toBe(0);
    chWrite.close();
    await expect(sendPromise).rejects.toThrow(Channel.Error.ChannelClosedError);
  });

  it('send returns closed error when closed while sending and catchChannelErrors', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    const sendPromise = chWrite.send(MSG, { catchChannelErrors: true });
    expect(chRead.length).toBe(0);
    chWrite.close();
    await expect(sendPromise).resolves.toBeInstanceOf(
      Channel.Error.ChannelClosedError
    );
  });

  it('can receive and then send', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      const receivePromise = chRead.receive();
      expect(chRead.length).toBe(0);
      await expectNotResolves(receivePromise);
      await chWrite.send(MSG);
      expect(chRead.length).toBe(0);
      await expect(receivePromise).resolves.toBe(MSG);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('send with timeout waits then throws', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      await chWrite.send('A');
      await expect(chWrite.send(MSG, { timeoutMs: 10 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
    } finally {
      chWrite.close();
    }
  });

  it('send with catchChannelErrors returns channel error', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      await chWrite.send('A');
      await expect(
        chWrite.send(MSG, {
          timeoutMs: 100,
          catchChannelErrors: true,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
    } finally {
      chWrite.close();
    }
  });

  it('send with catchChannelErrors and timeout returns channel error after timeout', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      await chWrite.send('A');
      await expect(
        chWrite.send(MSG, {
          catchChannelErrors: true,
          timeoutMs: 100,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
    } finally {
      chWrite.close();
    }
  });

  it('send with aborted signal throws', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      const controller = new AbortController();
      controller.abort();
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
        })
      ).rejects.toThrow(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with signal that is aborted after some time throws', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      await chWrite.send('A');

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
        })
      ).rejects.toThrow(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with aborted signal and catchChannelErrors returns channel error', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      const controller = new AbortController();
      controller.abort();
      await expect(
        chWrite.send(MSG, {
          signal: controller.signal,
          catchChannelErrors: true,
        })
      ).resolves.toBeInstanceOf(Channel.Error.OperationAbortedError);
    } finally {
      chWrite.close();
    }
  });

  it('send with timeout waits then throws', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      await chWrite.send('A');

      await expect(chWrite.send(MSG, { timeoutMs: 100 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
    } finally {
      chWrite.close();
    }
  });

  it('receive with recover returns channel error', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      await expect(
        chRead.receive({
          timeoutMs: 100,
          recover: (err) => err,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('receive with catchChannelErrors and timeout returns channel error after timeout', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      await expect(
        chRead.receive({
          recover: (err) => err,
          timeoutMs: 100,
        })
      ).resolves.toBeInstanceOf(Channel.Error.TimeoutError);
      expect(chRead.length).toBe(0);
    } finally {
      chWrite.close();
    }
  });

  it('cannot send multiple times without await', async () => {
    const [chWrite] = await createInitializedChannels<string>({ capacity: 1 });

    try {
      const sendPromise = chWrite.send('A', {
        timeoutMs: 10,
        catchChannelErrors: true,
      });
      await expect(chWrite.send('B')).rejects.toThrow();
      await sendPromise;
    } finally {
      chWrite.close();
    }
  });

  it('cannot receive multiple times without await', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      const receivePromise = chRead.receive();
      await expect(chRead.receive()).rejects.toThrow();
      chWrite.send(MSG);
      await expect(receivePromise).resolves.toBe(MSG);
    } finally {
      chWrite.close();
    }
  });

  it('scenario', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 1,
    });

    try {
      await chRead.receive({ timeoutMs: 10, recover: () => 1 });
      await chWrite.send('A');
      await chWrite.send('B', { timeoutMs: 10, catchChannelErrors: true });
      await expect(chRead.receive()).resolves.toBe('A');
    } finally {
      chWrite.close();
    }
  });

  it('can create two channels over the same wire', async () => {
    const [chWrite1, chRead1] = await createInitializedChannels<string>({
      capacity: 1,
    });
    const [chWrite2, chRead2] = await createInitializedChannels<string>({
      channelId: 'CHANNEL2',
      capacity: 1,
    });

    await chWrite1.send('A');
    await chWrite2.send('B');
    await expect(chRead2.receive()).resolves.toBe('B');
    await expect(chRead1.receive()).resolves.toBe('A');
    chWrite1.close();
    await defer();
    expect(chRead1.isExhausted).toBe(true);
    expect(chWrite2.isClosed).toBe(false);
    expect(chRead2.isExhausted).toBe(false);
    chWrite2.close();
    await defer();
    expect(chWrite2.isClosed).toBe(true);
  });
});

describe('RemoteChannel capacity 3', () => {
  it('can buffer values', async () => {
    const [chWrite, chRead] = await createInitializedChannels<string>({
      capacity: 3,
    });

    try {
      await chWrite.send('A');
      await chWrite.send('B');
      await chWrite.send('C');
      await expect(chWrite.send('Q', { timeoutMs: 10 })).rejects.toThrow();
      await expect(chRead.receive()).resolves.toBe('A');
      await expect(chRead.receive()).resolves.toBe('B');
      await expect(chRead.receive()).resolves.toBe('C');
      await expect(chRead.receive({ timeoutMs: 10 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
      await chWrite.send('E');
      await chWrite.send('F');
      await expect(chRead.receive()).resolves.toBe('E');
      await expect(chRead.receive()).resolves.toBe('F');
      await expect(chRead.receive({ timeoutMs: 10 })).rejects.toThrow(
        Channel.Error.TimeoutError
      );
    } finally {
      chWrite.close();
    }
  });
});

describe('createCross', () => {
  it('can send and receive with two cross channels', async () => {
    const channelIdString = 'TEST_CHANNEL_STRING';
    const channelIdNumber = 'TEST_CHANNEL_NUMBER';

    const [endPoint1, endPoint2] = await Promise.all([
      RemoteChannel.createCross<string, number>(self, {
        write: {
          channelId: channelIdString,
        },
        read: {
          channelId: channelIdNumber,
          capacity: 1,
        },
      }),
      RemoteChannel.createCross<number, string>(self, {
        write: {
          channelId: channelIdNumber,
          maxHandshakeAttempts: 100,

          handshakeAttemptTimeoutMs: 500,
        },
        read: {
          channelId: channelIdString,
          capacity: 1,
          maxHandshakeAttempts: 100,
          handshakeAttemptTimeoutMs: 500,
        },
      }),
    ]);

    await endPoint1.send('A');
    await expect(endPoint2.receive()).resolves.toBe('A');
    await endPoint2.send(5);
    await expect(endPoint1.receive()).resolves.toBe(5);
  });
});
