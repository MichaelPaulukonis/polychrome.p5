// from http://jsfiddle.net/ho9thkvo/2/
function fitTextOnCanvas (text, fontface, fitwidth, p5) {
  var size = measureTextBinaryMethod(text, fontface, 0, fitwidth, fitwidth, p5)
  return size
}

function measureTextBinaryMethod (txt, fontface, min, max, desiredWidth, p5) {
  if (max - min < 1) {
    return min
  }
  var test = min + ((max - min) / 2) // Find half interval
  p5.textFont(fontface, test)
  let measureTest = p5.textWidth(txt)
  var found
  if (measureTest > desiredWidth) {
    found = measureTextBinaryMethod(txt, fontface, min, test, desiredWidth)
  } else {
    found = measureTextBinaryMethod(txt, fontface, test, max, desiredWidth)
  }
  return found
}
