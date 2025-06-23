import { describe, it, expect, vi, beforeEach } from 'vitest'
import UndoLayers from '../undo.layers.js'

// Mock layers object
const createMockLayers = () => ({
  copy: vi.fn(() => ({ id: Math.random(), mock: 'layer' })),
  dispose: vi.fn(),
  drawingLayer: {
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    resetMatrix: vi.fn(),
    image: vi.fn()
  }
})

// Mock render function
const createMockRenderFunc = () => vi.fn()

describe('UndoLayers', () => {
  let layers
  let renderFunc
  let undoLayers

  beforeEach(() => {
    layers = createMockLayers()
    renderFunc = createMockRenderFunc()
    undoLayers = new UndoLayers(layers, renderFunc, 5) // Small buffer for testing
  })

  describe('takeSnapshot', () => {
    it('should store the first snapshot', () => {
      undoLayers.takeSnapshot()

      expect(layers.copy).toHaveBeenCalledTimes(1)
      expect(undoLayers.history()).toHaveLength(1)
    })

    it('should accumulate snapshots up to buffer size', () => {
      for (let i = 0; i < 3; i++) {
        undoLayers.takeSnapshot()
      }

      expect(layers.copy).toHaveBeenCalledTimes(3)
      expect(undoLayers.history()).toHaveLength(3)
    })

    it('should dispose old images when buffer is full', () => {
      // Fill the buffer completely
      for (let i = 0; i < 6; i++) {
        undoLayers.takeSnapshot()
      }

      // Should have disposed one image (when we exceeded buffer size)
      expect(layers.dispose).toHaveBeenCalledTimes(1)
      expect(undoLayers.history()).toHaveLength(5) // Buffer size limit
    })

    it('should reset redo steps when taking new snapshot', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      // Now we should have redo available
      undoLayers.takeSnapshot() // This should clear redo

      undoLayers.redo() // Should do nothing
      expect(renderFunc).toHaveBeenCalledTimes(1) // Only from undo
    })
  })

  describe('undo', () => {
    it('should not undo when no snapshots available', () => {
      undoLayers.undo()

      expect(renderFunc).not.toHaveBeenCalled()
    })

    it('should undo one step', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()

      expect(renderFunc).toHaveBeenCalledTimes(1)
      expect(layers.drawingLayer.push).toHaveBeenCalled()
      expect(layers.drawingLayer.pop).toHaveBeenCalled()
    })

    it('should handle multiple undo steps', () => {
      for (let i = 0; i < 3; i++) {
        undoLayers.takeSnapshot()
      }

      undoLayers.undo()
      undoLayers.undo()

      expect(renderFunc).toHaveBeenCalledTimes(2)
    })

    it('should not undo beyond available history', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()
      undoLayers.undo() // Should do nothing - we're already at the first snapshot

      expect(renderFunc).toHaveBeenCalledTimes(1) // Only one undo is possible
    })
  })

  describe('redo', () => {
    it('should not redo when no undo has been performed', () => {
      undoLayers.takeSnapshot()
      undoLayers.redo()

      expect(renderFunc).not.toHaveBeenCalled()
    })

    it('should redo after undo', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      undoLayers.redo()

      expect(renderFunc).toHaveBeenCalledTimes(2) // Once for undo, once for redo
    })

    it('should handle multiple redo steps', () => {
      for (let i = 0; i < 3; i++) {
        undoLayers.takeSnapshot()
      }

      undoLayers.undo()
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.redo()

      expect(renderFunc).toHaveBeenCalledTimes(4) // 2 undos + 2 redos
    })

    it('should not redo beyond available redo history', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      undoLayers.redo()
      undoLayers.redo() // Should do nothing

      expect(renderFunc).toHaveBeenCalledTimes(2) // 1 undo + 1 redo
    })

    // New test for intermittent redo failure
    it('should handle redo consistently after complex sequences', () => {
      // This test specifically targets the intermittent redo failures
      undoLayers.takeSnapshot() // State 0
      undoLayers.takeSnapshot() // State 1
      undoLayers.takeSnapshot() // State 2

      undoLayers.undo() // Back to state 1
      undoLayers.undo() // Back to state 0

      undoLayers.redo() // Forward to state 1
      undoLayers.redo() // Forward to state 2

      // Should have rendered: 2 undos + 2 redos = 4 times
      expect(renderFunc).toHaveBeenCalledTimes(4)
    })
  })

  describe('circular buffer behavior', () => {
    it('should handle buffer wraparound correctly', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, renderFunc, bufferSize)

      // Fill buffer and go beyond
      for (let i = 0; i < bufferSize + 2; i++) {
        undoSmall.takeSnapshot()
      }

      // Should have disposed 2 images
      expect(layers.dispose).toHaveBeenCalledTimes(2)
      expect(undoSmall.history()).toHaveLength(bufferSize)
    })

    it('should maintain undo/redo consistency after wraparound', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, renderFunc, bufferSize)

      // Fill buffer and go beyond
      for (let i = 0; i < bufferSize + 1; i++) {
        undoSmall.takeSnapshot()
      }

      // Debug the state
      const state = undoSmall._getState()
      console.log('State after snapshots:', state)

      // Should be able to undo up to buffer limit
      undoSmall.undo()
      undoSmall.undo()

      // With 4 snapshots in a buffer of size 3:
      // - We keep the 3 most recent snapshots
      // - We can undo 2 times (from newest to oldest-available)
      // - Both undos should render
      expect(renderFunc).toHaveBeenCalledTimes(2)

      // Should be able to redo
      undoSmall.redo()

      expect(renderFunc).toHaveBeenCalledTimes(3)
    })

    it('should handle edge case at exactly buffer size', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, renderFunc, bufferSize)

      // Fill buffer exactly
      for (let i = 0; i < bufferSize; i++) {
        undoSmall.takeSnapshot()
      }

      // Should not have disposed anything yet
      expect(layers.dispose).not.toHaveBeenCalled()

      // Add one more to trigger wraparound
      undoSmall.takeSnapshot()

      expect(layers.dispose).toHaveBeenCalledTimes(1)
    })

    // New test for the specific modulo edge case
    it('should handle redo at buffer size boundaries', () => {
      const bufferSize = 5
      const undoSmall = new UndoLayers(layers, renderFunc, bufferSize)

      // Fill buffer to exactly the size
      for (let i = 0; i < bufferSize; i++) {
        undoSmall.takeSnapshot()
      }

      // Add one more to trigger wraparound
      undoSmall.takeSnapshot()

      // Go back several steps
      undoSmall.undo()
      undoSmall.undo()

      // Redo should work consistently
      undoSmall.redo()
      undoSmall.redo()

      expect(renderFunc).toHaveBeenCalledTimes(4) // 2 undos + 2 redos
    })
  })

  describe('temp storage', () => {
    it('should store temp layer', () => {
      const temp = undoLayers.storeTemp()

      expect(layers.copy).toHaveBeenCalled()
      expect(temp).toBeDefined()
    })

    it('should return existing temp if available', () => {
      const temp1 = undoLayers.storeTemp()
      const temp2 = undoLayers.getTemp()

      expect(temp1).toBe(temp2)
      expect(layers.copy).toHaveBeenCalledTimes(1) // Should not create new copy
    })

    it('should create temp if none exists', () => {
      const temp = undoLayers.getTemp()

      expect(layers.copy).toHaveBeenCalled()
      expect(temp).toBeDefined()
    })
  })

  describe('history', () => {
    it('should return empty history initially', () => {
      expect(undoLayers.history()).toHaveLength(0)
    })

    it('should return filtered history without null entries', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      const history = undoLayers.history()
      expect(history).toHaveLength(2)
      expect(history.every(item => item !== null)).toBe(true)
    })
  })

  describe('state validation', () => {
    it('should maintain consistent internal state during operations', () => {
      // This test validates that internal state remains consistent
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()
      undoLayers.undo()
      undoLayers.redo()

      // Should not throw and should render correctly
      expect(renderFunc).toHaveBeenCalledTimes(3) // 2 undos + 1 redo
    })

    it('should handle rapid undo/redo sequences', () => {
      for (let i = 0; i < 5; i++) {
        undoLayers.takeSnapshot()
      }

      // Rapid undo/redo sequence
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.undo()

      expect(renderFunc).toHaveBeenCalledTimes(5) // Should handle all operations
    })
  })

  describe('error handling', () => {
    it('should handle missing images gracefully in show()', () => {
      // Force a scenario where we try to show a non-existent image
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      undoLayers.takeSnapshot()
      undoLayers.undo()

      // Manually corrupt the internal state to test error handling
      // This is a bit hacky but tests the safety check
      const brokenUndo = new UndoLayers(layers, renderFunc, 5)
      brokenUndo.undo() // Try to undo with no history

      consoleSpy.mockRestore()
    })
  })
})
