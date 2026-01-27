import { describe, expect, it } from 'bun:test';

import { ChannelError } from '@rimbu/channel';
import { CrossChannel } from '@rimbu/channel/cross-channel';

describe('CrossChannel', () => {
  it('basic API works', () => {
    const [sendCh, receiveCh] = CrossChannel.createPair<number, string>();

    expect(sendCh.capacity).toBe(0);
    expect(sendCh.length).toBe(0);

    expect(sendCh.writable()).toBe(sendCh);
    expect(sendCh.readable()).toBe(sendCh);
    expect(receiveCh.writable()).toBe(receiveCh);
    expect(receiveCh.readable()).toBe(receiveCh);

    expect(sendCh.isClosed).toBe(false);
    expect(receiveCh.isExhausted).toBe(false);
    sendCh.close();
    expect(sendCh.isClosed).toBe(true);
    expect(receiveCh.isExhausted).toBe(true);
  });

  it('sends to other channel', async () => {
    const [sendCh, receiveCh] = CrossChannel.createPair<number, string>();
    const sendPromise = sendCh.send(4);
    await expect(sendCh.receive({ timeoutMs: 10 })).rejects.toThrow(
      ChannelError.TimeoutError
    );
    await expect(receiveCh.receive()).resolves.toBe(4);

    receiveCh.send('A');
    await expect(receiveCh.receive({ timeoutMs: 10 })).rejects.toThrow(
      ChannelError.TimeoutError
    );
    await expect(sendCh.receive()).resolves.toBe('A');
    await sendPromise;
  });

  it('closing one end still allows sending and receiving on other end', async () => {
    const [sendCh, receiveCh] = CrossChannel.createPair<number, string>();
    sendCh.close();

    await expect(sendCh.send(4)).rejects.toThrow(
      ChannelError.ChannelClosedError
    );

    const sendPromise = receiveCh.send('A');

    await expect(sendCh.receive()).resolves.toBe('A');
    await sendPromise;
  });

  it('can perform sendAll', async () => {
    const [sendCh, receiveCh] = CrossChannel.createPair<number, string>();

    const sendPromise = sendCh.sendAll([3, 2, 1]);

    await expect(receiveCh.receive()).resolves.toBe(3);
    await expect(receiveCh.receive()).resolves.toBe(2);
    await expect(receiveCh.receive()).resolves.toBe(1);

    await sendPromise;

    await expect(receiveCh.receive({ timeoutMs: 10 })).rejects.toThrow(
      ChannelError.TimeoutError
    );
  });
});
