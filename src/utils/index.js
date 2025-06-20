/**
 * General utility functions
 */

/**
 * Apply multiple functions to a list
 * @param {...Function} fns - Functions to apply
 * @returns {Function} Function that takes a list and applies all functions to each item
 */
export const apx = (...fns) => list => [...list].map(b => fns.forEach(f => f(b)))

/**
 * Create a function that wraps another function with push/pop operations
 * @param {Object} layer - Layer object with push/pop methods
 * @returns {Function} Function that takes a function and returns a wrapped version
 */
export const pushpop = layer => f => () => {
  layer.push()
  try {
    f()
  } finally {
    layer.pop()
  }
}
