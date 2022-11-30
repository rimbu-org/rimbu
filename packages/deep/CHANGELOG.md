# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.14.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.13.1...@rimbu/deep@0.14.0) (2022-11-30)


### Bug Fixes

* **deep:** provide updated parent and root for sequential patches ([172b873](https://github.com/rimbu-org/rimbu/commit/172b873e514513c730874bec2adbe2e09dc7eacd))


### Features

* re-implemented actor and reactor packages, and updated denoifier ([ad43faf](https://github.com/rimbu-org/rimbu/commit/ad43faf1154d43fae79eea418d8b3bea28b04a2f))


### BREAKING CHANGES

* The @rimbu/actor and @rimbu/reactor packages have a completely new API (but they
were and are still experimental)





## [0.13.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.13.0...@rimbu/deep@0.13.1) (2022-10-02)

**Note:** Version bump only for package @rimbu/deep





# [0.13.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.12.1...@rimbu/deep@0.13.0) (2022-09-27)


### Features

* **deep:** add array item traversal matching, update and fix docs ([513bd76](https://github.com/rimbu-org/rimbu/commit/513bd76c09208a6f2bf35ebc7f6c674023472fb5))





## [0.12.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.12.0...@rimbu/deep@0.12.1) (2022-09-22)


### Bug Fixes

* **deep:** fix patch methods not inferring correct types for multi-part patches ([7ba337e](https://github.com/rimbu-org/rimbu/commit/7ba337ec5e2506351b523ffe8a64b501253067af))





# [0.12.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.11.3...@rimbu/deep@0.12.0) (2022-09-22)


### Features

* **deep:** improve the API of the @rimbu/deep package, and update dependent packages and docs ([500dd75](https://github.com/rimbu-org/rimbu/commit/500dd7557b84fd5e571856d08dca176bc7a49b49))


### BREAKING CHANGES

* **deep:** The API for the `match` and `patch` and related methods has had major changes





## [0.11.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.11.2...@rimbu/deep@0.11.3) (2022-09-12)

**Note:** Version bump only for package @rimbu/deep





## [0.11.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.11.1...@rimbu/deep@0.11.2) (2022-07-02)


### Reverts

* move tslib dependency back from root to individual packages ([99cff5f](https://github.com/rimbu-org/rimbu/commit/99cff5f8e8da0b5536505332ae1cf01a28c25262))





## [0.11.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.11.0...@rimbu/deep@0.11.1) (2022-07-02)

**Note:** Version bump only for package @rimbu/deep





# [0.11.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.10.1...@rimbu/deep@0.11.0) (2022-06-07)


### Features

* improve Stream and AsyncStream API and add more AsyncReducers ([9d758de](https://github.com/rimbu-org/rimbu/commit/9d758de6052946ffdac8b8b300415e0c1146e2e6))


### BREAKING CHANGES

* Reducer.Init is replaced by OptLazy





## [0.10.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.10.0...@rimbu/deep@0.10.1) (2022-05-29)


### Bug Fixes

* ensure that the Protected type does not modify any or never input types ([5555afa](https://github.com/rimbu-org/rimbu/commit/5555afaf71ca0c37b2e573d25adee99e8f6c85a0))
* **deep:** fix Path.update not updating values correctly ([26df382](https://github.com/rimbu-org/rimbu/commit/26df38245fe681a2b159d41ddcfa8f93a7ead3b7)), closes [#79](https://github.com/rimbu-org/rimbu/issues/79)





# [0.10.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.9.2...@rimbu/deep@0.10.0) (2022-05-27)


### Features

* improve deep package API and update dependent packages ([da8c240](https://github.com/rimbu-org/rimbu/commit/da8c2402745ff56f273b1d3503bd01fb2eedd411))
* improve deep package structure ([14ee297](https://github.com/rimbu-org/rimbu/commit/14ee2973018046b448659d2ec41dee561394f7dd))


### BREAKING CHANGES

* the patch and match api's have changed





## [0.9.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.9.1...@rimbu/deep@0.9.2) (2022-05-09)


### Bug Fixes

* improve 'menu' style exports for core, and improve documentation ([0729871](https://github.com/rimbu-org/rimbu/commit/0729871a8aae220ef5d9132c0c56e5a3cb2c19cb))





## [0.9.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.9.0...@rimbu/deep@0.9.1) (2022-05-06)

**Note:** Version bump only for package @rimbu/deep





# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.8.2...@rimbu/deep@0.9.0) (2022-05-01)


### Code Refactoring

* refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))


### BREAKING CHANGES

* package structure has changed, added sub-packages





## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.8.1...@rimbu/deep@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/deep





## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.8.0...@rimbu/deep@0.8.1) (2021-11-24)

**Note:** Version bump only for package @rimbu/deep





# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.6...@rimbu/deep@0.8.0) (2021-11-20)


### Features

* add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
* upgrade to TS 4.5 and fix code that trips up compiler ([63fba7c](https://github.com/rimbu-org/rimbu/commit/63fba7cb039c629f9fc0dc09db2ef6435d06d5f1))


### BREAKING CHANGES

* Interfaces for methods like merge and flatten have been moved from instance to
class methods





## [0.7.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.5...@rimbu/deep@0.7.6) (2021-10-10)



## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/deep





## [0.7.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.4...@rimbu/deep@0.7.5) (2021-09-04)

**Note:** Version bump only for package @rimbu/deep





## [0.7.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.3...@rimbu/deep@0.7.4) (2021-08-20)

**Note:** Version bump only for package @rimbu/deep





## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.2...@rimbu/deep@0.7.3) (2021-07-23)

**Note:** Version bump only for package @rimbu/deep





## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.1...@rimbu/deep@0.7.2) (2021-07-23)



## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/deep





## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.7.0...@rimbu/deep@0.7.1) (2021-07-23)


### Performance Improvements

* **deep:** for Patch.MAP only copy array when values changed ([d25784e](https://github.com/rimbu-org/rimbu/commit/d25784ee844f4b599ca2bd2b304387b45e3951d2))





# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.6.1...@rimbu/deep@0.7.0) (2021-07-07)


### Features

* **deep:** add Patch.MAP to patch function ([0c12fdb](https://github.com/rimbu-org/rimbu/commit/0c12fdb410b411488526a0deb249f4e189b0701a))





## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.6.0...@rimbu/deep@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/deep





# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.9...@rimbu/deep@0.6.0) (2021-07-02)


### Features

* added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))


### BREAKING CHANGES

* New compiler settings do not allow function and namespace with same name, impacting
Err and Patch





## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.8...@rimbu/deep@0.5.9) (2021-06-27)


### Bug Fixes

* **deep:** remove some type annotations and replace with any because of recursion in tsc 4.3 ([0df1738](https://github.com/rimbu-org/rimbu/commit/0df17386d1f1b610151de2a82b97bfc4d06911b2))





## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.7...@rimbu/deep@0.5.8) (2021-06-10)

**Note:** Version bump only for package @rimbu/deep





## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.6...@rimbu/deep@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep





## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.5...@rimbu/deep@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep





## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.4...@rimbu/deep@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep





## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.3...@rimbu/deep@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep





## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.2...@rimbu/deep@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep





## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/deep@0.5.1...@rimbu/deep@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/deep
