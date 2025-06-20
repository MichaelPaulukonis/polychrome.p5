/**
 * Drawing modes factory - creates drawing mode functions with injected dependencies
 */

import { createGridPainter } from './grid-painter.js'
import { createCirclePainter } from './circle-painter.js'
import { createRowColPainter } from './rowcol-painter.js'

/**
 * Create drawing modes with injected dependencies
 * @param {Object} dependencies - Required dependencies
 * @param {Object} dependencies.layers - Canvas layer system
 * @param {Object} dependencies.colorSystem - Color application functions
 * @param {Object} dependencies.hexStringToColors - Color conversion utility
 * @param {Object} dependencies.p5 - p5.js instance
 * @returns {Object} Drawing mode functions
 */
export const createDrawingModes = (dependencies) => {
  return {
    drawGrid: createGridPainter(dependencies),
    drawCircle: createCirclePainter(dependencies),
    drawRowCol: createRowColPainter(dependencies)
  }
}
