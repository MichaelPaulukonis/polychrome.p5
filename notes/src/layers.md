# Layer System Overview

## Architecture

**Location**: `src/layers.js`  
**Purpose**: Multi-canvas management system for efficient rendering and composition  
**Pattern**: Class-based with explicit ownership semantics and memory management

## Core Components

### Layers Class
Central manager for multiple p5.Graphics canvases with ownership tracking.

**Constructor Parameters:**
- `p5` - Main p5.js instance (canvas 1)
- `dl` - Drawing layer p5.Graphics (canvas 2) 
- `temp` - Temporary layer p5.Graphics (canvas 3)

**Properties:**
```javascript
{
  p5,                    // Main canvas (p5.js instance)
  drawingLayer,          // Active drawing surface (p5.Graphics)
  tempLayer,             // Temporary operations layer (p5.Graphics)
  createdGraphics        // Set tracking created graphics for cleanup
}
```

## Multi-Canvas Architecture

### Canvas Hierarchy
```javascript
// Canvas 1: Main display canvas
p5.createCanvas(params.width, params.height)

// Canvas 2: Drawing layer (where drawing operations occur)
const drawingLayer = initDrawingLayer(params.width, params.height)

// Canvas 3: Temporary layer (for overlays, previews)
const tempLayer = initDefaultLayer(params.width, params.height)
```

### Rendering Pipeline
```javascript
// 1. Draw operations target drawingLayer
paint(x, y, params) // -> drawingLayer

// 2. Composite drawingLayer onto main canvas
renderLayers({ layers }) // -> p5.image(drawingLayer, 0, 0)

// 3. Clear drawingLayer for next operation
drawingLayer.clear()
```

## Memory Management System

### Explicit Ownership Model
```javascript
// CALLER OWNS returned graphics
const copy = layers.copy()        // Must call dispose(copy) when done
const clone = layers.clone(img)   // Must call dispose(clone) when done

// Safe disposal
layers.dispose(graphics)          // Handles null checks, removes canvas
```

### Resource Tracking
- **Created Graphics Set**: Tracks graphics objects for bulk cleanup
- **Automatic Cleanup**: `cleanup()` disposes all tracked graphics
- **Safe Disposal**: `dispose()` method handles null checks and canvas removal

## Core Methods

### Canvas Operations
```javascript
copy()                  // Copy main canvas -> new p5.Graphics (caller owns)
clone(img)             // Clone image/graphics -> new p5.Graphics (caller owns)  
dispose(graphics)      // Safe graphics disposal with null checks
cleanup()              // Dispose all tracked graphics objects
```

### Text Configuration
```javascript
setFont(font)          // Set font on both main canvas and drawing layer
textSize(size)         // Set text size on both main canvas and drawing layer
```

## Integration Points

### Sketch.js Integration
```javascript
// Initialization in setup()
const drawingLayer = initDrawingLayer(params.width, params.height)
const tempLayer = initDefaultLayer(params.width, params.height)
pct.layers = layers = new Layers(p5, drawingLayer, tempLayer)

// Drawing operations target drawingLayer
paint(xPos, yPos, params) // -> layers.drawingLayer

// Composition pipeline
renderLayers({ layers }) // -> p5.image(layers.drawingLayer, 0, 0)
```

### Drawing Modes Integration
All drawing modes operate on `layers.drawingLayer`:
```javascript
drawGrid({ layer: layers.drawingLayer, ... })
drawCircle({ layer: layers.drawingLayer, ... })
drawRowCol({ layer: layers.drawingLayer, ... })
```

### Color System Integration
Color system functions automatically reference `layers.drawingLayer`:
```javascript
colorSystem.setFillMode()     // -> layers.drawingLayer
colorSystem.setOutlineMode()  // -> layers.drawingLayer
```

### Undo System Integration
```javascript
// UndoLayers uses layer system for state management
undo = new UndoLayers(layers, renderLayers, 10)

// Snapshot creation uses layers.copy()
takeSnapshot() // -> layers.copy() -> store in history

// Restoration renders to layers.drawingLayer
show() // -> layers.drawingLayer.image(historicalState, 0, 0)
```

### Canvas Transforms Integration
Transform operations create new drawing layers:
```javascript
// Rotation recreates drawingLayer with proper dimensions
rotateCanvas() // -> layers.drawingLayer = initDrawingLayer(newW, newH)

// Flip/mirror operations work with layer copies
flip({ axis, layer: layers.drawingLayer })
mirror() // -> uses layers.copy() for source material
```

## Layer Lifecycle Management

### Initialization Pattern
```javascript
// Create graphics with consistent settings
const initDrawingLayer = (w, h) => {
  const layer = initDefaultLayer(w, h)
  setFont(params.font, layer)           // Configure font
  layer.textAlign(p5.CENTER, p5.CENTER) // Set alignment
  initializeColorMode(layer, p5, params) // Set color mode
  return layer
}
```

### Dynamic Layer Replacement
```javascript
// Transform operations may replace drawingLayer
const rotateCanvas = () => {
  // ... rotation logic ...
  layers.drawingLayer = initDrawingLayer(newWidth, newHeight)
  // Color system automatically adapts to new drawingLayer
}
```

### Cleanup Considerations
- Graphics objects must be explicitly disposed via `dispose()` or `.remove()`
- Caller responsibility for graphics returned by `copy()` and `clone()`
- Automatic cleanup available via `cleanup()` for bulk disposal

## Performance Characteristics

### Rendering Efficiency
- **Separation of Concerns**: Drawing operations isolated from display canvas
- **Batch Composition**: Single `p5.image()` call composites drawing layer
- **Layer Clearing**: `drawingLayer.clear()` after each composition cycle

### Memory Efficiency  
- **Explicit Ownership**: Clear responsibility for graphics disposal
- **Resource Tracking**: Prevents memory leaks through systematic cleanup
- **Reusable Layers**: `tempLayer` available for temporary operations

## Development Patterns

### Safe Graphics Usage
```javascript
// Pattern: Create, use, dispose
const workingLayer = layers.copy()
// ... operations on workingLayer ...
layers.dispose(workingLayer)  // Always clean up
```

### Layer Operation Pattern
```javascript
// Pattern: Draw to layer, composite, clear
drawingOperation() // -> drawingLayer
renderLayers()     // -> composite to main canvas  
// drawingLayer automatically cleared in renderTarget()
```

### Font/Text Management
```javascript
// Pattern: Configure both canvases
layers.setFont(newFont)    // Sets on both p5 and drawingLayer
layers.textSize(newSize)   // Sets on both p5 and drawingLayer
```

## Critical Dependencies

### Layer System Dependencies
- **p5.js Graphics**: Core graphics object creation and manipulation
- **Canvas API**: Pixel density, canvas dimensions, rendering context
- **Memory Management**: Explicit disposal of graphics objects

### Systems Dependent on Layers
- **Drawing Modes**: All modes target `layers.drawingLayer`
- **Color System**: Automatically references current drawing layer
- **Undo System**: Uses `layers.copy()` for state snapshots
- **Transform System**: May recreate `layers.drawingLayer` after operations
- **Recording System**: Records layer states for playback

## Edge Cases & Considerations

### Transform Operations
- Canvas rotation may change layer dimensions
- Transform operations may recreate `drawingLayer` entirely
- Color system must adapt to new layer instances automatically

### Memory Constraints
- Large canvases with high pixel density consume significant memory
- Undo history multiplies memory usage (10 snapshots = 10x canvas memory)
- Proper disposal critical for avoiding memory leaks

### Thread Safety
- p5.js is single-threaded, no concurrency concerns
- Graphics operations are synchronous
- Layer state changes are immediately visible

## AI Development Context

### Key Design Principles
1. **Explicit Ownership**: Clear responsibility for graphics lifecycle
2. **Separation of Concerns**: Drawing vs display canvas isolation
3. **Automatic Adaptation**: Systems adapt to layer changes transparently
4. **Memory Safety**: Systematic resource management prevents leaks

### Integration Complexity
- Layer system is central hub for all canvas operations
- Changes to layer system affect multiple dependent systems
- Transform operations create complex layer lifecycle scenarios
- Memory management requires careful attention across all operations

### Performance Considerations
- Multi-canvas approach enables efficient compositing
- Layer separation allows independent optimization of drawing vs display
- Memory usage scales with canvas size, pixel density, and undo history depth
- Graphics disposal must be systematic to prevent accumulation
