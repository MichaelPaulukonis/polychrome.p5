// based on processing.js code at https://www.openprocessing.org/sketch/131411

export default class Undo {
  constructor (p5, levels) {
    // Number of currently available undo and redo snapshots
    let undoSteps = 0
    let redoSteps = 0
    let images = new CircImgCollection(p5, levels)

    this.takeSnapshot = () => {
      // TODO: there's a bug in these number
      // revisit how all of this is stored/ incremented, etc.
      // are we also skipping undoStep 0 ???
      undoSteps = Math.min(undoSteps + 1, images.amount)
      // each time we draw we disable redo
      console.log(`steps: ${undoSteps} amount: ${images.amount}`)
      redoSteps = 0
      images.next()
      images.capture()
    }

    this.undo = () => {
      if (undoSteps > 0) {
        undoSteps--
        redoSteps++
        console.log(`steps: ${undoSteps} amount: ${images.amount}`)
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
    let context = p5.drawingContext

    const amount = amountOfImages
    this.amount = amount

    // Initialize all images as copies of the current display
    let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

    for (let i = 0; i < amount; i++) {
      img[i] = imageData // initialize  - necesary?????
    }

    this.next = () => {
      current = (current + 1) % amount
      console.log(`next current: ${current}`)
    }
    this.prev = () => {
      current = (current - 1 + amount) % amount
      console.log(`prev current: ${current}`)
    }
    this.capture = () => {
      img[current] = context.getImageData(0, 0, context.canvas.width, context.canvas.height)
      console.log(`capture current: ${current}`)
    }
    this.show = () => {
      // UGH - not nesc captured by p5...
      // woo! we are ALWAYS undoing 2 steps.... (or... usually? UGH)
      context.putImageData(img[current], 0, 0)
      // console.log(context, img)
      console.log(`showed current: ${current}`)
    }
  }
}
