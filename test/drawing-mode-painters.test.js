/**
 * Tests for drawing mode painters
 * Focus on parameter handling and integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createGridPainter } from '@/src/drawing-modes/grid-painter'
import { createCirclePainter } from '@/src/drawing-modes/circle-painter'
import { createRowColPainter } from '@/src/drawing-modes/rowcol-painter'

describe('Drawing Mode Painters', () => {
  let mockDependencies, mockLayer, mockTextManager

  beforeEach(() => {
    mockLayer = {
      push: vi.fn(),
      pop: vi.fn(),
      translate: vi.fn(),
      textSize: vi.fn(),
      strokeWeight: vi.fn(),
      strokeJoin: vi.fn(),
      textAlign: vi.fn(),
      textAscent: vi.fn(() => 12),
      textWidth: vi.fn(() => 8),
      textFont: vi.fn(), // Add missing textFont method
      radians: vi.fn(deg => deg * Math.PI / 180),
      cos: vi.fn(Math.cos),
      sin: vi.fn(Math.sin),
      rotate: vi.fn(),
      text: vi.fn(),
      clear: vi.fn(), // Add missing clear method
      CENTER: 'center',
      LEFT: 'left',
      BOTTOM: 'bottom',
      width: 100,
      height: 100,
      drawingContext: { // Add missing drawingContext
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
        shadowColor: 'transparent'
      }
    }

    mockTextManager = {
      getchar: vi.fn(() => 'a'),
      getcharRandom: vi.fn(() => 'b'),
      getWord: vi.fn(() => 'word')
    }

    mockDependencies = {
      layers: {
        drawingLayer: mockLayer,
        p5: {
          textSize: vi.fn(),
          image: vi.fn(),
          color: vi.fn(color => `p5-${color}`)
        }
      },
      colorSystem: {
        setFillMode: vi.fn(),
        setOutlineMode: vi.fn()
      },
      hexStringToColors: vi.fn(),
      p5: {
        color: vi.fn(color => `p5-${color}`)
      }
    }
  })

  describe('Grid Painter', () => {
    it('should handle immutable parameters correctly', () => {
      const gridPainter = createGridPainter(mockDependencies)

      const params = {
        inset: 10,
        invert: false,
        fixedWidth: true,
        useOutline: false,
        useShadow: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'blue' },
        outline: { strokeWeight: 2, strokeJoin: 'round' }
      }

      const originalParams = JSON.parse(JSON.stringify(params))

      const result = gridPainter({
        xPos: 20,
        params,
        width: 200,
        height: 150,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // Verify parameters weren't mutated
      expect(params).toEqual(originalParams)

      // Verify return value documents side effects
      expect(result).toHaveProperty('modifiedParams', null)
      expect(result).toHaveProperty('sideEffects')
      expect(Array.isArray(result.sideEffects)).toBe(true)
    })

    it('should apply inset correctly', () => {
      const gridPainter = createGridPainter(mockDependencies)

      const params = {
        inset: 15,
        invert: false,
        fixedWidth: true,
        useOutline: false,
        useShadow: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'blue' },
        outline: { strokeWeight: 2, strokeJoin: 'round' }
      }

      gridPainter({
        xPos: 20,
        params,
        width: 200,
        height: 150,
        layer: mockLayer,
        textManager: mockTextManager
      })

      expect(mockLayer.translate).toHaveBeenCalledWith(15, 15)
    })

    it('should handle minimum xPos correctly', () => {
      const gridPainter = createGridPainter(mockDependencies)

      const params = {
        inset: 0,
        invert: false,
        fixedWidth: true,
        useOutline: false,
        useShadow: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'blue' },
        outline: { strokeWeight: 2, strokeJoin: 'round' }
      }

      gridPainter({
        xPos: 2, // Below minimum of 5
        params,
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // Should use minimum xPos of 5, so step = 5 + 5 = 10
      expect(mockLayer.textSize).toHaveBeenCalledWith(10)
    })

    it('should configure text alignment based on fixedWidth', () => {
      const gridPainter = createGridPainter(mockDependencies)

      // Test fixed width mode
      const params = {
        inset: 0,
        invert: false,
        fixedWidth: true,
        useOutline: false,
        useShadow: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'blue' },
        outline: { strokeWeight: 2, strokeJoin: 'round' }
      }

      gridPainter({
        xPos: 10,
        params,
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      expect(mockLayer.textAlign).toHaveBeenCalledWith('center', 'center')

      // Reset mocks and test variable width mode
      vi.clearAllMocks()
      params.fixedWidth = false

      gridPainter({
        xPos: 10,
        params,
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      expect(mockLayer.textAlign).toHaveBeenCalledWith('left', 'bottom')
    })
  })

  describe('Circle Painter', () => {
    it('should handle immutable parameters correctly', () => {
      const circlePainter = createCirclePainter(mockDependencies)

      const params = {
        useOutline: true,
        nextCharMode: 'random',
        cumulativeRotation: false,
        rotation: 45,
        invert: false,
        arcOffset: 0,
        fill: { color: 'red' },
        outline: { strokeWeight: 3, strokeJoin: 'miter' }
      }

      const originalParams = JSON.parse(JSON.stringify(params))

      const result = circlePainter({
        xPos: 30,
        yPos: 40,
        params,
        width: 200,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // Verify parameters weren't mutated
      expect(params).toEqual(originalParams)

      // Verify return value
      expect(result).toHaveProperty('modifiedParams', null)
      expect(result).toHaveProperty('sideEffects')
    })

    it('should center layer by default', () => {
      const circlePainter = createCirclePainter(mockDependencies)

      const params = {
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        invert: false,
        fill: { color: 'green' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      circlePainter({
        xPos: 25,
        yPos: 25,
        params,
        width: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      expect(mockLayer.translate).toHaveBeenCalledWith(50, 50) // layer.width/2, layer.height/2
    })

    it('should use custom center when provided', () => {
      const circlePainter = createCirclePainter(mockDependencies)

      const params = {
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        invert: false,
        fill: { color: 'green' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      const customCenter = { x: 75, y: 25 }

      circlePainter({
        xPos: 25,
        yPos: 25,
        params,
        width: 100,
        layer: mockLayer,
        center: customCenter,
        textManager: mockTextManager
      })

      expect(mockLayer.translate).toHaveBeenCalledWith(75, 25)
    })

    it('should use custom text sizer when provided', () => {
      const circlePainter = createCirclePainter(mockDependencies)
      const customSizer = vi.fn(() => 15)

      const params = {
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        invert: false,
        fill: { color: 'green' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      circlePainter({
        xPos: 25,
        yPos: 25,
        params,
        width: 100,
        layer: mockLayer,
        sizer: customSizer,
        textManager: mockTextManager
      })

      expect(customSizer).toHaveBeenCalledWith(25)
      expect(mockLayer.textSize).toHaveBeenCalledWith(15)
    })
  })

  describe('RowCol Painter', () => {
    it('should handle immutable parameters correctly', () => {
      const rowColPainter = createRowColPainter(mockDependencies)

      const params = {
        rows: 3,
        columns: 4,
        useOutline: true,
        nextCharMode: 'word',
        cumulativeRotation: true,
        rotation: 90,
        fill: { color: 'purple' },
        outline: { strokeWeight: 2, strokeJoin: 'bevel' }
      }

      const originalParams = JSON.parse(JSON.stringify(params))

      const result = rowColPainter({
        params,
        width: 120,
        height: 90,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // Verify parameters weren't mutated
      expect(params).toEqual(originalParams)

      // Verify return value
      expect(result).toHaveProperty('modifiedParams', null)
      expect(result).toHaveProperty('sideEffects')
    })

    it('should calculate cell dimensions correctly', () => {
      const rowColPainter = createRowColPainter(mockDependencies)

      const params = {
        rows: 2,
        columns: 3,
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'yellow' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      rowColPainter({
        params,
        width: 120, // Should create cells of 40 width
        height: 80, // Should create cells of 40 height
        layer: mockLayer,
        textManager: mockTextManager
      })

      expect(mockLayer.textAlign).toHaveBeenCalledWith('center', 'center')

      // Should call color system for each cell (2 rows × 3 columns = 6 calls)
      expect(mockDependencies.colorSystem.setFillMode).toHaveBeenCalledTimes(6)
    })

    it('should handle single column space skipping', () => {
      const rowColPainter = createRowColPainter(mockDependencies)

      mockTextManager.getchar
        .mockReturnValueOnce(' ') // First call returns space
        .mockReturnValueOnce('a') // Second call returns character
        .mockReturnValue('b') // Subsequent calls

      const params = {
        rows: 2,
        columns: 1, // Single column should trigger space skipping
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'cyan' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      rowColPainter({
        params,
        width: 50,
        height: 60,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // Should call getchar twice for first cell (space, then 'a')
      expect(mockTextManager.getchar).toHaveBeenCalledTimes(3) // space + a + b
    })
  })

  describe('Integration Tests', () => {
    it('should maintain consistent parameter interface across all painters', () => {
      const gridPainter = createGridPainter(mockDependencies)
      const circlePainter = createCirclePainter(mockDependencies)
      const rowColPainter = createRowColPainter(mockDependencies)

      const baseParams = {
        useOutline: false,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'black' },
        outline: { strokeWeight: 1, strokeJoin: 'round' }
      }

      const gridParams = { ...baseParams, inset: 0, invert: false, fixedWidth: true }
      const circleParams = { ...baseParams, invert: false }
      const rowColParams = { ...baseParams, rows: 2, columns: 2 }

      // All should accept textManager and return consistent format
      const gridResult = gridPainter({
        xPos: 10,
        params: gridParams,
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      vi.clearAllMocks()

      const circleResult = circlePainter({
        xPos: 10,
        yPos: 10,
        params: circleParams,
        width: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      vi.clearAllMocks()

      const rowColResult = rowColPainter({
        params: rowColParams,
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })

      // All should return the same structure
      expect(gridResult).toHaveProperty('modifiedParams')
      expect(gridResult).toHaveProperty('sideEffects')
      expect(circleResult).toHaveProperty('modifiedParams')
      expect(circleResult).toHaveProperty('sideEffects')
      expect(rowColResult).toHaveProperty('modifiedParams')
      expect(rowColResult).toHaveProperty('sideEffects')
    })

    it('should all use colorSystem consistently', () => {
      const gridPainter = createGridPainter(mockDependencies)
      const circlePainter = createCirclePainter(mockDependencies)
      const rowColPainter = createRowColPainter(mockDependencies)

      const params = {
        useOutline: true,
        nextCharMode: 'sequential',
        cumulativeRotation: false,
        rotation: 0,
        fill: { color: 'red' },
        outline: { strokeWeight: 2, strokeJoin: 'round' }
      }

      // Each painter should call colorSystem methods
      gridPainter({
        xPos: 10,
        params: { ...params, inset: 0, invert: false, fixedWidth: true },
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })
      expect(mockDependencies.colorSystem.setFillMode).toHaveBeenCalled()
      expect(mockDependencies.colorSystem.setOutlineMode).toHaveBeenCalled()

      vi.clearAllMocks()

      circlePainter({
        xPos: 10,
        yPos: 10,
        params: { ...params, invert: false },
        width: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })
      expect(mockDependencies.colorSystem.setFillMode).toHaveBeenCalled()
      expect(mockDependencies.colorSystem.setOutlineMode).toHaveBeenCalled()

      vi.clearAllMocks()

      rowColPainter({
        params: { ...params, rows: 1, columns: 1 },
        width: 100,
        height: 100,
        layer: mockLayer,
        textManager: mockTextManager
      })
      expect(mockDependencies.colorSystem.setFillMode).toHaveBeenCalled()
      expect(mockDependencies.colorSystem.setOutlineMode).toHaveBeenCalled()
    })
  })
})
