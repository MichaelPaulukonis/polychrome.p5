/**
 * Tests for core generator functions
 */

import { describe, it, expect, vi } from 'vitest'
import {
  blocGeneratorFixedWidth,
  blocGeneratorTextWidth,
  blocGeneratorCircle
} from '@/src/drawing-modes/core-generators'

describe('Core Generators', () => {
  describe('blocGeneratorFixedWidth', () => {
    it('should generate coordinates for normal grid parameters', () => {
      const gridParams = {
        initY: 0,
        initX: 0,
        condy: y => y < 20,
        condx: x => x < 20,
        changey: y => y + 10,
        changex: x => x + 10
      }
      const nextText = vi.fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b')
        .mockReturnValueOnce('c')
        .mockReturnValueOnce('d')

      const generator = blocGeneratorFixedWidth(gridParams, nextText)
      const results = []

      for (const bloc of generator) {
        results.push(bloc)
      }

      expect(results).toEqual([
        { x: 0, y: 0, text: 'a' },
        { x: 10, y: 0, text: 'b' },
        { x: 0, y: 10, text: 'c' },
        { x: 10, y: 10, text: 'd' }
      ])
      expect(nextText).toHaveBeenCalledTimes(4)
    })

    it('should generate coordinates for inverted grid parameters', () => {
      const gridParams = {
        initY: 20,
        initX: 20,
        condy: y => y > 0,
        condx: x => x > 0,
        changey: y => y - 10,
        changex: x => x - 10
      }
      const nextText = vi.fn()
        .mockReturnValueOnce('z')
        .mockReturnValueOnce('y')
        .mockReturnValueOnce('x')
        .mockReturnValueOnce('w')

      const generator = blocGeneratorFixedWidth(gridParams, nextText)
      const results = []

      for (const bloc of generator) {
        results.push(bloc)
      }

      expect(results).toEqual([
        { x: 20, y: 20, text: 'z' },
        { x: 10, y: 20, text: 'y' },
        { x: 20, y: 10, text: 'x' },
        { x: 10, y: 10, text: 'w' }
      ])
    })

    it('should handle empty grid', () => {
      const gridParams = {
        initY: 0,
        initX: 0,
        condy: () => false, // No valid y coordinates
        condx: x => x < 10,
        changey: y => y + 10,
        changex: x => x + 10
      }
      const nextText = vi.fn()

      const generator = blocGeneratorFixedWidth(gridParams, nextText)
      const results = Array.from(generator)

      expect(results).toEqual([])
      expect(nextText).not.toHaveBeenCalled()
    })
  })

  describe('blocGeneratorTextWidth', () => {
    let mockLayer

    beforeEach(() => {
      mockLayer = {
        textWidth: vi.fn()
          .mockReturnValueOnce(8) // 'a'
          .mockReturnValueOnce(12) // 'b'
          .mockReturnValueOnce(6) // 'c'
          .mockReturnValueOnce(4) // ' '
          .mockReturnValueOnce(10) // 'd'
      }
    })

    it('should generate coordinates based on text width', () => {
      const nextText = vi.fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b')
        .mockReturnValueOnce('c')

      const gridSize = { width: 30, height: 50 }
      const yOffset = 5

      const generator = blocGeneratorTextWidth(nextText, gridSize, yOffset, mockLayer)
      const results = []

      let count = 0
      for (const bloc of generator) {
        results.push(bloc)
        count++
        if (count >= 3) break // Prevent infinite loop in test
      }

      expect(results).toHaveLength(3)
      expect(results[0]).toEqual({ x: 0, y: 5, text: 'a' })
      expect(results[1]).toEqual({ x: 8, y: 5, text: 'b' })
      expect(results[2]).toEqual({ x: 20, y: 5, text: 'c' })
    })

    it('should wrap to next line when text exceeds width', () => {
      const nextText = vi.fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b') // This will cause wrap (0 + 8 + 12 > 15)
        .mockReturnValueOnce('c')

      const gridSize = { width: 15, height: 50 }
      const yOffset = 10

      const generator = blocGeneratorTextWidth(nextText, gridSize, yOffset, mockLayer)
      const results = []

      let count = 0
      for (const bloc of generator) {
        results.push(bloc)
        count++
        if (count >= 3) break
      }

      expect(results[0]).toEqual({ x: 0, y: 10, text: 'a' })
      expect(results[1]).toEqual({ x: 8, y: 10, text: 'b' })
      // After 'b', x would be 20, which exceeds 15, so wraps to next line
      expect(results[2]).toEqual({ x: 0, y: 20, text: 'c' })
    })

    it('should skip spaces at beginning of line', () => {
      const nextText = vi.fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce(' ') // Space that will cause wrap
        .mockReturnValueOnce(' ') // This space should be skipped
        .mockReturnValueOnce('d') // This should be used instead

      mockLayer.textWidth
        .mockReturnValueOnce(8) // 'a' - results in next x=8
        .mockReturnValueOnce(4) // ' ' - space
        .mockReturnValueOnce(4) // ' ' - space to skip
        .mockReturnValueOnce(10) // 'd' - actual character

      const gridSize = { width: 15, height: 50 }
      const yOffset = 5

      const generator = blocGeneratorTextWidth(nextText, gridSize, yOffset, mockLayer)
      const results = []

      let count = 0
      for (const bloc of generator) {
        results.push(bloc)
        count++
        if (count >= 3) break
      }

      expect(results[0]).toEqual({ x: 0, y: 5, text: 'a' })
      expect(results[1]).toEqual({ x: 8, y: 5, text: ' ' }) // Corrected: x should be 8
      expect(results[2]).toEqual({ x: 0, y: 10, text: 'd' }) // Skipped the space, used 'd'
    })
  })

  describe('blocGeneratorCircle', () => {
    let mockLayer

    beforeEach(() => {
      mockLayer = {
        textWidth: vi.fn()
          .mockReturnValue(5) // Consistent width for predictable testing
      }
    })

    it('should generate theta coordinates around a circle', () => {
      const radius = 10
      const circumference = 2 * Math.PI * radius
      const arcOffset = 0

      const nextText = vi.fn()
        .mockReturnValueOnce('a')
        .mockReturnValueOnce('b')
        .mockReturnValueOnce('c')

      const generator = blocGeneratorCircle({ radius, circumference, arcOffset })
      const textGenerator = generator(nextText, mockLayer)

      const results = []
      let count = 0
      for (const bloc of textGenerator) {
        results.push(bloc)
        count++
        if (count >= 3) break
      }

      expect(results).toHaveLength(3)
      expect(results[0].text).toBe('a')
      expect(results[1].text).toBe('b')
      expect(results[2].text).toBe('c')

      // Check that theta values increase
      expect(results[1].theta).toBeGreaterThan(results[0].theta)
      expect(results[2].theta).toBeGreaterThan(results[1].theta)
    })

    it('should respect arc offset', () => {
      const radius = 10
      const circumference = 20
      const arcOffset = 5

      const nextText = vi.fn().mockReturnValue('x')

      const generator = blocGeneratorCircle({ radius, circumference, arcOffset })
      const textGenerator = generator(nextText, mockLayer)

      const firstResult = textGenerator.next().value

      // With arcOffset of 5 and textWidth of 5, first theta should be:
      // Math.PI + (5 + 2.5) / 10 = Math.PI + 0.75
      const expectedTheta = Math.PI + 7.5 / 10
      expect(firstResult.theta).toBeCloseTo(expectedTheta, 5)
    })

    it('should stop when circumference is reached', () => {
      const radius = 10
      const circumference = 15 // Small circumference
      const arcOffset = 0

      const nextText = vi.fn().mockReturnValue('x')

      const generator = blocGeneratorCircle({ radius, circumference, arcOffset })
      const textGenerator = generator(nextText, mockLayer)

      const results = Array.from(textGenerator)

      // With textWidth of 5, we should get results until arclength >= 15
      // Each iteration adds 5 (2.5 + 2.5), so we should get 3 results (0, 5, 10)
      expect(results).toHaveLength(3)
    })

    it('should use text width for spacing calculations', () => {
      mockLayer.textWidth
        .mockReturnValueOnce(10)
        .mockReturnValueOnce(4)

      const radius = 20
      const circumference = 100
      const arcOffset = 0

      const nextText = vi.fn()
        .mockReturnValueOnce('W') // Wide character
        .mockReturnValueOnce('i') // Narrow character

      const generator = blocGeneratorCircle({ radius, circumference, arcOffset })
      const textGenerator = generator(nextText, mockLayer)

      const results = []
      results.push(textGenerator.next().value)
      results.push(textGenerator.next().value)

      // First char 'W' with width 10: theta = Math.PI + 5/20 = Math.PI + 0.25
      // Second char 'i' starts at arclength 10, width 4: theta = Math.PI + 12/20 = Math.PI + 0.6
      expect(results[0].theta).toBeCloseTo(Math.PI + 0.25, 5)
      expect(results[1].theta).toBeCloseTo(Math.PI + 0.6, 5)
    })
  })
})
