function createConfigDictionary<
  KT extends Config.Def.KeyType,
  KD extends KT | undefined,
  CD extends Config.Def<KT, KD>
>(
  key: KT,
  context: Config.Context<KT, KD>,
  configDefinition: CD
): Config.Dictionary<CD> {
  const defaultKey: Config.Def.KeyType | undefined = context.defaultKey;

  if (Array.isArray(configDefinition)) {
    const [item] = configDefinition;

    if (undefined === item || configDefinition.length > 1) {
      throw Error('array should have exactly one item');
    }

    const NONE = Symbol();

    let value: Config.Dictionary<CD> | typeof NONE = NONE;

    if (key in item) {
      value = (item as any)[key];
    } else if (undefined !== defaultKey) {
      if (defaultKey in item) {
        value = (item as any)[defaultKey];
      }
    }

    if (NONE === value) {
      throw Error('could not find value');
    }

    return value;
  }

  if (configDefinition instanceof Function) {
    return ((...args: any[]) => {
      const createdDefinition = configDefinition(...args);
      const createdConfig = createConfigDictionary(
        key,
        context,
        createdDefinition
      );

      return createdConfig;
    }) as Config.Dictionary<CD>;
  }

  const createdConfig = {} as Config.Dictionary<CD>;

  for (const nestedKey in configDefinition) {
    const nestedDefinition = configDefinition[nestedKey] as Config.Def<KT, KD>;

    createdConfig[nestedKey] = createConfigDictionary(
      key,
      context,
      nestedDefinition
    );
  }

  Object.freeze(createdConfig);

  return createdConfig;
}

function compileConfigDefinition<
  KT extends Config.Def.KeyType,
  KD extends KT | undefined,
  CD extends Config.Def<KT, KD>
>(
  context: Config.Context<KT, KD>,
  createConfigDefinition: (env: { key: KT }) => CD
): Config<KT, KD, CD> {
  const result = {} as Config<KT, KD, CD>;

  for (const key of context.keys) {
    (result as any)[key] = createConfigDictionary(
      key,
      context,
      createConfigDefinition({ key })
    );
  }

  Object.freeze(result);

  return result;
}

/**
 * A configuration containing a config dictionary of the given `CD` config definition type for each of the `KT` key types.
 * @typeparam KT - the allowed key values
 * @typeparam KD - the default key value (undefined if none)
 * @typeparam CD - the config definition type
 */
export type Config<
  KT extends Config.Def.KeyType,
  KD extends KT | undefined,
  CD extends Config.Def<KT, KD>
> = {
  readonly [K in KT]: Config.Dictionary<CD>;
};

/**
 * Namespace containing supporting types and creation methods for `Config` instances.
 */
export namespace Config {
  /**
   * The type defining allows config dictionary shapes for a given key specification.
   * @typeparam KT - the allowed key values
   * @typeparam KD - the default key value (undefined if none)
   */
  export type Def<KT extends Config.Def.KeyType, KD extends KT | undefined> =
    | Config.Def.Values<KT, KD>
    | Config.Def.InterpolatedValues<KT, KD>
    | Config.Def.Nested<KT, KD>;

  /**
   * Contains the Config definition types
   */
  export namespace Def {
    /**
     * The allowed key types (object keys)
     */
    export type KeyType = string | number | symbol;

    /**
     * Function type defining config creation based on an environment.
     * @typeparam KT - the allowed key values
     * @typeparam R - the result type
     */
    export type FromEnv<KT extends Config.Def.KeyType, R> = (env: {
      key: KT;
    }) => R;

    /**
     * Config definition defining a single-item tuple containing an object having the required keys.
     * @typeparam KT - the allowed key values
     * @typeparam KD - the default key value (undefined if none)
     * @typeparam Res - the value type
     */
    export type Values<
      KT extends Config.Def.KeyType,
      KD extends KT | undefined,
      Res = any
    > = [
      KD extends undefined
        ? { readonly [K in KT]: Res }
        : {
            readonly [K in Exclude<KD, undefined>]: Res;
          } & { readonly [K in Exclude<KT, KD>]?: Res }
    ];

    /**
     * Config definition defining a function taking some arguments and returning a `Values` definition.
     * @typeparam KT - the allowed key values
     * @typeparam KD - the default key value (undefined if none)
     * @typeparam A - type defining the list of arguments
     */
    export type InterpolatedValues<
      KT extends Config.Def.KeyType,
      KD extends KT | undefined,
      A extends readonly unknown[] = readonly any[]
    > = (...args: A) => Config.Def.Values<KT, KD>;

    /**
     * Config definition defining a nested configuration where each key contains its own Config definition.
     * @typeparam KT - the allowed key values
     * @typeparam KD - the default key value (undefined if none)
     */
    export type Nested<
      KT extends Config.Def.KeyType,
      KD extends KT | undefined
    > = {
      readonly [K: string]: Config.Def<KT, KD>;
    };
  }

  /**
   * A Configuration dictionary containing the type after compilation of a config definition.
   * @typeparam CD - the type of the source configuration definition
   */
  export type Dictionary<CD extends Config.Def<any, any>> =
    CD extends Config.Def.Values<any, any, infer Res>
      ? Res
      : CD extends Config.Def.InterpolatedValues<any, any, infer A>
      ? (...args: A) => Dictionary<ReturnType<CD>>
      : {
          readonly [K in keyof CD]: CD[K] extends Config.Def<any, any>
            ? Config.Dictionary<CD[K]>
            : never;
        };

  /**
   * A Context instance used to specify the allowed config keys and to create config instances.
   * @typeparam KT - the allowed key values
   * @typeparam KD - the default key value (undefined if none)
   */
  export interface Context<
    KT extends Config.Def.KeyType,
    KD extends KT | undefined
  > {
    /**
     * Returns an array containing the dictionary keys.
     */
    readonly keys: KT[];
    /**
     * Returns the default key if present.
     */
    readonly defaultKey: KD;
    /**
     * A utility to get the union type of the keys in this key specification.
     * @note serves as a type helper, returns undefined
     */
    readonly _keyType: KT;
    /**
     * Returns a config object based on the given config definition that can be used at runtime.
     * @param configDefinition - the config definition to use as a source
     */
    compile<CD extends Config.Def<KT, KD>>(
      configDefinition: CD
    ): Config<KT, KD, CD>;
    /**
     * Returns a config object based on the given `createConfigDefinition` function.
     * @param createConfigDefinition - a function taking an environment containing a config key and returning the config definition for that specific key
     */
    compileEnv<CD extends Config.Def<KT, KD>>(
      createConfigDefinition: Config.Def.FromEnv<KT, CD>
    ): Config<KT, KD, CD>;
    /**
     * A utility function that can be used to type-check a given config definition according to the context.
     * @param configDefinition - the config definition to check
     */
    define<CD extends Config.Def<KT, KD>>(configDefinition: CD): CD;
  }

  /**
   * Returns a config context object based on the given keys and options.
   * @param keys - the config keys that are allowed at the leavves of a config definition
   * @param options - (optional) an object containing:
   * - defaultKey: (optional) the key that is required for all objects that can be used as default, making the other keys optional
   */
  export function context<
    const KT extends Config.Def.KeyType,
    const KD extends NoInfer<KT | undefined> = undefined
  >(keys: KT[], options: { defaultKey?: KD } = {}): Config.Context<KT, KD> {
    const { defaultKey } = options;

    const result: Config.Context<KT, KD> = {
      keys,
      defaultKey: defaultKey as KD,
      _keyType: undefined as any,
      compile: (configDefinition) =>
        compileConfigDefinition(result, () => configDefinition),
      compileEnv: (createConfigDefinition) =>
        compileConfigDefinition(result, createConfigDefinition),
      define: (configDefinition) => configDefinition,
    };

    return result;
  }

  /**
   * A utility type to get the config dictionary type for a config instance.
   */
  export type DictionaryType<CI extends Config<any, any, any>> = CI[keyof CI];
}
