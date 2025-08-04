# Layer System Overview

## Architecture

**Location**: `src/layers.js`  
**Purpose**: Multi-canvas management system for efficient rendering and composition  
**Pattern**: Class-based with explicit ownership semantics and memory management

## Core Components

### Layers Class
Central manager for multiple p5.Graphics canvases with ownership tracking.

**Constructor Parameters:**
- `p5` - Main p5.js instance
- `params` - Global parameters object
- `setFont` - Function to set the font on a layer

**Properties:**
```javascript
{
  p5,                    // Main canvas (p5.js instance)
  drawingCanvas,         // Off-screen canvas for high-resolution artwork
  uiCanvas,              // On-screen canvas for UI elements
  scaleFactor,           // Scale factor for rendering the drawingCanvas on the main canvas
  width,                 // Width of the drawingCanvas
  height                 // Height of the drawingCanvas
}
```

## Multi-Canvas Architecture

### Canvas Hierarchy
```javascript
// Canvas 1: Main display canvas (the one visible on the screen)
// Canvas 2: drawingCanvas (off-screen, high-resolution)
// Canvas 3: uiCanvas (on-screen, for UI elements)
```

### Rendering Pipeline
```javascript
// 1. A neutral background is drawn on the main (visible) canvas.
// 2. The high-resolution `drawingCanvas` is drawn, scaled down to fit the viewport.
// 3. The `uiCanvas` is drawn on top at a 1:1 scale for UI elements.
// 4. The `uiCanvas` is cleared to prepare for the next frame.
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
- **Safe Disposal**: `dispose()` method handles null checks and canvas removal

## Core Methods

### Canvas Operations
```javascript
copy()                  // Copy main canvas -> new p5.Graphics (caller owns)
clone(img)             // Clone image/graphics -> new p5.Graphics (caller owns)  
dispose(graphics)      // Safe graphics disposal with null checks
resize(newWidth, newHeight, copyContent)
```

### Text Configuration
```javascript
setFont(font)          // Set font on the drawingCanvas
textSize(size)         // Set text size on the drawingCanvas
```

## Integration Points

### Sketch.js Integration
```javascript
// Initialization in setup()
const layers = new Layers(p5, params, setFont)

// Drawing operations target drawingCanvas
paint(xPos, yPos, params) // -> layers.drawingCanvas

// Composition pipeline in draw()
p5.image(layers.drawingCanvas, 0, 0, p5.width, p5.height)
p5.image(layers.uiCanvas, 0, 0)
layers.uiCanvas.clear()
```

### Drawing Modes Integration
All drawing modes operate on `layers.drawingCanvas`:
```javascript
drawGrid({ layer: layers.drawingCanvas, ... })
drawCircle({ layer: layers.drawingCanvas, ... })
drawRowCol({ layer: layers.drawingCanvas, ... })
```

### Color System Integration
Color system functions automatically reference `layers.drawingCanvas`:
```javascript
colorSystem.setFillMode()     // -> layers.drawingCanvas
colorSystem.setOutlineMode()  // -> layers.drawingCanvas
```

### Undo System Integration
```javascript
// UndoLayers uses layer system for state management
undo = new UndoLayers(layers, renderLayers, 10)

// Snapshot creation uses layers.copy()
takeSnapshot() // -> layers.copy() -> store in history

// Restoration renders to layers.drawingCanvas
show() // -> layers.drawingCanvas.image(historicalState, 0, 0)
```

### Canvas Transforms Integration
Transform operations create new drawing layers:
```javascript
// Rotation recreates drawingCanvas with proper dimensions
rotateCanvas() // -> layers.resize(newW, newH, true)

// Flip/mirror operations work with layer copies
flip({ axis, layer: layers.drawingCanvas })
mirror() // -> uses layers.copy() for source material
```