// from http://jsfiddle.net/ho9thkvo/2/
function fitTextOnCanvas (text, fontface, fitwidth) {
  var size = measureTextBinaryMethod(text, fontface, 0, fitwidth, fitwidth)
  return size
}

function measureTextBinaryMethod (txt, fontface, min, max, desiredWidth) {
  if (max - min < 1) {
    return min
  }
  var test = min + ((max - min) / 2) // Find half interval
  textFont(fontface, test)
  let measureTest = textWidth(txt)
  var found
  if (measureTest > desiredWidth) {
    found = measureTextBinaryMethod(txt, fontface, min, test, desiredWidth)
  } else {
    found = measureTextBinaryMethod(txt, fontface, test, max, desiredWidth)
  }
  return found
}
