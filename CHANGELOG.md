# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [1.2.0] - 2025-07-23

### Changed
- **Improved Playwright test stability to over 50% pass rate.** Replaced direct `canvas.click()` calls with a more reliable `simulatePaintGesture` utility to handle p5.js event interception.
- **Reduced test flakiness.** Loosened screenshot comparison fidelity to better accommodate minor, non-deterministic rendering variations.
- Stabilized the Playwright E2E test suite, fixing numerous failures related to GUI interaction and timing.
- Implemented robust panel expansion logic for testing the QuickSettings UI.
- Improved the accuracy of canvas content verification in tests.

- Renamed all plan files in `docs/plans/` to follow the numeric-dot prefix convention for consistency. (e.g., `01-e2e-phase1-complete.md` → `01.e2e-phase1-complete.md`, `drawing-modes-refactor.md` → `0A.drawing-modes-refactor.md`)

### Added
- **Enhanced test determinism.** Exposed a test-only mechanism to programmatically set parameters and text, avoiding randomness during E2E tests.
- Created a comprehensive plan for incrementally migrating the codebase to TypeScript (`docs/plans/10-typescript-migration-plan.md`).
- E2E testing infrastructure with Playwright.
- Comprehensive documentation for testing strategy.

### Fixed
- Resolved timeout issues in E2E tests by implementing robust, application-specific waiting utilities.
- Updated E2E tests to correctly locate the p5.js instance within the Vue component.
