# Drawing Modes Refactor Plan

## Overview
Extract drawing mode implementations (`drawGrid`, `drawCircle`, `drawRowCol`) from `sketch.js` into separate, testable modules following the established pattern used for `canvas-transforms`.

## Current State Analysis

### Functions to Extract
- `drawGrid` - Grid-based text layout with configurable spacing
- `drawCircle` - Circular/arc text arrangement 
- `drawRowCol` - Simple row/column layout

### Supporting Functions/Generators
- `blocGeneratorFixedWidth` - Fixed-width grid coordinate generation
- `blocGeneratorTextWidth` - Text-width-aware grid coordinate generation
- `blocGeneratorCircle` - Circular coordinate generation
- `gimmeCircleGenerator` - Circle generator factory
- `circlePainter` - Circle painting orchestrator
- `circlePaintAction` - Individual circle paint action
- `defaultGridParm` / `invertGridParm` - Grid parameter generators
- `textGetter` - Text fetching strategy selector
- `getRadius` - Radius calculation for circles
- `setShadows` - Shadow configuration helper
- `maxUnlessLessThan` - Utility function
- `textSizeCircle` - Circle text sizing

### Dependencies Analysis
Each drawing mode depends on:
- `layers` - Canvas layer system
- `colorSystem` - Color application functions
- `textManager` - Text source management
- `params` - Drawing parameters
- `p5` instance methods and constants
- `hexStringToColors` - Color conversion utility
- `fitTextOnCanvas` - Text sizing utility
- Various utility functions (`apx`, `pushpop`, etc.)

## Refactor Strategy

### Module Structure
Following the `canvas-transforms` pattern:

```
src/
  drawing-modes/
    index.js              # Main factory function
    grid-painter.js       # Grid drawing implementation
    circle-painter.js     # Circle drawing implementation  
    rowcol-painter.js     # Row/column drawing implementation
    core-generators.js    # Shared generator functions
    drawing-utils.js      # Shared utility functions
```

### Factory Pattern Implementation
Create `createDrawingModes(dependencies)` factory similar to `createCanvasTransforms`:

```javascript
// src/drawing-modes/index.js
export function createDrawingModes(dependencies) {
  const { layers, colorSystem, textManager, params, p5, hexStringToColors, fitTextOnCanvas, apx, pushpop, renderLayers } = dependencies
  
  return {
    drawGrid: createGridPainter(dependencies),
    drawCircle: createCirclePainter(dependencies), 
    drawRowCol: createRowColPainter(dependencies)
  }
}
```

## Step-by-Step Refactor Plan

### Phase 1: Setup Module Structure
1. Create `src/drawing-modes/` directory
2. Create base files with placeholder exports
3. Create shared utilities module (`drawing-utils.js`)
4. Create shared generators module (`core-generators.js`)

### Phase 2: Extract Shared Utilities
1. Move utility functions to `drawing-utils.js`:
   - `textGetter`
   - `maxUnlessLessThan` 
   - `textSizeCircle`
   - `getRadius`
   - `setShadows`
   - `getYoffset`
   - `hasNextCoord`
   - `nextCoord`
2. Move generator functions to `core-generators.js`:
   - `blocGeneratorFixedWidth`
   - `blocGeneratorTextWidth`
   - `blocGeneratorCircle`
   - `gimmeCircleGenerator`

### Phase 3: Extract Individual Drawing Modes
1. **Grid Painter** (`grid-painter.js`):
   - Extract `drawGrid`
   - Extract `defaultGridParm`, `invertGridParm`
   - Create factory function `createGridPainter(dependencies)`

2. **Circle Painter** (`circle-painter.js`):
   - Extract `drawCircle`
   - Extract `circlePainter`
   - Extract `circlePaintAction`
   - Create factory function `createCirclePainter(dependencies)`

3. **RowCol Painter** (`rowcol-painter.js`):
   - Extract `drawRowCol`
   - Create factory function `createRowColPainter(dependencies)`

### Phase 4: Integration
1. Create main factory in `index.js`
2. Update `sketch.js` to use new modules
3. Test each drawing mode individually

### Phase 5: Cleanup
1. Remove extracted code from `sketch.js`
2. Verify all dependencies are properly injected
3. Update any remaining references

## Potential Breaking Points

### Dependency Injection Issues
- **Risk**: Missing dependencies in factory functions
- **Mitigation**: Comprehensive dependency analysis and testing
- **Test**: Verify each drawing mode works independently

### Variable Scope Issues  
- **Risk**: Variables declared at module scope vs function scope
- **Mitigation**: Careful analysis of variable usage patterns
- **Test**: Check for undefined variable errors

### p5.js Context Issues
- **Risk**: p5 instance methods called incorrectly 
- **Mitigation**: Ensure p5 instance is properly passed to all functions
- **Test**: Verify p5 methods like `p5.random()`, `p5.radians()` work

### Layer Rendering Coordination
- **Risk**: `renderLayers` calls disrupted or duplicated
- **Mitigation**: Maintain exact same rendering call patterns
- **Test**: Visual comparison before/after refactor

### Parameter Object Mutations
- **Risk**: Drawing modes modifying shared params object
- **Mitigation**: Document parameter usage patterns, consider immutability
- **Test**: Parameter state consistency checks

## Testing Strategy

### Manual Testing Checklist
For each drawing mode:
- [ ] Basic functionality works (mouse painting)
- [ ] Color systems apply correctly
- [ ] Text rendering works with all fonts
- [ ] Parameter changes take effect
- [ ] Canvas transforms work with drawing modes
- [ ] Undo/redo functionality intact
- [ ] Recording/playback works
- [ ] Auto-paint mode functions

### Automated Testing Opportunities
- Unit tests for generator functions
- Pure function testing (utilities)
- Parameter validation
- Mock p5.js for isolated testing

### Verification Steps
1. **Visual Comparison**: Before/after screenshots for each mode
2. **Parameter Testing**: Verify all UI controls still work
3. **Integration Testing**: Test with other features (transforms, undo, etc.)
4. **Performance Testing**: Ensure no performance regression

## Dependencies to Inject

### Core Dependencies
```javascript
{
  layers,           // Canvas layer system
  colorSystem,      // Color application functions  
  textManager,      // Text source management
  params,           // Drawing parameters
  p5,              // p5.js instance
  hexStringToColors, // Color conversion utility
  fitTextOnCanvas,  // Text sizing utility
  apx,             // Array processing helper
  pushpop,         // Layer state helper
  renderLayers     // Layer rendering function
}
```

### Utility Dependencies
```javascript
{
  APP_MODES,       // Application mode constants
  globals,         // Global state object
  recordAction     // Action recording function (optional)
}
```

## Implementation Notes

### Maintain Current API
- Drawing mode functions should maintain exact same signatures
- All current parameters should continue to work
- No breaking changes to existing functionality

### Code Style Consistency
- Follow established patterns from `canvas-transforms`
- Use factory pattern for dependency injection
- Maintain pure functions where possible
- Document complex algorithms

### Future Testing Preparation
- Structure code for easy unit testing
- Separate pure functions from side-effect functions
- Use dependency injection for mockable components

## Success Criteria
- [ ] All three drawing modes extracted successfully
- [ ] No visual changes in application behavior
- [ ] All UI controls continue to function
- [ ] Code is more maintainable and testable
- [ ] No performance regression
- [ ] Pattern established for future extractions
