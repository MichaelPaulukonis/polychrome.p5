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
    paint(mouseX, mouseY)
  }
}

function colorAlpha (aColor, alpha) {
  var c = color(aColor)
  return color('rgba(' + [red(c), green(c), blue(c), alpha].join(',') + ')')
}

function mousePressed () {
  if (!mouseInCanvas()) return
  fill(colorAlpha('#FFFFFF', 0.5))
  noStroke()
  if (params.fadeBackground) {
    rect(0, 0, width, height)
  }
}

function paint (xPos, yPos) {
  switch (parseInt(params.drawMode, 10)) {
    case 0:
    default:
      drawGrid(xPos, yPos)
      break
    case 1:
      drawCircle(xPos, yPos)
      break
  }
  params.fill.donePainting = true
  params.outline.donePainting = true
}

function drawCircle (xPos, yPos) {
  // maybe paint-mode would cycle through some of these variants
  // as well, not just grid-vs-circle?
  // what ELSE can be done in grids?

  // var r = (width /2 ) - xPos; // almost - but has nothing in the corners
  // var r = width - xPos;
  // another alternate version: width-xPos was off, but had VERY LARGE LETTERS
  // which was quite nice. - can painy on RIGHT-side of image

  // The radius of a circle
  var r = xPos // original version
  var circumference = 2 * PI * r
  var tx = xPos / 2
  if (tx < 1) tx = 1

  textSize(tx)

  push()
  // Start in the center and draw the circle
  translate(width / 2, height / 2)

  // We must keep track of our position avar the curve
  // offset the start/end povar based on mouse position...
  // this will change the while condition
  var arclength = 0

  // random chars until we've come... full-circle
  while (arclength < circumference) {
    // Instead of a constant width, we check the width of each character.
    const currentchar = t.getchar()
    var w = textWidth(currentchar)

    // Each box is centered so we move half the width
    arclength += w / 2
    // Angle in radians is the arclength divided by the radius
    // Starting on the left side of the circle by adding PI
    var theta = PI + arclength / r

    push()
    // Polar to cartesian coordinate conversion
    translate(r * cos(theta), r * sin(theta))
    // Rotate the "box" so letters conform to circle
    //    rotate(theta+PI/2); // rotation is offset by 90 degrees
    rotate(radians(params.rotation)) // this is an absolute rotation...
    // there are 2 * PI, or 6.28 radians
    // so make this a percentage multiplier....
    // TODO: combine the two, somehow?

    const sw = params.useOutline
      ? params.outline.strokeWeight
      : 0
    strokeWeight(sw)
    setPaintMode(yPos, yPos, params.fill, fill)
    setPaintMode(yPos, yPos, params.outline, stroke)

    text(currentchar, 0, 0)
    pop()
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

function drawGrid (xPos, yPos) {
  // negatives are possible, it seems....
  xPos = xPos < 5 ? 5 : xPos
  yPos = yPos < 5 ? 5 : yPos

  const gridParams = params.invert ? invertGridParm(xPos, height, width) : defaultGridParm(xPos, height, width)
  textSize(gridParams.step)
  for (var gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
    for (var gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
      paintActions(gridX, gridY, gridParams.step)
    }
  }

  function paintActions (gridX, gridY, step) {
    const sw = params.useOutline
      ? params.outline.strokeWeight
        ? params.outline.strokeWeight
        : (gridParams.step / 5)
      : 0
    strokeWeight(sw)
    setPaintMode(gridX, gridY, params.fill, fill)
    setPaintMode(gridX, gridY, params.outline, stroke)
    push()
    // move to the CENTER of the invisible rectangle [that we aren't drawing]
    translate(gridX + step / 4, gridY + step / 5)
    rotate(radians(params.rotation))
    const letter = params.nextCharMode === '1' ? t.getchar() : t.getcharRandom()
    text(letter, 0, 0)
    pop()
  }
}

function clearCanvas () {
  background(0, 0, 100)
}

var drawModes = 2 // shouldn't be constrained in here....
function nextDrawMode (direction, params) {
  let drawMode = params.drawMode
  drawMode = (drawMode + direction) % drawModes
  if (drawMode < 0) drawMode = drawModes - 1
  params.drawMode = drawMode
}

function nextpaintMode (direction, params) {
  params.paintMode = (params.paintMode + direction) % paintModes
  if (params.paintMode < 0) params.paintMode = paintModes - 1
  return params.paintMode
}

function nextRotation (direction, params) {
  var step = 5
  params.rotation = (params.rotation + step * direction) % 360
  if (params.rotation < 0) params.rotation = 360
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

function setPaintMode (gridX, gridY, params, func) {
  // TODO: I don't understand the third-parameter here, in HSB mode.
  const transparency = params.transparent ? parseInt(params.transparency, 10) / 100 : 100
  var mode = parseInt(params.paintMode, 10)
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
        const colors = urlToColors(params.scheme)
        if (params.donePainting) {
          params.curCycle = (params.curCycle + 1) % colors.length
          params.donePainting = false
        }
        func(colorAlpha(colors[params.curCycle], transparency))
      }
      break

    case 9:
      func(colorAlpha(params.color, transparency))
      break

    case 0:
    default:
      func(gridX, height - gridY, 100, transparency)
      break
  }
}

// only resets the angle, for now...
function reset () {
  params.rotation = 0
}

// TODO: tie this into dat.GUI
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
      nextpaintMode(1, params.fill)
    } else {
      nextpaintMode(-1, params.fill)
    }
  } else if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    handled = true
    if (keyCode === LEFT_ARROW) {
      nextRotation(-1)
    } else {
      nextRotation(1)
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
  keyHandler(key)
  return false
}

const shiftAmount = 50
function keyHandler (char) {
  switch (char) {
    case 'f':
      flip(HORIZONTAL)
      break

    case 'F':
      flip(VERTICAL)
      break

    case ' ':
      paint(mouseX, mouseY)
      break

    case 'm':
      nextDrawMode(1, params)
      break
    case 'M':
      nextDrawMode(-1, params)
      break

    case 'r':
    case 'R':
      reset()
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
      paint1()
      break

    case '2':
      paint2()
      break

    case '3':
      paint3()
      break

    case '4':
      paint4()
      break

    case '5':
      paint5()
      break

    case '6':
      paint6()
      break
  }
}

function paint1 () {
  drawGrid(20, 10)
}

function paint2 () {
  drawCircle(89, 89)
  drawCircle(50, 50)
  drawCircle(40, 40)
  drawCircle(30, 30)
  drawCircle(100, 100)
}

function paint3 () {
  for (var i = 1; i < width / 2; i += 10) {
    drawCircle(i, i)
  }
}

function paint4 () {
  var origRot = params.rotation
  for (var i = width; i > width / 2; i -= 20) {
    if (i < ((width / 3) * 2)) params.rotation = 90
    drawGrid(i, i)
  }
  params.rotation = origRot
}

function paint5 () {
  drawGrid(4, 4)
}

function paint6 () {
  for (var i = 1; i < width; i += 5) {
    drawGrid(i, mouseY)
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
// should work, but it does not
// https://forum.processing.org/two/discussion/22546/how-do-i-flip-video-in-canvas-horizontally-in-p5js
function flip (axis) {
  var screen = createImage(width, height, RGB)

  loadPixels()
  screen.pixels = pixels
  push()
  if (axis === HORIZONTAL) {
    scale(-1, 1)
    image(screen, width / 2, 0)
  } else {
    scale(1, -1)
    image(screen, 0, height / 2)
  }
  pop()
  updatePixels()
}
