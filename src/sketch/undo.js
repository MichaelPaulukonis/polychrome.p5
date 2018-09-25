// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class Undo {
  constructor (p5, levels) {
    // Number of currently available undo and redo snapshots
    let undoSteps = 0
    let redoSteps = 0
    let images = new CircImgCollection(p5, levels)

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
  constructor (p5, amountOfImages) {
    let current = 0
    let img = []

    let amount = amountOfImages
    this.amount = amount

    // Initialize all images as copies of the current display
    for (let i = 0; i < amount; i++) {
      img[i] = p5.createImage(p5.width, p5.height)
      img[i] = p5.get()
    }

    this.next = () => {
      current = (current + 1) % amount
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
    }
    this.capture = () => {
      img[current] = p5.get()
    }
    this.show = () => {
      p5.image(img[current], 0, 0)
    }
  }
}
