---
severity: medium
impact: package
complexity: medium
pass: tests
package: channel
confidence: medium
effort_estimate: 1d
title: "Channel concurrency primitives lack high-contention / interleaving stress tests"
---

## Summary
`@rimbu/channel` provides hand-rolled synchronization primitives (`Semaphore`, `Mutex`, `WaitGroup`, `Channel` itself) whose correctness is entirely defined by concurrent interleaving semantics. The existing runtime tests (`semaphore.test.ts`, `mutex.test.ts`, `wait-group.test.ts`, `channel.test.ts`) exercise basic/sequential behavior but do not stress concurrent `acquire`/`release`, weighted semaphore fairness, or many-sender/many-receiver channel races. Such tests are the highest-value coverage for this package and are currently absent, so subtle ordering/leak bugs would not be caught.

## Evidence
- `packages/channel/test/semaphore.test.ts` — covers basic `acquire`/`release`/errors; no test spawns N concurrent `acquire` calls then staggered `release`s to assert the semaphore count never exceeds `maxSize` and all waiters eventually proceed.
- `packages/channel/test/mutex.test.ts` / `wait-group.test.ts` — single-flight / basic sequences only.
- `packages/channel/test/channel.test.ts` — covers `send`/`receive`/`select` happy paths; no test drives many concurrent `send`+`receive` against a small-capacity/buffered channel to verify FIFO delivery and no lost messages, nor `select` where all channels exhaust (see `channel-select-aggregate-error.md`).
- The semaphore's abort/timeout reclaim path (`semaphore-impl.ts:56-69`, the `delete`/`release(weight)` branch) is non-trivial and untested under real contention.

## Impact
Concurrency bugs (count leaks, lost wakeups, unfair ordering, double-release) would pass CI. This is the riskiest correctness area of the package.

## Recommendation
Add stress/property tests: (1) spawn K concurrent `semaphore.acquire()` then `release` in a loop, asserting `#currentSize` never exceeds `maxSize` and total acquisitions == total releases; (2) concurrent mutex lock/unlock asserting mutual exclusion; (3) a buffered channel with M senders × N receivers asserting no message loss and FIFO order; (4) `Channel.select` with all channels already exhausted (verifies error handling). Use deterministic scheduling (e.g. `setTimeout(0)` interleaving) since true races are hard to assert, but at least exercise the multi-waiter paths.
