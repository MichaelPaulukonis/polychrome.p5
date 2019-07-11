export default class Layers {
  constructor (p5, dl) {
    this.p5 = p5 // TODO: rename
    this.drawingLayer = dl
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
