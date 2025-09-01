# PolychromeText Testing Overview

This document outlines the comprehensive testing strategy for the PolychromeText application, covering unit, integration, and end-to-end (E2E) tests.

## 1. Core Philosophy

Our testing approach balances the need for creative flexibility with the stability required for a reliable application. The strategy is divided into three layers to ensure comprehensive coverage:

1.  **Unit Tests**: For small, isolated pieces of logic.
2.  **Integration Tests**: For interactions between modules.
3.  **End-to-End Tests**: For real-world user scenarios in a browser.

## 2. Unit & Integration Testing

We utilize a modern JavaScript testing framework for unit and integration tests, chosen for its speed, module support, and compatibility with our Vue 2 + Nuxt 2 environment.

-   **Location**: `test/` (excluding the `e2e` subdirectory)
-   **Focus**:
    -   Utility functions (`src/utils/`, `src/drawing-utils.js`)
    -   Core generators (`src/core-generators.js`)
    -   Canvas logic with a mocked p5.js instance
    -   State management and data transformations

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Open the test runner UI
npm run test:ui
```

## 3. End-to-End Testing

We employ a robust browser automation framework for end-to-end tests to catch critical runtime issues that lower-level tests cannot, such as canvas rendering failures, browser-specific bugs, and integration problems between Vue and p5.js.

-   **Location**: `test/e2e/`
-   **Focus**:
    -   Application launch and initialization
    -   Canvas visibility and interactivity
    -   GUI control functionality (drawing modes, parameters, etc.)
    -   Visual consistency of the rendered output

### Running E2E Tests

```bash
# Run all E2E tests headlessly
npm run test:e2e

# Run tests in a visible browser
npm run test:e2e:headed

# Run tests with the interactive UI for debugging
npm run test:e2e:ui
```

### **Critical Lesson: A Framework-Agnostic Testing Approach**

A major challenge in our E2E testing was reliably detecting when the application was fully initialized. Our key finding was that relying on framework-specifics (like the Nuxt or Vue instance) made tests brittle.

**The Solution: Custom, DOM-based Wait Utilities**: We created robust, application-specific waiting functions in `test/e2e/utils/canvas-utils.js` that solve these issues by checking for the actual rendered output:
    -   `waitForP5Ready(page)`: This is the **primary function** to use. It waits for the p5.js canvas element to be present and visible within its container (`#sketch-holder`), ensuring the application is truly ready for interaction, independent of the underlying JS framework.

By using these custom utilities, our tests are now much more stable and accurately reflect the application's true "ready" state.(page)`: This is the **primary function** to use. It waits for the Vue instance to be mounted and for the p5.js instance to be fully initialized within Vue's data.
    -   `waitForNuxtReady(page)`: A helper that confirms the Nuxt application has hydrated.

By using these custom utilities, our tests are now much more stable and accurately reflect the application's true "ready" state.