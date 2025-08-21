# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]


## [1.5.1] - 2025-08-19

### Fixed
- Correct font loading paths for GitHub Pages deployment.

### Changed
- Updated script and .gitignore.

## [1.5.0] - 2025-08-19

### Added
- Initial migration from Nuxt 2 to Nuxt 3.
- Migrated modals to Nuxt 3 and improved functionality.
- Made E2E tests framework-agnostic.

### Fixed
- Resolved font loading issues for UI and canvas.

### Changed
- Updated dependencies for Nuxt 3 migration.
- Migrated nuxt.config.js to nuxt.config.ts for Nuxt 3.
- Updated documentation to reflect Nuxt 3 migration and project state.

## [1.4.1] - 2025-08-05

### Changed
- AI-generated readme with some choice edits; ffmpeg notes moved to the tools folder.
- Documented quicksettings changes from original, updated gemini instructions for messages and changelog.
- Docs: notes on gui in the future.

## [1.4.0] - 2025-08-05

### Added
- Implemented non-destructive zonal painting and transforms.
- Added E2E and unit tests for zonal painting feature.
- Added new plans/roadmap folder.

### Fixed
- Fixed transparency for HSB and Graphics object in `randomLayer`.
- Fixed 2 bugs in draw modes (next/prev and redundant OSD paint op).
- Adjusted layout of introductory paragraphs and h3 in help.vue.
- Updated help.vue with accurate keybindings.
- Unified scaleFactor usage and ensured correct zone coordinate scaling.
- Random preset load now honors bg color and canvas size.

### Changed
- Consolidated commit instructions and added shell safety guidelines.
- Removed pointless .gitignore entry, added some new ones.

## [1.3.0] - 2025-08-02

### Added
- Implemented off-screen rendering for high-resolution output.
- Show app version in About panel; fixed favicon path for subfolder deploy.

### Changed
- Completed documentation review and update.
- Updated drawing-mode-refactor plan with done and todo items.
- Moved e2e plans to dedicated sub-folder.

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
