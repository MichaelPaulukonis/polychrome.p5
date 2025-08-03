import UndoLayers from '@/src/undo/undo.layers.js'
import Layers from '@/src/layers.js'
import { allParams, fillParams, outlineParams, drawModes, globals } from '@/src/params.js'
import { hexStringToColors } from '@/src/gui/gui.color.control'
import { setupGui } from '@/src/gui/gui'
import { recordAction, recordConfig, output, clear as clearRecording } from '@/src/scripting/record'
import saveAs from 'file-saver'
import { datestring, filenamer } from '@/src//filelib'
import { setupActions } from '@/src/gui/actions'
import { createColorFunctions, createGammaAdjustment } from '@/src/color/color-system'
import { createCanvasTransforms } from '@/src/canvas-transforms'
import { createDrawingModes } from '@/src/drawing-modes'
import { apx, pushpop } from '@/src/utils'

const fonts = require.context('@/assets/fonts', false, /\.ttf$/)

let namer = null

export default function Sketch ({ p5Instance: p5, guiControl, textManager, setupCallback }) {
  const params = allParams
  const pct = {}

  const density = 2
  // scaleFactor is now always sourced from layers.scaleFactor

  let layers
  let colorSystem
  let adjustGamma
  let canvasTransforms
  let drawingModes
  let undo
  let zone = null
  let zoneStartPos = null

  const fontList = {}

  const loadedFonts = fonts.keys().map(f => f.replace(/\.\/(.*?)\.ttf/, '$1'))

  let imgMask
  p5.preload = () => {
    loadedFonts.forEach((font) => {
      fontList[font] = p5.loadFont(require(`@/assets/fonts/${font}.ttf`))
    })
    imgMask = p5.loadImage(require('~/assets/9-96398_http-landrich-black-gradient-border-transparent.png'))
  }

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

    // scaling is now handled by Layers; do not set scaleFactor here

    const { shiftFillColors, shiftOutlineColors } = setupGui({ p5, sketch: pct, params, fillParams: params.fill, outlineParams: params.outline, handleResize })
    pct.shiftFillColors = shiftFillColors
    pct.shiftOutlineColors = shiftOutlineColors

    // Use Layers to determine display size and scaling
    // The actual canvas is created in Layers
    // p5.createCanvas is still needed for the main display
    p5.createCanvas(params.width, params.height)

    pct.layers = layers = new Layers(p5, params, setFont)

    colorSystem = createColorFunctions(p5)

    adjustGamma = createGammaAdjustment({
      layers,
      recordAction,
      globals,
      renderLayers,
      get appMode () { return pct.appMode },
      APP_MODES
    })

    canvasTransforms = createCanvasTransforms({
      layers,
      recordAction,
      globals,
      renderLayers,
      getAppMode: () => pct.appMode,
      APP_MODES,
      params,
      getZone: () => zone
    })

    drawingModes = createDrawingModes({
      layers,
      colorSystem,
      hexStringToColors,
      p5
    })

    pct.clearCanvas({ layers: pct.layers, params: pct.params })
    undo = new UndoLayers(layers, renderLayers, 10)
    pct.undo = undo
    undo.takeSnapshot()
    pct.appMode = APP_MODES.STANDARD_DRAW

    params.fill = fillParams
    params.outline = outlineParams
    pct.defaultParams = JSON.parse(JSON.stringify(params))

    pct.adjustGamma = adjustGamma

    pct.flip = canvasTransforms.flip
    pct.flipCore = canvasTransforms.flipCore
    pct.mirror = canvasTransforms.mirror
    pct.newCorner = canvasTransforms.newCorner
    pct.rotateCanvas = canvasTransforms.rotateCanvas
    pct.rotateWrapped = canvasTransforms.rotateWrapped
    pct.shift = canvasTransforms.shift
    pct.flipZone = canvasTransforms.flipZone
    pct.mirrorZone = canvasTransforms.mirrorZone
    pct.rotateZone = canvasTransforms.rotateZone
    pct.HORIZONTAL = canvasTransforms.HORIZONTAL
    pct.VERTICAL = canvasTransforms.VERTICAL

    pct.drawGrid = drawingModes.drawGrid
    pct.drawCircle = drawingModes.drawCircle
    pct.drawRowCol = drawingModes.drawRowCol

    setupCallback(pct)
    recordConfig(pct.params, pct.appMode === APP_MODES.STANDARD_DRAW)
  }

  const handleResize = () => {
    layers.resize(params.width, params.height)
    undo.clear()
    undo.takeSnapshot()
  }

  const mouseInCanvas = () => {
    return p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
  }

  const standardDraw = ({ x, y, override, params } = { x: p5.mouseX, y: p5.mouseY, override: false, params: pct.params }) => {
    if (globals.isDefiningZone) return // Do not paint while defining a zone

    if (override || (p5.mouseIsPressed && mouseInCanvas())) {
      recordConfig(params, pct.appMode !== APP_MODES.STANDARD_DRAW)
      const offscreenX = x * layers.scaleFactor
      const offscreenY = y * layers.scaleFactor

      if (globals.isZoneActive && globals.zoneExists) {
        if (offscreenX >= zone.x && offscreenX <= zone.x + zone.width &&
          offscreenY >= zone.y && offscreenY <= zone.y + zone.height) {
          const relativeX = offscreenX - zone.x
          const relativeY = offscreenY - zone.y
          recordAction({ x: relativeX, y: relativeY, action: 'paint' }, pct.appMode !== APP_MODES.STANDARD_DRAW)
          paint(relativeX, relativeY, params, zone.graphics, zone.width, zone.height)
          globals.updatedCanvas = true
        }
      } else {
        recordAction({ x: offscreenX, y: offscreenY, action: 'paint' }, pct.appMode !== APP_MODES.STANDARD_DRAW)
        paint(offscreenX, offscreenY, params)
        globals.updatedCanvas = true
      }
    }
  }

  const saver = (canvas, name) => {
    try {
      canvas.toBlob(blob => saveAs(blob, name))
    } catch (e) {
      console.error('Error saving file:', e)
    }
  }

  const savit = ({ params }) => {
    if (params.playbackSave || (params.capturing && globals.updatedCanvas)) {
      params.playbackSave = false
      globals.updatedCanvas = false
      if (namer === null) {
        namer = filenamer(datestring())
      }
      console.log('saving canvas: ' + globals.captureCount)

      saver(pct.layers.drawingCanvas.canvas, namer() + '.png')

      globals.captureCount += 1
      if (globals.captureCount > pct.params.captureLimit) {
        params.capturing = false
        p5.frameRate(pct.params.p5frameRate)
        globals.captureCount = 0
      }
    }
  }

  p5.draw = () => {
    p5.background(200)
    p5.image(layers.drawingCanvas, 0, 0, p5.width, p5.height)

    if (globals.zoneExists) {
      p5.image(zone.graphics, zone.x / layers.scaleFactor, zone.y / layers.scaleFactor, zone.width / layers.scaleFactor, zone.height / layers.scaleFactor)
    }

    // Zonal UI Rendering
    if (globals.zoneExists) {
      // Draw the zone's border on the uiCanvas.
      const scaledZone = {
        x: zone.x / layers.scaleFactor,
        y: zone.y / layers.scaleFactor,
        width: zone.width / layers.scaleFactor,
        height: zone.height / layers.scaleFactor
      }
      layers.uiCanvas.push()
      layers.uiCanvas.noFill()
      layers.uiCanvas.strokeWeight(globals.isZoneActive ? 2 : 1)
      layers.uiCanvas.stroke(globals.isZoneActive ? 'red' : 'gray')
      if (!globals.isZoneActive) {
        layers.uiCanvas.drawingContext.setLineDash([5, 5])
      }
      layers.uiCanvas.rect(scaledZone.x, scaledZone.y, scaledZone.width, scaledZone.height)
      layers.uiCanvas.pop()
    }
    if (globals.isDefiningZone && zoneStartPos) {
      const scaledMouseX = p5.mouseX
      const scaledMouseY = p5.mouseY
      layers.uiCanvas.push()
      layers.uiCanvas.noFill()
      layers.uiCanvas.strokeWeight(1)
      layers.uiCanvas.stroke('gray')
      layers.uiCanvas.drawingContext.setLineDash([5, 5])
      layers.uiCanvas.rect(zoneStartPos.x / layers.scaleFactor, zoneStartPos.y / layers.scaleFactor, scaledMouseX - (zoneStartPos.x / layers.scaleFactor), scaledMouseY - (zoneStartPos.y / layers.scaleFactor))
      layers.uiCanvas.pop()
    }

    p5.image(layers.uiCanvas, 0, 0)
    layers.uiCanvas.clear()

    if (pct.params.autoPaint) {
      autoDraw(0, 0, p5.width, p5.height)
    } else {
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

  const increment = (params) => {
    pct.skewCollection.forEach(skew => {
      skew.next()
    })
  }

  p5.mousePressed = () => {
    if (mouseInCanvas()) {
      if (globals.isDefiningZone) {
        zoneStartPos = { x: p5.mouseX * layers.scaleFactor, y: p5.mouseY * layers.scaleFactor }
      } else {
        pct.undo.takeSnapshot()
      }
    }
  }

  p5.mouseDragged = () => {
    if (globals.isDefiningZone) {
      // The drawing of the preview is handled in the draw() loop
    }
  }

  p5.mouseReleased = () => {
    if (globals.isDefiningZone && zoneStartPos) {
      const startX = zoneStartPos.x
      const startY = zoneStartPos.y
      const endX = p5.mouseX * layers.scaleFactor
      const endY = p5.mouseY * layers.scaleFactor

      const x = Math.min(startX, endX)
      const y = Math.min(startY, endY)
      const width = Math.abs(endX - startX)
      const height = Math.abs(endY - startY)

      if (width > 0 && height > 0) {
        zone = {
          x,
          y,
          width,
          height,
          graphics: p5.createGraphics(width, height),
          transformState: { rotation: 0, scale: 1 }
        }
        zone.graphics.pixelDensity(density)
        layers.initializeColorMode(zone.graphics, { ...params, width, height })
        zone.graphics.image(layers.drawingCanvas, 0, 0, width, height, x, y, width, height)
        globals.isDefiningZone = false
        globals.isZoneActive = true
        globals.zoneExists = true
      }
      zoneStartPos = null
    }
  }

  // NOTE: these are different "actions" that what are recorded or played-back
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

  // move to layers class ???
  const renderLayers = ({ layers }) => {
    renderTarget({ layers })
  }

  // move to layers class
  const renderTarget = ({ layers }) => {
    layers.p5.image(layers.drawingCanvas, 0, 0)
    // layers.drawingCanvas.clear()
  }

  const clearCanvas = ({ layers, params }) => {
    recordAction({ action: 'clearCanvas', layers: 'layers' }, pct.appMode !== APP_MODES.STANDARD_DRAW)
    layers.resize(params.width, params.height)
    layers.clear(params.fill.color)
    layers.initializeColorMode(layers.drawingCanvas, params)
    // undo.clear()
    // undo.takeSnapshot()
  }

  // move to layers class ???
  // maybe not - this is only about drawing
  // ugh, but it is called from initDrawingLayer SIGH
  const setFont = (font, layer = layers.drawingCanvas) => {
    const tf = (loadedFonts.includes(font)) ? fontList[font] : font
    layer.textFont(tf)
  }

  // s/b taking in a layer not assuming a layer
  const paint = (xPos, yPos, params, layer = layers.drawingCanvas, width = params.width, height = params.height) => {
    setFont(params.font, layer)

    if (params.drawMode === 'Grid') {
      drawingModes.drawGrid({
        xPos,
        params,
        width,
        height,
        layer,
        textManager
      })
    } else if (params.drawMode === 'Circle') {
      drawingModes.drawCircle({
        xPos,
        yPos,
        params,
        width,
        height,
        layer,
        textManager
      })
    } else {
      drawingModes.drawRowCol({
        params,
        width,
        height,
        layer,
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

  const reset = (params, layer) => {
    params.rotation = 0
    layer.translate(0, 0)
    layer.resetMatrix()
  }

  // why redefine the util functions each time???
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
    p5.save(layers.drawingCanvas, `${params.name}.${getDateFormatted()}.png`)
  }

  // TODO: move into a util object
  const coinflip = () => pct.p5.random() > 0.5

  const randomLayer = (cfg = {}) => {
    const img = pct.p5.random(pct.undo.history())
    layers.drawingCanvas.push()
    pct.p5.push()

    try {
      layers.drawingCanvas.resetMatrix()

      const pctSize = cfg.percentSize || percentSize()
      const size = { width: pct.p5.width * pctSize, height: pct.p5.height * pctSize }
      const offsetSize = { width: size.width * 0.75, height: size.height * 0.75 }
      const originX = cfg.originX || pct.p5.random(-offsetSize.width, pct.p5.width + offsetSize.width)
      const originY = cfg.originY || pct.p5.random(-offsetSize.height, pct.p5.height + offsetSize.height)
      layers.drawingCanvas.translate(originX, originY)

      const rotateP = cfg.rotateP || coinflip()
      const radians = cfg.radians || pct.p5.random(360)
      if (rotateP) { layers.drawingCanvas.rotate(pct.p5.radians(radians)) }

      const alpha = cfg.alpha || pct.p5.random(255)

      const img2 = layers.p5.createGraphics(img.width, img.height)

      img2.copy(img, 0, 0, img.width, img.height, 0, 0, img.width * pctSize, img.height * pctSize)
      if (!params.hardEdge) {
        const mask2 = layers.p5.createImage(img.width, img.height)
        mask2.copy(imgMask, 0, 0, img.width, img.height, 0, 0, img.width * pctSize, img.height * pctSize)
        img2.mask(mask2)
      }

      pct.p5.tint(255, alpha)
      setShadows(layers.drawingCanvas, params)

      layers.drawingCanvas.image(img2, 0, 0)

      recordAction({ action: 'randomLayer', percentSize: pctSize, originX, originY, rotateP, radians, alpha }, pct.appMode !== APP_MODES.STANDARD_DRAW)
    } catch (e) {
      console.log(e)
    } finally {
      pct.p5.pop()
      layers.drawingCanvas.pop()
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
  pct.textManager = textManager
  pct.mouseInCanvas = mouseInCanvas
  pct.draw = standardDraw
  pct.APP_MODES = APP_MODES
  pct.output = output
  pct.clearRecording = clearRecording
  pct.recordAction = recordAction
  pct.recordConfig = recordConfig
  pct.globals = globals

  pct.defineZone = () => {
    globals.isDefiningZone = true
  }

  pct.clearZone = () => {
    if (globals.zoneExists) {
      zone.graphics.remove()
      zone = null
      globals.isZoneActive = false
      globals.zoneExists = false
    }
  }

  pct.commitZone = () => {
    if (globals.zoneExists) {
      layers.drawingCanvas.image(zone.graphics, zone.x, zone.y)
      globals.updatedCanvas = true
    }
  }

  pct.toggleZone = () => {
    if (globals.zoneExists) {
      globals.isZoneActive = !globals.isZoneActive
      if (globals.isZoneActive) {
        zone.graphics.image(layers.drawingCanvas, 0, 0, zone.width, zone.height, zone.x, zone.y, zone.width, zone.height)
      }
    }
  }

  // Zonal Painting State
  globals.zoneExists = false
  globals.isDefiningZone = false // Mode for dragging to create a zone
  globals.isZoneActive = false // Mode for confining painting to the zone

  pct.skewCollection = [] // TODO: this is interesting, a stub I had forgotten about
  pct.savit = savit
  pct.textManager = textManager

  return pct
}
