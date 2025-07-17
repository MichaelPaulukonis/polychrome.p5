# Utils Module

## Architecture Overview

**Location**: `src/utils/`  
**Purpose**: General-purpose utility functions used across the application  
**Pattern**: Pure functions, no side effects, highly reusable

## Module Structure

```
utils/
└── index.js              # General utilities export
```

## Core Utilities

### `apx(value)`
**Purpose**: Rounds pixel values to integers for crisp canvas rendering  
**Usage**: `apx(12.7)` → `13`  
**Context**: Prevents sub-pixel rendering artifacts in canvas graphics

### `pushpop(layer)(callback)`  
**Purpose**: Graphics state management with automatic push/pop  
**Usage**: 
```javascript
const withState = pushpop(layer)
withState(() => {
  // Graphics transformations here
  layer.rotate(45)
  layer.text('Hello', 0, 0)
})
// State automatically restored
```
**Context**: Ensures graphics transformations don't leak between operations

## Integration Points

### Canvas Rendering
- `apx()`: Used throughout drawing modes for pixel-perfect positioning
- `pushpop()`: Used in text rotation and transformation operations

### Drawing Modes Integration
Both utilities are imported by drawing mode painters:
```javascript
import { apx, pushpop } from '~/src/utils'
```

## Testing

### Unit Tests (`test/utils.test.js`)
- **apx()**: Tests rounding behavior, edge cases, type handling
- **pushpop()**: Tests state preservation, callback execution, layer methods

## Development Notes

### Adding New Utilities
1. Keep functions pure (no side effects)
2. Add comprehensive unit tests
3. Document performance characteristics
4. Consider canvas/p5.js specific optimizations

### Performance Considerations
- `apx()`: Lightweight integer conversion
- `pushpop()`: Minimal overhead wrapper for graphics state

## AI Development Context

This module contains foundational utilities extracted during drawing modes refactoring. Key considerations:

1. **Purity**: Functions should remain side-effect free
2. **Canvas Focus**: Utilities optimized for canvas/p5.js workflows
3. **Reusability**: Design for use across multiple drawing modes
4. **Testing**: Maintain comprehensive test coverage for reliability
