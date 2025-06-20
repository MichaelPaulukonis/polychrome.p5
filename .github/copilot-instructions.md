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
      import { config from '@vue/test-utils'

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

### Code Style and Linting Configuration

- **Standard Style and Vitest:** To configure JavaScript Standard Style to work with Vitest globals, use the following approach:
  - Disable built-in JavaScript validation, if desired, using the **javascript.validate.enable** setting:
    ```json
    {
      "javascript.validate.enable": "false"
    }
    ```
  - Configure JavaScript-specific settings:
    ```json
    {
      "[javascript]": "{ \"editor.defaultFormatter\": \"standard.vscode-standard\" }"
    }
    ```
  - Configure Standard Style at the project level by creating a `.eslintrc.json` or adding to your `package.json` to configure Standard Style to recognize Vitest globals.
- **Recommended Extensions:** Install the following extensions for improved Standard Style and Vitest integration:
  - `standard.vscode-standard`: Handles linting with proper configuration.
  - `vitest.explorer`: Provides proper test environment support.

## Development Environment

### Docker Container Connectivity Testing (macOS)

When debugging connectivity to local Docker containers on macOS, these methods are preferred:

- **HTTP/TCP Connection Testing**
  - Test HTTP connectivity:
    ```bash
    curl http://localhost:8080
    ```
  - Test TCP port connectivity:
    ```bash
    nc -zv localhost 8080
    ```
  - Test with telnet:
    ```bash
    telnet localhost:8080
    ```
- **Find Container IP Address**
  - List running containers:
    ```bash
    docker ps
    ```
  - Get container IP (replace CONTAINER_NAME with your container name/ID):
    ```bash
    docker inspect CONTAINER_NAME | grep IPAddress
    ```
  - Ping the container's IP directly (replace with actual container IP):
    ```bash
    ping 172.17.0.2
    ```
- **Docker Network Inspection**
  - List Docker networks:
    ```bash
    docker network ls
    ```
  - Inspect the default bridge network:
    ```bash
    docker network inspect bridge
    ```
- **Alternative Tools**
  - Using HTTPie (if installed):
    ```bash
    http localhost:8080
    ```
  - Using wget:
    ```bash
    wget -qO- http://localhost:8080
    ```
  - The most reliable method is usually `curl` or `nc` since Docker containers are designed to expose services rather than respond to ping requests.

### Testing the container IP directly

If you want to test the container IP without ping, use:

```bash
# Test TCP connection to container IP
nc -zv 172.17.0.4 80

# Test HTTP directly to container IP  
curl http://172.17.0.4:80

# Test with telnet
telnet 172.17.0.4 80
```

Docker containers on macOS don't respond to ICMP ping requests by default, even when HTTP services are working perfectly. This happens because:

1. **Container networking**: Docker's bridge network doesn't route ICMP traffic the same way as TCP traffic
2. **macOS Docker Desktop**: Uses a Linux VM that handles networking differently than native Linux Docker
3. **Firewall/iptables**: The container's network stack may filter ICMP packets

## Commit Message Guidelines

All commit messages should adhere to the Conventional Commits specification.
For detailed instructions, please refer to [Conventional Commits 1.0.0](./copilot-commit-message-instructions.md).

## Refactoring Guidelines

### Canvas Transforms Module
- **Objective**: Extract canvas transformation functions from `sketch.js` into a new module named `canvas-transforms`.
- **Module Design**:
  - Follow the factory function pattern: `createCanvasTransforms(dependencies)` returning an object with transform functions.
  - Use dependency injection: Pass in required dependencies like `layers`, `recordAction`, `globals`, `renderLayers`, `APP_MODES`, etc.
  - Extract core transformation logic (`flipCore`, `mirrorCore`) as pure functions for easy testing.
  - Consider exporting constants like `HORIZONTAL` and `VERTICAL`.
- **Functions to Extract**:
  - `rotateCanvas` - Rotates canvas 90 degrees with dimension swapping.
  - `flip` + `flipCore` - Flips canvas horizontally or vertically.
  - `mirror` + `mirrorCore` - Creates mirrored half-images.
  - `shift` - Shifts pixels with wrapping using ImageData API.
  - `newCorner` - Utility for corner rotation (currently unused but related).
- **File Structure**:
  ```
  src/
    canvas-transforms/
      index.js          # Main factory function and public API
      core-transforms.js # Pure transformation functions (if applicable)
      canvas-transforms.js # Main implementation (if not using core-transforms.js)
  ```
- **Testing**:
  - Ensure `flipCore` and `mirrorCore` are pure functions for isolated testing.
  - Mock dependencies like p5.js, layers, and recording systems using the factory pattern.
- **Integration**:
  - Import the factory function in `sketch.js`.
  - Initialize with required dependencies in `setup()`.
  - Replace existing function calls with the new module's methods.
  - Update the `pct` object exports to use the new module.
- **Considerations**:
  - Module structure: Split into multiple files like `core-transforms.js` for pure functions and `canvas-transforms.js` for the main factory.
  - Prioritize extracting code first, and add comprehensive tests in a follow-up.
  - `adjustGamma` should remain in `color-system.js`.
  - Use the naming convention: `createCanvasTransforms`.
  - Locate `HORIZONTAL`/`VERTICAL` constants exported from the transforms module.
- **Variable Scope**: Ensure variables initialized within the `setup()` function that are used elsewhere in the module (e.g., in the `pct` object assignments) are declared in the module scope, not just within `setup()`. This avoids "ReferenceError: variable is not defined" errors.
- **Order of Operations**: Ensure that variables which are instantiated or initialized in `p5.setup()` are available before they are used. Specifically, if a variable (e.g. `canvasTransforms`) is only instantiated within `p5.setup()`, and is used to populate a module-level object (e.g. `pct`), then move the instantiation of that module-level object into the `p5.setup()` function, after the `canvasTransforms` variable has been instantiated.

## Project Documentation & Context System
- Create overview documents for new modules, similar to `sketch.md` and `color-system.md`. One file per module should be sufficient (e.g., `canvas-transforms.md`).

## Dependencies and Compatibility

- **Node.js Compatibility:**
  - The project should be running on Node.js v22 LTS.
  - Be aware of compatibility issues with `standard-js` in Node.js v22 and later. If encountering errors like `TypeError: def.split is not a function or its return value is not iterable`, consider updating `standard-js` to the latest version.
  - If updating `standard-js` is necessary, reconfigure it to work with Vitest globals.