export default function Macros (pchrome) {
  const {
    drawGrid, drawCircle, drawRowCol,
    flipCore, layers, pushpop, paint, shift,
    apx, mirror, renderLayers, undo, randomLayer,
    HORIZONTAL, VERTICAL
  } = pchrome

  // TODO: record needs to happen here
  const macroWrapper = m => (pct) => {
    pct.undo.takeSnapshot()
    const { params, layers: { drawingLayer: layer }, p5, defaultParams } = pct
    layer.push()
    m({ params: JSON.parse(JSON.stringify(params)), layer, p5, defaultParams })
    if (m.name) {
      pct.recordAction({ action: 'macro', macro: m.name }, pct.appMode !== pct.APP_MODES.STANDARD_DRAW)
    }
    layer.pop()
  }

  const gridHere = macroWrapper(function gridHere ({ params, layer }) {
    drawGrid({ xPos: 20, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  const inset = macroWrapper(function inset ({ params, layer }) {
    const wOffset = layer.width / 2
    const hOffset = layer.height / 2
    layer.translate(wOffset / 2, hOffset / 2)
    // drawGrid({ xPos: 20, params, width: layer.width - wOffset * 2, height: layer.height - hOffset * 2, layer })
    drawGrid({ xPos: 20, params, width: wOffset, height: hOffset, layer, textManager: pchrome.textManager })
  })

  const fiveCircles = macroWrapper(function fiveCircles ({ params, layer }) {
    drawCircle({ xPos: 80, yPos: 90, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    drawCircle({ xPos: 50, yPos: 50, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    drawCircle({ xPos: 40, yPos: 40, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    drawCircle({ xPos: 30, yPos: 30, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    drawCircle({ xPos: 100, yPos: 100, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  const manyCircles = macroWrapper(function manyCircles ({ params, layer }) {
    for (let i = 1; i < layer.width; i += 10) {
      drawCircle({ xPos: i, yPos: i, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    }
  })

  // when INVERT is on THIS IS AMAZING
  // which suggests........
  const manyGrids = macroWrapper(function manyGrids ({ params, layer }) {
    params.invert = true
    for (let i = layer.width; i > layer.width / 2; i -= 80) {
      if (i < ((layer.width / 3) * 2)) { params.rotation = 90 }
      drawGrid({ xPos: i, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    }
  })

  const macro5 = macroWrapper(function macro5 ({ params, layer }) {
    drawGrid({ xPos: 4, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  const macro6 = macroWrapper(function macro6 ({ params, layer }) {
    for (let i = 1; i < layer.width; i += 5) {
      drawGrid({ xPos: i, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    }
  })

  const macro7 = macroWrapper(function macro7 ({ params, layer, p5, defaultParams }) {
    params.drawMode = 'Grid' // grid
    params.fill.paintMode = 'Black'
    params.fill.transparent = false
    params.useOutline = false
    params.nextCharMode = 'Sequential'
    params.fixedWidth = false
    const x = p5.mouseX
    layer.translate(0, 0)
    layer.resetMatrix()
    drawGrid({ xPos: x, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  const macro8 = macroWrapper(function macro8 ({ params }) {
    paint(36, 23, params)
  })

  const halfHeightGridAtMousePos = macroWrapper(function halfHeightGridAtMousePos ({ params, layer, p5 }) {
    const width = layer.width / 2
    const height = layer.height / 2
    const x = p5.mouseX
    const y = p5.mouseY
    layer.translate(x, y)
    drawGrid({ xPos: x, params, width, height, layer, textManager: pchrome.textManager })
  })

  // works GREAT with cumulativeRotation
  // only problem is the colors are identical no matter where
  const macro9 = macroWrapper(function macro9 ({ params, layer }) {
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
    // txls = [{x: 100, y: 100}]
    // width = 400
    // height = 400

    // if drawCircle is used, there is paramteter twiddling involced deep-down
    // that twiddling should be higher up somehow....

    // theres an inversion, not sure how to do it otherwise. AAARGH
    // gridFunc(stats.x, stats.y,
    // drawCircle(width - stats.x, height - stats.y,

    const paint = gridder(width, height, params, layer, gridConditionalRotationGen, drawGrid)
    apx(paint)(txls)
  })

  // works GREAT with cumulativeRotation
  // only problem is the colors are identical no matter where
  const subThingy = macroWrapper(({ params, layer }) => {
    // take these out of HERE
    // and macro9 then passes in params and width/height
    // but it should also indicate WHERE it should start
    // the below assumes subdivision of the entire surfae

    params.invert = true

    // an interesting standalone blob
    const txls = [{ x: 100, y: 100 }]
    const width = 400
    const height = 400

    const paint = gridder(width, height, params, layer, gridConditionalRotationGen, drawGrid)
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
      if (i < ((width / 3) * 2)) { stats.rotation = 90 }
      yield stats
    }
  }

  // gridder/subGrid paints a given region
  const gridder = (width, height, params, layer, gen, gridFunc) =>
    grid => subGrid(grid.x, grid.y, width, height, params, layer, gen, gridFunc)

  // TODO: subgrid should be a generator that we compose with dawgrid
  // because the generator (coupled with the xforms or size, above are the key elems)
  function subGrid (tx, ty, width, height, params, layer, gen, gridFunc) {
    pushpop(layer)(() => {
      layer.translate(tx, ty)

      // TODO: we're also adding in x,y to params, but they are ignored
      // STILL: pollution
      // const dg = stats => gridFunc(stats.x, stats.y, { ...params, ...stats }, width, height, layer)

      const dg = stats => gridFunc({ xPos: stats.x, params: { ...params, ...stats }, width, height, layer, textManager: pchrome.textManager })
      // drawGrid({ xPos: 20, params, width: layer.width / 2, height: layer.height / 2, layer })

      // const dg = (stats) => drawCircle(width - stats.x, height - stats.y, { ...params, ...stats }, width, height, layer)
      // drawCirle doesn't quite work (the inversion? something - every radius is negative, so goes to 0.1)
      // turn off inversion, it works better, but size is still too large. fiddle around.
      apx(dg)(gen(width))
    })()
  }

  const singleRow = macroWrapper(function singleRow ({ params, layer }) {
    params.rows = 1
    params.columns = 1
    params.nextCharMode = 'Word'
    params.fill.paintMode = 'solid'
    params.fill.color = params.fill.lerps[0]
    // TODO: first time this is called it used the wrong font. ?????
    // NOTE: params are set correctly. But the layer hasn't had it set (makes no sense)
    // TODO: fittext needs to be implemented - there's nothing in rowcol for words
    // which can be ugly, but.. .well, you know, so what!
    drawRowCol({ params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  const doubleMirror = macroWrapper(function doubleMirror ({ p5 }) {
    mirror({ axis: HORIZONTAL, layer: layers.p5 })
    mirror({ axis: VERTICAL, layer: layers.p5 })
  })

  const shiftToCenter = macroWrapper(function shiftToCenter ({ layer }) {
    // because density is 2, this is shifting by half
    const x = layer.width
    const y = layer.height
    shift({ verticalOffset: x, horizontalOffset: y })
  })

  const shiftRightHalfway = macroWrapper(function shiftRightHalfway ({ layer }) {
    // because density is 2, this is shifting by half
    const x = layer.width
    const y = 0
    shift({ verticalOffset: x, horizontalOffset: y })
  })

  const aRowColJoint = macroWrapper(function aRowColJoint ({ params, layer }) {
    layer.translate(200, 100)
    params.rows = 11
    params.columns = 15
    params.nextCharMode = 'Sequential'
    // TODO: fittext needs to be implemented - there's nothing in rowcol for words
    // which can be ugly, but.. .well, you know, so what!
    drawRowCol({ params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
  })

  // NOTE: the first parameter is the X-position
  // if it's 0, it's the upper-left - the circles are centered
  const largestCircleWidth = macroWrapper(function largestCircleWidth ({ params, layer }) {
    params.invert = true
    let exp = 1
    for (let radius = 0; radius < layer.width / 2; radius += 10 * exp) {
      exp = exp * 1.2
      drawCircle({ xPos: radius, yPos: radius, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
    }
  })

  const largestCircleCorner = macroWrapper(function largestCircleCorner ({ params, layer }) {
    params.invert = true
    const maxRadius = Math.hypot(layer.width, layer.height)
    let exp = 1
    for (let radius = 0; radius < maxRadius; radius += 20 * exp) {
      exp = exp * 1.1
      drawCircle({ xPos: radius, yPos: radius, params, width: maxRadius, height: layer.height, layer, textManager: pchrome.textManager })
    }
  })

  const thoseCircles = macroWrapper(function thoseCircles ({ params, layer, p5 }) {
    params.invert = true
    let exp = 1
    for (let radius = 0; radius < layer.width / 2; radius += 10 * exp) {
      exp = exp * 1.2
      if (p5.random() > 0.5) {
        const yPos = layer.width - (radius * 2) || 1 // for color
        drawCircle({ xPos: radius, yPos, params, width: layer.width, height: layer.height, layer, textManager: pchrome.textManager })
      }
    }
  })

  // 18
  const thoseCirclesBig = macroWrapper(function thoseCirclesBig ({ params, layer, p5 }) {
    params.invert = true
    const maxRadius = Math.hypot(layer.width, layer.height)

    const textSize = p5.random([5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 200, 300, 400])
    const arcOffset = 0 // 20
    const arcPercent = 100 // 50
    // NOTE: while this is roughly accurate at low sizes, it fails at larger sizes
    for (let radius = 0; radius < layer.width; radius += textSize) {
      if (p5.random() > 0.5) {
        const yPos = layer.width - (radius * 2) || 1 // for color
        drawCircle({ xPos: radius, yPos, params, width: maxRadius, height: maxRadius, layer, textSize, arcOffset, arcPercent, textManager: pchrome.textManager })
        // arcOffset += 20
      }
    }
  })

  const circlesOffsetArc = macroWrapper(function circlesOffsetArc ({ params, layer, p5 }) {
    params.invert = true
    const maxRadius = Math.hypot(layer.width, layer.height)

    const textSize = p5.random([5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 200, 300, 400])
    let arcOffset = 20
    const arcPercent = 50
    // NOTE: while this is roughly accurate at low sizes, it fails at larger sizes
    for (let radius = 0; radius < layer.width; radius += textSize) {
      if (p5.random() > 0.5) {
        const yPos = layer.width - (radius * 2) || 1 // for color
        drawCircle({ xPos: radius, yPos, params, width: maxRadius, height: maxRadius, layer, textSize, arcOffset, arcPercent, textManager: pchrome.textManager })
        arcOffset += 20
      }
    }
  })

  const bigCircleLowerRightCenter = macroWrapper(function bigCircleLowerRightCenter ({ params, layer, p5 }) {
    params.invert = true
    const center = { x: layer.width, y: layer.height }
    const maxRadius = Math.hypot(layer.width, layer.height)

    const textSize = p5.random([5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 200, 300, 400])
    // NOTE: while this is roughly accurate at low sizes, it fails at larger sizes
    for (let radius = 0; radius < maxRadius; radius += textSize) {
      if (p5.random() > 0.5) {
        const yPos = layer.width - (radius * 2) || 1 // for color
        drawCircle({ xPos: radius, yPos, params, width: maxRadius * 2, height: maxRadius * 2, layer, textSize, center, textManager: pchrome.textManager })
      }
    }
  })

  // centered on lower-right
  // now that drawCircle centers on width/height params (and not layer)
  const someCircles = macroWrapper(function someCircles ({ params, layer, p5 }) {
    p5.push()
    // layer.translate(layer.width / 3, 0)
    drawCircle({ xPos: 850, yPos: 50, params, width: layer.width * 2, height: layer.height * 2, layer, textSize: 15, textManager: pchrome.textManager })
    p5.pop()
  })

  const manyRandoms = macroWrapper(function manyRandoms () {
    for (let i = 0; i < 10; i++) { randomLayer() }
  })

  const smallRandomAtSomePlace = macroWrapper(function smallRandomAtSomePlace ({ layer, p5 }) {
    const img = p5.random(undo.history())
    layer.push()
    layer.resetMatrix()

    const originX = 100
    const originY = 100
    const targetWidth = 200
    const targetHeight = 400

    const img2 = p5.createGraphics(targetWidth, targetHeight)
    img2.pixelDensity(layer.pixelDensity())
    const zone = randomSection(targetWidth, targetHeight, img.width, img.height, p5)
    img2.copy(img, zone.sx, zone.sy, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight)

    layer.image(img2, originX, originY)
    img2.remove()
    layer.pop()
    renderLayers({ layers })
  })

  const randomSection = (targetWidth, targetHeight, imgWidth, imgHeight, p5) => {
    const fr = (min, max) => Math.floor(p5.random(min, max))
    const sx = fr(0, imgWidth - targetWidth)
    const sy = fr(0, imgHeight - targetHeight)
    return { sx, sy }
  }

  // const randomCornerQuads = macroWrapper((_, layer, p5) => {
  //   // TODO: one square, reflected at, or offset from, the corners
  // })

  // const randomSquaresOrSummat = macroWrapper((_, layer, p5) => {
  //   // TODO: random quadritlateral with no fade (maybe)
  // })

  const flipOverlay = macroWrapper(function flipOverlay ({ layer, p5 }) {
    p5.push()
    layer.translate(0, 0)
    layer.resetMatrix()
    const newLayer = flipCore(VERTICAL, layers.copy())
    const alpha = (0.5 * 255)
    p5.tint(255, alpha)
    layer.blendMode(p5.MULTIPLY) // on or off ???
    layer.image(newLayer, 0, 0)
    renderLayers({ layers })
    p5.pop()
  })

  return {
    gridHere,
    fiveCircles,
    manyCircles,
    manyGrids,
    macro5,
    macro6,
    macro7,
    macro8,
    macro9,
    halfHeightGridAtMousePos,
    singleRow,
    doubleMirror,
    shiftToCenter,
    shiftRightHalfway,
    aRowColJoint,
    largestCircleWidth,
    thoseCircles,
    thoseCirclesBig,
    manyRandoms,
    smallRandomAtSomePlace,
    flipOverlay,
    largestCircleCorner,
    someCircles,
    subThingy,
    bigCircleLowerRightCenter,
    circlesOffsetArc,
    inset
  }
}
