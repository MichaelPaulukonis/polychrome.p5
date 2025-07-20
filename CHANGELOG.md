# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Stabilized the Playwright E2E test suite, fixing numerous failures related to GUI interaction and timing.
- Implemented robust panel expansion logic for testing the QuickSettings UI.
- Improved the accuracy of canvas content verification in tests.

### Added
- Created a comprehensive plan for incrementally migrating the codebase to TypeScript (`docs/plans/10-typescript-migration-plan.md`).
- E2E testing infrastructure with Playwright.
- Comprehensive documentation for testing strategy.

### Changed
- Updated E2E tests to correctly locate the p5.js instance within the Vue component.

### Fixed
- Resolved timeout issues in E2E tests by implementing robust, application-specific waiting utilities.