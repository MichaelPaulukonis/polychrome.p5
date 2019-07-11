// from http://jsfiddle.net/ho9thkvo/2/
const fitTextOnCanvas = (text, fontface, fitwidth, layer) => {
  var size = measureTextBinaryMethod(text, fontface, 0, fitwidth, fitwidth, layer)
  return size
}

const measureTextBinaryMethod = (txt, fontface, min, max, desiredWidth, layer) => {
  if (max - min < 1) {
    return min
  }
  var test = min + ((max - min) / 2) // Find half interval
  layer.textFont(fontface, test)
  let measureTest = layer.textWidth(txt) // doesn't fit height. ok? hrm.....
  var found
  if (measureTest > desiredWidth) {
    found = measureTextBinaryMethod(txt, fontface, min, test, desiredWidth, layer)
  } else {
    found = measureTextBinaryMethod(txt, fontface, test, max, desiredWidth, layer)
  }
  return found
}

module.exports = { fitTextOnCanvas }
