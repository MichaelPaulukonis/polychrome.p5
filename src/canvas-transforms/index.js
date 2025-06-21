/**
 * Canvas Transforms Module - Public API
 *
 * Factory function for creating canvas transformation functionality
 * with dependency injection for easy testing and modularity.
 */

export { createCanvasTransforms } from './canvas-transforms.js'
export { HORIZONTAL, VERTICAL, flipCore, mirrorCore, newCorner } from './core-transforms.js'

const mirror = ({ axis, layer }) => {
  recordAction({ action: 'mirror', axis: axis === HORIZONTAL ? 'HORIZONTAL' : 'VERTICAL' }, getAppMode() !== APP_MODES.STANDARD_DRAW)
  const flippedLayer = mirrorCore(axis, layers.copy())
  layer.image(flippedLayer, 0, 0)
  // Add null check before removing
  if (flippedLayer && flippedLayer.canvas && flippedLayer.canvas.parentNode) {
    flippedLayer.remove()
  }
  renderLayers({ layers })
  globals.updatedCanvas = true
}
