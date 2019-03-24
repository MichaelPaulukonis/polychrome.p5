// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class UndoLayers {
  constructor (layers, renderFunc, levels) {
    // Number of currently available undo and redo snapshots
    let undoSteps = 0
    let redoSteps = 0
    let images = new CircImgCollection(layers, renderFunc, levels)

    this.takeSnapshot = () => {
      undoSteps = Math.min(undoSteps + 1, images.amount - 1)
      // each time we draw we disable redo
      redoSteps = 0
      images.next()
      images.capture()
    }

    this.undo = () => {
      if (undoSteps > 0) {
        undoSteps--
        redoSteps++
        images.prev()
        images.show()
      }
    }
    this.redo = () => {
      if (redoSteps > 0) {
        undoSteps++
        redoSteps--
        images.next()
        images.show()
      }
    }
  }
}

class CircImgCollection {
  constructor (layers, renderFunc, amountOfImages) {
    let current = 0
    let img = []
    const d = layers.drawingLayer.pixelDensity()

    let amount = amountOfImages
    this.amount = amount

    // Initialize all images as copies of the current display
    for (let i = 0; i < amount; i++) {
      img[i] = layers.p5.createImage(layers.drawingLayer.width * d, layers.drawingLayer.height * d)
    }

    this.next = () => {
      current = (current + 1) % amount
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
    }
    this.capture = () => {
      img[current] = layers.drawingLayer.get()
    }
    this.show = () => {
      layers.drawingLayer.set(0, 0, img[current])
      layers.drawingLayer.updatePixels()
      renderFunc()
    }
  }
}
