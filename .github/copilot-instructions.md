# Copilot Instructions for PolychromeText

## 1. Project Context

This is a **creative coding app focused on canvas rendering performance**, not a typical web app. PolychromeText is built with Vue.js/Nuxt 2 and p5.js for high-performance text and visual rendering on HTML5 canvas.

## 2. Technology Stack

When suggesting code, please use the following technologies:

- **Vue.js** with Nuxt 2 framework using Single File Components (SFCs)
- **p5.js** for all canvas and visual rendering operations
- **TypeScript** (preferred over JavaScript; migration in progress)
- **Ramda** library for functional programming utilities
- **localStorage** for client-side state persistence
- **Vitest** (preferred) or Jest for utility function testing
- **Standard Style** for code formatting and linting

## 3. Project Structure

Follow the creative coding architecture with clear separation:

**Core Application (`src/`):**
- **components/**: Vue SFC components for UI controls
- **pages/**: Nuxt page components and route handlers
- **canvas-transforms/**: Canvas transformation utilities (flip, mirror, etc.)
- **drawing-modes/**: Extracted drawing mode modules
  - **grid-painter.js**: Grid drawing functionality
  - **circle-painter.js**: Circle drawing functionality  
  - **rowcol-painter.js**: Row/column drawing functionality
- **utils/**: Generic utility functions (`apx`, `pushpop`)
- **drawing-utils.js**: Drawing-specific utilities (`textGetter`, `setShadows`, `trText`)
- **core-generators.js**: Coordinate and text generation functions
- **sketch.js**: Main p5.js sketch file and rendering controller

**Documentation (`docs/`):**
- **master.md**: Project architecture and features reference
- **src/**: Module documentation mirroring source structure
- **plans/**: Refactor plans and implementation outlines

**Configuration:**
- **data/**: Local data storage (gitignored)
- **prisma/**: Not applicable (no database)
- **tests/**: Unit and integration tests

## 4. Coding Standards

1. Use Standard Style with Vitest globals configured for consistent formatting.

2. **Prefer TypeScript** for all new files with comprehensive typing.

3. Follow consistent naming conventions:
   - Components: PascalCase (`GridPainter`, `CanvasTransform`)
   - Files and modules: kebab-case (`grid-painter.js`, `canvas-transforms`)
   - Variables and functions: camelCase (`drawGrid`, `flipHorizontal`)
   - Constants: UPPER_SNAKE_CASE (`HORIZONTAL`, `VERTICAL`)

4. Use async/await for asynchronous operations where applicable.

5. **Vue SFC Structure**: Always follow this order for consistency:
   ```vue
   <template>
     <!-- Component template -->
   </template>
   
   <script>
   // 1. Imports (external libraries first, then internal)
   import { mapState, mapActions } from 'vuex'
   import { someUtility } from '~/utils'
   
   // 2. Component definition with composition pattern
   export default {
     name: 'ComponentName',
     
     // 3. Props and data
     props: {
       canvasWidth: {
         type: Number,
         required: true
       }
     },
     
     // 4. Computed properties
     computed: {
       ...mapState(['currentMode'])
     },
     
     // 5. Methods
     methods: {
       ...mapActions(['updateCanvas']),
       
       handleCanvasUpdate() {
         // Method implementation
       }
     }
   }
   </script>
   
   <style scoped>
   /* Component styles */
   </style>
   ```

6. **p5.js Patterns**: Use instance mode with proper lifecycle management:
   ```javascript
   // Use instance mode
   const sketch = (p) => {
     let canvasTransforms
     
     p.setup = () => {
       p.createCanvas(800, 600)
       p.colorMode(p.HSB)
       canvasTransforms = createCanvasTransforms({ p })
     }
     
     p.draw = () => {
       // Drawing logic
     }
     
     p.mousePressed = () => {
       // Event handling
     }
   }
   ```

## 5. Mandatory Planning Process

**CRITICAL**: All development work must follow this planning process before any code implementation.

### 5.1 Plan-File Requirement

1. **Before Any Code Changes**  
   ALL feature requests, architectural changes, or significant modifications must begin with creating—or reusing—an appropriate plan-file in `docs/plans/`.

2. **User Confirmation Protocol**  
   When a user requests changes:

   1. **Inspect for Existing Plans**  
      - If you find one or more candidate files in `docs/plans/`, present:  
        > "I've found an existing plan-file (`NN.semantic-name.md`) that seems relevant.  
        > **Options:**  
        > 1. Update & use this plan  
        > 2. Draft a new plan-file  
        > 3. Proceed without a plan-file"  

   2. **Fallback to Creation Prompt**  
      - If no suitable candidate exists, ask:  
        > "No plan-file covers this change.  
        > **Options:**  
        > 1. Create a new plan-file now  
        > 2. Proceed without a plan-file"  

   3. **Honor the User's Choice**  
      - If they pick "proceed without…," continue directly to step 3 of the **Implementation Workflow**.  
      - Do **not** re-prompt on that same change request.

3. **Plan-File Naming Convention**  
   ```
   Format: NN.semantic-name.md or XA.semantic-name.md
   
   Examples:
   - 0A.drawing-modes-refactor.md (renamed historical plan)
   - 10.typescript-migration-plan.md (sequential numbering)
   - 15.offscreen-rendering-enhancement.md (current plan)
   
   Rules:
   - Two-digit prefix (01-99) for ordering, or XA for historical plans
   - Dot separator after number/letter combination
   - Kebab-case for semantic name
   - .md extension
   - Sequential numbering for chronological order
   - Use XA prefix for plans that pre-date e2e planning (temporal primacy indicator)
   ```

4. **Required Plan Contents**  
   - **Problem Statement**  
   - **Requirements** (functional & non-functional)  
   - **Technical Approach**  
   - **Implementation Steps**  
   - **Testing Strategy**  
   - **Risks & Mitigation**  
   - **Dependencies**

### 5.1.1 How to Plan Better

Our recent work has highlighted a few ways we can improve our planning process for the future:

1.  **More Thorough Upfront Analysis:** Before creating a plan, we should do a thorough analysis of the existing code that will be affected. This will help us to identify potential issues and to create a more robust plan from the start.
2.  **Consider the "What Ifs":** When creating a plan, we should try to consider all the possible "what ifs". For example, what if we want to add new features in the future? What if the user wants to undo an action? By considering these possibilities upfront, we can create a more flexible and extensible plan.
3.  **Embrace Non-Destructive Workflows:** As a general principle, we should try to embrace non-destructive workflows whenever possible. This will make our code more flexible and easier to maintain in the long run.
4.  **Iterate on the Plan:** It's okay to iterate on the plan as we learn more about the problem. Creating a separate analysis document, as we did with `zonal-analysis.md`, is a great way to do this. It allows us to correct the course of the project and to create a much better solution in the end.

5. **Exceptions and Scope**  
   - **Plan-file creation itself**  
   - **Documentation updates** (README tweaks, comments)  
   - **Minor bug fixes** (single-line or typo corrections)  
   - **All other significant work** requires a plan-file.

### 5.2 Implementation Workflow

1. **Detect or Create Plan**  
   - **Detect**: Scan `docs/plans/` for an existing relevant plan-file.  
   - **Create**: If none found (or user opts for a new file), generate `NN.semantic-name.md` with the required sections.  
2. **Review & Approve**  
3. **Implement Code**  
4. **Test** (per the plan's Testing Strategy)  
5. **Merge & Close Plan**

## 6. Copilot Guidance

- **Never assume missing context or make guesses. If any part of the request is unclear or ambiguous, ask the user for clarification before proceeding.**
- **Always specify the target file or files for any code or modification suggestions.**
- **Write modular, reusable code.** Split logic into distinct functions, classes, or modules as appropriate.
- **All code must be fully optimized:**  
  - Maximize algorithmic efficiency (runtime and memory).  
  - Follow project style conventions.  
  - Avoid unnecessary code and technical debt.
- **Do not agree with me by default.** Your role is to assist by providing the best technical guidance, even if it means constructively challenging my assumptions or requests.
- **When generating code, first outline your plan in pseudocode or comments, then provide the code.**  
  - Save these plans and any refactor documentation according to the Documentation section.
- **Keep responses concise and focused.** Use Markdown formatting for clarity.
- **After implementing new features or completing a refactoring task, ask the user if the documentation in `docs/` needs to be updated to reflect the changes.**
- **Never generate or suggest code that violates copyright or project policies.**

## 7. Canvas and p5.js Best Practices

1. **Instance Mode**: Always use p5.js instance mode for better encapsulation:
   ```javascript
   const sketch = (p) => {
     // All p5.js code uses p. prefix
     p.setup = () => {
       p.createCanvas(800, 600)
       p.colorMode(p.HSB)
     }
   }
   new p5(sketch, canvasContainer)
   ```

2. **Performance Optimization**: Focus on efficient canvas operations:
   - Use `p.createGraphics()` for multiple canvas layers
   - Minimize `p.push()` and `p.pop()` calls
   - Cache complex calculations outside draw loop
   - Use `p.noStroke()` and `p.noFill()` strategically

3. **Event Handling**: Implement proper canvas event handlers:
   ```javascript
   p.mousePressed = () => {
     // Handle mouse events
   }
   
   p.keyPressed = () => {
     // Handle keyboard events
   }
   ```

4. **Color Management**: Use HSB color mode for better color manipulation:
   ```javascript
   p.setup = () => {
     p.colorMode(p.HSB, 360, 100, 100, 100)
   }
   ```

5. **Canvas Error Handling**: Implement graceful error handling for canvas operations:
   ```javascript
   try {
     // Canvas operations
     p.drawingContext.save()
     // Complex drawing operations
     p.drawingContext.restore()
   } catch (error) {
     console.error('Canvas operation failed:', error)
     // Fallback or recovery logic
   }
   ```

## 8. Drawing Mode Implementation

### 8.1 Drawing Mode Architecture

Extract drawing mode code into separate modules following this pattern:

```javascript
// grid-painter.js
export const createGridPainter = (dependencies) => {
  const { p, textGetter, setShadows } = dependencies
  
  return {
    drawGrid: (params) => {
      // Grid drawing implementation
    },
    
    generateGridCoordinates: (params) => {
      // Grid coordinate generation
    }
  }
}
```

### 8.2 Drawing Mode Extraction Guidelines

- Extract `drawGrid`, `drawCircle`, `drawRowCol` functions and their generators
- Create three utility modules:
  - `src/utils/index.js`: Generic utilities (`apx`, `pushpop`)
  - `drawing-utils.js`: Drawing-specific utilities (`textGetter`, `setShadows`, `trText`)
  - `core-generators.js`: Coordinate/text generators
- Rendering responsibility (`renderLayers` call) remains in `sketch.js`
- Create consistent rendering pattern across all modes
- Move toward immutable parameter passing
- Prioritize visual consistency during refactoring
- Start with `drawGrid` as proof of concept, then `drawCircle`, then `drawRowCol`

### 8.3 Module Factory Pattern

Use factory pattern for module creation:

```javascript
// canvas-transforms/index.js
export const createCanvasTransforms = (dependencies) => {
  const { p } = dependencies
  
  return {
    flipHorizontal: () => {
      // Implementation
    },
    
    flipVertical: () => {
      // Implementation
    }
  }
}
```

## 9. State Management

1. **Client-Side State**: Use localStorage for persistence:
   ```javascript
   // Save state
   const saveState = (state) => {
     localStorage.setItem('polychrome-state', JSON.stringify(state))
   }
   
   // Load state
   const loadState = () => {
     const saved = localStorage.getItem('polychrome-state')
     return saved ? JSON.parse(saved) : getDefaultState()
   }
   ```

2. **Canvas State**: Manage canvas-specific state separately:
   ```javascript
   const canvasState = {
     currentMode: 'grid',
     parameters: {},
     transforms: [],
     layers: []
   }
   ```

3. **Vuex Integration**: Use Vuex for complex state management when needed:
   ```javascript
   // store/canvas.js
   export const state = () => ({
     currentMode: 'grid',
     canvasWidth: 800,
     canvasHeight: 600
   })
   
   export const mutations = {
     SET_MODE(state, mode) {
       state.currentMode = mode
     }
   }
   ```

## 10. Testing Strategy

Follow a **testing-first** approach when practical, but strict Test-Driven Development (TDD) is not required.

> **Constraint**: Backend logic must be tested before implementing any dependent frontend components.

> **Constraint**: Tests must be passing before committing code, unless spcific user override is given.

### 10.1 Unit Tests

Use **Vitest** for testing utility functions and canvas logic:

```javascript
import { describe, it, expect } from 'vitest'
import { apx, pushpop } from '../utils'

describe('apx utility', () => {
  it('should approximate pixel values correctly', () => {
    expect(apx(10.7)).toBe(11)
    expect(apx(10.3)).toBe(10)
  })
})
```

### 10.2 Canvas Logic Tests

Mock p5.js for canvas logic testing:

```javascript
import { describe, it, expect, vi } from 'vitest'
import { createGridPainter } from '../grid-painter'

// Mock p5.js
const mockP5 = {
  rect: vi.fn(),
  fill: vi.fn(),
  noFill: vi.fn(),
  stroke: vi.fn()
}

describe('GridPainter', () => {
  it('should generate correct grid coordinates', () => {
    const painter = createGridPainter({ p: mockP5 })
    const coords = painter.generateGridCoordinates({ rows: 2, cols: 2 })
    expect(coords).toHaveLength(4)
  })
})
```

### 10.3 Parameter Validation Tests

Test UI parameter ranges and validation:

```javascript
describe('Parameter validation', () => {
  it('should validate canvas dimensions', () => {
    expect(validateCanvasSize(800, 600)).toBe(true)
    expect(validateCanvasSize(-100, 600)).toBe(false)
  })
})
```

### 10.4 localStorage Tests

Test state persistence:

```javascript
describe('State persistence', () => {
  it('should save and load state correctly', () => {
    const testState = { mode: 'grid', params: {} }
    saveState(testState)
    expect(loadState()).toEqual(testState)
  })
})
```

### 10.5 End-to-End Tests

* Use **Playwright** to validate user flows, especially for canvas interactions.
* Follow the patterns established in `test/e2e/utils/canvas-utils.js`.

```javascript
import { test, expect } from '@playwright/test'
import {
  waitForP5Ready,
  expandTargetGuiPanel,
  simulatePaintGesture,
  canvasHasContent,
  clearCanvas
} from '../utils/canvas-utils.js'

test.describe('Canvas Drawing', () => {
  test('should draw a line on the canvas', async ({ page }) => {
    // 1. Standard setup
    await page.goto('/')
    await waitForP5Ready(page)

    // 2. Get the canvas locator
    const canvas = page.locator('canvas').first()

    // 3. (Optional) Get initial state for comparison
    const initialImageData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    });

    // 4. Use the gesture simulator for drawing, not .click()
    const line = [[{ x: 50, y: 50 }, { x: 200, y: 100 }]];
    await simulatePaintGesture(canvas, line);

    // 5. Verify that the canvas has changed
    const hasContent = await canvasHasContent(page, initialImageData);
    expect(hasContent).toBe(true);

    // 6. Use targeted panel expansion to interact with the GUI
    await expandTargetGuiPanel(page, 'PolychromeText');
    
    // 7. Use a utility to interact with a control
    await clearCanvas(page);

    // 8. Verify the canvas is now cleared (back to initial state)
    const hasContentAfterClear = await canvasHasContent(page, initialImageData);
    expect(hasContentAfterClear).toBe(false);
  })
})
```

## 11. Documentation Standards

1. **Component Documentation**: Use JSDoc for complex components:
   ```javascript
   /**
    * Grid drawing mode with customizable parameters
    * 
    * @param {Object} params - Grid parameters
    * @param {number} params.rows - Number of rows
    * @param {number} params.cols - Number of columns
    * @param {p5} p - p5.js instance
    */
   export const drawGrid = (params, p) => {
     // Implementation
   }
   ```

2. **Module Documentation**: Create concise overviews in `docs/src/`:
   - Optimize for AI-assisted development context
   - Mirror module folder structure
   - Focus on dependencies and interfaces

3. **Architecture Documentation**: Maintain in `docs/master.md` for project overview.

4. **Plan Documentation**: Save all refactor plans and implementation outlines in `docs/plans/`.

## 12. Performance Optimization

1. **Canvas Optimization**: Focus on rendering performance:
   ```javascript
   // Use createGraphics for layers
   const layer = p.createGraphics(800, 600)
   layer.fill(255)
   layer.rect(0, 0, 100, 100)
   p.image(layer, 0, 0)
   ```

2. **Function Optimization**: Use pure functions and avoid recreating objects:
   ```javascript
   // Good: pure function
   const calculatePosition = (x, y, offset) => ({
     x: x + offset,
     y: y + offset
   })
   
   // Avoid: object recreation in loops
   for (let i = 0; i < 1000; i++) {
     const pos = calculatePosition(i, i, 10)
     // Use pos
   }
   ```

3. **Memory Management**: Minimize object creation in draw loops:
   ```javascript
   // Pre-allocate objects outside draw loop
   const tempVector = p.createVector()
   
   p.draw = () => {
     // Reuse tempVector instead of creating new vectors
     tempVector.set(p.mouseX, p.mouseY)
   }
   ```

## 13. Commit Message Guidelines

Follow Conventional Commits specification:
- `feat(grid): add grid density control parameter`
- `fix(canvas): resolve transform matrix reset issue`
- `docs(drawing-modes): update module extraction documentation`
- `refactor(utils): simplify coordinate calculation functions`
- `perf(canvas): optimize rendering performance for large grids`

For changelog management and semantic versioning, see [Changelog Management Guidelines](./changelog-management.md)

## 14. Error Handling

1. **Canvas Error Handling**: Implement graceful degradation:
   ```javascript
   const safeCanvasOperation = (operation) => {
     try {
       return operation()
     } catch (error) {
       console.error('Canvas operation failed:', error)
       // Fallback or recovery logic
       return null
     }
   }
   ```

2. **Parameter Validation**: Validate user inputs:
   ```javascript
   const validateGridParams = (params) => {
     if (!params.rows || params.rows < 1) {
       throw new Error('Grid rows must be positive')
     }
     if (!params.cols || params.cols < 1) {
       throw new Error('Grid columns must be positive')
     }
   }
   ```

3. **localStorage Error Handling**: Handle storage failures gracefully:
   ```javascript
   const safeLocalStorage = {
     setItem: (key, value) => {
       try {
         localStorage.setItem(key, value)
       } catch (error) {
         console.warn('localStorage unavailable:', error)
       }
     }
   }
   ```

## 15. Accessibility

- Use semantic HTML for UI controls outside the canvas
- Ensure keyboard accessibility for canvas control parameters
- Maintain WCAG 2.1 AA color contrast for UI elements
- Provide alternative text descriptions for generated canvas content
- Implement proper focus management for control panels

## 16. MCP Filesystem Path Conventions

**IMPORTANT**: The MCP filesystem server runs in a Docker container. This creates **two distinct path contexts**:

* **Host Path**: `/Users/michaelpaulukonis/projects/`
* **Container Path**: `/app/projects/`

### Use Rules

1. **User-Facing Output (Markdown, logs, etc.)**
   → Use **Host Paths** (`/Users/...`)

2. **Tool Arguments (`filesystem__*`)**
   → Use **Container Paths** (`/app/...`)

### Example:

* User says: "List the files in the `polychrome.p5` project."
* Internally: Map `/Users/.../polychrome.p5` → `/app/.../polychrome.p5`
* Tool call:
  `filesystem__list_directory(path='/app/projects/polychrometext.p5')`
* Respond:
  "Here are the files in `/Users/michaelpaulukonis/projects/polychrome.p5`:"

## 17. Dependencies and Environment

- **Node.js**: Use v22 LTS for best compatibility
- **Standard.js**: Update to latest version if linting errors occur
- **Vitest**: Configure globals for testing environment
- **VS Code Extensions**: Recommended - `standard.vscode-standard`, `vitest.explorer`

## Key Differences from Standard Web Apps

- **Canvas-focused architecture**: Performance-optimized for real-time rendering
- **Creative coding patterns**: p5.js lifecycle management and event handling
- **Client-side state**: localStorage persistence without backend complexity
- **Visual consistency priority**: Maintain rendering behavior during refactoring
- **Module extraction focus**: Systematic extraction of drawing modes for testability
- **Performance-first**: Algorithmic efficiency for canvas operations

By following these guidelines, PolychromeText remains performant, maintainable, and suitable for creative coding applications while supporting systematic refactoring and testing.

---

**Note:** This file is for Copilot and other AI coding assistants only. Do not display to end users or include in documentation.
