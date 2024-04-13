# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@2.0.0...@rimbu/base@2.0.1) (2024-03-05)

**Note:** Version bump only for package @rimbu/base

# [2.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@1.1.0...@rimbu/base@2.0.0) (2024-01-26)

### Features

- major API improvements accross all packages, performance improvements for newer runtimes ([312e473](https://github.com/rimbu-org/rimbu/commit/312e473261696a8e8749399491b9fd29bb5c38ec))

### Performance Improvements

- **base:** export most performant arr methods based on available array methods ([714e66e](https://github.com/rimbu-org/rimbu/commit/714e66ed60289bc5eefff827e7ae167e8131cfb7))

### BREAKING CHANGES

- Many methods now take an options object instead of positional arguments for
  readability

# [1.1.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@1.0.0...@rimbu/base@1.1.0) (2023-07-29)

### Features

- update tslib version and extend channel documentation ([6eb46d0](https://github.com/rimbu-org/rimbu/commit/6eb46d07b9b7469febd316306146b04f43b1ebb5))

# [1.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@1.0.0-alpha.2...@rimbu/base@1.0.0) (2023-07-03)

**Note:** Version bump only for package @rimbu/base

# [1.0.0-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@1.0.0-alpha.1...@rimbu/base@1.0.0-alpha.2) (2023-07-02)

**Note:** Version bump only for package @rimbu/base

# [1.0.0-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.11.4...@rimbu/base@1.0.0-alpha.1) (2023-07-02)

**Note:** Version bump only for package @rimbu/base

## [0.11.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.11.3...@rimbu/base@0.11.4) (2023-05-21)

**Note:** Version bump only for package @rimbu/base

## [0.11.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.11.2...@rimbu/base@0.11.3) (2023-04-26)

**Note:** Version bump only for package @rimbu/base

## [0.11.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.11.1...@rimbu/base@0.11.2) (2023-04-25)

**Note:** Version bump only for package @rimbu/base

## [0.11.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.11.0...@rimbu/base@0.11.1) (2023-04-02)

**Note:** Version bump only for package @rimbu/base

# [0.11.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.10.1...@rimbu/base@0.11.0) (2022-11-30)

### Features

- re-implemented actor and reactor packages, and updated denoifier ([ad43faf](https://github.com/rimbu-org/rimbu/commit/ad43faf1154d43fae79eea418d8b3bea28b04a2f))

### BREAKING CHANGES

- The @rimbu/actor and @rimbu/reactor packages have a completely new API (but they
  were and are still experimental)

## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.10.0...@rimbu/base@0.10.1) (2022-10-02)

**Note:** Version bump only for package @rimbu/base

# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.5...@rimbu/base@0.10.0) (2022-09-22)

### Features

- **deep:** improve the API of the @rimbu/deep package, and update dependent packages and docs ([500dd75](https://github.com/rimbu-org/rimbu/commit/500dd7557b84fd5e571856d08dca176bc7a49b49))

### BREAKING CHANGES

- **deep:** The API for the `match` and `patch` and related methods has had major changes

## [0.9.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.4...@rimbu/base@0.9.5) (2022-09-12)

**Note:** Version bump only for package @rimbu/base

## [0.9.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.3...@rimbu/base@0.9.4) (2022-07-02)

### Reverts

- move tslib dependency back from root to individual packages ([99cff5f](https://github.com/rimbu-org/rimbu/commit/99cff5f8e8da0b5536505332ae1cf01a28c25262))

## [0.9.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.2...@rimbu/base@0.9.3) (2022-07-02)

**Note:** Version bump only for package @rimbu/base

## [0.9.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.1...@rimbu/base@0.9.2) (2022-06-07)

### Bug Fixes

- **base:** improve isPlainObj function and add tests ([d1d0c68](https://github.com/rimbu-org/rimbu/commit/d1d0c6885b8f13c28627e8de099156b0d6c3f547))

## [0.9.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.9.0...@rimbu/base@0.9.1) (2022-05-29)

### Bug Fixes

- ensure that the Protected type does not modify any or never input types ([5555afa](https://github.com/rimbu-org/rimbu/commit/5555afaf71ca0c37b2e573d25adee99e8f6c85a0))

# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.8.2...@rimbu/base@0.9.0) (2022-05-27)

### Features

- improve deep package API and update dependent packages ([da8c240](https://github.com/rimbu-org/rimbu/commit/da8c2402745ff56f273b1d3503bd01fb2eedd411))

## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.8.1...@rimbu/base@0.8.2) (2022-05-09)

### Bug Fixes

- improve 'menu' style exports for core, and improve documentation ([0729871](https://github.com/rimbu-org/rimbu/commit/0729871a8aae220ef5d9132c0c56e5a3cb2c19cb))

## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.8.0...@rimbu/base@0.8.1) (2022-05-06)

**Note:** Version bump only for package @rimbu/base

# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.7.2...@rimbu/base@0.8.0) (2022-05-01)

### Code Refactoring

- refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))

### BREAKING CHANGES

- package structure has changed, added sub-packages

## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.7.1...@rimbu/base@0.7.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/base

## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.7.0...@rimbu/base@0.7.1) (2021-11-24)

**Note:** Version bump only for package @rimbu/base

# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.7...@rimbu/base@0.7.0) (2021-11-20)

### Features

- add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))

### BREAKING CHANGES

- Interfaces for methods like merge and flatten have been moved from instance to
  class methods

## [0.6.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.6...@rimbu/base@0.6.7) (2021-10-10)

## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/base

## [0.6.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.5...@rimbu/base@0.6.6) (2021-09-04)

**Note:** Version bump only for package @rimbu/base

## [0.6.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.4...@rimbu/base@0.6.5) (2021-08-20)

**Note:** Version bump only for package @rimbu/base

## [0.6.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.3...@rimbu/base@0.6.4) (2021-07-23)

**Note:** Version bump only for package @rimbu/base

## [0.6.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.2...@rimbu/base@0.6.3) (2021-07-23)

## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/base

## [0.6.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.1...@rimbu/base@0.6.2) (2021-07-23)

**Note:** Version bump only for package @rimbu/base

## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.6.0...@rimbu/base@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/base

# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.9...@rimbu/base@0.6.0) (2021-07-02)

### Features

- added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))

### BREAKING CHANGES

- New compiler settings do not allow function and namespace with same name, impacting
  Err and Patch

## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.8...@rimbu/base@0.5.9) (2021-06-27)

**Note:** Version bump only for package @rimbu/base

## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.7...@rimbu/base@0.5.8) (2021-06-10)

**Note:** Version bump only for package @rimbu/base

## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.6...@rimbu/base@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/base

## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.5...@rimbu/base@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/base

## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.4...@rimbu/base@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/base

## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.3...@rimbu/base@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/base

## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.2...@rimbu/base@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/base

## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/base@0.5.1...@rimbu/base@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/base
