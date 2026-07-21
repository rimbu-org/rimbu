---
severity: medium
impact: package
complexity: small
pass: tests
package: task
confidence: high
effort_estimate: 1d
title: "Task package has no type-level (test-d) tests despite heavily generic public types"
---

## Summary
The `task` package exposes very complex generic types — `Task<R, A>`, `Task.Chain<RS, A>`, `Task.Modifier<E>`, `Task.Job<R>`, `Task.Context`, `Task.ChildOptions` — yet `packages/task/` contains **no `test-d/` directory** (unlike every other reviewed package: `graph`, `table`, `channel`, `proximity`, `deep` all have `test-d/`). There is no compile-time verification that `chain`, `race`/`all`/`any`/`allSettled`, `launch` args, `Job.join`/`recover`, or `Modifier` composition preserve their (often intricate) type parameters.

## Evidence
- `ls packages/task/` shows only `src/`, `test/`, `test-d/` is absent (confirmed by directory listing).
- `packages/task/src/task.ts` — `Task.Chain` (`:69-78`) relies on recursive `_Prepend`/`RRS` machinery and is a prime candidate for regression; `Task.Modifier` (`:95-97`) and `Task.Job.join` (`recover` overload) are also type-sensitive.
- The companion `ops`/`modifiers`/`utils` public sub-paths likewise have no type tests.

## Impact
Type regressions in the task composition API (e.g. a `chain` step receiving the wrong argument type, or a `Modifier` incorrectly widening `R`) would not be caught by the type-level test gate. High-value, intricate generics are unguarded.

## Recommendation
Add `packages/task/test-d/` with `expectTypeOf` cases covering: `Task.fn`/`Task.launch` arg inference, `chain` argument/result threading, `race`/`all`/`any`/`allSettled` result unions, `withTimeout`/`withRetry`/`catchError` modifier result types, and `Job.join` `recover` overloads. Mirror the depth of `deep.test-d.ts` / `proximity-map.test-d.ts`.
