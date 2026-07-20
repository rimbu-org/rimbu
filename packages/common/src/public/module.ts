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
 * import { Module } from '@rimbu/common/module';
 * interface Database { query(sql: string): unknown }
 * class DatabaseImpl implements Database { query(sql: string) { return sql; } }
 * interface Logger { log(msg: string): void }
 * class LoggerImpl implements Logger { log(msg: string) { console.log(msg); } }
 * class API { constructor(env: string, db: Database, logger: Logger) {} }
 * interface AppServices extends Record<string, any> {
 *   database: Database;
 *   logger: Logger;
 *   api: API;
 * }
 *
 * const appModule = Module.create<AppServices>((m) => ({
 *   database: Module.lazy(() => new DatabaseImpl()),
 *   logger: Module.single(() => new LoggerImpl()),
 *   api: Module.lazy(() => null as unknown as API),
 * }) as any);
 *
 * const services = appModule.build();
 * services.api; // => API instance with injected dependencies
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

const ModuleSymbol = Symbol('Module');

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
		[K in keyof MD]: Module.DefinitionEntry<MD[K]>;
	};

	export type DefinitionEntry<T> =
		| T
		| { [ModuleSymbol]: true; type: 'getter'; value: () => T };

	/**
	 * Extracts the Instance type from a Module type.
	 * @typeparam M - the Module type to extract the instance from
	 * @example
	 * ```ts
	 * import { Module } from '@rimbu/common/module';
	 * interface Database { query(sql: string): unknown }
	 * interface Logger { log(msg: string): void }
	 * interface API { env: string }
	 * interface AppServices extends Record<string, any> {
	 *   database: Database;
	 *   logger: Logger;
	 *   api: API;
	 * }
	 * const appModule = Module.create<AppServices>(() => ({
	 *   database: Module.lazy(() => null as unknown as Database),
	 *   logger: Module.single(() => null as unknown as Logger),
	 *   api: Module.lazy(() => null as unknown as API),
	 * }) as any);
	 * const appModuleAny: any = appModule;
	 * type Services = Module.InstanceType<typeof appModuleAny>; // => AppServices
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
	 * import { Module } from '@rimbu/common/module';
	 * interface Database { query(sql: string): unknown }
	 * interface Logger { log(msg: string): void }
	 * interface AppServices extends Record<string, any> {
	 *   database: Database;
	 *   logger: Logger;
	 * }
	 * type Selected = Module.Select<AppServices, 'database' | 'logger'>;
	 * // => { database: Database; logger: Logger; }
	 * ```
	 */
	export type Select<M extends Module.Instance, K extends keyof M> = {} & {
		[P in K]: M[P];
	};

	/**
	 * Helper to create a partial module definition function.
	 * @typeparam MP - the partial module type with `defines` and optional `requires` fields
	 * @param getDefinition - a function that receives the module instance and returns the definition for `defines`
	 * @returns the same `getDefinition` function (useful for typing helpers)
	 */
	export function createPartial<
		MP extends { defines: Module.Instance; requires?: Module.Instance },
	>(
		getDefinition: (
			module: MP['defines'] & MP['requires'],
		) => Module.Definition<MP['defines']>,
	): (
		module: MP['defines'] & MP['requires'],
	) => Module.Definition<MP['defines']> {
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
	 * import { Module } from '@rimbu/common/module';
	 * interface Database { query(sql: string): unknown }
	 * class DatabaseImpl implements Database { query(sql: string) { return sql; } }
	 * interface Logger { log(msg: string): void }
	 * class LoggerImpl implements Logger { log(msg: string) { console.log(msg); } }
	 * class API { constructor(env: string, db: Database, logger: Logger) {} }
	 * interface AppServices extends Record<string, any> {
	 *   database: Database;
	 *   logger: Logger;
	 *   api: API;
	 * }
	 *
	 * const appModule = Module.create<AppServices>((m) => ({
	 *   database: Module.lazy(() => new DatabaseImpl()),
	 *   logger: Module.single(() => new LoggerImpl()),
	 *   api: Module.lazy(() => null as unknown as API),
	 * }) as any);
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
					const entry = definition[key];

					if (
						typeof entry === 'object' &&
						entry !== null &&
						ModuleSymbol in entry
					) {
						if (entry.type === 'getter') {
							Object.defineProperty(target, key, {
								configurable: false,
								enumerable: true,
								get: entry.value,
							});
							continue;
						}
					}

					Object.defineProperty(target, key, {
						configurable: false,
						enumerable: true,
						value: entry,
					});
				}

				return Object.freeze(target);
			},
		};
	}

	/**
	 * Creates a singleton instance immediately and returns a factory that always returns it.
	 * @typeparam T - the created instance type
	 * @param creator - a function that creates the instance
	 * @returns a `Module.DefinitionEntry` factory that always returns the same instance
	 */
	export function single<T>(creator: () => T): Module.DefinitionEntry<() => T> {
		const instance = creator();
		return () => instance;
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
	 * import { Module } from '@rimbu/common/module';
	 * interface Database { query(sql: string): unknown }
	 * class DatabaseImpl implements Database { query(sql: string) { return sql; } }
	 * const createDB = () => {
	 *   console.log('Creating database...');
	 *   return new DatabaseImpl();
	 * };
	 * const dbFactory = Module.lazy(createDB) as unknown as () => DatabaseImpl;
	 * // 'Creating database...' is not logged yet
	 * const db1 = dbFactory(); // 'Creating database...' is logged
	 * const db2 = dbFactory(); // 'Creating database...' is not logged again
	 * console.log(db1 === db2); // => true
	 * ```
	 */
	export function lazyGetter<C extends () => any>(
		creator: C,
	): Module.DefinitionEntry<ReturnType<C>> {
		const uninitialized = Symbol();
		let instance: typeof uninitialized | ReturnType<C> = uninitialized;

		return {
			[ModuleSymbol]: true,
			type: 'getter',
			value: () => {
				if (uninitialized === instance) {
					instance = creator();
				}
				return instance as ReturnType<C>;
			},
		};
	}

	/**
	 * Converts a creator into a lazy function returning a cached instance (invoked on first call).
	 * @typeparam C - the creator function type
	 * @param creator - a function that creates the instance
	 * @returns a function with the same signature as `creator` that returns a cached instance
	 */
	export function lazy<C extends () => any>(
		creator: C,
	): Module.DefinitionEntry<C> {
		const uninitialized = Symbol();
		let instance: typeof uninitialized | ReturnType<C> = uninitialized;

		return (() => {
			if (uninitialized === instance) {
				instance = creator();
			}
			return instance as ReturnType<C>;
		}) as C;
	}
}
