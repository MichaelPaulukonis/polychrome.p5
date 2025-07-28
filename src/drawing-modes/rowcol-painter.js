/**
 * RowCol drawing mode implementation
 */

import { pushpop } from '@/src/utils'
import { textGetter, trText } from './drawing-utils.js'
import { fitTextOnCanvas } from '@/src/fit.text'

/**
 * Create RowCol painter function
 * @param {Object} dependencies - Required dependencies
 * @param {Object} dependencies.layers - Canvas layer system
 * @param {Object} dependencies.colorSystem - Color application functions
 * @param {Object} dependencies.hexStringToColors - Color conversion utility
 * @param {Object} dependencies.p5 - p5.js instance
 * @returns {Function} RowCol drawing function
 */
export const createRowColPainter = (dependencies) => {
  const {
    layers,
    colorSystem,
    hexStringToColors
  } = dependencies

  /**
   * Draw text in row/column grid pattern
   * @param {Object} params - Drawing parameters (immutable)
   * @returns {Object} Modified parameters and any side effects documented
   *
   * Side effects:
   * - Modifies layer graphics state (text alignment, stroke properties)
   * - Does NOT modify input params object
   * - Calls renderLayers() to display results
   */
  return ({ params, width, height, layer, textManager }) => {
    const rows = params.rows
    const cols = params.columns // tidally lock them together for the time being.

    const cellHeight = height / rows
    const cellWidth = width / cols

    layer.textAlign(layer.CENTER, layer.CENTER)

    // Configure stroke properties
    const sw = params.useOutline
      ? params.outline.strokeWeight
      : 0
    layer.strokeWeight(sw)
    layer.strokeJoin(params.outline.strokeJoin)

    const fetchText = textGetter(params.nextCharMode, textManager)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let pixelX = cellWidth * x
        let pixelY = cellHeight * y

        pixelX += cellWidth / 2
        pixelY += cellHeight / 2

        colorSystem.setFillMode(pixelX, pixelY, params.fill, hexStringToColors)
        colorSystem.setOutlineMode(pixelX, pixelY, params.outline, hexStringToColors)

        let txt = fetchText()
        if (cols === 1 && txt.trim() === '') {
          txt = fetchText() // quick hack to skip spaces on single column mode
        }
        const fontSize = fitTextOnCanvas(txt, params.font, cellWidth, layer)
        layer.textSize(fontSize)

        const cum = trText(layer, params.rotation)(pixelX, pixelY, 0, 0, txt)
        const norm = pushpop(layer)(trText(layer, params.rotation)(0, 0, pixelX, pixelY, txt))
        params.cumulativeRotation ? cum() : norm()
      }
    }

    // Call renderLayers to display results
    const renderLayers = ({ layers }) => {
      layers.p5.image(layers.drawingCanvas, 0, 0)
    }
    renderLayers({ layers })

    // Return any parameter modifications (none in this case)
    return {
      modifiedParams: null,
      sideEffects: [
        'Modified layer graphics state (text alignment, stroke properties)',
        'Called renderLayers() to display results'
      ]
    }
  }
}
