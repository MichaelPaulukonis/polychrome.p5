/**
 * Circle drawing mode implementation
 */

import { apx } from '@/src/utils'
import { textGetter, getRadius, textSizeCircle } from './drawing-utils.js'
import { blocGeneratorCircle } from './core-generators.js'

/**
 * Paint action for circle coordinates - handles text positioning and rotation
 * @param {Object} layer - p5.js graphics layer
 * @returns {Function} Function that takes radius and params and returns paint function
 */
const circlePaintAction = (layer) => (radius, params) => (theta, currentchar) => {
  if (!params.cumulativeRotation) { layer.push() }
  // Polar to cartesian coordinate conversion
  layer.translate(radius * layer.cos(theta), radius * layer.sin(theta))
  layer.rotate(theta + Math.PI / 2 + layer.radians(params.rotation))
  layer.text(currentchar, 0, 0)
  if (!params.cumulativeRotation) { layer.pop() }
}

/**
 * Create circle generator with configured parameters
 * @param {Object} config - Generator configuration
 * @param {number} config.radius - Circle radius
 * @param {Function} config.nextText - Text generation function
 * @param {Object} config.layer - p5.js graphics layer
 * @param {number} config.arcOffset - Arc offset
 * @param {number} config.arcPercent - Percentage of circle to fill
 * @returns {Generator} Circle coordinate generator
 */
const gimmeCircleGenerator = ({ radius, nextText, layer, arcOffset, arcPercent }) => {
  const circumference = (2 * Math.PI * radius) * (arcPercent / 100)
  return blocGeneratorCircle({ radius, circumference, arcOffset })(nextText, layer)
}

/**
 * Core circle painting logic
 * @param {Object} config - Painter configuration
 * @param {Object} config.params - Drawing parameters
 * @param {Object} config.layer - p5.js graphics layer
 * @param {number} config.xPos - X position
 * @param {Function} config.nextText - Text generation function
 * @param {number} config.width - Canvas width
 * @param {number} config.arcOffset - Arc offset
 * @param {number} config.arcPercent - Percentage of circle to fill
 */
const circlePainter = ({ params, layer, xPos, nextText, width, arcOffset, arcPercent }) => {
  const radius = getRadius(params, width, xPos)
  const paint = bloc => circlePaintAction(layer)(radius, params)(bloc.theta, bloc.text)
  const blocGen = gimmeCircleGenerator({ radius, nextText, layer, arcOffset, arcPercent })
  apx(paint)(blocGen)
}

/**
 * Create circle painter function
 * @param {Object} dependencies - Required dependencies
 * @returns {Function} Circle drawing function
 */
export const createCirclePainter = (dependencies) => {
  const {
    colorSystem,
    hexStringToColors
  } = dependencies

  /**
   * Draw text in circular pattern
   * @param {Object} params - Drawing parameters (immutable)
   * @returns {Object} Modified parameters and any side effects documented
   *
   * Side effects:
   * - Modifies layer graphics state (transforms, text properties)
   * - Does NOT modify input params object
   * - Caller responsible for renderLayers() call
   */
  return ({ xPos, yPos, params, width, layer, textSize, sizer, center, arcPercent = 100, arcOffset = params.arcOffset || 0, textManager }) => {
    // Use provided sizer or default circle text sizer
    const textSizer = sizer || textSizeCircle
    const ts = textSize || textSizer(xPos)
    layer.textSize(ts)

    layer.push()

    // Handle center positioning
    if (center) {
      layer.translate(center.x, center.y)
    } else {
      layer.translate(layer.width / 2, layer.height / 2) // center of layer
    }

    // Setup stroke properties
    const sw = params.useOutline
      ? params.outline.strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline.strokeJoin)

    // Apply colors
    colorSystem.setFillMode(xPos, yPos, params.fill, hexStringToColors, layer)
    colorSystem.setOutlineMode(xPos, yPos, params.outline, hexStringToColors, layer)

    // Generate and paint text
    const nextText = textGetter(params.nextCharMode, textManager)
    circlePainter({ params, layer, xPos, nextText, width, arcOffset, arcPercent })

    layer.pop()

    // Return any parameter modifications (none in this case)
    return {
      modifiedParams: null,
      sideEffects: [
        'Modified layer graphics state (transforms, text properties)',
        'Caller must call renderLayers() to display results'
      ]
    }
  }
}
