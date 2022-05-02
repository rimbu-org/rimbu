# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.9.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.9.0...@rimbu/table@0.9.1) (2022-05-02)

**Note:** Version bump only for package @rimbu/table





# [0.9.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.8.4...@rimbu/table@0.9.0) (2022-05-01)


### Code Refactoring

* refactored package structure and improved documentation ([d250a07](https://github.com/rimbu-org/rimbu/commit/d250a076300bd9c2cc3c2203b41a1889354c8bc5))


### BREAKING CHANGES

* package structure has changed, added sub-packages





## [0.8.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.8.3...@rimbu/table@0.8.4) (2021-12-22)

**Note:** Version bump only for package @rimbu/table





## [0.8.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.8.2...@rimbu/table@0.8.3) (2021-11-25)

**Note:** Version bump only for package @rimbu/table





## [0.8.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.8.1...@rimbu/table@0.8.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/table





## [0.8.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.8.0...@rimbu/table@0.8.1) (2021-11-24)


### Bug Fixes

* improve collection types and documentation, and fix broken tests ([857d32d](https://github.com/rimbu-org/rimbu/commit/857d32d89d1377809d97aa3d03e6b9b6a40369ad))





# [0.8.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.6...@rimbu/table@0.8.0) (2021-11-20)


### Features

* add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
* improve zipwith, zipallwith, mergewith, mergeallwith methods and fix related tests ([915f9f2](https://github.com/rimbu-org/rimbu/commit/915f9f2ee35e33eb654765ad5fb726da08bfa36c))
* integrate release version of TypeScript 4.5, improve build times ([d684828](https://github.com/rimbu-org/rimbu/commit/d6848281859752c630979e44e8e22c3cbfccf577))


### BREAKING CHANGES

* Some methods are extracted from Stream instances and made static, same for Maps and
Sets. This leads to better variance inference.
* Interfaces for methods like merge and flatten have been moved from instance to
class methods





## [0.7.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.5...@rimbu/table@0.7.6) (2021-10-10)



## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/table





## [0.7.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.4...@rimbu/table@0.7.5) (2021-09-04)

**Note:** Version bump only for package @rimbu/table





## [0.7.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.3...@rimbu/table@0.7.4) (2021-08-21)

**Note:** Version bump only for package @rimbu/table





## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.2...@rimbu/table@0.7.3) (2021-08-20)

**Note:** Version bump only for package @rimbu/table





## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.1...@rimbu/table@0.7.2) (2021-07-23)

**Note:** Version bump only for package @rimbu/table





## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.7.0...@rimbu/table@0.7.1) (2021-07-23)



## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/table





# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.6.2...@rimbu/table@0.7.0) (2021-07-23)


### Features

* add .reducer factory method to collections ([5eb2976](https://github.com/rimbu-org/rimbu/commit/5eb29760ed6b2ce3a739de7663d7d5cacbf12207))





## [0.6.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.6.1...@rimbu/table@0.6.2) (2021-07-07)


### Bug Fixes

* **list, table:** add tests and fix bugs that came out of tests ([c32a62d](https://github.com/rimbu-org/rimbu/commit/c32a62df661c27a8197ebcd4bbf15eff115223cb))





## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.6.0...@rimbu/table@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/table





# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.11...@rimbu/table@0.6.0) (2021-07-02)


### Bug Fixes

* **deno:** add proper getters and setters to abstract classes and implement defined abstract methods ([fad3d0e](https://github.com/rimbu-org/rimbu/commit/fad3d0e42e14a0b792744c9f93d8718900c3472f)), closes [#18](https://github.com/rimbu-org/rimbu/issues/18)


### Features

* added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))


### BREAKING CHANGES

* New compiler settings do not allow function and namespace with same name, impacting
Err and Patch





## [0.5.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10...@rimbu/table@0.5.11) (2021-06-27)

**Note:** Version bump only for package @rimbu/table





## [0.5.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.11...@rimbu/table@0.5.10) (2021-06-10)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.10...@rimbu/table@0.5.10-alpha.11) (2021-06-09)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.9...@rimbu/table@0.5.10-alpha.10) (2021-06-09)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.8...@rimbu/table@0.5.10-alpha.9) (2021-06-09)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.7...@rimbu/table@0.5.10-alpha.8) (2021-06-09)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.6...@rimbu/table@0.5.10-alpha.7) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.5...@rimbu/table@0.5.10-alpha.6) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.4...@rimbu/table@0.5.10-alpha.5) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.3...@rimbu/table@0.5.10-alpha.4) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.2...@rimbu/table@0.5.10-alpha.3) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.1...@rimbu/table@0.5.10-alpha.2) (2021-06-08)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.10-alpha.0...@rimbu/table@0.5.10-alpha.1) (2021-06-07)

**Note:** Version bump only for package @rimbu/table





## [0.5.10-alpha.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.9...@rimbu/table@0.5.10-alpha.0) (2021-06-07)

**Note:** Version bump only for package @rimbu/table





## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.8...@rimbu/table@0.5.9) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.7...@rimbu/table@0.5.8) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.6...@rimbu/table@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.5...@rimbu/table@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.4...@rimbu/table@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.3...@rimbu/table@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.2...@rimbu/table@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/table





## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/table@0.5.1...@rimbu/table@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/table
