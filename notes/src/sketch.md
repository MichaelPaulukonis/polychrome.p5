# sketch.js Overview

## Imports
- `fonts` - Dynamic import context for TTF font files from assets
- `UndoLayers` - Canvas history/undo functionality management
- `Layers` - Multi-canvas layer management system  
- `fitTextOnCanvas` - Utility for auto-sizing text to fit canvas areas
- `allParams, fillParams, outlineParams, drawModes, globals` - Configuration parameters
- `hexStringToColors` - Color string parsing utility
- `setupGui` - GUI initialization and controls
- `recordAction, recordConfig, output, clearRecording` - Recording/playback system
- `saveAs` - File saving utility from file-saver library
- `datestring, filenamer` - File naming utilities
- `setupActions` - Action/macro system setup
- `createColorSystem` - Color system factory from color module

## Global Variables
- `namer` - File naming helper instance
- `density` - Pixel density setting (set to 2 for high-DPI displays)
- `layers` - Multi-layer canvas system instance
- `colorSystem` - Color system instance created from factory with p5 and layers
- `undo` - Undo/redo system instance
- `fontList` - Object containing loaded p5.js font objects
- `loadedFonts` - Array of available font names extracted from font context
- `imgMask` - Gradient mask image for visual effects
- `APP_MODES` - Drawing mode constants object

## Core Setup/Lifecycle Functions

### `preload()`
- Loads TTF fonts from assets folder using dynamic context
- Loads gradient mask image for visual effects
- Calls `invertMask()` to prepare mask for use

### `setup()`
- Initializes canvas with pixel density and dimensions
- Creates drawing layer and temp layer via `initDrawingLayer()` and `initDefaultLayer()`
- Initializes color system with p5 instance and layers object
- Sets up GUI controls and color shift functions
- Initializes undo system with 10-state history
- Sets HSB color mode and configures initial state
- Records initial configuration

### `draw()`
Main render loop with mode switching:
- Handles auto-paint mode vs standard drawing
- Increments animated parameters via `increment()`
- Calls `savit()` for capture/playback saving

### `mousePressed()`
Takes undo snapshot when mouse pressed within canvas bounds

## Drawing Mode Functions

### `drawGrid({ xPos, params, width, height, layer })`
Renders text in grid patterns with configurable spacing:
- Supports fixed-width or text-width based layouts using generators
- Handles inversion and rotation parameters
- Applies shadows and stroke settings using color system
- Uses `blocGeneratorFixedWidth` or `blocGeneratorTextWidth`

### `drawCircle({ xPos, yPos, params, width, layer, ... })`
Arranges text along circular/arc paths:
- Calculates circumference-based text placement via `circlePainter()`
- Supports arc percentage and offset parameters
- Handles radius inversion and cumulative rotation
- Uses color system for fill and stroke operations
- Uses `blocGeneratorCircle` for coordinate generation

### `drawRowCol({ params, width, height, layer })`
Simple row/column text layout:
- Divides canvas into grid cells based on rows/columns
- Fits text size to cell dimensions
- Supports outline stroke settings via color system
- Uses `textGetter()` for character/word selection

## Canvas Operations

### `paint(xPos, yPos, params)`
Main painting function that delegates to drawing modes based on `params.drawMode`

### `clearCanvas({ layers, params })`
- Records action for playback
- Clears canvas with background color
- Resets layer properties and color mode

### `renderLayers({ layers })`
Composites drawing layer onto main canvas via `renderTarget()` and clears drawing layer

## Transform Operations

### `rotateCanvas({ direction, height, width, layers, p5 })`
Rotates entire canvas 90 degrees in specified direction using pixel manipulation

### `flip({ axis, layer })`
Mirrors canvas horizontally (`VERTICAL`) or vertically (`HORIZONTAL`) using `flipCore()`

### `mirror(cfg)`
Creates mirrored half-images along specified axis using `mirrorCore()`

### `shift(cfg)`
Shifts pixels with wrapping using canvas ImageData API

### `adjustGamma(props)`
Applies gamma correction to adjust brightness/contrast via pixel manipulation

## Color System Integration

### Color System Usage
The sketch integrates with the external color system module via:
- `colorSystem.setFillMode(params, colorAlpha, hexStringToColors)` - Applies fill colors based on paint mode
- `colorSystem.setOutlineMode(params, colorAlpha, hexStringToColors)` - Applies stroke colors based on paint mode

The color system automatically references the current `layers.drawingLayer`, ensuring compatibility with dynamic layer replacement after operations like canvas rotation.

For detailed color system documentation, see: `notes/src/color/color-system.md`

## Utility Functions

### `standardDraw({ x, y, override, params })`
Handles normal interactive painting with mouse input and canvas bounds checking

### `autoDraw(minX, minY, maxX, maxY)`
Automated random painting mode that applies actions or random operations

### `textGetter(textMode, textManager)`
Returns appropriate text generation function:
- `sequential` → `getchar`
- `random` → `getcharRandom` 
- default → `getWord`

### `randomLayer(cfg)`
Places random historical layer with optional rotation, transparency, and masking effects

### `increment(params)`
Updates animated parameters using `skewCollection` array

## File Operations

### `save_sketch()`
Exports current canvas as PNG with timestamp using `saver()` helper

### `saveAnimationFrames()`
Toggles animation frame capture mode (incomplete implementation)

### `savit({ params })`
Handles automatic saving during playback/capture modes

## Generator Functions

### `blocGeneratorFixedWidth(gridParams, nextText)`
Yields coordinate/text blocks for fixed-width grid layouts

### `blocGeneratorTextWidth(nextText, gridSize, yOffset, layer)`
Yields coordinate/text blocks based on actual text width measurements

### `blocGeneratorCircle({ radius, circumference, arcOffset })`
Yields theta/text blocks for circular text placement along arc length

## Helper Functions

### `mouseInCanvas()`
Checks if mouse position is within canvas bounds

### `coinflip()`
Returns random boolean value using `p5.random()`

### `trText(layer, rotation)`
Higher-order function for translate/rotate/text operations

### `pushpop(layer)`
Higher-order function that wraps operations in push/pop matrix calls

### `apx(...fns)`
Applies array of functions to a list using forEach

## Layer Management Functions

### `initDefaultLayer(w, h)`
Creates graphics layer with specified dimensions and pixel density

### `initDrawingLayer(w, h)`
Creates drawing layer with font, alignment, and color mode configuration

### `setFont(font, layer)`
Sets font on layer, using loaded font objects or fallback

## Action System

### Exposed via `pct` object:
- `stop(mode)` / `start(mode)` - Control application modes
- Various transform operations (`flip`, `mirror`, `shift`, `rotateCanvas`)
- Drawing functions (`paint`, `clearCanvas`, `drawGrid`, `drawCircle`, `drawRowCol`)
- Utility functions and constants (`HORIZONTAL`, `VERTICAL`, `APP_MODES`)
- Recording system
