/* Traditionally, text and image are segregated in Western Art.
   This sketch plays with those boundaries, providing an polychromatic
   text painting environment.
*/

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

var t
const textInputBox = document.getElementById('bodycopy')
var tempImage

function getBodyCopy () {
  return textInputBox.value
}

function setBodyCopy (text) {
  textInputBox.value = text
}

function setup () {
  const canvas = createCanvas(900, 600)
  canvas.parent('sketch-holder')
  textAlign(CENTER, CENTER)
  colorMode(HSB, width, height, 100, 1)
  clearCanvas()
  setBodyCopy(random(bodycopy))
  t = new TextManager(getBodyCopy())
  const textButton = document.getElementById('applytext')
  textButton.addEventListener('click', () => {
    t.setText(getBodyCopy())
  })
  setupGui()

  tempImage = loadImage('./polychrome.text.20180807.204308.png')
}

const mouseInCanvas = () => {
  return mouseY > 0 && mouseY < height && mouseX > 0 && mouseX < width
}

function draw () {
  // ignore mouse outside confines of window.
  // or you'll crash the app! or something....
  if (mouseIsPressed && mouseInCanvas()) {
    // TODO: if some modifier, drag the image around the screen
    // first call, save image, and keep it around for drag-drawing?
    paint(mouseX, mouseY, params)
  }
}

function mousePressed () {
  if (!mouseInCanvas()) return

  if (params.fadeBackground) {
    push()
    fill(colorAlpha('#FFFFFF', 0.5))
    noStroke()
    rect(0, 0, width, height)
    pop()
  }
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

// originally from http://happycoding.io/examples/processing/for-loops/letters
// a reminder of something simpler
function drawRowCol (xPos, yPos, params) {
  var rows = params.rows
  let cols = rows // tidally lock them together for the time being.

  var cellHeight = height / rows
  var cellWidth = width / cols

  textAlign(CENTER, CENTER)

  // this kept ending up being almost the same as cellWidth everytime
  // so I just went with the fudge factor. :::sigh:::
  // let fontsize = fitTextOnCanvas('.', 'Arial', cellWidth)
  // textSize(fontsize)
  textSize(cellWidth * 1.5)

  // const tSize = logslider(params.maxrows - rows, params.maxrows)
  // textSize(tSize)

  // this is part of the paint mode
  // but doesn't need to be set each iteration
  // so we have it here
  // and there, and there, and ....
  const sw = params.useOutline
    ? params.outline_strokeWeight
    : 0
  strokeWeight(sw)
  strokeJoin(params.outline_strokeJoin)
  const fetchText = params.nextCharMode === '1' ? t.getchar : t.getcharRandom

  for (var y = 0; y < rows; y++) {
    for (var x = 0; x < cols; x++) {
      // calculate cell position
      var pixelX = cellWidth * x
      var pixelY = cellHeight * y

      // add half to center letters
      pixelX += cellWidth / 2
      pixelY += cellHeight / 2

      setPaintMode_new(pixelX, pixelY, params, 'fill', fill)
      setPaintMode_new(pixelX, pixelY, params, 'outline', stroke)

      if (params.cumulativeRotation) {
        rotate(radians(params.rotation))
        // text(letter, gridX, gridY)
        text(fetchText(), pixelX, pixelY)
      } else {
        push()
        // translate(gridX + step / 4, gridY + step / 5)
        rotate(radians(params.rotation))
        // text(letter, 0, 0)
        text(fetchText(), pixelX, pixelY)
        pop()
      }

      text(fetchText(), pixelX, pixelY)
    }
  }
}

function drawCircle (xPos, yPos, params) {
  // The radius of a circle
  let r = params.invert ? (width * 1.2 / 2) - xPos : xPos
  if (r < 0) r = 0.1
  var circumference = 2 * PI * r
  var tx = xPos / 2
  if (tx < 1) tx = 1

  textSize(tx) // what if it was based on the yPos, which we are ignoring otherwise?
  // well, it's somewhat used for color - fade, in some cases

  push()
  // Start in the center and draw the circle
  translate(width / 2, height / 2)

  // We must keep track of our position avar the curve
  // offset the start/end povar based on mouse position...
  // this will change the while condition
  const sw = params.useOutline
    ? params.outline_strokeWeight
    : 0
  strokeWeight(sw)
  strokeJoin(params.outline_strokeJoin)

  setPaintMode_new(xPos, yPos, params, 'fill', fill)
  setPaintMode_new(xPos, yPos, params, 'outline', stroke)

  var arclength = 0
  // random chars until we've come... full-circle
  while (arclength < circumference) {
    const currentchar = params.nextCharMode === '1' ? t.getchar() : t.getcharRandom()
    // Instead of a constant width, we check the width of each character.
    var w = textWidth(currentchar)
    // Each box is centered so we move half the width
    arclength += w / 2
    // Angle in radians is the arclength divided by the radius
    // Starting on the left side of the circle by adding PI
    var theta = PI + arclength / r

    if (params.cumulativeRotation) {
      translate(r * cos(theta), r * sin(theta))
      rotate(theta + PI / 2 + radians(params.rotation))
      text(currentchar, 0, 0)
    } else {
      push()
      // Polar to cartesian coordinate conversion
      translate(r * cos(theta), r * sin(theta))
      rotate(theta + PI / 2 + radians(params.rotation))
      text(currentchar, 0, 0)
      pop()
    }
    // Move halfway again
    arclength += w / 2
  }
  pop()
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
function drawGrid (xPos, yPos, params) {
  // negatives are possible, it seems....
  xPos = xPos < 5 ? 5 : xPos
  // yPos = yPos < 5 ? 5 : yPos

  const gridParams = params.invert ? invertGridParm(xPos, height, width) : defaultGridParm(xPos, height, width)
  textSize(gridParams.step)
  const sw = params.useOutline
    ? params.outline_strokeWeight
      ? params.outline_strokeWeight
      : (gridParams.step / 5)
    : 0
  strokeWeight(sw)
  strokeJoin(params.outline_strokeJoin)

  for (var gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
    for (var gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
      paintActions(gridX, gridY, gridParams.step)
    }
  }

  function paintActions (gridX, gridY, step) {
    setPaintMode_new(gridX, gridY, params, 'fill', fill)
    setPaintMode_new(gridX, gridY, params, 'outline', stroke)
    const letter = params.nextCharMode === '1' ? t.getchar() : t.getcharRandom()

    if (params.cumulativeRotation) {
      rotate(radians(params.rotation))
      text(letter, gridX, gridY)
    } else {
      push()
      translate(gridX + step / 4, gridY + step / 5)
      rotate(radians(params.rotation))
      text(letter, 0, 0)
      pop()
    }
  }
}

function clearCanvas () {
  background(0, 0, 100)
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

// based on https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d
const urlToColors = (url) => {
  return url.split('/').pop().split('-').map((c) => '#' + c)
}
function colorAlpha (aColor, alpha) {
  var c = color(aColor)
  return color('rgba(' + [red(c), green(c), blue(c), alpha].join(',') + ')')
}
// TODO: if these were.... functions, we could have an array, and not have to worry about counting the mode
// also, functions could take params that could change them up a bit.....
// like the grays - sideways, or something. angles....
const paintModes = 9 // 0..n+1

function setPaintMode_new (gridX, gridY, params, prefix, func) {
  // TODO: I don't understand the third-parameter here, in HSB mode.
  const transparency = params[`${prefix}_transparent`] ? parseInt(params[`${prefix}_transparency`], 10) / 100 : 100
  var mode = parseInt(params[`${prefix}_paintMode`], 10)
  switch (mode) {
    case 1:
      func(width - gridX, gridY, 100, transparency)

      break

    case 2:
      func(gridX / 2, gridY / 2, 100, transparency)
      break

    case 3: // offset from default
      var x = (gridX + width / 2) % width
      var y = (height - gridY + height / 2) % height
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
        const grayScaled = (gridY * 255) / height
        func(grayScaled, transparency)
      }
      break

    case 7:
      {
        const grayScaled = (gridY * 255) / height
        func(255 - grayScaled, transparency)
      }
      break

    // switches to next color in set with next character
    case 8:
      {
        const colors = urlToColors(params[`${prefix}_scheme`])
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
      func(gridX, height - gridY, 100, transparency)
      break
  }
}

// only resets the angle, for now...
function reset (params) {
  params.rotation = 0
}

function save_sketch () {
  const getDateFormatted = function () {
    var d = new Date()
    var df = `${d.getFullYear()}${pad((d.getMonth() + 1), 2)}${pad(d.getDate(), 2)}.${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}${pad(d.getSeconds(), 2)}`
    return df
  }

  const pad = function (nbr, width, fill) {
    fill = fill || '0'
    nbr = nbr + ''
    return nbr.length >= width ? nbr : new Array(width - nbr.length + 1).join(fill) + nbr
  }
  saveCanvas(`${params.name}.${getDateFormatted()}.png`)
}

function keyPresser () {
  let handled = false
  if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
    handled = true
    if (keyCode === UP_ARROW) {
      nextpaintMode(1, params.fill_paintMode)
    } else {
      nextpaintMode(-1, params.fill_paintMode)
    }
  } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    handled = true
    // TODO: if mode is grid-2, mod row/col
    if (keyCode === LEFT_ARROW) {
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
  } else if (keyCode === BACKSPACE || keyCode === DELETE) {
    handled = true
    clearCanvas()
  }
  return handled
}

function keyPressed () {
  if (!mouseInCanvas()) return
  let handled = keyPresser(keyCode)
  return !handled
}

function keyTyped () {
  if (!mouseInCanvas()) return
  keyHandler(key, params)
  return false
}

const shiftAmount = 50
function keyHandler (char, params) {
  switch (char) {
    case 'f':
      flip(HORIZONTAL)
      break

    case 'F':
      flip(VERTICAL)
      break

    case ' ':
      paint(mouseX, mouseY, params)
      break

    case 'm':
      nextDrawMode(1, params)
      break
    case 'M':
      nextDrawMode(-1, params)
      break

    case 'r':
    case 'R':
      reset(params)
      break

    case 's':
    case 'S':
      save_sketch('screenshot####.png')
      break

    case 'w':
    case 'W':
      t.setText(getBodyCopy())
      break

    case 'x':
      shift(shiftAmount, shiftAmount)
      break
    case 'X':
      shift(-shiftAmount, -shiftAmount)
      break

    case 'z':
      shift(shiftAmount, -shiftAmount)
      break
    case 'Z':
      shift(-shiftAmount, shiftAmount)
      break

    case '1':
      macro1(params)
      break

    case '2':
      macro2(params)
      break

    case '3':
      macro3(params)
      break

    case '4':
      macro4(params)
      break

    case '5':
      macro5(params)
      break

    case '6':
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
  for (var i = 1; i < width; i += 10) {
    drawCircle(i, i, params)
  }
}

function macro4 (params) {
  var origRot = params.rotation
  for (var i = width; i > width / 2; i -= 80) {
    if (i < ((width / 3) * 2)) params.rotation = 90
    drawGrid(i, i, params)
  }
  params.rotation = origRot
}

function macro5 (params) {
  drawGrid(4, 4, params)
}

function macro6 (params) {
  for (var i = 1; i < width; i += 5) {
    drawGrid(i, mouseY, params)
  }
}

// shift pixels in image
// I'd love to be able to drag the image around, but I think that will require something else, but related
function shift (verticalOffset, horizontalOffset) {
  let context = this.drawingContext
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
  const d = pixelDensity()
  var tmp = createImage(width * d, height * d)
  tmp.loadPixels()
  loadPixels()
  for (let i = 0; i < pixels.length; i++) {
    tmp.pixels[i] = pixels[i]
  }
  tmp.updatePixels()
  push()
  if (axis === HORIZONTAL) {
    translate(0, height)
    scale(1, -1)
  } else {
    translate(width, 0)
    scale(-1, 1)
  }
  image(tmp, 0, 0, width, height)
  pop()
}
