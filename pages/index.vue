<template lang="pug">
#app
  #title polychrome text

  modal(
    name="textmanager"
    @closed="start"
  )
    textarea#bodycopy(v-model="currentText")
    .text-controls
      button#applytext(@click="resetTextPosition")
        | Apply text
      button#randomtext(@click="randomText")
        | Random text

  modal(
    name="about"
    @closed="start"
    )
    About

  modal(
    name="help"
    height="auto"
    @closed="start"
    )
    Help

  button(@click="show") textManager
  button#focus(@click="setFocus") focus on canvas
  button(@click="help") help
  button(@click="about") About
  div
    #sketch-holder
      // Our sketch will go here!
    noscript
      p JavaScript is required to view the contents of this page.

</template>
<script>
import P5 from 'p5'
import VModal from 'vue-js-modal'
import Help from '@/components/help'
import About from '@/components/about'
import TextManager from '@/assets/javascript/TextManager'
import Sketch from '@/assets/javascript/sketch.js'
import randomPost from '@/assets/javascript/tumblr-random.js'
import corpus from '@/assets/javascript/corpus.js'
import Macros from '@/assets/javascript/macros.js'
import { setupHotkeys } from '@/assets/javascript/keys.js'

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const textManager = new TextManager()
textManager.randomPost = randomPost
let pchrome

export default {
  components: {
    VModal,
    Help,
    About
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

    // TODO: switch over to https://craig.is/killing/mice

    // TODO: replicate macro controls in the new key-handler
    // I'm prettty sure we'll use sequential things for _something_
    const setupMacros = (sketch) => {
      const listener = new keypress.Listener()
      const macros = new Macros(sketch)
      const macroCount = Object.keys(macros).length + 1
      for (let i = 1; i <= macroCount; i++) {
        const m = `macro${i}`
        const digits = String(i).split('')
        listener.sequence_combo(`x ${digits.join(' ')} alt`, () => {
          macros[m](sketch)
          sketch.undo.takeSnapshot()
        }, true)
      }
      return macros
    }

    // callback when setup is complete
    // this might have obviated some of the maros setup. eh. whatevs.
    const setupCallback = (sketch) => {
      pchrome.macros = setupMacros(sketch)
      setupHotkeys({ sketch })
      this.hide()
    }

    const builder = (p5Instance) => {
      pchrome = new Sketch({ p5Instance, textManager, keypress, setupCallback }) // eslint-disable-line no-new
    }

    randomPost()
      .then((texts) => {
        this.corpus = this.corpus.concat(texts)
      })
      .catch()
      .finally((_) => {
        this.currentText = randElem(this.corpus)
        this.resetTextPosition()
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
    start () {
      pchrome.start()
    },
    show () {
      pchrome.stop()
      this.$modal.show('textmanager')
    },
    hide () {
      this.$modal.hide('textmanager')
      pchrome.start()
    },
    about () {
      pchrome.stop()
      this.$modal.show('about')
    },
    help () {
      pchrome.stop()
      this.$modal.show('help')
    }
  }
}
</script>

<style scoped>
/* @import "@/assets/css/core.css"; */
#title {
  background: linear-gradient(90deg, #f0f, #ff0);
  line-height: 1.5em;
  font-weight: 600;
  width: 25vw;
  letter-spacing: 0.1em;
  margin-bottom: 1em;
  padding: 1rem;
  font-size: 1.65em;
}

#bodycopy {
  width: 100%;
  height: 90%;
}

.text-controls {
  float: right;
}
</style>
