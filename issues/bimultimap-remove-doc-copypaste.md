---
severity: low
impact: package
complexity: trivial
pass: api
package: bimultimap
confidence: high
effort_estimate: 0.25d
title: "BiMultiMap removeValue/removeValues docs say 'key' but operate on 'value'"
---

## Summary
Two method doc comments in `BiMultiMapBase` contain copy-paste errors: the `@note` for `removeValue` says "guarantees same object reference if the **key** is not present" (it should say **value**), and the `@note` for `removeValues` says "if none of the **keys** are present" (should be **values**). These are correct in the `removeKey`/`removeKeys` siblings, so the inconsistency is isolated to the value-direction methods.

## Evidence
- `packages/bimultimap/src/internal/base.ts:296` — `removeValue` `@note`: "guarantees same object reference if the key is not present" (should be *value*).
- `packages/bimultimap/src/internal/base.ts:312` — `removeValues` `@note`: "guarantees same object reference if none of the keys are present" (should be *values*).
- Contrast the correct siblings: `removeKey` note at `:267` ("if the key is not present") and `removeKeys` note at `:282` ("if none of the keys are present").

## Impact
Minor documentation inaccuracy; could confuse a reader about which invariant (key vs value) the referential-equality guarantee depends on.

## Recommendation
Fix the two `@note` strings: `removeValue` → "if the **value** is not present"; `removeValues` → "if none of the **values** are present".
