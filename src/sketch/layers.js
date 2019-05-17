export default class Layers {
  constructor (p5, dl) {
    this.root = p5
    this.drawingLayer = dl
  }

  setFont (font) {
    this.root.textFont(font)
    this.drawingLayer.textFont(font)
  }

  textSize (size) {
    this.root.textSize(size)
    this.drawingLayer.textSize(size)
  }
}
