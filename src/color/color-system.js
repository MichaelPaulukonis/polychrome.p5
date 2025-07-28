/**
 * Color System Module for PolychromeText
 *
 * Provides factory functions for creating color-related functionality
 * including paint modes, color manipulation, and gamma adjustment.
 */

/**
 * Creates a color functions object with p5 instance and layers object captured in closure
 * @param {Object} p5Instance - The p5.js instance
 * @param {Object} layers - The layers object containing drawingCanvas
 * @returns {Object} Object containing color functions
 */
export function createColorFunctions (p5Instance, layers) {
  /**
   * Creates a color with specified alpha transparency
   * @param {string|Object} aColor - The base color
   * @param {number} alpha - Alpha value (0-1)
   * @returns {Object} p5.js color object with alpha
   */
  const colorAlpha = (aColor, alpha) => {
    const c = p5Instance.color(aColor)
    return p5Instance.color('rgba(' + [p5Instance.red(c), p5Instance.green(c), p5Instance.blue(c), alpha].join(',') + ')')
  }

  /**
   * Main color algorithm selector that applies various paint modes
   * @param {Object} props - Configuration object
   * @param {Function} props.func - The layer function to call (fill or stroke)
   * @param {number} props.gridX - X coordinate for color calculation
   * @param {number} props.gridY - Y coordinate for color calculation
   * @param {Object} props.params - Color parameters object
   * @param {Function} props.hexStringToColors - Function to parse hex color strings
   */
  const setPaintMode = (props) => {
    const { func, gridX, gridY, params, hexStringToColors } = props
    const layer = layers.drawingCanvas
    const boundFunc = func.bind(layer)
    const transparency = params.transparent ? parseInt(params.transparency, 10) / 100 : 1

    const mode = params.paintMode.toLowerCase()
    switch (mode) {
      // rainbow1 is the default, see the end
      case 'rainbow2':
        boundFunc(layer.width - gridX, gridY, 100, transparency)
        break

      // more pastel version of rainbow2
      case 'rainbow3':
        boundFunc(gridX / 2, gridY / 2, 100, transparency)
        break

      case 'rainbow4': {
        // offset from default
        const x = (gridX + layer.width / 2) % layer.width
        const y = (layer.height - gridY + layer.height / 2) % layer.height
        boundFunc(x, y, 100, transparency)
      }
        break

      case 'black':
        boundFunc(0, transparency)
        break

      case 'white':
        boundFunc(255, transparency)
        break

      case 'gray1':
        {
          const grayScaled = (gridY * 255) / layer.height
          boundFunc(grayScaled, transparency)
        }
        break

      case 'gray2':
        {
          const grayScaled = (gridY * 255) / layer.height
          boundFunc(255 - grayScaled, transparency)
        }
        break

      case 'solid':
        boundFunc(colorAlpha(params.color, transparency))
        break

      case 'lerp-scheme':
        {
          const colors = hexStringToColors(params.scheme)

          const color1 = layer.color(colors[0])
          const color2 = layer.color(colors[1])
          const color3 = colors[2] ? layer.color(colors[2]) : color1
          const color4 = colors[3] ? layer.color(colors[3]) : color2
          const amountX = (gridX / layer.width)
          const amountY = (gridY / layer.height)

          layer.push()
          layer.colorMode(layer.RGB)

          const l1 = layer.lerpColor(color1, color2, amountX)
          const l2 = layer.lerpColor(color3, color4, amountX)
          const l3 = layer.lerpColor(l1, l2, amountY)
          const alpha = (transparency * 255)
          l3.setAlpha(alpha)
          layer.pop()
          boundFunc(l3)
        }
        break

      case 'lerp-quad':
        {
          const color1 = layer.color(params.lerps[0])
          const color2 = layer.color(params.lerps[1])
          const color3 = params.lerps[2] ? layer.color(params.lerps[2]) : color1
          const color4 = params.lerps[3] ? layer.color(params.lerps[3]) : color2
          const amountX = (gridX / layer.width)
          const amountY = (gridY / layer.height)

          layer.push()
          layer.colorMode(layer.RGB)

          const l1 = layer.lerpColor(color1, color2, amountX)
          const l2 = layer.lerpColor(color3, color4, amountX)
          const l3 = layer.lerpColor(l1, l2, amountY)
          const alpha = (transparency * 255)
          l3.setAlpha(alpha)
          layer.pop()
          boundFunc(l3)
        }
        break

      case 'rainbow1':
      default:
        boundFunc(gridX, layer.height - gridY, 100, transparency)
        break
    }
  }

  /**
   * Creates fill mode function for the layer
   * @param {number} xPos - X position
   * @param {number} yPos - Y position
   * @param {Object} params - Fill parameters
   * @param {Function} hexStringToColors - Function to parse hex color strings
   */
  const setFillMode = (xPos, yPos, params, hexStringToColors) =>
    setPaintMode({ gridX: xPos, gridY: yPos, params, func: layers.drawingCanvas.fill, hexStringToColors })

  /**
   * Creates outline mode function for the layer
   * @param {number} xPos - X position
   * @param {number} yPos - Y position
   * @param {Object} params - Outline parameters
   * @param {Function} hexStringToColors - Function to parse hex color strings
   */
  const setOutlineMode = (xPos, yPos, params, hexStringToColors) =>
    setPaintMode({ gridX: xPos, gridY: yPos, params, func: layers.drawingCanvas.stroke, hexStringToColors })

  return {
    colorAlpha,
    setPaintMode,
    setFillMode,
    setOutlineMode
  }
}

/**
 * Creates gamma adjustment function with dependency injection
 * @param {Object} dependencies - Required dependencies
 * @param {Object} dependencies.layers - The layers object
 * @param {Function} dependencies.recordAction - Function to record actions
 * @param {Object} dependencies.globals - Global state object
 * @param {Function} dependencies.renderLayers - Function to render layers
 * @param {string} dependencies.appMode - Current application mode
 * @param {Object} dependencies.APP_MODES - Application mode constants
 * @returns {Function} Gamma adjustment function
 */
export function createGammaAdjustment (dependencies) {
  const { layers, recordAction, globals, renderLayers, appMode, APP_MODES } = dependencies

  /**
   * Applies gamma correction to the canvas
   * @param {Object} props - Gamma adjustment properties
   * @param {number} props.gamma - Gamma value (default: 0.8)
   */
  return function adjustGamma (props = { gamma: 0.8 }) {
    recordAction({ action: 'adjustGamma', gamma: props.gamma }, appMode !== APP_MODES.STANDARD_DRAW)

    const gammaCorrection = 1 / props.gamma
    const context = layers.p5.drawingContext
    const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height)

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 * (data[i] / 255) ** gammaCorrection
      data[i + 1] = 255 * (data[i + 1] / 255) ** gammaCorrection
      data[i + 2] = 255 * (data[i + 2] / 255) ** gammaCorrection
    }
    context.putImageData(imageData, 0, 0)
    renderLayers({ layers })
    globals.updatedCanvas = true
  }
}

/**
 * Initializes HSB color mode on a layer and returns the layer for chaining
 * @param {Object} layer - The graphics layer
 * @param {Object} p5Instance - The p5.js instance
 * @param {Object} params - Parameters object with width/height
 * @returns {Object} The layer (for chaining)
 */
// export function initializeColorMode (layer, p5Instance, params) {
//   layer.colorMode(p5Instance.HSB, params.width, params.height, 100, 1)
//   return layer
// }
