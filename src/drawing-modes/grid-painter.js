/**
 * Grid drawing mode implementation
 */

import { apx, pushpop } from '@/src/utils'
import { textGetter, setShadows, getYoffset, trText } from './drawing-utils.js'
import { blocGeneratorFixedWidth, blocGeneratorTextWidth } from './core-generators.js'

/**
 * Create default grid parameters for normal direction
 * @param {number} xPos - X position (step size)
 * @param {number} height - Canvas height
 * @param {number} width - Canvas width
 * @returns {Object} Grid parameters
 */
const defaultGridParm = (xPos, height, width) => {
  const step = xPos + 5
  return {
    step,
    condy: y => y < height,
    condx: x => x < width,
    changey: y => y + step,
    changex: x => x + step,
    initY: 0,
    initX: 0
  }
}

/**
 * Create inverted grid parameters for reverse direction
 * @param {number} xPos - X position
 * @param {number} height - Canvas height
 * @param {number} width - Canvas width
 * @returns {Object} Inverted grid parameters
 */
const invertGridParm = (xPos, height, width) => {
  const step = width - xPos + 5
  return {
    step,
    condy: y => y > 0,
    condx: x => x > 0,
    changey: y => y - step,
    changex: x => x - step,
    initY: height,
    initX: width
  }
}

/**
 * Create grid painter function
 * @param {Object} dependencies - Required dependencies
 * @returns {Function} Grid drawing function
 */
export const createGridPainter = (dependencies) => {
  const {
    layers,
    colorSystem,
    hexStringToColors,
    p5
  } = dependencies

  /**
   * Draw text in grid pattern
   * @param {Object} params - Drawing parameters (immutable)
   * @returns {Object} Modified parameters and any side effects documented
   *
   * Side effects:
   * - Modifies layer graphics state (shadows, transforms, text properties)
   * - Does NOT modify input params object
   * - Caller responsible for renderLayers() call
   */
  return ({ xPos, params, width, height, layer, textManager }) => {
    // Prevent negatives and too-tiny letters
    const adjustedXPos = xPos < 5 ? 5 : xPos

    setShadows(layer, params, p5)

    layer.push()
    layer.translate(params.inset, params.inset)
    const adjustedWidth = width - (params.inset * 2)
    const adjustedHeight = height - (params.inset * 2)

    // Setup grid parameters
    const gridParams = params.invert
      ? invertGridParm(adjustedXPos, adjustedHeight, adjustedWidth)
      : defaultGridParm(adjustedXPos, adjustedHeight, adjustedWidth)

    layer.textSize(gridParams.step)
    // This is weird - textAscent goes to the parent p5 instance which is set to 12
    // TODO: document this weirdness (source I mean, in the code? still?)
    // used below: const yOffset = getYoffset(layer.textAscent(), 0)
    layers.p5.textSize(gridParams.step)

    // Configure stroke
    const sw = params.useOutline
      ? params.outline.strokeWeight
        ? params.outline.strokeWeight
        : (gridParams.step / 5)
      : 0
    layer.strokeWeight(sw / 4)
    layer.strokeJoin(params.outline.strokeJoin)

    // Configure text alignment
    if (params.fixedWidth) {
      layer.textAlign(layer.CENTER, layer.CENTER)
    } else {
      layer.textAlign(layer.LEFT, layer.BOTTOM)
    }

    // Setup text and paint functions
    const nextText = textGetter(params.nextCharMode, textManager)
    const fill = bloc => colorSystem.setFillMode(bloc.x, bloc.y, params.fill, hexStringToColors, layer)
    const outline = params.useOutline
      ? bloc => colorSystem.setOutlineMode(bloc.x, bloc.y, params.outline, hexStringToColors, layer)
      : () => {}

    const step = params.fixedWidth ? gridParams.step : 0
    const paint = bloc => {
      const cum = trText(layer, params.rotation)(bloc.x, bloc.y, 0, 0, bloc.text)
      const norm = pushpop(layer)(trText(layer, params.rotation)(0, 0, bloc.x + step / 4, bloc.y + step / 5, bloc.text))
      params.cumulativeRotation ? cum() : norm()
    }
    const yOffset = getYoffset(layer.textAscent(), 0)

    // Generate coordinates and paint
    const blocGen = params.fixedWidth
      ? blocGeneratorFixedWidth(gridParams, nextText)
      : blocGeneratorTextWidth(nextText, { width: adjustedWidth, height: adjustedHeight }, yOffset, layer)

    // Apply fill, outline, and paint to each coordinate block
    apx(fill, outline, paint)(blocGen)

    layer.pop()

    // Return any parameter modifications (none in this case)
    return {
      modifiedParams: null,
      sideEffects: [
        'Modified layer graphics state (shadows, transforms, text properties)',
        'Caller must call renderLayers() to display results'
      ]
    }
  }
}
