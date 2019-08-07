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

    this.temp = () => {
      const temp = layers.p5.createGraphics(layers.p5.width, layers.p5.height)
      temp.pixelDensity(layers.p5.pixelDensity())
      temp.image(layers.p5, 0, 0)
      return temp
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
    const density = layers.drawingLayer.pixelDensity()

    let amount = amountOfImages
    this.amount = amount

    this.all = () => img

    this.next = () => {
      current = (current + 1) % amount
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
    }
    this.capture = () => {
      // this is copying, somewhat, the initLayer code
      // but whatevs.....
      let layer = layers.p5.createGraphics(layers.p5.width, layers.p5.height)
      layer.pixelDensity(density)
      layer.image(layers.p5, 0, 0)
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
