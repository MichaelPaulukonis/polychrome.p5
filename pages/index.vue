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
    a#focus(href='#' alt='set focus to canvas') focus on canvas
  div
    textarea#bodycopy
    button#applytext
      | Apply text
    button#randomtext
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

const textManager = new TextManager()
textManager.randomPost = randomPost

export default {
  components: {
  },
  mounted () {
    const keypress = require('keypress.js')
    const guiControl = new GuiControl()

    const builder = (p5Instance) => {
      new Sketch({ p5Instance, guiControl, textManager, keypress }) // eslint-disable-line no-new
    }

    new P5(builder) // eslint-disable-line no-new
  },
  methods: {
    // loadPreset () {
    //   guiControl.gui.load(presets)
    // }
  }
}
</script>

<style>
@import "@/assets/css/core.css";
</style>
