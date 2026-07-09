import { describe, expect, it } from 'bun:test';

import { WaitGroup, WaitGroupError } from '@rimbu/channel/wait-group';
import { expectNotResolves } from './test-utils';

describe('WaitGroup', () => {
	it('wait immediately resolves when nothing added', async () => {
		const wg = WaitGroup.create();
		await wg.wait();
	});

	it('wait blocks when amount added, resolves when done', async () => {
		const wg = WaitGroup.create();
		wg.add();
		const waitWg = wg.wait();
		expectNotResolves(waitWg);
		wg.done();
		await waitWg;
	});

	it('multiple waits are resolves at the same time', async () => {
		const wg = WaitGroup.create();
		wg.add();
		const waitWg1 = wg.wait();
		const waitWg2 = wg.wait();
		expectNotResolves(waitWg1);
		expectNotResolves(waitWg2);
		wg.done();
		await waitWg1;
		await waitWg2;
	});

	it('only unblocks wait when amount back to 0', async () => {
		const wg = WaitGroup.create();
		wg.add(5);
		const waitWg = wg.wait();
		expectNotResolves(waitWg);
		wg.done(2);
		expectNotResolves(waitWg);
		wg.done();
		expectNotResolves(waitWg);
		wg.done(2);
		await waitWg;
	});

	it('done throws WaitGroupError.UnderflowError when called more times than add', () => {
		const wg = WaitGroup.create();
		expect(() => wg.done()).toThrow(WaitGroupError.UnderflowError);
	});

	it('done throws when partial amount causes underflow', () => {
		const wg = WaitGroup.create();
		wg.add(2);
		expect(() => wg.done(3)).toThrow(WaitGroupError.UnderflowError);
	});

	it('can reuse waitgroup', async () => {
		const wg = WaitGroup.create();
		wg.add();
		const waitWg1 = wg.wait();
		expectNotResolves(waitWg1);
		wg.done();
		await waitWg1;

		wg.add();
		const waitWg2 = wg.wait();
		expectNotResolves(waitWg2);
		wg.done();
		await waitWg2;
	});
});
