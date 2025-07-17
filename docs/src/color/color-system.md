# Color System Module

## Overview
The color system module provides a centralized, factory-based approach to handling all color operations in PolychromeText. It manages paint modes, color algorithms, and layer-specific color application while maintaining compatibility with dynamic layer replacement.

## Architecture

### Factory Pattern
The module exports a `createColorSystem(p5, layers)` factory function that:
- Takes a p5 instance and layers object as dependencies
- Returns an object with `setFillMode` and `setOutlineMode` methods
- Automatically references the current `layers.drawingLayer` for all operations
- Ensures compatibility with layer recreation after canvas operations

### Dynamic Layer Reference
The system uses `layers.drawingLayer` directly rather than storing a layer reference, allowing it to work seamlessly when:
- Canvas is rotated (creates new drawing layer)
- Layer is replaced or recreated
- Multiple drawing operations occur on different layers

## Public API

### `createColorSystem(p5, layers)`
Factory function that creates a color system instance.

**Parameters:**
- `p5` - p5.js instance for color operations and utilities
- `layers` - Layers object containing `drawingLayer` reference

**Returns:** Object with `setFillMode` and `setOutlineMode` methods

### `setFillMode(params, colorAlpha, hexStringToColors)`
Applies fill colors to the current drawing layer based on paint mode.

**Parameters:**
- `params` - Configuration object containing paint mode and color settings
- `colorAlpha` - Function to create colors with alpha transparency
- `hexStringToColors` - Function to parse hex color strings

**Paint Modes Supported:**
- `rainbow1-4` - HSB-based positional coloring
- `lerp-quad` - Multi-color interpolation with quadratic easing
- `lerp-scheme` - Multi-color interpolation using color schemes
- `gray1-2` - Grayscale gradients
- `solid` - Single color fills
- `black/white` - Solid black/white colors

### `setOutlineMode(params, colorAlpha, hexStringToColors)`
Applies stroke colors to the current drawing layer based on paint mode.

**Parameters:**
- Same as `setFillMode`
- Uses `params.outlinePaintMode` to determine stroke color algorithm

## Color Algorithms

### Rainbow Modes (rainbow1-4)
HSB-based coloring that varies hue based on position:
- `rainbow1` - Hue based on X position
- `rainbow2` - Hue based on Y position  
- `rainbow3` - Hue based on X+Y position
- `rainbow4` - Hue based on X*Y position

All rainbow modes support:
- Configurable saturation and brightness
- Alpha transparency
- Hue shifting and rotation

### Lerp Modes (lerp-quad, lerp-scheme)
Multi-color interpolation algorithms:
- `lerp-quad` - Interpolates between 4 corner colors using quadratic easing
- `lerp-scheme` - Interpolates through a sequence of scheme colors

Both support:
- Position-based color mixing
- Smooth transitions between colors
- Alpha transparency

### Grayscale Modes (gray1-2)
Monochrome gradient algorithms:
- `gray1` - Brightness based on X position
- `gray2` - Brightness based on Y position

Features:
- Configurable brightness range
- Alpha transparency support
- Gamma correction compatibility

### Solid Colors
Simple single-color fills:
- `solid` - Uses `params.fillColor` or `params.outlineColor`
- `black` - Pure black (#000000)
- `white` - Pure white (#FFFFFF)

## Internal Functions

### `setPaintMode(props)`
Core algorithm dispatcher that:
- Analyzes paint mode from parameters
- Calls appropriate color algorithm
- Handles position-based color calculations
- Applies colors to the layer using p5.js methods

### `colorAlpha(aColor, alpha)` (External Dependency)
Utility function for creating colors with transparency:
- Takes color and alpha value (0-1)
- Returns p5.Color object with specified alpha
- Used throughout color algorithms for transparency effects

## Usage Examples

### Basic Setup
```javascript
import { createColorSystem } from '~/src/color/color-system'

// In setup()
const colorSystem = createColorSystem(p5Instance, layers)
```

### Applying Colors
```javascript
// Set fill color based on current parameters
colorSystem.setFillMode(allParams, colorAlpha, hexStringToColors)

// Set stroke color based on current parameters  
colorSystem.setOutlineMode(allParams, colorAlpha, hexStringToColors)
```

### With Drawing Operations
```javascript
// Colors are automatically applied to current drawing layer
colorSystem.setFillMode(params, colorAlpha, hexStringToColors)
layer.text(char, x, y)

// Works after layer recreation
rotateCanvas() // Creates new drawing layer
colorSystem.setFillMode(params, colorAlpha, hexStringToColors) // Still works
```

## Integration Points

### Sketch.js Integration
- Factory called in `setup()` with p5 instance and layers object
- Methods called in drawing functions (`drawGrid`, `drawCircle`, `drawRowCol`)
- Utilities passed as parameters from sketch scope

### Parameter System
Relies on parameter objects containing:
- `paintMode` / `outlinePaintMode` - Algorithm selection
- `fillColor` / `outlineColor` - Base colors for solid modes
- `fillAlpha` / `outlineAlpha` - Transparency values
- Color scheme arrays for lerp modes
- Position and dimension data for calculations

### Layer System
- Always operates on `layers.drawingLayer`
- Compatible with layer recreation and replacement
- Supports multiple canvas operations without reinitialization

## Dependencies

### External Dependencies
- p5.js instance for color operations and math utilities
- Layers object with `drawingLayer` reference

### Function Dependencies (Passed as Parameters)
- `colorAlpha` - Color transparency utility
- `hexStringToColors` - Hex string parsing utility

### Parameter Dependencies
- `allParams` object with paint mode and color settings
- Position data (x, y coordinates)
- Canvas dimensions (width, height)

## Benefits of This Architecture

### Modularity
- Separates color logic from main sketch file
- Encapsulates all color-related functionality
- Easy to test and maintain independently

### Flexibility
- Dynamic layer reference enables seamless layer replacement
- Factory pattern allows multiple color system instances
- Plugin-style architecture for easy extension

### Performance
- No layer recreation overhead
- Direct reference to current drawing layer
- Minimal function call overhead

### Maintainability
- Clear separation of concerns
- Centralized color algorithm management
- Consistent API across all paint modes
