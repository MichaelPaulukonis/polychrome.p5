/**
 * Canvas Transforms Module
 *
 * Provides canvas transformation functions with dependency injection.
 * Handles recording, layer management, and integration with the sketch system.
 */

import { flipCore, mirrorCore, newCorner, HORIZONTAL, VERTICAL } from './core-transforms.js'

/**
 * Creates canvas transform functions with injected dependencies
 * @param {Object} dependencies - Required dependencies object
 * @param {Object} dependencies.layers - Layers management object
 * @param {Function} dependencies.recordAction - Function to record actions for playback
 * @param {Object} dependencies.globals - Global state object
 * @param {Function} dependencies.renderLayers - Function to render layers to main canvas
 * @param {Function} dependencies.initDrawingLayer - Function to create new drawing layers
 * @param {Function} dependencies.getAppMode - Function that returns current app mode
 * @param {Object} dependencies.APP_MODES - App mode constants
 * @param {Object} dependencies.params - Global parameters object
 * @param {Function} dependencies.getActiveZone - Function to get the active zone
 * @param {Function} dependencies.isZonePaintingActive - Function to check if zone painting is active
 * @returns {Object} Object containing transform functions
 */
export function createCanvasTransforms ({
  layers,
  recordAction,
  globals,
  renderLayers,
  initDrawingLayer,
  getAppMode,
  APP_MODES,
  params,
  getActiveZone,
  isZonePaintingActive
}) {
  /**
   * Flips canvas along specified axis
   * @param {Object} config - Configuration object
   * @param {number} config.axis - HORIZONTAL or VERTICAL
   * @param {Object} config.layer - Target layer to flip
   */
  const flip = ({ axis, layer }) => {
    const targetLayer = getActiveZone && getActiveZone() && isZonePaintingActive && isZonePaintingActive() ? getActiveZone().graphics : layer
    recordAction({ axis, layer: 'targetLayer', action: 'flip' }, getAppMode() !== APP_MODES.STANDARD_DRAW)

    const newLayer = flipCore(axis, layers.copy(targetLayer), layers)
    targetLayer.image(newLayer, 0, 0)
    if (!getActiveZone || !getActiveZone() || !isZonePaintingActive || !isZonePaintingActive()) {
      renderLayers({ layers })
    }
    newLayer.remove()
    globals.updatedCanvas = true
  }

  /**
   * Creates mirrored half-image along specified axis
   * @param {Object} cfg - Configuration object with defaults
   * @param {number} cfg.axis - HORIZONTAL or VERTICAL (default: VERTICAL)
   * @param {Object} cfg.layer - Target layer (default: layers.p5)
   */
  const mirror = (cfg = { axis: VERTICAL, layer: layers.p5 }) => {
    const targetLayer = getActiveZone && getActiveZone() && isZonePaintingActive && isZonePaintingActive() ? getActiveZone().graphics : cfg.layer
    recordAction({ ...cfg, layer: 'targetLayer', action: 'mirror' }, getAppMode() !== APP_MODES.STANDARD_DRAW)

    const tmp = layers.copy(targetLayer)
    const newLayer = mirrorCore(cfg.axis, tmp, layers)
    targetLayer.image(newLayer, 0, 0)
    if (!getActiveZone || !getActiveZone() || !isZonePaintingActive || !isZonePaintingActive()) {
      renderLayers({ layers })
    }
    // Add defensive null check before removing - fix for parentNode error
    if (newLayer?.canvas?.parentNode) {
      newLayer.remove()
    }
    if (tmp?.canvas?.parentNode) {
      tmp.remove()
    }
    globals.updatedCanvas = true
  }

  /**
   * Shifts pixels in image with wrapping
   * @param {Object} cfg - Configuration object with defaults
   * @param {number} cfg.verticalOffset - Vertical shift amount (default: 0)
   * @param {number} cfg.horizontalOffset - Horizontal shift amount (default: 0)
   */
  const shift = (cfg = { verticalOffset: 0, horizontalOffset: 0 }) => {
    recordAction({ ...cfg, action: 'shift' }, getAppMode() !== APP_MODES.STANDARD_DRAW)

    const targetLayer = getActiveZone && getActiveZone() && isZonePaintingActive && isZonePaintingActive() ? getActiveZone().graphics : layers.p5
    const context = targetLayer.drawingContext
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

    const cw = (cfg.horizontalOffset > 0 ? context.canvas.width : -context.canvas.width)
    const ch = (cfg.verticalOffset > 0 ? context.canvas.height : -context.canvas.height)

    context.putImageData(imageData, 0 + cfg.horizontalOffset, 0 + cfg.verticalOffset)
    if (cfg.horizontalOffset !== 0) {
      context.putImageData(imageData, 0 + cfg.horizontalOffset - cw, 0 + cfg.verticalOffset)
    }
    if (cfg.verticalOffset !== 0) {
      context.putImageData(imageData, 0 + cfg.horizontalOffset, 0 + cfg.verticalOffset - ch)
    }
    context.putImageData(imageData, 0 - cw + cfg.horizontalOffset, 0 - ch + cfg.verticalOffset)
    if (!getActiveZone || !getActiveZone() || !isZonePaintingActive || !isZonePaintingActive()) {
      renderLayers({ layers })
    }
    globals.updatedCanvas = true
  }

  /**
   * Rotates canvas 90 degrees in specified direction
   * @param {Object} config - Configuration object
   * @param {number} config.direction - 1 for clockwise, -1 for counter-clockwise (default: 1)
   * @param {number} config.height - Current canvas height
   * @param {number} config.width - Current canvas width
   * @param {Object} config.layers - Layers object
   * @param {Object} config.p5 - p5.js instance
   */
  const rotateCanvas = ({ direction = 1, height, width, layers: layersArg, p5 }) => {
    const zone = getActiveZone && getActiveZone()
    const isZoneActive = isZonePaintingActive && isZonePaintingActive()

    if (zone && isZoneActive) {
      const newPG = initDrawingLayer(zone.width, zone.height)
      newPG.push()
      newPG.translate(zone.width / 2, zone.height / 2)
      newPG.rotate(p5.radians(90 * direction))
      newPG.translate(-zone.width / 2, -zone.height / 2)
      newPG.image(zone.graphics, 0, 0)
      newPG.pop()
      zone.graphics.clear()
      zone.graphics.image(newPG, 0, 0)
      newPG.remove()
      globals.updatedCanvas = true
      return
    }

    recordAction({ action: 'rotateCanvas', direction, height, width }, getAppMode() !== APP_MODES.STANDARD_DRAW)

    // Store current canvas content in drawing layer before resize
    layersArg.drawingLayer.resetMatrix()
    layersArg.drawingLayer.image(p5, 0, 0)

    // Swap dimensions for 90-degree rotation
    const newWidth = height
    const newHeight = width

    // Update params to reflect new dimensions
    params.width = newWidth
    params.height = newHeight

    // Resize main canvas (this clears it as a side-effect)
    p5.resizeCanvas(newWidth, newHeight)

    // Create new graphics layer for rotated content
    const newPG = initDrawingLayer(newWidth, newHeight)
    newPG.push()

    // Set rotation origin based on direction
    if (direction === -1) {
      newPG.translate(0, newHeight)
    } else {
      newPG.translate(newWidth, 0)
    }

    // Apply 90-degree rotation and draw stored content
    newPG.rotate(p5.radians(90 * direction))
    newPG.image(layersArg.drawingLayer, 0, 0)
    newPG.pop()

    // Replace old drawing layer with rotated version
    layersArg.drawingLayer.remove()
    layersArg.drawingLayer = newPG

    // Note: Undo system doesn't track rotation operations
    renderLayers({ layers: layersArg })
    globals.updatedCanvas = true
  }

  /**
   * Wrapper function that provides simplified interface for canvas rotation
   * @param {number} direction - 1 for clockwise, -1 for counter-clockwise (default: 1)
   */
  const rotateWrapped = (direction = 1) => {
    return rotateCanvas({
      direction,
      height: params.height,
      width: params.width,
      layers,
      p5: layers.p5
    })
  }

  // Return the public API
  return {
    flip,
    mirror,
    shift,
    rotateCanvas,
    rotateWrapped,
    newCorner,
    HORIZONTAL,
    VERTICAL,
    // Export core functions for testing
    flipCore,
    mirrorCore
  }
}
