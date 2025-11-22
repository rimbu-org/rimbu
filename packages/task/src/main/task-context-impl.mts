import { Semaphore, WaitGroup } from '@rimbu/channel';
import type { Task } from './interface.mjs';
import {
  CancellationError,
  cleanupOn,
  disposableDelay,
  withTimeout,
  type Cleanup,
  type DisposableCallback,
} from './internal.mjs';

type LaunchResult<R> =
  | { type: 'result'; value: R }
  | { type: 'error'; error: any };

export class TaskContextImpl implements Task.Context {
  readonly #cancelController: AbortController = new AbortController();
  readonly #childrenWaitGroup = WaitGroup.create();

  readonly #parent: Task.Context | undefined;
  readonly #children: Set<Task.Context> = new Set();
  readonly #maxBranchSemaphore: Semaphore | undefined;

  #nextChildId = 0;

  constructor(
    readonly id: string,
    readonly isSupervisor: boolean,
    parent: Task.Context | undefined,
    maxBranch?: number | undefined
  ) {
    this.#parent = parent;

    if (undefined !== maxBranch && maxBranch > 0) {
      this.#maxBranchSemaphore = Semaphore.create({ maxSize: maxBranch });
    }
  }

  get parent(): Task.Context | undefined {
    return this.#parent;
  }

  get children(): Iterable<Task.Context> {
    return this.#children;
  }

  get hasChildren(): boolean {
    return this.#children.size > 0;
  }

  get isCancelled(): boolean {
    return this.#cancelController.signal.aborted;
  }

  get isActive(): boolean {
    return !this.isCancelled;
  }

  get [Symbol.dispose](): () => void {
    return this.cancel;
  }

  cancel = (): void => {
    if (!this.isCancelled) {
      this.#cancelController.abort();
    }
  };

  cancelAllChildren = (): void => {
    for (const child of this.#children) {
      child.cancel();
    }
  };

  onCancelled = (cleanup: Cleanup): DisposableCallback => {
    return cleanupOn(this.cancelledSignal, cleanup);
  };

  get cancelledSignal(): AbortSignal {
    return this.#cancelController.signal;
  }

  #createChildContext = (
    options: {
      childId?: string | undefined;
      isSupervisor?: boolean | undefined;
      maxBranch?: number | undefined;
    } = {}
  ): Task.Context => {
    const {
      childId = `${this.id}_${this.isSupervisor ? 'S-' : ''}${this.#nextChildId++}`,
      isSupervisor = false,
      maxBranch,
    } = options;

    const childContext = new TaskContextImpl(
      childId,
      isSupervisor,
      this,
      maxBranch
    );
    this.#children.add(childContext);

    const unsubscribe = this.onCancelled(childContext);

    childContext.onCancelled(() => {
      unsubscribe();
      this.#children.delete(childContext);
    });

    return childContext;
  };

  throwIfCancelled = (): void => {
    if (this.isCancelled) {
      throw new CancellationError();
    }
  };

  delay = async (delayMs?: number): Promise<void> => {
    this.throwIfCancelled();
    using delayPromise = disposableDelay(delayMs ?? 0);
    using _ = this.onCancelled(delayPromise);
    await delayPromise;
    this.throwIfCancelled();
  };

  run = async <R, A extends readonly any[]>(
    task: Task<R, A>,
    args: A = [] as any as A
  ): Promise<R> => {
    try {
      return await unpackTask(task)(this, ...args);
    } finally {
      await this.#childrenWaitGroup.wait({ signal: this.cancelledSignal });
    }
  };

  launch = <R, A extends readonly any[]>(
    task: Task<R, A>,
    options: {
      childId?: string | undefined;
      isSupervisor?: boolean | undefined;
      maxBranch?: number | undefined;
      args?: A | undefined;
    } = {}
  ): Task.Job<R> => {
    const cancelChildController = new AbortController();

    const promise = (async (): Promise<LaunchResult<R>> => {
      this.throwIfCancelled();
      using childContext = this.#createChildContext(options);
      using _ = cleanupOn(cancelChildController.signal, childContext);
      let branchAqcuired = false;

      try {
        // ensure parent waits for child to complete
        this.#childrenWaitGroup.add();

        // if max branching set, wait for permission to start
        await this.#maxBranchSemaphore?.acquire(1, {
          signal: this.cancelledSignal,
        });
        branchAqcuired = true;

        const { args = [] as unknown as A } = options;

        const result = await childContext.run(task, args);
        return { type: 'result', value: result };
      } catch (error) {
        if (!this.isSupervisor) {
          this.cancel();
        }
        return { type: 'error', error };
      } finally {
        if (branchAqcuired) {
          // if max branching set, release the slot
          this.#maxBranchSemaphore?.release();
        }
        // ensure parent stops waiting for child
        this.#childrenWaitGroup.done();
      }
    })();

    const result: Task.Job<R> = {
      join: async (options = {}): Promise<any> => {
        try {
          const result = await withTimeout(promise, options.timeoutMs);

          if (result.type === 'result') {
            return result.value;
          } else {
            throw result.error;
          }
        } catch (error) {
          if (options.recover) {
            return options.recover(error);
          }

          if (!this.isSupervisor) {
            // if not a supervisor, cancel the parent context on error
            this.cancel();
          }

          throw error;
        }
      },
      cancel: (): void => {
        cancelChildController.abort();
      },
      get [Symbol.dispose](): () => void {
        return result.cancel;
      },
      cancelAndJoin: async (): Promise<void> => {
        result.cancel();
        await result.join({
          recover: (error) => {
            if (error instanceof CancellationError) {
              return;
            }
            throw error;
          },
        });
      },
    };

    return result;
  };
}

function unpackTask<R, A extends readonly any[]>(
  task: Task<R, A>
): Task.Fun<R, A> {
  if (typeof task === 'function') {
    return async (context, ...args) => {
      context.throwIfCancelled();
      const result = await task(context, ...args);
      context.throwIfCancelled();
      return result;
    };
  } else if (Array.isArray(task)) {
    const [first, ...rest] = task;

    return async (context, ...args) => {
      // first subtask gets all args
      let lastResult = await unpackTask(first)(context, ...args);
      for (const subTask of rest) {
        lastResult = await unpackTask(subTask as Task)(context);
      }
      return lastResult as R;
    };
  } else {
    throw new Error('Invalid task type');
  }
}
