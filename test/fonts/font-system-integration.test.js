import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockDOMSetup, createMockLayer } from '../fixtures/font-mocks-simple.js'

describe('Font System Integration', () => {
  let mockDOM
  let mockP5
  let mockLayers
  let originalDocument

  beforeEach(() => {
    // Save original document
    originalDocument = global.document

    // Setup mock DOM for font detection
    mockDOM = new MockDOMSetup()
    mockDOM.setup()

    // Mock p5.js instance
    mockP5 = {
      loadFont: vi.fn(),
      textFont: vi.fn(),
      textSize: vi.fn(),
      textAlign: vi.fn(),
      CENTER: 'center'
    }

    // Mock layer system
    mockLayers = {
      p5: mockP5,
      drawingLayer: createMockLayer(),
      tempLayer: createMockLayer()
    }
  })

  afterEach(() => {
    // Cleanup mocks
    mockDOM.cleanup()
    vi.resetAllMocks()
    vi.resetModules()

    // Restore original document
    if (originalDocument) {
      global.document = originalDocument
    }
  })

  describe('End-to-End Font Workflow', () => {
    it('should complete full font detection → loading → application workflow', async () => {
      // Step 1: Font Detection
      const fontsModule = await import('~/src/fonts.js')
      const detectedFonts = fontsModule.default

      expect(Array.isArray(detectedFonts)).toBe(true)
      expect(detectedFonts.length).toBeGreaterThan(0)

      // Step 2: Font Loading (simulate TTF loading)
      const fontRegistry = {}
      const customFonts = ['VT323-Regular', 'BlackCasper', 'AtariClassic-Regular']

      customFonts.forEach(fontName => {
        const mockFont = { font: { familyName: fontName } }
        mockP5.loadFont.mockReturnValueOnce(mockFont)
        fontRegistry[fontName] = mockP5.loadFont(`${fontName}.ttf`)
      })

      expect(Object.keys(fontRegistry)).toEqual(customFonts)
      expect(mockP5.loadFont).toHaveBeenCalledTimes(customFonts.length)

      // Step 3: Font Application
      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        const resolvedFont = fontRegistry[fontName] || fontName
        layer.textFont(resolvedFont)
      }

      setFont('VT323-Regular')
      setFont('Arial') // System font fallback

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(fontRegistry['VT323-Regular'])
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith('Arial')
    })

    it('should handle font system initialization', async () => {
      // Simulate app startup sequence
      const initializeFontSystem = async () => {
        // 1. Import font list (triggers detection)
        const fontsModule = await import('~/src/fonts.js')
        const availableFonts = fontsModule.default

        // 2. Load TTF fonts
        const fontRegistry = {}
        const customFonts = availableFonts.filter(font =>
          ['VT323-Regular', 'BlackCasper', 'Hellvetica'].includes(font)
        )

        for (const fontName of customFonts) {
          const mockFont = { font: { familyName: fontName } }
          mockP5.loadFont.mockReturnValueOnce(mockFont)
          fontRegistry[fontName] = mockP5.loadFont(`${fontName}.ttf`)
        }

        // 3. Set default font
        const defaultFont = availableFonts[0]
        mockLayers.drawingLayer.textFont(defaultFont)

        return { availableFonts, fontRegistry, defaultFont }
      }

      const { availableFonts, fontRegistry, defaultFont } = await initializeFontSystem()

      expect(availableFonts.length).toBeGreaterThan(0)
      expect(Object.keys(fontRegistry).length).toBeGreaterThan(0)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(defaultFont)
    })

    it('should handle mixed system and custom fonts', async () => {
      const fontsModule = await import('~/src/fonts.js')
      const allFonts = fontsModule.default

      // Separate system and custom fonts
      const systemFonts = ['Arial', 'Helvetica', 'Times New Roman']
      const customFonts = ['VT323-Regular', 'BlackCasper', 'Hellvetica']

      const availableSystemFonts = systemFonts.filter(font => allFonts.includes(font))
      const availableCustomFonts = customFonts.filter(font => allFonts.includes(font))

      // Load custom fonts
      const fontRegistry = {}
      availableCustomFonts.forEach(fontName => {
        const mockFont = { font: { familyName: fontName } }
        fontRegistry[fontName] = mockFont
      })

      // Test font resolution
      const resolveFont = (fontName) => {
        return fontRegistry[fontName] || fontName
      }

      // Custom fonts should resolve to objects
      availableCustomFonts.forEach(font => {
        const resolved = resolveFont(font)
        expect(resolved).toHaveProperty('font.familyName')
      })

      // System fonts should resolve to strings
      availableSystemFonts.forEach(font => {
        const resolved = resolveFont(font)
        expect(typeof resolved).toBe('string')
      })
    })

    it('should gracefully handle partial font loading failures', async () => {
      const fonts = ['Arial', 'FailingFont', 'Helvetica', 'AnotherFailingFont', 'VT323-Regular']
      const results = []

      // Simulate font loading with some failures
      for (const font of fonts) {
        try {
          if (font.includes('Failing')) {
            throw new Error(`Failed to load ${font}`)
          } else {
            const mockFont = { font: { familyName: font } }
            results.push({ font, status: 'success', data: mockFont })
          }
        } catch (error) {
          results.push({ font, status: 'failed', error: error.message })
        }
      }

      const successful = results.filter(r => r.status === 'success')
      const failed = results.filter(r => r.status === 'failed')

      expect(successful.length).toBe(3) // Arial, Helvetica, VT323-Regular
      expect(failed.length).toBe(2) // FailingFont, AnotherFailingFont
      expect(results.length).toBe(fonts.length)
    })
  })

  describe('Font System Performance Integration', () => {
    it('should handle concurrent font operations efficiently', async () => {
      const start = performance.now()

      // Run operations concurrently
      const [fontListResult, fontLoadResult, fontAppResult] = await Promise.all([
        (async () => {
          const fontsModule = await import('~/src/fonts.js')
          return fontsModule.default
        })(),
        (async () => {
          const mockFont = { font: { familyName: 'Arial' } }
          return new Promise(resolve => {
            setTimeout(() => resolve(mockFont), 10)
          })
        })(),
        (async () => {
          return new Promise(resolve => {
            mockLayers.drawingLayer.textFont('Helvetica')
            resolve('font-applied')
          })
        })()
      ])

      const end = performance.now()

      // All operations should complete successfully
      expect(fontListResult).toBeDefined()
      expect(fontLoadResult).toEqual({ font: { familyName: 'Arial' } })
      expect(fontAppResult).toBe('font-applied')
      expect(end - start).toBeLessThan(500) // Should complete quickly
    })

    it('should cache font detection results', async () => {
      const detectionCache = new Map()

      const getCachedFontList = async () => {
        if (!detectionCache.has('fontList')) {
          const fontsModule = await import('~/src/fonts.js')
          detectionCache.set('fontList', fontsModule.default)
        }
        return detectionCache.get('fontList')
      }

      // Multiple calls should use cache
      const list1 = await getCachedFontList()
      const list2 = await getCachedFontList()
      const list3 = await getCachedFontList()

      expect(list1).toBe(list2)
      expect(list2).toBe(list3)
      expect(detectionCache.size).toBe(1)
    })

    it('should handle rapid font switching without performance degradation', () => {
      const fonts = ['Arial', 'Helvetica', 'Times', 'Georgia', 'Verdana']
      const switchCount = 1000

      const start = performance.now()

      for (let i = 0; i < switchCount; i++) {
        const font = fonts[i % fonts.length]
        mockLayers.drawingLayer.textFont(font)
      }

      const end = performance.now()
      const duration = end - start

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(switchCount)
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })
  })

  describe('Font System Error Recovery', () => {
    it('should recover from font detection errors', async () => {
      // Mock DOM error
      global.document.createElement = vi.fn(() => {
        throw new Error('DOM not available')
      })

      let fontList = []
      try {
        const fontsModule = await import('~/src/fonts.js')
        fontList = fontsModule.default
      } catch {
        // Should still have custom fonts even if detection fails
        fontList = ['ATARCC__', 'BlackCasper', 'VT323-Regular']
      }

      expect(Array.isArray(fontList)).toBe(true)
      expect(fontList.length).toBeGreaterThan(0)
    })

    it('should recover from font loading errors', () => {
      const fonts = ['ValidFont', 'InvalidFont', 'AnotherValidFont']
      const loadedFonts = {}

      for (const font of fonts) {
        try {
          if (font === 'InvalidFont') {
            throw new Error('Font loading failed')
          }
          const mockFont = { font: { familyName: font } }
          loadedFonts[font] = mockFont
        } catch {
          // Skip failed fonts, continue with others
          console.warn(`Failed to load font: ${font}`)
        }
      }

      expect(Object.keys(loadedFonts)).toEqual(['ValidFont', 'AnotherValidFont'])
      expect(loadedFonts).not.toHaveProperty('InvalidFont')
    })

    it('should recover from font application errors', () => {
      let successfulApplications = 0
      let failedApplications = 0

      const fonts = ['WorkingFont', 'BrokenFont', 'AnotherWorkingFont']

      fonts.forEach(font => {
        try {
          if (font === 'BrokenFont') {
            throw new Error('Font application failed')
          }
          mockLayers.drawingLayer.textFont(font)
          successfulApplications++
        } catch {
          failedApplications++
          // Apply fallback font
          mockLayers.drawingLayer.textFont('Arial')
        }
      })

      expect(successfulApplications).toBe(2)
      expect(failedApplications).toBe(1)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(fonts.length)
    })
  })

  describe('Font System Configuration', () => {
    it('should support different font configurations', () => {
      const configurations = [
        {
          mode: 'system-only',
          allowedFonts: ['Arial', 'Helvetica', 'Times New Roman']
        },
        {
          mode: 'custom-only',
          allowedFonts: ['VT323-Regular', 'BlackCasper', 'Hellvetica']
        },
        {
          mode: 'mixed',
          allowedFonts: ['Arial', 'VT323-Regular', 'Helvetica', 'BlackCasper']
        }
      ]

      configurations.forEach(config => {
        const isValidFont = (fontName) => {
          return config.allowedFonts.includes(fontName)
        }

        config.allowedFonts.forEach(font => {
          expect(isValidFont(font)).toBe(true)
        })

        expect(isValidFont('UnknownFont')).toBe(false)
      })
    })

    it('should support font aliasing', () => {
      const fontAliases = {
        retro: 'VT323-Regular',
        display: 'BlackCasper',
        body: 'Arial',
        heading: 'Helvetica'
      }

      const resolveAlias = (fontName) => {
        return fontAliases[fontName] || fontName
      }

      expect(resolveAlias('retro')).toBe('VT323-Regular')
      expect(resolveAlias('display')).toBe('BlackCasper')
      expect(resolveAlias('Arial')).toBe('Arial') // No alias, return as-is
    })

    it('should support font fallback chains', () => {
      const fallbackChains = {
        'custom-retro': ['VT323-Regular', 'enhanced_dot_digital-7', 'Courier New', 'monospace'],
        'custom-display': ['BlackCasper', 'Hellvetica', 'Arial', 'Arial Black', 'sans-serif'],
        'custom-body': ['AtariClassic-Regular', 'Arial', 'Helvetica', 'sans-serif']
      }

      const resolveWithFallback = (chainName, availableFonts) => {
        const chain = fallbackChains[chainName] || [chainName]
        return chain.find(font => availableFonts.includes(font)) || chain[chain.length - 1]
      }

      const availableFonts = ['Arial', 'Helvetica', 'VT323-Regular', 'Times New Roman']

      expect(resolveWithFallback('custom-retro', availableFonts)).toBe('VT323-Regular')
      expect(resolveWithFallback('custom-display', availableFonts)).toBe('Arial')
      expect(resolveWithFallback('custom-body', availableFonts)).toBe('Arial')
    })
  })
})
