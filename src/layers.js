export default class Layers {
  constructor (p5, dl, temp) {
    this.p5 = p5 // TODO: rename
    this.drawingLayer = dl // p5.Graphics
    this.tempLayer = temp
    this.createdGraphics = new Set() // Track created graphics for cleanup
  }

  /**
   * Returns a p5.Graphics object that is a copy of the current drawing.
   * CALLER OWNS THE RETURNED GRAPHICS - must call dispose() or .remove() when done.
   * @returns {p5.Graphics} A new graphics object containing a copy of the current drawing
   */
  copy () {
    const layer = this.p5.createGraphics(this.p5.width, this.p5.height)
    layer.pixelDensity(this.p5.pixelDensity())
    layer.image(this.p5, 0, 0)
    // Caller owns this graphics object - not tracked here
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
    // Caller owns this graphics object - not tracked here
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
      this.createdGraphics.delete(graphics) // Remove from tracking if it was tracked
    }
  }

  /**
   * Clean up all tracked graphics objects
   */
  cleanup () {
    for (const graphics of this.createdGraphics) {
      if (graphics?.canvas) {
        graphics.remove()
      }
    }
    this.createdGraphics.clear()
  }

  /**
   * Set font for both main canvas and drawing layer.
   * Text rendering is core to this painting application.
   * @param {p5.Font|string} font The font to use for text rendering
   */
  setFont (font) {
    this.p5.textFont(font)
    this.drawingLayer.textFont(font)
  }

  /**
   * Set text size for both main canvas and drawing layer.
   * Text rendering is core to this painting application.
   * @param {number} size The size of text in pixels
   */
  textSize (size) {
    this.p5.textSize(size)
    this.drawingLayer.textSize(size)
  }
}
