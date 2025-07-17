# Canvas Transforms Module

## Overview
The canvas transforms module provides a comprehensive system for applying geometric transformations to canvas layers in PolychromeText. It follows a factory pattern with dependency injection to ensure testability and maintainability while integrating seamlessly with the recording/playback system, layer management, and application state.

## Architecture

### Modular Design
The module is split into three files for separation of concerns:
- **`core-transforms.js`** - Pure transformation functions for isolated testing
- **`canvas-transforms.js`** - Main factory function with dependency injection
- **`index.js`** - Public API exports

### Factory Pattern
The module exports a `createCanvasTransforms(dependencies)` factory function that:
- Takes required dependencies via dependency injection
- Returns an object with transformation methods
- Integrates with recording, layer management, and application state
- Ensures compatibility with different app modes (STANDARD_DRAW, PLAYBACK, etc.)

### Pure Functions for Testing
Core transformation logic is implemented as pure functions that:
- Take graphics objects and return transformed versions
- Can be tested in isolation without p5.js dependencies
- Follow functional programming principles
- Are composable and reusable

## Public API

### Factory Function

#### `createCanvasTransforms(dependencies)`
Creates a canvas transforms instance with injected dependencies.

**Dependencies:**
- `layers` - Layers management object for canvas operations
- `recordAction` - Function to record actions for playback system
- `globals` - Global state object for tracking canvas updates
- `renderLayers` - Function to render layers to main canvas
- `initDrawingLayer` - Function to create new drawing layers
- `getAppMode` - Function that returns current application mode
- `APP_MODES` - Application mode constants
- `params` - Global parameters object (width, height, etc.)

**Returns:** Object with transformation methods and constants

### Transform Functions

#### `flip({ axis, layer })`
Flips the canvas along the specified axis (horizontal or vertical).

**Parameters:**
- `axis` - `HORIZONTAL` (0) or `VERTICAL` (1)
- `layer` - Target layer to flip (typically `layers.drawingLayer`)

**Behavior:**
- Records action for playback system
- Creates flipped copy using `flipCore` pure function
- Applies flip to the target layer
- Re-renders all layers to main canvas
- Updates global canvas state

#### `mirror({ axis, layer })`
Creates a mirrored half-image along the specified axis.

**Parameters:**
- `axis` - `HORIZONTAL` (0) or `VERTICAL` (1)  
- `layer` - Target layer to mirror

**Behavior:**
- Records action for playback
- Uses `mirrorCore` to create mirrored effect
- Takes one half of the image and mirrors it to the other half
- Re-renders layers and updates state

#### `shift({ direction, layer })`
Shifts canvas pixels with wrapping using ImageData manipulation.

**Parameters:**
- `direction` - Direction vector `{ x, y }` for pixel shift
- `layer` - Target layer to shift

**Behavior:**
- Records action for playback
- Uses ImageData API for pixel-level manipulation
- Implements wrapping (pixels that go off one edge appear on opposite edge)
- Handles both horizontal and vertical shifts
- Re-renders and updates state

#### `rotateCanvas({ direction, width, height, layers, p5 })`
Rotates the entire canvas 90 degrees with proper dimension swapping.

**Parameters:**
- `direction` - 1 for clockwise, -1 for counter-clockwise
- `width` - Current canvas width
- `height` - Current canvas height
- `layers` - Layers object
- `p5` - p5.js instance

**Behavior:**
- Creates new graphics with swapped dimensions
- Applies 90-degree rotation transform
- Copies rotated content to new layer
- Replaces old drawing layer with rotated version
- **Note:** Undo system doesn't track rotation operations

#### `rotateWrapped(direction = 1)`
Simplified wrapper for `rotateCanvas` using current parameters.

**Parameters:**
- `direction` - 1 for clockwise, -1 for counter-clockwise (default: 1)

**Behavior:**
- Calls `rotateCanvas` with current width/height from params
- Provides convenient interface for common rotation operations

### Constants

#### `HORIZONTAL` and `VERTICAL`
Direction constants for flip and mirror operations:
- `HORIZONTAL = 0` - Transforms along horizontal axis (up ↔ down)
- `VERTICAL = 1` - Transforms along vertical axis (left ↔ right)

### Utility Functions

#### `newCorner(layer)`
Utility function for canvas corner rotation (currently unused but related to transforms).

**Parameters:**
- `layer` - Graphics layer to transform

**Behavior:**
- Translates to width, 0
- Rotates 90 degrees
- Currently unused but kept for potential future features

## Pure Functions (Core Transforms)

### `flipCore(axis, sourceGraphics, layers)`
Pure function that creates a flipped copy of a graphics object.

**Parameters:**
- `axis` - `HORIZONTAL` or `VERTICAL`
- `sourceGraphics` - Source p5.Graphics object to flip
- `layers` - Layers object with `clone` method

**Returns:** New flipped graphics object

**Implementation:**
- Creates temporary graphics clone
- Sets up transformation matrix
- Applies appropriate scale and translate for flip direction
- Draws source graphics with transformations applied
- Returns transformed graphics object

### `mirrorCore(axis, sourceGraphics, layers)`
Pure function that creates a mirrored half-image.

**Parameters:**
- `axis` - `HORIZONTAL` or `VERTICAL`
- `sourceGraphics` - Source p5.Graphics object to mirror
- `layers` - Layers object with `clone` method

**Returns:** Modified sourceGraphics object with mirrored content

**Implementation:**
- Uses `flipCore` to create flipped version
- Copies appropriate half of flipped image back to source
- Handles both horizontal and vertical mirroring
- Cleans up temporary graphics objects with defensive null checks

## Integration with Application Systems

### Recording/Playback System
All transform functions integrate with the recording system:
- Actions are recorded with parameters for exact playback
- Recording respects application mode (disabled in playback mode)
- Enables macro creation and automation features

### Layer Management
Transforms work seamlessly with the multi-layer system:
- Operates on `layers.drawingLayer` by default
- Compatible with layer recreation after canvas operations
- Maintains layer hierarchy and rendering order

### Application State
Transform functions properly update global state:
- Sets `globals.updatedCanvas = true` to trigger re-renders
- Integrates with undo system (except rotation operations)
- Respects application modes and drawing states

## Usage Examples

### Basic Usage in Sketch
```javascript
// Initialize in setup()
const canvasTransforms = createCanvasTransforms({
  layers,
  recordAction,
  globals,
  renderLayers,
  initDrawingLayer,
  getAppMode: () => pct.appMode,
  APP_MODES,
  params
})

// Use transforms
canvasTransforms.flip({ axis: canvasTransforms.VERTICAL, layer: layers.drawingLayer })
canvasTransforms.mirror({ axis: canvasTransforms.HORIZONTAL, layer: layers.drawingLayer })
canvasTransforms.rotateWrapped(1) // Clockwise rotation
canvasTransforms.shift({ direction: { x: 10, y: 0 }, layer: layers.drawingLayer })
```

### Testing Pure Functions
```javascript
import { flipCore, mirrorCore, HORIZONTAL, VERTICAL } from './core-transforms.js'

// Mock dependencies for testing
const mockLayers = {
  clone: (graphics) => ({ ...graphics, image: vi.fn(), remove: vi.fn() })
}

// Test pure functions in isolation
const flipped = flipCore(VERTICAL, sourceGraphics, mockLayers)
```

## Performance Considerations

### Memory Management
- Transform functions clean up temporary graphics objects
- Uses `remove()` method to prevent memory leaks with defensive null checks
- Efficient copying and cloning strategies
- Prevents graphics removal errors during canvas operations

### ImageData Operations
- Shift function uses ImageData API for pixel-level operations
- Handles large canvases efficiently
- Wrapping logic optimized for performance

### Layer Operations
- Minimizes layer recreation where possible
- Re-renders only when necessary
- Maintains rendering performance during transforms

## Limitations and Notes

### Undo System Integration
- Most transforms integrate with undo system
- **Exception:** Rotation operations don't track undo states
- This is a known limitation documented in the code

### App Mode Dependencies
- Transform behavior varies by application mode
- Recording disabled in playback mode
- Some operations may behave differently in different modes

### Canvas Size Dependencies
- Rotation operations require current canvas dimensions
- Some transforms may not work correctly with empty or very small canvases
- Pixel-level operations may be slow on very large canvases
- **Graphics Cleanup:** Improved error handling prevents crashes during temporary graphics removal

## Future Enhancements

### Potential Improvements
- Add undo support for rotation operations
- Implement more sophisticated transform combinations
- Add support for arbitrary angle rotations (beyond 90 degrees)
- Optimize memory usage for large canvas operations
- Add more pixel-level transformation effects

### Testing Expansion
- Comprehensive test coverage for all transform functions
- Integration tests with layer management system
- Performance benchmarking for large canvases
- Visual regression testing for transform accuracy

## Migration Notes

This module was extracted from `sketch.js` as part of the codebase modularization effort. The original functions (`rotateCanvas`, `flip`, `mirror`, `shift`, `newCorner`) were moved to this module with the following improvements:

- **Dependency Injection:** Clear separation of concerns through DI pattern
- **Pure Functions:** Core logic extracted as testable pure functions
- **Better Organization:** Logical grouping of related functionality
- **Consistent API:** Standardized parameter patterns and return values
- **Enhanced Documentation:** Comprehensive function documentation and usage examples

The refactor maintains complete backward compatibility while improving maintainability and testability. Recent improvements include:

- **Error Handling:** Added defensive null checks for graphics object removal
- **Memory Safety:** Prevents crashes when cleaning up temporary graphics objects
- **Autopaint Compatibility:** Enhanced stability during automated canvas operations
