/**
 * Core generator functions for drawing modes
 */

import { hasNextCoord, nextCoord } from './drawing-utils.js'

/**
 * Generate coordinates for fixed-width grid layout
 * @param {Object} gridParams - Grid parameters with positioning info
 * @param {Function} nextText - Function to get next text character
 * @returns {Generator} Generator yielding {x, y, text} objects
 */
export const blocGeneratorFixedWidth = function * (gridParams, nextText) {
  for (let gridY = gridParams.initY; gridParams.condy(gridY); gridY = gridParams.changey(gridY)) {
    for (let gridX = gridParams.initX; gridParams.condx(gridX); gridX = gridParams.changex(gridX)) {
      const t = nextText()
      yield { x: gridX, y: gridY, text: t }
    }
  }
  return 'done'
}

/**
 * Generate coordinates for text-width-aware grid layout
 * @param {Function} nextText - Function to get next text character
 * @param {Object} gridSize - Grid dimensions {width, height}
 * @param {number} yOffset - Y offset for positioning
 * @param {Object} layer - p5.js graphics layer for text width calculations
 * @returns {Generator} Generator yielding {x, y, text} objects
 */
export const blocGeneratorTextWidth = function * (nextText, gridSize, yOffset, layer) {
  let t = nextText()
  let coords = { x: 0, y: yOffset }
  const offsets = { x: 0, y: yOffset }
  while (hasNextCoord(coords, gridSize, yOffset)) {
    yield { x: coords.x, y: coords.y, text: t }
    offsets.x = layer.textWidth(t)
    coords = nextCoord(coords, offsets, gridSize.width)
    t = nextText()
    if (t === ' ' && coords.x === 0) { t = nextText() }
  }
  return 'done'
}

/**
 * Generate coordinates for circular text layout
 * @param {Object} config - Circle configuration
 * @param {number} config.radius - Circle radius
 * @param {number} config.circumference - Total circumference to fill
 * @param {number} config.arcOffset - Offset angle for starting position
 * @returns {Function} Generator function that takes nextText and layer
 */
export const blocGeneratorCircle = ({ radius, circumference, arcOffset = 0 }) => {
  return function * (nextText, layer) {
    let arclength = arcOffset
    while (arclength < circumference + arcOffset) {
      const t = nextText()
      const w = layer.textWidth(t)
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
