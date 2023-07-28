import { WaitGroup } from '../src/main/index.mjs';
import { expectNotResolves } from './test-utils.mjs';

describe('WaitGroup', () => {
  it('wait immediately resolves when nothing added', async () => {
    const wg = WaitGroup.create();
    await wg.wait();
  });

  it('wait blocks when amount added, resolves when done', async () => {
    const wg = WaitGroup.create();
    wg.add();
    const waitWg = wg.wait();
    await expectNotResolves(waitWg);
    wg.done();
    await waitWg;
  });

  it('multiple waits are resolves at the same time', async () => {
    const wg = WaitGroup.create();
    wg.add();
    const waitWg1 = wg.wait();
    const waitWg2 = wg.wait();
    await expectNotResolves(waitWg1);
    await expectNotResolves(waitWg2);
    wg.done();
    await waitWg1;
    await waitWg2;
  });

  it('only unblocks wait when amount back to 0', async () => {
    const wg = WaitGroup.create();
    wg.add(5);
    const waitWg = wg.wait();
    await expectNotResolves(waitWg);
    wg.done(2);
    await expectNotResolves(waitWg);
    wg.done();
    await expectNotResolves(waitWg);
    wg.done(10);
    await waitWg;
  });

  it('can reuse waitgroup', async () => {
    const wg = WaitGroup.create();
    wg.add();
    const waitWg1 = wg.wait();
    await expectNotResolves(waitWg1);
    wg.done();
    await waitWg1;

    wg.add();
    const waitWg2 = wg.wait();
    await expectNotResolves(waitWg2);
    wg.done();
    await waitWg2;
  });
});
