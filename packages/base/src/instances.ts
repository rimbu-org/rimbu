export const instanceTypeTag = Symbol('instanceType');

export const immutableInstanceIndicator = Symbol('ImmutableInstance');

export const builderInstanceIndicator = Symbol('BuilderInstance');

export function isImmutableInstance(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj?.[instanceTypeTag] === immutableInstanceIndicator
  );
}

export function isBuilderInstance(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj?.[instanceTypeTag] === builderInstanceIndicator
  );
}
