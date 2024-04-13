export type Cond<T, Res> = [
  pred: T | boolean | ((value: T) => boolean),
  result: Res
];

export namespace Cond {
  export type Result<CS extends Cond<any, any>[]> = CS[number][1];
}

export function cond<T, CS extends Cond<T, any>[]>(
  ...conds: CS & Cond<T, any>[]
): (inputValue: T) => [Cond.Result<CS>] {
  return (inputValue) => {
    for (const condTuple of conds) {
      const [cond, result] = condTuple;

      if (typeof cond === 'boolean') {
        if (typeof inputValue === 'boolean') {
          if (inputValue !== cond) {
            continue;
          }
        } else if (!cond) {
          continue;
        }
      } else if (cond instanceof Function) {
        const result = cond(inputValue);

        if (!result) {
          continue;
        }
      } else if (!Object.is(cond, inputValue)) {
        continue;
      }

      return [result];
    }

    throw Error(
      `none of the given cases match the input value ${inputValue}. If you want to have a fallback value, add a final case like so: \`[true, <value>]\``
    );
  };
}

export function condFn<T, CS extends Cond<T, unknown>[]>(
  createConds: (value: T) => CS
): (inputValue: T) => [Cond.Result<CS>] {
  return (inputValue) => {
    const conds = createConds(inputValue);

    return cond(...conds)(inputValue);
  };
}
