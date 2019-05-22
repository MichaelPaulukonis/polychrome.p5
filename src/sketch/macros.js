
export default function Macros (sketch) {
  const { drawGrid, drawCircle, pushpop, paint, apx } = sketch

  const macroWrapper = (f) => (params, layer) => {
    layer.push()
    f({ ...params }, layer)
    layer.pop()
  }

  // these aren't "macros" as in recorded
  // but that's a hoped-for goal
  // in the meantime, they can be fun to use
  const macro1 = macroWrapper((params, layer) => {
    drawGrid(20, 10, params, layer.width, layer.height, layer)
  })

  const macro2 = macroWrapper((params, layer) => {
    drawCircle(89, 89, params, layer.width, layer.height, layer)
    drawCircle(50, 50, params, layer.width, layer.height, layer)
    drawCircle(40, 40, params, layer.width, layer.height, layer)
    drawCircle(30, 30, params, layer.width, layer.height, layer)
    drawCircle(100, 100, params, layer.width, layer.height, layer)
  })

  const macro3 = macroWrapper((params, layer) => {
    for (let i = 1; i < layer.width; i += 10) {
      drawCircle(i, i, params, layer.width, layer.height, layer)
    }
  })

  // when INVERT is on THIS IS AMAZING
  // which suggests........
  const macro4 = macroWrapper((params, layer) => {
    for (let i = layer.width; i > layer.width / 2; i -= 80) {
      if (i < ((layer.width / 3) * 2)) params.rotation = 90
      drawGrid(i, i, params, layer.width, layer.height, layer)
    }
  })

  const macro5 = macroWrapper((params, layer) => {
    drawGrid(4, 4, params, layer.width, layer.height, layer)
  })

  const macro6 = macroWrapper((params, layer) => {
    for (let i = 1; i < layer.width; i += 5) {
      drawGrid(i, layer.mouseY, params, layer.width, layer.height, layer)
    }
  })

  // overrides. interesting. WHA???
  // and we overwrite this definition immedately, anyway
  // I recall _something_ about this. but do not recall now
  // const macro7 = macroWrapper((params, layer, overrides) => {
  //   params = this.defaultParams
  //   params.drawMode = 1 // grid
  //   params.fill_paintMode = 4
  //   params.fill_transparent = false
  //   params.useOutline = false
  //   params.nextCharMode = 0
  //   params = { ...params, ...overrides }
  //   const x = layer.mouseX
  //   const y = layer.mouseY
  //   drawGrid(x, y, params, layer.width, layer.height, layer)
  // })

  const macro7 = macroWrapper((params, layer) => {
    const currParamsToKeep = {
      fixedWidth: params.fixedWidth,
      font: params.font
    }
    params = {...this.defaultParams, ...currParamsToKeep}
    params.drawMode = 1 // grid
    params.fill_paintMode = 4
    params.fill_transparent = false
    params.useOutline = false
    params.nextCharMode = 0
    params.fixedWidth = false
    const x = p5.mouseX // ugh, global
    const y = p5.mouseY
    drawGrid(x, y, params, layer.width, layer.height, layer)
  })

  const macro8 = macroWrapper((params, layer) => {
    paint(36, 23, params)
  })

  // const macro8 = macroWrapper((params, layer) => {
  //   const width = layer.width / 2
  //   const height = layer.height / 2
  //   const x = layer.mouseX
  //   const y = layer.mouseY
  //   layer.translate(x, y)
  //   drawGrid(x, y, params, width, height, layer)
  // })

  // works GREAT with cumulativeRotation
  // only problem is the colors are identical no matter where
  const macro9 = macroWrapper((params, layer) => {
  // take these out of HERE
  // and macro9 then passes in params and width/height
  // but it should also indicate WHERE it should start
  // the below assumes subdivision of the entire surfae

    params.invert = true
    const width = layer.width / 4
    const height = layer.height / 4
    const startX = 0 // mis-named
    const startY = 0 // mis-named - these are the indexes of the grids

    const txls = subGrids(layer.width, layer.height, width, height, startX, startY)

    // an interesting standalone blob
    // const txls = [{x: 100, y: 100}]
    // const width = 400
    // const height = 400

    const paint = gridder(width, height, params, layer, gridConditionalRotationGen)
    apx(paint)(txls)
  })

  function * subGrids (sourceWidth, sourceHeight, targetWidth, targetHeight, startX, startY) {
    for (let i = startX; i < sourceWidth / targetWidth; i++) {
      for (let j = startY; j < sourceHeight / targetHeight; j++) {
        yield { x: targetWidth * i, y: targetHeight * j }
      }
    }
    return 'done'
  }

  // the weird thing here is the rotation
  function * gridConditionalRotationGen (width) {
    for (let i = width; i > width / 2; i -= 40) {
      const stats = { x: i, y: i, rotation: 0 }
      if (i < ((width / 3) * 2)) stats.rotation = 90
      yield stats
    }
  }

  // gridder/subGrid paints a given region
  const gridder = (width, height, params, layer, gen) => (grid) => subGrid(grid.x, grid.y, width, height, params, layer, gen)

  // TODO: subgrid should be a generator that we compose with dawgrid
  // because the generator (coupled with the xforms or size, above are the key elems)
  function subGrid (tx, ty, width, height, params, layer, gen) {
    pushpop(layer)(() => {
      layer.translate(tx, ty)

      // TODO: we're also adding in x,y to params, but they are ignored
      // STILL: pollution
      const dg = (stats) => drawGrid(stats.x, stats.y, { ...params, ...stats }, width, height, layer)
      // const dg = (stats) => drawCircle(width - stats.x, height - stats.y, { ...params, ...stats }, width, height, layer)
      // drawCirle doesn't quite work (the inversion? something - every radius is negative, so goes to 0.1)
      // turn off inversion, it works better, but size is still too large. fiddle around.
      apx(dg)(gen(width))
    })()
  }

  return {
    macro1,
    macro2,
    macro3,
    macro4,
    macro5,
    macro6,
    macro7,
    macro8,
    macro9
  }
}
