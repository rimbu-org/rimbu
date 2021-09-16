import { Obs } from './internal.ts';

/**
 * An asynchronous process to be executed at some time in the future.
 */
export type Process = () => Promise<any>;

/**
 * An entity to manage a queue of processes to be executed.
 */
export interface ProcessQueue {
  /**
   * A read-only `Obs` representing whether a process is being executed.
   */
  readonly isProcessing: Obs.Readonly<boolean>;
  /**
   * Adds a process to the end of the queue. If no process is currently being executed, it will
   * start processing the queue.
   * @param process - the process instance to add
   */
  add(process: Process): Promise<void>;
}

export namespace ProcessQueue {
  /**
   * Returns a new `ProcessQueue` instance.
   */
  export function create(): ProcessQueue {
    const queue = [] as Process[];

    const isProcessing = Obs.create(false);

    let error = false;

    async function start(): Promise<void> {
      let nextProcess: Process | undefined;

      while (undefined !== (nextProcess = queue[0])) {
        isProcessing.setState(true);

        await nextProcess();

        queue.shift();
      }

      error = false;
      isProcessing.setState(false);
    }

    return {
      isProcessing,
      add(process: Process): Promise<void> {
        return new Promise<void>((resolve, reject) => {
          queue.push(async () => {
            if (error) return reject(Error('earlier queue item failed'));

            try {
              await process();
              resolve();
            } catch (e) {
              error = true;
              reject(e);
            }
          });

          if (queue.length === 1) start();
        });
      },
    };
  }
}
