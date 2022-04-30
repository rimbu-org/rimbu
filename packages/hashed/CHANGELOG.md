# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.7.2...@rimbu/hashed@0.7.3) (2021-11-25)

**Note:** Version bump only for package @rimbu/hashed





## [0.7.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.7.1...@rimbu/hashed@0.7.2) (2021-11-25)

**Note:** Version bump only for package @rimbu/hashed





## [0.7.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.7.0...@rimbu/hashed@0.7.1) (2021-11-24)


### Bug Fixes

* improve collection types and documentation, and fix broken tests ([857d32d](https://github.com/rimbu-org/rimbu/commit/857d32d89d1377809d97aa3d03e6b9b6a40369ad))





# [0.7.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.8...@rimbu/hashed@0.7.0) (2021-11-20)


### Features

* add typescript 4.5 rc compatibility and remove need to enable noStrictGenericChecks ([056dd8a](https://github.com/rimbu-org/rimbu/commit/056dd8a998ae4064570481fb7a9396326c0ca131))
* improve zipwith, zipallwith, mergewith, mergeallwith methods and fix related tests ([915f9f2](https://github.com/rimbu-org/rimbu/commit/915f9f2ee35e33eb654765ad5fb726da08bfa36c))
* integrate release version of TypeScript 4.5, improve build times ([d684828](https://github.com/rimbu-org/rimbu/commit/d6848281859752c630979e44e8e22c3cbfccf577))


### BREAKING CHANGES

* Some methods are extracted from Stream instances and made static, same for Maps and
Sets. This leads to better variance inference.
* Interfaces for methods like merge and flatten have been moved from instance to
class methods





## [0.6.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.7...@rimbu/hashed@0.6.8) (2021-10-10)



## 0.6.11 (2021-10-10)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.6...@rimbu/hashed@0.6.7) (2021-09-04)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.5...@rimbu/hashed@0.6.6) (2021-08-20)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.4...@rimbu/hashed@0.6.5) (2021-07-23)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.3...@rimbu/hashed@0.6.4) (2021-07-23)



## 0.6.5 (2021-07-23)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.2...@rimbu/hashed@0.6.3) (2021-07-23)


### Bug Fixes

* replace abstract readonly with abstract getters because deno treats it differently than node ([46e6ffe](https://github.com/rimbu-org/rimbu/commit/46e6ffe982d4bc47ed240d0b1a1b8118ae9ecbc7))





## [0.6.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.1...@rimbu/hashed@0.6.2) (2021-07-07)

**Note:** Version bump only for package @rimbu/hashed





## [0.6.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.6.0...@rimbu/hashed@0.6.1) (2021-07-04)

**Note:** Version bump only for package @rimbu/hashed





# [0.6.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.11...@rimbu/hashed@0.6.0) (2021-07-02)


### Bug Fixes

* **deno:** add proper getters and setters to abstract classes and implement defined abstract methods ([fad3d0e](https://github.com/rimbu-org/rimbu/commit/fad3d0e42e14a0b792744c9f93d8718900c3472f)), closes [#18](https://github.com/rimbu-org/rimbu/issues/18)


### Features

* added support for deno ([7240c99](https://github.com/rimbu-org/rimbu/commit/7240c998904822e098d2abf6e8e6deda4f165f11))


### BREAKING CHANGES

* New compiler settings do not allow function and namespace with same name, impacting
Err and Patch





## [0.5.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10...@rimbu/hashed@0.5.11) (2021-06-27)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.11...@rimbu/hashed@0.5.10) (2021-06-10)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.11](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.10...@rimbu/hashed@0.5.10-alpha.11) (2021-06-09)


### Bug Fixes

* **hashed:** remove more circular dependencies ([07d8131](https://github.com/rimbu-org/rimbu/commit/07d81313fc0e8c917f4d206600f35a0f7eaee88a))





## [0.5.10-alpha.10](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.9...@rimbu/hashed@0.5.10-alpha.10) (2021-06-09)


### Bug Fixes

* **hashed:** other attempt to load hashed in codesandbox ([ee677f0](https://github.com/rimbu-org/rimbu/commit/ee677f03180e96e483e47e895e81b54f8258e1c9))





## [0.5.10-alpha.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.8...@rimbu/hashed@0.5.10-alpha.9) (2021-06-09)


### Bug Fixes

* **hashed:** remove some circular dependencies ([9e832fe](https://github.com/rimbu-org/rimbu/commit/9e832fe513d32ee29c170d2a1b434bb1ce746eb9))





## [0.5.10-alpha.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.7...@rimbu/hashed@0.5.10-alpha.8) (2021-06-09)


### Bug Fixes

* **hashed:** change imports to fix codesandbox loading ([5e13066](https://github.com/rimbu-org/rimbu/commit/5e13066de878bded8651cee6a92d3b94c521b626))





## [0.5.10-alpha.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.6...@rimbu/hashed@0.5.10-alpha.7) (2021-06-08)


### Bug Fixes

* **hashed:** reorder imports for codesandbox ([bc6a4dd](https://github.com/rimbu-org/rimbu/commit/bc6a4dd48bdb3573c4e283fb4643b88c2cdaff99))





## [0.5.10-alpha.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.5...@rimbu/hashed@0.5.10-alpha.6) (2021-06-08)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.4...@rimbu/hashed@0.5.10-alpha.5) (2021-06-08)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.3...@rimbu/hashed@0.5.10-alpha.4) (2021-06-08)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.2...@rimbu/hashed@0.5.10-alpha.3) (2021-06-08)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.1...@rimbu/hashed@0.5.10-alpha.2) (2021-06-08)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.10-alpha.0...@rimbu/hashed@0.5.10-alpha.1) (2021-06-07)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.10-alpha.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.9...@rimbu/hashed@0.5.10-alpha.0) (2021-06-07)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.9](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.8...@rimbu/hashed@0.5.9) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.8](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.7...@rimbu/hashed@0.5.8) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.7](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.6...@rimbu/hashed@0.5.7) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.6](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.5...@rimbu/hashed@0.5.6) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.5](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.4...@rimbu/hashed@0.5.5) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.3...@rimbu/hashed@0.5.4) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.2...@rimbu/hashed@0.5.3) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed





## [0.5.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/hashed@0.5.1...@rimbu/hashed@0.5.2) (2021-06-06)

**Note:** Version bump only for package @rimbu/hashed
