/**
 * Core Canvas Transform Functions
 *
 * Pure functions for canvas transformations that can be tested in isolation.
 * These functions take graphics objects and return transformed versions.
 */

// Transform direction constants
export const HORIZONTAL = 0 // up=>down
export const VERTICAL = 1 // left=>right

/**
 * Pure function to flip a graphics object along specified axis
 * @param {number} axis - HORIZONTAL or VERTICAL
 * @param {Object} sourceGraphics - Source p5.Graphics object to flip
 * @param {Object} layers - Layers object with clone method
 * @returns {Object} New flipped graphics object
 */
export const flipCore = (axis = VERTICAL, sourceGraphics, layers) => {
  const tmp = layers.clone(sourceGraphics)
  tmp.push()
  tmp.translate(0, 0)
  tmp.resetMatrix()

  if (axis === HORIZONTAL) {
    tmp.translate(0, tmp.height)
    tmp.scale(1, -1)
  } else {
    tmp.translate(tmp.width, 0)
    tmp.scale(-1, 1)
  }

  tmp.image(sourceGraphics, 0, 0, tmp.width, tmp.height)
  tmp.pop()
  return tmp
}

/**
 * Pure function to create a mirrored half-image along specified axis
 * @param {number} axis - HORIZONTAL or VERTICAL
 * @param {Object} sourceGraphics - Source p5.Graphics object to mirror
 * @param {Object} layers - Layers object with clone method
 * @returns {Object} New mirrored graphics object
 */
export const mirrorCore = (axis = VERTICAL, sourceGraphics, layers) => {
  const tmp = flipCore(axis, sourceGraphics, layers)

  if (axis === HORIZONTAL) {
    sourceGraphics.image(tmp, 0, sourceGraphics.height / 2, sourceGraphics.width, sourceGraphics.height / 2, 0, sourceGraphics.height / 2, sourceGraphics.width, sourceGraphics.height / 2)
  } else {
    sourceGraphics.image(tmp, sourceGraphics.width / 2, 0, sourceGraphics.width / 2, sourceGraphics.height, sourceGraphics.width / 2, 0, sourceGraphics.width / 2)
  }

  tmp.remove()
  return sourceGraphics
}

/**
 * Utility function for canvas corner rotation (currently unused but related)
 * @param {Object} layer - Graphics layer to transform
 */
export const newCorner = (layer) => {
  layer.translate(layer.width, 0)
  layer.rotate(layer.radians(90))
}
