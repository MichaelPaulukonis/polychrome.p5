<template lang="pug">
#content
  //- DatDotGui(
  //-   v-model="params"
  //-   @paramChange="paramUpdate"
  //-   )
  div
    #sketch-holder
      // Our sketch will go here!
    noscript
      p JavaScript is required to view the contents of this page.
  h1 polychrome text
  p#description
  p
    button#focus(@click="setFocus") focus on canvas
  div
    textarea#bodycopy(v-model="currentText")
    button#applytext(@click="resetTextPosition")
      | Apply text
    button#randomtext(@click="randomText")
      | Random text
  p
    | Mouse click and drag to paint (previous paints will fade slightly).
    br
    |  Color and size are based on mouse position.
    br
    span.keys SPACE
    |  - paint without fading previous actions
  p#sources
    | Source code:
    a(href='https://github.com/MichaelPaulukonis/polychrome.p5') GitHub
    |  - More
    a(href='http://www.xradiograph.com/PrantedMutter/Sketch') Web Sketches
    |  - Built with
    a(href='https://p5js.org/') P5.js
    | font: {{ params && params.font }}
</template>

<script>
import P5 from 'p5'
import TextManager from '@/assets/javascript/TextManager'
import Sketch from '@/assets/javascript/sketch.js'
// import GuiControl from '@/assets/javascript/gui.js'
import randomPost from '@/assets/javascript/tumblr-random.js'
import corpus from '@/assets/javascript/corpus.js'
import Macros from '@/assets/javascript/macros.js'
import { setupHotkeys } from '@/assets/javascript/keys.js'
// import { allParams } from '~/assets/javascript/params.js'
import { attachToP5 } from '@/assets/javascript/p5.gui'
// import DatDotGui from '@/components/DatDotGui'

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const textManager = new TextManager()
textManager.randomPost = randomPost
let pchrome
// let guiControl

export default {
  components: {
    // DatDotGui
  },
  data () {
    return {
      currentText: 'placeholder',
      corpus,
      params: {}
    }
  },
  mounted () {
    const keypress = require('keypress.js')

    // guiControl = new GuiControl()

    // TODO: replicate macro controls in the new key-handler
    // I'm prettty sure we'll use sequential things for _something_
    const setupMacros = (sketch) => {
      const listener = new keypress.Listener()
      const macros = new Macros(sketch)
      const macroCount = Object.keys(macros).length + 1
      for (let i = 1; i <= macroCount; i++) {
        const m = `macro${i}`
        const digits = String(i).split('')
        listener.sequence_combo(`alt x ${digits.join(' ')} alt`, () => {
          macros[m](sketch)
          sketch.undo.takeSnapshot()
        }, true)
      }
      return macros
    }

    // callback when setup is complete
    // this might have obviated some of the maros setup. eh. whatevs.
    const setupCallback = (sketch) => {
      // guiControl.setupGui(sketch, guiControl.fontPicker)
      pchrome.macros = setupMacros(sketch)
      setupHotkeys({ sketch })
    }

    const builder = (p5Instance) => {
      pchrome = new Sketch({ p5Instance, textManager, keypress, setupCallback }) // eslint-disable-line no-new
    }

    randomPost()
      .then((texts) => {
        this.corpus = this.corpus.concat(texts)
        this.currentText = randElem(this.corpus)
        this.resetTextPosition()
        attachToP5(P5)
        new P5(builder, 'sketch-holder') // eslint-disable-line no-new
      })
  },
  methods: {
    randomText () {
      const text = randElem(this.corpus)
      textManager.setText(text)
      this.currentText = text
    },
    resetTextPosition () {
      textManager.setText(this.currentText)
    },
    setFocus () {
      this.canvas().focus()
    },
    canvas () {
      return document.getElementsByTagName('canvas')[0]
    },
    paramUpdate (p) {
      // okay: proof we pass the stuff up
      // alert(`here is the ${JSON.stringify(p)}`)
      if (pchrome && pchrome.params) {
        console.log(pchrome.params.font, p.font)
        pchrome.params = p
        // guiControl.params = p
        // pchrome.randomLayer()
      }
    }
  }
}
</script>

<style>
@import "@/assets/css/core.css";
</style>
