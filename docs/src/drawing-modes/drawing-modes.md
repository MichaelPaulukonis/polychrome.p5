# Drawing Modes Module

## Architecture Overview

**Location**: `src/drawing-modes/`  
**Purpose**: Modular, factory-based drawing mode system with shared utilities and generators  
**Pattern**: Factory functions returning painter objects with consistent interfaces

## Module Structure

```
drawing-modes/
├── index.js              # Main factory and mode selection
├── grid-painter.js       # Grid-based text layout painter
├── circle-painter.js     # Circular text arrangement painter  
├── rowcol-painter.js     # Row/column matrix painter
├── drawing-utils.js      # Shared drawing utilities
└── core-generators.js    # Coordinate and text generators
```

## Key Interfaces

### Painter Factory Pattern
```javascript
const painter = createXxxPainter(dependencies)
const result = painter.paint(params, dimensions)
```

### Dependencies Object
```javascript
{
  layers: { drawingLayer, p5 },
  colorSystem: { setFillMode, setOutlineMode },
  hexStringToColors: fn,
  p5: p5Instance
}
```

### Standard Parameters
- `params`: Drawing configuration (immutable input)
- `dimensions`: `{ width, height, xPos }` canvas bounds
- Returns: `{ modifiedParams, sideEffects }` or `null`

## Shared Utilities

### `drawing-utils.js` 
- `textGetter()`: Text retrieval functions (char, word, random)
- `setShadows()`: Canvas shadow configuration
- `getYoffset()`: Text baseline positioning  
- `trText()`: Text rotation transformations

### `core-generators.js`
- `blocGeneratorFixedWidth()`: Grid coordinate generation
- `blocGeneratorTextWidth()`: Dynamic width text blocks
- `blocGeneratorCircle()`: Circular text positioning

## Drawing Mode Specifics

### Grid Painter
- **Pattern**: Regular grid with configurable step size
- **Key Features**: Invert mode, fixed/dynamic width, text alignment
- **Generators**: Uses `blocGeneratorFixedWidth` or `blocGeneratorTextWidth`

### Circle Painter  
- **Pattern**: Radial text arrangement in concentric circles
- **Key Features**: Custom center, angle distribution, text sizing
- **Generators**: Uses `blocGeneratorCircle`

### RowCol Painter
- **Pattern**: Matrix-based row/column layout
- **Key Features**: Cell-based positioning, space skipping, image rendering
- **Rendering**: Calls `renderLayers()` directly (unique behavior)

## Integration Points

### Main Integration (`sketch.js`)
```javascript
import { createDrawingModes } from '~/src/drawing-modes'
const drawingModes = createDrawingModes(dependencies)
drawingModes[currentMode].paint(params, dimensions)
```

### Color System Integration
All painters use `colorSystem.setFillMode()` and `setOutlineMode()` for consistent color handling.

### Layer Management
- Grid/Circle: Modify `drawingLayer` graphics state
- RowCol: Calls `renderLayers()` for immediate display

## Testing Strategy

### Unit Tests (`test/drawing-mode-painters.test.js`)
- **Parameter Immutability**: Ensures no input mutation
- **Visual Consistency**: Validates expected behavior
- **Integration**: Tests shared utility usage
- **Mocking**: Comprehensive p5.js layer mocks

### Test Coverage
- Individual painter functionality
- Shared utility integration  
- Cross-painter consistency
- Parameter validation

## Development Notes

### Adding New Drawing Modes
1. Create `new-painter.js` with factory pattern
2. Import shared utilities from `drawing-utils.js` 
3. Use appropriate generators from `core-generators.js`
4. Add to `index.js` factory
5. Add unit tests following existing patterns

### Parameter Handling
- **Immutable**: Never modify input `params` object
- **Consistent**: Use standard parameter names across modes
- **Validated**: Test parameter ranges and edge cases

### Performance Considerations
- Generators are optimized for canvas rendering
- Shared utilities minimize code duplication
- Factory pattern enables lazy initialization

## AI Development Context

This module represents a refactored, modular architecture extracted from monolithic `sketch.js`. Focus areas for AI assistance:

1. **Consistency**: Maintain interface contracts across painters
2. **Immutability**: Preserve parameter immutability patterns  
3. **Testing**: Follow established unit test patterns
4. **Utilities**: Leverage shared utilities for new features
5. **Generators**: Use existing coordinate generators when possible
