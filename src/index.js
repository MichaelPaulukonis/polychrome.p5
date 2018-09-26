import P5 from 'p5'
import GuiControl from './sketch/gui.js'

import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'

console.log(`APP-VERSION: ${VERSION}`)

let gc = new GuiControl()
let t = new TextManager()

function builder (p) {
  myP5 = new Sketch(p, gc, t)
}

var myP5 = new P5(builder)
