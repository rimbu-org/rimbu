import { AsyncStream, Reducer } from '@rimbu/stream';

import { timeout } from '../src/custom/index.mjs';
import { Channel, Mutex, WaitGroup } from '../src/main/index.mjs';

describe('web examples', () => {
  it('greet', async () => {
    async function greet(ch: Channel.Read<string>) {
      console.log(`Hello ${await ch.receive()}!`);
    }

    async function main() {
      console.log('main started');
      const ch = Channel.create<string>();

      greet(ch);

      await ch.send('Mia');
      console.log('main stopped');
    }

    await main();
  });

  it('timeout', async () => {
    async function main() {
      console.log('main started');
      const ch = Channel.create<string>();

      await expect(ch.send('Mia', { timeoutMs: 100 })).rejects.toThrow();
      console.log('main stopped');
    }

    await main();
  });

  it('squares', async () => {
    async function squares(ch: Channel.Write<number>) {
      for (let i = 0; i <= 9; i++) {
        await ch.send(i * i);
      }

      ch.close();
    }

    async function main() {
      console.log('main started');
      const ch = Channel.create<number>();

      squares(ch);

      for await (const value of ch) {
        console.log('received', value);
      }

      console.log('loop broke!');

      console.log('main stopped');
    }

    await main();
  });

  it('squares and cubes', async () => {
    async function square(ch: Channel<number>) {
      console.log('[square] reading');
      const num = await ch.receive();
      await ch.send(num * num);
    }

    async function cube(ch: Channel<number>) {
      console.log('[cube] reading');
      const num = await ch.receive();
      await ch.send(num * num * num);
    }

    async function main() {
      console.log('[main] main() starting');

      const squareChan = Channel.create<number>();
      const cubeChan = Channel.create<number>();

      square(squareChan);
      cube(cubeChan);

      const testNum = 3;
      console.log('[main] sent testNum to squareChan');

      await squareChan.send(testNum);

      console.log('[main] resuming');
      console.log('[main] sent testNum to cubeChan');

      await cubeChan.send(testNum);

      console.log('[main] resuming');
      console.log('[main] reading from the channels');

      const squareVal = await squareChan.receive();
      const cubeVal = await cubeChan.receive();

      const sum = squareVal + cubeVal;

      console.log(`[main] sum of square and cube of ${testNum} is ${sum}`);
      console.log('[main] main() stopped');
    }

    await main();
  });

  it('no mutex failure', async () => {
    let shared = 0;

    const waitGroup = WaitGroup.create();

    async function worker() {
      const v = shared;
      await timeout(Math.random() * 50);
      shared = v + 1;
      waitGroup.done();
    }

    async function main() {
      for (let i = 0; i < 100; i++) {
        waitGroup.add(1);
        worker();
      }

      await waitGroup.wait();
      console.log(`value of i after 1000 operations is ${shared}`);
    }

    await main();
  });

  it('mutex', async () => {
    let shared = 0;

    const waitGroup = WaitGroup.create();
    const mutex = Mutex.create();

    async function worker() {
      await mutex.acquire();
      const v = shared;
      await timeout(Math.random() * 50);
      shared = v + 1;
      mutex.release();
      waitGroup.done();
    }

    async function main() {
      for (let i = 0; i < 100; i++) {
        waitGroup.add(1);
        worker();
      }

      await waitGroup.wait();
      console.log(`value of i after 1000 operations is ${shared}`);
    }

    await main();
  });

  it('generator', async () => {
    function fib(length: number): Channel.Read<number> {
      const ch = Channel.create<number>({ capacity: length });

      (async () => {
        let i = 0;
        let j = 1;
        while (i < length) {
          console.log(`sending ${i}`);
          await ch.send(i);
          const oldI = i;
          i = i + j;
          j = oldI;
        }
        ch.close();
      })();

      return ch;
    }

    async function main() {
      for await (const fn of fib(10)) {
        console.log(`fibonacci number is ${fn}`);
      }
    }

    await main();
  });

  it('fan in fan out', async () => {
    function getInputCh(): Channel.Read<number> {
      const inputCh = Channel.create<number>({ capacity: 100 });
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

      (async () => {
        for (const num of numbers) {
          await inputCh.send(num);
        }

        inputCh.close();
      })();

      return inputCh;
    }

    function getSquareCh(inputCh: Channel.Read<number>): Channel.Read<number> {
      const outputCh = Channel.create<number>({ capacity: 100 });

      (async () => {
        for await (const num of inputCh) {
          await outputCh.send(num * num);
        }

        outputCh.close();
      })();

      return outputCh;
    }

    function merge(...outputsCh: Channel.Read<number>[]): Channel<number> {
      const wg = WaitGroup.create();

      const mergedCh = Channel.create<number>({ capacity: 100 });
      wg.add(outputsCh.length);

      async function output(sc: Channel.Read<number>) {
        for await (const sqr of sc) {
          await mergedCh.send(sqr);
        }

        wg.done();
      }

      for (const outputCh of outputsCh) {
        output(outputCh);
      }

      (async () => {
        await wg.wait();
        mergedCh.close();
      })();

      return mergedCh;
    }

    async function main() {
      const inputNumsCh = getInputCh();

      const optSqr1Ch = getSquareCh(inputNumsCh);
      const optSqr2Ch = getSquareCh(inputNumsCh);

      const mergedSqrCh = merge(optSqr1Ch, optSqr2Ch);

      let srqSum = 0;

      for await (const num of mergedSqrCh) {
        srqSum += num;
      }

      console.log(`sum of squares between 0-9 is ${srqSum}`);
    }

    await main();
  });

  it('stream source', async () => {
    const stream = AsyncStream.unfold(0, async (v, i, stop) => {
      await timeout(i);
      return v < 1000 ? v + i : stop;
    });
    const ch = Channel.create<number>({ capacity: 5 });
    ch.sendAll(stream).then(() => ch.close());

    console.log(
      'progressive sum',
      await ch.asyncStream().reduceStream(Reducer.sum).toArray()
    );
  });

  it('readme example', async () => {
    async function produce(ch: Channel.Write<number>) {
      for (let i = 0; i < 6; i++) {
        console.log('sending', i);
        await ch.send(i);
        console.log('sent', i);
      }

      ch.close();
    }

    async function consume(ch: Channel.Read<number>) {
      let sum = 0;

      while (!ch.isExhausted) {
        console.log('receiving');
        const value = await ch.receive();
        console.log('received', value);
        sum += value;
      }

      console.log({ sum });
    }

    const channel = Channel.create<number>();
    produce(channel);
    consume(channel);
  });
});
