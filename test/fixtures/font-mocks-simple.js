/**
 * Simplified font test fixtures without vitest dependencies
 */

// Common system fonts for testing detection
export const SYSTEM_FONTS = [
  'Arial',
  'Arial Black',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Monaco'
]

// Custom fonts that should be available in assets/fonts/
export const CUSTOM_FONTS = [
  'ATARCC__',
  'AtariClassic-Regular',
  'BlackCasper',
  'VT323-Regular',
  'enhanced_dot_digital-7',
  'Hellvetica'
]

/**
 * Simple mock DOM setup for font detection testing
 */
export class MockDOMSetup {
  constructor() {
    this.spans = []
    this.body = null
  }

  setup() {
    // Check if we're in a test environment with vi available
    const vi = globalThis.vi || null

    // Mock document.getElementsByTagName
    this.body = {
      appendChild: vi ? vi.fn((element) => {
        this.spans.push(element)
      }) : (element) => {
        this.spans.push(element)
      },
      removeChild: vi ? vi.fn((element) => {
        const index = this.spans.indexOf(element)
        if (index > -1) {
          this.spans.splice(index, 1)
        }
      }) : (element) => {
        const index = this.spans.indexOf(element)
        if (index > -1) {
          this.spans.splice(index, 1)
        }
      }
    }

    global.document = {
      getElementsByTagName: vi ? vi.fn(() => [this.body]) : () => [this.body],
      createElement: vi ? vi.fn(() => ({
        style: {},
        innerHTML: '',
        offsetWidth: 100,
        offsetHeight: 20
      })) : () => ({
        style: {},
        innerHTML: '',
        offsetWidth: 100,
        offsetHeight: 20
      })
    }

    return this
  }

  cleanup() {
    this.spans = []
    delete global.document
  }
}

/**
 * Factory for creating test font parameters
 */
export function createFontParams(overrides = {}) {
  return {
    font: 'Arial',
    fontList: [...SYSTEM_FONTS, ...CUSTOM_FONTS],
    rotation: 0,
    ...overrides
  }
}

/**
 * Factory for creating mock layer objects
 */
export function createMockLayer(overrides = {}) {
  // Check if we're in a test environment with vi available
  const vi = globalThis.vi || null

  const noop = () => { /* noop */ }

  return {
    textFont: vi ? vi.fn() : noop,
    textSize: vi ? vi.fn() : noop,
    textAlign: vi ? vi.fn() : noop,
    push: vi ? vi.fn() : noop,
    pop: vi ? vi.fn() : noop,
    translate: vi ? vi.fn() : noop,
    rotate: vi ? vi.fn() : noop,
    scale: vi ? vi.fn() : noop,
    resetMatrix: vi ? vi.fn() : noop,
    remove: vi ? vi.fn() : noop,
    text: vi ? vi.fn() : noop,
    ...overrides
  }
}
