/**
 * A simple, lightweight but powerful dependency injection mechanism.
 *
 * A Module defines a set of dependencies and how to create instances of those dependencies.
 * When building a Module, the defined dependencies are injected and accessible as properties
 * on the resulting instance.
 *
 * @typeparam MI - the Module Instance type, a Record of all available dependencies
 *
 * @example
 * ```ts
 * interface AppServices {
 *   database: Database;
 *   logger: Logger;
 *   api: API;
 * }
 *
 * const appModule = Module.create<AppServices>((m) => ({
 *   database: Module.lazy(() => new Database()),
 *   logger: Module.single(() => new Logger()),
 *   createaApi: Module.factory((env: string) => new API(env, m.database, m.logger)),
 * }));
 *
 * const services = appModule.build();
 * services.createApi("PROD"); // => API instance with injected dependencies
 * ```
 */
export interface Module<MI extends Module.Instance> {
	/**
	 * Returns the definition of all dependencies for this module.
	 * @param module - a reference to the module instance being built, allowing circular dependency resolution
	 * @returns an object where each key maps to a factory function that creates the dependency
	 */
	readonly getDefinition: (module: MI) => Module.Definition<MI>;

	/**
	 * Builds and returns an instance of the Module with all dependencies resolved and injected.
	 * Each dependency is created as a lazy property using Object.defineProperty.
	 * @returns the built Module instance with all dependencies available as properties
	 */
	build<TI = MI>(): MI extends TI ? TI : never;
}

export namespace Module {
	/**
	 * A module instance is a record of available dependencies.
	 */
	export type Instance = Record<string, any>;

	/**
	 * A module definition is a mapping of dependency names to factory functions.
	 * Each key in the definition corresponds to a dependency, and the value is a factory function
	 * that creates or retrieves the dependency instance.
	 *
	 * @typeparam MD - the module instance type, defining available dependencies
	 */
	export type Definition<MD extends Instance> = {
		[K in keyof MD]: () => MD[K];
	};

	/**
	 * Extracts the Instance type from a Module type.
	 * @typeparam M - the Module type to extract the instance from
	 * @example
	 * ```ts
	 * type Services = Module.InstanceType<typeof appModule>; // => AppServices
	 * ```
	 */
	export type InstanceType<M extends Module<Module.Instance>> =
		M extends Module<infer MI> ? MI : never;

	/**
	 * Selects a subset of dependencies from a module instance.
	 * @typeparam M - the module instance type
	 * @typeparam K - the keys to select
	 * @example
	 * ```ts
	 * type Selected = Module.Select<AppServices, 'database' | 'logger'>;
	 * // => { database: Database; logger: Logger; }
	 * ```
	 */
	export type Select<M extends Module.Instance, K extends keyof M> = {} & {
		[P in K]: M[P];
	};

	export function createPartial<MT extends Module.Instance, MI extends MT = MT>(
		getDefinition: (module: MI) => Module.Definition<MT>,
	): (module: MI) => Module.Definition<MT> {
		return getDefinition;
	}

	/**
	 * Creates a new Module with the given dependency definition.
	 *
	 * The dependency functions in the definition can reference other dependencies
	 * on the module instance being built, enabling powerful circular dependency resolution.
	 *
	 * @typeparam MI - the Module Instance type
	 * @param getDefinition - a function that receives a reference to the module instance
	 *                        and returns an object mapping dependency names to factory functions
	 * @returns a new Module instance
	 * @example
	 * ```ts
	 * interface AppServices {
	 *   database: Database;
	 *   logger: Logger;
	 *   api: API;
	 * }
	 *
	 * const appModule = Module.create<AppServices>((m) => ({
	 *   database: Module.lazy(() => new Database()),
	 *   logger: Module.single(() => new Logger()),
	 *   createaApi: Module.factory((env: string) => new API(env, m.database, m.logger)),
	 * }));
	 * ```
	 */
	export function create<MI extends Module.Instance = never>(
		getDefinition: (module: MI) => Module.Definition<MI>,
	): Module<MI> {
		return {
			getDefinition,
			build: (): any => {
				const target = {} as MI;

				const definition = getDefinition(target);

				for (const key in definition) {
					Object.defineProperty(target, key, {
						configurable: false,
						enumerable: true,
						get: definition[key],
					});
				}

				return target;
			},
		};
	}

	/**
	 * Converts a creator function into a singleton factory.
	 *
	 * The creator function is invoked immediately, and the resulting instance is cached.
	 * All subsequent calls to the returned function return the same cached instance.
	 *
	 * @typeparam C - the creator function type
	 * @param creator - a function that creates the instance
	 * @returns a function with the same signature as creator that always returns the same instance
	 * @example
	 * ```ts
	 * const createDB = () => new Database();
	 * const dbFactory = Module.single(createDB);
	 * const db1 = dbFactory();
	 * const db2 = dbFactory();
	 * console.log(db1 === db2); // => true
	 * ```
	 */
	export function single<C extends () => any>(creator: C): C {
		const instance = creator();
		return constant(instance) as C;
	}

	/**
	 * Converts a creator function into a lazy singleton factory.
	 *
	 * Unlike `single`, the creator function is not invoked immediately. Instead, it is invoked
	 * on the first call to the returned function. The resulting instance is then cached,
	 * and all subsequent calls return the same cached instance.
	 *
	 * @typeparam C - the creator function type
	 * @param creator - a function that creates the instance
	 * @returns a function with the same signature as creator that always returns the same instance
	 * @example
	 * ```ts
	 * const createDB = () => {
	 *   console.log('Creating database...');
	 *   return new Database();
	 * };
	 * const dbFactory = Module.lazy(createDB);
	 * // 'Creating database...' is not logged yet
	 * const db1 = dbFactory(); // 'Creating database...' is logged
	 * const db2 = dbFactory(); // 'Creating database...' is not logged again
	 * console.log(db1 === db2); // => true
	 * ```
	 */
	export function lazy<C extends () => any>(creator: C): C {
		const uninitialized = Symbol();
		let instance: ReturnType<C> | typeof uninitialized = uninitialized;

		return (() => {
			if (instance === uninitialized) {
				instance = creator();
			}
			return instance;
		}) as C;
	}

	/**
	 * Wraps a creator function (typically a constructor) to return itself.
	 *
	 * This utility is useful for dependency definitions where you want to inject
	 * a creator function itself (rather than calling it to get an instance).
	 *
	 * @typeparam C - the creator function type
	 * @param creator - the creator function or constructor
	 * @returns a function that when called returns the original creator function
	 * @example
	 * ```ts
	 * interface AppServices {
	 *   database: Database;
	 *   logger: Logger;
	 *   api: API;
	 * }
	 *
	 * const appModule = Module.create<AppServices>((m) => ({
	 *   database: Module.lazy(() => new Database()),
	 *   logger: Module.single(() => new Logger()),
	 *   createaApi: Module.factory((env: string) => new API(env, m.database, m.logger)),
	 * }));
	 *
	 * appModule.createApi("PROD"); // => API instance with injected dependencies
	 * ```
	 */
	export function factory<C extends (...args: any[]) => any>(
		creator: C,
	): () => C {
		return () => creator;
	}

	export function lazyFactory<C extends () => any>(creator: C): () => C {
		const uninitialized = Symbol();
		let instance: ReturnType<C> | typeof uninitialized = uninitialized;

		return () =>
			(() => {
				if (instance === uninitialized) {
					instance = creator();
				}
				return instance;
			}) as C;
	}

	/**
	 * Creates a constant factory that always returns the same value.
	 *
	 * @typeparam T - the type of the constant value
	 * @param value - the constant value to return
	 * @returns a function that always returns the provided value
	 * @example
	 * ```ts
	 * const appModule = Module.create<{ env: string }>(() => ({
	 *  env: Module.constant('production'),
	 * }));
	 * ```
	 */
	export function constant<T>(value: T): () => T {
		return () => value;
	}

	export class EagerSelfDependencyError extends Error {
		constructor(name: string) {
			super(
				`Eager self-dependency detected in module while accessing property ${name}.`,
			);
		}
	}

	export class CircularDependencyError extends Error {
		constructor(name: string) {
			super(
				`Circular dependency detected in module while accessing property ${name}.`,
			);
		}
	}
}
