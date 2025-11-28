# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@2.0.1...@rimbu/channel@2.0.2) (2025-11-28)

**Note:** Version bump only for package @rimbu/channel

## [2.0.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@2.0.0...@rimbu/channel@2.0.1) (2025-11-25)

**Note:** Version bump only for package @rimbu/channel

# [2.0.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.3.2...@rimbu/channel@2.0.0) (2025-11-23)

### Bug Fixes

- **channel:** remove Promise.withResolvers usage ([556258f](https://github.com/rimbu-org/rimbu/commit/556258fed0b48541c686c4deb3f463764cd96648))

### Features

- **task:** add the @rimbu/task package to support structural concurrency ([7868678](https://github.com/rimbu-org/rimbu/commit/7868678f937c6381adc01215592fa8fbc613e0c0))

### BREAKING CHANGES

- **task:** Mutex now extends Semaphore, and the acquire method now accepts cancellation
  options

## [0.3.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.3.1...@rimbu/channel@0.3.2) (2025-05-16)

**Note:** Version bump only for package @rimbu/channel

## [0.3.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.3.0...@rimbu/channel@0.3.1) (2024-03-05)

**Note:** Version bump only for package @rimbu/channel

# [0.3.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.2.0...@rimbu/channel@0.3.0) (2024-02-14)

### Features

- refactor Stream package, add more reducers and Stream methods ([6840c4f](https://github.com/rimbu-org/rimbu/commit/6840c4f28bf45767bd3019835b3abbaa51ccf311))

# [0.2.0](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.1.1...@rimbu/channel@0.2.0) (2024-01-26)

### Features

- major API improvements accross all packages, performance improvements for newer runtimes ([312e473](https://github.com/rimbu-org/rimbu/commit/312e473261696a8e8749399491b9fd29bb5c38ec))

### BREAKING CHANGES

- Many methods now take an options object instead of positional arguments for
  readability

## [0.1.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/channel@0.1.0...@rimbu/channel@0.1.1) (2023-12-09)

**Note:** Version bump only for package @rimbu/channel

# 0.1.0 (2023-07-29)

### Bug Fixes

- replace usage of optlazy by asyncoptlazy ([88d41bc](https://github.com/rimbu-org/rimbu/commit/88d41bcdc1ba265a4b07835b4501bb1f6f9dde1e))

### Features

- add @rimbu/channel package ([6518576](https://github.com/rimbu-org/rimbu/commit/65185763e97e2ddc3aa2c543c3b7a96d069c8dcd))
- update tslib version and extend channel documentation ([6eb46d0](https://github.com/rimbu-org/rimbu/commit/6eb46d07b9b7469febd316306146b04f43b1ebb5))
