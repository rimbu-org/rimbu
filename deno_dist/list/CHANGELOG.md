# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@2.1.1...@rimbu/list@2.1.2) (2024-06-28)

### Bug Fixes

- ensure type predicates are typed according to new rules of TypeScript 5.5.2 ([91103f7](https://github.com/rimbu-org/rimbu/commit/91103f76d6fffe35101e54fbdeb57ffc254b66f5))

## [2.1.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@2.1.0...@rimbu/list@2.1.1) (2024-03-05)

**Note:** Version bump only for package @rimbu/list

# [2.1.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@2.0.0...@rimbu/list@2.1.0) (2024-02-14)

### Features

- refactor Stream package, add more reducers and Stream methods ([6840c4f](https://github.com/rimbu-org/rimbu/commit/6840c4f28bf45767bd3019835b3abbaa51ccf311))

# [2.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@1.1.1...@rimbu/list@2.0.0) (2024-01-26)

### Features

- major API improvements accross all packages, performance improvements for newer runtimes ([312e473](https://github.com/rimbu-org/rimbu/commit/312e473261696a8e8749399491b9fd29bb5c38ec))

### BREAKING CHANGES

- Many methods now take an options object instead of positional arguments for
  readability

## [1.1.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@1.1.0...@rimbu/list@1.1.1) (2023-12-09)

### Bug Fixes

- fix @rimbu/channel not working in Deno ddue to wrong transpilation ([91f9144](https://github.com/rimbu-org/rimbu/commit/91f9144c4a35f28266b6154110db63dafb3dbd22))

# [1.1.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@1.0.0...@rimbu/list@1.1.0) (2023-07-29)

### Bug Fixes

- insert inserts 1 more item than expected for rational index ([92ccf15](https://github.com/rimbu-org/rimbu/commit/92ccf15e65759ac0c353f731e8e4033ce4a40488))
- remove import maps to restore commonjs compatibility ([a934339](https://github.com/rimbu-org/rimbu/commit/a9343391c24cdc1b256235b7b7220e0d4713cb01))

### Features

- update tslib version and extend channel documentation ([6eb46d0](https://github.com/rimbu-org/rimbu/commit/6eb46d07b9b7469febd316306146b04f43b1ebb5))

# [1.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@1.0.0-alpha.2...@rimbu/list@1.0.0) (2023-07-03)

**Note:** Version bump only for package @rimbu/list

# [1.0.0-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@1.0.0-alpha.1...@rimbu/list@1.0.0-alpha.2) (2023-07-02)

**Note:** Version bump only for package @rimbu/list

# [1.0.0-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.12.3...@rimbu/list@1.0.0-alpha.1) (2023-07-02)

**Note:** Version bump only for package @rimbu/list

## [0.12.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.12.2...@rimbu/list@0.12.3) (2023-06-20)

### Reverts

- Revert "Increase version number" ([9c0b4ba](https://github.com/rimbu-org/rimbu/commit/9c0b4baa3f16f1dce4a8e276c0ec8c89ce1eb72c))

## [0.12.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.12.1...@rimbu/list@0.12.2) (2023-05-21)

**Note:** Version bump only for package @rimbu/list

## [0.12.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.12.0...@rimbu/list@0.12.1) (2023-04-30)

**Note:** Version bump only for package @rimbu/list

# [0.12.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.11.3...@rimbu/list@0.12.0) (2023-04-27)

### Features

- update from TypeScript 4 to latest version 5 ([7085d75](https://github.com/rimbu-org/rimbu/commit/7085d758f8874c2ce822de1d95732ec4bc98ee43))

## [0.11.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.11.2...@rimbu/list@0.11.3) (2023-04-26)

**Note:** Version bump only for package @rimbu/list

## [0.11.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.11.1...@rimbu/list@0.11.2) (2023-04-25)

**Note:** Version bump only for package @rimbu/list

## [0.11.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.11.0...@rimbu/list@0.11.1) (2023-04-02)

**Note:** Version bump only for package @rimbu/list

# [0.11.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.22...@rimbu/list@0.11.0) (2022-11-30)

### Features

- re-implemented actor and reactor packages, and updated denoifier ([ad43faf](https://github.com/rimbu-org/rimbu/commit/ad43faf1154d43fae79eea418d8b3bea28b04a2f))

### BREAKING CHANGES

- The @rimbu/actor and @rimbu/reactor packages have a completely new API (but they
  were and are still experimental)

## [0.10.22](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.21...@rimbu/list@0.10.22) (2022-10-02)

**Note:** Version bump only for package @rimbu/list

## [0.10.21](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.20...@rimbu/list@0.10.21) (2022-09-22)

**Note:** Version bump only for package @rimbu/list

## [0.10.20](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.19...@rimbu/list@0.10.20) (2022-09-12)

**Note:** Version bump only for package @rimbu/list

## [0.10.19](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.18...@rimbu/list@0.10.19) (2022-07-02)

### Reverts

- move tslib dependency back from root to individual packages ([99cff5f](https://github.com/rimbu-org/rimbu/commit/99cff5f8e8da0b5536505332ae1cf01a28c25262))

## [0.10.18](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.17...@rimbu/list@0.10.18) (2022-07-02)

**Note:** Version bump only for package @rimbu/list

## [0.10.17](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.16...@rimbu/list@0.10.17) (2022-06-30)

### Bug Fixes

- **list:** fix list builder creating incorrectly formed trees in rare cases, and more test cov ([c5a9470](https://github.com/rimbu-org/rimbu/commit/c5a9470a33be0db5ef591ea5dd79612035c41698))

## [0.10.16](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.15...@rimbu/list@0.10.16) (2022-06-10)

**Note:** Version bump only for package @rimbu/list

## [0.10.15](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.14...@rimbu/list@0.10.15) (2022-06-07)

**Note:** Version bump only for package @rimbu/list

## [0.10.14](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.13...@rimbu/list@0.10.14) (2022-05-29)

**Note:** Version bump only for package @rimbu/list

## [0.10.13](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.12...@rimbu/list@0.10.13) (2022-05-27)

### Bug Fixes

- improve security by adding Object.freeze to global objects and local singletons ([426277d](https://github.com/rimbu-org/rimbu/commit/426277dd4512303a340554a9e9e85e38f464ac8d)), closes [#72](https://github.com/rimbu-org/rimbu/issues/72)

## [0.10.12](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.11...@rimbu/list@0.10.12) (2022-05-09)

### Bug Fixes

- improve 'menu' style exports for core, and improve documentation ([0729871](https://github.com/rimbu-org/rimbu/commit/0729871a8aae220ef5d9132c0c56e5a3cb2c19cb))

## [0.10.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.10...@rimbu/list@0.10.11) (2022-05-06)

**Note:** Version bump only for package @rimbu/list

## [0.10.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.9...@rimbu/list@0.10.10) (2022-05-05)

**Note:** Version bump only for package @rimbu/list

## [0.10.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.8...@rimbu/list@0.10.9) (2022-05-05)

## 0.8.7 (2022-05-05)

**Note:** Version bump only for package @rimbu/list

## [0.10.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.7...@rimbu/list@0.10.8) (2022-05-04)

## 0.8.6 (2022-05-04)

**Note:** Version bump only for package @rimbu/list

## [0.10.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.6...@rimbu/list@0.10.7) (2022-05-04)

## 0.8.5 (2022-05-04)

**Note:** Version bump only for package @rimbu/list

## [0.10.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.5...@rimbu/list@0.10.6) (2022-05-04)

**Note:** Version bump only for package @rimbu/list

## [0.10.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.4...@rimbu/list@0.10.5) (2022-05-03)

**Note:** Version bump only for package @rimbu/list

## [0.10.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.3...@rimbu/list@0.10.4) (2022-05-03)

**Note:** Version bump only for package @rimbu/list

## [0.10.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.2...@rimbu/list@0.10.3) (2022-05-03)

**Note:** Version bump only for package @rimbu/list

## [0.10.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.1...@rimbu/list@0.10.2) (2022-05-02)

## 0.8.2 (2022-05-02)

### Bug Fixes

- remove circular dependencies in Stream to improve loading in environments like CodeSandbox ([497a737](https://github.com/rimbu-org/rimbu/commit/497a7378785d99464d4d11904ec17a81940ec411))

## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.10.0...@rimbu/list@0.10.1) (2022-05-02)

**Note:** Version bump only for package @rimbu/list

# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.9.0...@rimbu/list@0.10.0) (2022-05-01)

### Code Refactoring

- refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))

### BREAKING CHANGES

- package structure has changed, added sub-packages

# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.8.3...@rimbu/list@0.9.0) (2021-12-22)

### Bug Fixes

- export values along with types of generic collections that support context creation ([704297a](https://github.com/rimbu-org/rimbu/commit/704297af9bff9edf57ef5fee00426b8b074ffd81))

### Features

- **list:** add mapPure method to List ([fa3adda](https://github.com/rimbu-org/rimbu/commit/fa3addaa364f7a5fe1829cb41f6bdba454b0ce3a))
- **stream:** add ifEmpty option to Stream.join ([53d520a](https://github.com/rimbu-org/rimbu/commit/53d520a7bbbf6be18690a925162a8bc2607dc31f))

## [0.8.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.8.2...@rimbu/list@0.8.3) (2021-11-25)

## 0.7.3 (2021-11-25)

**Note:** Version bump only for package @rimbu/list

## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.8.1...@rimbu/list@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/list

## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.8.0...@rimbu/list@0.8.1) (2021-11-24)

### Bug Fixes

- **list:** fix builder mixing up order for larger lists ([0db93ca](https://github.com/rimbu-org/rimbu/commit/0db93ca4563ca3cf861724829c716daa0cc40615)), closes [#46](https://github.com/rimbu-org/rimbu/issues/46)

# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.5...@rimbu/list@0.8.0) (2021-11-20)

### Features

- add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
- integrate release version of TypeScript 4.5, improve build times ([d684828](https://github.com/rimbu-org/rimbu/commit/d6848281859752c630979e44e8e22c3cbfccf577))

### BREAKING CHANGES

- Some methods are extracted from Stream instances and made static, same for Maps and
  Sets. This leads to better variance inference.
- Interfaces for methods like merge and flatten have been moved from instance to
  class methods

## [0.7.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.4...@rimbu/list@0.7.5) (2021-10-10)

## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/list

## [0.7.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.3...@rimbu/list@0.7.4) (2021-09-04)

**Note:** Version bump only for package @rimbu/list

## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.2...@rimbu/list@0.7.3) (2021-08-20)

**Note:** Version bump only for package @rimbu/list

## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.1...@rimbu/list@0.7.2) (2021-07-23)

**Note:** Version bump only for package @rimbu/list

## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.7.0...@rimbu/list@0.7.1) (2021-07-23)

## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/list

# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.6.2...@rimbu/list@0.7.0) (2021-07-23)

### Bug Fixes

- replace abstract readonly with abstract getters because deno treats it differently than node ([46e6ffe](https://github.com/rimbu-org/rimbu/commit/46e6ffe982d4bc47ed240d0b1a1b8118ae9ecbc7))

### Features

- add .reducer factory method to collections ([5eb2976](https://github.com/rimbu-org/rimbu/commit/5eb29760ed6b2ce3a739de7663d7d5cacbf12207))

## [0.6.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.6.1...@rimbu/list@0.6.2) (2021-07-07)

### Bug Fixes

- **list, table:** add tests and fix bugs that came out of tests ([c32a62d](https://github.com/rimbu-org/rimbu/commit/c32a62df661c27a8197ebcd4bbf15eff115223cb))

## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.6.0...@rimbu/list@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/list

# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.11...@rimbu/list@0.6.0) (2021-07-02)

### Bug Fixes

- **deno:** add proper getters and setters to abstract classes and implement defined abstract methods ([fad3d0e](https://github.com/rimbu-org/rimbu/commit/fad3d0e42e14a0b792744c9f93d8718900c3472f)), closes [#18](https://github.com/rimbu-org/rimbu/issues/18)

### Features

- added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))

### BREAKING CHANGES

- New compiler settings do not allow function and namespace with same name, impacting
  Err and Patch

## [0.5.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10...@rimbu/list@0.5.11) (2021-06-27)

**Note:** Version bump only for package @rimbu/list

## [0.5.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.7...@rimbu/list@0.5.10) (2021-06-10)

**Note:** Version bump only for package @rimbu/list

## [0.5.10-alpha.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.6...@rimbu/list@0.5.10-alpha.7) (2021-06-09)

### Bug Fixes

- **hashed:** other attempt to load hashed in codesandbox ([ee677f0](https://github.com/rimbu-org/rimbu/commit/ee677f03180e96e483e47e895e81b54f8258e1c9))

## [0.5.10-alpha.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.5...@rimbu/list@0.5.10-alpha.6) (2021-06-08)

### Bug Fixes

- **list:** rework dependencies ([f2698c1](https://github.com/rimbu-org/rimbu/commit/f2698c19102e500057e22c9c3f5b4135e0bb1189))

## [0.5.10-alpha.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.4...@rimbu/list@0.5.10-alpha.5) (2021-06-08)

### Bug Fixes

- **list:** move some dependencies into one file ([970df92](https://github.com/rimbu-org/rimbu/commit/970df92ebd7d21ba3097afeb7c583c0af6d6a729))

## [0.5.10-alpha.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.3...@rimbu/list@0.5.10-alpha.4) (2021-06-08)

### Bug Fixes

- **list:** another attempt to fix codesandbox loading ([66f4ee1](https://github.com/rimbu-org/rimbu/commit/66f4ee1080f22bb871021bda6e0ea1e5b8f469a3))

## [0.5.10-alpha.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.2...@rimbu/list@0.5.10-alpha.3) (2021-06-08)

### Bug Fixes

- **list:** new attempt to fix list loading in codesandbox ([27b8146](https://github.com/rimbu-org/rimbu/commit/27b8146b8ec3768b49fa516d229745aff0c68ccd))

## [0.5.10-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.1...@rimbu/list@0.5.10-alpha.2) (2021-06-08)

### Bug Fixes

- **list:** remove many circular dependencies for codesandbox loading ([3039ef8](https://github.com/rimbu-org/rimbu/commit/3039ef8132bf465a563555de9dc454e6ce32f5f5))

## [0.5.10-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.10-alpha.0...@rimbu/list@0.5.10-alpha.1) (2021-06-07)

### Bug Fixes

- **list:** reorder imports to fix codesandbox import ([cb76649](https://github.com/rimbu-org/rimbu/commit/cb766499ab6b941d5934711c5a6bc7d9263c59d5))

## [0.5.10-alpha.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.9...@rimbu/list@0.5.10-alpha.0) (2021-06-07)

### Bug Fixes

- **list:** reorder imports to fix loading in codesandbox ([5840fdd](https://github.com/rimbu-org/rimbu/commit/5840fddd3a09d7038ae9b4bfc6ce91dc42b3e594))

## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.8...@rimbu/list@0.5.9) (2021-06-06)

### Bug Fixes

- **list:** rework circular dependencies to fix import not working in codesandbox ([5205878](https://github.com/rimbu-org/rimbu/commit/52058787757fc4831e81019b284f230d57965375))

## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.7...@rimbu/list@0.5.8) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.6...@rimbu/list@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.5...@rimbu/list@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.4...@rimbu/list@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.3...@rimbu/list@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.2...@rimbu/list@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/list

## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/list@0.5.1...@rimbu/list@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/list
