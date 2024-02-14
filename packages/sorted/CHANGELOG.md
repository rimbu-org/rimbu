# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@2.0.0...@rimbu/sorted@2.1.0) (2024-02-14)

### Features

- refactor Stream package, add more reducers and Stream methods ([6840c4f](https://github.com/rimbu-org/rimbu/commit/6840c4f28bf45767bd3019835b3abbaa51ccf311))

# [2.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@1.1.1...@rimbu/sorted@2.0.0) (2024-01-26)

### Features

- major API improvements accross all packages, performance improvements for newer runtimes ([312e473](https://github.com/rimbu-org/rimbu/commit/312e473261696a8e8749399491b9fd29bb5c38ec))

### BREAKING CHANGES

- Many methods now take an options object instead of positional arguments for
  readability

## [1.1.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@1.1.0...@rimbu/sorted@1.1.1) (2023-12-09)

### Bug Fixes

- **sorted:** fix sortedset and sortedmap builders not correctly clearing their source when modified ([196cb90](https://github.com/rimbu-org/rimbu/commit/196cb90cf712c4412fb539c6c78d147a475a8d8a))
- **sorted:** sortedSet remove should not use reference equality ([b340d70](https://github.com/rimbu-org/rimbu/commit/b340d7086adc31e8b7878dc06c40c14b01e717b3)), closes [#189](https://github.com/rimbu-org/rimbu/issues/189)

# [1.1.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@1.0.0...@rimbu/sorted@1.1.0) (2023-07-29)

### Bug Fixes

- remove import maps to restore commonjs compatibility ([a934339](https://github.com/rimbu-org/rimbu/commit/a9343391c24cdc1b256235b7b7220e0d4713cb01))

### Features

- update tslib version and extend channel documentation ([6eb46d0](https://github.com/rimbu-org/rimbu/commit/6eb46d07b9b7469febd316306146b04f43b1ebb5))

# [1.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@1.0.0-alpha.2...@rimbu/sorted@1.0.0) (2023-07-03)

**Note:** Version bump only for package @rimbu/sorted

# [1.0.0-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@1.0.0-alpha.1...@rimbu/sorted@1.0.0-alpha.2) (2023-07-02)

**Note:** Version bump only for package @rimbu/sorted

# [1.0.0-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.7...@rimbu/sorted@1.0.0-alpha.1) (2023-07-02)

### Bug Fixes

- **sorted:** incorporate PR [#168](https://github.com/rimbu-org/rimbu/issues/168) from giancosta86 on main branch into esm branch ([f06fff9](https://github.com/rimbu-org/rimbu/commit/f06fff98a34e7777fd45947dde89350cd24d274e))

## [0.10.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.6...@rimbu/sorted@0.10.7) (2023-06-30)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.5...@rimbu/sorted@0.10.6) (2023-05-21)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.4...@rimbu/sorted@0.10.5) (2023-04-30)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.3...@rimbu/sorted@0.10.4) (2023-04-27)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.2...@rimbu/sorted@0.10.3) (2023-04-26)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.1...@rimbu/sorted@0.10.2) (2023-04-25)

**Note:** Version bump only for package @rimbu/sorted

## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.10.0...@rimbu/sorted@0.10.1) (2023-04-02)

**Note:** Version bump only for package @rimbu/sorted

# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.20...@rimbu/sorted@0.10.0) (2022-11-30)

### Features

- re-implemented actor and reactor packages, and updated denoifier ([ad43faf](https://github.com/rimbu-org/rimbu/commit/ad43faf1154d43fae79eea418d8b3bea28b04a2f))

### BREAKING CHANGES

- The @rimbu/actor and @rimbu/reactor packages have a completely new API (but they
  were and are still experimental)

## [0.9.20](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.19...@rimbu/sorted@0.9.20) (2022-10-02)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.19](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.18...@rimbu/sorted@0.9.19) (2022-09-22)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.18](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.17...@rimbu/sorted@0.9.18) (2022-09-12)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.17](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.16...@rimbu/sorted@0.9.17) (2022-07-02)

### Reverts

- move tslib dependency back from root to individual packages ([99cff5f](https://github.com/rimbu-org/rimbu/commit/99cff5f8e8da0b5536505332ae1cf01a28c25262))

## [0.9.16](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.15...@rimbu/sorted@0.9.16) (2022-07-02)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.15](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.14...@rimbu/sorted@0.9.15) (2022-06-30)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.14](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.13...@rimbu/sorted@0.9.14) (2022-06-10)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.13](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.12...@rimbu/sorted@0.9.13) (2022-06-07)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.12](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.11...@rimbu/sorted@0.9.12) (2022-05-29)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.10...@rimbu/sorted@0.9.11) (2022-05-27)

### Bug Fixes

- improve security by adding Object.freeze to global objects and local singletons ([426277d](https://github.com/rimbu-org/rimbu/commit/426277dd4512303a340554a9e9e85e38f464ac8d)), closes [#72](https://github.com/rimbu-org/rimbu/issues/72)

## [0.9.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.9...@rimbu/sorted@0.9.10) (2022-05-09)

### Bug Fixes

- improve 'menu' style exports for core, and improve documentation ([0729871](https://github.com/rimbu-org/rimbu/commit/0729871a8aae220ef5d9132c0c56e5a3cb2c19cb))

## [0.9.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.8...@rimbu/sorted@0.9.9) (2022-05-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.7...@rimbu/sorted@0.9.8) (2022-05-05)

## 0.8.8 (2022-05-05)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.6...@rimbu/sorted@0.9.7) (2022-05-05)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.5...@rimbu/sorted@0.9.6) (2022-05-04)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.4...@rimbu/sorted@0.9.5) (2022-05-03)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.3...@rimbu/sorted@0.9.4) (2022-05-03)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.2...@rimbu/sorted@0.9.3) (2022-05-03)

**Note:** Version bump only for package @rimbu/sorted

## [0.9.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.1...@rimbu/sorted@0.9.2) (2022-05-02)

## 0.8.2 (2022-05-02)

### Bug Fixes

- remove circular dependencies in Stream to improve loading in environments like CodeSandbox ([497a737](https://github.com/rimbu-org/rimbu/commit/497a7378785d99464d4d11904ec17a81940ec411))

## [0.9.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.9.0...@rimbu/sorted@0.9.1) (2022-05-02)

**Note:** Version bump only for package @rimbu/sorted

# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.8.3...@rimbu/sorted@0.9.0) (2022-05-01)

### Code Refactoring

- refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))

### BREAKING CHANGES

- package structure has changed, added sub-packages

## [0.8.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.8.2...@rimbu/sorted@0.8.3) (2021-12-22)

**Note:** Version bump only for package @rimbu/sorted

## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.8.1...@rimbu/sorted@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/sorted

## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.8.0...@rimbu/sorted@0.8.1) (2021-11-24)

### Bug Fixes

- improve collection types and documentation, and fix broken tests ([857d32d](https://github.com/rimbu-org/rimbu/commit/857d32d89d1377809d97aa3d03e6b9b6a40369ad))

# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.7.2...@rimbu/sorted@0.8.0) (2021-11-20)

### Features

- add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
- improve zipwith, zipallwith, mergewith, mergeallwith methods and fix related tests ([915f9f2](https://github.com/rimbu-org/rimbu/commit/915f9f2ee35e33eb654765ad5fb726da08bfa36c))
- integrate release version of TypeScript 4.5, improve build times ([d684828](https://github.com/rimbu-org/rimbu/commit/d6848281859752c630979e44e8e22c3cbfccf577))

### BREAKING CHANGES

- Some methods are extracted from Stream instances and made static, same for Maps and
  Sets. This leads to better variance inference.
- Interfaces for methods like merge and flatten have been moved from instance to
  class methods

## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.7.1...@rimbu/sorted@0.7.2) (2021-10-10)

## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/sorted

## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.7.0...@rimbu/sorted@0.7.1) (2021-09-04)

**Note:** Version bump only for package @rimbu/sorted

# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.5...@rimbu/sorted@0.7.0) (2021-08-21)

### Features

- **sorted:** added reverse stream ordering to sorted collections ([87a963b](https://github.com/rimbu-org/rimbu/commit/87a963b38c1f1f7215ffab9036301c59da4d1ce1)), closes [#26](https://github.com/rimbu-org/rimbu/issues/26)

## [0.6.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.4...@rimbu/sorted@0.6.5) (2021-08-20)

### Bug Fixes

- increase test coverage and fix found issues ([129ea21](https://github.com/rimbu-org/rimbu/commit/129ea21ae979bf8f4f4858f1e234e720cae89768))

## [0.6.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.3...@rimbu/sorted@0.6.4) (2021-07-23)

**Note:** Version bump only for package @rimbu/sorted

## [0.6.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.2...@rimbu/sorted@0.6.3) (2021-07-23)

## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/sorted

## [0.6.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.1...@rimbu/sorted@0.6.2) (2021-07-23)

### Bug Fixes

- replace abstract readonly with abstract getters because deno treats it differently than node ([46e6ffe](https://github.com/rimbu-org/rimbu/commit/46e6ffe982d4bc47ed240d0b1a1b8118ae9ecbc7))

## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.6.0...@rimbu/sorted@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/sorted

# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.11...@rimbu/sorted@0.6.0) (2021-07-02)

### Bug Fixes

- **deno:** add proper getters and setters to abstract classes and implement defined abstract methods ([fad3d0e](https://github.com/rimbu-org/rimbu/commit/fad3d0e42e14a0b792744c9f93d8718900c3472f)), closes [#18](https://github.com/rimbu-org/rimbu/issues/18)

### Features

- added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))

### BREAKING CHANGES

- New compiler settings do not allow function and namespace with same name, impacting
  Err and Patch

## [0.5.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.10...@rimbu/sorted@0.5.11) (2021-06-27)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.10-alpha.0...@rimbu/sorted@0.5.10) (2021-06-10)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.10-alpha.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.9...@rimbu/sorted@0.5.10-alpha.0) (2021-06-07)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.8...@rimbu/sorted@0.5.9) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.7...@rimbu/sorted@0.5.8) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.6...@rimbu/sorted@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.5...@rimbu/sorted@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.4...@rimbu/sorted@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.3...@rimbu/sorted@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.2...@rimbu/sorted@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted

## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/sorted@0.5.1...@rimbu/sorted@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/sorted
