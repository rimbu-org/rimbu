---
severity: medium
impact: package
complexity: small
pass: api
package: channel
confidence: high
effort_estimate: 0.5d
status: solved
title: "Channel.select/selectCase leak a raw AggregateError and mislabel all-exhausted as TimeoutError"
---

## Summary
`Channel.select` and `Channel.selectCase` await `Promise.any` over the channel receivers. When every channel rejects, `Promise.any` rejects with an `AggregateError`. The error handling then:
- with no `recover`: re-throws the raw `AggregateError` (NOT a `ChannelError`), breaking the documented contract that channel operations surface `Channel.Error` values;
- with `recover`: maps the `AggregateError` to `ChannelError.TimeoutError`, which is semantically wrong when the real cause is exhaustion (`ChannelExhaustedError`) rather than a timeout.

## Evidence
`packages/channel/src/channel.ts:347-359` (and the identical pattern at `:409-423` for `selectCase`):
```ts
} catch (err) {
  if (recover !== undefined) {
    if (ChannelError.isChannelError(err)) {
      return recover(err);
    } else if (err instanceof AggregateError) {
      return recover(new ChannelError.TimeoutError());   // wrong cause
    }
  }
  throw err;   // raw AggregateError escapes here
}
```
`ChannelError.isChannelError` only matches `ChannelError` subtypes, so the `AggregateError` from `Promise.any` is not caught as a channel error.

## Impact
Callers relying on `try/catch` around `Channel.select` seeing a `ChannelError`, or on `recover` returning the genuine failure, get a misleading or non-`ChannelError` exception (an opaque `AggregateError` or a spurious `TimeoutError`).

## Recommendation
Introduce a dedicated `ChannelError` for the "all channels failed" case (e.g. a new aggregate/subtype), populate it from the underlying per-channel `ChannelError`s, and surface that consistently both when `recover` is and isn't supplied. Do not coerce exhaustion into `TimeoutError`.

## Resolution
Added `ChannelError.SelectError`, which stores the underlying selection failures. Both `select` and `selectCase` convert `Promise.any` aggregate failures to this error before recovery or rethrowing, including all-exhausted cases.
