import hotkeys from 'hotkeys-js'

const setupHotkeys = (sketch) => {
  const EXTRASHIFT = 10
  hotkeys('up,down,shift+up,shift+down,alt+t', (_, handler) => {
    switch (handler.key) {
      case 'down': {
        sketch.shift(EXTRASHIFT, 0)
        sketch.undo.takeSnapshot()
        break
      }
      case 'up': {
        sketch.shift(-EXTRASHIFT, 0)
        sketch.undo.takeSnapshot()
        break
      }
      case 'shift+down': {
        sketch.shift(EXTRASHIFT * 10, 0)
        sketch.undo.takeSnapshot()
        break
      }
      case 'shift+up': {
        sketch.shift(-EXTRASHIFT * 10, 0)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+t': {
        sketch.target()
        break
      }
    }
  })
}

const keyPresser = (keyCode, sketch) => {
  // BACKSPACE, DELETE, ENTER, RETURN, TAB, ESCAPE, SHIFT, CONTROL, OPTION, ALT, UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW
  const extraShift = event.shiftKey ? 100 : 10
  // also: altKey ctrlKey, metaKey
  let handled = false
  // TODO: move into hotkeys
  if (keyCode === sketch.p5.LEFT_ARROW || keyCode === sketch.p5.RIGHT_ARROW) {
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

const keyHandler = (char, params, layers, sketch) => {
  const EXTRASHIFT = 10
  const HORIZONTAL = 0
  const VERTICAL = 1

  switch (char) {
    case 'a':
      sketch.newCorner(layers.drawingLayer)
      sketch.undo.takeSnapshot()
      break

    case 'f':
      sketch.flip(HORIZONTAL, layers.p5)
      sketch.undo.takeSnapshot()
      break

    case 'F':
      sketch.flip(VERTICAL, layers.p5)
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

    case 'p':
      params.target = !params.target
      break

    case 'q':
      sketch.rotateCanvas(1)
      // TODO: if not square, undo gets weird, here.....
      sketch.undo.takeSnapshot()
      break

    case 'Q':
      sketch.rotateCanvas(-1)
      sketch.undo.takeSnapshot()
      break

    case 'r':
    case 'R':
      sketch.reset(params, layers.drawingLayer)
      break

    case 's':
    case 'S':
      // TODO: this isn't really a GUI function
      // it's a PARAMS function
      sketch.guiControl.swapParams()
      break

    case 't':
      sketch.mirror(HORIZONTAL, layers.p5)
      sketch.undo.takeSnapshot()
      break

    case 'T':
      sketch.mirror(VERTICAL, layers.p5)
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

    case 'z':
      sketch.shift(0, -EXTRASHIFT)
      sketch.undo.takeSnapshot()
      break
    case 'Z':
      sketch.shift(0, EXTRASHIFT)
      sketch.undo.takeSnapshot()
      break

    case 'g': {
      sketch.randomLayer()
      break
    }

    case 'G': {
      sketch.undo.takeSnapshot()
      break
    }
  }
}

export { keyPresser, keyHandler, setupHotkeys }
