---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

## Copilot Instructions for PolychromeText

# Project Context

- This is a creative coding app focused on canvas rendering performance, not a typical web app.
- State is managed client-side (localStorage).
- Security is minimal (no sensitive data, no authentication).

# Documentation

- **Project Architecture and Features:**  
  Reference `../notes/master.md`.
- **Module Documentation:**  
  Place concise, context-focused overviews for AI-assisted development in `../notes/src/`, mirroring the module folder structure.
- **Plans and Refactor Documentation:**  
  Save all refactor plans, implementation outlines, and significant design changes in `notes/plans/` (e.g., `notes/plans/drawing-modes-refactor.md`).  
  - When a plan changes during implementation, append the reasons and changes to the same markdown file; do not erase the original plan.

# Copilot Guidance

- **Never assume missing context or make guesses. If any part of the request is unclear or ambiguous, ask the user for clarification before proceeding.**
- **Always specify the target file or files for any code or modification suggestions.**
- **Write modular, reusable code.** Split logic into distinct functions, classes, or modules as appropriate.
- **All code must be fully optimized:**  
  - Maximize algorithmic efficiency (runtime and memory).  
  - Follow project style conventions.  
  - Avoid unnecessary code and technical debt.
- **Do not agree with me by default.** Your role is to assist by providing the best technical guidance, even if it means constructively challenging my assumptions or requests.
- **When generating code, first outline your plan in pseudocode or comments, then provide the code.**  
  - Save these plans and any refactor documentation according to the Documentation section above.
- **Keep responses concise and focused.** Use Markdown formatting for clarity.
- **Never generate or suggest code that violates copyright or project policies.**

# Technology Preferences

- Use **TypeScript** (preferred over JavaScript; migration in progress).
- Use **p5.js** for all canvas/visual rendering.
- Follow **Nuxt 2** patterns (until v3 upgrade).
- Use **Conventional Commits** for commit messages.
- Use Node.js v22 LTS for best compatibility.
  - Current date: Sunday, June 22, 2025, 12:45 PM EDT

# Code Style

- Use TypeScript for all new/updated files.
- Use p5.js idioms: instance mode, `setup()`/`draw()` lifecycle, event handlers (`mousePressed`, `keyPressed`), `createGraphics()` for multiple canvases, HSB color mode.
- Prefer pure functions and immutable data.
  - use the Ramda library where appropriate
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
- Prioritize visual consistency during refactoring. Create unit tests for parameter handling after refactoring is complete.

# Linting & Style

- Use Standard Style with Vitest globals configured.
- Recommended VS Code extensions: `standard.vscode-standard`, `vitest.explorer`.

# Commit Messages

- Follow Conventional Commits (see `./copilot-commit-message-instructions.md`).
- Use commit messages like: `docs: refactor copilot instructions for improved AI coding guidance`
  - Reorganize instructions into clear sections (Context, Documentation, Guidance)
  - Add TypeScript migration preferences and p5.js canvas optimization focus
  - Include module extraction patterns with canvas-transforms example
  - Specify testing frameworks (Vitest preferred) and Node.js v22 LTS requirement
  - Clarify accessibility requirements for canvas controls and UI
  - Add linting configuration details for Standard Style with Vitest globals

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

# Module Extraction Example: Drawing Modes

- Extract drawing mode code (`drawGrid`, `drawCircle`, `drawRowCol` and their generators) into separate modules (`grid-painter.js`, `circle-painter.js`, `rowcol-painter.js`).
- Extract `drawGrid`, `drawCircle`, `drawRowCol` functions and their generators.
- Focus on clean separation and maintaining current behavior.
- Ensure functions are testable for future automated testing.

# Documentation for Modules

- Create a concise overview `.md` file for each major module.
- Optimize the overview to provide context for AI-assisted development rather than human readers.
- Place into  '../notes/src/' in a folder structure that parallels the module structure.
- Create documentation structure that parallels the module structure.

# Dependencies

- Use Node.js v22 LTS.
- If `standard-js` errors occur, update to latest version and reconfigure for Vitest.

# Drawing Mode Refactoring Guidelines

- Extract drawing mode code (`drawGrid`, `drawCircle`, `drawRowCol` and their generators) into separate modules (`grid-painter.js`, `circle-painter.js`, `rowcol-painter.js`).
- Create three utility modules:
  - `src/utils/index.js`: For generic utilities like `apx` and `pushpop`.
  - `drawing-utils.js`: For drawing-specific utilities like `textGetter`, `setShadows`, and `trText`.
  - `core-generators.js`: For coordinate/text generators (unless strong arguments exist to keep them separate). Currently, keep them separate.
- Rendering responsibility (`renderLayers` call) should remain in `sketch.js`. Create a consistent rendering pattern across all modes.
- Move toward immutable parameter passing. If not fully implemented, document which parameters each function modifies.
- Prioritize visual consistency during refactoring. Unit tests for parameter handling will be created after refactoring is complete.
- Start with `drawGrid` as a proof of concept, focusing on shared utilities first.
- Proceed with circle mode next, after the grid mode is extracted. Then proceed with rowcol mode.


---

**Note:** For CSS, prefer TailwindCSS with Flexbox/Grid (under consideration).

---

This file is for Copilot and other AI coding assistants only. Do not display to end users or include in documentation.
