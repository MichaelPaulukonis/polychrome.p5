/* Traditionally, text and image are segregated in Western Art.
   This sketch plays with those boundaries, providing an polychromatic
   text painting environment.

   inspired by Marco Scarfagna's sketch https://class.coursera.org/compartsprocessing-001/forum/thread?thread_id=145#post-1804
   https://class.coursera.org/compartsprocessing-001/forum/profile?user_id=536813
*/

var bodycopy = 'An sketch a day keeps the doctor away........*****xxx                                 '
setBodyCopy(bodycopy)
var curRot = 0
var t

function getBodyCopy () {
  return document.getElementById('bodycopy').value
}

function setBodyCopy (text) {
  document.getElementById('bodycopy').value = text
}

function setup () {
  createCanvas(900, 600)
  // createCanvas(90,60);
  // strokeWeight(2);
  textAlign(CENTER, CENTER)
  colorMode(HSB, width, height, 100)
  clearScreen()
  t = new TextManager(getBodyCopy())
}

function draw () {
  // ignore mouse outside confines of window.
  // or you'll crash the app! or something....
  if (mouseIsPressed && mouseY > 0 && mouseY < height &&
        mouseX > 0 && mouseX < width) {
    paint(mouseX, mouseY)
  }
}

function colorAlpha (aColor, alpha) {
  var c = color(aColor)
  return color('rgba(' + [red(c), green(c), blue(c), alpha].join(',') + ')')
}

function mousePressed () {
  fill(colorAlpha('#FFFFFF', 0.5))
  noStroke()
  rect(0, 0, width, height)
}

function paint (xPos, yPos) {
  switch (drawMode) {
    case 0:
    default:
      drawGrid(xPos, yPos)
      break
    case 1:
      drawCircle(xPos, yPos)
      break
  }
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
    currentchar = t.getchar()
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
    rotate(radians(curRot)) // this is an absolute rotation...
    // there are 2 * PI, or 6.28 radians
    // so make this a percentage multiplier....
    // TODO: combine the two, somehow?

    // Display the character
    // this is again ANOTHER paint mode, effectively
    // since it is not grid-based. hrm.....
    setpaintMode(yPos, yPos)
    text(currentchar, 0, 0)
    pop()
    // Move halfway again
    arclength += w / 2
  }
  pop()
}

function drawGrid (xPos, yPos) {
  var stepX = xPos + 5
  textSize(stepX)

  for (var gridY = 0; gridY < height; gridY += stepX) {
    for (var gridX = 0; gridX < width; gridX += stepX) {
      setpaintMode(gridX, gridY)

      // stroke(255);
      // var letter = t.getcharRandom(); // this is the original; modified for text-dumping
      // should be a setting, I guess
      var letter = t.getchar()

      push()

      // move to the CENTER of the invisible rectangle [that we aren't drawing]
      // to be honest, stepX/5 was found experimentally.
      // since characters can be all over the place in the max/min of the font
      // it's really hard [for me] to find a good all-over alignment
      // and this is wonky with rotation (see horizontal roation, f'r example)
      translate(gridX + stepX / 2, gridY + stepX / 5)

      rotate(radians(curRot))
      text(letter, 0, 0)

      pop()
    }
  }
}

function getText () {
  var i = random(bodycopy.length())
  return bodycopy.charAt(i)
}

// TODO rename Screen to canvas ?
function clearScreen () {
  background(0, 0, 100)
}

var drawMode = 0
var drawModes = 2
function nextDrawMode (direction) {
  drawMode = (drawMode + direction) % drawModes
  if (drawMode < 0) drawMode = drawModes - 1
}

function nextpaintMode (direction) {
  currentpaintMode = (currentpaintMode + direction) % paintModes
  if (currentpaintMode < 0) currentpaintMode = paintModes - 1

  return currentpaintMode
}

function nextRotation (direction) {
  var step = 5
  curRot = (curRot + step * direction) % 360
  if (curRot < 0) curRot = 360
}

var paintModes = 4 // 1..n
var currentpaintMode = 0
function setpaintMode (gridX, gridY) {
  // TODO: I don't understand the third-parameter here, in HSB mode.

  switch (currentpaintMode) {
    case 1:
      fill(width - gridX, gridY, 100, 100)
      break

    case 2:
      fill(gridX / 2, gridY / 2, 900, 180)
      break

    case 3: // offset from default
      var x = (gridX + width / 2) % width
      var y = (height - gridY + height / 2) % height
      fill(x, y, 900, 180)
      break

    case 0:
    default:
      fill(gridX, height - gridY, 900, 180)
      break
  }
}

// only resets the angle, for now...
function reset () {
  curRot = 0
}

function save_sketch () {
  // TODO: temp-name method needed
  saveCanvas('polychrome.text.####.png')
}

function keyPressed () {
  if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
    if (keyCode == UP_ARROW) {
      nextpaintMode(1)
    } else {
      nextpaintMode(-1)
    }
  }
  if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) {
    if (keyCode == LEFT_ARROW) {
      nextRotation(-1)
    } else {
      nextRotation(1)
    }
  }

  if (keyCode == BACKSPACE || keyCode == DELETE) {
    clearScreen()
  }

  switch (key) {
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
      nextDrawMode(1)
      break
    case 'M':
      nextDrawMode(-1)
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
      shift(10, 0)
      break
    case 'X':
      shift(-10, 0)
      break

    case 'z':
      shift(0, -10)
      break
    case 'Z':
      shift(0, 10)
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
  var origRot = curRot
  for (var i = width; i > width / 2; i -= 20) {
    if (i < ((width / 3) * 2)) curRot = 90
    drawGrid(i, i)
  }
  curRot = origRot
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
// http://processing.org/reference/var_loadPixels_.html
// http://processing.org/discourse/beta/num_1269545825.html
function shift (verticalOffset, horizontalOffset) {
  var screen = createImage(width, height, RGB)
  var temp = createImage(width, height, RGB)

  loadPixels()
  screen.pixels = pixels
  // screen.loadPixels();

  var offset = verticalOffset * width + horizontalOffset
  var totPixels = pixels.length

  for (var i = 0; i < totPixels; i++) {
    var orig = (i + offset) % totPixels
    if (orig < 0) orig += totPixels // nope, not quite; (???)
    pixels[i] = screen.pixels[orig]
  }

  // screen.pixels = temp.pixels;
  // screen.updatePixels();
  // image(screen, 0, 0);
  updatePixels()
}

var HORIZONTAL = 0
var VERTICAL = 1
function flip (axis) {
  var screen = createImage(width, height, RGB)

  loadPixels()
  screen.pixels = pixels
  push()
  if (axis == HORIZONTAL) {
    scale(-1, 1)
    image(screen, width / 2, 0)
  } else {
    scale(1, -1)
    image(screen, 0, height / 2)
  }
  pop()
  updatePixels()
}

class TextManager {
  constructor (text) {
    var defaultText = 'These are the pearls that were his eyes'
    var randomText = defaultText + '...........---___*****xxx                                            '
    var SPLIT_TOKENS = ' ?.,;:[]<>()"'
    var words = []
    var charIndex = 0
    var wordIndex = 0
    this.w = text || defaultText
    words = splitTokens(this.w, SPLIT_TOKENS)
    // getchar and getWord indexes are not yoked together
    this.getchar = function () {
      var c = this.w.charAt(charIndex)
      charIndex = (charIndex + 1) % this.w.length
      return c
    }
    this.getcharRandom = function () {
      var c = randomText.charAt(random(randomText.length))
      return c
    }
    this.getWord = function () {
      var word = words[wordIndex]
      wordIndex = (wordIndex + 1) % words.length
      return word
    }
    this.getText = function () {
      return this.w
    }
  }

  setText (text) {
    this.w = text
  }
}
