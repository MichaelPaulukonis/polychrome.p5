# GitHub Copilot Instructions for PolychromeText

## Project Documentation Reference

For comprehensive project context, architecture, and features, see: [Project Master Documentation](../notes/master.md)

## Copilot-Specific Guidelines

### Development Context
- This is a creative coding application, not a typical web app
- Performance considerations focus on canvas rendering
  - operations working with lots of very small text may take a long time to render
- State management is primarily client-side (localStorage)
- Security considerations are minimal (no auth/sensitive data)

### Technology Preferences
When suggesting code, prioritize:
- **p5.js** for all visual rendering
- **TypeScript** over JavaScript (migration in progress)
- **Nuxt 2** patterns (until v3 upgrade completed)
- **Conventional Commits** for all commit messages

### Code Style Requirements

#### Core Preferences
- **TypeScript**: Prefer TypeScript over JavaScript (migration in progress)
- **p5.js patterns**: Use p5.js idioms for canvas operations and event handling
- **Functional style**: Prefer pure functions and immutable data patterns
- **Project imports**: Use `~/` alias for project root imports

#### Code Quality Standards
- **Type safety**: Properly type all function parameters and return values
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/components
- **Comments**: Document complex canvas operations and color algorithms
- **Error handling**: Handle canvas operations that may fail gracefully

### p5.js Specific Patterns
- **Instance mode**: uses p5js' instance mode, with variable prefixes depending on file or function
- **Setup/Draw lifecycle**: Initialize in `setup()`, render in `draw()`
- **Event handling**: Use p5.js event functions (`mousePressed`, `keyPressed`)
- **Canvas management**: Handle multiple canvases with `createGraphics()`
- **Color mode**: Use HSB color space for better color manipulation

#### Framework Patterns (Nuxt 2)
- **Components**: Use Vue single-file components with composition pattern
- **State**: Leverage localStorage for persistence, avoid complex state management
- **Performance**: Optimize for canvas rendering operations

#### Accessibility & Standards
- **Semantic HTML**: Use appropriate elements for UI controls
- **Keyboard navigation**: Ensure canvas controls are keyboard accessible
- **Color contrast**: Maintain WCAG 2.1 AA compliance for UI elements

=== UNDER CONSIDERATION ONLY ===
For CSS, use TailwindCSS with responsive designs based on Flexbox/Grid.
=== END UNDER CONSIDERATION ONLY ===

## Testing and Quality Considerations

### Testing Priorities for Creative Coding
- **Utility functions**: Test color algorithms, coordinate/grid generators, and text processing
- **Canvas operations**: Mock p5.js for testing drawing logic
- **Parameter validation**: Ensure UI controls produce valid values
- **State persistence**: Test localStorage save/load functionality

### Testing Tools
- Use Jest/Vitest for utility function testing
- Mock p5.js canvas operations in tests
- Focus on mathematical correctness over visual output

## Commit Message Guidelines

All commit messages should adhere to the Conventional Commits specification.
For detailed instructions, please refer to [Conventional Commits 1.0.0](./copilot-commit-message-instructions.md).

