# Repository Analysis: polychrome.p5

## 1. Project Overview
The `polychrome.p5` project is a creative coding application built with Nuxt.js (Vue 2) and p5.js. Its primary focus is on optimizing canvas rendering performance and enabling interactive transformations. The application provides a platform for artistic expression through code, leveraging the capabilities of p5.js for drawing and Nuxt.js for a structured web application environment.

## 2. Key Commands

The following commands are essential for development and maintenance:

-   **Run tests:** `npm test`
-   **Run linter:** `npm run lint`
-   **Run development server:** `npm run dev`

## 3. Technology Stack

The core technologies used in this project include:

-   **Nuxt.js (Vue 2):** A progressive Vue.js framework used for server-side rendering, static site generation, and single-page applications. It provides a structured approach to building Vue.js applications.
-   **p5.js:** A JavaScript library for creative coding, with a focus on making coding accessible for artists, designers, educators, and beginners. It is used here for canvas drawing and interactive graphics.
-   **Node.js:** The JavaScript runtime environment.
-   **npm:** Node Package Manager, used for managing project dependencies.

## 4. Folder Structure Overview

The project follows a standard Nuxt.js folder structure with additional directories for creative coding assets and development utilities:

-   `.github/`: Contains GitHub-specific configurations, including issue templates, workflows, and AI instructions.
-   `.nuxt/`: Nuxt.js build output directory (generated).
-   `.specstory/`: Contains files related to Specstory, likely for AI-driven development or documentation.
-   `.taskmaster/`: Taskmaster configuration and task management files.
-   `.vscode/`: VS Code specific settings and configurations.
-   `assets/`: Stores static assets such as images, default GUI settings, and CSS/script files.
-   `components/`: Vue.js components used across the application (e.g., modals, playback controls).
-   `data/`: Contains application data, including backups and a Chroma DB for embeddings.
-   `dev.utilities/`: Development-specific scripts and configurations.
-   `dist/`: Production build output directory (generated).
-   `docs/`: Project documentation, including analysis reports, notes, and plans.
-   `layouts/`: Vue.js layout components.
-   `modules/`: Nuxt.js modules, such as the font loader.
-   `node_modules/`: Installed Node.js dependencies.
-   `pages/`: Vue.js page components, defining application routes.
-   `plugins/`: Nuxt.js plugins.
-   `public/`: Publicly accessible static files (e.g., favicon, fonts).
-   `src/`: Core application source code, including p5.js sketches, canvas transformations, color utilities, drawing modes, GUI logic, scripting, text handling, undo/redo functionality, and general utilities. This directory is modularized to manage complexity.
-   `test/`: Contains unit and end-to-end tests for various parts of the application, including canvas transforms, drawing modes, and undo/redo.
-   `test-results/`: Output directory for test results.
-   `tools/`: Custom development tools.

## 5. Testing Strategy

The project utilizes `npm test` for running tests. The `test/` directory contains a comprehensive suite of tests, including:

-   `canvas-transforms.test.js`: Tests for canvas transformation logic.
-   `core-generators.test.js`: Tests for core generation functionalities.
-   `drawing-mode-painters.test.js`: Tests for different drawing modes.
-   `drawing-utils.test.js`: Tests for general drawing utilities.
-   `polychrome.test.js`: High-level tests for the application.
-   `undo.layers.test.js`: Tests for the undo/redo layer functionality.
-   `utils.test.js`: General utility function tests.
-   `e2e/`: End-to-end tests.
-   `fixtures/`: Test data.
-   `fonts/`: Font-related test assets.
-   `zone/`: Zonal painting tests.

The presence of `vitest.config.js` suggests that Vitest is the testing framework used.

## 6. Linting and Code Style

The project enforces code style and quality through linting, executed via `npm run lint`. The `.eslintrc.js` file defines the ESLint configuration, ensuring consistent code formatting and adherence to best practices. This helps maintain code readability and reduces potential errors.