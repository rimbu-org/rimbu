# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.12.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.12.0...@rimbu/common@0.12.1) (2023-04-02)

**Note:** Version bump only for package @rimbu/common

# [0.12.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.11.0...@rimbu/common@0.12.0) (2022-11-30)

### Features

- re-implemented actor and reactor packages, and updated denoifier ([ad43faf](https://github.com/rimbu-org/rimbu/commit/ad43faf1154d43fae79eea418d8b3bea28b04a2f))

### BREAKING CHANGES

- The @rimbu/actor and @rimbu/reactor packages have a completely new API (but they
  were and are still experimental)

# [0.11.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.10.3...@rimbu/common@0.11.0) (2022-10-02)

### Bug Fixes

- **common:** make Reducer instances assignable to AsyncReducer type ([f484c13](https://github.com/rimbu-org/rimbu/commit/f484c13e2c3e25007082c5e78553d3e803418890))

### Features

- **common:** add reducer combineObj method and rename old combine to combineArr ([86e451c](https://github.com/rimbu-org/rimbu/commit/86e451cbb606486fe9b4a68f3d7b969ab240f7c5))

### BREAKING CHANGES

- **common:** reducer and asyncReducer combine method has been renamed to combineArr

## [0.10.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.10.2...@rimbu/common@0.10.3) (2022-09-12)

**Note:** Version bump only for package @rimbu/common

## [0.10.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.10.1...@rimbu/common@0.10.2) (2022-07-02)

### Reverts

- move tslib dependency back from root to individual packages ([99cff5f](https://github.com/rimbu-org/rimbu/commit/99cff5f8e8da0b5536505332ae1cf01a28c25262))

## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.10.0...@rimbu/common@0.10.1) (2022-07-02)

**Note:** Version bump only for package @rimbu/common

# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.9.4...@rimbu/common@0.10.0) (2022-06-07)

### Bug Fixes

- fix empty stream reduce and reduceAll functions and add tests for async reducers ([136c05c](https://github.com/rimbu-org/rimbu/commit/136c05c83376672987ec61b78adc1e4f2d263938))

### Features

- improve Stream and AsyncStream API and add more AsyncReducers ([9d758de](https://github.com/rimbu-org/rimbu/commit/9d758de6052946ffdac8b8b300415e0c1146e2e6))

### BREAKING CHANGES

- Reducer.Init is replaced by OptLazy

## [0.9.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.9.3...@rimbu/common@0.9.4) (2022-05-29)

**Note:** Version bump only for package @rimbu/common

## [0.9.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.9.2...@rimbu/common@0.9.3) (2022-05-27)

### Bug Fixes

- improve security by adding Object.freeze to global objects and local singletons ([426277d](https://github.com/rimbu-org/rimbu/commit/426277dd4512303a340554a9e9e85e38f464ac8d)), closes [#72](https://github.com/rimbu-org/rimbu/issues/72)

## [0.9.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.9.1...@rimbu/common@0.9.2) (2022-05-09)

### Bug Fixes

- improve 'menu' style exports for core, and improve documentation ([0729871](https://github.com/rimbu-org/rimbu/commit/0729871a8aae220ef5d9132c0c56e5a3cb2c19cb))

## [0.9.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.9.0...@rimbu/common@0.9.1) (2022-05-06)

**Note:** Version bump only for package @rimbu/common

# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.8.2...@rimbu/common@0.9.0) (2022-05-01)

### Code Refactoring

- refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))

### BREAKING CHANGES

- package structure has changed, added sub-packages

## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.8.1...@rimbu/common@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/common

## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.8.0...@rimbu/common@0.8.1) (2021-11-24)

### Bug Fixes

- improve collection types and documentation, and fix broken tests ([857d32d](https://github.com/rimbu-org/rimbu/commit/857d32d89d1377809d97aa3d03e6b9b6a40369ad))

# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.5...@rimbu/common@0.8.0) (2021-11-20)

### Features

- add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))

### BREAKING CHANGES

- Interfaces for methods like merge and flatten have been moved from instance to
  class methods

## [0.7.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.4...@rimbu/common@0.7.5) (2021-10-10)

## 0.6.11 (2021-10-10)

### Bug Fixes

- **common:** use stateToResult in Reducer.compose ([48b7429](https://github.com/rimbu-org/rimbu/commit/48b742917c291bc249f0173cd4003d7b0f78f1e3)), closes [#35](https://github.com/rimbu-org/rimbu/issues/35)

## [0.7.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.3...@rimbu/common@0.7.4) (2021-09-04)

### Bug Fixes

- **common:** fix Reducer.combine fails when supplied reducer calls halt() ([4422383](https://github.com/rimbu-org/rimbu/commit/4422383c34113f26fa8744444d9784f43585b085))

## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.2...@rimbu/common@0.7.3) (2021-08-20)

### Bug Fixes

- increase test coverage and fix found issues ([129ea21](https://github.com/rimbu-org/rimbu/commit/129ea21ae979bf8f4f4858f1e234e720cae89768))

## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.1...@rimbu/common@0.7.2) (2021-07-23)

**Note:** Version bump only for package @rimbu/common

## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.7.0...@rimbu/common@0.7.1) (2021-07-23)

## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/common

# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.6.1...@rimbu/common@0.7.0) (2021-07-23)

### Features

- **common, stream:** add open and close methods to AsyncReducer, and improve AsyncStream close ([63e0c41](https://github.com/rimbu-org/rimbu/commit/63e0c4137106c4a82e15c439c1baaf836412eea7))
- **stream:** extending AsyncStream implementation ([c11f3ba](https://github.com/rimbu-org/rimbu/commit/c11f3ba03f4111c7b1b3914b39383670b26e01b5))

## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.6.0...@rimbu/common@0.6.1) (2021-07-04)

### Bug Fixes

- **common:** flat eq now returns false instead of comparing tostring to prevent false positives ([b045177](https://github.com/rimbu-org/rimbu/commit/b0451770a8c6be8e5e88020fe9b41269f5afd98c))

# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.9...@rimbu/common@0.6.0) (2021-07-02)

### Features

- added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))

### BREAKING CHANGES

- New compiler settings do not allow function and namespace with same name, impacting
  Err and Patch

## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.8...@rimbu/common@0.5.9) (2021-06-27)

**Note:** Version bump only for package @rimbu/common

## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.7...@rimbu/common@0.5.8) (2021-06-10)

**Note:** Version bump only for package @rimbu/common

## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.6...@rimbu/common@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/common

## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.5...@rimbu/common@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/common

## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.4...@rimbu/common@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/common

## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.3...@rimbu/common@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/common

## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.2...@rimbu/common@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/common

## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/common@0.5.1...@rimbu/common@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/common
