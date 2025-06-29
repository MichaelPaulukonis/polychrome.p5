# Font System Overview

## Module Purpose
The font system provides dynamic font detection and loading for the PolychromeText canvas rendering application. It combines system font detection with custom TTF font loading to provide a comprehensive font selection interface.

## Core Components

### `src/fonts.js`
- **Font Detection**: Uses DOM-based font detection to identify available system fonts
- **System Font List**: Predefined array of 38 common system fonts (Arial, Helvetica, Times, etc.)
- **Custom Font Integration**: Hardcoded list of custom fonts matching TTF files in `assets/fonts/`
- **Export**: Single `fontList` array combining detected system fonts + custom fonts

#### Font Detection Algorithm
- Creates test spans with monospace/sans-serif/serif fallbacks
- Measures character width/height differences to detect font availability
- Uses test string "mmmmmmmmmmlli" at 72px for maximum differentiation
- Filters system fonts based on detection results

### Font Loading (`src/sketch.js`)
- **Dynamic TTF Loading**: Uses webpack `require.context()` to load all `.ttf` files from `assets/fonts/`
- **Font Registry**: Creates `fontList` object mapping font names to p5.Font objects
- **Font Resolution**: `setFont()` function prioritizes loaded TTF fonts over system fonts
- **Preload Integration**: TTF fonts loaded in p5.js `preload()` lifecycle

```javascript
// Font loading pattern
const fonts = require.context('@/assets/fonts', false, /\.ttf$/)
const loadedFonts = fonts.keys().map(f => f.replace(/\.\/(.*?)\.ttf/, '$1'))
loadedFonts.forEach((font) => {
  fontList[font] = p5.loadFont(require(`@/assets/fonts/${font}.ttf`))
})
```

### Parameter Integration (`src/params.js`)
- **Font Selection**: Imports `fontList` from `fonts.js` for GUI dropdown
- **Default Font**: Sets first font in list as default (`fontList[0]`)
- **GUI Integration**: Provides font options for user selection interface

## Asset Organization

### `assets/fonts/` Directory
Contains 40+ TTF/OTF files including:
- **Retro/Gaming**: Atari fonts, VT323, enhanced_dot_digital-7
- **Display/Decorative**: BlackCasper, Hellvetica, UpheavalPro
- **Icon Fonts**: Social Icons, Type Icons, Credit Cards, openlogos
- **Specialized**: carbontype, Interlac-SD, PixieSerif variants

## Current Behavior

### Font Resolution Priority
1. **TTF Files**: Custom fonts loaded via p5.loadFont() take precedence
2. **System Fonts**: Fallback to browser-detected system fonts
3. **String Fallback**: Raw font names passed to canvas if not found

### Font Application
- Applied per-layer via `setFont(font, layer)`
- Default applied to drawing layer during initialization
- Canvas text rendering uses p5.js text functions

## Integration Points

### Canvas Rendering
- Font setting integrated with layer system
- Applied before text rendering operations
- Cached font objects for performance

### GUI Controls
- Font dropdown populated from combined font list
- Real-time font switching via parameter updates
- Font preview in GUI interface

## Suggested Improvements

### Code Organization
- **Type Safety**: Convert to TypeScript with proper font type definitions
- **Async Loading**: Implement proper async font loading with loading states
- **Error Handling**: Add fallback mechanisms for failed font loads
- **Font Validation**: Verify TTF files match hardcoded font names

### Performance Optimization
- **Lazy Loading**: Load fonts on-demand rather than all at preload
- **Font Caching**: Implement font caching strategy for repeated use
- **Detection Caching**: Cache system font detection results

### Asset Management
- **Automatic Discovery**: Replace hardcoded font list with dynamic asset scanning
- **Font Metadata**: Add font metadata (category, license, description)
- **License Tracking**: Centralize font license information

### API Improvements
- **Font Categories**: Organize fonts by type (serif, sans-serif, display, icon)
- **Font Previews**: Generate font preview images for GUI
- **Font Metrics**: Expose font metrics for better text layout

## Dependencies
- **p5.js**: Font loading and text rendering
- **Webpack**: Asset bundling and require.context()
- **DOM**: Font detection via browser APIs
- **GUI System**: Font selection interface

## Testing Considerations
- Mock font loading for unit tests
- Test font detection across different browsers/platforms
- Validate font fallback behavior
- Test font loading error conditions
