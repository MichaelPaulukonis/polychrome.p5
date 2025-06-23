# Undo System Module

## Architecture Overview

**Location**: `src/undo/undo.layers.js`  
**Purpose**: Canvas state history management with circular buffer implementation  
**Pattern**: Class-based with private closure variables and simplified position tracking

## Core Components

### UndoLayers Class
Main interface for undo/redo operations with configurable history depth.

**Constructor Parameters:**
- `layers` - Layer management object with `copy()` and `dispose()` methods
- `renderFunc` - Function to render layers to canvas (typically `renderLayers`)
- `levels` - Maximum history buffer size (default: 10)

**Internal State (Refactored):**
- `currentPosition` - Current position in history (-1 = no history)
- `newestPosition` - Newest stored position in circular buffer
- `availableStates` - Number of states actually stored (≤ levels)
- `maxStates` - Maximum buffer size
- `images` - ImageCollection instance managing fixed-size array storage

### ImageCollection Class
Pure storage/retrieval implementation for efficient image management.

**Key Features:**
- Fixed-size array of canvas images (no internal circular logic)
- Automatic disposal of overwritten images via `store(layer, position)`
- Safe image retrieval with `hasImage()` and `getImage()` methods
- No rendering responsibility (moved to UndoLayers)
- **Note**: Circular navigation logic handled by UndoLayers, not ImageCollection

## Public API

### Snapshot Management
```javascript
takeSnapshot()    // Store current canvas state at next position
storeTemp()       // Store temporary state  
getTemp()         // Retrieve temporary state
```

### Navigation
```javascript
undo()           // Move back one state in history
redo()           // Move forward one state in history
history()        // Get array of available states
```

### Debug Helpers
```javascript
_getState()      // Returns internal state for debugging
```

## Critical Implementation Details

### Simplified State Tracking
```javascript
// Clear position-based navigation
currentPosition = -1        // No history state
newestPosition = -1         // Newest stored position
availableStates = 0         // Actual stored count

// Helper functions for clarity
const canUndo = () => availableStates > 1 && currentPosition !== getOldestPosition()
const canRedo = () => availableStates > 0 && currentPosition !== newestPosition
```

### Circular Buffer Navigation
```javascript
// Store at next position
const nextPosition = (newestPosition + 1) % maxStates
images.store(layers.copy(), nextPosition)

// Undo navigation (simplified)
currentPosition = (currentPosition - 1 + maxStates) % maxStates

// Redo navigation (simplified)  
currentPosition = (currentPosition + 1) % maxStates
```

### Memory Management
- **Targeted Disposal**: `layers.dispose(image)` called only when overwriting in `store()`
- **Safety Checks**: Comprehensive null checks in `show()` method
- **State Validation**: `validateState()` function prevents corruption

## Separated Concerns Architecture

### Storage vs Navigation Responsibilities
**ImageCollection**: Pure storage with direct position access
```javascript
// Simple fixed-size array storage
class ImageCollection {
  store(layer, position)     // Store at specific position
  hasImage(position)         // Check if position has image
  getImage(position)         // Retrieve image at position
  all()                     // Get entire array
}
```

**UndoLayers**: Manages circular buffer navigation logic
```javascript
// Circular buffer logic in UndoLayers
const nextPosition = (newestPosition + 1) % maxStates
images.store(layers.copy(), nextPosition)
```

### Rendering Responsibility
**Before**: Mixed in `CircImgCollection.show()`
```javascript
// Old approach - mixed concerns in storage class
CircImgCollection.show() {
  // Storage logic AND rendering logic together
}
```

**After**: Separated to `UndoLayers.show()`
```javascript
// New approach - ImageCollection is pure storage
UndoLayers.show() {
  // Handle rendering and graphics state management
  const image = images.getImage(currentPosition)
  layers.drawingLayer.push()
  layers.drawingLayer.image(image, 0, 0)
  renderFunc({ layers })
  layers.drawingLayer.pop()
}
```

## Integration Points

### Sketch.js Integration
```javascript
// Initialization in setup()
undo = new UndoLayers(layers, renderLayers, 10)

// Snapshot triggers (before state changes)
p5.mousePressed = () => {
  if (mouseInCanvas()) {
    pct.undo.takeSnapshot()
  }
}

// Keyboard shortcuts (keys.js)
'u' -> pct.undo.undo()
'shift+u' -> pct.undo.redo()
```

### Layer System Compatibility
- Works with multi-layer canvas system (`layers.drawingLayer`, `layers.p5`)
- Compatible with layer recreation after transforms (rotation, etc.)
- Integrates with `renderLayers()` for canvas compositing

## Resolved Issues

### Previously Identified Problems (Fixed)
- **Complex State Management**: ✅ Simplified to position-based tracking
- **Circular Buffer Complexity**: ✅ Clear helper functions and validation
- **Mixed Responsibilities**: ✅ Separated storage from rendering
- **Intermittent Redo Failures**: ✅ Fixed with improved navigation logic

### Edge Cases Now Handled
- **Buffer wraparound**: Proper circular navigation at boundaries
- **Empty buffer**: Safe navigation when no history exists
- **Missing images**: Defensive null checks prevent crashes
- **State consistency**: Validation prevents corruption

## Testing Strategy

### Comprehensive Test Coverage (`test/undo.layers.test.js`)
- **Snapshot management**: Buffer filling, disposal, wraparound scenarios
- **Navigation**: Undo/redo bounds checking, state consistency
- **Circular buffer edge cases**: Buffer size boundaries, complex sequences
- **Error handling**: Missing images, defensive programming
- **Integration**: Mocked dependencies for isolated testing

### Key Test Scenarios
```javascript
// Complex undo/redo sequences
undoLayers.takeSnapshot() // State 0
undoLayers.takeSnapshot() // State 1  
undoLayers.takeSnapshot() // State 2
undoLayers.undo()         // Back to state 1
undoLayers.redo()         // Forward to state 2

// Buffer wraparound testing
for (let i = 0; i < bufferSize + 2; i++) {
  undoLayers.takeSnapshot() // Test disposal at wraparound
}
```

## Performance Considerations

### Memory Efficiency
- **Fixed buffer size**: Prevents unlimited memory growth
- **Efficient disposal**: Cleanup only when overwriting slots
- **Copy optimization**: Uses `layers.copy()` for efficient cloning

### Rendering Performance
- **Deferred rendering**: Only renders on actual undo/redo operations
- **State isolation**: Push/pop matrix operations for clean state
- **Layer compositing**: Integrates with existing render pipeline

## Development Guidelines

### Adding Undo Support
1. Call `takeSnapshot()` **before** state-changing operations
2. Ensure operations work with existing layer system
3. Test edge cases (empty buffer, buffer overflow, wraparound)
4. Verify integration with keyboard shortcuts

### Debugging Common Issues
- **State inconsistency**: Use `_getState()` debug helper
- **Missing images**: Check console warnings from `show()` method
- **Memory leaks**: Verify `layers.dispose()` called in `store()`
- **Navigation issues**: Validate `canUndo()` and `canRedo()` logic

### Extension Points
- **Custom storage**: Modify `CircImgCollection` for different backends
- **Compression**: Add image compression for larger history buffers
- **Metadata**: Store operation context with snapshots
- **Branching**: Implement undo tree for non-linear history

## AI Development Context

This module underwent significant refactoring to improve reliability and maintainability:

### Refactoring Achievements
1. **Simplified Complexity**: Replaced interrelated counters with clear position tracking
2. **Enhanced Reliability**: Eliminated intermittent redo failures in space/DEL operations
3. **Better Architecture**: Separated storage and rendering concerns
4. **Improved Testing**: Comprehensive edge case coverage
5. **Clearer Naming**: `ImageCollection` better reflects pure storage role vs circular behavior

### Architectural Clarity
- **ImageCollection**: Simple fixed-size array storage, no navigation logic
- **UndoLayers**: Manages circular buffer behavior using modulo arithmetic
- **Clear Separation**: Storage concerns separate from navigation and rendering

### Key Considerations for AI Development
1. **Reliability First**: Undo/redo must work consistently across all operations
2. **Performance**: Large canvases require efficient memory management
3. **Integration**: Must work seamlessly with transforms, drawing modes, layer system
4. **Testing**: Critical system requires comprehensive automated test coverage
5. **Maintainability**: Clear code structure enables future enhancements

The refactored implementation provides a solid foundation for canvas state management while maintaining the circular buffer efficiency and adding significant reliability improvements.
