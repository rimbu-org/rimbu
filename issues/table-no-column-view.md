---
severity: low
impact: package
complexity: small
pass: api
package: table
confidence: medium
effort_estimate: 0.5d
title: "Table exposes only row-oriented access; no column view"
---

## Summary
`Table` is a row × column structure, but the entire public surface is row-oriented: `rowMap`, `rowAt`, `getRow` (builder), `streamRows`, `hasRowKey`, `removeRow(s)`. There is no symmetric column-oriented access (`columnMap`, `getColumn`, `streamColumns`, `hasColumnKey`, `removeColumn(s)`), even though the internal storage keeps nested maps and a column context exists.

## Evidence
- `packages/table/src/internal/types.ts` — `VariantTableBase`/`TableBase` declare `rowMap`, `rowAt`, `getRow`, `streamRows`, `hasRowKey`, `removeRow`, `removeRows`, `removeEntries` (entries remove both), but no column equivalents.
- `packages/table/src/internal/context-factory.ts` keeps both `rowContext` and `columnContext`, so a column view is feasible but not exposed.

## Impact
Users who naturally query a `Table` by column (e.g. "all values in column C") must iterate rows and index by column manually. This is a completeness/ergonomics gap relative to the row API.

## Recommendation
Either (a) add a column-oriented API (`columnMap`, `getColumn`, `streamColumns`, `hasColumnKey`, `removeColumn`/`removeColumns`) consistent with the existing row API and its `NonEmpty`/builder variants, or (b) document explicitly that `Table` is deliberately row-primary so consumers aren't surprised. If intentionally omitted, note it in the package guide.
