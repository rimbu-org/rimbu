/**
 * @packageDocumentation
 *
 * The `@rimbu/typical` package is a type‑level library that offers numeric and string
 * operations on TypeScript literal types, enabling advanced compile‑time constraints
 * and computed literal results.<br/>
 * Use it primarily in type‑heavy or experimental code to express rules like “only numbers
 * greater than N” or “strings containing a pattern”, while being mindful that it relies
 * on advanced type system features that may evolve between TypeScript versions.<br/>
 * See the package README for motivation, examples, and guidance on production use.
 */

import type * as U from './utils.ts';
import type * as Str from './str.ts';
import type * as StrNum from './strnum.ts';
import type * as Num from './num.ts';

export type { U, Str, StrNum, Num };
