# 01-require-context-refactoring.md

## Problem Statement

The current usage of `require.context` in `sketch.js` (specifically for font loading) creates challenges for unit testing in environments like Vitest (which runs on Node.js). `require.context` is a Webpack-specific API resolved at build time, not runtime. This leads to `TypeError: require.context is not a function` errors when `sketch.js` is imported directly into a test file, necessitating complex and often brittle mocking strategies.

## Impact on Testability

*   **Build-time vs. Runtime:** The fundamental mismatch between Webpack's build-time resolution and Node.js's runtime execution makes direct imports problematic.
*   **Complex Mocking:** Current workarounds involve global stubbing of `require` or `vi.mock` for the entire module, which can be difficult to maintain, less precise, and may hide other issues.
*   **Coupling:** The font loading logic is tightly coupled with `sketch.js`, making it harder to test `sketch.js` in isolation from its font dependencies.

## Proposed Refactoring

The goal is to decouple the font loading mechanism from the core `sketch.js` logic, making it more amenable to dependency injection or simpler mocking.

### 1. Centralized Font Loading Utility:

Create a dedicated utility file (e.g., `src/utils/fontLoader.js`) that encapsulates the `require.context` logic.

```javascript
// src/utils/fontLoader.js
// This file would contain the require.context logic
const fontsContext = require.context('@/assets/fonts', false, /\.ttf$/);

export const loadFonts = (p5Instance) => {
  const fontList = {};
  fontsContext.keys().forEach((fontPath) => {
    const fontName = fontPath.replace(/\.\/(.*?)\.ttf/, '$1');
    fontList[fontName] = p5Instance.loadFont(fontsContext(fontPath));
  });
  return fontList;
};
```

### 2. Update `sketch.js` to use the Utility:

`sketch.js` would then import and call this `loadFonts` function.

```javascript
// src/sketch.js
import { loadFonts } from '@/src/utils/fontLoader.js';
// ...
p5.preload = () => {
  // Now, loadFonts is a function that can be easily mocked
  fontList = loadFonts(p5);
  // ...
};
```

## Benefits for Testability

*   **Simplified Mocking:** In tests, you could then use `vi.mock('@/src/utils/fontLoader.js', () => ({ loadFonts: vi.fn(() => ({ /* mock font list */ })) }))` at the top of your test file. This completely bypasses the `require.context` issue in `sketch.js`'s tests, as you're mocking the *result* of the font loading, not the mechanism itself.
*   **Improved Modularity:** The font loading concern is encapsulated, making `sketch.js` cleaner and more focused on its primary responsibilities.
*   **Clearer Dependencies:** Dependencies are explicitly passed or imported, improving code readability and maintainability.

## Roadmap Integration

This refactoring is a good candidate for a **"Technical Debt / Testability Improvement"** item on the project roadmap. It's not a critical bug, but it's a good practice to decouple build-time specifics from runtime logic for better testability and potentially more flexible build configurations in the future.
