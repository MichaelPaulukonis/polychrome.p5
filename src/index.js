// import P5 from 'p5'
import P5 from 'p5/lib/p5.min'
import GuiControl from './sketch/gui.js'

import TextManager from './sketch/TextManager'
import Sketch from './sketch/sketch.js'

console.log(`APP-VERSION: ${VERSION}`)

let gc = new GuiControl()
let t = new TextManager()

const builder = (p) => {
  new Sketch(p, gc, t) // eslint-disable-line no-new
}

new P5(builder) // eslint-disable-line no-new
