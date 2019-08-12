// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class UndoLayers {
  constructor (layers, renderFunc, levels) {
    // Number of currently available undo and redo snapshots
    let undoSteps = 0
    let redoSteps = 0
    let images = new CircImgCollection(layers, renderFunc, levels)
    let temp
    const density = layers.drawingLayer.pixelDensity()

    this.takeSnapshot = () => {
      undoSteps = Math.min(undoSteps + 1, images.amount - 1)
      // each time we draw we disable redo
      redoSteps = 0
      images.next()
      images.store(this.copy())
    }

    // this is more of a layers, thing
    /**
     * Returns a p5.Graphics object that is a copy of the current drawing
     */
    this.copy = () => {
      // this is copying, somewhat, the initLayer code
      // but whatevs.....
      let layer = layers.p5.createGraphics(layers.p5.width, layers.p5.height)
      layer.pixelDensity(density)
      layer.image(layers.p5, 0, 0)
      return layer
    }

    // this is more of a layers, thing
    /**
     * Returns a p5.Graphics object that is a copy of the image passed in
     */
    this.clone = (img) => {
      let g = layers.p5.createGraphics(img.width, img.height)
      g.pixelDensity(density)
      g.image(img, 0, 0)
      return g
    }

    this.storeTemp = () => {
      temp = this.copy()
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
    let img = []
    let amount = amountOfImages
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
