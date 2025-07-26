# sketch.js Overview

## Imports
- `UndoLayers` - Canvas history/undo functionality management
- `Layers` - Multi-canvas layer management system
- `allParams, fillParams, outlineParams, drawModes, globals` - Configuration parameters from `@/src/params.js`
- `hexStringToColors` - Color string parsing utility from `@/src/gui/gui.color.control`
- `setupGui` - GUI initialization and controls from `@/src/gui/gui`
- `recordAction, recordConfig, output, clear as clearRecording` - Recording/playback system from `@/src/scripting/record`
- `saveAs` - File saving utility from `file-saver` library
- `datestring, filenamer` - File naming utilities from `@/src/filelib`
- `setupActions` - Action/macro system setup from `@/src/gui/actions`
- `createColorFunctions, createGammaAdjustment, initializeColorMode` - Color system factories from `@/src/color/color-system`
- `createCanvasTransforms` - Factory for canvas transformation functions from `@/src/canvas-transforms`
- `createDrawingModes` - Factory for drawing mode functions from `@/src/drawing-modes`
- `apx, pushpop` - Utility functions from `@/src/utils`
- `fonts` - Dynamic import context for TTF font files from `assets/fonts`

## Global Variables
- `namer` - File naming helper instance
- `density` - Pixel density setting (set to 2 for high-DPI displays)
- `layers` - `Layers` class instance for managing drawing layers.
- `colorSystem` - Object containing color functions, created by `createColorFunctions`.
- `adjustGamma` - Function for gamma adjustment, created by `createGammaAdjustment`.
- `canvasTransforms` - Object containing canvas transformation functions, created by `createCanvasTransforms`.
- `drawingModes` - Object containing drawing mode functions, created by `createDrawingModes`.
- `undo` - `UndoLayers` class instance for undo/redo functionality.
- `fontList` - Object containing loaded p5.js font objects.
- `loadedFonts` - Array of available font names.
- `imgMask` - Gradient mask image for visual effects.
- `APP_MODES` - Drawing mode constants object.

## Core Setup/Lifecycle Functions

### `preload()`
- Loads TTF fonts from the `assets/fonts` folder.
- Loads a gradient mask image for visual effects.
- Calls `invertMask()` to prepare the mask for use.

### `setup()`
- Initializes the main p5.js canvas.
- Initializes the `Layers` system with a drawing layer and a temp layer.
- Initializes core modules by calling their respective factory functions:
  - `createColorFunctions`
  - `createGammaAdjustment`
  - `createCanvasTransforms`
  - `createDrawingModes`
- Sets up the GUI using `setupGui`.
- Initializes the `UndoLayers` system.
- Assigns the functions from the initialized modules to the main `pct` object, which is exposed to the rest of the application.
- Records the initial configuration for the scripting/playback system.

### `draw()`
The main render loop, which:
- Handles automated painting via `autoDraw()` if `params.autoPaint` is true.
- Increments animated parameters.
- Handles script playback.
- Calls `standardDraw()` for interactive drawing.
- Handles saving frames for capture/playback.

### `mousePressed()`
Takes an undo snapshot when the mouse is pressed within the canvas bounds.

## Drawing and Painting

### `paint(xPos, yPos, params)`
The main painting function. It sets the current font and then delegates to the appropriate drawing mode function (`drawGrid`, `drawCircle`, or `drawRowCol`) from the `drawingModes` object based on `params.drawMode`.

### `standardDraw({ x, y, override, params })`
Handles normal interactive painting with mouse input. It checks if the mouse is within the canvas, records the action, and calls `paint()`.

### `autoDraw(minX, minY, maxX, maxY)`
Handles the automated random painting mode. It can randomly apply macros, actions, or call `standardDraw()` with random coordinates.

## Module Integration

The `sketch.js` file acts as a central coordinator that initializes and integrates several external modules.

### Drawing Modes
Drawing logic is handled by the `drawing-modes` module. The `createDrawingModes` factory returns an object with `drawGrid`, `drawCircle`, and `drawRowCol` functions. These functions are called from `paint()` and are responsible for rendering the different visual patterns.

### Canvas Transforms
Canvas transformations like `flip`, `mirror`, and `rotateCanvas` are provided by the `canvas-transforms` module. The `createCanvasTransforms` factory returns an object containing these functions, which are then attached to the `pct` object.

### Color System
Color management is handled by the `color-system` module. The `createColorFunctions` factory provides functions for handling fill and stroke colors. The `createGammaAdjustment` factory provides the `adjustGamma` function.

## Canvas Operations

### `clearCanvas({ layers, params })`
- Records the clear action.
- Clears the drawing layer and main canvas with the background color.
- Re-initializes the color mode.

### `renderLayers({ layers })`
Composites the drawing layer onto the main canvas and then clears the drawing layer.

## Layer Management Functions

### `initDefaultLayer(w, h)`
Creates a new p5.js graphics layer with the specified dimensions and pixel density.

### `initDrawingLayer(w, h)`
Creates the main drawing layer, sets the default font and text alignment, and initializes the color mode.

### `setFont(font, layer)`
Sets the `textFont` on a given layer.

## Other Key Functions

### `randomLayer(cfg)`
Places an image from the undo history onto the canvas at a random location with optional rotation, transparency, and masking effects.

### `increment(params)`
Updates animated parameters for effects like skewing.

### `savit({ params })`
Handles automatic saving of frames during playback or capture modes.

## Action System (`pct` object)

The `pct` object serves as the main API for the sketch, exposing its functionality to other parts of the application, including the GUI. It contains:
- Core p5.js instance (`p5`)
- `Layers` instance (`layers`)
- Application parameters (`params`)
- Functions from the various modules (e.g., `flip`, `drawGrid`, `clearCanvas`)
- Application mode state (`appMode`, `APP_MODES`)
- Undo manager (`undo`)
- Scripting and recording functions.
