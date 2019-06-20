import UndoLayers from './undo.layers.js'
import Layers from './layers.js'
import Macros from './macros.js'
import { keyPresser, keyHandler } from './keys.js'

export default function Sketch (p5, guiControl, textManager, params) {
  params = params || guiControl.params

  let bypassRender = false
  const density = 2

  const blackfield = '#000000'
  const whitefield = '#FFFFFF'
  params.blackText = false
  let drawingLayer // drawing layer
  let layersOld = {
    drawingLayer,
    p5
  }

  let layersNew

  let setFillMode
  let setOutlineMode

  let fontList = {}
  const loadedFonts = ['ATARCC__', 'ATARCE__', 'ATARCS__', 'AtariClassic-Regular',
    'BlackCasper', 'BMREA___', 'CableDingbats', 'carbontype', 'clothing logos', 'Credit Cards',
    'D3Digitalism', 'D3DigitalismI', 'D3DigitalismR', 'edunline', 'enhanced_dot_digital-7', 'Fast Food logos',
    'Harting_plain', 'illustrate-it', 'openlogos', 'RecycleIt', 'retro_computer_personal_use', 'SEGA',
    'Smartphone Color Pro', 'Social Icons Pro Set 1 - Rounded', 'social_shapes', 'TRENU___',
    'Type Icons Color', 'Type Icons', 'VT323-Regular', 'Youkairo']

  p5.preload = () => {
    loadedFonts.forEach(font => {
      fontList[font] = p5.loadFont(`assets/fonts/${font}.ttf`)
    })
  }

  p5.setup = () => {
    p5.pixelDensity(density)
    const canvas = p5.createCanvas(params.width, params.height)
    layersOld.drawingLayer = initDrawingLayer(params.width, params.height)
    layersNew = new Layers(p5, layersOld.drawingLayer)
    // tODO: these are now set as side-effects in initializeDrawingLayer
    // setFillMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('fill', layers.drawingLayer.fill, layers.drawingLayer)
    // setOutlineMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('outline', layers.drawingLayer.stroke, layers.drawingLayer)

    canvas.parent('sketch-holder')

    // clearDrawing()
    this.clearCanvas()
    guiControl.setupGui(this, guiControl.fontPicker)
    textManager.setText(guiControl.getBodyCopy())
    this.undo = new UndoLayers(layersOld, renderLayers, 10)
  }

  const mouseInCanvas = () => {
    return p5.mouseY > 0 && p5.mouseY < p5.height && p5.mouseX > 0 && p5.mouseX < p5.width
  }

  p5.draw = () => {
    // or you'll crash the app! or something....
    // ignore mouse outside confines of window.
    if (p5.mouseIsPressed && mouseInCanvas()) {
      // TODO: if some modifier, drag the image around the screen
      // first call, save image, and keep it around for drag-drawing?
      paint(p5.mouseX, p5.mouseY, params)
    }
  }

  p5.mouseReleased = () => {
    this.undo.takeSnapshot()
  }

  const apx = (...fns) => list => [...list].map(b => fns.forEach(f => f(b)))

  const pushpop = l => f => () => {
    l.push()
    f()
    l.pop()
  }

  const renderLayers = () => {
    if (bypassRender) return
    clearLayer(layersOld.p5)
    // clearLayer(layersNew.p5)
    renderTarget()
  }

  const renderTarget = () => {
    p5.image(layersOld.drawingLayer, 0, 0)
    // p5.image(layersNew.drawingLayer, 0, 0)
  }

  const clearLayer = (r = p5) => {
    r.blendMode(p5.NORMAL)
    // const field = params.blackText ? whitefield : blackfield
    r.background(blackfield)
  }

  const clearDrawing = () => {
    clearLayer(layersOld.drawingLayer)
    // clearLayer(layersNew.drawingLayer)
    renderLayers()
  }

  // pass in p5 and params because it's bound in gui.js
  // but, this binds the current values in params, apparently
  // UGH UGH UGH
  const clearCanvas = () => {
    const color = params.fill_color
    clear(layersOld.drawingLayer, color)
    clear(layersOld.p5, color)
    // tODO: equivalent for new layers object?
    // the trick is the clearance color
  }

  const clear = (layer, color) => {
    layer.resizeCanvas(params.width, params.height)
    layer.pixelDensity(density)
    layer.background(color)
  }

  const setFont = (font, layer = layersOld.drawingLayer) => {
    // how clumsy! but as a POC it works
    let tf = (loadedFonts.indexOf(font) > -1) ? fontList[font] : font
    layer.textFont(tf)
  }

  const initDrawingLayer = (w, h) => {
    let layer = p5.createGraphics(w, h)
    layer.pixelDensity(density)
    setFont(params.font, layer)
    layer.textAlign(p5.CENTER, p5.CENTER)
    layer.colorMode(p5.HSB, params.width, params.height, 100, 1)

    // SIDE EFFECTS! UGH
    setFillMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('fill', layer.fill, layer)
    setOutlineMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('outline', layer.stroke, layer)

    return layer
  }

  const paint = (xPos, yPos, params) => {
    setFont(params.font, layersOld.drawingLayer)
    // layersNew.setFont(params.font)
    const mode = parseInt(params.drawMode, 10)
    const draw = mode === params.drawModes.Grid ? drawGrid
      : mode === params.drawModes.Circle ? drawCircle
        : drawRowCol
    draw(xPos, yPos, params, params.width, params.height, layersOld.drawingLayer)
    params.fill_donePainting = true
    params.outline_donePainting = true
  }

  const textGetter = (textMode, t) => {
    const tm = parseInt(textMode, 10)
    const tfunc = tm === 0
      ? t.getchar
      : tm === 1
        ? t.getcharRandom
        : t.getWord
    return tfunc
  }

  // originally from http://happycoding.io/examples/processing/for-loops/letters
  // a reminder of something simpler
  const drawRowCol = (xPos, yPos, params, width, height, layer) => {
    const rows = params.rows
    let cols = rows // tidally lock them together for the time being.

    const cellHeight = height / rows
    const cellWidth = width / cols

    layer.textAlign(layer.CENTER, layer.CENTER)

    // this kept ending up being almost the same as cellWidth everytime
    // so I just went with the fudge factor. :::sigh:::
    // let fontsize = fitTextOnCanvas('.', 'Arial', cellWidth)
    // textSize(fontsize)
    layer.textSize(cellWidth * 1.5)
    const sw = params.useOutline
      ? params.outline_strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline_strokeJoin)
    const fetchText = textGetter(params.nextCharMode, textManager)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        // calculate cell position
        let pixelX = cellWidth * x
        let pixelY = cellHeight * y

        // add half to center letters
        pixelX += cellWidth / 2
        pixelY += cellHeight / 2

        setFillMode(pixelX, pixelY, params)
        setOutlineMode(pixelX, pixelY, params)

        const txt = fetchText()
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
    renderLayers(params)
  }

  const drawCircle = (xPos, yPos, params, width, height, layer) => {
    let tx = xPos / 2
    if (tx < 1) tx = 1
    layer.textSize(tx) // what if it was based on the yPos, which we are ignoring otherwise?
    // well, it's somewhat used for color - fade, in some cases

    layer.push()
    layer.translate(width / 2, height / 2) // centered
    // layer.translate(0, 0) //  upper-left - we can change this around
    const sw = params.useOutline
      ? params.outline_strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline_strokeJoin)

    setFillMode(xPos, yPos, params)
    setOutlineMode(xPos, yPos, params)

    const nextText = textGetter(params.nextCharMode, textManager)
    circlePainter(params, layer, xPos, nextText, width)
    layer.pop()
    renderLayers(params)
  }

  const circlePainter = (params, layer, xPos, nextText, width) => {
    const radius = getRadius(params, width, xPos)
    const paint = bloc => circlePaintAction(layer)(radius, params)(bloc.theta, bloc.text)
    const blocGen = gimmeCircleGenerator(radius, nextText, layer)
    apx(paint)(blocGen)
  }

  const getRadius = (params, width, xPos) => {
    const radius = params.invert ? (width * 1.2 / 2) - xPos : xPos
    return radius < 0 ? 0.1 : radius
  }

  // generator returns { theta, text }
  // and circlePaintActions intake radius, params, theta, text
  // so, need to move some things about
  // const paint = ((step, layer, params) => (bloc) => paintActions(bloc.x, bloc.y, step, layer, params, bloc.text))(step, p5, params)
  const gimmeCircleGenerator = (radius, nextText, l) => {
    const circumference = 2 * Math.PI * radius
    return blocGeneratorCircle(radius, circumference)(nextText, l)
  }

  // generator will return { theta, text }
  const blocGeneratorCircle = (radius, circumference) => {
    return function * (nextText, l) {
      let arclength = 0
      while (arclength < circumference) {
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
      step: step,
      condy: (y) => y < height,
      condx: (x) => x < width,
      changey: (y) => y + step,
      changex: (x) => x + step,
      initY: 0,
      initX: 0
    }
  }

  const invertGridParm = (xPos, height, width) => {
    const step = width - xPos + 5
    return {
      step: step,
      condy: (y) => y > 0,
      condx: (x) => x > 0,
      changey: (y) => y - step,
      changex: (x) => x - step,
      initY: height,
      initX: width
    }
  }

  // alternatively http://happycoding.io/examples/processing/for-loops/letters
  // cleaner?
  const drawGrid = (xPos, yPos, params, width, height, layer) => {
    // negatives are possible, it seems....
    xPos = xPos < 5 ? 5 : xPos
    // yPos = yPos < 5 ? 5 : yPos

    // THIS SHOULD ALL BE DEFAULT STUFF DONE COMONLY
    const gridParams = params.invert ? invertGridParm(xPos, height, width) : defaultGridParm(xPos, height, width)
    layer.textSize(gridParams.step)
    // layer.textSize(18)
    layersOld.p5.textSize(gridParams.step) // this is .... weird. Look at the p5js code. Something funky with textAscent going to the parent, which is set to 12
    // layersNew.textSize(gridParams.step)

    const sw = params.useOutline
      ? params.outline_strokeWeight
        ? params.outline_strokeWeight
        : (gridParams.step / 5)
      : 0
    layer.strokeWeight(sw / 4)
    layer.strokeJoin(params.outline_strokeJoin)
    if (params.fixedWidth) {
      layer.textAlign(layer.CENTER, layer.CENTER)
    } else {
      layer.textAlign(layer.LEFT, layer.BOTTOM)
    }

    const nextText = textGetter(params.nextCharMode, textManager)
    const fill = bloc => setFillMode(bloc.x, bloc.y, params)
    const outline = params.useOutline ? bloc => setOutlineMode(bloc.x, bloc.y, params) : () => { }
    const step = (params.fixedWidth) ? gridParams.step : 0
    const paint = ((step, layer, params) => (bloc) => paintActions(bloc.x, bloc.y, step, layer, params, bloc.text))(step, layer, params)
    const yOffset = getYoffset(layer.textAscent(), 0) // only used for TextWidth
    // TODO: also the alignments above. ugh
    let blocGen = (params.fixedWidth)
      ? blocGeneratorFixedWidth(gridParams, nextText)
      : blocGeneratorTextWidth(nextText, whOnly(layer), yOffset, layer) // whonly needs to be reworked
    apx(fill, outline, paint)(blocGen)
    renderLayers(params)
  }

  function * blocGeneratorFixedWidth (gridParams, nextText) {
    for (let gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
      for (let gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
        const t = nextText()
        yield { x: gridX, y: gridY, text: t }
      }
    }
    return 'done'
  }

  function * blocGeneratorTextWidth (nextText, gridSize, yOffset, r) {
    let t = nextText()
    let coords = { x: 0, y: yOffset }
    let offsets = { x: 0, y: yOffset }
    while (hasNextCoord(coords, gridSize, yOffset)) {
      yield { x: coords.x, y: coords.y, text: t }
      offsets.x = r.textWidth(t)
      coords = nextCoord(coords, offsets, gridSize.width)
      t = nextText()
      if (t === ' ' && coords.x === 0) t = nextText()
    }
    return 'done'
  }

  const whOnly = obj => ({ width: obj.width, height: obj.height })

  const getYoffset = (textAscent, heightOffset) => {
    let yOffset = textAscent + heightOffset
    yOffset = (yOffset > 2) ? yOffset : 3
    return yOffset
  }

  const hasNextCoord = (coords, gridSize, yOffset) => {
    return coords.x < gridSize.width && (coords.y - yOffset) < gridSize.height
  }

  const nextCoord = (coords, offsets, gridWidth) => {
    let nc = { ...coords }
    nc.x = nc.x + offsets.x
    if (nc.x + (0.25 * offsets.x) > gridWidth) {
      nc.x = 0
      nc.y = nc.y + offsets.y
    }
    return nc
  }

  // translate, rotate, text
  const trText = (layer, rotation) => (x, y, tx, ty, txt) => () => {
    // think I'm over-thinking this. Original version was easier to understand
    if (tx !== 0 || ty !== 0) {
      layer.translate(tx, ty)
    }
    layer.rotate(layer.radians(rotation))
    layer.text(txt, x, y)
  }

  // hrm. still seems like this could be simpler
  const paintActions = (gridX, gridY, step, layer, params, txt) => {
    const cum = trText(layer, params.rotation)(gridX, gridY, 0, 0, txt)
    const norm = pushpop(layer)(trText(layer, params.rotation)(0, 0, gridX + step / 4, gridY + step / 5, txt))
    params.cumulativeRotation ? cum() : norm()
  }

  const nextDrawMode = (direction, params) => {
    let drawMode = params.drawMode
    drawMode = (drawMode + direction) % params.drawModes.length
    if (drawMode < 0) drawMode = params.drawModes.length - 1
    params.drawMode = drawMode
  }

  const nextRotation = (direction, params) => {
    const step = 5
    params.rotation = (params.rotation + step * direction) % 360
    if (params.rotation > 360) params.rotation = 360
    if (params.rotation < -360) params.rotation = -360
  }

  const nextRow = (direction, params) => {
    params.rows = params.rows + direction
    if (params.rows > params.maxrow) params.rows = params.maxrow
    if (params.rows < 1) params.rows = 1
  }

  const colorAlpha = (aColor, alpha) => {
    const c = p5.color(aColor)
    return p5.color('rgba(' + [p5.red(c), p5.green(c), p5.blue(c), alpha].join(',') + ')')
  }

  // TODO: if these were.... functions, we could have an array, and not have to worry about counting the mode
  // also, functions could take params that could change them up a bit.....
  // like the grays - sideways, or something. angles....
  // prefix will be (almost?) same as func name - fill or stroke
  const setPaintMode = (gridX, gridY, params, prefix, func, layer) => {
    func = func.bind(layer)
    const transparency = params[`${prefix}_transparent`] ? parseInt(params[`${prefix}_transparency`], 10) / 100 : 100
    const mode = parseInt(params[`${prefix}_paintMode`], 10)
    switch (mode) {
      case 1:
        func(layer.width - gridX, gridY, 100, transparency)
        break

      case 2:
        func(gridX / 2, gridY / 2, 100, transparency)
        break

      case 3: // offset from default
        const x = (gridX + layer.width / 2) % layer.width
        const y = (layer.height - gridY + layer.height / 2) % layer.height
        func(x, y, 100, transparency)
        break

      case 4:
        func(0, transparency)
        break

      case 5:
        func(255, transparency)
        break

      case 6:
        {
          const grayScaled = (gridY * 255) / layer.height
          func(grayScaled, transparency)
        }
        break

      case 7:
        {
          const grayScaled = (gridY * 255) / layer.height
          func(255 - grayScaled, transparency)
        }
        break

      case 9:
        func(colorAlpha(params[`${prefix}_color`], transparency))
        break

      case 13:
        {
          const colors = guiControl.hexStringToColors(params[`${prefix}_scheme`])
          // TODO: work with number of colors provided

          const color1 = layer.color(colors[0])
          const color2 = layer.color(colors[1])
          const color3 = colors[2] ? layer.color(colors[2]) : color1
          const color4 = colors[3] ? layer.color(colors[3]) : color2
          const amountX = (gridX / layer.width)
          const amountY = (gridY / layer.height)

          layer.push()
          layer.colorMode(layer.RGB)

          const l1 = layer.lerpColor(color1, color2, amountX)
          const l2 = layer.lerpColor(color3, color4, amountX)
          let l3 = layer.lerpColor(l1, l2, amountY)
          const alpha = (transparency * 255)
          l3.setAlpha(alpha)
          layer.pop()
          func(l3, transparency)
        }
        break

      case 14:
        {
          const color1 = layer.color(params[`${prefix}_lq1`])
          const color2 = layer.color(params[`${prefix}_lq2`])
          const color3 = layer.color(params[`${prefix}_lq3`])
          const color4 = layer.color(params[`${prefix}_lq4`])
          const amountX = (gridX / layer.width)
          const amountY = (gridY / layer.height)

          layer.push()
          layer.colorMode(layer.RGB)

          const l1 = layer.lerpColor(color1, color2, amountX)
          const l2 = layer.lerpColor(color3, color4, amountX)
          let l3 = layer.lerpColor(l1, l2, amountY)
          const alpha = (transparency * 255)
          l3.setAlpha(alpha)
          layer.pop()
          func(l3, transparency)
        }
        break

      case 0:
      default:
        func(gridX, layer.height - gridY, 100, transparency)
        break
    }
  }

  // only resets the angle, for now...
  const reset = (params, layer) => {
    params.rotation = 0
    layer.translate(0, 0)
    layer.resetMatrix()
  }

  const HORIZONTAL = 0
  const VERTICAL = 1
  const flip = (axis, layer) => {
    // NOTE: get() is soooooo much quicker!
    // but since it only works in RGBA, it creates problems for HSB canvases like ours
    // or, it creates problems, possibly for a different reason
    const d = layer.pixelDensity()
    const tmp = layer.createImage(layer.width * d, layer.height * d)
    tmp.loadPixels()
    layer.loadPixels()
    for (let i = 0; i < layer.pixels.length; i++) {
      tmp.pixels[i] = layer.pixels[i]
    }
    tmp.updatePixels()
    layer.push()
    layer.translate(0, 0)
    layer.resetMatrix()
    if (axis === HORIZONTAL) {
      layer.translate(0, layer.height)
      layer.scale(1, -1)
    } else {
      layer.translate(layer.width, 0)
      layer.scale(-1, 1)
    }
    layer.image(tmp, 0, 0, layer.width, layer.height)
    layer.pop()
    renderLayers(params)
  }

  const mirror = (axis = VERTICAL, layer) => {
    const d = layer.pixelDensity()
    const tmp = layer.createImage(layer.width * d, layer.height * d)
    tmp.loadPixels()
    layer.loadPixels()
    for (let i = 0; i < layer.pixels.length; i++) {
      tmp.pixels[i] = layer.pixels[i]
    }
    tmp.updatePixels()
    layer.push()
    layer.translate(0, 0)
    layer.resetMatrix()
    if (axis === HORIZONTAL) {
      layer.translate(layer.width, 0)
      layer.scale(-1, 1)
      layer.image(tmp, 0, 0, layer.width / 2, layer.height, 0, 0, layer.width, layer.height * 2)
    } else {
      layer.translate(0, layer.height)
      layer.scale(1, -1)
      layer.image(tmp, 0, 0, layer.width, layer.height / 2, 0, 0, layer.width * 2, layer.height)
    }
    layer.pop()
    renderLayers(params)
  }

  // shift pixels in image
  // I'd love to be able to drag the image around, but I think that will require something else, but related
  const shift = (verticalOffset, horizontalOffset) => {
    // TODO: has to be pointing to the drawingLayer
    let context = layersOld.drawingLayer.drawingContext
    let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

    let cw = (horizontalOffset > 0 ? context.canvas.width : -context.canvas.width)
    let ch = (verticalOffset > 0 ? context.canvas.height : -context.canvas.height)

    context.putImageData(imageData, 0 + horizontalOffset, 0 + verticalOffset)
    if (horizontalOffset !== 0) {
      context.putImageData(imageData, 0 + horizontalOffset - cw, 0 + verticalOffset)
    }
    if (verticalOffset !== 0) {
      context.putImageData(imageData, 0 + horizontalOffset, 0 + verticalOffset - ch)
    }
    context.putImageData(imageData, 0 - cw + horizontalOffset, 0 - ch + verticalOffset)
    renderLayers(params)
  }

  this.save_sketch = () => {
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

  p5.keyPressed = () => {
    if (!mouseInCanvas()) return
    let handled = keyPresser(p5.keyCode, this)
    return !handled
  }

  p5.keyTyped = () => {
    if (!mouseInCanvas()) return
    keyHandler(p5.key, params, layersOld, this)
    return false
  }

  // TODO: use this somehow.
  // but make mouse start from regular place?
  // NOTE: doesn't work all that well if canvas is not square....
  const newCorner = (layer) => {
    layer.translate(layer.width, 0)
    layer.rotate(layer.radians(90))
  }

  const rotateCanvas = () => {
    const newHeight = params.height = p5.width
    const newWidth = params.width = p5.height

    p5.resizeCanvas(newWidth, newHeight)

    let newPG = initDrawingLayer(newWidth, newHeight)
    newPG.push()
    newPG.translate(newWidth, 0)
    newPG.rotate(p5.radians(90))
    newPG.image(layersOld.drawingLayer, 0, 0)
    newPG.pop()

    layersOld.drawingLayer = newPG

    // TODO: undo doesn't know anything about rotation......

    renderLayers(params)
  }

  // this smells, but is a start of separation
  this.apx = apx
  this.clearCanvas = clearCanvas
  this.drawCircle = drawCircle
  this.drawGrid = drawGrid
  this.flip = flip
  this.guiControl = guiControl
  this.layersNew = layersNew
  this.layersOld = layersOld
  this.mirror = mirror
  this.newCorner = newCorner
  this.nextDrawMode = nextDrawMode
  this.nextRotation = nextRotation
  this.p5 = p5
  this.paint = paint
  this.paint = paint
  this.params = params
  this.pushpop = pushpop
  this.renderLayers = renderLayers
  this.reset = reset
  this.rotateCanvas = rotateCanvas
  this.setFont = setFont
  this.shift = shift
  this.textManager = textManager

  const macros = new Macros(this)
  this.macros = macros
}
