# @rimbu/spy — restructuring plan

## Current state (violations)
- Package is a SINGLE file `src/spy.ts` with a root `.` export. No `public/`, `advanced/`,
  or `internal/` folders exist.
- `package.json` already conforms: only `"."` export, no wildcards, no internal leak.
- No relative imports, no `#private` alias.

This package is already conformant to the locked target model. No source restructuring is
required. The 3-folder shape is only adopted *if* internals appear later.

## Target layout
```
src/
  spy.ts         # root "."  → re-exports Spy
```
(No `public/`, `advanced/`, or `internal/` directories are created unless future code needs
them. If an internal split ever happens, follow model C1: private code goes to
`src/internal/` behind `#spy/*`.)

## File mapping (current → target)
| Current file | Tier | New Path |
|---|---|---|
| src/spy.ts | root | src/spy.ts (unchanged) |

## package.json exports / imports changes
None required. Current:
```json
"exports": {
  ".": { "types": "./dist/spy.d.ts", "import": "./dist/spy.js" }
}
```
No `imports` block present and none needed (no internal alias).

## Root fix
None. `src/spy.ts` already re-exports the whole (only) surface — `Spy`.

## Naming / intentional deviations
- None. Documented as intentionally minimal: a single-file package needs no folder tiers.

## Notes
- No cross-package restructure dependencies.
- If a future change introduces private helpers, create `src/internal/` + `#spy/*` and keep
  `spy.ts` as the sole root entry.
