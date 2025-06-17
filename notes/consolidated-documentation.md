# Polychrome - Consolidated Documentation

## Overview
PolychromeText is a multi-color text painter that transforms text into visual art through various drawing modes, color schemes, and interactive controls.

**Technical Implementation**: The main sketch file implements a multi-layered text painting application using p5.js with sophisticated canvas management and rendering systems.

## Technology Stack
- **p5.js**: Core creative coding library for all visual rendering
- **JavaScript/ES6+**: Primary programming language
- **Nuxt 2**: Framework for building the application (with roadmap upgrade to v3)
- **HTML5/CSS3**: Application structure and styling
- **Local Storage**: For saving user preferences and images


## Architecture Overview

### Core Components
- **Layer Management**: Multi-canvas system with drawing layer, main canvas, and temporary layers
- **Drawing Modes**: Three primary modes - Grid, Circle, and RowCol text layouts
- **Color Systems**: HSB color mode with multiple paint algorithms (rainbow, lerp, solid, etc.)
- **Text Management**: Handles font loading, text rendering, and character/word generation
- **Undo System**: History management for canvas states

### Technical Architecture
- **Modular Component System**: Separation of concerns with independent modules
- **Interactive Programming Model**: Direct user input handling through p5.js callbacks
- **Object-Oriented Design**: Encapsulating elements as objects

### File Structure
- `/.github`: instructional files for Github Copilot assistance
- `/assets`: Images, fonts, and other static assets
- `/components`: Vue components
- `/dev.utilites`: which are somehow different from tools (not part of deployed app)
- `/layouts`: layouts
- `/notes`: project docs and thoughts
- `/pages`: pages (one)
- `/plugins`
- `/src`: Source code
- `/static`: fonts and favicon
- `/styles`: CSS styling
- `/tools`: move images around for animating (not part of deployed app)

## Application Modes

### Drawing Modes
- **STANDARD_DRAW**: Normal interactive painting mode
- **NO_DRAW**: Paused state, no drawing operations
- **PLAYBACK**: Script replay mode for automation
- **TARGET**: Canvas point selection mode (incomplete feature)

### Paint Modes
- **Grid**: Text arranged in grid patterns with configurable spacing
- **Circle**: Text arranged along circular/arc paths
- **RowCol**: Simple row/column text layout

## Core Features

### User-Facing Features
- Interactive canvas with real-time visual feedback
- Dynamic color palette generation and manipulation
- User controls for adjusting parameters
- Save and export functionality for created artworks
- "auto-paint" by random-selection of parameters

### Advanced Features
- **Mouse painting**: Click and drag to paint text
- **Keyboard shortcuts**: Extensive hotkey system
- **Auto-paint mode**: Automated random painting
- **Macro system**: Predefined complex operations

## Core Functionality

### Canvas Management
- **Multi-layer system**: Main display canvas + drawing layer + temporary layer
- **Dynamic resizing**: Canvas dimensions adjustable at runtime
- **Pixel density**: Retina/high-DPI display support

### Text Rendering
- **Font loading**: TTF fonts loaded from assets
- **Text sizing**: Automatic fitting algorithms for different contexts
- **Character modes**: Sequential, random, or word-based text generation

### Color Systems
Multiple paint modes available:
- `rainbow1-4`: HSB-based positional coloring
- `lerp-quad/scheme`: Multi-color interpolation
- `gray1-2`: Grayscale gradients
- `solid`: Single color fills

### Transform Operations
- **Rotation**: Canvas and text rotation with cumulative options
- **Mirroring**: Horizontal/vertical canvas flipping
- **Shifting**: Pixel-level canvas translation

## Visual Style & Interaction Design
- **Minimalist UI**: Focuses attention on the canvas
- **High contrast**: Between UI elements and generated art
- **Mouse input**: Direct manipulation capabilities
- **Parameter sliders**: Fine-tuning visual elements
- **Keyboard shortcuts**: Power user functionality

## State Management

### Parameters
- Global application parameters (allParams)
- Fill and outline color parameters
- Drawing mode and text behavior settings
- Canvas size and rendering options

### Recording System
- Action recording for playback scripts
- Configuration state tracking
- Export capabilities for automation

## Integration Points

### GUI Integration
- QuickSettings-based control panels
- Real-time parameter binding
- Preset save/load system

### File Operations
- Canvas export (PNG format)
- Animation frame capture
- Settings persistence (localStorage)

## Performance Considerations
- **Generator functions**: Memory-efficient text/coordinate generation
- **Layer separation**: Isolated drawing operations
- **Pixel density management**: Optimized for different display types
- **Frame rate control**: Adjustable for smooth interaction vs. capture modes

## Setup Instructions
1. **Prerequisites**:
   - Node.js (latest LTS version)
   - npm or yarn package manager

2. **Installation**:
   ```zsh
   git clone https://github.com/username/polychrome.p5.git
   cd polychrome.p5
   npm install
   ```

3. **Running Locally**:
   ```zsh
   npm start
   ```
   The application will be available at `http://localhost:3000`

4. **Building for Production**:
   ```zsh
   npm run build
   ```

## Development Guidelines
- **Code Style**: Follow JavaScript Standard Style guidelines
- **Documentation**: Document all functions and complex code sections
- **Naming Conventions**: Use camelCase for variables and functions
- **Testing**: Test visual components manually on different devices/browsers

## Current Limitations & TODOs
Based on comments in the code:
- Undo system doesn't track rotation operations
- Canvas rotation works best with square canvases
- Some color modes need refinement
- Target mode is incomplete
- Performance could be optimized for large canvases

## Development Roadmap

### High Priority
1. **Nuxt Migration**: Upgrade from Nuxt 2 to Nuxt 3
   - Currently dependent on vue-js-modal
2. **Area Targeting**: Paint into user-defined subsection of the canvas
   - Draw to selected portion of canvas
3. **UI Overhaul**: Comprehensive interface improvements
   - Fix color components in UI
   - Improve on-screen help/documentation

### Medium Priority
4. **TypeScript Migration**: Migrate to TypeScript for better type safety
5. **DSL Improvements**: A real parser for the DSL / a real DSL
6. **Testing**: Implement comprehensive test suite
7. **More Color Algorithms**: Expand color generation capabilities
8. **p5js upgrade**: move to 2.0

### Future Considerations
9. **Framework Exploration**: Look at q5 as potential alternative
10. **Dependency Cleanup**: cheerio can be removed, see dragline for native example

---

**Note**: This consolidated documentation combines information from multiple sources. Any contradictions or overlapping information have been integrated to provide the most comprehensive and accurate representation of the Polychrome project.
