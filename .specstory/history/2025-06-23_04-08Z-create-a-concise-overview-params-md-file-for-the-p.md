<!-- Generated by SpecStory -->

# Create a concise overview params.md file for the p (2025-06-23 04:08Z)

_**User**_

Create a concise overview params.md file for the parameter system (covering params.js, sketch.js, and any other files that may be referenced in the code but not mentioned here)
Place into '../docs/src/'
Optimize the overview to prioritize context for AI-assisted development over human readers.
Documentation should cover (but is not limited to)
  - parameter structure and types
  - Parameter relationships and dependencies
  - How parameters integrate with the drawing modes and color systems
  
If anything is unclear, please ask me.

---

_**Assistant**_

Looking at the code, I need to analyze the parameter system structure across `params.js` and `sketch.js` to create a comprehensive overview. The parameter system appears to be the central configuration hub for the application.

Let me create a concise overview optimized for AI-assisted development:

### ../docs/src/params.md

Parameter system documentation for AI context and development guidance.

````markdown
# Parameter System Overview

## Architecture

The parameter system is centralized in `params.js` with integration points throughout the application, particularly in `sketch.js` for rendering and GUI systems.

## Core Parameter Structure

### `allParams` Object
Main configuration object combining:
- `paramsInitial`: Base application settings
- `fill`: Fill color parameters (extends `colorParams`)
- `outline`: Outline/stroke parameters (extends `colorParams` + stroke-specific)
- `globals`: Runtime state tracking

### Parameter Categories

#### Canvas & Rendering (`paramsInitial`)
```javascript
{
  width: 900, height: 900,           // Canvas dimensions
  frameRate: 30,                     // p5.js frame rate
  fixedWidth: true,                  // Canvas sizing behavior
  rotation: 0,                       // Current rotation angle
  cumulativeRotation: false,         // Rotation accumulation mode
  gamma: 0.8,                        // Gamma adjustment value
  inset: 0,                         // Canvas inset
  invert: false                     // Color inversion
}
```

#### Drawing Modes
```javascript
{
  drawModes: ['Grid', 'Circle', 'Grid2'],
  drawMode: 'Grid',                  // Current active mode
  maxrows: 100, rows: 10,           // Grid constraints
  columns: 10, rowmax: 100, colmax: 100
}
```

#### Text System
```javascript
{
  fontList: [...],                   // Available fonts from assets
  font: fontList[0],                // Current active font
  nextCharModes: ['Sequential', 'Random', 'Word'],
  nextCharMode: 'Sequential'        // Text generation mode
}
```

#### Rendering Flags
```javascript
{
  useOutline: true, useFill: true,  // Render toggles
  useShadow: false,                 // Shadow system toggle
  shadowOffsetX: 5, shadowOffsetY: 5, shadowBlur: 5,
  shadowColor: '#000000',
  hardEdge: true                    // Mask/edge processing
}
```

#### Automation & Capture
```javascript
{
  autoPaint: false,                 // Automated painting mode
  capturing: false,                 // Frame capture mode
  captureOverride: false,
  captureLimit: 200
}
```

## Color Parameter System (`colorParams`)

### Structure
```javascript
{
  paintModes: [...],                // Available paint algorithms
  paintMode: 'Rainbow1',            // Current algorithm
  transparency: 50,                 // Alpha value
  transparent: false,               // Transparency toggle
  color: '#fff000',                 // Base color
  scheme: 'ffffff-000000',          // Color scheme string
  curCycle: 0,                      // Color cycling state
  lerps: []                         // Interpolation colors
}
```

### Paint Modes
- `Rainbow1-4`: HSB-based positional coloring
- `Black/White/Gray1-2`: Monochrome modes  
- `solid`: Single color fill
- `lerp-scheme/lerp-quad`: Multi-color interpolation

### Fill vs Outline Parameters
- **Fill**: Uses base `colorParams` structure
- **Outline**: Extends `colorParams` with stroke properties:
  ```javascript
  {
    strokeWeight: 1,
    strokeJoin: 'miter',
    joins: ['miter', 'bevel', 'round']
  }
  ```

## Parameter Integration Points

### Drawing Modes Integration
- Parameters passed to `drawGrid`, `drawCircle`, `drawRowCol` functions
- Each mode uses different parameter subsets:
  - Grid: `rows`, `columns`, positioning parameters
  - Circle: radius calculations, arc parameters  
  - RowCol: text layout parameters

### Color System Integration
- `colorSystem` functions consume `fill`/`outline` parameters
- Paint mode selection drives color algorithm choice
- Transparency and scheme parameters affect color generation

### Canvas Transform Integration
- `rotation`, `cumulativeRotation` parameters
- Flip/mirror operations use parameter state
- Gamma adjustment consumes `gamma` parameter

## Runtime State (`globals`)
```javascript
{
  updatedCanvas: false,             // Render flag for capture system
  captureCount: 0                   // Frame counter for automation
}
```

## Parameter Mutation Patterns

### GUI Integration
- Parameters modified through QuickSettings panels
- Color shifts via `shiftFillColors`/`shiftOutlineColors`
- Real-time parameter binding affects immediate rendering

### Recording System Integration  
- `recordConfig()` captures parameter state for playback
- Parameter changes trigger recording when not in playback mode
- Automation systems modify parameters programmatically

## Development Notes

- Parameters use object spread for default initialization
- Color parameters generated via factory function `colorParams()`
- Font list dynamically loaded from assets at build time
- Parameter validation handled at GUI level, not in core system
- Some parameters have interdependencies (e.g., `useOutline` affects stroke rendering)
````

---

_**User**_

Create a concise overview layers.md file for the layer system (covering layers.js, sketch.js, and any other files that may be referenced in the code but not mentioned here)
Place into '../docs/src/'
Optimize the overview to prioritize context for AI-assisted development over human readers.
Documentation should cover (but is not limited to)

Layers class, properties and methods
layer relationships and dependencies
How layers integrate with the drawing modes and undo system

If anything is unclear, please ask me.

---

_**Assistant**_

I need to examine the layer system to create comprehensive documentation. Based on the files provided, I can see references to the `Layers` class and `UndoLayers`, but I don't have the actual `layers.js` file content to analyze the complete structure.

Could you provide the `layers.js` file content so I can create accurate documentation covering:
- The `Layers` class implementation details
- Layer initialization and management methods
- How the multi-canvas system works with drawing layer, main canvas, and temp layer
- Integration patterns with the undo system

Without seeing the actual `Layers` class implementation, I would be making assumptions about its structure and methods, which contradicts the guidance to never assume missing context.

---

_**User**_

Sorry about that - here they are.

---

_**Assistant**_

Based on the provided files, I can now create comprehensive documentation for the layer system. Let me analyze the `Layers` class, its integration points, and relationships with other systems.

### ../docs/src/layers.md

Layer system documentation for AI context and development guidance.

````markdown
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
````

---

_**User**_

Create a concise overview file-save.md file for the file save system (covering filelib.js, sketch.js, use of the file-save library, and any other files that may be referenced in the code but not mentioned here)
Place into '../docs/src/'
Optimize the overview to prioritize context for AI-assisted development over human readers.

If anything is unclear, please ask me.

---

_**Assistant**_

Based on the provided files, I can see the file save system spans multiple components including `filelib.js`, `sketch.js`, the `file-saver` library, and integration with the recording/capture system. Let me create comprehensive documentation for this system.

### ../docs/src/file-save.md

File save system documentation for AI context and development guidance.

````markdown
# File Save System Overview

## Architecture

**Purpose**: Multi-modal file export system supporting single canvas saves, animation frame capture, and automated saving during playback/recording  
**Components**: Native file naming utilities, external file-saver library, canvas export integration, and capture automation

## Core Components

### FileLib Module (`src/filelib.js`)
Utility functions for consistent file naming and timestamping.

**Functions:**
```javascript
datestring()           // Generate timestamp: "YYYYMMDDHHMMSS"
filenamer(prefix)      // Factory for sequential frame naming
```

**Implementation Pattern:**
```javascript
// Closure-based counter for frame sequences
const filenamer = (prefix) => {
  let frame = 0
  return () => {
    const name = `polychrometext.${prefix}-${String(frame).padStart(6, '0')}`
    frame += 1
    return name
  }
}
```

### File-Saver Library Integration
External dependency for cross-browser file download support.

**Import**: `import saveAs from 'file-saver'`  
**Usage Pattern**: Convert canvas to blob, then trigger download
```javascript
const saver = (canvas, name) => {
  canvas.toBlob(blob => saveAs(blob, name))
}
```

## Save Modes

### Manual Canvas Export
**Function**: `pct.save_sketch()`  
**Trigger**: User-initiated save via GUI or keyboard shortcut  
**Format**: PNG with timestamp  
**Naming**: `{params.name}.{YYYYMMDDHHMMSS}.png`

```javascript
p5.saveCanvas(`${params.name}.${getDateFormatted()}.png`)
```

### Automated Frame Capture
**Function**: `savit({ params })`  
**Triggers**: 
- `params.capturing` mode (animation frame export)
- `params.playbackSave` (recording playback saves)
- `globals.updatedCanvas` flag (change detection)

**Workflow:**
```javascript
// Frame capture sequence
if (params.capturing && globals.updatedCanvas) {
  if (namer === null) {
    namer = filenamer(datestring())  // Initialize sequential namer
  }
  saver(layers.p5.drawingContext.canvas, namer() + '.png')
  globals.captureCount += 1
  
  // Auto-stop at limit
  if (globals.captureCount > params.captureLimit) {
    params.capturing = false
    globals.captureCount = 0
  }
}
```

### Recording Playback Integration
**Purpose**: Save frames during script playback for animation generation  
**Trigger**: `params.playbackSave` flag set during recording playback  
**Integration**: Uses same `savit()` function with different trigger conditions

## File Naming Strategies

### Single Save Naming
**Pattern**: `{name}.{timestamp}.png`  
**Example**: `polychrome.text.20250622124500.png`  
**Implementation**: Inline timestamp generation in `save_sketch()`

### Sequential Frame Naming  
**Pattern**: `polychrometext.{timestamp}-{frame}.png`  
**Example**: `polychrometext.20250622124500-000001.png`  
**Implementation**: `filenamer()` factory with closure-based counter

### Timestamp Format
**Pattern**: `YYYYMMDDHHMMSS`  
**Padding**: Zero-padded to ensure consistent length  
**Timezone**: Local system timezone (no UTC conversion)

## Integration Points

### Sketch.js Integration
```javascript
// Module-level namer instance (lazy initialization)
let namer = null

// Manual save binding
pct.save_sketch = () => { /* timestamp-based save */ }

// Automated save integration in draw loop
p5.draw = () => {
  // ... drawing operations ...
  savit({ params: pct.params })  // Check for automated saves
}
```

### Parameter System Integration
**Capture Parameters:**
```javascript
{
  capturing: false,           // Animation capture mode toggle
  captureOverride: false,     // Manual capture override
  captureLimit: 200,         // Max frames before auto-stop
  playbackSave: false        // Playback save trigger
}
```

**State Tracking:**
```javascript
globals = {
  updatedCanvas: false,      // Change detection flag
  captureCount: 0           // Current frame counter
}
```

### Recording System Integration
- **Action Recording**: Save operations can be recorded as part of script playback
- **Playback Saves**: Automated saving during script execution for animation generation
- **Config Recording**: Save parameters recorded with other configuration state

## Canvas Access Patterns

### Drawing Context Access
```javascript
// Access to raw canvas for blob conversion
layers.p5.drawingContext.canvas

// p5.js native save method
p5.saveCanvas(filename)
```

### Multi-Layer Considerations
- Saves composite canvas (main display canvas)
- Drawing layer automatically composited via `renderLayers()` before save
- No individual layer export (exports final rendered result)

## Performance Considerations

### Blob Conversion
- **Async Operation**: Canvas-to-blob conversion is asynchronous
- **Memory Usage**: Large canvases create large blobs
- **File Size**: PNG format, no compression options exposed

### Batch Capture Optimization
- **Frame Rate Control**: Capture mode can modify frame rate for consistent timing
- **Change Detection**: `globals.updatedCanvas` prevents unnecessary saves
- **Counter Management**: Automatic cleanup when capture limit reached

## Error Handling & Edge Cases

### Filename Conflicts
- **Timestamp Resolution**: Second-level precision may cause conflicts for rapid saves
- **Sequential Numbering**: Frame sequence prevents conflicts in batch mode
- **Browser Handling**: File-saver library handles browser-specific download behaviors

### Capture Mode Edge Cases
- **Memory Accumulation**: Large capture sequences may impact browser performance
- **Incomplete Captures**: Manual stop vs automatic limit stopping
- **Frame Rate Coordination**: Capture mode frame rate vs normal operation frame rate

## Development Patterns

### Save Integration Pattern
```javascript
// 1. Trigger save action
recordAction({ action: 'save' }, playbackMode)

// 2. Check save conditions
if (shouldSave()) {
  // 3. Generate filename
  const filename = generateFilename()
  
  // 4. Export canvas
  saver(canvas, filename)
  
  // 5. Update state
  updateSaveState()
}
```

### Namer Lifecycle Management
```javascript
// Lazy initialization pattern
if (namer === null) {
  namer = filenamer(datestring())
}

// Reset for new capture session
namer = null  // Forces re-initialization with new timestamp
```

## Future Enhancement Considerations

### Format Options
- **Current**: PNG only
- **Potential**: JPG, WebP, SVG export options
- **Compression**: Quality settings for lossy formats

### Metadata Integration
- **Current**: Filename-based metadata only
- **Potential**: Embedded parameter state, creation timestamp
- **Export**: JSON sidecar files with settings

### Batch Operations
- **Current**: Sequential frame export
- **Potential**: Parallel processing, progress indicators
- **Optimization**: Canvas pooling, memory management

## AI Development Context

### Key Design Principles
1. **Separation of Concerns**: File utilities separate from canvas operations
2. **Flexible Naming**: Support for both manual and automated naming strategies
3. **State Integration**: Save operations integrated with parameter and recording systems
4. **Cross-Browser Compatibility**: File-saver library handles browser differences

### Critical Dependencies
- **File-Saver Library**: External dependency for download functionality
- **Canvas API**: Native canvas-to-blob conversion
- **Parameter System**: Capture settings and state management
- **Recording System**: Integration with playback and automation

### Testing Considerations
- **File Generation**: Verify filename generation patterns
- **Canvas Export**: Test canvas-to-blob conversion
- **State Management**: Validate capture counter and flag handling
- **Integration**: Test save triggers across different application modes

### Performance Monitoring
- **Memory Usage**: Track blob creation and disposal
- **File Size**: Monitor export size with different canvas dimensions
- **Timing**: Capture frame rate consistency and timing accuracy
````

---

_**User**_

Please create a commit message covering the creation of these 3 new doc files (file-save.md, layers.md, params.md)

---

_**Assistant**_

Based on the three documentation files created, here's an appropriate commit message following the Conventional Commits format:

```
docs: add comprehensive module documentation for core systems

- Add file-save.md covering multi-modal export system with canvas saves, animation capture, and automated saving during playback/recording
- Add layers.md documenting multi-canvas management system with explicit ownership semantics and memory management patterns
- Add params.md covering centralized parameter system structure, color integration, and drawing mode relationships

All documentation optimized for AI-assisted development context with focus on integration points, performance considerations, and development patterns.
```

This commit message:
- Uses the `docs:` type for documentation changes
- Provides a clear summary of what was added
- Lists the three files with brief descriptions of their purpose
- Notes the AI optimization focus which is key to these documentation files
- Follows the project's commit message style guidelines

---

