# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.10.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.10.1...@rimbu/stream@0.10.2) (2022-05-02)



## 0.8.2 (2022-05-02)


### Bug Fixes

* remove circular dependencies in Stream to improve loading in environments like CodeSandbox ([497a737](https://github.com/rimbu-org/rimbu/commit/497a7378785d99464d4d11904ec17a81940ec411))





## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.10.0...@rimbu/stream@0.10.1) (2022-05-02)



## 0.8.1 (2022-05-01)


### Bug Fixes

* **stream:** remove circular dependency ([2673304](https://github.com/rimbu-org/rimbu/commit/2673304877bdf00737a219e969921d5be12a223e))





# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.9.0...@rimbu/stream@0.10.0) (2022-05-01)


### Code Refactoring

* refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))


### BREAKING CHANGES

* package structure has changed, added sub-packages





# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.8.2...@rimbu/stream@0.9.0) (2021-12-22)


### Features

* **stream:** add ifEmpty option to join method in AsyncStream ([5b1ac32](https://github.com/rimbu-org/rimbu/commit/5b1ac328a0dcdfed8d644f315f5babe511c89772))
* **stream:** add ifEmpty option to Stream.join ([53d520a](https://github.com/rimbu-org/rimbu/commit/53d520a7bbbf6be18690a925162a8bc2607dc31f))





## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.8.1...@rimbu/stream@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/stream





## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.8.0...@rimbu/stream@0.8.1) (2021-11-24)


### Bug Fixes

* improve collection types and documentation, and fix broken tests ([857d32d](https://github.com/rimbu-org/rimbu/commit/857d32d89d1377809d97aa3d03e6b9b6a40369ad))





# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.5...@rimbu/stream@0.8.0) (2021-11-20)


### Features

* add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
* improve zipwith, zipallwith, mergewith, mergeallwith methods and fix related tests ([915f9f2](https://github.com/rimbu-org/rimbu/commit/915f9f2ee35e33eb654765ad5fb726da08bfa36c))
* integrate release version of TypeScript 4.5, improve build times ([d684828](https://github.com/rimbu-org/rimbu/commit/d6848281859752c630979e44e8e22c3cbfccf577))


### BREAKING CHANGES

* Some methods are extracted from Stream instances and made static, same for Maps and
Sets. This leads to better variance inference.
* Interfaces for methods like merge and flatten have been moved from instance to
class methods





## [0.7.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.4...@rimbu/stream@0.7.5) (2021-10-10)



## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/stream





## [0.7.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.3...@rimbu/stream@0.7.4) (2021-09-04)

**Note:** Version bump only for package @rimbu/stream





## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.2...@rimbu/stream@0.7.3) (2021-08-20)


### Bug Fixes

* **stream:** reorder imports to avoid CodeSandbox error ([adfbe19](https://github.com/rimbu-org/rimbu/commit/adfbe198ed50f9ea5e754a55cce8e1fc628fa649))





## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.1...@rimbu/stream@0.7.2) (2021-07-23)



## 0.6.6 (2021-07-23)

**Note:** Version bump only for package @rimbu/stream





## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.7.0...@rimbu/stream@0.7.1) (2021-07-23)



## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/stream





# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.6.1...@rimbu/stream@0.7.0) (2021-07-23)



## 0.6.4 (2021-07-23)


### Bug Fixes

* **stream:** fix string as AsyncStream source gives error ([5f97e1f](https://github.com/rimbu-org/rimbu/commit/5f97e1f9e68b6585460053c4ed7936dec4a6f878))
* **stream:** fix type of Stream prepend ([f0a06c4](https://github.com/rimbu-org/rimbu/commit/f0a06c4a770027837c48e14c07de8d8015bd5b07))


### Features

* **common, stream:** add open and close methods to AsyncReducer, and improve AsyncStream close ([63e0c41](https://github.com/rimbu-org/rimbu/commit/63e0c4137106c4a82e15c439c1baaf836412eea7))
* **stream:** add close handler to AsyncStream ([9cfcd4b](https://github.com/rimbu-org/rimbu/commit/9cfcd4b5b0f982d85e7e1c73b2ccdb5531354cd3))
* **stream:** extending AsyncStream implementation ([c11f3ba](https://github.com/rimbu-org/rimbu/commit/c11f3ba03f4111c7b1b3914b39383670b26e01b5))
* **stream:** finalize AsyncStream and improve its test coverage ([6b82f07](https://github.com/rimbu-org/rimbu/commit/6b82f070e37ba737b1ced3726bae6602b0a757ae)), closes [#22](https://github.com/rimbu-org/rimbu/issues/22)
* **stream:** initial step towards adding async stream ([475fa3a](https://github.com/rimbu-org/rimbu/commit/475fa3a1cbf85728646420852a1ca8c2033cef21))





## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.6.0...@rimbu/stream@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/stream





# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.11...@rimbu/stream@0.6.0) (2021-07-02)


### Features

* added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))


### BREAKING CHANGES

* New compiler settings do not allow function and namespace with same name, impacting
Err and Patch





## [0.5.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.10...@rimbu/stream@0.5.11) (2021-06-27)

**Note:** Version bump only for package @rimbu/stream





## [0.5.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.10-alpha.0...@rimbu/stream@0.5.10) (2021-06-10)

**Note:** Version bump only for package @rimbu/stream





## [0.5.10-alpha.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.9...@rimbu/stream@0.5.10-alpha.0) (2021-06-07)

**Note:** Version bump only for package @rimbu/stream





## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.8...@rimbu/stream@0.5.9) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream





## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.7...@rimbu/stream@0.5.8) (2021-06-06)


### Bug Fixes

* **stream:** refactor to fix broken import in codesandbox ([cfed895](https://github.com/rimbu-org/rimbu/commit/cfed8957f2c6082160fc80227ca0746858fe34cd))





## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.6...@rimbu/stream@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream





## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.5...@rimbu/stream@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream





## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.4...@rimbu/stream@0.5.5) (2021-06-06)


### Bug Fixes

* **stream:** re-order imports due to undefined when using published package ([853480e](https://github.com/rimbu-org/rimbu/commit/853480e8f3424133f462cacaab93ddd29fa482d7))





## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.3...@rimbu/stream@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream





## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.2...@rimbu/stream@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream





## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/stream@0.5.1...@rimbu/stream@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/stream
