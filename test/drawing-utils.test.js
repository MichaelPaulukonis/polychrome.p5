/**
 * Tests for drawing utilities
 */

import { describe, it, expect, vi } from 'vitest'
import {
  textGetter,
  setShadows,
  getYoffset,
  hasNextCoord,
  nextCoord,
  getRadius,
  maxUnlessLessThan,
  textSizeCircle,
  trText
} from '@/src/drawing-modes/drawing-utils'

describe('Drawing Utilities', () => {
  describe('textGetter', () => {
    const mockTextManager = {
      getchar: vi.fn(() => 'a'),
      getcharRandom: vi.fn(() => 'b'),
      getWord: vi.fn(() => 'word')
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return sequential function for "sequential" mode', () => {
      const getter = textGetter('sequential', mockTextManager)
      const result = getter()

      expect(result).toBe('a')
      expect(mockTextManager.getchar).toHaveBeenCalledTimes(1)
    })

    it('should return random function for "random" mode', () => {
      const getter = textGetter('random', mockTextManager)
      const result = getter()

      expect(result).toBe('b')
      expect(mockTextManager.getcharRandom).toHaveBeenCalledTimes(1)
    })

    it('should return word function for other modes', () => {
      const getter = textGetter('word', mockTextManager)
      const result = getter()

      expect(result).toBe('word')
      expect(mockTextManager.getWord).toHaveBeenCalledTimes(1)
    })

    it('should be case insensitive', () => {
      const getter = textGetter('SEQUENTIAL', mockTextManager)
      const result = getter()

      expect(result).toBe('a')
      expect(mockTextManager.getchar).toHaveBeenCalledTimes(1)
    })
  })

  describe('setShadows', () => {
    let mockLayer, mockP5

    beforeEach(() => {
      mockLayer = {
        drawingContext: {
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 0,
          shadowColor: 'transparent'
        }
      }
      mockP5 = {
        color: vi.fn((color) => `p5-${color}`)
      }
    })

    it('should set shadow properties when useShadow is true', () => {
      const params = {
        useShadow: true,
        shadowOffsetX: 5,
        shadowOffsetY: 10,
        shadowBlur: 3,
        shadowColor: 'red'
      }

      setShadows(mockLayer, params, mockP5)

      expect(mockLayer.drawingContext.shadowOffsetX).toBe(5)
      expect(mockLayer.drawingContext.shadowOffsetY).toBe(10)
      expect(mockLayer.drawingContext.shadowBlur).toBe(3)
      expect(mockLayer.drawingContext.shadowColor).toBe('red')
    })

    it('should use default shadow values when useShadow is false', () => {
      const params = {
        useShadow: false,
        shadowOffsetX: 5,
        shadowOffsetY: 10,
        shadowBlur: 3,
        shadowColor: 'red'
      }

      setShadows(mockLayer, params, mockP5)

      expect(mockLayer.drawingContext.shadowOffsetX).toBe(0)
      expect(mockLayer.drawingContext.shadowOffsetY).toBe(0)
      expect(mockLayer.drawingContext.shadowBlur).toBe(0)
      expect(mockLayer.drawingContext.shadowColor).toBe('p5-transparent')
      expect(mockP5.color).toHaveBeenCalledWith('transparent')
    })
  })

  describe('getYoffset', () => {
    it('should return textAscent + heightOffset when greater than 2', () => {
      expect(getYoffset(10, 5)).toBe(15)
      expect(getYoffset(5, 0)).toBe(5)
    })

    it('should return 3 when result is 2 or less', () => {
      expect(getYoffset(1, 1)).toBe(3)
      expect(getYoffset(2, 0)).toBe(3)
      expect(getYoffset(0, 2)).toBe(3)
    })
  })

  describe('hasNextCoord', () => {
    it('should return true when coordinates are within bounds', () => {
      const coords = { x: 50, y: 50 }
      const gridSize = { width: 100, height: 100 }
      const yOffset = 10

      expect(hasNextCoord(coords, gridSize, yOffset)).toBe(true)
    })

    it('should return false when x exceeds width', () => {
      const coords = { x: 150, y: 50 }
      const gridSize = { width: 100, height: 100 }
      const yOffset = 10

      expect(hasNextCoord(coords, gridSize, yOffset)).toBe(false)
    })

    it('should return false when y exceeds height (accounting for yOffset)', () => {
      const coords = { x: 50, y: 110 } // Changed to y=110 so 110-10=100, which equals height
      const gridSize = { width: 100, height: 100 }
      const yOffset = 10

      expect(hasNextCoord(coords, gridSize, yOffset)).toBe(false)
    })
  })

  describe('nextCoord', () => {
    it('should advance x coordinate when within width', () => {
      const coords = { x: 10, y: 20 }
      const offsets = { x: 5, y: 15 }
      const gridWidth = 100

      const result = nextCoord(coords, offsets, gridWidth)

      expect(result).toEqual({ x: 15, y: 20 })
    })

    it('should wrap to next line when x would exceed width', () => {
      const coords = { x: 95, y: 20 }
      const offsets = { x: 10, y: 15 }
      const gridWidth = 100

      const result = nextCoord(coords, offsets, gridWidth)

      expect(result).toEqual({ x: 0, y: 35 })
    })

    it('should account for 25% offset buffer when wrapping', () => {
      const coords = { x: 95, y: 20 }
      const offsets = { x: 8, y: 15 } // 95 + 8 + (0.25 * 8) = 105.5, exceeds 100
      const gridWidth = 100

      const result = nextCoord(coords, offsets, gridWidth)

      expect(result).toEqual({ x: 0, y: 35 })
    })
  })

  describe('getRadius', () => {
    it('should return xPos when not inverted', () => {
      const params = { invert: false }
      const width = 100
      const xPos = 30

      expect(getRadius(params, width, xPos)).toBe(30)
    })

    it('should return (width/2 - xPos) when inverted', () => {
      const params = { invert: true }
      const width = 100
      const xPos = 30

      expect(getRadius(params, width, xPos)).toBe(20) // 50 - 30
    })

    it('should return minimum 0.1 when result is too small', () => {
      const params = { invert: false }
      const width = 100
      const xPos = 0.05

      expect(getRadius(params, width, xPos)).toBe(0.1)
    })
  })

  describe('maxUnlessLessThan', () => {
    it('should return original value when greater than minimum', () => {
      expect(maxUnlessLessThan(10, 5)).toBe(10)
      expect(maxUnlessLessThan(5, 5)).toBe(5)
    })

    it('should return minimum when value is less than minimum', () => {
      expect(maxUnlessLessThan(3, 5)).toBe(5)
      expect(maxUnlessLessThan(0, 1)).toBe(1)
    })
  })

  describe('textSizeCircle', () => {
    it('should return xPos/2 when result is >= 1', () => {
      expect(textSizeCircle(10)).toBe(5)
      expect(textSizeCircle(2)).toBe(1)
    })

    it('should return 1 when xPos/2 < 1', () => {
      expect(textSizeCircle(1)).toBe(1)
      expect(textSizeCircle(0.5)).toBe(1)
    })
  })

  describe('trText', () => {
    let mockLayer

    beforeEach(() => {
      mockLayer = {
        translate: vi.fn(),
        rotate: vi.fn(),
        radians: vi.fn((deg) => deg * Math.PI / 180),
        text: vi.fn()
      }
    })

    it('should translate when tx or ty are non-zero', () => {
      const textFn = trText(mockLayer, 45)
      const wrappedFn = textFn(10, 20, 5, 8, 'hello')

      wrappedFn()

      expect(mockLayer.translate).toHaveBeenCalledWith(5, 8)
      expect(mockLayer.rotate).toHaveBeenCalledWith(45 * Math.PI / 180)
      expect(mockLayer.text).toHaveBeenCalledWith('hello', 10, 20)
    })

    it('should not translate when tx and ty are zero', () => {
      const textFn = trText(mockLayer, 45)
      const wrappedFn = textFn(10, 20, 0, 0, 'hello')

      wrappedFn()

      expect(mockLayer.translate).not.toHaveBeenCalled()
      expect(mockLayer.rotate).toHaveBeenCalledWith(45 * Math.PI / 180)
      expect(mockLayer.text).toHaveBeenCalledWith('hello', 10, 20)
    })

    it('should convert rotation from degrees to radians', () => {
      const textFn = trText(mockLayer, 90)
      const wrappedFn = textFn(0, 0, 0, 0, 'test')

      wrappedFn()

      expect(mockLayer.radians).toHaveBeenCalledWith(90)
      expect(mockLayer.rotate).toHaveBeenCalledWith(90 * Math.PI / 180)
    })
  })
})
