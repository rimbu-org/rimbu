function createConfigInstance<
  KT extends Config.Def.KeyType,
  KD extends KT | undefined,
  CD extends Config.Def<KT, KD>
>(
  key: KT,
  context: Config.Context<KT, KD>,
  configDefinition: CD
): Config.Instance<CD> {
  const defaultKey: Config.Def.KeyType | undefined = context.defaultKey;

  if (Array.isArray(configDefinition)) {
    const [item] = configDefinition;

    if (undefined === item || configDefinition.length > 1) {
      throw Error('array should have exactly one item');
    }

    const NONE = Symbol();

    let value: Config.Instance<CD> | typeof NONE = NONE;

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
      const instance = configDefinition(...args);
      const createdConfig = createConfigInstance(key, context, instance);

      return createdConfig;
    }) as Config.Instance<CD>;
  }

  const createdConfig = {} as Config.Instance<CD>;

  for (const nestedKey in configDefinition) {
    const nestedDefinition = configDefinition[nestedKey] as Config.Def<KT, KD>;

    createdConfig[nestedKey] = createConfigInstance(
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
    (result as any)[key] = createConfigInstance(
      key,
      context,
      createConfigDefinition({ key })
    );
  }

  Object.freeze(result);

  return result;
}

export type Config<
  KT extends Config.Def.KeyType,
  KD extends KT | undefined,
  CD extends Config.Def<KT, KD>
> = {
  readonly [K in KT]: Config.Instance<CD>;
};

/**
 * Namespace containing supporting types and creation methods for `Config` instances.
 */
export namespace Config {
  /**
   * The type defining allows config dictionary shapes for a given key specification.
   */
  export type Def<KT extends Config.Def.KeyType, KD extends KT | undefined> =
    | Config.Def.Values<KT, KD>
    | Config.Def.InterpolatedValues<KT, KD>
    | Config.Def.Nested<KT, KD>;

  export namespace Def {
    export type KeyType = string | number | symbol;

    export type FromEnv<KT extends Config.Def.KeyType, R> = (env: {
      key: KT;
    }) => R;

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

    export type InterpolatedValues<
      KT extends Config.Def.KeyType,
      KD extends KT | undefined,
      A extends readonly unknown[] = readonly any[]
    > = (...args: A) => Config.Def.Values<KT, KD>;

    export type Nested<
      KT extends Config.Def.KeyType,
      KD extends KT | undefined
    > = {
      readonly [K: string]: Config.Def<KT, KD>;
    };
  }

  /**
   * A Configuration dictionary containing, for each defined key in the key specification, the resulting
   * configuration instance.
   * @typeparam CD - the type of the source configuration definition
   */
  export type Instance<CD extends Config.Def<any, any>> =
    CD extends Config.Def.Values<any, any, infer Res>
      ? Res
      : CD extends Config.Def.InterpolatedValues<any, any, infer A>
      ? (...args: A) => Instance<ReturnType<CD>>
      : {
          readonly [K in keyof CD]: CD[K] extends Config.Def<any, any>
            ? Config.Instance<CD[K]>
            : never;
        };

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
     * @note server as a type helper, returns undefined
     */
    readonly _keyType: KT;
    compile<CD extends Config.Def<KT, KD>>(
      configDefinition: CD
    ): Config<KT, KD, CD>;
    compileEnv<CD extends Config.Def<KT, KD>>(
      createConfigDefinition: Config.Def.FromEnv<KT, CD>
    ): Config<KT, KD, CD>;
    define<CD extends Config.Def<KT, KD>>(configDefinition: CD): CD;
  }

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

  export type InstanceType<CI extends Config<any, any, any>> = CI[keyof CI];
}
