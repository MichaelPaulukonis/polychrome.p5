/**
 * Tests for general utility functions
 */

import { describe, it, expect, vi } from 'vitest'
import { apx, pushpop } from '@/src/utils'

describe('General Utilities', () => {
  describe('apx', () => {
    it('should apply multiple functions to each item in a list', () => {
      const mockFn1 = vi.fn()
      const mockFn2 = vi.fn()
      const testList = [1, 2, 3]

      const applyFns = apx(mockFn1, mockFn2)
      applyFns(testList)

      expect(mockFn1).toHaveBeenCalledTimes(3)
      expect(mockFn2).toHaveBeenCalledTimes(3)
      expect(mockFn1).toHaveBeenCalledWith(1)
      expect(mockFn1).toHaveBeenCalledWith(2)
      expect(mockFn1).toHaveBeenCalledWith(3)
      expect(mockFn2).toHaveBeenCalledWith(1)
      expect(mockFn2).toHaveBeenCalledWith(2)
      expect(mockFn2).toHaveBeenCalledWith(3)
    })

    it('should handle empty function list', () => {
      const testList = [1, 2, 3]
      const applyFns = apx()

      expect(() => applyFns(testList)).not.toThrow()
    })

    it('should handle empty item list', () => {
      const mockFn = vi.fn()
      const applyFns = apx(mockFn)

      applyFns([])
      expect(mockFn).not.toHaveBeenCalled()
    })
  })

  describe('pushpop', () => {
    it('should call push and pop around function execution', () => {
      const mockLayer = {
        push: vi.fn(),
        pop: vi.fn()
      }
      const mockFunction = vi.fn()

      const wrappedFn = pushpop(mockLayer)(mockFunction)
      wrappedFn()

      expect(mockLayer.push).toHaveBeenCalledTimes(1)
      expect(mockLayer.pop).toHaveBeenCalledTimes(1)
      expect(mockFunction).toHaveBeenCalledTimes(1)

      // Ensure push is called before the function and pop after
      expect(mockLayer.push).toHaveBeenCalledBefore(mockFunction)
      expect(mockFunction).toHaveBeenCalledBefore(mockLayer.pop)
    })

    it('should call pop even if function throws', () => {
      const mockLayer = {
        push: vi.fn(),
        pop: vi.fn()
      }
      const throwingFunction = vi.fn(() => {
        throw new Error('Test error')
      })

      const wrappedFn = pushpop(mockLayer)(throwingFunction)

      expect(() => wrappedFn()).toThrow('Test error')
      expect(mockLayer.push).toHaveBeenCalledTimes(1)
      expect(mockLayer.pop).toHaveBeenCalledTimes(1)
    })
  })
})
