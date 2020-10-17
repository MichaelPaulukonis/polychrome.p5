import hotkeys from 'hotkeys-js'

// once all of these are moved into HotKeys, we can rid of the ref insie of sketch
const EXTRASHIFT = 10
const HORIZONTAL = 0
const VERTICAL = 1

const flip = ({ layers, sketch }) => (direction) => {
  sketch.flip(direction, layers.p5)
  sketch.undo.takeSnapshot()
}

// TODO: the check for "inside of canvas" is missing, need to use a wrapper for those that need it?
const setupHotkeys = (config) => {
  const { sketch } = config
  const blob = { params: sketch.params, layers: sketch.layers, sketch }
  const shiftPressed = () => hotkeys.getPressedKeyCodes().includes(16)

  const keylist = [
    {
      keys: ['left', 'shift+left', 'right', 'shift+right'].join(','),
      action: ({ handler, extraShift }) => {
        const vector = (handler.key.includes('right')) ? 1 : -1
        sketch.shift(0, vector * extraShift)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['down', 'up', 'shift+down', 'shift+up'].join(','),
      action: ({ handler, extraShift }) => {
        const vector = (handler.key.includes('down')) ? 1 : -1
        sketch.shift(vector * extraShift, 0)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['del', 'backspace'].join(','),
      action: () => {
        sketch.clearCanvas()
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'a',
      action: ({ layers }) => {
        sketch.newCorner(layers.drawingLayer)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+e',
      actions: ({ params }) => {
        params.hardEdge = !params.hardEdge
      }
    },
    {
      keys: 'command+s',
      action: () => sketch.save_sketch()
    },
    {
      keys: 'shift+command+s',
      action: ({ params }) => { params.capturing = !params.capturing }
    },
    {
      keys: 'alt+s',
      action: () => sketch.shiftFillColors()
    },
    {
      keys: 'alt+shift+s',
      action: () => sketch.shiftOutlineColors()
    },
    {
      keys: 'alt+g',
      action: ({ params }) => {
        sketch.undo.takeSnapshot()
        sketch.adjustGamma(params.gamma)
      }
    },
    {
      keys: 'alt+t',
      action: () => sketch.target() // this doesn't really do anything yet....
    },
    {
      keys: ['f', 'shift+f'].join(','),
      action: () => {
        const vector = shiftPressed() ? VERTICAL : HORIZONTAL
        flip(blob)(vector)
      }
    },
    {
      keys: ['space'].join(','),
      action: ({ params }) => {
        sketch.paint(sketch.p5.mouseX, sketch.p5.mouseY, params)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['m'].join(','),
      action: ({ params }) => {
        sketch.nextDrawMode(1, params)
      }
    },
    {
      keys: ['shift+m'].join(','),
      action: ({ params }) => {
        sketch.nextDrawMode(-1, params)
      }
    },
    {
      keys: ['o', 'shift+o'].join(','),
      action: ({ params }) => {
        params.useOutline = !params.useOutline
      }
    },
    {
      keys: ['p'].join(','),
      action: ({ params }) => {
        params.target = !params.target
      }
    },
    {
      keys: ['q'].join(','),
      action: () => {
        sketch.rotateCanvas(1)
        // TODO: if not square, undo gets weird, here.....
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['shift+q'].join(','),
      action: () => {
        sketch.rotateCanvas(-1)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['r', 'shift+r'].join(','),
      action: ({ params, layers }) => {
        sketch.reset(params, layers.drawingLayer)
      }
    },
    // {
    //   keys: ['s', 'shift+s'].join(','),
    //   action: ({ params }) => {
    //     // TODO: this isn't really a GUI function
    //     // it's a PARAMS function
    //     sketch.guiControl.swapParams(params)
    //   }
    // },
    {
      keys: ['t'].join(','),
      action: ({ layers }) => {
        sketch.mirror(VERTICAL, layers.p5)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['shift+t'].join(','),
      action: ({ layers }) => {
        sketch.mirror(HORIZONTAL, layers.p5)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['u'].join(','),
      action: () => {
        sketch.undo.undo()
      }
    },
    {
      keys: ['shift+u'].join(','),
      action: () => {
        sketch.undo.redo()
      }
    },
    {
      keys: ['w', 'shift+w'].join(','),
      action: () => {
        // TODO: hrm. how do I do this, now? !!!
        // sketch.textManager.setText(sketch.guiControl.getBodyCopy())
      }
    },
    {
      keys: ['z'].join(','),
      action: () => {
        sketch.shift(0, -EXTRASHIFT)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['shift+z'].join(','),
      action: () => {
        sketch.shift(0, EXTRASHIFT)
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: ['g'].join(','),
      action: () => {
        sketch.randomLayer()
      }
    },
    {
      keys: ['shift+g'].join(','),
      action: () => {
        sketch.undo.takeSnapshot()
      }
    }
  ]

  keylist.forEach(ka =>
    hotkeys(ka.keys, (event, handler) => {
      event.preventDefault()
      const extraShift = shiftPressed() ? 100 : 10
      ka.action({ handler, extraShift, ...blob })
    }))

  const macroKeylist = [
    {
      keys: 'alt+1',
      action: () => {
        sketch.macros.macro1({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+2',
      action: () => {
        sketch.macros.macro19({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+3',
      action: () => {
        sketch.macros.macro21({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+4',
      action: () => {
        sketch.macros.macro16({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+5',
      action: () => {
        sketch.macros.macro17({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+6',
      action: () => {
        sketch.macros.macro18({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    },
    {
      keys: 'alt+7',
      action: () => {
        sketch.macros.macro25({ ...sketch })
        sketch.undo.takeSnapshot()
      }
    }
  ]

  macroKeylist.forEach(ka =>
    hotkeys(ka.keys, (event) => {
      event.preventDefault()
      ka.action()
    }))
}

export { setupHotkeys }
