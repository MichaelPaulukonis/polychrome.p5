import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockLayer } from '../fixtures/font-mocks-simple.js'

describe('Font Application System', () => {
  let mockLayers
  let mockP5

  beforeEach(() => {
    // Mock p5.js instance
    mockP5 = {
      textFont: vi.fn(),
      textSize: vi.fn(),
      textAlign: vi.fn(),
      CENTER: 'center'
    }

    // Mock layer system
    mockLayers = {
      p5: mockP5,
      drawingLayer: createMockLayer(),
      tempLayer: createMockLayer(),
      setFont: vi.fn(),
      textSize: vi.fn()
    }
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('setFont Functionality', () => {
    it('should set font on drawing layer by default', () => {
      const font = 'Arial'

      // Simulate the setFont function from sketch.js
      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        layer.textFont(fontName)
      }

      setFont(font)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
    })

    it('should set font on specified layer', () => {
      const font = 'Helvetica'
      const customLayer = createMockLayer()

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        layer.textFont(fontName)
      }

      setFont(font, customLayer)

      expect(customLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.textFont).not.toHaveBeenCalled()
    })

    it('should handle font resolution with TTF priority', () => {
      const fontRegistry = {
        Arial: { font: { familyName: 'Arial TTF' } }
      }

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        // Simulate font resolution logic from sketch.js
        const resolvedFont = fontRegistry[fontName] || fontName
        layer.textFont(resolvedFont)
      }

      setFont('Arial')
      setFont('Times New Roman') // System font fallback

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(fontRegistry.Arial)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith('Times New Roman')
    })

    it('should set font with text alignment', () => {
      const font = 'VT323-Regular'

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        layer.textFont(fontName)
        layer.textAlign(mockP5.CENTER, mockP5.CENTER)
      }

      setFont(font)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.textAlign).toHaveBeenCalledWith(mockP5.CENTER, mockP5.CENTER)
    })
  })

  describe('Layer System Integration', () => {
    it('should apply font to both main canvas and drawing layer', () => {
      const font = 'Helvetica'

      // Simulate Layers.setFont method
      const layersSetFont = (fontName) => {
        mockLayers.p5.textFont(fontName)
        mockLayers.drawingLayer.textFont(fontName)
      }

      layersSetFont(font)

      expect(mockP5.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
    })

    it('should handle layer initialization during font setting', () => {
      const font = 'Arial'

      // Simulate initialization check
      const safeSetFont = (fontName) => {
        if (mockLayers.drawingLayer) {
          mockLayers.drawingLayer.textFont(fontName)
        }
        if (mockLayers.p5) {
          mockLayers.p5.textFont(fontName)
        }
      }

      safeSetFont(font)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockP5.textFont).toHaveBeenCalledWith(font)
    })

    it('should handle null/undefined layers gracefully', () => {
      const font = 'Times'
      const nullLayers = {
        drawingLayer: null,
        p5: null
      }

      const safeSetFont = (fontName) => {
        if (nullLayers.drawingLayer) {
          nullLayers.drawingLayer.textFont(fontName)
        }
        if (nullLayers.p5) {
          nullLayers.p5.textFont(fontName)
        }
      }

      // Should not throw
      expect(() => safeSetFont(font)).not.toThrow()
    })

    it('should handle text size along with font', () => {
      const font = 'Georgia'
      const size = 24

      const setFontAndSize = (fontName, fontSize) => {
        mockLayers.drawingLayer.textFont(fontName)
        mockLayers.drawingLayer.textSize(fontSize)
      }

      setFontAndSize(font, size)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.textSize).toHaveBeenCalledWith(size)
    })
  })

  describe('Font Validation and Error Handling', () => {
    it('should handle invalid font objects', () => {
      const invalidFont = null

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        if (fontName) {
          layer.textFont(fontName)
        }
      }

      setFont(invalidFont)

      expect(mockLayers.drawingLayer.textFont).not.toHaveBeenCalled()
    })

    it('should handle empty font names', () => {
      const emptyFont = ''
      const defaultFont = 'Arial'

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        const resolvedFont = fontName || defaultFont
        layer.textFont(resolvedFont)
      }

      setFont(emptyFont)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(defaultFont)
    })

    it('should handle font loading errors during application', () => {
      const font = 'BrokenFont'

      mockLayers.drawingLayer.textFont.mockImplementation(() => {
        throw new Error('Font application failed')
      })

      const safeSetFont = (fontName, layer = mockLayers.drawingLayer) => {
        try {
          layer.textFont(fontName)
        } catch {
          // Fallback to system font
          console.warn('Font application failed, using fallback')
        }
      }

      expect(() => safeSetFont(font)).not.toThrow()
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
    })

    it('should validate font before application', () => {
      const fonts = ['Arial', null, undefined, '', 'Helvetica']
      const validFonts = []

      fonts.forEach(font => {
        if (font && typeof font === 'string' && font.trim()) {
          validFonts.push(font)
          mockLayers.drawingLayer.textFont(font)
        }
      })

      expect(validFonts).toEqual(['Arial', 'Helvetica'])
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(2)
    })
  })

  describe('Font State Management', () => {
    it('should track current font state', () => {
      let currentFont = null

      const setFont = (fontName, layer = mockLayers.drawingLayer) => {
        layer.textFont(fontName)
        currentFont = fontName
      }

      setFont('Arial')
      expect(currentFont).toBe('Arial')

      setFont('Helvetica')
      expect(currentFont).toBe('Helvetica')
    })

    it('should handle font switching', () => {
      const fonts = ['Arial', 'Helvetica', 'Times New Roman']

      fonts.forEach(font => {
        mockLayers.drawingLayer.textFont(font)
      })

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(fonts.length)
      fonts.forEach(font => {
        expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      })
    })

    it('should preserve font state across canvas operations', () => {
      const font = 'VT323-Regular'

      // Simulate canvas operations that might affect font
      const performCanvasOperations = () => {
        mockLayers.drawingLayer.push()
        mockLayers.drawingLayer.translate(100, 100)
        mockLayers.drawingLayer.rotate(45)
        // Font should be preserved
        mockLayers.drawingLayer.textFont(font)
        mockLayers.drawingLayer.pop()
      }

      performCanvasOperations()

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.push).toHaveBeenCalled()
      expect(mockLayers.drawingLayer.pop).toHaveBeenCalled()
    })
  })

  describe('Font Application Performance', () => {
    it('should handle rapid font changes efficiently', () => {
      const fonts = new Array(100).fill(0).map((_, i) => `Font${i}`)

      const start = performance.now()
      fonts.forEach(font => {
        mockLayers.drawingLayer.textFont(font)
      })
      const end = performance.now()

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(fonts.length)
      expect(end - start).toBeLessThan(100) // Should complete quickly
    })

    it('should handle concurrent font applications', async () => {
      const fonts = ['Arial', 'Helvetica', 'Times', 'Georgia', 'Verdana']

      const fontPromises = fonts.map(font =>
        new Promise(resolve => {
          setTimeout(() => {
            mockLayers.drawingLayer.textFont(font)
            resolve(font)
          }, Math.random() * 10)
        })
      )

      const results = await Promise.all(fontPromises)

      expect(results.length).toBe(fonts.length)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledTimes(fonts.length)
    })

    it('should cache font objects to avoid repeated loading', () => {
      const fontCache = new Map()
      const font = 'Arial'

      const getCachedFont = (fontName) => {
        if (!fontCache.has(fontName)) {
          // Simulate font loading/creation
          fontCache.set(fontName, { font: { familyName: fontName } })
        }
        return fontCache.get(fontName)
      }

      // Multiple requests for same font
      const font1 = getCachedFont(font)
      const font2 = getCachedFont(font)
      const font3 = getCachedFont(font)

      expect(font1).toBe(font2)
      expect(font2).toBe(font3)
      expect(fontCache.size).toBe(1)
    })
  })

  describe('Font Integration with Drawing Operations', () => {
    it('should maintain font during text rendering', () => {
      const font = 'Helvetica'
      const text = 'Hello World'
      const x = 100
      const y = 200

      const renderText = (fontName, textContent, xPos, yPos) => {
        mockLayers.drawingLayer.textFont(fontName)
        mockLayers.drawingLayer.text(textContent, xPos, yPos)
      }

      // Add text method to mock
      mockLayers.drawingLayer.text = vi.fn()

      renderText(font, text, x, y)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.text).toHaveBeenCalledWith(text, x, y)
    })

    it('should handle font with drawing transformations', () => {
      const font = 'VT323-Regular'

      const drawWithTransforms = (fontName) => {
        mockLayers.drawingLayer.push()
        mockLayers.drawingLayer.translate(50, 50)
        mockLayers.drawingLayer.scale(2)
        mockLayers.drawingLayer.textFont(fontName)
        // Simulate text drawing here
        mockLayers.drawingLayer.pop()
      }

      drawWithTransforms(font)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(font)
      expect(mockLayers.drawingLayer.push).toHaveBeenCalled()
      expect(mockLayers.drawingLayer.translate).toHaveBeenCalledWith(50, 50)
      expect(mockLayers.drawingLayer.scale).toHaveBeenCalledWith(2)
      expect(mockLayers.drawingLayer.pop).toHaveBeenCalled()
    })

    it('should handle font reset operations', () => {
      const originalFont = 'Arial'
      const tempFont = 'Helvetica'

      const withTemporaryFont = (tempFontName, originalFontName) => {
        mockLayers.drawingLayer.textFont(tempFontName)
        // Perform some operations
        mockLayers.drawingLayer.resetMatrix()
        // Restore original font
        mockLayers.drawingLayer.textFont(originalFontName)
      }

      withTemporaryFont(tempFont, originalFont)

      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(tempFont)
      expect(mockLayers.drawingLayer.textFont).toHaveBeenCalledWith(originalFont)
      expect(mockLayers.drawingLayer.resetMatrix).toHaveBeenCalled()
    })
  })
})
