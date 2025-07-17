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
- Some parameters have interdependencies (e.g., `useOutline` affects stroke)
