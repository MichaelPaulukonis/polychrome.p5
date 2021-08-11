const EXTRASHIFT = 10
const HORIZONTAL = 0
const VERTICAL = 1

const flip = ({ layers, sketch }) => (direction) => {
  sketch.undo.takeSnapshot()
  sketch.flip({ axis: direction, layer: layers.p5 })
}

const setupActions = (pct) => {
  const coinflip = () => pct.p5.random() > 0.5

  return [
    {
      action: () => {
        pct.undo.takeSnapshot()
        const vector = coinflip() ? 1 : -1
        const extraShift = coinflip() ? 100 : 10
        pct.shift({ verticalOffset: 0, horizontalOffset: vector * extraShift })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: () => {
        pct.undo.takeSnapshot()
        const vector = coinflip() ? 1 : -1
        const extraShift = coinflip() ? 100 : 10
        pct.shift({ verticalOffset: vector * extraShift, horizontalOffset: 0 })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: () => {
        pct.undo.takeSnapshot()
        pct.clearCanvas({ ...pct })
      }
    },
    {
      action: ({ layers }) => {
        pct.undo.takeSnapshot()
        pct.newCorner(layers.drawingLayer)
      }
    },
    {
      action: ({ params }) => {
        params.hardEdge = !params.hardEdge
      }
    },
    { action: () => pct.shiftFillColors() },
    { action: () => pct.shiftOutlineColors() },
    {
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.adjustGamma({ gamma: params.gamma })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: ({ layers, sketch }) => {
        const vector = coinflip() ? VERTICAL : HORIZONTAL
        flip({ layers, sketch })(vector)
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: ({ params }) => {
        pct.nextDrawMode(1, params)
      }
    },
    {
      action: ({ params }) => {
        pct.nextDrawMode(-1, params)
      }
    },
    {
      action: ({ params }) => {
        params.useOutline = !params.useOutline
      }
    },
    {
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.rotateCanvas({ direction: 1, height: params.height, width: params.width, layers: pct.layers })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: ({ params }) => {
        pct.undo.takeSnapshot()
        pct.rotateCanvas({ direction: -1, height: params.height, width: params.width, layers: pct.layers })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: ({ layers }) => {
        pct.undo.takeSnapshot()
        pct.mirror({ axis: VERTICAL, layer: layers.p5 })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: ({ layers }) => {
        pct.undo.takeSnapshot()
        pct.mirror({ axis: HORIZONTAL, layer: layers.p5 })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: () => {
        pct.undo.takeSnapshot()
        pct.shift({ verticalOffset: 0, horizontalOffset: -EXTRASHIFT })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: () => {
        pct.undo.takeSnapshot()
        pct.shift({ verticalOffset: 0, horizontalOffset: EXTRASHIFT })
        pct.globals.updatedCanvas = true
      }
    },
    {
      action: () => {
        pct.randomLayer()
        pct.globals.updatedCanvas = true
      }
    }
  ]
}

export { setupActions }
