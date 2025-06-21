import UndoLayers from './undo.layers.js'
import Layers from './layers.js'
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
import { createCanvasTransforms } from '@/src/canvas-transforms'
import { createDrawingModes } from '@/src/drawing-modes'
import { apx, pushpop } from '@/src/utils'
import { trText } from '@/src/drawing-modes/drawing-utils'

const fonts = require.context('@/assets/fonts', false, /\.ttf$/)

let namer = null

export default function Sketch ({ p5Instance: p5, guiControl, textManager, setupCallback }) {
  const params = allParams
  const pct = {}

  const density = 2

  let layers
  let colorSystem
  let adjustGamma
  let canvasTransforms
  let drawingModes
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

    // Initialize canvas transforms with dependencies
    canvasTransforms = createCanvasTransforms({
      layers,
      recordAction,
      globals,
      renderLayers,
      initDrawingLayer,
      getAppMode: () => pct.appMode,
      APP_MODES,
      params
    })

    // Initialize drawing modes with dependencies
    drawingModes = createDrawingModes({
      layers,
      colorSystem,
      hexStringToColors,
      p5
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

    pct.adjustGamma = adjustGamma

    // Assign canvas transforms to pct object
    pct.flip = canvasTransforms.flip
    pct.flipCore = canvasTransforms.flipCore
    pct.mirror = canvasTransforms.mirror
    pct.newCorner = canvasTransforms.newCorner
    pct.rotateCanvas = canvasTransforms.rotateCanvas
    pct.rotateWrapped = canvasTransforms.rotateWrapped
    pct.shift = canvasTransforms.shift
    pct.HORIZONTAL = canvasTransforms.HORIZONTAL
    pct.VERTICAL = canvasTransforms.VERTICAL

    // Assign drawing modes to pct object
    pct.drawGrid = drawingModes.drawGrid
    pct.drawCircle = drawingModes.drawCircle
    pct.drawRowCol = drawingModes.drawRowCol

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

    if (params.drawMode === 'Grid') {
      drawingModes.drawGrid({
        xPos,
        params,
        width: params.width,
        height: params.height,
        layer: layers.drawingLayer,
        textManager
      })
      renderLayers({ layers })
    } else if (params.drawMode === 'Circle') {
      drawingModes.drawCircle({
        xPos,
        yPos,
        params,
        width: params.width,
        height: params.height,
        layer: layers.drawingLayer,
        textManager
      })
      renderLayers({ layers })
    } else {
      // Use modular RowCol painter
      drawingModes.drawRowCol({
        params,
        width: params.width,
        height: params.height,
        layer: layers.drawingLayer,
        textManager
      })
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
        // literally this is using a mask image
        // which is an interesting idea but the code here is broken
        // and the option name and GUI display are not intuitive
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
  pct.apx = apx
  pct.clearCanvas = clearCanvas
  pct.guiControl = guiControl
  pct.layers = layers
  pct.nextDrawMode = nextDrawMode
  pct.nextRotation = nextRotation
  pct.p5 = p5
  pct.paint = paint
  pct.params = params
  pct.pushpop = pushpop
  pct.randomLayer = randomLayer
  pct.renderLayers = renderLayers
  pct.reset = reset
  pct.setFont = setFont
  pct.target = target
  pct.textManager = textManager
  pct.mouseInCanvas = mouseInCanvas
  pct.draw = standardDraw
  pct.APP_MODES = APP_MODES
  pct.output = output
  pct.clearRecording = clearRecording
  pct.recordAction = recordAction
  pct.recordConfig = recordConfig
  pct.globals = globals
  pct.skewCollection = []
  pct.savit = savit
  pct.textManager = textManager

  return pct
}
