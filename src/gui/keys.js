import hotkeys from 'hotkeys-js'

const EXTRASHIFT = 10
const HORIZONTAL = 0
const VERTICAL = 1

const flip = ({ layers, sketch }) => (direction) => {
  sketch.undo.takeSnapshot()
  sketch.flip({ axis: direction, layer: layers.p5 })
}

// TODO: the check for "inside of canvas" is missing, need to use a wrapper for those that need it?
const setupHotkeys = (pct) => {
  const blob = { params: pct.params, layers: pct.layers, sketch: pct }
  const shiftPressed = () => hotkeys.getPressedKeyCodes().includes(16)

  const keylist = [
    {
      keys: ['left', 'shift+left', 'right', 'shift+right'].join(','),
      action: ({ handler, extraShift }) => {
        pct.undo.takeSnapshot()
        const vector = (handler.key.includes('right')) ? 1 : -1
        pct.shift({ verticalOffset: 0, horizontalOffset: vector * extraShift })
      }
    },
    {
      keys: ['down', 'up', 'shift+down', 'shift+up'].join(','),
      action: ({ handler, extraShift }) => {
        pct.undo.takeSnapshot()
        const vector = (handler.key.includes('down')) ? 1 : -1
        pct.shift({ verticalOffset: vector * extraShift, horizontalOffset: 0 })
      }
    },
    {
      keys: ['del', 'backspace'].join(','),
      action: () => {
        pct.undo.takeSnapshot()
        pct.clearCanvas({ ...pct })
      }
    },
    {
      keys: 'a',
      action: ({ layers }) => {
        pct.undo.takeSnapshot()
        pct.newCorner(layers.drawingLayer)
      }
    },
    {
      keys: 'alt+e',
      action: ({ params }) => {
        params.hardEdge = !params.hardEdge
      }
    },
    {
      keys: 'command+s',
      action: () => pct.save_sketch()
    },
    {
      keys: 'shift+command+s',
      action: ({ params }) => { params.capturing = !params.capturing }
    },
    {
      keys: 'alt+s',
      action: () => pct.shiftFillColors()
    },
    {
      keys: 'alt+shift+s',
      action: () => pct.shiftOutlineColors()
    },
    {
      keys: 'alt+g',
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.adjustGamma({ gamma: params.gamma })
      }
    },
    {
      keys: 'alt+t',
      action: () => pct.target() // this doesn't really do anything yet....
    },
    {
      keys: ['f', 'shift+f'].join(','),
      action: () => {
        const vector = shiftPressed() ? VERTICAL : HORIZONTAL
        flip(blob)(vector)
      }
    },
    {
      // heyyyyyyyyyyy, this bypasses "save frames" .....
      keys: ['space'].join(','),
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.draw({ x: pct.p5.mouseX, y: pct.p5.mouseY, params, override: true })
        pct.savit({ params })
      }
    },
    {
      keys: ['m'].join(','),
      action: ({ params }) => {
        pct.nextDrawMode(1, params)
      }
    },
    {
      keys: ['shift+m'].join(','),
      action: ({ params }) => {
        pct.nextDrawMode(-1, params)
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
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.rotateCanvas({ direction: 1, height: params.height, width: params.width, layers: pct.layers })
        // pct.rotateWrapped({ direction: 1 })
        // TODO: if not square, undo gets weird, here.....
      }
    },
    {
      keys: ['shift+q'].join(','),
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.rotateCanvas({ direction: -1, height: params.height, width: params.width, layers: pct.layers })
        // pct.rotateWrapped({ direction: -1 })
      }
    },
    {
      keys: ['r', 'shift+r'].join(','),
      action: ({ params, layers }) => {
        pct.reset(params, layers.drawingLayer)
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
        pct.undo.takeSnapshot()
        pct.mirror({ axis: VERTICAL, layer: layers.p5 })
      }
    },
    {
      keys: ['shift+t'].join(','),
      action: ({ layers }) => {
        pct.undo.takeSnapshot()
        pct.mirror({ axis: HORIZONTAL, layer: layers.p5 })
      }
    },
    {
      keys: ['u'].join(','),
      action: () => {
        pct.undo.undo()
      }
    },
    {
      keys: ['shift+u'].join(','),
      action: () => {
        pct.undo.redo()
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
        pct.undo.takeSnapshot()
        pct.shift({ verticalOffset: 0, horizontalOffset: -EXTRASHIFT })
      }
    },
    {
      keys: ['shift+z'].join(','),
      action: () => {
        pct.undo.takeSnapshot()
        pct.shift({ verticalOffset: 0, horizontalOffset: EXTRASHIFT })
      }
    },
    {
      keys: ['g'].join(','),
      action: () => {
        pct.randomLayer()
      }
    },
    {
      keys: ['shift+g'].join(','),
      action: () => {
        pct.undo.takeSnapshot()
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
        pct.macros.gridHere({ ...pct })
      }
    },
    {
      keys: 'alt+2',
      action: () => {
        pct.macros.manyRandoms({ ...pct })
      }
    },
    {
      keys: 'alt+3',
      action: () => {
        pct.macros.smallRandomAtSomePlace({ ...pct })
      }
    },
    {
      keys: 'alt+4',
      action: () => {
        pct.macros.largestCircleWidth({ ...pct })
      }
    },
    {
      keys: 'alt+5',
      action: () => {
        pct.macros.thoseCircles({ ...pct })
      }
    },
    {
      keys: 'alt+6',
      action: () => {
        pct.macros.thoseCirclesBig({ ...pct })
      }
    },
    {
      keys: 'alt+7',
      action: () => {
        pct.macros.bigCircleLowerRightCenter({ ...pct })
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
