export default class Layers {
  constructor (p5, dl, temp) {
    this.p5 = p5 // TODO: rename
    this.drawingLayer = dl   // p5.Graphics
    this.tempLayer = temp
  }

  /**
   * Returns a p5.Graphics object that is a copy of the current drawing
   */
  copy () {
    // this is copying, somewhat, the initLayer code
    // but whatevs.....
    const layer = this.p5.createGraphics(this.p5.width, this.p5.height)
    layer.pixelDensity(this.p5.pixelDensity())
    // layer.image(this.p5.get(), 0, 0) // makes things blurry??
    layer.image(this.p5, 0, 0)
    return layer
  }

  /**
   * Returns a p5.Graphics object that is a copy of the image passed in
   */
  clone (img) {
    const g = this.p5.createGraphics(img.width, img.height)
    g.pixelDensity(this.p5.pixelDensity())
    g.image(img, 0, 0)
    return g
  }

  setFont (font) {
    this.p5.textFont(font)
    this.drawingLayer.textFont(font)
  }

  textSize (size) {
    this.p5.textSize(size)
    this.drawingLayer.textSize(size)
  }
}
