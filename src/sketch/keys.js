const keyPresser = (keyCode, sketch) => {
  const extraShift = 10
  let handled = false
  if (keyCode === sketch.p5.UP_ARROW || keyCode === sketch.p5.DOWN_ARROW) {
    handled = true
    const vector = (keyCode === sketch.p5.UP_ARROW) ? 1 : -1
    sketch.shift(vector * extraShift, 0)
  } else if (keyCode === sketch.p5.LEFT_ARROW || keyCode === sketch.p5.RIGHT_ARROW) {
    handled = true
    const vector = (keyCode === sketch.p5.RIGHT_ARROW) ? 1 : -1
    sketch.shift(0, vector * extraShift)
  } else if (keyCode === sketch.p5.BACKSPACE || keyCode === sketch.p5.DELETE) {
    handled = true
    sketch.clearCanvas()
    sketch.undo.takeSnapshot()
  }
  return handled
}

const keyHandler = (char, params, layersOld, sketch) => {
  const EXTRASHIFT = 10
  const HORIZONTAL = 0
  const VERTICAL = 1

  switch (char) {
    case 'a':
      sketch.newCorner(layersOld.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case 'f':
      sketch.flip(HORIZONTAL, layersOld.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case 'F':
      sketch.flip(VERTICAL, layersOld.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case ' ':
      sketch.paint(sketch.p5.mouseX, sketch.p5.mouseY, params)
      sketch.undo.takeSnapshot()
      break

    case 'm':
      sketch.nextDrawMode(1, params)
      break
    case 'M':
      sketch.nextDrawMode(-1, params)
      break

    case 'o':
    case 'O':
      params.useOutline = !params.useOutline
      break

    case 'q':
      sketch.rotateCanvas()
      // TODO: if not square, undo gets weird, here.....
      sketch.undo.takeSnapshot()
      break

    case 'r':
    case 'R':
      sketch.reset(params, layersOld.drawingLayer)
      break

    case 's':
    case 'S':
      // TODO: this isn't really a GUI function
      // it's a PARAMS function
      sketch.guiControl.swapParams()
      break

    case 't':
      sketch.mirror(HORIZONTAL, layersOld.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case 'T':
      sketch.mirror(VERTICAL, layersOld.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case 'u':
      sketch.undo.undo()
      break
    case 'U':
      sketch.undo.redo()
      break

    case 'w':
    case 'W':
      sketch.textManager.setText(sketch.guiControl.getBodyCopy())
      break

    case 'x':
      sketch.shift(EXTRASHIFT, 0)
      sketch.undo.takeSnapshot()
      break
    case 'X':
      sketch.shift(-EXTRASHIFT, 0)
      sketch.undo.takeSnapshot()
      break

    case 'z':
      sketch.shift(0, -EXTRASHIFT)
      sketch.undo.takeSnapshot()
      break
    case 'Z':
      sketch.shift(0, EXTRASHIFT)
      sketch.undo.takeSnapshot()
      break

    // TODO: how about push onto a time-expiring queue?
    // or something, so we can have 00..99 macros, instead
    // or something else. maybe real control keys.
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      sketch.macros[`macro${char}`](params, layersOld.drawingLayer, layersOld.p5)
      sketch.undo.takeSnapshot()
      break

    case 'g': {
      sketch.randomLayer()
    }
  }
}
export { keyPresser, keyHandler }
