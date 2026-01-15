# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.4](https://github.com/rimbu-org/rimbu/compare/@rimbu/task@2.0.3...@rimbu/task@2.0.4) (2026-01-15)

**Note:** Version bump only for package @rimbu/task

## [2.0.3](https://github.com/rimbu-org/rimbu/compare/@rimbu/task@2.0.2...@rimbu/task@2.0.3) (2026-01-15)

**Note:** Version bump only for package @rimbu/task

## [2.0.2](https://github.com/rimbu-org/rimbu/compare/@rimbu/task@2.0.1...@rimbu/task@2.0.2) (2025-11-28)

**Note:** Version bump only for package @rimbu/task

## [2.0.1](https://github.com/rimbu-org/rimbu/compare/@rimbu/task@2.0.0...@rimbu/task@2.0.1) (2025-11-25)

**Note:** Version bump only for package @rimbu/task

# 2.0.0 (2025-11-23)

### Bug Fixes

- **task:** remove usage of Promise.withResolvers ([c72e147](https://github.com/rimbu-org/rimbu/commit/c72e14701f9d363201a1ea8cee94f1657aea1c3c))

### Features

- **task:** add the @rimbu/task package to support structural concurrency ([7868678](https://github.com/rimbu-org/rimbu/commit/7868678f937c6381adc01215592fa8fbc613e0c0))

### BREAKING CHANGES

- **task:** Mutex now extends Semaphore, and the acquire method now accepts cancellation
  options
