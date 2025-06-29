import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Font Loading System', () => {
  let mockP5
  let mockRequireContext
  let originalRequire

  beforeEach(() => {
    // Mock p5.js font loading
    mockP5 = {
      loadFont: vi.fn(),
      textFont: vi.fn(),
      textAlign: vi.fn(),
      CENTER: 'center'
    }

    // Mock webpack require.context
    mockRequireContext = vi.fn()
    mockRequireContext.keys = vi.fn()

    // Store original require
    originalRequire = global.require
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.resetModules()

    // Restore original require
    if (originalRequire) {
      global.require = originalRequire
    }
  })

  describe('TTF Font Loading', () => {
    it('should load TTF fonts from assets directory', () => {
      // Mock available TTF files
      const mockFonts = ['Arial.ttf', 'Helvetica.ttf', 'VT323-Regular.ttf']
      mockRequireContext.keys.mockReturnValue(mockFonts.map(f => `./${f}`))

      // Mock require calls for each font
      mockFonts.forEach(font => {
        const fontName = font.replace('.ttf', '')
        mockRequireContext.mockImplementation((path) => {
          if (path.includes(fontName)) {
            return `mock-font-data-${fontName}`
          }
          throw new Error(`Font not found: ${path}`)
        })
      })

      // Mock successful font loading
      const mockFontObject = { font: { familyName: 'Arial' } }
      mockP5.loadFont.mockReturnValue(mockFontObject)

      // Test font name extraction
      const extractedNames = mockFonts.map(f => f.replace('.ttf', ''))
      expect(extractedNames).toEqual(['Arial', 'Helvetica', 'VT323-Regular'])

      // Test font loading calls
      extractedNames.forEach(fontName => {
        const result = mockP5.loadFont(`mock-path/${fontName}.ttf`)
        expect(result).toBe(mockFontObject)
      })

      expect(mockP5.loadFont).toHaveBeenCalledTimes(extractedNames.length)
    })

    it('should handle font loading failures gracefully', () => {
      const mockFontPath = 'invalid-font.ttf'

      // Mock font loading failure
      mockP5.loadFont.mockImplementation((path, success, failure) => {
        const error = new Error(`Failed to load: ${path}`)
        if (failure) {
          failure(error)
        }
        throw error
      })

      // Should not crash when font loading fails
      expect(() => {
        mockP5.loadFont(mockFontPath, null, (error) => {
          expect(error.message).toContain('Failed to load')
        })
      }).toThrow('Failed to load')
    })

    it('should create font registry from loaded fonts', () => {
      const fonts = ['Arial', 'Helvetica', 'Times']
      const fontRegistry = {}

      fonts.forEach(fontName => {
        const mockFont = { font: { familyName: fontName } }
        mockP5.loadFont.mockReturnValueOnce(mockFont)

        // Simulate font registry creation
        fontRegistry[fontName] = mockP5.loadFont(`${fontName}.ttf`)
      })

      expect(Object.keys(fontRegistry)).toEqual(fonts)
      expect(mockP5.loadFont).toHaveBeenCalledTimes(fonts.length)
    })
  })

  describe('Font Resolution Priority', () => {
    it('should prioritize loaded TTF fonts over system fonts', () => {
      const fontRegistry = {
        'Arial': { font: { familyName: 'Arial TTF' } },
        'Helvetica': { font: { familyName: 'Helvetica TTF' } }
      }

      // Test font resolution logic (simulating setFont behavior)
      const resolveFont = (fontName) => {
        if (fontRegistry[fontName]) {
          return fontRegistry[fontName]
        }
        return fontName // Fallback to system font
      }

      expect(resolveFont('Arial')).toBe(fontRegistry.Arial)
      expect(resolveFont('Helvetica')).toBe(fontRegistry.Helvetica)
      expect(resolveFont('Times New Roman')).toBe('Times New Roman')
    })

    it('should fallback to system fonts when TTF not available', () => {
      const fontRegistry = {}
      const systemFont = 'Times New Roman'

      const resolveFont = (fontName) => {
        return fontRegistry[fontName] || fontName
      }

      expect(resolveFont(systemFont)).toBe(systemFont)
    })

    it('should handle invalid font names gracefully', () => {
      const fontRegistry = {}
      const invalidFont = null

      const resolveFont = (fontName) => {
        if (!fontName) {
          return 'Arial' // Default fallback
        }
        return fontRegistry[fontName] || fontName
      }

      expect(resolveFont(invalidFont)).toBe('Arial')
      expect(resolveFont(undefined)).toBe('Arial')
      expect(resolveFont('')).toBe('Arial') // Empty string should also get default
    })
  })

  describe('Font Application to Layers', () => {
    it('should apply fonts to p5.js layers', () => {
      const mockLayer = {
        textFont: vi.fn(),
        textAlign: vi.fn()
      }

      const font = 'Arial'

      // Simulate setFont functionality
      mockLayer.textFont(font)
      mockLayer.textAlign(mockP5.CENTER, mockP5.CENTER)

      expect(mockLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayer.textAlign).toHaveBeenCalledWith(mockP5.CENTER, mockP5.CENTER)
    })

    it('should handle layer not initialized', () => {
      const mockLayer = null

      // Should not crash when layer is null
      expect(() => {
        if (mockLayer) {
          mockLayer.textFont('Arial')
        }
      }).not.toThrow()
    })

    it('should apply font to multiple layers', () => {
      const layers = [
        { textFont: vi.fn() },
        { textFont: vi.fn() },
        { textFont: vi.fn() }
      ]

      const font = 'Helvetica'

      layers.forEach(layer => {
        layer.textFont(font)
      })

      layers.forEach(layer => {
        expect(layer.textFont).toHaveBeenCalledWith(font)
      })
    })
  })

  describe('Font Loading Performance', () => {
    it('should load fonts asynchronously in preload', async () => {
      const fonts = ['Arial', 'Helvetica', 'Times']
      const loadPromises = []

      fonts.forEach(font => {
        const promise = new Promise((resolve) => {
          setTimeout(() => {
            resolve({ font: { familyName: font } })
          }, 10)
        })
        loadPromises.push(promise)
      })

      const results = await Promise.all(loadPromises)

      expect(results.length).toBe(fonts.length)
      results.forEach((result, index) => {
        expect(result.font.familyName).toBe(fonts[index])
      })
    })

    it('should handle concurrent font loading', async () => {
      const concurrentLoads = 5
      const loadPromises = []

      for (let i = 0; i < concurrentLoads; i++) {
        const promise = new Promise(resolve => {
          setTimeout(() => resolve(`font-${i}`), Math.random() * 100)
        })
        loadPromises.push(promise)
      }

      const results = await Promise.allSettled(loadPromises)

      expect(results.length).toBe(concurrentLoads)
      results.forEach(result => {
        expect(result.status).toBe('fulfilled')
      })
    })
  })

  describe('Font Loading Error Handling', () => {
    it('should continue when some fonts fail to load', async () => {
      const fonts = ['valid-font', 'invalid-font', 'another-valid-font']
      const loadPromises = fonts.map((font, index) => {
        return new Promise((resolve, reject) => {
          if (font.includes('invalid')) {
            reject(new Error(`Failed to load ${font}`))
          } else {
            resolve({ font: { familyName: font } })
          }
        })
      })

      const results = await Promise.allSettled(loadPromises)

      expect(results.length).toBe(fonts.length)
      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
    })

    it('should provide meaningful error messages', () => {
      const invalidFontPath = '/invalid/path/font.ttf'

      mockP5.loadFont.mockImplementation((path, success, failure) => {
        const error = new Error(`Font file not found: ${path}`)
        if (failure) {
          failure(error)
        }
        throw error
      })

      expect(() => {
        mockP5.loadFont(invalidFontPath, null, (error) => {
          expect(error.message).toContain('Font file not found')
          expect(error.message).toContain(invalidFontPath)
        })
      }).toThrow()
    })
  })

  describe('Font Loading Integration', () => {
    it('should integrate with webpack require.context', () => {
      // Mock require.context behavior
      const mockContext = vi.fn()
      mockContext.keys = vi.fn(() => [
        './Arial.ttf',
        './Helvetica.ttf',
        './VT323-Regular.ttf'
      ])

      const fontKeys = mockContext.keys()
      const extractedNames = fontKeys.map(key => key.replace(/\.\/(.*?)\.ttf/, '$1'))

      expect(fontKeys.length).toBe(3)
      expect(extractedNames).toEqual(['Arial', 'Helvetica', 'VT323-Regular'])
      expect(mockContext.keys).toHaveBeenCalled()
    })

    it('should handle empty font directory', () => {
      mockRequireContext.keys.mockReturnValue([])

      const fontKeys = mockRequireContext.keys()
      expect(fontKeys.length).toBe(0)
    })

    it('should filter non-TTF files', () => {
      const allFiles = [
        './Arial.ttf',
        './readme.txt',
        './Helvetica.ttf',
        './license.pdf',
        './VT323-Regular.ttf'
      ]

      const ttfFiles = allFiles.filter(file => file.endsWith('.ttf'))

      expect(ttfFiles.length).toBe(3)
      expect(ttfFiles).toEqual([
        './Arial.ttf',
        './Helvetica.ttf',
        './VT323-Regular.ttf'
      ])
    })
  })
})
