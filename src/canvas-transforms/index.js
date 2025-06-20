/**
 * Canvas Transforms Module - Public API
 *
 * Factory function for creating canvas transformation functionality
 * with dependency injection for easy testing and modularity.
 */

export { createCanvasTransforms } from './canvas-transforms.js'
export { HORIZONTAL, VERTICAL, flipCore, mirrorCore, newCorner } from './core-transforms.js'
