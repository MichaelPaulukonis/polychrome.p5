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
- **Integration**: Test save triggers across different
