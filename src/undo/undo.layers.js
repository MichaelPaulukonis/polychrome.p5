// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class UndoLayers {
  constructor (layers, renderFunc, levels) {
    // Simplified state tracking
    let currentPosition = -1 // Current position in history (-1 = no history)
    let newestPosition = -1 // Newest stored position
    let availableStates = 0 // Number of states actually stored
    const maxStates = levels // Maximum buffer size
    const images = new ImageCollection(layers, maxStates)
    let temp

    // State validation helper
    const validateState = () => {
      if (currentPosition < -1 || currentPosition >= maxStates) {
        console.warn('Invalid currentPosition:', currentPosition)
      }
      if (newestPosition < -1 || newestPosition >= maxStates) {
        console.warn('Invalid newestPosition:', newestPosition)
      }
      if (availableStates < 0 || availableStates > maxStates) {
        console.warn('Invalid availableStates:', availableStates)
      }
    }

    // Helper to get oldest position when buffer is full
    const getOldestPosition = () => {
      if (availableStates < maxStates) return 0
      return (newestPosition + 1) % maxStates
    }

    // Clear helper functions for undo/redo logic
    const canUndo = () => {
      if (availableStates <= 1) return false // Need at least 2 states to undo

      if (availableStates < maxStates) {
        // Buffer not full - can undo if not at first position
        return currentPosition > 0
      } else {
        // Buffer full - can undo if not at oldest position
        return currentPosition !== getOldestPosition()
      }
    }

    const canRedo = () => {
      return availableStates > 0 && currentPosition !== newestPosition
    }

    this.takeSnapshot = () => {
      // Move to next position and store
      const nextPosition = (newestPosition + 1) % maxStates
      images.store(layers.copy(), nextPosition)

      // Update state tracking
      newestPosition = nextPosition
      availableStates = Math.min(availableStates + 1, maxStates)
      currentPosition = newestPosition

      validateState()
    }

    this.storeTemp = () => {
      temp = layers.copy()
      return temp
    }

    this.getTemp = () => {
      return temp || this.storeTemp()
    }

    this.undo = () => {
      if (!canUndo()) return

      if (currentPosition === newestPosition) {
        // First undo - go to previous state
        if (availableStates < maxStates) {
          // Buffer not full - go to previous position
          currentPosition = availableStates - 2 // Go to previous state
        } else {
          // Buffer full - go to previous position in circular buffer
          currentPosition = (newestPosition - 1 + maxStates) % maxStates
        }
      } else {
        // Subsequent undos - move backward
        if (availableStates < maxStates) {
          // Buffer not full - simple decrement
          currentPosition--
        } else {
          // Buffer full - circular navigation backward
          currentPosition = (currentPosition - 1 + maxStates) % maxStates
        }
      }

      this.show()
      validateState()
    }

    this.redo = () => {
      if (!canRedo()) return

      // Move forward one position
      currentPosition = (currentPosition + 1) % maxStates

      this.show()
      validateState()
    }

    // Separated rendering concern - now handled in UndoLayers
    this.show = () => {
      if (currentPosition === -1 || !images.hasImage(currentPosition)) {
        console.warn('No image available at position:', currentPosition)
        return
      }

      const image = images.getImage(currentPosition)
      if (!image) {
        console.warn('Image is null at position:', currentPosition)
        return
      }

      layers.drawingCanvas.push()
      layers.drawingCanvas.translate(0, 0)
      layers.drawingCanvas.resetMatrix()
      layers.drawingCanvas.image(image, 0, 0)
      layers.drawingCanvas.pop()
    }

    this.clear = () => {
      currentPosition = -1
      newestPosition = -1
      availableStates = 0
      images.clear()
    }

    this.history = () => {
      const result = []
      for (let i = 0; i < availableStates; i++) {
        const pos = (newestPosition - i + maxStates) % maxStates
        const image = images.getImage(pos)
        if (image) {
          result.push(image)
        }
      }
      return result
    }

    // Debug helpers
    this._getState = () => ({
      currentPosition,
      newestPosition,
      availableStates,
      maxStates,
      oldestPosition: getOldestPosition(),
      canUndo: canUndo(),
      canRedo: canRedo()
    })
  }
}

// Renamed from CircImgCollection - pure storage/retrieval
class ImageCollection {
  constructor (layers, amountOfImages) {
    const imgs = new Array(amountOfImages).fill(null)
    const amount = amountOfImages

    this.store = (layer, position) => {
      // Clean up existing image at position
      if (imgs[position]) {
        layers.dispose(imgs[position])
      }
      imgs[position] = layer
    }

    this.hasImage = (position) => {
      return position >= 0 && position < amount && imgs[position] !== null
    }

    this.getImage = (position) => {
      if (position >= 0 && position < amount) {
        return imgs[position]
      }
      return null
    }

    this.all = () => imgs

    this.clear = () => {
      for (let i = 0; i < amount; i++) {
        if (imgs[i]) {
          layers.dispose(imgs[i])
          imgs[i] = null
        }
      }
    }
  }
}
