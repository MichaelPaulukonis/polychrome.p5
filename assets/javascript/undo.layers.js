// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class UndoLayers {
  constructor (layers, renderFunc, levels) {
    // Number of currently available undo and redo snapshots
    let undoSteps = 0
    let redoSteps = 0
    const images = new CircImgCollection(layers, renderFunc, levels)
    let temp
    // const density = layers.drawingLayer.pixelDensity()

    this.takeSnapshot = () => {
      undoSteps = Math.min(undoSteps + 1, images.amount - 1)
      // each time we draw we disable redo
      redoSteps = 0
      images.next()
      images.store(layers.copy())
    }

    this.storeTemp = () => {
      temp = this.layers.copy()
      return temp
    }

    this.getTemp = () => {
      return temp || this.storeTemp()
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
    this.history = () => images.all().slice(0, undoSteps)
  }
}

class CircImgCollection {
  constructor (layers, renderFunc, amountOfImages) {
    let current = 0
    const img = []
    const amount = amountOfImages
    this.amount = amount

    this.all = () => img

    this.next = () => {
      current = (current + 1) % amount
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
    }
    this.store = (layer) => {
      img[current] = layer
      layer.remove()
    }
    this.show = () => {
      // TODO: if w/h does NOT match current, then should rotate canvas
      // ouch. this is a heavy undo layer
      // maybe just store images - leave the rendering and rotating to something in the sketch

      layers.drawingLayer.push()
      layers.drawingLayer.translate(0, 0)
      layers.drawingLayer.resetMatrix()
      layers.drawingLayer.image(img[current], 0, 0)
      renderFunc()
      layers.drawingLayer.pop()
    }
  }
}
