# Font System Overview

## Module Purpose
The font system provides dynamic font detection and loading for the PolychromeText canvas rendering application. It now leverages Nuxt 3's module system and Vite for efficient custom font discovery and loading, combined with client-side system font detection to offer a comprehensive font selection interface.

## Core Components

### `src/fonts.js`
- **System Font Detection**: This file is primarily responsible for detecting available system fonts on the client's machine using DOM-based techniques.
- **System Font List**: It maintains a predefined array of common system fonts (e.g., Arial, Helvetica, Times).
- **Export**: Exports a list of detected and predefined system fonts.
- **Note**: This file no longer handles the loading or management of custom TTF fonts.

#### Font Detection Algorithm
- Creates test spans with monospace/sans-serif/serif fallbacks.
- Measures character width/height differences to detect font availability.
- Uses test string "mmmmmmmmmmlli" at 72px for maximum differentiation.
- Filters system fonts based on detection results.

### `modules/font-loader.js`
This Nuxt 3 module dynamically discovers custom TTF fonts.
- **Dynamic Font Discovery**: Reads `.ttf` files directly from the `public/fonts/fonts` directory.
- **Virtual Module**: Creates a Vite virtual module (`virtual:font-names`) that exports an array of discovered font filenames (without the `.ttf` extension). This allows other parts of the application to import the list of available custom fonts at build time.

### Font Loading (`src/sketch.js`)
The `src/sketch.js` file is responsible for loading the custom TTF fonts discovered by `font-loader.js` and making them available to p5.js.
- **Import Font Names**: Imports `fontNames` from the `virtual:font-names` module.
- **Dynamic TTF Loading**: In the p5.js `preload()` lifecycle function, it iterates through the `fontNames` array and loads each custom font using `p5.loadFont()`, constructing the path to the font file in `public/fonts/fonts/`.
- **Font Registry**: Stores the loaded p5.Font objects in a `fontList` object, mapping font names to their loaded instances.
- **Font Resolution**: The `setFont()` function uses this `fontList` to apply the correct font to p5.js layers, prioritizing loaded TTF fonts.

```javascript
// Font loading pattern in src/sketch.js
import { fontNames } from 'virtual:font-names'

const fontList = {}

// ... inside p5.preload = () => { ... }
fontNames.forEach((fontName) => {
  fontList[fontName] = p5.loadFont(`/fonts/fonts/${fontName}.ttf`)
})
```

### Parameter Integration (`src/params.js`)
- **Font Selection**: Imports the combined font list (system + custom) for GUI dropdowns.
- **Default Font**: Sets the first font in the list as default.
- **GUI Integration**: Provides font options for the user selection interface.

## Asset Organization

### `public/fonts/fonts/` Directory
This directory contains all custom TTF/OTF font files. The `modules/font-loader.js` module scans this directory to dynamically generate the list of available custom fonts.

## Current Behavior

### Font Resolution Priority
1.  **Loaded TTF Files**: Custom fonts loaded via `p5.loadFont()` in `src/sketch.js` take precedence.
2.  **System Fonts**: Fallback to browser-detected system fonts.
3.  **String Fallback**: Raw font names passed to canvas if not found.

### Font Application
- Applied per-layer via `setFont(font, layer)`.
- Default applied to drawing layer during initialization.
- Canvas text rendering uses p5.js text functions.

## Integration Points

### Canvas Rendering
- Font setting integrated with layer system.
- Applied before text rendering operations.
- Cached font objects for performance.

### GUI Controls
- Font dropdown populated from combined font list.
- Real-time font switching via parameter updates.
- Font preview in GUI interface.

## Suggested Improvements

### Code Organization
- **Type Safety**: Convert to TypeScript with proper font type definitions.
- **Async Loading**: Implement proper async font loading with loading states (if not already handled by p5.js `preload`).
- **Error Handling**: Add fallback mechanisms for failed font loads.
- **Font Validation**: Verify TTF files match expected names or formats.

### Performance Optimization
- **Lazy Loading**: Consider loading fonts on-demand rather than all at preload if the number of custom fonts becomes very large.
- **Detection Caching**: Cache system font detection results.

### Asset Management
- **Font Metadata**: Add font metadata (category, license, description) if not already present.
- **License Tracking**: Centralize font license information.

### API Improvements
- **Font Categories**: Organize fonts by type (serif, sans-serif, display, icon).
- **Font Previews**: Generate font preview images for GUI.
- **Font Metrics**: Expose font metrics for better text layout.

## Dependencies
- **p5.js**: Font loading and text rendering.
- **Nuxt 3**: Framework for application structure.
- **Vite**: Build tool used by Nuxt 3 for asset bundling and virtual modules.
- **`modules/font-loader.js`**: Custom Nuxt module for dynamic font discovery.
- **DOM**: For system font detection via browser APIs.
- **GUI System**: For font selection interface.

## Testing Considerations
- Mock font loading for unit tests.
- Test font detection across different browsers/platforms.
- Validate font fallback behavior.
- Test font loading error conditions.
- Ensure dynamic font discovery works correctly with various font file names.