# Undo System Module

## Architecture Overview

**Location**: `src/undo.layers.js`  
**Purpose**: Canvas state history management with circular buffer implementation  
**Pattern**: Class-based with private closure variables and circular image collection

## Core Components

### UndoLayers Class
Main interface for undo/redo operations with configurable history depth.

**Constructor Parameters:**
- `layers` - Layer management object with `copy()` and `dispose()` methods
- `renderFunc` - Function to render layers to canvas (typically `renderLayers`)
- `levels` - Maximum history buffer size (default: 10)

**Internal State:**
- `undoSteps` - Number of available undo operations
- `redoSteps` - Number of available redo operations  
- `totalStored` - Actual images stored (≤ levels)
- `images` - CircImgCollection instance managing circular buffer

### CircImgCollection Class
Internal circular buffer implementation for efficient image storage.

**Key Features:**
- Fixed-size circular array of canvas images
- Automatic disposal of overwritten images
- Safe navigation with bounds checking
- Direct canvas rendering with state management

## Public API

### Snapshot Management
```javascript
takeSnapshot()    // Store current canvas state
storeTemp()       // Store temporary state  
getTemp()         // Retrieve temporary state
```

### Navigation
```javascript
undo()           // Move back one state
redo()           // Move forward one state  
history()        // Get array of available states
```

## Critical Implementation Details

### Circular Buffer Logic
```javascript
// Buffer position calculation with proper wraparound
current = (current + 1) % amount           // Forward navigation
current = (current - 1 + amount) % amount // Backward navigation
```

### State Tracking Algorithm
```javascript
// Snapshot logic
totalStored = Math.min(totalStored + 1, levels)
undoSteps = Math.min(undoSteps + 1, Math.min(totalStored - 1, levels - 1))
redoSteps = 0  // Reset redo chain on new snapshot

// Redo validation
if (redoSteps > 0 && undoSteps < Math.min(totalStored - 1, levels - 1))
```

### Memory Management
- **Disposal**: `layers.dispose(image)` called when overwriting buffer slots
- **Safety Checks**: Null checks before image operations to prevent crashes
- **Cleanup**: Automatic cleanup of temporary graphics objects

## Integration Points

### Sketch.js Integration
```javascript
// Initialization in setup()
undo = new UndoLayers(layers, renderLayers, 10)

// Snapshot triggers
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

## Known Limitations & Issues

### Undo System Gaps
- **Rotation operations**: Don't integrate with undo system (documented limitation)
- **Transform operations**: Some canvas transforms bypass undo tracking

### Edge Cases Handled
- **Empty buffer**: Safe navigation when no history exists
- **Buffer wraparound**: Proper handling when buffer size exceeded
- **Missing images**: Defensive null checks prevent crashes
- **State consistency**: Undo/redo counters properly managed across operations

## Testing Strategy

### Test Coverage (`undo.layers.test.js`)
- **Snapshot management**: Buffer filling, disposal, wraparound
- **Navigation**: Undo/redo bounds checking, state consistency
- **Circular buffer**: Edge cases at buffer limits, memory management
- **Error handling**: Missing images, defensive programming
- **Integration**: Mocked dependencies for isolated testing

### Test Patterns
```javascript
// Mock layer system
const mockLayers = {
  copy: vi.fn(() => ({ id: Math.random() })),
  dispose: vi.fn(),
  drawingLayer: { /* p5 graphics methods */ }
}

// Test circular buffer behavior
for (let i = 0; i < bufferSize + 2; i++) {
  undoSystem.takeSnapshot()
}
expect(layers.dispose).toHaveBeenCalledTimes(2) // Overflow disposal
```

## Performance Considerations

### Memory Efficiency
- **Fixed buffer size**: Prevents unlimited memory growth
- **Efficient disposal**: Cleanup of overwritten states
- **Copy optimization**: Uses `layers.copy()` for efficient cloning

### Rendering Performance
- **Deferred rendering**: Only renders on undo/redo operations
- **State isolation**: Push/pop matrix operations for clean state
- **Layer compositing**: Integrates with existing render pipeline

## Development Guidelines

### Adding Undo Support
1. Call `takeSnapshot()` before state-changing operations
2. Ensure operations work with existing layer system
3. Test edge cases (empty buffer, buffer overflow)
4. Verify integration with keyboard shortcuts

### Debugging Common Issues
- **Redo fails**: Check `totalStored` vs `undoSteps` calculations
- **Missing images**: Verify `layers.copy()` implementation
- **Memory leaks**: Ensure `layers.dispose()` called properly
- **State corruption**: Validate circular buffer navigation logic

### Extension Points
- **Custom storage**: Modify `CircImgCollection` for different storage backends
- **Compression**: Add image compression for larger history buffers
- **Metadata**: Store additional state information with snapshots
- **Branching**: Implement undo tree for non-linear history

## AI Development Context

This module represents a critical system for user experience - undo/redo operations must be rock-solid reliable. Key considerations:

1. **Reliability**: Edge cases and error conditions must be handled gracefully
2. **Performance**: Large canvases and frequent operations require efficiency
3. **Integration**: Must work seamlessly with transforms, drawing modes, and layer system
4. **Testing**: Comprehensive test coverage essential due to complex state management
5. **Memory**: Proper cleanup prevents memory leaks in long-running sessions

The circular buffer implementation is mathematically precise but requires careful state tracking. Recent fixes addressed edge cases in redo logic and buffer wraparound scenarios.
