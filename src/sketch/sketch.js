import Undo from './undo.js'

export default function Sketch (p5, guiControl, textManager, params) {
  params = params || guiControl.params
  let sketch = this

  var undo // hunh
  this.textManager = textManager

  p5.setup = () => {
    p5.pixelDensity(2)
    const canvas = p5.createCanvas(params.width, params.height)
    canvas.parent('sketch-holder')
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.colorMode(p5.HSB, p5.width, p5.height, 100, 1)
    sketch.clearCanvas()
    guiControl.setupGui(this)
    textManager.setText(guiControl.getBodyCopy())
    undo = new Undo(p5, 10)
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
    undo.takeSnapshot()
  }

  let apx = (...fns) => list => [...list].map(b => fns.forEach(f => f(b)))

  const pushpop = l => f => () => {
    l.push()
    f()
    l.pop()
  }

  const paint = (xPos, yPos, params) => {
    p5.textFont(params.font)
    const mode = parseInt(params.drawMode, 10)
    const draw = mode === params.drawModes.Grid ? drawGrid
      : mode === params.drawModes.Circle ? drawCircle
        : drawRowCol
    draw(xPos, yPos, params, p5.width, p5.height, p5)
    params.fill_donePainting = true
    params.outline_donePainting = true
  }

  const textGetter = (textMode, t) => {
    var tfunc
    switch (parseInt(textMode, 10)) {
      case 0:
      default:
        tfunc = t.getchar
        break

      case 1:
        tfunc = t.getcharRandom
        break

      case 2:
        tfunc = t.getWord
    }
    return tfunc
  }

  // originally from http://happycoding.io/examples/processing/for-loops/letters
  // a reminder of something simpler
  const drawRowCol = (xPos, yPos, params, width, height, layer) => {
    var rows = params.rows
    let cols = rows // tidally lock them together for the time being.

    var cellHeight = height / rows
    var cellWidth = width / cols

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

    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        // calculate cell position
        var pixelX = cellWidth * x
        var pixelY = cellHeight * y

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
        //   console.log(`x: ${pixelX} y: ${pixelY}`)
        // }
        // pushpop(p5)(doit)()
      }
    }
  }

  const drawCircle = (xPos, yPos, params, width, height, layer) => {
    console.log(xPos, yPos, width, height)
    var tx = xPos / 2
    if (tx < 1) tx = 1
    layer.textSize(tx) // what if it was based on the yPos, which we are ignoring otherwise?
    // well, it's somewhat used for color - fade, in some cases
    console.log(`text: ${tx}`)

    layer.push()
    layer.translate(width / 2, height / 2)
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
  const drawGrid = (xPos, yPos, params, width, height, layer = p5) => {
    // negatives are possible, it seems....
    xPos = xPos < 5 ? 5 : xPos
    // yPos = yPos < 5 ? 5 : yPos

    // THIS SHOULD ALL BE DEFAULT STUFF DONE COMONLY
    const gridParams = params.invert ? invertGridParm(xPos, height, width) : defaultGridParm(xPos, height, width)
    layer.textSize(gridParams.step)
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
    const paint = ((step, layer, params) => (bloc) => paintActions(bloc.x, bloc.y, step, layer, params, bloc.text))(step, p5, params)
    const yOffset = getYoffset(layer.textAscent(), 0) // only used for TextWidth
    // TODO: also the alignments above. ugh
    let blocGen = (params.fixedWidth)
      ? blocGeneratorFixedWidth(gridParams, nextText)
      : blocGeneratorTextWidth(nextText, whOnly(p5), yOffset, p5) // whonly needs to be reworked
    apx(fill, outline, paint)(blocGen)
  }

  function * blocGeneratorFixedWidth (gridParams, nextText) {
    for (var gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
      for (var gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
        yield { x: gridX, y: gridY, text: nextText() }
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
    }
    return 'done'
  }

  const whOnly = obj => ({ width: obj.width, height: obj.height })

  const getYoffset = (textAscent, heightOffset) => {
    var yOffset = textAscent + heightOffset
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
    layer.translate(tx, ty)
    layer.rotate(layer.radians(rotation))
    layer.text(txt, x, y)
  }

  // hrm. still seems like this could be simpler
  const paintActions = (gridX, gridY, step, layer, params, txt) => {
    const cum = trText(layer)(gridX, gridY, 0, 0, txt)
    const norm = pushpop(layer)(trText(layer, params.rotation)(0, 0, gridX + step / 4, gridY + step / 5, txt))
    params.cumulativeRotation ? cum() : norm()
  }

  this.clearCanvas = ((layer, params) => () => {
    layer.resizeCanvas(params.width, params.height)
    layer.pixelDensity(2)
    layer.background(0, 0, 100)
  })(p5, params)

  const nextDrawMode = (direction, params) => {
    let drawMode = params.drawMode
    drawMode = (drawMode + direction) % params.drawModes.length
    if (drawMode < 0) drawMode = params.drawModes.length - 1
    params.drawMode = drawMode
  }

  const nextpaintMode = (direction, prevMode) => {
    const paintModes = Object.keys(params.paintModes).length
    let newMode = (prevMode + direction) % paintModes
    if (newMode < 0) newMode = paintModes - 1
    return newMode
  }

  const nextRotation = (direction, params) => {
    var step = 5
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
    var c = p5.color(aColor)
    return p5.color('rgba(' + [p5.red(c), p5.green(c), p5.blue(c), alpha].join(',') + ')')
  }

  const setFillMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('fill', p5.fill, p5)
  const setOutlineMode = ((prefix, func, l) => (xPos, yPos, params) => setPaintMode(xPos, yPos, params, prefix, func, l))('outline', p5.stroke, p5)

  // TODO: if these were.... functions, we could have an array, and not have to worry about counting the mode
  // also, functions could take params that could change them up a bit.....
  // like the grays - sideways, or something. angles....
  const setPaintMode = (gridX, gridY, params, prefix, func, layer) => {
    func = func.bind(layer)
    // TODO: I don't understand the third-parameter here, in HSB mode.
    const transparency = params[`${prefix}_transparent`] ? parseInt(params[`${prefix}_transparency`], 10) / 100 : 100
    var mode = parseInt(params[`${prefix}_paintMode`], 10)
    switch (mode) {
      case 1:
        func(layer.width - gridX, gridY, 100, transparency)
        break

      case 2:
        func(gridX / 2, gridY / 2, 100, transparency)
        break

      case 3: // offset from default
        var x = (gridX + layer.width / 2) % layer.width
        var y = (layer.height - gridY + layer.height / 2) % layer.height
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

      case 10:
        {
          // this is a great contrast
          const color1 = layer.color('yellow')
          const color2 = layer.color('magenta')

          const amount = (gridX / layer.width)
          layer.push()
          layer.colorMode(layer.RGB)
          let lerpColor = layer.lerpColor(color1, color2, amount)
          const alpha = (transparency * 255)
          lerpColor.setAlpha(alpha)
          layer.pop()
          func(lerpColor) // uh, no. not transparent. UGH
        }
        break

      case 11:
        {
          // lerp something
          const color1 = layer.color('purple')
          const color2 = layer.color('hsl(160, 100%, 50%)')

          const amount = (gridX / layer.width)
          layer.push()
          layer.colorMode(layer.RGB)
          let lerpColor = layer.lerpColor(color1, color2, amount)
          const alpha = (transparency * 255)
          lerpColor.setAlpha(alpha)
          layer.pop()
          func(lerpColor, transparency)
        }
        break

      case 12:
        {
          // lerp 4 something
          // not quite right - the idea is one color in each corner
          layer.push()
          layer.colorMode(layer.RGB)

          const color1 = layer.color('yellow')
          const color2 = layer.color('magenta')
          const color3 = layer.color('purple')
          const color4 = layer.color('hsl(160, 100%, 50%)')
          const amountX = (gridX / layer.width)
          const amountY = (gridY / layer.height)

          const l1 = layer.lerpColor(color1, color2, amountX)
          const l2 = layer.lerpColor(color3, color4, amountX)
          let l3 = layer.lerpColor(l1, l2, amountY)
          const alpha = (transparency * 255)
          l3.setAlpha(alpha)
          layer.pop()
          func(l3, transparency)
        }
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

      case 0:
      default:
        func(gridX, layer.height - gridY, 100, transparency)
        break
    }
  }

  // only resets the angle, for now...
  const reset = (params) => {
    params.rotation = 0
  }

  const HORIZONTAL = 0
  const VERTICAL = 1
  const flip = (axis) => {
    // NOTE: get() is soooooo much quicker!
    // but since it only works in RGBA, it creates problems for HSB canvases like ours
    // or, it creates problems, possibly for a different reason
    const d = p5.pixelDensity()
    var tmp = p5.createImage(p5.width * d, p5.height * d)
    tmp.loadPixels()
    p5.loadPixels()
    for (let i = 0; i < p5.pixels.length; i++) {
      tmp.pixels[i] = p5.pixels[i]
    }
    tmp.updatePixels()
    p5.push()
    if (axis === HORIZONTAL) {
      p5.translate(0, p5.height)
      p5.scale(1, -1)
    } else {
      p5.translate(p5.width, 0)
      p5.scale(-1, 1)
    }
    p5.image(tmp, 0, 0, p5.width, p5.height)
    p5.pop()
  }

  const mirror = (axis = VERTICAL) => {
    const d = p5.pixelDensity()
    var tmp = p5.createImage(p5.width * d, p5.height * d)
    tmp.loadPixels()
    p5.loadPixels()
    for (let i = 0; i < p5.pixels.length; i++) {
      tmp.pixels[i] = p5.pixels[i]
    }
    tmp.updatePixels()
    p5.push()
    if (axis === HORIZONTAL) {
      p5.translate(p5.width, 0)
      p5.scale(-1, 1)
      p5.image(tmp, 0, 0, p5.width / 2, p5.height, 0, 0, p5.width, p5.height * 2)
    } else {
      p5.translate(0, p5.height)
      p5.scale(1, -1)
      p5.image(tmp, 0, 0, p5.width, p5.height / 2, 0, 0, p5.width * 2, p5.height)
    }
    p5.pop()
  }

  // shift pixels in image
  // I'd love to be able to drag the image around, but I think that will require something else, but related
  const shift = (verticalOffset, horizontalOffset) => {
    let context = p5.drawingContext
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
  }

  this.save_sketch = () => {
    const getDateFormatted = () => {
      var d = new Date()
      var df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
      return df
    }

    const pad = (nbr, width, fill = '0') => {
      nbr = nbr + ''
      return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
    }
    p5.saveCanvas(`${params.name}.${getDateFormatted()}.png`)
  }

  const keyPresser = (keyCode) => {
    let handled = false
    if (keyCode === p5.UP_ARROW || keyCode === p5.DOWN_ARROW) {
      handled = true
      const vector = (keyCode === p5.UP_ARROW) ? 1 : -1
      params.fill_paintMode = nextpaintMode(vector, params.fill_paintMode)
    } else if (keyCode === p5.LEFT_ARROW || keyCode === p5.RIGHT_ARROW) {
      handled = true
      const vector = (keyCode === p5.RIGHT_ARROW) ? 1 : -1
      const func = (parseInt(params.drawMode, 10) === params.drawModes.Grid2) ? nextRow : nextRotation
      func(vector, params)
    } else if (keyCode === p5.BACKSPACE || keyCode === p5.DELETE) {
      handled = true
      sketch.clearCanvas()
    }
    return handled
  }

  p5.keyPressed = () => {
    if (!mouseInCanvas()) return
    let handled = keyPresser(p5.keyCode)
    return !handled
  }

  p5.keyTyped = () => {
    if (!mouseInCanvas()) return
    keyHandler(p5.key, params)
    return false
  }

  const shiftAmount = 50
  const keyHandler = (char, params) => {
    switch (char) {
      case 'f':
        undo.takeSnapshot()
        flip(HORIZONTAL)
        break

      case 'F':
        undo.takeSnapshot()
        flip(VERTICAL)
        break

      case ' ':
        undo.takeSnapshot()
        paint(p5.mouseX, p5.mouseY, params)
        break

      case 'm':
        nextDrawMode(1, params)
        break
      case 'M':
        nextDrawMode(-1, params)
        break

      case 'o':
      case 'O':
        params.useOutline = !params.useOutline
        break

      case 'r':
      case 'R':
        reset(params)
        break

      case 's':
      case 'S':
        guiControl.swapParams()
        break

      case 't':
        undo.takeSnapshot()
        mirror(HORIZONTAL)
        break

      case 'T':
        undo.takeSnapshot()
        mirror(VERTICAL)
        break

      case 'u':
        undo.undo()
        break
      case 'U':
        undo.redo()
        break

      case 'w':
      case 'W':
        textManager.setText(guiControl.getBodyCopy())
        break

      case 'x':
        undo.takeSnapshot()
        shift(shiftAmount, shiftAmount)
        break
      case 'X':
        undo.takeSnapshot()
        shift(-shiftAmount, -shiftAmount)
        break

      case 'z':
        undo.takeSnapshot()
        shift(shiftAmount, -shiftAmount)
        break
      case 'Z':
        undo.takeSnapshot()
        shift(-shiftAmount, shiftAmount)
        break

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this[`macro${char}`](params, p5)
        break
    }
  }

  const macroWrapper = (f) => (params, layer) => {
    p5.push()
    undo.takeSnapshot()
    f({ ...params }, layer)
    p5.pop()
  }

  // these aren't "macros" as in recorded
  // but that's a hoped-for goal
  // in the meantime, they can be fun to use
  this.macro1 = macroWrapper((params, layer) => {
    drawGrid(20, 10, params, layer.width, layer.height, layer)
  })

  this.macro2 = macroWrapper((params, layer) => {
    drawCircle(89, 89, params, layer.width, layer.height, layer)
    drawCircle(50, 50, params, layer.width, layer.height, layer)
    drawCircle(40, 40, params, layer.width, layer.height, layer)
    drawCircle(30, 30, params, layer.width, layer.height, layer)
    drawCircle(100, 100, params, layer.width, layer.height, layer)
  })

  this.macro3 = macroWrapper((params, layer) => {
    for (var i = 1; i < layer.width; i += 10) {
      drawCircle(i, i, params, layer.width, layer.height, layer)
    }
  })

  // when INVERT is on THIS IS AMAZING
  // which suggests........
  this.macro4 = macroWrapper((params, layer) => {
    for (var i = layer.width; i > layer.width / 2; i -= 80) {
      if (i < ((layer.width / 3) * 2)) params.rotation = 90
      drawGrid(i, i, params, layer.width, layer.height)
    }
  })

  this.macro5 = macroWrapper((params, layer) => {
    drawGrid(4, 4, params, layer.width, layer.height)
  })

  this.macro6 = macroWrapper((params, layer) => {
    for (var i = 1; i < layer.width; i += 5) {
      drawGrid(i, layer.mouseY, params, layer.width, layer.height)
    }
  })

  // overrides. interesting. WHA???
  // and we overwrite this definition immedately, anyway
  // I recall _something_ about this. but do not recall now
  this.macro7 = macroWrapper((params, layer, overrides) => {
    params = this.defaultParams
    params.drawMode = 1 // grid
    params.fill_paintMode = 4
    params.fill_transparent = false
    params.useOutline = false
    params.nextCharMode = 0
    params = { ...params, ...overrides }
    const x = layer.mouseX
    const y = layer.mouseY
    drawGrid(x, y, params, layer.width, layer.height)
  })

  this.macro7 = macroWrapper((params, layer) => {
    params = this.defaultParams
    params.drawMode = 1 // grid
    params.fill_paintMode = 4
    params.fill_transparent = false
    params.useOutline = false
    params.nextCharMode = 0
    const x = layer.mouseX
    const y = layer.mouseY
    drawGrid(x, y, params, layer.width, layer.height)
  })

  this.macro8 = macroWrapper((params, layer) => {
    const width = layer.width / 2
    const height = layer.height / 2
    const x = layer.mouseX
    const y = layer.mouseY
    layer.translate(x, y)
    drawGrid(x, y, params, width, height)
  })

  // works GREAT with cumulativeRotation
  // only problem is the colors are identical no matter where
  this.macro9 = macroWrapper((params, layer) => {
    // take these out of HERE
    // and macro9 then passes in params and width/height
    // but it should also indicate WHERE it should start
    // the below assumes subdivision of the entire surfae

    params.invert = true
    const width = layer.width / 4
    const height = layer.height / 4
    const startX = 0
    const startY = 0

    function * txg (width, height) {
      for (let i = startX; i < layer.width / width; i++) {
        for (let j = startY; j < layer.height / height; j++) {
          yield { x: width * i, y: height * j }
        }
      }
      return 'done'
    }
    const txls = txg(width, height)
    // TODO: uh..... can we do a circle in here?
    const paint = gridder(width, height, params, layer)
    apx(paint)(txls)
  })

  // gridder/subGrid paints a given region
  const gridder = (width, height, params, layer) => (grid) => subGrid(grid.x, grid.y, width, height, params, layer)

  // TODO: subgrid should be a generator that we compose with dawgrid
  // because the generator (coupled with the xforms or size, above are the key elems)
  function subGrid (tx, ty, width, height, params, layer) {
    pushpop(layer)(() => {
      layer.translate(tx, ty)

      // the weird thing here is the rotation
      function * gen () {
        for (var i = width; i > width / 2; i -= 40) {
          const stats = { x: i, y: i, rotation: 0 }
          if (i < ((width / 3) * 2)) stats.rotation = 90
          yield stats
        }
      }

      // TODO: we're also adding in x,y to params, but they are ignored
      // STILL: pollution
      const dg = (stats) => drawGrid(stats.x, stats.y, { ...params, ...stats }, width, height, layer)
      // const dg = (stats) => drawCircle(width - stats.x, height - stats.y, { ...params, ...stats }, width, height, layer)
      // drawCirle doesn't quite work (the inversion? something - every radius is negative, so goes to 0.1)
      // turn off inversion, it works better, but size is still too large. fiddle around.
      apx(dg)(gen())
    })()
  }
}
