/* Traditionally, text and image are segregated in Western Art.
   This sketch plays with those boundaries, providing an polychromatic
   text painting environment.
*/

import Undo from './undo.js'

var bodycopy = ['An sketch a day keeps the doctor away........*****xxx                                 ',
  `riverrun, past Eve and Adam's, from swerve of shore to bend 
of bay, brings us by a commodius vicus of recirculation back to 
Howth Castle and Environs. 

Sir Tristram, violer d'amores, fr'over the short sea, had passen- 
core rearrived from North Armorica on this side the scraggy 
isthmus of Europe Minor to wielderfight his penisolate war: nor 
had topsawyer's rocks by the stream Oconee exaggerated themselse 
to Laurens County's gorgios while they went doublin their mumper 
all the time: nor avoice from afire bellowsed mishe mishe to 
tauftauf thuartpeatrick: not yet, though venissoon after, had a 
kidscad buttended a bland old isaac: not yet, though all's fair in 
vanessy, were sosie sesthers wroth with twone nathandjoe. Rot a 
peck of pa's malt had Jhem or Shen brewed by arclight and rory 
end to the regginbrow was to be seen ringsome on the aquaface. 

The fall (bababadalgharaghtakamminarronnkonnbronntqnner- 
ronntuonnthunntrovarrhounawnskawntoohoohoordenenthur- 
nuk!) of a once wallstrait oldparr is retaled early in bed and later 
on life down through all christian minstrelsy. The great fall of the 
offwall entailed at such short notice the pftjschute of Finnegan, 
erse solid man, that the humptyhillhead of humself prumptly sends 
an unquiring one well to the west in quest of his tumptytumtoes: 
and their upturapikepointandplace is at the knock out in the park 
where oranges have been laid to rust upon the green since dev- 
linsfirst loved livvy. `]

const textInputBox = document.getElementById('bodycopy')

function getBodyCopy () {
  return textInputBox.value
}

function setBodyCopy (text) {
  textInputBox.value = text
}

export default function Sketch (p5, guiControl, textManager) {
  let params = guiControl.params
  let sketch = this

  var undo

  p5.setup = () => {
    const canvas = p5.createCanvas(900, 600)
    canvas.parent('sketch-holder')
    p5.textAlign(p5.CENTER, p5.CENTER)
    p5.colorMode(p5.HSB, p5.width, p5.height, 100, 1)
    sketch.clearCanvas()
    setBodyCopy(p5.random(bodycopy))
    textManager.setText(getBodyCopy())
    const textButton = document.getElementById('applytext')
    textButton.addEventListener('click', () => {
      textManager.setText(getBodyCopy())
    })
    guiControl.setupGui(this)
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

  p5.mousePressed = () => {
    if (!mouseInCanvas()) return

    if (params.fadeBackground) {
      p5.push()
      p5.fill(colorAlpha('#FFFFFF', 0.5))
      p5.noStroke()
      p5.rect(0, 0, p5.width, p5.height)
      p5.pop()
    }
  }

  p5.mouseReleased = () => {
    undo.takeSnapshot()
  }

  const DRAWING_MODE = {
    GRID: '0',
    CIRCLE: '1',
    ROWCOL: '2'
  }

  function paint (xPos, yPos, params) {
    // switch (parseInt(params.drawMode, 10)) {
    switch (params.drawMode) {
      case DRAWING_MODE.GRID:
      default:
        // yPos is ignored in drawGrid. hunh.
        drawGrid(xPos, yPos, params)
        break
      case DRAWING_MODE.CIRCLE:
        drawCircle(xPos, yPos, params)
        break
      case DRAWING_MODE.ROWCOL:
        drawRowCol(xPos, yPos, params)
        break
    }
    params.fill_donePainting = true
    params.outline_donePainting = true
  }

  // based on https://stackoverflow.com/a/846249/41153
  function logslider (position, max) {
    // position will be between 0 and 100
    var minp = 1
    var maxp = max

    // The result should be between 100 an 10000000
    var minv = Math.log(4)
    var maxv = Math.log(1000)

    // calculate adjustment factor
    var scale = (maxv - minv) / (maxp - minp)

    return Math.exp(minv + scale * (position - minp))
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
  function drawRowCol (xPos, yPos, params) {
    var rows = params.rows
    let cols = rows // tidally lock them together for the time being.

    var cellHeight = p5.height / rows
    var cellWidth = p5.width / cols

    p5.textAlign(p5.CENTER, p5.CENTER)

    // this kept ending up being almost the same as cellWidth everytime
    // so I just went with the fudge factor. :::sigh:::
    // let fontsize = fitTextOnCanvas('.', 'Arial', cellWidth)
    // textSize(fontsize)
    p5.textSize(cellWidth * 1.5)

    // const tSize = logslider(params.maxrows - rows, params.maxrows)
    // textSize(tSize)

    // this is part of the paint mode
    // but doesn't need to be set each iteration
    // so we have it here
    // and there, and there, and ....
    const sw = params.useOutline
      ? params.outline_strokeWeight
      : 0
    p5.strokeWeight(sw)
    p5.strokeJoin(params.outline_strokeJoin)
    const fetchText = textGetter(params.nextCharMode, textManager)

    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        // calculate cell position
        var pixelX = cellWidth * x
        var pixelY = cellHeight * y

        // add half to center letters
        pixelX += cellWidth / 2
        pixelY += cellHeight / 2

        setPaintMode(pixelX, pixelY, params, 'fill', p5.fill)
        setPaintMode(pixelX, pixelY, params, 'outline', p5.stroke)

        if (params.cumulativeRotation) {
          p5.rotate(p5.radians(params.rotation))
          // text(letter, gridX, gridY)
          p5.text(fetchText(), pixelX, pixelY)
        } else {
          p5.push()
          // translate(gridX + step / 4, gridY + step / 5)
          p5.rotate(p5.radians(params.rotation))
          // text(letter, 0, 0)
          p5.text(fetchText(), pixelX, pixelY)
          p5.pop()
        }

        p5.text(fetchText(), pixelX, pixelY)
      }
    }
  }

  function drawCircle (xPos, yPos, params) {
    // The radius of a circle
    let radius = params.invert ? (p5.width * 1.2 / 2) - xPos : xPos
    if (radius < 0) radius = 0.1
    var circumference = 2 * p5.PI * radius
    var tx = xPos / 2
    if (tx < 1) tx = 1

    p5.textSize(tx) // what if it was based on the yPos, which we are ignoring otherwise?
    // well, it's somewhat used for color - fade, in some cases

    p5.push()
    // Start in the center and draw the circle
    p5.translate(p5.width / 2, p5.height / 2)

    // We must keep track of our position avar the curve
    // offset the start/end povar based on mouse position...
    // this will change the while condition
    const sw = params.useOutline
      ? params.outline_strokeWeight
      : 0
    p5.strokeWeight(sw)
    p5.strokeJoin(params.outline_strokeJoin)

    setPaintMode(xPos, yPos, params, 'fill', p5.fill)
    setPaintMode(xPos, yPos, params, 'outline', p5.stroke)

    var arclength = 0
    // random chars until we've come... full-circle
    while (arclength < circumference) {
      // const currentchar = params.nextCharMode === '1' ? t.getchar() : t.getcharRandom()
      const currentchar = textGetter(params.nextCharMode, textManager)()

      // Instead of a constant p.width, we check the p.width of each character.
      var w = p5.textWidth(currentchar)
      // Each box is centered so we move half the p.width
      arclength += w / 2
      // Angle in radians is the arclength divided by the radius
      // Starting on the left side of the circle by adding PI
      var theta = p5.PI + arclength / radius

      if (params.cumulativeRotation) {
        p5.translate(radius * p5.cos(theta), radius * p5.sin(theta))
        p5.rotate(theta + p5.PI / 2 + p5.radians(params.rotation))
        p5.text(currentchar, 0, 0)
      } else {
        p5.push()
        // Polar to cartesian coordinate conversion
        p5.translate(radius * p5.cos(theta), radius * p5.sin(theta))
        p5.rotate(theta + p5.PI / 2 + p5.radians(params.rotation))
        p5.text(currentchar, 0, 0)
        p5.pop()
      }
      // Move halfway again
      arclength += w / 2
    }
    p5.pop()
  }

  const defaultGridParm = (xPos, height, width) => {
    const step = xPos + 5
    return {
      step: step,
      condy: (y) => y < p5.height,
      condx: (x) => x < p5.width,
      changey: (y) => y + step,
      changex: (x) => x + step,
      initY: 0,
      initX: 0
    }
  }

  const invertGridParm = (xPos, height, width) => {
    const step = p5.width - xPos + 5
    return {
      step: step,
      condy: (y) => y > 0,
      condx: (x) => x > 0,
      changey: (y) => y - step,
      changex: (x) => x - step,
      initY: p5.height,
      initX: p5.width
    }
  }

  // alternatively http://happycoding.io/examples/processing/for-loops/letters
  // cleaner?
  function drawGrid (xPos, yPos, params) {
    // negatives are possible, it seems....
    xPos = xPos < 5 ? 5 : xPos
    // yPos = yPos < 5 ? 5 : yPos

    const gridParams = params.invert ? invertGridParm(xPos, p5.height, p5.width) : defaultGridParm(xPos, p5.height, p5.width)
    p5.textSize(gridParams.step)
    const sw = params.useOutline
      ? params.outline_strokeWeight
        ? params.outline_strokeWeight
        : (gridParams.step / 5)
      : 0
    p5.strokeWeight(sw)
    p5.strokeJoin(params.outline_strokeJoin)

    for (var gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
      for (var gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
        paintActions(gridX, gridY, gridParams.step)
      }
    }

    function paintActions (gridX, gridY, step) {
      setPaintMode(gridX, gridY, params, 'fill', p5.fill)
      setPaintMode(gridX, gridY, params, 'outline', p5.stroke)
      const currentText = textGetter(params.nextCharMode, textManager)()

      if (params.cumulativeRotation) {
        p5.rotate(p5.radians(params.rotation))
        p5.text(currentText, gridX, gridY)
      } else {
        p5.push()
        p5.translate(gridX + step / 4, gridY + step / 5)
        p5.rotate(p5.radians(params.rotation))
        p5.text(currentText, 0, 0)
        p5.pop()
      }
    }
  }

  this.clearCanvas = function () {
    p5.background(0, 0, 100)
  }

  var drawModes = 3 // shouldn't be constrained in here....
  function nextDrawMode (direction, params) {
    let drawMode = params.drawMode
    drawMode = (drawMode + direction) % drawModes
    if (drawMode < 0) drawMode = drawModes - 1
    params.drawMode = drawMode
  }

  function nextpaintMode (direction, pPaintMode) {
    pPaintMode = (pPaintMode + direction) % paintModes
    if (pPaintMode < 0) pPaintMode = paintModes - 1
    return pPaintMode
  }

  function nextRotation (direction, params) {
    var step = 5
    params.rotation = (params.rotation + step * direction) % 360
    if (params.rotation > 360) params.rotation = 360
    if (params.rotation < -360) params.rotation = -360
  }

  let nextRow = (direction, params) => {
    params.rows = params.rows + direction
    if (params.rows > params.maxrow) params.rows = params.maxrow
    if (params.rows < 1) params.rows = 1
  }

  function colorAlpha (aColor, alpha) {
    var c = p5.color(aColor)
    return p5.color('rgba(' + [p5.red(c), p5.green(c), p5.blue(c), alpha].join(',') + ')')
  }
  // TODO: if these were.... functions, we could have an array, and not have to worry about counting the mode
  // also, functions could take params that could change them up a bit.....
  // like the grays - sideways, or something. angles....
  const paintModes = 9 // 0..n+1

  function setPaintMode (gridX, gridY, params, prefix, func) {
    func = func.bind(p5)
    // TODO: I don't understand the third-parameter here, in HSB mode.
    const transparency = params[`${prefix}_transparent`] ? parseInt(params[`${prefix}_transparency`], 10) / 100 : 100
    var mode = parseInt(params[`${prefix}_paintMode`], 10)
    switch (mode) {
      case 1:
        func(p5.width - gridX, gridY, 100, transparency)

        break

      case 2:
        func(gridX / 2, gridY / 2, 100, transparency)
        break

      case 3: // offset from default
        var x = (gridX + p5.width / 2) % p5.width
        var y = (p5.height - gridY + p5.height / 2) % p5.height
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
          const grayScaled = (gridY * 255) / p5.height
          func(grayScaled, transparency)
        }
        break

      case 7:
        {
          const grayScaled = (gridY * 255) / p5.height
          func(255 - grayScaled, transparency)
        }
        break

      // switches to next color in set with next character
      case 8:
        {
          const colors = guiControl.urlToColors(params[`${prefix}_scheme`])
          if (params[`${prefix}_donePainting`]) {
            params[`${prefix}_curCycle`] = (params[`${prefix}_curCycle`] + 1) % colors.length
            params[`${prefix}_donePainting`] = false
          }
          func(colorAlpha(colors[params[`${prefix}_curCycle`]], transparency))
        }
        break

      case 9:
        func(colorAlpha(params[`${prefix}_color`], transparency))
        break

      case 0:
      default:
        func(gridX, p5.height - gridY, 100, transparency)
        break
    }
  }

  // only resets the angle, for now...
  const reset = (params) => {
    params.rotation = 0
  }

  this.save_sketch = function () {
    const getDateFormatted = function () {
      var d = new Date()
      var df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
      return df
    }

    const pad = function (nbr, width, fill = '0') {
      nbr = nbr + ''
      return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
    }
    p5.saveCanvas(`${params.name}.${getDateFormatted()}.png`)
  }

  const keyPresser = (keyCode) => {
    let handled = false
    if (keyCode === p5.UP_ARROW || keyCode === p5.DOWN_ARROW) {
      handled = true
      if (keyCode === p5.UP_ARROW) {
        nextpaintMode(1, params.fill_paintMode)
      } else {
        nextpaintMode(-1, params.fill_paintMode)
      }
    } else if (keyCode === p5.LEFT_ARROW || keyCode === p5.RIGHT_ARROW) {
      handled = true
      // TODO: if mode is grid-2, mod row/col
      if (keyCode === p5.LEFT_ARROW) {
        if (params.drawMode === DRAWING_MODE.ROWCOL) {
          nextRow(-1, params)
        } else {
          nextRotation(-1, params)
        }
      } else {
        if (params.drawMode === DRAWING_MODE.ROWCOL) {
          nextRow(1, params)
        } else {
          nextRotation(1, params)
        }
      }
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
  function keyHandler (char, params) {
    // TODO: need to capture undo on most actions
    // HAH HAH HAH! ugh
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

      case 'u':
        undo.undo()
        break
      case 'U':
        undo.redo()
        break

      case 'w':
      case 'W':
        textManager.setText(getBodyCopy())
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
        undo.takeSnapshot()
        macro1(params)
        break

      case '2':
        undo.takeSnapshot()
        macro2(params)
        break

      case '3':
        undo.takeSnapshot()
        macro3(params)
        break

      case '4':
        undo.takeSnapshot()
        macro4(params)
        break

      case '5':
        undo.takeSnapshot()
        macro5(params)
        break

      case '6':
        undo.takeSnapshot()
        macro6(params)
        break
    }
  }

  function macro1 (params) {
    drawGrid(20, 10, params)
  }

  function macro2 (params) {
    drawCircle(89, 89, params)
    drawCircle(50, 50, params)
    drawCircle(40, 40, params)
    drawCircle(30, 30, params)
    drawCircle(100, 100, params)
  }

  function macro3 (params) {
    for (var i = 1; i < p5.width; i += 10) {
      drawCircle(i, i, params)
    }
  }

  function macro4 (params) {
    var origRot = params.rotation
    for (var i = p5.width; i > p5.width / 2; i -= 80) {
      if (i < ((p5.width / 3) * 2)) params.rotation = 90
      drawGrid(i, i, params)
    }
    params.rotation = origRot
  }

  function macro5 (params) {
    drawGrid(4, 4, params)
  }

  function macro6 (params) {
    for (var i = 1; i < p5.width; i += 5) {
      drawGrid(i, mouseY, params)
    }
  }

  // shift pixels in image
  // I'd love to be able to drag the image around, but I think that will require something else, but related
  function shift (verticalOffset, horizontalOffset) {
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

  var HORIZONTAL = 0
  var VERTICAL = 1
  function flip (axis) {
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
}