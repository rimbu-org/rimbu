import { describe, expect, it } from 'bun:test';

import { Channel, ChannelError } from '@rimbu/channel';

const MSG = 'MESSAGE!';
const FALLBACK = 'FALLBACK';

describe('Channel buffer 0', () => {
	it('prevents adding and overwriting static methods', () => {
		expect(() => {
			(Channel as any).create = () => {
				return 1 as any;
			};
		}).toThrow();

		expect(() => {
			(Channel as any).b = () => {};
		}).toThrow();
	});

	it('starts with initial values', () => {
		const ch = Channel.create();
		expect(ch.capacity).toBe(0);
		expect(ch.length).toBe(0);
		expect(ch.isClosed).toBe(false);
		expect(ch.isExhausted).toBe(false);
	});

	it('UNBUFFERED constant equals 0', () => {
		expect(Channel.UNBUFFERED).toBe(0);
		const ch = Channel.create({ capacity: Channel.UNBUFFERED });
		expect(ch.capacity).toBe(0);
	});

	it('readable returns read-only view, writable returns write-only view', () => {
		const ch = Channel.create();
		expect(ch.readable()).toBe(ch);
		expect(ch.writable()).toBe(ch);
	});

	it('can send and then receive', async () => {
		const ch = Channel.create<string>();
		const sendPromise = ch.send(MSG);
		expect(ch.length).toBe(0);
		expect(ch.receive()).resolves.toBe(MSG);
		expect(ch.length).toBe(0);
		await sendPromise;
	});

	it('can send, close, and then receive', async () => {
		const ch = Channel.create<string>();
		const sendPromise = ch.send(MSG);
		ch.close();
		expect(ch.receive()).resolves.toBe(MSG);
		await sendPromise;
		expect(ch.send(MSG)).rejects.toThrow(ChannelError.ChannelClosedError);
		expect(ch.receive()).rejects.toThrow(ChannelError.ChannelExhaustedError);
	});

	it('can receive and then send', async () => {
		const ch = Channel.create<string>();
		const receivePromise = ch.receive();
		expect(ch.length).toBe(0);
		await ch.send(MSG);
		expect(ch.length).toBe(0);
		expect(receivePromise).resolves.toBe(MSG);
		expect(ch.length).toBe(0);
	});

	it('send with timeout waits then throws', () => {
		const ch = Channel.create<string>();
		expect(ch.send(MSG, { timeoutMs: 100 })).rejects.toThrow(
			ChannelError.TimeoutError,
		);
	});

	it('send with recover returns channel error', async () => {
		const ch = Channel.create<string>();
		const res = await ch.send(MSG, {
			timeoutMs: 100,
			recover: (err) => err,
		});
		expect(ch.length).toBe(0);
		expect(res).toBeInstanceOf(ChannelError.TimeoutError);
	});

	it('send with recover and timeout returns channel error after timeout', async () => {
		const ch = Channel.create<string>();
		const res = await ch.send(MSG, {
			recover: (err) => err,
			timeoutMs: 100,
		});
		expect(ch.length).toBe(0);
		expect(res).toBeInstanceOf(ChannelError.TimeoutError);
	});

	it('send with aborted signal throws', () => {
		const ch = Channel.create<string>();

		const controller = new AbortController();
		controller.abort();
		expect(
			ch.send(MSG, {
				signal: controller.signal,
			}),
		).rejects.toThrow(ChannelError.OperationAbortedError);
	});

	it('send with signal that is aborted after some time throws', () => {
		const ch = Channel.create<string>();

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 100);
		expect(
			ch.send(MSG, {
				signal: controller.signal,
			}),
		).rejects.toThrow(ChannelError.OperationAbortedError);
	});

	it('send with aborted signal and recover returns channel error', () => {
		const ch = Channel.create<string>();

		const controller = new AbortController();
		controller.abort();
		expect(
			ch.send(MSG, {
				signal: controller.signal,
				recover: (err) => err,
			}),
		).resolves.toBeInstanceOf(ChannelError.OperationAbortedError);
	});

	it('send with signal that is aborted after some time and recover returns channel error', () => {
		const ch = Channel.create<string>();

		const controller = new AbortController();
		setTimeout(() => controller.abort(), 100);
		expect(
			ch.send(MSG, {
				signal: controller.signal,
				recover: (err) => err,
			}),
		).resolves.toBeInstanceOf(ChannelError.OperationAbortedError);
	});

	it('receive with timeout waits then throws', () => {
		const ch = Channel.create<string>();
		expect(ch.send(MSG, { timeoutMs: 100 })).rejects.toThrow(
			ChannelError.TimeoutError,
		);
	});

	it('receive with recover returns channel error', async () => {
		const ch = Channel.create<string>();
		const res = await ch.receive({ timeoutMs: 100, recover: (err) => err });
		expect(ch.length).toBe(0);
		expect(res).toBeInstanceOf(ChannelError.TimeoutError);
	});

	it('receive with recover and timeout returns channel error after timeout', async () => {
		const ch = Channel.create<string>();
		const res = await ch.receive({
			recover: (err) => err,
			timeoutMs: 100,
		});
		expect(ch.length).toBe(0);
		expect(res).toBeInstanceOf(ChannelError.TimeoutError);
	});

	it('allows multiple concurrent sends', async () => {
		const ch = Channel.create<string>();
		const p1 = ch.send('A');
		const p2 = ch.send('B');
		expect(await ch.receive()).toBe('A');
		expect(await ch.receive()).toBe('B');
		await p1;
		await p2;
	});

	it('allows multiple concurrent receives', async () => {
		const ch = Channel.create<string>();
		const r1 = ch.receive();
		const r2 = ch.receive();
		await ch.send('A');
		await ch.send('B');
		expect(await r1).toBe('A');
		expect(await r2).toBe('B');
	});

	it('trySend returns undefined on success (when receiver is waiting)', async () => {
		const ch = Channel.create<string>();
		const receivePromise = ch.receive();
		const result = ch.trySend(MSG);
		expect(result).toBeUndefined();
		expect(await receivePromise).toBe(MSG);
	});

	it('trySend returns ChannelClosedError when channel is closed', () => {
		const ch = Channel.create<string>();
		ch.close();
		const result = ch.trySend(MSG);
		expect(result).toBeInstanceOf(ChannelError.ChannelClosedError);
	});

	it('tryReceive returns ChannelEmptyError when channel is open and empty', () => {
		const ch = Channel.create<string>();
		const result = ch.tryReceive();
		expect(result).toBeInstanceOf(ChannelError.ChannelEmptyError);
	});

	it('tryReceive returns ChannelExhaustedError when channel is exhausted', () => {
		const ch = Channel.create<string>();
		ch.close();
		const result = ch.tryReceive();
		expect(result).toBeInstanceOf(ChannelError.ChannelExhaustedError);
	});

	it('closing while receiving empty throws', () => {
		const ch = Channel.create<string>();
		const receivePromise = ch.receive();
		ch.close();
		expect(receivePromise).rejects.toThrow(ChannelError.ChannelExhaustedError);
	});
});

describe('Channel buffer 1', () => {
	it('starts with initial values', () => {
		const ch = Channel.create({ capacity: 1 });
		expect(ch.capacity).toBe(1);
		expect(ch.length).toBe(0);
		expect(ch.isClosed).toBe(false);
		expect(ch.isExhausted).toBe(false);
	});

	it('readable and writable return self', () => {
		const ch = Channel.create({ capacity: 1 });
		expect(ch.readable()).toBe(ch);
		expect(ch.writable()).toBe(ch);
	});

	it('can send and then receive', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		expect(ch.receive()).resolves.toBe(MSG);
	});

	it('can send, close, and then receive', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		expect(ch.length).toBe(1);
		ch.close();
		expect(ch.receive()).resolves.toBe(MSG);
		expect(ch.length).toBe(0);
	});

	it('canSendImmediate is false when buffer is full', async () => {
		const ch = Channel.create({ capacity: 1 });
		expect(ch.length).toBe(0);
		await ch.send();
		expect(ch.length).toBe(1);
	});

	it('can buffer values', async () => {
		const ch = Channel.create<string>({ capacity: 3 });
		await ch.send('A');
		await ch.send('B');
		await ch.send('C');
		expect(ch.send('D', { timeoutMs: 10 })).rejects.toThrow();
		expect(ch.receive()).resolves.toBe('A');
		expect(ch.receive()).resolves.toBe('B');
		expect(ch.receive()).resolves.toBe('C');
		expect(ch.receive({ timeoutMs: 10 })).rejects.toThrow(
			ChannelError.TimeoutError,
		);
	});

	it('send throws when channel is closed', () => {
		const ch = Channel.create({ capacity: 1 });
		ch.close();
		expect(ch.send()).rejects.toThrow(ChannelError.ChannelClosedError);
	});

	it('send with timeout when buffer full throws', async () => {
		const ch = Channel.create({ capacity: 1 });
		await ch.send();
		expect(ch.send(undefined, { timeoutMs: 10 })).rejects.toThrow(
			ChannelError.TimeoutError,
		);
	});

	it('send aborts when passed an aborted abort signal', () => {
		const ch = Channel.create({ capacity: 1 });
		const abortController = new AbortController();
		abortController.abort();
		expect(
			ch.send(undefined, { signal: abortController.signal }),
		).rejects.toThrow(ChannelError.OperationAbortedError);
	});

	it('send aborts when waiting for full buffer and abort signal called', async () => {
		const ch = Channel.create({ capacity: 1 });
		await ch.send();
		const abortController = new AbortController();
		setTimeout(() => abortController.abort(), 100);
		expect(
			ch.send(undefined, { signal: abortController.signal }),
		).rejects.toThrow(ChannelError.OperationAbortedError);
	});

	it('receive ignores fallback when data is available', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		expect(ch.receive({ recover: () => FALLBACK })).resolves.toBe(MSG);
		await ch.send(MSG);
		expect(
			ch.receive({ recover: () => FALLBACK, timeoutMs: 10 }),
		).resolves.toBe(MSG);
	});

	it('receive returns fallback when channel is exhausted and fallback provided', () => {
		const ch = Channel.create({ capacity: 1 });
		ch.close();
		expect(ch.receive({ recover: () => FALLBACK })).resolves.toBe(FALLBACK);
		expect(
			ch.receive({ recover: () => FALLBACK, timeoutMs: 10 }),
		).resolves.toBe(FALLBACK);
	});

	it('receive returns fallback when channel no data in buffer and fallback and timeout provided', () => {
		const ch = Channel.create({ capacity: 1 });
		expect(
			ch.receive({ recover: () => FALLBACK, timeoutMs: 10 }),
		).resolves.toBe(FALLBACK);
	});

	it('receive succeeds when channel is closed but still values in buffer', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		ch.close();
		expect(ch.receive()).resolves.toBe(MSG);
	});

	it('receive throws when channel is exhausted', () => {
		const ch = Channel.create({ capacity: 1 });
		ch.close();
		expect(ch.receive()).rejects.toThrow(ChannelError.ChannelExhaustedError);
	});

	it('receive with timeout without getting value throws', () => {
		const ch = Channel.create({ capacity: 1 });
		expect(ch.receive({ timeoutMs: 10 })).rejects.toThrow(
			ChannelError.TimeoutError,
		);
	});

	it('receive aborts when passed an aborted abort signal', () => {
		const ch = Channel.create({ capacity: 1 });
		const abortController = new AbortController();
		abortController.abort();
		expect(ch.receive({ signal: abortController.signal })).rejects.toThrow(
			ChannelError.OperationAbortedError,
		);
	});

	it('receive aborts when passed a signal that is aborted while waiting', () => {
		const ch = Channel.create({ capacity: 1 });
		const abortController = new AbortController();
		setTimeout(() => abortController.abort(), 100);
		expect(ch.receive({ signal: abortController.signal })).rejects.toThrow(
			ChannelError.OperationAbortedError,
		);
	});

	it('closing channel works', () => {
		const ch = Channel.create({ capacity: 1 });
		ch.close();
		expect(ch.isClosed).toBe(true);
		expect(ch.isExhausted).toBe(true);
		expect(() => ch.close()).toThrow(ChannelError.ChannelClosedError);
	});

	it('allows multiple concurrent sends', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send('A');
		const p2 = ch.send('B');
		const p3 = ch.send('C');
		expect(await ch.receive()).toBe('A');
		expect(await ch.receive()).toBe('B');
		expect(await ch.receive()).toBe('C');
		await p2;
		await p3;
	});

	it('allows multiple concurrent receives', () => {
		const ch = Channel.create<string>({ capacity: 1 });
		const r1 = ch.receive();
		const r2 = ch.receive();
		ch.send(MSG);
		expect(r1).resolves.toBe(MSG);
		ch.send(MSG);
		expect(r2).resolves.toBe(MSG);
	});

	it('trySend returns undefined on success when buffer has space', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		const result = ch.trySend(MSG);
		expect(result).toBeUndefined();
		expect(await ch.receive()).toBe(MSG);
	});

	it('trySend returns error when buffer is full', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		const result = ch.trySend(MSG);
		expect(result).toBeInstanceOf(ChannelError);
	});

	it('tryReceive returns value when buffer has data', async () => {
		const ch = Channel.create<string>({ capacity: 1 });
		await ch.send(MSG);
		const result = ch.tryReceive();
		expect(result).toBe(MSG);
	});

	it('tryReceive returns ChannelEmptyError when buffer is empty but open', () => {
		const ch = Channel.create<string>({ capacity: 1 });
		const result = ch.tryReceive();
		expect(result).toBeInstanceOf(ChannelError.ChannelEmptyError);
	});
});

describe('Channel.select', () => {
	it('select empty', () => {
		expect(Channel.select([])).rejects.toBeInstanceOf(ChannelError.SelectError);
		expect(Channel.select([], { timeoutMs: 100 })).rejects.toBeInstanceOf(
			ChannelError.SelectError,
		);
		expect(Channel.select([], { recover: (error) => error })).resolves.toBeInstanceOf(
			ChannelError.SelectError,
		);
	});

	it('select exhausted channels returns SelectError', async () => {
		const ch1 = Channel.create<string>();
		const ch2 = Channel.create<number>();
		ch1.close();
		ch2.close();

		await expect(Channel.select([ch1, ch2])).rejects.toBeInstanceOf(
			ChannelError.SelectError,
		);
		await expect(
			Channel.select([ch1, ch2], { recover: (error) => error }),
		).resolves.toBeInstanceOf(ChannelError.SelectError);
	});

	it('selects', async () => {
		const ch1 = Channel.create<string>();
		const ch2 = Channel.create<number>();

		expect(Channel.select([ch1, ch2], { timeoutMs: 10 })).rejects.toThrow();

		{
			const promise = Channel.select([ch1, ch2]);
			await ch1.send(MSG);
			expect(promise).resolves.toBe(MSG);
		}

		{
			const promise = Channel.select([ch1, ch2]);
			await ch2.send(5);
			expect(promise).resolves.toBe(5);
		}
	});

	it('selectCase', async () => {
		const ch1 = Channel.create<string>();
		const ch2 = Channel.create<number>();

		expect(
			Channel.selectCase(
				[
					[ch1, (v) => `${v}${v}`],
					[ch2, (v) => v * 2],
				],
				{ timeoutMs: 10 },
			),
		).rejects.toThrow();

		{
			const promise = Channel.selectCase(
				[
					[ch1, (v) => `${v}${v}`],
					[ch2, (v) => v * 2],
				],
				{ timeoutMs: 10 },
			);
			await ch1.send(MSG);
			expect(promise).resolves.toBe(`${MSG}${MSG}`);
		}

		{
			const promise = Channel.selectCase(
				[
					[ch1, (v) => `${v}${v}`],
					[ch2, (v) => v * 2],
				],
				{ timeoutMs: 10 },
			);
			await ch2.send(5);
			expect(promise).resolves.toBe(10);
		}
	});

	it('selectCase exhausted channels returns SelectError', async () => {
		const ch1 = Channel.create<string>();
		const ch2 = Channel.create<number>();
		ch1.close();
		ch2.close();

		const cases: [
			[Channel.Read<string>, (value: string) => string],
			[Channel.Read<number>, (value: number) => number],
		] = [
			[ch1, (value: string) => value],
			[ch2, (value: number) => value],
		];

		await expect(
			Channel.selectCase(cases),
		).rejects.toBeInstanceOf(
			ChannelError.SelectError,
		);
		await expect(
			Channel.selectCase(cases, { recover: (error) => error }),
		).resolves.toBeInstanceOf(ChannelError.SelectError);
	});
});
