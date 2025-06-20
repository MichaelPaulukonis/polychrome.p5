refactor: extract drawing modes into modular, factory-based architecture

- Extract drawing mode logic from monolithic sketch.js into dedicated painter modules
- Create shared utility modules (utils, drawing-utils, core-generators) for code reuse
- Implement factory pattern for consistent drawing mode interfaces with immutable parameters
- Add comprehensive unit test suite with 64 tests covering all extracted modules
- Create AI-optimized documentation for modular architecture and development patterns

BREAKING CHANGES:
- Drawing mode functions moved from sketch.js to dedicated painter modules
- Shared utilities extracted to separate modules with new import paths
- Factory pattern replaces direct function calls for drawing mode instantiation

Modules Created:
- src/drawing-modes/grid-painter.js: Grid-based text layout with invert mode support
- src/drawing-modes/circle-painter.js: Radial text arrangement in concentric circles
- src/drawing-modes/rowcol-painter.js: Matrix-based row/column layout with cell positioning
- src/drawing-modes/drawing-utils.js: Shared drawing utilities (textGetter, setShadows, trText)
- src/drawing-modes/core-generators.js: Coordinate and text generators for all modes
- src/utils/index.js: General utilities (apx pixel rounding, pushpop state management)

Testing:
- test/utils.test.js: Unit tests for general utilities (5 tests)
- test/drawing-utils.test.js: Unit tests for drawing utilities (24 tests)
- test/core-generators.test.js: Unit tests for coordinate generators (10 tests)
- test/drawing-mode-painters.test.js: Integration tests for all painters (13 tests)

Documentation:
- notes/src/drawing-modes/README.md: Comprehensive module architecture documentation
- notes/src/utils/README.md: General utilities documentation

Technical Details:
- Maintain visual consistency and parameter immutability across all drawing modes
- Preserve existing behavior while enabling extensibility for future drawing modes
- Optimize for canvas rendering performance with shared coordinate generators
- Enable comprehensive testing with proper p5.js mocking and isolated unit tests
- Follow factory pattern: createXxxPainter(dependencies).paint(params, dimensions)

Impact:
- Improved code maintainability through modular architecture
- Enhanced testability with 64 comprehensive unit tests
- Better code reuse through shared utility modules  
- Cleaner separation of concerns between drawing logic and canvas management
- Established patterns for adding new drawing modes with consistent interfaces
