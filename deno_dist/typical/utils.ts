/**
 * If A extends B, returns Then (default true) or else Else (default false)
 * @example
 * Extends<1, number> => true
 * Extends<1, string> => false
 * Extends<1, number, 'a', 'b'> => 'a'
 * Extends<1, string, 'a', 'b'> => 'b'
 */
export type Extends<A, B, Then = true, Else = false> = A extends B
  ? Then
  : Else;

/**
 * If A does not extend B, returns Then (default true) or else Else (default false)
 * @example
 * Extends<1, number> => true
 * Extends<1, string> => false
 * Extends<1, number, 'a', 'b'> => 'a'
 * Extends<1, string, 'a', 'b'> => 'b'
 */
export type NotExtends<A, B, Then = true, Else = false> = A extends B
  ? Else
  : Then;

/**
 * Returns never if the given type is false, otherwise unknown.
 * @example
 * Check<IsEven<4>> => unknown
 * Check<IsEven<5>> => never
 */
export type Check<V> = V extends false ? never : unknown;

/**
 * Returns never if the given type is false, otherwise true.
 * @example
 * Validate<IsEven<4>> => true
 * Validate<IsEven<5>> => never
 */
export type Validate<V> = V extends false ? never : true;

/**
 * Returns false is the given type is false, true otherwise.
 * @example
 * Pred<false> => false
 * Pred<number> => true
 * Pred<true> => true
 */
export type Pred<V> = V extends false ? false : true;

/**
 * Returns true if the input type is false, and false if the input type is true.
 * @example
 * Not<true> => false
 * Not<false> => true
 * Not<boolean> => never
 */
export type Not<V extends boolean> = boolean extends V
  ? never
  : V extends true
  ? false
  : true;
