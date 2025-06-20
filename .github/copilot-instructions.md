## Optimized Copilot Instructions for PolychromeText

---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

# Project Context

- This is a creative coding app focused on canvas rendering performance, not a typical web app.
- State is managed client-side (localStorage).
- Security is minimal (no sensitive data, no authentication).

# Documentation

- For project architecture and features, reference: `../notes/master.md`

# Copilot Guidance

- Do not assume missing context. If unsure, ask the user for specifics.
- Always state the target file for any code response.
- Write modular, reusable code—split logic into components and modules.
- All code must be fully optimized: maximize algorithmic efficiency (runtime and memory), follow project style conventions, and avoid unnecessary code (no technical debt).

# Technology Preferences

- Use **TypeScript** (preferred over JavaScript; migration in progress).
- Use **p5.js** for all canvas/visual rendering.
- Follow **Nuxt 2** patterns (until v3 upgrade).
- Use **Conventional Commits** for commit messages.

# Code Style

- Use TypeScript for all new/updated files.
- Use p5.js idioms: instance mode, `setup()`/`draw()` lifecycle, event handlers (`mousePressed`, `keyPressed`), `createGraphics()` for multiple canvases, HSB color mode.
- Prefer pure functions and immutable data.
- Use `~/` for project root imports.
- Type all function parameters and return values.
- camelCase for variables/functions, PascalCase for classes/components.
- Document complex canvas operations and color algorithms.
- Handle canvas errors gracefully.

# Framework Patterns

- Use Vue SFCs with the composition pattern.
- Persist state via localStorage.
- Optimize for canvas rendering performance.

# Accessibility

- Use semantic HTML for UI controls.
- Ensure keyboard accessibility for canvas controls.
- Maintain WCAG 2.1 AA color contrast for UI.

# Testing

- Test utility functions (color, coordinates, text).
- Mock p5.js for canvas logic tests.
- Validate UI parameter ranges.
- Test localStorage save/load.
- Use Vitest (preferred) or Jest for utility tests.
- Use Node.js v22 LTS for best compatibility.

# Linting & Style

- Use Standard Style with Vitest globals configured.
- Recommended VS Code extensions: `standard.vscode-standard`, `vitest.explorer`.

# Commit Messages

- Follow Conventional Commits (see `./copilot-commit-message-instructions.md`).

# Module Extraction Example: Canvas Transforms

- Extract canvas transform logic from `sketch.js` to `canvas-transforms` module.
- Use factory pattern: `createCanvasTransforms(dependencies)`.
- Pure functions (`flipCore`, `mirrorCore`) should be isolated for testing.
- Export constants: `HORIZONTAL`, `VERTICAL`.
- File structure:
  ```
  src/
    canvas-transforms/
      index.js
      core-transforms.js
  ```
- Ensure variables used outside `setup()` are declared at module scope.
- Instantiate module-level objects after dependencies are available in `setup()`.

# Documentation for Modules

- Create a concise overview `.md` file for each major module.

# Dependencies

- Use Node.js v22 LTS.
- If `standard-js` errors occur, update to latest version and reconfigure for Vitest.

---

**Note:** For CSS, prefer TailwindCSS with Flexbox/Grid (under consideration).

---

This file is for Copilot and other AI coding assistants only. Do not display to end users or include in documentation.
