import type { Cleanup, DisposableCallback } from '#task/task-utils';

import { taskModule } from '#task/task-module';

/**
 * Error thrown when a Task is cancelled.
 */
export class TaskCancellationError extends Error {
	constructor() {
		super('Task was cancelled');
		this.name = 'TaskCancellationError';
	}
}

/**
 * Error thrown when a Task exceeds its allowed execution time.
 */
export class TaskTimeoutError extends Error {
	constructor() {
		super('Task timed out');
		this.name = 'TaskTimeoutError';
	}
}

/**
 * Error thrown when the retry limit for a Task is reached.
 */
export class TaskRetryExhaustedError extends Error {
	constructor() {
		super('Task retry exhausted');
		this.name = 'TaskRetryExhaustedError';
	}
}

/**
 * A unit of work that can be executed within a Task Context.
 * @typeparam R - the result type
 * @typeparam A - the argument tuple type
 */
export type Task<R = void, A extends readonly any[] = []> = Task.Fun<R, A>;

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

	/** @internal */
	export type _Prepend<I, T extends any[]> = [I, ...T];

	/**
	 * Represents a chain of Tasks with typed results and arguments.
	 * The first Task receives the original arguments `A`; each subsequent Task
	 * receives the result of the previous Task as its single argument.
	 * @typeparam RS - array of result types for each Task in the chain
	 * @typeparam A - argument tuple type for the first Task
	 */
	export type Chain<
		RS extends any[],
		A extends any[],
		RRS extends any[] = { [K in keyof RS]: [RS[K]] },
	> = [Task<unknown, A>, ...unknown[]] & {
		[K in keyof RS]: Task<
			RS[K],
			Task._Prepend<A, RRS>[K & keyof Task._Prepend<A, RRS>]
		>;
	};

	/** @internal */
	export type Last<T extends any[], O = never> = T extends [...any[], infer L]
		? L
		: O;

	/**
	 * Modifies a Task, potentially changing its result or error type.
	 * @typeparam E - additional error/result type
	 *
	 * Example:
	 * ```ts
	 * const withTimeout: Task.Modifier<TaskTimeoutError> = ...;
	 * const safeTask = withTimeout(myTask);
	 * ```
	 */
	export type Modifier<E = never> = <R, A extends readonly any[] = []>(
		task: Task<R, A>,
	) => Task<R | E, A>;

	export interface ChildOptions {
		id?: string | undefined;
		isolated?: boolean | undefined;
		maxBranch?: number | undefined;
	}

	/** @see {@link TaskCancellationError} */
	export type CancellationError = TaskCancellationError;
	/** @see {@link TaskTimeoutError} */
	export type TimeoutError = TaskTimeoutError;
	/** @see {@link TaskRetryExhaustedError} */
	export type RetryExhaustedError = TaskRetryExhaustedError;

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
		 *
		 * Note: providing `recover` **suppresses parent-context cancellation on error**.
		 * Without `recover`, when a job launched in a non-isolated parent throws, the
		 * parent context is cancelled to propagate the failure. Supplying `recover`
		 * signals "I have handled this error" and the parent is left running.
		 */
		join: <RT = never>(options?: {
			timeoutMs?: number;
			recover?: (error: unknown) => RT;
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
		/** Cancels this context */
		cancel: () => void;
		/**
		 * Cancels this context and waits up to `ms` milliseconds for all
		 * child work registered on this context to unwind, then returns.
		 *
		 * Unlike `cancel()`, which returns synchronously and leaves parent
		 * `run` calls to await child unwinding indefinitely, this method
		 * gives the caller a bounded shutdown deadline. If a child ignores
		 * cancellation (e.g. an unadopted `setTimeout` or `fetch` without
		 * an `AbortSignal`), the returned promise still resolves after
		 * `ms` — the runaway children remain running in the background but
		 * no longer block this context's `run` from returning.
		 *
		 * The returned object reports whether the deadline was reached and
		 * how many children were still pending at that point. Callers can
		 * use `pendingChildren > 0` as a signal to log a warning, panic,
		 * or surface the issue to observability tooling.
		 *
		 * If `ms` is 0, the method still cancels the context and reports
		 * the pending count in a single microtask, without waiting.
		 *
		 * @param ms - the maximum time in milliseconds to wait for children
		 *   to unwind after cancellation
		 * @returns a Promise resolving to `{ timedOut, pendingChildren }`
		 */
		cancelWithTimeout: (
			ms: number,
		) => Promise<{ timedOut: boolean; pendingChildren: number }>;
		/** Cancels all child contexts */
		cancelAllChildren: () => void;
		/** Registers a cleanup callback to be called when this context is cancelled.
		 *  Returns a disposable that unregisters the callback when disposed. */
		onCancelled: (cleanup: Cleanup) => DisposableCallback;
		/** Throws a CancellationError if this context is cancelled */
		throwIfCancelled: () => void;
		/**
		 * Yields control to the event loop, allowing other tasks to run.
		 */
		yield: () => Promise<void>;
		/**
		 * Delays execution for the specified number of milliseconds.
		 * Respects cancellation — throws CancellationError if cancelled during the delay.
		 * @param delayMs - the number of milliseconds to delay
		 */
		delay: (delayMs: number) => Promise<void>;
		/**
		 * Executes a task within this context, awaiting it and all its children before returning.
		 * Use for sequential work inside a running task.
		 * @param task - the task to execute
		 * @param args - arguments to pass to the task
		 * @returns a promise that resolves with the task's result
		 *
		 * Note: `run` waits for **every** child launched inside `task` to finish
		 * before returning. If a child ignores cancellation (for example, an
		 * unadopted `setTimeout` or a `fetch` without an `AbortSignal`), `run`
		 * will not return even if the context is cancelled — the parent is
		 * only unblocked when the child eventually completes. Use `taskify` or
		 * respect `context.cancelledSignal` in every async operation to
		 * guarantee bounded shutdown time. If cooperative shutdown cannot be
		 * assured, use `context.cancelWithTimeout(ms)` to place a hard
		 * deadline on the wait.
		 */
		run: {
			<R = void>(task: Task<R>): Promise<R>;
			<R = void, A extends readonly any[] = []>(
				task: Task<R, A>,
				args: A,
			): Promise<R>;
		};
		/**
		 * Launches a task as a background Job in a new child context.
		 * Returns immediately with a Job handle that can be joined or cancelled.
		 * @param task - the task to execute
		 * @param options - optional child context options
		 * @returns the launched Job
		 */
		launch: {
			<R = void>(
				task: Task<R>,
				options?: (Task.ChildOptions & { args?: undefined | [] }) | undefined,
			): Task.Job<R>;
			<R = void, A extends readonly any[] = []>(
				task: Task<R, A>,
				options: (Task.ChildOptions & { args: A }) | undefined,
			): Task.Job<R>;
		};
	}

	/**
	 * Static constructors and root context for Tasks.
	 */
	export interface Constructors {
		/**
		 * Returns the root context.
		 *
		 * The root context is **isolated**: an unhandled error from a job
		 * launched directly on the root context does not cancel the root itself.
		 * This makes it safe to reuse across independent launches — one failing
		 * job cannot poison later ones.
		 */
		get rootContext(): Context;
		/**
		 * Wraps a function as a Task, providing type inference for the context parameter.
		 * @param task - the task function to wrap
		 * @returns the same task function
		 */
		fn<R = void, A extends readonly any[] = []>(task: Task<R, A>): Task<R, A>;
		/**
		 * Wraps a modifier function, providing type inference for the modifier signature.
		 * @param modifier - the modifier function to wrap
		 * @returns the same modifier function
		 *
		 * Example:
		 * ```ts
		 * const withLogging = Task.modifier((task) => async (ctx, ...args) => {
		 *   console.log('before');
		 *   const r = await ctx.run(task, args);
		 *   console.log('after');
		 *   return r;
		 * });
		 * ```
		 */
		modifier<E = never>(modifier: Task.Modifier<E>): Task.Modifier<E>;
		/** Launches a task in the root context. Equivalent to `Task.rootContext.launch`. */
		launch: Task.Context['launch'];
	}
}

/**
 * Main Task API entry point, providing static methods and the root context.
 *
 * Example:
 * ```ts
 * const t = Task.fn((ctx, name: string) => `Hello, ${name}!`);
 * Task.launch(t, { args: ['World'] });
 * ```
 * @expandType Constructors
 */
export const Task: Task.Constructors = taskModule.build();

// Re-export the whole public surface (and the advanced primitive ops) from the
// root entry point so `@rimbu/task` is a complete umbrella import.
export * from '@rimbu/task/ops';
