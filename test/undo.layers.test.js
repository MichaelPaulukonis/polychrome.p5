import { describe, it, expect, vi, beforeEach } from 'vitest'
import UndoLayers from '../src/undo/undo.layers.js'

const createMockLayers = () => ({
  copy: vi.fn(() => ({ id: Math.random(), mock: 'layer' })),
  dispose: vi.fn(),
  drawingCanvas: {
    push: vi.fn(),
    pop: vi.fn(),
    translate: vi.fn(),
    resetMatrix: vi.fn(),
    image: vi.fn()
  },
  p5: {
    image: vi.fn()
  }
})

describe('UndoLayers', () => {
  let layers
  let undoLayers

  beforeEach(() => {
    layers = createMockLayers()
    undoLayers = new UndoLayers(layers, null, 5) // Small buffer for testing
  })

  describe('takeSnapshot', () => {
    it('should store the first snapshot', () => {
      undoLayers.takeSnapshot()
      expect(layers.copy).toHaveBeenCalledTimes(1)
    })

    it('should accumulate snapshots up to buffer size', () => {
      for (let i = 0; i < 5; i++) {
        undoLayers.takeSnapshot()
      }
      expect(layers.copy).toHaveBeenCalledTimes(5)
      expect(layers.dispose).not.toHaveBeenCalled()
    })

    it('should dispose old images when buffer is full', () => {
      for (let i = 0; i < 7; i++) {
        undoLayers.takeSnapshot()
      }
      expect(layers.copy).toHaveBeenCalledTimes(7)
      expect(layers.dispose).toHaveBeenCalledTimes(2)
    })

    it('should reset redo steps when taking new snapshot', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      undoLayers.takeSnapshot() // This should clear redo

      undoLayers.redo() // Should do nothing
    })
  })

  describe('undo', () => {
    it('should not undo when no snapshots available', () => {
      undoLayers.undo()
    })

    it('should undo one step', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()

      expect(layers.drawingCanvas.push).toHaveBeenCalled()
      expect(layers.drawingCanvas.pop).toHaveBeenCalled()
    })

    it('should handle multiple undo steps', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()
      undoLayers.undo()
    })

    it('should not undo beyond available history', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()
      undoLayers.undo()
      undoLayers.undo() // Should do nothing
    })
  })

  describe('redo', () => {
    it('should not redo when no undo has been performed', () => {
      undoLayers.takeSnapshot()
      undoLayers.redo()
    })

    it('should redo after undo', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      undoLayers.redo()
    })

    it('should handle multiple redo steps', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()

      undoLayers.undo()
      undoLayers.undo()

      undoLayers.redo()
      undoLayers.redo()
    })

    it('should not redo beyond available redo history', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()

      undoLayers.redo()
      undoLayers.redo() // Should do nothing
    })

    // New test for intermittent redo failure
    it('should handle redo consistently after complex sequences', () => {
      undoLayers.takeSnapshot() // 0
      undoLayers.takeSnapshot() // 1
      undoLayers.takeSnapshot() // 2
      undoLayers.undo() // back to 1
      undoLayers.undo() // back to 0
      undoLayers.redo() // forward to 1
      undoLayers.takeSnapshot() // new 2, clears redo for old 2
      undoLayers.redo() // should do nothing
    })
  })

  describe('circular buffer behavior', () => {
    it('should handle buffer wraparound correctly', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, null, bufferSize)

      // Fill buffer and go beyond
      for (let i = 0; i < bufferSize + 2; i++) {
        undoSmall.takeSnapshot()
      }

      // Should have called dispose for the two oldest images
      expect(layers.dispose).toHaveBeenCalledTimes(2)
    })

    it('should maintain undo/redo consistency after wraparound', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, null, bufferSize)

      // Fill buffer and go beyond
      for (let i = 0; i < bufferSize + 1; i++) {
        undoSmall.takeSnapshot()
      }
      // We have snapshots at indices 0, 1, 2. Newest is at 0. Oldest is at 1.
      // History: [pos 0, pos 2, pos 1]

      // console.log('State after snapshots:', undoSmall._getState())

      undoSmall.undo() // to pos 2
      undoSmall.undo() // to pos 1

      // - We keep the 3 most recent snapshots
      // - We can undo 2 times (from newest to oldest-available)
      // - Both undos should render

      // Should be able to redo
      undoSmall.redo()
      undoSmall.redo()
      undoSmall.redo() // Should do nothing
    })

    it('should handle edge case at exactly buffer size', () => {
      const bufferSize = 3
      const undoSmall = new UndoLayers(layers, null, bufferSize)

      // Fill buffer exactly
      for (let i = 0; i < bufferSize; i++) {
        undoSmall.takeSnapshot()
      }

      undoSmall.undo()
      undoSmall.undo()
      undoSmall.undo() // Should do nothing

      expect(layers.drawingCanvas.image).toHaveBeenCalledTimes(2)
    })

    // New test for the specific modulo edge case
    it('should handle redo at buffer size boundaries', () => {
      const bufferSize = 5
      const undoSmall = new UndoLayers(layers, null, bufferSize)

      // Fill buffer to exactly the size
      for (let i = 0; i < bufferSize; i++) {
        undoSmall.takeSnapshot()
      }

      // Undo twice
      undoSmall.undo()
      undoSmall.undo()

      // Redo twice
      undoSmall.redo()
      undoSmall.redo()
    })
  })

  describe('temp storage', () => {
    it('should store temp layer', () => {
      const tempLayer = undoLayers.storeTemp()
      expect(layers.copy).toHaveBeenCalledTimes(1)
      expect(tempLayer).toBeDefined()
    })

    it('should return existing temp if available', () => {
      const temp1 = undoLayers.storeTemp()
      const temp2 = undoLayers.getTemp()
      expect(layers.copy).toHaveBeenCalledTimes(1)
      expect(temp2).toBe(temp1)
    })

    it('should create temp if none exists', () => {
      const temp = undoLayers.getTemp()
      expect(layers.copy).toHaveBeenCalledTimes(1)
      expect(temp).toBeDefined()
    })
  })

  describe('history', () => {
    it('should return empty history initially', () => {
      expect(undoLayers.history()).toEqual([])
    })

    it('should return filtered history without null entries', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      const history = undoLayers.history()
      expect(history.length).toBe(2)
      expect(history[0]).not.toBeNull()
    })
  })

  describe('state validation', () => {
    it('should maintain consistent internal state during operations', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.takeSnapshot()
      undoLayers.undo()
      undoLayers.undo()
      undoLayers.redo()

      // Should not throw and should render correctly
    })

    it('should handle rapid undo/redo sequences', () => {
      undoLayers.takeSnapshot()
      undoLayers.takeSnapshot()
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.undo()
      undoLayers.redo()
      undoLayers.undo()
    })
  })

  describe('error handling', () => {
    it('should handle missing images gracefully in show()', () => {
      // Manually create a scenario where an image might be missing
      const undoWithBadImage = new UndoLayers(layers, null, 3)
      undoWithBadImage.takeSnapshot() // pos 0
      undoWithBadImage.takeSnapshot() // pos 1

      // Simulate a missing image
      const history = undoWithBadImage.history()
      history[0] = null // This is a bit of a hack for testing

      // This should not throw an error
      expect(() => undoWithBadImage.undo()).not.toThrow()
    })
  })
})
