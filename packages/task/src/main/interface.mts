import {
  type Cleanup,
  type DisposableCallback,
  type Prepend,
} from './internal.mjs';

import { TaskContextImpl } from './task-context-impl.mjs';

/**
 * A unit of work that can be executed within a Task Context.
 * @typeparam R - the result type
 * @typeparam A - the argument tuple type
 */
export type Task<R = void, A extends readonly any[] = []> =
  | Task.Fun<R, A>
  | Task.Seq<R, A>;

export namespace Task {
  /**
   * The result of a Task, which can be a value or a Promise-like value.
   * @typeparam R - the result type
   */
  export type Result<R> = PromiseLike<R> | R;

  /**
   * A function-based Task.
   * @typeparam R - the result type
   * @typeparam A - the argument tuple type
   */
  export type Fun<R = void, A extends readonly any[] = []> = (
    context: Task.Context,
    ...args: A
  ) => Task.Result<R>;

  /**
   * A sequence of Tasks to be executed in order. Each task receives the output of the previous as input.
   * The tuple structure enforces that the last element is the final Task with the desired result type.
   * @typeparam R - the result type of the final Task
   * @typeparam A - the argument tuple type for the first Task
   */
  export type Seq<R = void, A extends readonly any[] = []> = [
    Task<unknown, A>,
    ...unknown[],
  ] &
    [...unknown[], Task<R, unknown[]>];

  /**
   * Represents a chain of Tasks with typed results and arguments. Each Task in the chain receives the result of the previous as its argument.
   * @typeparam RS - array of result types for each Task in the chain
   * @typeparam A - argument tuple type for the first Task
   * @typeparam RRS - array of argument tuples for each result (advanced usage)
   */
  export type Chain<
    RS extends any[],
    A extends any[],
    RRS extends any[] = { [K in keyof RS]: [RS[K]] },
  > = [Task<unknown, A>, ...unknown[]] & {
    [K in keyof RS]: Task<RS[K], Prepend<A, RRS>[K & keyof Prepend<A, RRS>]>;
  };

  /**
   * Modifies a Task, potentially changing its result or error type.
   * @typeparam E - additional error/result type
   *
   * Example:
   * ```ts
   * const withTimeout: Task.Modifier<TimeoutError> = ...;
   * const safeTask = withTimeout(myTask);
   * ```
   */
  export type Modifier<E = never> = <R, A extends readonly any[] = []>(
    task: Task<R, A>
  ) => Task<R | E, A>;

  /**
   * Modifies a Task's input and output types.
   * @typeparam RI - input result type
   * @typeparam RO - output result type
   *
   * Example:
   * ```ts
   * const doubleResult: Task.ModifierIO<number, number> = (task) => async (ctx, ...args) => 2 * await ctx.next(task, args);
   * ```
   */
  export type ModifierIO<RI = void, RO = RI, A extends any[] = []> = (
    task: Task<RI, A>
  ) => Task<RO, A>;

  export interface ChildOptions {
    childId?: string | undefined;
    isSupervisor?: boolean | undefined;
    maxBranch?: number | undefined;
  }

  /**
   * Represents a running Task that can be joined or cancelled.
   */
  export interface Job<R = void> extends Disposable {
    /**
     * Waits for the job to finish, and returns the result if available.
     * If the job is already completed, returns the result immediately.
     * If the job is cancelled, throws a CancellationError unless a recover function is provided.
     *
     * @param options - (optional) an object containing the following properties:<br/>
     * - `timeoutMs`: Optional timeout in milliseconds to wait for the job to complete.<br/>
     * - `recover`: Optional function to recover from an error if the job fails or times out.
     *   If provided, this function will be called with the error, and its return value will be used as the result of the `join` method.
     *   If not provided, the error will be thrown.
     */
    join: <RT = never>(options?: {
      timeoutMs?: number;
      recover?: (error?: unknown) => RT;
    }) => Promise<R | RT>;
    /**
     * Cancels the job if it is still running.
     */
    cancel: () => void;
    /**
     * Cancels the job and waits for it to finish.
     */
    cancelAndJoin(): Promise<void>;
  }

  /**
   * Represents the execution context for Tasks, supporting cancellation, supervision, and child contexts.
   */
  export interface Context extends Disposable {
    /** Unique context id */
    get id(): string;
    /** Parent context, if any */
    get parent(): Task.Context | undefined;
    /** Iterable of child contexts */
    get children(): Iterable<Task.Context>;
    /** True if there are child contexts */
    get hasChildren(): boolean;
    /** True if the context is active (not cancelled) */
    get isActive(): boolean;
    /** True if this context is cancelled */
    get isCancelled(): boolean;
    /** AbortSignal for cancellation */
    get cancelledSignal(): AbortSignal;
    /** True if this context is a supervisor */
    get isSupervisor(): boolean;
    /** Cancels this context */
    cancel: () => void;
    /** Cancels all child contexts */
    cancelAllChildren: () => void;
    /** Registers a callback for cancellation */
    onCancelled: (cleanup: Cleanup) => DisposableCallback;
    /** Throws if cancelled */
    throwIfCancelled: () => void;
    delay: (delayMs?: number) => Promise<void>;
    /**
     * Executes the next task within a running context.
     * Use for chaining tasks or running a task as part of a sequence.
     * @param task - the task to execute
     * @param args - arguments to pass to the task
     * @returns a promise that resolves with the task's result
     */
    run: {
      <R = void>(task: Task<R>): Promise<R>;
      <R = void, A extends readonly any[] = []>(
        task: Task<R, A>,
        args: A
      ): Promise<R>;
    };
    /**
     * Launches a task as a background Job in this context.
     * Use for running tasks that can be cancelled or joined later.
     * @param task - the task to execute
     * @param args - arguments to pass to the task
     * @returns the launched Job
     */
    launch: {
      <R = void>(
        task: Task<R>,
        options?: (Task.ChildOptions & { args?: undefined | [] }) | undefined
      ): Task.Job<R>;
      <R = void, A extends readonly any[] = []>(
        task: Task<R, A>,
        options: (Task.ChildOptions & { args: A }) | undefined
      ): Task.Job<R>;
    };
  }

  /**
   * Static constructors and root context for Tasks.
   */
  export interface Constructors {
    /** Returns the root context. */
    get rootContext(): Context;
    /** Utility method to wrap a task.
     * @param task - the task to wrap
     * @returns the same task
     */
    create<R = void, A extends readonly any[] = []>(
      task: Task<R, A>
    ): Task<R, A>;
    /** Launches a task in the root context. Equivalent to `Task.rootContext.launch`. */
    launch: Task.Context['launch'];
    // run: Task.Context['run'];
  }
}

/**
 * The singleton root context used by the main Task API.
 */
const ROOT_CONTEXT: Task.Context = Object.freeze(
  new TaskContextImpl('root', true, undefined)
);

/**
 * Main Task API entry point, providing static methods and the root context.
 *
 * Example:
 * ```ts
 * const t = Task.create((ctx, name: string) => `Hello, ${name}!`);
 * Task.launch(t, ['World']);
 * ```
 */
export const Task: Task.Constructors = Object.freeze({
  get rootContext(): Task.Context {
    return ROOT_CONTEXT;
  },
  create: (task) => task,
  launch: ROOT_CONTEXT.launch,
} as Task.Constructors);
