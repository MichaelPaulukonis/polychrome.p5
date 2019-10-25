<template lang="pug">
#content
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
</template>

<script>
import P5 from 'p5'
import TextManager from '@/assets/javascript/TextManager'
import Sketch from '@/assets/javascript/sketch.js'
import GuiControl from '@/assets/javascript/gui.js'
import randomPost from '@/assets/javascript/tumblr-random.js'
import corpus from '@/assets/javascript/corpus.js'
const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const textManager = new TextManager()
textManager.randomPost = randomPost

export default {
  data () {
    return {
      currentText: 'placeholder',
      corpus
    }
  },
  mounted () {
    const keypress = require('keypress.js')
    const guiControl = new GuiControl()

    const builder = (p5Instance) => {
      new Sketch({ p5Instance, guiControl, textManager, keypress }) // eslint-disable-line no-new
    }

    randomPost()
      .then((texts) => {
        this.corpus = this.corpus.concat(texts)
        this.currentText = randElem(corpus)
        this.resetTextPosition()
        new P5(builder) // eslint-disable-line no-new
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
    }
  }
}
</script>

<style>
@import "@/assets/css/core.css";
</style>
