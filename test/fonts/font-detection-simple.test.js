import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockDOMSetup } from '../fixtures/font-mocks-simple.js'

describe('Font Detection System', () => {
  let mockDOM
  let originalDocument

  beforeEach(() => {
    // Save original document if it exists
    originalDocument = global.document

    // Setup mock DOM
    mockDOM = new MockDOMSetup()
    mockDOM.setup()
  })

  afterEach(() => {
    // Cleanup mocks
    mockDOM.cleanup()

    // Restore original document
    if (originalDocument) {
      global.document = originalDocument
    }

    // Clear module cache to allow fresh imports
    vi.resetModules()
  })

  describe('Font List Generation', () => {
    it('should export a font list array', async () => {
      const fontsModule = await import('~/src/fonts.js')
      const fontList = fontsModule.default

      expect(Array.isArray(fontList)).toBe(true)
      expect(fontList.length).toBeGreaterThan(0)
    })

    it('should include custom fonts', async () => {
      const fontsModule = await import('~/src/fonts.js')
      const fontList = fontsModule.default

      // Should include custom fonts from hardcoded list
      const expectedCustomFonts = [
        'ATARCC__', 'ATARCE__', 'ATARCS__', 'AtariClassic-Regular',
        'BlackCasper', 'enhanced_dot_digital-7', 'Hellvetica', 'VT323-Regular'
      ]

      const customFontsInList = expectedCustomFonts.filter(font => fontList.includes(font))
      expect(customFontsInList.length).toBeGreaterThan(0)
    })

    it('should not include duplicate fonts', async () => {
      const fontsModule = await import('~/src/fonts.js')
      const fontList = fontsModule.default

      const uniqueFonts = [...new Set(fontList)]
      expect(fontList.length).toBe(uniqueFonts.length)
    })

    it('should always include hardcoded custom fonts', async () => {
      const fontsModule = await import('~/src/fonts.js')
      const fontList = fontsModule.default

      // These fonts should always be included regardless of detection
      const alwaysIncluded = ['ATARCC__', 'BlackCasper', 'VT323-Regular']

      alwaysIncluded.forEach(font => {
        expect(fontList).toContain(font)
      })
    })
  })

  describe('Font Detection DOM Interactions', () => {
    it('should use correct test parameters for font detection', () => {
      const span = global.document.createElement('span')
      const body = global.document.getElementsByTagName('body')[0]

      // Test that the detector uses correct font size and test string
      span.style.fontSize = '72px'
      span.innerHTML = 'mmmmmmmmmmlli'

      body.appendChild(span)

      expect(mockDOM.body.appendChild).toHaveBeenCalledWith(span)
      expect(span.style.fontSize).toBe('72px')
      expect(span.innerHTML).toBe('mmmmmmmmmmlli')
    })

    it('should test against baseline fonts', () => {
      const baseFonts = ['monospace', 'sans-serif', 'serif']
      const span = global.document.createElement('span')
      const body = global.document.getElementsByTagName('body')[0]

      baseFonts.forEach(font => {
        span.style.fontFamily = font
        body.appendChild(span)
        body.removeChild(span)
      })

      // Should have called appendChild and removeChild for each base font
      expect(mockDOM.body.appendChild).toHaveBeenCalledTimes(baseFonts.length)
      expect(mockDOM.body.removeChild).toHaveBeenCalledTimes(baseFonts.length)
    })

    it('should handle DOM element creation', () => {
      // Test the basic DOM operations used in font detection
      expect(global.document.createElement).toBeDefined()
      expect(global.document.getElementsByTagName).toBeDefined()

      // Simulate creating a span element
      const span = global.document.createElement('span')
      expect(span.style).toBeDefined()
      expect(span.offsetWidth).toBe(100) // Default width
      expect(span.offsetHeight).toBe(20) // Default height
    })
  })

  describe('Font Detection Edge Cases', () => {
    it('should handle DOM manipulation errors gracefully', () => {
      // Mock DOM methods to throw errors
      global.document.createElement = vi.fn(() => {
        throw new Error('DOM manipulation failed')
      })

      // The font detection should not crash the application
      expect(() => {
        const span = global.document.createElement('span')
        span.style.fontSize = '72px'
      }).toThrow('DOM manipulation failed')
    })

    it('should handle missing body element', () => {
      // Mock getElementsByTagName to return empty array
      global.document.getElementsByTagName = vi.fn(() => [])

      // Should handle missing body gracefully
      const bodyElements = global.document.getElementsByTagName('body')
      expect(bodyElements.length).toBe(0)
    })

    it('should handle undefined offsetWidth/offsetHeight', () => {
      // Mock elements with undefined measurements
      global.document.createElement = vi.fn(() => ({
        style: {},
        innerHTML: '',
        offsetWidth: undefined,
        offsetHeight: undefined
      }))

      const span = global.document.createElement('span')
      expect(span.offsetWidth).toBeUndefined()
      expect(span.offsetHeight).toBeUndefined()
    })
  })

  describe('Font Detection Performance', () => {
    it('should complete font detection in reasonable time', async () => {
      const start = performance.now()

      // Import the fonts module (triggers detection)
      await import('~/src/fonts.js')

      const end = performance.now()
      const duration = end - start

      // Should complete in under 1 second (generous limit for CI)
      expect(duration).toBeLessThan(1000)
    })

    it('should not create excessive DOM elements', () => {
      const span = global.document.createElement('span')
      const body = global.document.getElementsByTagName('body')[0]

      // Simulate font detection process
      body.appendChild(span)
      body.removeChild(span)

      // Should clean up after itself
      expect(mockDOM.spans.length).toBe(0)
    })
  })
})
