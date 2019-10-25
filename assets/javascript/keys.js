import hotkeys from 'hotkeys-js'

const setupHotkeys = (sketch) => {
  const hotkeystring = 'del,backspace,shift,shift+left,left,shift+right,right,up,down,shift+up,shift+down,alt+e,command+s,alt+g,alt+t,' +
    'alt+1,alt+2,alt+3,alt+4,alt+5,alt+6,alt+7,alt+8,alt+9,alt+0'
  hotkeys(hotkeystring, (event, handler) => {
    event.preventDefault()
    const extraShift = (hotkeys.getPressedKeyCodes().includes(16)) ? 100 : 10
    switch (handler.key) {
      case 'left':
      case 'shift+left':
      case 'right':
      case 'shift+right': {
        const vector = (handler.key.includes('right')) ? 1 : -1
        sketch.shift(0, vector * extraShift)
        sketch.undo.takeSnapshot()
        break
      }
      case 'down':
      case 'up':
      case 'shift+down':
      case 'shift+up': {
        const vector = (handler.key.includes('down')) ? 1 : -1
        sketch.shift(vector * extraShift, 0)
        sketch.undo.takeSnapshot()
        break
      }
      case 'del':
      case 'backspace': {
        sketch.clearCanvas()
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+e': {
        sketch.params.hardEdge = !sketch.params.hardEdge
        break
      }
      case 'command+s': {
        sketch.save_sketch()
        break
      }
      case 'alt+g': {
        sketch.undo.takeSnapshot()
        sketch.adjustGamma(sketch.params.gamma)
        break
      }
      case 'alt+t': {
        sketch.target()
        break
      }
      case 'alt+1': {
        // TODO: we can build this programmatically
        const m = `macro${1}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+2': {
        // TODO: we can build this programmatically
        const m = `macro${19}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+3': {
        // TODO: we can build this programmatically
        const m = `macro${21}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+4': {
        // TODO: we can build this programmatically
        const m = `macro${16}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+5': {
        // TODO: we can build this programmatically
        const m = `macro${17}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
      case 'alt+6': {
        // TODO: we can build this programmatically
        const m = `macro${18}`
        sketch.macros[m](sketch.params, sketch.layers.drawingLayer, sketch.layers.p5)
        sketch.undo.takeSnapshot()
        break
      }
    }
  })
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
      sketch.mirror(VERTICAL, layers.p5)
      sketch.undo.takeSnapshot()
      break

    case 'T':
      sketch.mirror(HORIZONTAL, layers.p5)
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
      // TODO: hrm. how do I do this, now? !!!
      // sketch.textManager.setText(sketch.guiControl.getBodyCopy())
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

export { keyHandler, setupHotkeys }
