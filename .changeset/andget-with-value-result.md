---
'@rimbu/bimap': major
'@rimbu/bimultimap': major
'@rimbu/collection-types': major
'@rimbu/common': major
'@rimbu/core': major
'@rimbu/hashed': major
'@rimbu/multimap': major
'@rimbu/ordered': major
'@rimbu/proximity': major
'@rimbu/sorted': major
'@rimbu/table': major
---

Converted all immutable `*AndGet` methods to return the shared `WithValueResult<R, V>` 3-tuple `[result, value, hasValue]` instead of the previous `[collection, value] | undefined` shape.

`hasValue` (the 3rd element) now means **"the relevant key/value was present, so a value is returned"** — it does NOT indicate whether the collection changed. When an operation is a no-op (e.g. an `update` that yields the same value, or re-setting an already-present identical BiMap entry), `hasValue` is still `true` and the previous value/entry is returned, while the `result` is the unchanged collection. To detect whether the collection actually changed, compare `result[0] === this` (immutable structures return `this` on a no-op).

Affected methods:
- `@rimbu/bimap`: `setAndGet`, `addEntryAndGet`, `removeKeyAndGet`, `removeValueAndGet`, `updateValueAtKeyAndGet`, `updateKeyAtValueAndGet`
- `@rimbu/hashed` / `sorted` / `ordered` / `proximity` / `collection-types`: `removeKeyAndGet`, `updateAtAndGet`
- `@rimbu/multimap`: `removeKeyAndGet`
- `@rimbu/table`: `removeAndGet`, `removeRowAndGet`
