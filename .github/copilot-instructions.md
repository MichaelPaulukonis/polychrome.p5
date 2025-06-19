---
description: AI rules derived by SpecStory from the project AI interaction history
globs: *
---

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
- **Setup/Draw lifecycle**: Initialize in `setup()``, render in `draw()`
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
- **Jest**: Use Jest for Nuxt.js projects due to its well-supported integration and available Nuxt modules.

- When setting up tests, consider these approaches, accounting for the Nuxt 2 project:

  - **Vitest (Recommended)**: A faster and more modern alternative with better ES modules support and fewer compatibility issues with newer Node.js versions. Configure as follows:
    - Install dependencies:
      ```bash
      npm install --save-dev vitest @vue/test-utils@1 @vitejs/plugin-vue2 jsdom
      ```
    - Create `vitest.config.js`:
      ````javascript
      import { defineConfig } from 'vitest/config'
      import vue from '@vitejs/plugin-vue2'
      import { resolve } from 'path'

      export default defineConfig({
        plugins: [vue()],
        test: {
          environment: 'jsdom',
          setupFiles: ['./test/setup.js'],
          globals: true
        },
        resolve: {
          alias: {
            '@': resolve(__dirname, '.'),
            '~': resolve(__dirname, '.')
          }
        }
      })
      ````
    - Create `test/setup.js`:
      ````javascript
      import { config } from '@vue/test-utils'
      import { vi } from 'vitest'

      // Mock p5.js for testing
      global.p5 = {
        createCanvas: vi.fn(),
        background: vi.fn(),
        fill: vi.fn(),
        text: vi.fn(),
        colorMode: vi.fn(),
        HSB: 'HSB',
        createGraphics: vi.fn(),
        color: vi.fn(),
        random: vi.fn(),
        width: 800,
        height: 600,
        mouseX: 0,
        mouseY: 0
      }

      // Mock Nuxt context
      config.mocks = {
        $nuxt: {
          context: {}
        }
      }
      ````
      - The test setup file should be named `setup.js` and located in a `test` directory at the project root (`/test/setup.js`).
    - Add a simple test (e.g., `test/polychrome.test.js`):
      ````javascript
      describe('PolychromeText Application', () => {
        test('Vitest setup is working correctly', () => {
          expect(true).toBe(true)
        })

        test('p5.js mocks are properly configured', () => {
          expect(global.p5).toBeDefined()
          expect(global.p5.createCanvas).toBeDefined()
          expect(global.p5.colorMode).toBeDefined()
          expect(global.p5.HSB).toBe('HSB')
        })

        test('can mock basic p5.js canvas operations', () => {
          global.p5.createCanvas(800, 600)
          global.p5.background(0)
          global.p5.colorMode(global.p5.HSB)
          
          expect(global.p5.createCanvas).toHaveBeenCalledWith(800, 600)
          expect(global.p5.background).toHaveBeenCalledWith(0)
          expect(global.p5.colorMode).toHaveBeenCalledWith('HSB')
        })

        test('canvas dimensions are available for testing', () => {
          expect(global.p5.width).toBe(800)
          expect(global.p5.height).toBe(600)
        })

        test('mouse coordinates are mocked', () => {
          expect(typeof global.p5.mouseX).toBe('number')
          expect(typeof global.p5.mouseY).toBe('number')
        })
      })
      ````
    - Update `package.json` scripts:
      ````json
      {
        "scripts": {
          "test": "vitest run",
          "test:watch": "vitest",
          "test:ui": "vitest --ui"
        }
      }
      ````
  - **Jest (Alternative)**: If you prefer Jest, use these specific dependencies and configuration that work better with Nuxt 2:
    ```bash
    npm install --save-dev jest @vue/test-utils@1 vue-jest@3 babel-jest@26 jsdom
    ```
    - Configure `jest.config.js` as follows:
      ````javascript
      module.exports = {
        moduleNameMapper: {
          '^@/(.*)$': '<rootDir>/$1',
          '^~/(.*)$': '<rootDir>/$1'
        },
        moduleFileExtensions: ['js', 'vue', 'json'],
        transform: {
          '^.+\\.js$': 'babel-jest',
          '.*\\.(vue)$': 'vue-jest'
        },
        testEnvironment: 'jsdom',
        collectCoverage: true,
        collectCoverageFrom: [
          '<rootDir>/src/**/*.js',
          '<rootDir>/components/**/*.vue',
          '!<rootDir>/src/sketch.js' // Skip p5.js sketch for now
        ],
        setupFilesAfterEnv: ['<rootDir>/test/setup.js']
      }
      ````
    - Create a test setup file (e.g., `test/setup.js`):
      ````javascript
      import { config } from '@vue/test-utils'

      // Mock p5.js for testing
      global.p5 = {
        createCanvas: jest.fn(),
        background: jest.fn(),
        fill: jest.fn(),
        text: jest.fn(),
        colorMode: jest.fn(),
        HSB: 'HSB'
      }

      // Mock Nuxt context
      config.mocks = {
        $nuxt: {
          context: {}
        }
      }
      ````
    - Add a simple test to verify the setup (e.g., `test/example.test.js`):
      ````javascript
      describe('Test Setup', () => {
        test('Jest is working', () => {
          expect(true).toBe(true)
        })

        test('p5.js mock is available', () => {
          expect(global.p5).toBeDefined()
          expect(global.p5.createCanvas).toBeDefined()
        })
      })
      ````
    - Add a test script to your `package.json`:
      ````json
      {
        "scripts": {
          "test": "jest",
          "test:watch": "jest --watch"
        }
      }
      ````
- You can also run tests in watch mode during development:
  ```sh
  npm test
  ```
- Consider using Node.js v22 LTS for better compatibility with older dependencies, especially if encountering native dependency issues.

## Commit Message Guidelines

All commit messages should adhere to the Conventional Commits specification.
For detailed instructions, please refer to [Conventional Commits 1.0.0](./copilot-commit-message-instructions.md).