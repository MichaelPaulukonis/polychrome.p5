import UndoLayers from './undo.layers.js'
import Layers from './layers.js'
import { fitTextOnCanvas } from './fit.text'
import {
  allParams,
  fillParams,
  outlineParams,
  drawModes,
  globals
} from '@/src/params.js'
import { hexStringToColors } from '@/src/gui/gui.color.control'
import { setupGui } from '@/src/gui/gui'
import { recordAction, recordConfig, output, clear as clearRecording } from '@/src/record'
import saveAs from 'file-saver'
import { datestring, filenamer } from './filelib'
import { setupActions } from '@/src/gui/actions'
import { createColorFunctions, createGammaAdjustment, initializeColorMode } from '@/src/color/color-system'

const fonts = require.context('@/assets/fonts', false, /\.ttf$/)

let namer = null

export default function Sketch ({ p5Instance: p5, guiControl, textManager, setupCallback }) {
  const params = allParams
  const pct = {}

  const density = 2

  let layers
  let colorSystem
  let adjustGamma
  let undo

  const fontList = {}

  // TODO: we can clean this up to be simpler and consistent
  // POC it works
  const loadedFonts = fonts.keys().map(f => f.replace(/\.\/(.*?)\.ttf/, '$1'))

  let imgMask
  p5.preload = () => {
    loadedFonts.forEach((font) => {
      fontList[font] = p5.loadFont(require(`@/assets/fonts/${font}.ttf`))
    })
    imgMask = p5.loadImage(require('~/assets/9-96398_http-landrich-black-gradient-border-transparent.png'))
  }

  // because the image I got was inverted from what I need.
  const invertMask = () => {
    imgMask.loadPixels()
    for (let i = 3; i < imgMask.pixels.length; i += 4) {
      imgMask.pixels[i] = 255 - imgMask.pixels[i]
    }
    imgMask.updatePixels()
  }

  const APP_MODES = {
    STANDARD_DRAW: 'standard drawing mode',
    TARGET: 'select a point on canvas',
    NO_DRAW: 'no drawing for some reason',
    PLAYBACK: 'replaying a paint script'
  }

  p5.setup = () => {
    invertMask()
    p5.pixelDensity(density)
    // TODO: so, you were wondering why there were too many canvases? !!!
    p5.createCanvas(params.width, params.height) // canvas 1
    const drawingLayer = initDrawingLayer(params.width, params.height) // canvas 2
    const tempLayer = initDefaultLayer(params.width, params.height) // canvas 3
    pct.layers = layers = new Layers(p5, drawingLayer, tempLayer)

    // Initialize color system
    colorSystem = createColorFunctions(p5, layers)

    // Initialize gamma adjustment with dependencies
    adjustGamma = createGammaAdjustment({
      layers,
      recordAction,
      globals,
      renderLayers,
      get appMode () { return pct.appMode },
      APP_MODES
    })

    const { shiftFillColors, shiftOutlineColors } = setupGui({ p5, sketch: pct, params, fillParams: params.fill, outlineParams: params.outline })
    pct.shiftFillColors = shiftFillColors
    pct.shiftOutlineColors = shiftOutlineColors

    pct.clearCanvas({ layers: pct.layers, params: pct.params })
    undo = new UndoLayers(layers, renderLayers, 10)
    pct.undo = undo
    undo.takeSnapshot()
    pct.appMode = APP_MODES.STANDARD_DRAW

    params.fill = fillParams
    params.outline = outlineParams
    pct.defaultParams = JSON.parse(JSON.stringify(params))
    setupCallback(pct)
    recordConfig(pct.params, pct.appMode === APP_MODES.STANDARD_DRAW)
  }

  // NOTE: not working
  // swap paint (fill/stroke) params
  // pct.swapParams = () => {
  //   const temp = { ...pct.params.fill }
  //   pct.params.fill = { ...pct.params.outline }
  //   pct.params.outline = temp
  //   console.log('flipped!')
  // }

  const mouseInCanvas = () => {
    return p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
  }

  const standardDraw = ({ x, y, override, params } = { x: p5.mouseX, y: p5.mouseY, override: false, params: pct.params }) => {
    if (override || (p5.mouseIsPressed && mouseInCanvas())) {
      recordConfig(params, pct.appMode !== APP_MODES.STANDARD_DRAW)
      recordAction({ x, y, action: 'paint' }, pct.appMode !== APP_MODES.STANDARD_DRAW)
      paint(x, y, params)
      globals.updatedCanvas = true
    }
  }

  const saver = (canvas, name) => {
    canvas.toBlob(blob => saveAs(blob, name))
  }

  const savit = ({ params }) => {
    if (params.playbackSave || (params.capturing && globals.updatedCanvas)) {
      params.playbackSave = false
      globals.updatedCanvas = false
      if (namer === null) {
        namer = filenamer(datestring())
      }
      console.log('saving canvas: ' + globals.captureCount)

      saver(pct.layers.p5.drawingContext.canvas, namer() + '.png')

      globals.captureCount += 1
      if (globals.captureCount > pct.params.captureLimit) {
        params.capturing = false
        p5.frameRate(pct.params.p5frameRate)
        globals.captureCount = 0
      }
    }
  }

  p5.draw = () => {
    if (pct.params.autoPaint) {
      autoDraw(0, 0, p5.width, p5.height)
    } else {
      // increment incremental things
      increment(pct.params)

      switch (pct.appMode) {
        case APP_MODES.NO_DRAW:
          return
        case APP_MODES.PLAYBACK:
          pct.playback.next()
          break
        case APP_MODES.STANDARD_DRAW:
        default:
          standardDraw()
          break
      }
    }
    savit({ params: pct.params })
  }

  /**
 *
 *
 *
 * func(colorAlpha(params.color, transparency))}
 *
 * var i = 0, colour;
for (; i < 16777216; ++i) { // this is a BIG loop, will freeze/crash a browser!
    colour = '#' + ('00000' + i.toString(16)).slice(-6); // pad to 6 digits
    // #000000
    // #000001
    // ... #000100 ...
    // #FFFFFE
    // #FFFFFF
} you know, maybe I should this in a sketch.....
 */

  const increment = (params) => {
    // TODO: implement something to move from value A to value B over set of steps
    pct.skewCollection.forEach(skew => {
      // TODO: iterate each
      skew.next()
    })
  }

  p5.mousePressed = () => {
    if (mouseInCanvas()) {
      pct.undo.takeSnapshot()
    }
  }

  // TODO: perlin noise on the randoms, with jumps every n frames
  // random application of other controls (macros, etc ?)
  // rotate canvas, mirror, etc.
  // Can we move this out of here, like playback?
  const actions = setupActions(pct)

  const autoDraw = (minX, minY, maxX, maxY) => {
    if (p5.random(0, 10) < 1) {
      const mList = Object.keys(pct.macros)
      const macroName = p5.random(mList)
      pct.macros[macroName]({ ...pct })
    } else if (p5.random(0, 10) < 1) {
      const blob = { params: pct.params, layers: pct.layers, sketch: pct }
      p5.random(actions).action({ ...blob })
      return
    } else {
      const locX = p5.random(minX, maxX)
      const locY = p5.random(minY, maxY)
      standardDraw({ x: locX, y: locY, override: true, params: pct.params })
    }
    globals.updatedCanvas = true
  }

  // this was a POC-WIP for picking the center for various operations
  // never finished
  const target = () => {
    const layer = layers.copy()

    p5.image(layer)
    // layers.tempLayer.clear()
    const x = p5.mouseX
    const y = p5.mouseY
    p5.line(0, y, p5.width, y) // line(0, y, width, y);
    p5.line(x, 0, x, p5.height) // line(0, y, width, y);
    layer.remove()
  }

  const apx = (...fns) => list => [...list].map(b => fns.forEach(f => f(b)))

  const pushpop = l => f => () => {
    l.push()
    f()
    l.pop()
  }

  const renderLayers = ({ layers }) => {
    renderTarget({ layers })
  }

  const renderTarget = ({ layers }) => {
    layers.p5.image(layers.drawingLayer, 0, 0)
    layers.drawingLayer.clear()
  }

  const clearCanvas = ({ layers, params }) => {
    recordAction({ action: 'clearCanvas', layers: 'layers' }, pct.appMode !== APP_MODES.STANDARD_DRAW)
    const color = params.fill.color
    clear(layers.drawingLayer, color)
    clear(layers.p5, color)

    initializeColorMode(layers.drawingLayer, p5, params)
  }

  const clear = (layer, color) => {
    layer.resizeCanvas(pct.params.width, pct.params.height)
    layer.pixelDensity(density)
    layer.background(color)
  }

  const setFont = (font, layer = layers.drawingLayer) => {
    // how clumsy! but as a POC it works
    const tf = (loadedFonts.includes(font)) ? fontList[font] : font
    layer.textFont(tf)
  }

  const initDefaultLayer = (w, h) => {
    const layer = p5.createGraphics(w, h)
    layer.pixelDensity(density)
    return layer
  }

  const initDrawingLayer = (w, h) => {
    const layer = initDefaultLayer(w, h)
    setFont(params.font, layer)
    layer.textAlign(p5.CENTER, p5.CENTER)
    initializeColorMode(layer, p5, params)

    return layer
  }

  const paint = (xPos, yPos, params) => {
    setFont(params.font, layers.drawingLayer)
    const draw = params.drawMode === 'Grid'
      ? drawGrid
      : params.drawMode === 'Circle'
        ? drawCircle
        : drawRowCol
    draw({ xPos, yPos, params, width: params.width, height: params.height, layer: layers.drawingLayer })
  }

  const textGetter = (textMode, t) => {
    const tm = textMode.toLowerCase()
    const tfunc = tm === 'sequential'
      ? t.getchar
      : tm === 'random'
        ? t.getcharRandom
        : t.getWord
    return tfunc
  }

  // originally from http://happycoding.io/examples/processing/for-loops/letters
  // a reminder of something simpler
  const drawRowCol = ({ params, width, height, layer }) => {
    const rows = params.rows
    const cols = params.columns // tidally lock them together for the time being.

    const cellHeight = height / rows
    const cellWidth = width / cols

    layer.textAlign(layer.CENTER, layer.CENTER)

    // this kept ending up being almost the same as cellWidth everytime
    // so I just went with the fudge factor. :::sigh:::
    // doh! if it's a single thing, we need a word. ugh. not now...
    // let fontSize = fitTextOnCanvas('.', params.font, cellWidth, layer)
    // // layer.textSize(cellWidth * 1.5)
    // layer.textSize(fontSize)
    const sw = params.useOutline
      ? params.outline.strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline.strokeJoin)
    const fetchText = textGetter(params.nextCharMode, textManager)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let pixelX = cellWidth * x
        let pixelY = cellHeight * y

        pixelX += cellWidth / 2
        pixelY += cellHeight / 2

        colorSystem.setFillMode(pixelX, pixelY, params.fill, hexStringToColors)
        colorSystem.setOutlineMode(pixelX, pixelY, params.outline, hexStringToColors)

        let txt = fetchText()
        if (cols === 1 && txt.trim() === '') {
          txt = fetchText() // quick hack to skip spaces on single column mode
        }
        const fontSize = fitTextOnCanvas(txt, params.font, cellWidth, layer)
        layer.textSize(fontSize)

        const cum = trText(layer)(pixelX, pixelY, 0, 0, txt)
        const norm = pushpop(layer)(trText(layer)(0, 0, pixelX, pixelY, txt))
        params.cumulativeRotation ? cum() : norm()

        // the whole block is rotated. which is ... interesting....
        // because of the push/pop
        // const doit = () => {
        //   p5.rotate(p5.radians(params.rotation))
        //   p5.text(fetchText(), pixelX, pixelY)
        // }
        // pushpop(p5)(doit)()
      }
    }
    renderLayers({ layers })
  }

  const maxUnlessLessThan = (val, min) => val < min ? min : val

  const textSizeCircle = (xPos) => {
    const tx = xPos / 2
    return maxUnlessLessThan(tx, 1)
  }

  // NOTE: yPos is only used for color context....
  const drawCircle = ({ xPos, yPos, params, width, layer, textSize, sizer, center, arcPercent = 100, arcOffset = params.arcOffset || 0 }) => {
    sizer = sizer || textSizeCircle
    const ts = textSize || sizer(xPos)
    layer.textSize(ts)

    layer.push()
    // separating out translation from layer or width/height
    // allows for non-center positioning
    if (center) {
      layer.translate(center.x, center.y)
    } else {
      layer.translate(layer.width / 2, layer.height / 2) // center of layer
      // layer.translate(0, 0) //  upper-left - we can change this around
    }

    const sw = params.useOutline
      ? params.outline.strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline.strokeJoin)

    colorSystem.setFillMode(xPos, yPos, params.fill, hexStringToColors)
    colorSystem.setOutlineMode(xPos, yPos, params.outline, hexStringToColors)

    const nextText = textGetter(params.nextCharMode, textManager)
    circlePainter({ params, layer, xPos, nextText, width, arcOffset, arcPercent })
    layer.pop()
    renderLayers({ layers })
  }

  const circlePainter = ({ params, layer, xPos, nextText, width, arcOffset, arcPercent }) => {
    const radius = getRadius(params, width, xPos)
    const paint = bloc => circlePaintAction(layer)(radius, params)(bloc.theta, bloc.text)
    const blocGen = gimmeCircleGenerator({ radius, nextText, layer, arcOffset, arcPercent })
    apx(paint)(blocGen)
  }

  const getRadius = (params, width, xPos) => {
    const radius = params.invert ? (width / 2) - xPos : xPos
    return radius < 0.1 ? 0.1 : radius
  }

  // generator returns { theta, text }
  // and circlePaintActions intake radius, params, theta, text
  // so, need to move some things about
  // const paint = ((step, layer, params) => (bloc) => paintActions(bloc.x, bloc.y, step, layer, params, bloc.text))(step, p5, params)
  const gimmeCircleGenerator = ({ radius, nextText, layer, arcOffset, arcPercent }) => {
    const circumference = (2 * Math.PI * radius) * (arcPercent / 100)
    return blocGeneratorCircle({ radius, circumference, arcOffset })(nextText, layer)
  }

  // generator will return { theta, text }
  const blocGeneratorCircle = ({ radius, circumference, arcOffset = 0 }) => {
    return function * (nextText, l) {
      let arclength = arcOffset
      while (arclength < circumference + arcOffset) {
        const t = nextText()
        const w = l.textWidth(t)
        arclength += w / 2
        // Angle in radians is the arclength divided by the radius
        // Starting on the left side of the circle by adding PI
        const theta = Math.PI + arclength / radius
        yield { theta, text: t }
        arclength += w / 2
      }
      return 'done'
    }
  }

  const circlePaintAction = (layer = p5) => (radius, params) => (theta, currentchar) => {
    if (!params.cumulativeRotation) { layer.push() }
    // Polar to cartesian coordinate conversion
    layer.translate(radius * layer.cos(theta), radius * layer.sin(theta))
    layer.rotate(theta + Math.PI / 2 + layer.radians(params.rotation))
    layer.text(currentchar, 0, 0)
    if (!params.cumulativeRotation) { layer.pop() }
  }

  const defaultGridParm = (xPos, height, width) => {
    const step = xPos + 5
    return {
      step,
      condy: y => y < height,
      condx: x => x < width,
      changey: y => y + step,
      changex: x => x + step,
      initY: 0,
      initX: 0
    }
  }

  const invertGridParm = (xPos, height, width) => {
    const step = width - xPos + 5
    return {
      step,
      condy: y => y > 0,
      condx: x => x > 0,
      changey: y => y - step,
      changex: x => x - step,
      initY: height,
      initX: width
    }
  }

  const shadowDefault = {
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: p5.color('transparent')
  }

  const setShadows = (layer, inParams) => {
    const params = inParams.useShadow ? { ...{}, ...inParams } : { ...{}, ...shadowDefault }

    layer.drawingContext.shadowOffsetX = params.shadowOffsetX
    layer.drawingContext.shadowOffsetY = params.shadowOffsetY
    layer.drawingContext.shadowBlur = params.shadowBlur
    layer.drawingContext.shadowColor = params.shadowColor
  }

  // alternatively http://happycoding.io/examples/processing/for-loops/letters
  // cleaner?
  const drawGrid = ({ xPos, params, width, height, layer }) => {
    xPos = xPos < 5 ? 5 : xPos // prevent negatives and too-too tiny letters

    setShadows(layer, params)

    layer.push()
    layer.translate(params.inset, params.inset)
    width = width - (params.inset * 2)
    height = height - (params.inset * 2)

    // THIS SHOULD ALL BE DEFAULT STUFF DONE COMONLY
    const gridParams = params.invert ? invertGridParm(xPos, height, width) : defaultGridParm(xPos, height, width)
    layer.textSize(gridParams.step)
    // layer.textSize(18)
    layers.p5.textSize(gridParams.step) // this is .... weird. Look at the p5js code. Something funky with textAscent going to the parent, which is set to 12

    const sw = params.useOutline
      ? params.outline.strokeWeight
          ? params.outline.strokeWeight
          : (gridParams.step / 5)
      : 0
    layer.strokeWeight(sw / 4)
    layer.strokeJoin(params.outline.strokeJoin)

    // TODO: there is something fundamentally different from the "original" implementation
    // unless original ONLY had fixed-width? (May be the case!)
    if (params.fixedWidth) {
      layer.textAlign(layer.CENTER, layer.CENTER)
    } else {
      layer.textAlign(layer.LEFT, layer.BOTTOM)
    }

    const nextText = textGetter(params.nextCharMode, textManager)
    const fill = bloc => colorSystem.setFillMode(bloc.x, bloc.y, params.fill, hexStringToColors)
    const outline = params.useOutline ? bloc => colorSystem.setOutlineMode(bloc.x, bloc.y, params.outline, hexStringToColors) : () => { }
    const step = (params.fixedWidth) ? gridParams.step : 0
    const paint = ((step, layer, params) => bloc => paintActions(bloc.x, bloc.y, step, layer, params, bloc.text))(step, layer, params)
    const yOffset = getYoffset(layer.textAscent(), 0) // only used for TextWidth
    // TODO: also the alignments above. ugh
    const blocGen = (params.fixedWidth)
      ? blocGeneratorFixedWidth(gridParams, nextText)
      : blocGeneratorTextWidth(nextText, { width, height }, yOffset, layer) // whonly needs to be reworked
    apx(fill, outline, paint)(blocGen)
    renderLayers({ layers })
    layer.pop()
  }

  const blocGeneratorFixedWidth = function * (gridParams, nextText) {
    for (let gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
      for (let gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
        const t = nextText()
        yield { x: gridX, y: gridY, text: t }
      }
    }
    return 'done'
  }

  const blocGeneratorTextWidth = function * (nextText, gridSize, yOffset, layer) {
    let t = nextText()
    let coords = { x: 0, y: yOffset }
    const offsets = { x: 0, y: yOffset }
    while (hasNextCoord(coords, gridSize, yOffset)) {
      yield { x: coords.x, y: coords.y, text: t }
      offsets.x = layer.textWidth(t)
      coords = nextCoord(coords, offsets, gridSize.width)
      t = nextText()
      if (t === ' ' && coords.x === 0) { t = nextText() }
    }
    return 'done'
  }

  const getYoffset = (textAscent, heightOffset) => {
    let yOffset = textAscent + heightOffset
    yOffset = (yOffset > 2) ? yOffset : 3
    return yOffset
  }

  const hasNextCoord = (coords, gridSize, yOffset) => {
    return coords.x < gridSize.width && (coords.y - yOffset) < gridSize.height
  }

  const nextCoord = (coords, offsets, gridWidth) => {
    const nc = { ...coords }
    nc.x = nc.x + offsets.x
    if (nc.x + (0.25 * offsets.x) > gridWidth) {
      nc.x = 0
      nc.y = nc.y + offsets.y
    }
    return nc
  }

  // translate, rotate, text
  const trText = (layer, rotation) => (x, y, tx, ty, txt) => () => {
    // think I'm over-thinking pct. Original version was easier to understand
    if (tx !== 0 || ty !== 0) {
      layer.translate(tx, ty)
    }
    layer.rotate(layer.radians(rotation))
    // layer.push()
    // let mx = p5.map(tx, 0, p5.width, 0, 5)
    // let my = p5.map(ty, 0, p5.height, 0, 5)
    // layer.scale(mx, my)
    layer.text(txt, x, y)
    // layer.pop()
  }

  // hrm. still seems like this could be simpler
  const paintActions = (gridX, gridY, step, layer, params, txt) => {
    const cum = trText(layer, params.rotation)(gridX, gridY, 0, 0, txt)
    const norm = pushpop(layer)(trText(layer, params.rotation)(0, 0, gridX + step / 4, gridY + step / 5, txt))
    params.cumulativeRotation ? cum() : norm()
  }

  // TODO: hah this will not work
  const nextDrawMode = (direction, params) => {
    let drawMode = params.drawMode
    drawMode = (drawMode + direction) % drawModes.length
    if (drawMode < 0) { drawMode = drawModes.length - 1 }
    params.drawMode = drawMode
  }

  const nextRotation = (direction, params) => {
    const step = 5
    params.rotation = (params.rotation + step * direction) % 360
    if (params.rotation > 360) { params.rotation = 360 }
    if (params.rotation < -360) { params.rotation = -360 }
  }

  // only resets the angle, for now...
  const reset = (params, layer) => {
    params.rotation = 0
    layer.translate(0, 0)
    layer.resetMatrix()
  }

  const HORIZONTAL = 0 // up=>down
  const VERTICAL = 1 // left=>right
  const flip = ({ axis, layer }) => {
    recordAction({ axis, layer, action: 'flip' }, pct.appMode !== APP_MODES.STANDARD_DRAW)

    const newLayer = flipCore(axis, layers.copy())
    layer.image(newLayer, 0, 0)
    renderLayers({ layers })
    newLayer.remove()
    globals.updatedCanvas = true
  }

  const flipCore = (axis = VERTICAL, g) => {
    const tmp = layers.clone(g)
    tmp.push()
    tmp.translate(0, 0)
    tmp.resetMatrix()
    if (axis === HORIZONTAL) {
      tmp.translate(0, tmp.height)
      tmp.scale(1, -1)
    } else {
      tmp.translate(tmp.width, 0)
      tmp.scale(-1, 1)
    }
    tmp.image(g, 0, 0, tmp.width, tmp.height)
    tmp.pop()
    return tmp
  }

  const mirror = (cfg = { axis: VERTICAL, layer: layers.p5 }) => {
    recordAction({ ...cfg, action: 'mirror' }, pct.appMode !== APP_MODES.STANDARD_DRAW)

    const tmp = layers.copy()
    const newLayer = mirrorCore(cfg.axis, tmp)
    cfg.layer.image(newLayer, 0, 0)
    renderLayers({ layers })
    newLayer.remove()
    tmp.remove()
    globals.updatedCanvas = true
  }

  const mirrorCore = (axis = VERTICAL, g) => {
    const tmp = flipCore(axis, g)
    if (axis === HORIZONTAL) {
      g.image(tmp, 0, g.height / 2, g.width, g.height / 2, 0, g.height / 2, g.width, g.height / 2)
    } else {
      g.image(tmp, g.width / 2, 0, g.width / 2, g.height, g.width / 2, 0, g.width / 2)
    }
    tmp.remove()
    return g
  }

  // shift pixels in image
  // I'd love to be able to drag the image around, but I think that will require something else, but related
  const shift = (cfg = { verticalOffset: 0, horizontalOffset: 0 }) => {
    recordAction({ ...cfg, action: 'shift' }, pct.appMode !== APP_MODES.STANDARD_DRAW)

    // TODO: has to be pointing to the drawingLayer
    const context = layers.p5.drawingContext
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

    const cw = (cfg.horizontalOffset > 0 ? context.canvas.width : -context.canvas.width)
    const ch = (cfg.verticalOffset > 0 ? context.canvas.height : -context.canvas.height)

    context.putImageData(imageData, 0 + cfg.horizontalOffset, 0 + cfg.verticalOffset)
    if (cfg.horizontalOffset !== 0) {
      context.putImageData(imageData, 0 + cfg.horizontalOffset - cw, 0 + cfg.verticalOffset)
    }
    if (cfg.verticalOffset !== 0) {
      context.putImageData(imageData, 0 + cfg.horizontalOffset, 0 + cfg.verticalOffset - ch)
    }
    context.putImageData(imageData, 0 - cw + cfg.horizontalOffset, 0 - ch + cfg.verticalOffset)
    renderLayers({ layers })
    globals.updatedCanvas = true
  }

  pct.save_sketch = () => {
    const getDateFormatted = () => {
      const d = new Date()
      const df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
      return df
    }

    const pad = (nbr, width, fill = '0') => {
      nbr = nbr + ''
      return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
    }
    p5.saveCanvas(`${params.name}.${getDateFormatted()}.png`)
  }

  // not used, and params not defined
  // .... these are from that other project ???
  pct.saveAnimationFrames = () => {
    if (params.capturing) {
      params.captureOverride = false
      p5.frameRate(params.p5frameRate)
    } else {
      namer = filenamer('polychrometext.' + datestring())
      params.captureCount = 0
      params.captureOverride = true
      p5.frameRate(params.captureFrameRate)
    }
    params.capturing = !params.capturing
  }

  // TODO: use this somehow.
  // but make mouse start from regular place?
  // NOTE: doesn't work all that well if canvas is not square....
  // We'd have to do something with the calculations to use the "new" rectangle -
  // it's essentially rotating the canvas
  const newCorner = (layer) => {
    layer.translate(layer.width, 0)
    layer.rotate(layer.radians(90))
  }

  // rotates canvas 90 degrees in specified direction
  // direction: 1 for clockwise, -1 for counter-clockwise
  const rotateCanvas = ({ direction = 1, height, width, layers, p5 }) => {
    recordAction({ action: 'rotateCanvas', direction, height, width }, pct.appMode !== APP_MODES.STANDARD_DRAW)

    // Store current canvas content in drawing layer before resize
    layers.drawingLayer.resetMatrix()
    layers.drawingLayer.image(p5, 0, 0)

    // Swap dimensions for 90-degree rotation
    const newWidth = height
    const newHeight = width

    // Update params to reflect new dimensions
    pct.params.width = newWidth
    pct.params.height = newHeight

    // Resize main canvas (this clears it as a side-effect)
    p5.resizeCanvas(newWidth, newHeight)

    // Create new graphics layer for rotated content
    const newPG = initDrawingLayer(newWidth, newHeight)
    newPG.push()

    // Set rotation origin based on direction
    if (direction === -1) {
      newPG.translate(0, newHeight)
    } else {
      newPG.translate(newWidth, 0)
    }

    // Apply 90-degree rotation and draw stored content
    newPG.rotate(p5.radians(90 * direction))
    newPG.image(layers.drawingLayer, 0, 0)
    newPG.pop()

    // Replace old drawing layer with rotated version
    layers.drawingLayer.remove()
    layers.drawingLayer = newPG

    // Note: Undo system doesn't track rotation operations
    renderLayers({ layers })
    globals.updatedCanvas = true
  }

  // Wrapper function that provides simplified interface
  const rotateWrapped = (direction = 1) => {
    return rotateCanvas({
      direction,
      height: pct.params.height,
      width: pct.params.width,
      layers: pct.layers,
      p5: pct.layers.p5
    })
  }

  const coinflip = () => pct.p5.random() > 0.5

  // place image from history into location in current image
  // with (optional) rotation, transparency, mask and size
  const randomLayer = (cfg = {}) => {
    const img = pct.p5.random(pct.undo.history())
    layers.drawingLayer.push()
    pct.p5.push()

    try {
      layers.drawingLayer.resetMatrix()

      // can be negative, but to appear it depends on the size percentage
      const pctSize = cfg.percentSize || percentSize()
      // this is an approximation, an does not take rotation into account
      const size = { width: pct.p5.width * pctSize, height: pct.p5.height * pctSize }
      const offsetSize = { width: size.width * 0.75, height: size.height * 0.75 }
      const originX = cfg.originX || pct.p5.random(-offsetSize.width, pct.p5.width + offsetSize.width) // should be able to go BACK and UP as well
      const originY = cfg.originY || pct.p5.random(-offsetSize.height, pct.p5.height + offsetSize.height)
      layers.drawingLayer.translate(originX, originY)
      // TODO: hrm. maybe there could be some more options, here?

      const rotateP = cfg.rotateP || coinflip()
      const radians = cfg.radians || pct.p5.random(360)
      if (rotateP) { layers.drawingLayer.rotate(pct.p5.radians(radians)) }
      // this is a POC
      // I'd like to explore gradients or other masks for transparency
      const alpha = cfg.alpha || pct.p5.random(255)

      // hey! the density is all off, here
      const img2 = layers.p5.createGraphics(img.width, img.height)

      img2.copy(img, 0, 0, img.width, img.height, 0, 0, img.width * pctSize, img.height * pctSize)
      if (!params.hardEdge) {
        const mask2 = layers.p5.createImage(img.width, img.height)
        mask2.copy(imgMask, 0, 0, img.width, img.height, 0, 0, img.width * pctSize, img.height * pctSize)
        img2.mask(mask2) // TODO: need to modify by size, as well
      }

      pct.p5.tint(255, alpha)
      setShadows(layers.drawingLayer, params)

      layers.drawingLayer.image(img2, 0, 0)
      renderTarget({ layers }) // not all layers - skip clearing and background, thus allowing an overlay

      recordAction({ action: 'randomLayer', percentSize: pctSize, originX, originY, rotateP, radians, alpha }, pct.appMode !== APP_MODES.STANDARD_DRAW)
    } catch (e) {
      console.log(e)
    } finally {
      pct.p5.pop()
      layers.drawingLayer.pop()
    }
    globals.updatedCanvas = true
  }

  const percentSize = () => {
    const sizes = [0.25, 0.5, 0.75, 1.0, 1.5, 2]
    const size = pct.p5.random(sizes)
    return size
  }

  pct.stop = (mode = APP_MODES.NO_DRAW) => {
    pct.appMode = mode
    if (mode === APP_MODES.PLAYBACK) return
    p5.noLoop()
  }

  pct.start = (mode = APP_MODES.STANDARD_DRAW) => {
    pct.appMode = mode
    p5.loop()
  }

  // this smells, but is a start of separation
  pct.adjustGamma = adjustGamma
  pct.apx = apx
  pct.clearCanvas = clearCanvas
  pct.drawCircle = drawCircle
  pct.drawGrid = drawGrid
  pct.drawRowCol = drawRowCol
  pct.flip = flip
  pct.flipCore = flipCore
  pct.guiControl = guiControl
  pct.layers = layers
  pct.mirror = mirror
  pct.newCorner = newCorner
  pct.nextDrawMode = nextDrawMode
  pct.nextRotation = nextRotation
  pct.p5 = p5
  pct.paint = paint
  pct.params = params
  pct.pushpop = pushpop
  pct.randomLayer = randomLayer
  pct.renderLayers = renderLayers
  pct.reset = reset
  pct.rotateCanvas = rotateCanvas
  pct.rotateWrapped = rotateWrapped
  pct.setFont = setFont
  pct.shift = shift
  pct.target = target
  pct.textManager = textManager
  pct.mouseInCanvas = mouseInCanvas
  pct.HORIZONTAL = HORIZONTAL
  pct.VERTICAL = VERTICAL
  pct.draw = standardDraw
  pct.APP_MODES = APP_MODES
  pct.output = output
  pct.clearRecording = clearRecording
  pct.recordAction = recordAction
  pct.recordConfig = recordConfig
  pct.globals = globals
  pct.skewCollection = []
  pct.savit = savit

  return pct
}
