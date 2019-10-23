<template>
  <div id="content">
    <div>
      <div id="sketch-holder">
        <!-- Our sketch will go here! -->
      </div>
      <noscript>
        <p>JavaScript is required to view the contents of this page.</p>
      </noscript>
    </div>
    <h1>polychrome text</h1>
    <p id="description" />
    <p>
      <a
        id="focus"
        href="#"
        alt="set focus to canvas"
      >focus on canvas</a>
    </p>
    <div>
      <textarea id="bodycopy" />
      <button id="applytext">
        Apply text
      </button>
    </div>
    <p>
      Mouse click and drag to paint (previous paints will fade slightly).
      <br> Color and size are based on mouse position.
      <br>
      <span class="keys">SPACE</span> - paint without fading previous actions
    </p>
    <p id="sources">
      Source code:
      <a href="https://github.com/MichaelPaulukonis/polychrome.p5">GitHub</a> - More
      <a href="http://www.xradiograph.com/PrantedMutter/Sketch">Web Sketches</a> - Built with
      <a href="https://p5js.org/">P5.js</a>
    </p>
  </div>
</template>

<script>
// import GuiControl from '@/assets/javascript/gui.js'
import TextManager from '@/assets/javascript/TextManager'
import Sketch from '@/assets/javascript/sketch.js'
import GuiControl from '@/assets/javascript/gui.js'

export default {
  components: {
  },
  mounted () {
    const P5 = require('p5')
    const keypress = require('keypress.js')
    const guiControl = new GuiControl()
    const textManager = new TextManager()

    const builder = (p5Instance) => {
      new Sketch({ p5Instance, guiControl, textManager, keypress }) // eslint-disable-line no-new
    }

    new P5(builder) // eslint-disable-line no-new
  }
}
</script>

<style>
@import "@/assets/css/core.css";
</style>
