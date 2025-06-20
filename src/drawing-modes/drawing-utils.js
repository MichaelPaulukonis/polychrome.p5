/**
 * Shared utilities for drawing modes
 */

/**
 * Get text fetching function based on mode
 * @param {string} textMode - Mode: 'sequential', 'random', or 'word'
 * @param {Object} textManager - Text manager instance
 * @returns {Function} Text fetching function
 */
export const textGetter = (textMode, textManager) => {
  const tm = textMode.toLowerCase()
  const tfunc = tm === 'sequential'
    ? textManager.getchar
    : tm === 'random'
      ? textManager.getcharRandom
      : textManager.getWord
  return tfunc
}

/**
 * Configure shadow properties on a layer's drawing context
 * @param {Object} layer - p5.js graphics layer
 * @param {Object} inParams - Parameters containing shadow settings
 * @param {Object} p5 - p5.js instance for color creation
 */
export const setShadows = (layer, inParams, p5) => {
  const shadowDefault = {
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: p5.color('transparent')
  }

  const params = inParams.useShadow ? { ...{}, ...inParams } : { ...{}, ...shadowDefault }

  layer.drawingContext.shadowOffsetX = params.shadowOffsetX
  layer.drawingContext.shadowOffsetY = params.shadowOffsetY
  layer.drawingContext.shadowBlur = params.shadowBlur
  layer.drawingContext.shadowColor = params.shadowColor
}

/**
 * Calculate Y offset for text positioning
 * @param {number} textAscent - Text ascent value
 * @param {number} heightOffset - Additional height offset
 * @returns {number} Calculated Y offset
 */
export const getYoffset = (textAscent, heightOffset) => {
  let yOffset = textAscent + heightOffset
  yOffset = (yOffset > 2) ? yOffset : 3
  return yOffset
}

/**
 * Check if there are more coordinates available within grid bounds
 * @param {Object} coords - Current coordinates {x, y}
 * @param {Object} gridSize - Grid dimensions {width, height}
 * @param {number} yOffset - Y offset value
 * @returns {boolean} True if more coordinates are available
 */
export const hasNextCoord = (coords, gridSize, yOffset) => {
  return coords.x < gridSize.width && (coords.y - yOffset) < gridSize.height
}

/**
 * Calculate next coordinate position for text width mode
 * @param {Object} coords - Current coordinates {x, y}
 * @param {Object} offsets - Current offsets {x, y}
 * @param {number} gridWidth - Grid width
 * @returns {Object} Next coordinates {x, y}
 */
export const nextCoord = (coords, offsets, gridWidth) => {
  const nc = { ...coords }
  nc.x = nc.x + offsets.x
  if (nc.x + (0.25 * offsets.x) > gridWidth) {
    nc.x = 0
    nc.y = nc.y + offsets.y
  }
  return nc
}

/**
 * Calculate radius for circle drawing
 * @param {Object} params - Drawing parameters
 * @param {number} width - Canvas width
 * @param {number} xPos - X position (mouse/paint position)
 * @returns {number} Calculated radius (minimum 0.1)
 */
export const getRadius = (params, width, xPos) => {
  const radius = params.invert ? (width / 2) - xPos : xPos
  return radius < 0.1 ? 0.1 : radius
}

/**
 * Return value unless it's less than minimum
 * @param {number} val - Value to check
 * @param {number} min - Minimum allowed value
 * @returns {number} Original value or minimum
 */
export const maxUnlessLessThan = (val, min) => val < min ? min : val

/**
 * Calculate text size for circle drawing
 * @param {number} xPos - X position
 * @returns {number} Text size (minimum 1)
 */
export const textSizeCircle = (xPos) => {
  const tx = xPos / 2
  return maxUnlessLessThan(tx, 1)
}

/**
 * Translate, rotate, and render text
 * @param {Object} layer - p5.js graphics layer
 * @param {number} rotation - Rotation angle in degrees
 * @returns {Function} Function that performs text transformation
 */
export const trText = (layer, rotation) => (x, y, tx, ty, txt) => () => {
  if (tx !== 0 || ty !== 0) {
    layer.translate(tx, ty)
  }
  layer.rotate(layer.radians(rotation))
  layer.text(txt, x, y)
}
