export default class Layers {
  constructor (p5, params, setFont) {
    this.p5 = p5
    this.params = params
    this.setFont = setFont

    this.scaleFactor = 1 // Initial value, will be updated by resize
    this.width = params.width
    this.height = params.height

    // Create initial canvases
    this.resize(this.width, this.height)
  }

  _createLayer (w, h) {
    const layer = this.p5.createGraphics(w, h)
    layer.pixelDensity(this.p5.pixelDensity())
    this.setFont(this.params.font, layer)
    layer.textAlign(this.p5.CENTER, this.p5.CENTER)
    this.initializeColorMode(layer, this.params)
    return layer
  }

  resize (newWidth, newHeight, copyContent = false) {
    this.width = newWidth
    this.height = newHeight

    const maxDisplayWidth = 1025
    const maxDisplayHeight = 650

    const widthRatio = this.width / maxDisplayWidth
    const heightRatio = this.height / maxDisplayHeight

    if (this.width > maxDisplayWidth || this.height > maxDisplayHeight) {
      this.scaleFactor = Math.max(widthRatio, heightRatio)
    } else {
      this.scaleFactor = 1
    }

    const displayWidth = this.width / this.scaleFactor
    const displayHeight = this.height / this.scaleFactor

    // Resize main canvas
    this.p5.resizeCanvas(displayWidth, displayHeight)

    // Preserve old drawing canvas content if requested
    const oldDrawingCanvas = this.drawingCanvas
    const oldUiCanvas = this.uiCanvas

    // Create new canvases
    this.drawingCanvas = this._createLayer(this.width, this.height)
    this.uiCanvas = this.p5.createGraphics(displayWidth, displayHeight)
    this.uiCanvas.pixelDensity(this.p5.pixelDensity())

    // Copy content from old to new drawing canvas if requested
    if (copyContent && oldDrawingCanvas) {
      this.drawingCanvas.image(oldDrawingCanvas, 0, 0)
    }

    if (oldDrawingCanvas) {
      oldDrawingCanvas.remove()
    }
    if (oldUiCanvas) {
      oldUiCanvas.remove()
    }
  }

  clear (backgroundColor) {
    this.drawingCanvas.background(backgroundColor)
  }

  initializeColorMode = (layer, params) => {
    layer.colorMode(this.p5.HSB, params.width, params.height, 100, 1)
    return layer
  }

  /**
   * Returns a p5.Graphics object that is a copy of the offscreen canvas.
   * CALLER OWNS THE RETURNED GRAPHICS - must call dispose() or .remove() when done.
   * @returns {p5.Graphics} A new graphics object containing a copy of the offscreen canvas.
   */
  copy () {
    const layer = this.p5.createGraphics(this.width, this.height)
    layer.pixelDensity(this.p5.pixelDensity())
    layer.image(this.drawingCanvas, 0, 0)
    return layer
  }

  /**
   * Returns a p5.Graphics object that is a copy of the image passed in.
   * CALLER OWNS THE RETURNED GRAPHICS - must call dispose() or .remove() when done.
   * @param {p5.Image|p5.Graphics} img The image to clone
   * @returns {p5.Graphics} A new graphics object containing a copy of the input image
   */
  clone (img) {
    const g = this.p5.createGraphics(img.width, img.height)
    g.pixelDensity(this.p5.pixelDensity())
    g.image(img, 0, 0)
    return g
  }

  /**
   * Properly dispose of a graphics object created by this layer system.
   * Safe to call on any p5.Graphics object.
   * @param {p5.Graphics} graphics The graphics object to dispose
   */
  dispose (graphics) {
    if (graphics?.canvas) {
      graphics.remove()
    }
  }

  /**
   * Set font for the offscreen canvas.
   * @param {p5.Font|string} font The font to use for text rendering
   */
  setFont (font) {
    this.drawingCanvas.textFont(font)
  }

  /**
   * Set text size for the offscreen canvas.
   * @param {number} size The size of text in pixels
   */
  textSize (size) {
    this.drawingCanvas.textSize(size)
  }
}
