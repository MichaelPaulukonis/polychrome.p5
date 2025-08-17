<template lang="pug">
#app
  #title polychrome text

  UModal(v-model="isTextManagerOpen")
    textarea#bodycopy(v-model="currentText")
    .text-controls
      button#applytext(@click="resetTextPosition")
        | Apply text
      button#randomtext(@click="randomText")
        | Random text

  UModal(v-model="isAboutOpen")
    About

  UModal(v-model="isHelpOpen")
    Help

  UModal(v-model="isPlaybackOpen")
    Playback(
      v-if="isPchromeInitialized",
      :pchrome="pchrome",
      :script="script",
      @scriptUpdated="script = $event"
      @capturing="pchrome.params.capturing = $event"
    )

  button(@click="isTextManagerOpen = true") textManager
  button#focus(@click="$setFocus()") focus on canvas
  button(@click="isHelpOpen = true") help
  button(@click="isAboutOpen = true") About
  button(@click="isPlaybackOpen = true") Playback
  Counter(
    v-if="pchrome?.params?.capturing"
    :count="pchrome.params.globals.captureCount"
    :total="pchrome.params.captureLimit"
  )

  div
    #sketch-holder
      // Our sketch will go here!
    noscript
      p JavaScript is required to view the contents of this page.
</template>

<script setup>
import { ref, onMounted } from 'vue'
import P5 from 'p5'
import Help from '@/components/help'
import About from '@/components/about'
import Playback from '@/components/playback'
import Counter from '@/components/captureCounter.vue'

import TextManager from '@/src/text/TextManager'
import Sketch from '@/src/sketch.js'
import randomPost from '@/src/text/tumblr-random.js'
import { texts } from '@/src/text/corpus.js'
import Macros from '@/src/gui/macros.js'
import { setupHotkeys } from '@/src/gui/keys.js'
import * as keypress from 'keypress.js'

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const currentText = ref('placeholder')
const pchrome = ref({})
const script = ref([])
const textManager = ref({})
const isTextManagerOpen = ref(false)
const isAboutOpen = ref(false)
const isHelpOpen = ref(false)
const isPlaybackOpen = ref(false)
const isPchromeInitialized = ref(false)

const corpus = ref(texts)

const randomText = () => {
  const text = randElem(corpus.value)
  textManager.value.setText(text)
  currentText.value = text
}

const resetTextPosition = () => {
  textManager.value.setText(currentText.value)
}

const start = () => {
  pchrome.value.start()
}

onMounted(() => {
  textManager.value = new TextManager()
  textManager.value.randomPost = randomPost

  const setupMacros = (sketch) => {
    const listener = new keypress.keypress.Listener()
    const macros = new Macros(sketch)
    const macroCount = Object.keys(macros).length + 1
    for (let i = 1; i <= macroCount; i++) {
      const m = `macro${i}`
      const digits = String(i).split('')
      listener.sequence_combo(`x ${digits.join(' ')} alt`, () => {
        sketch.undo.takeSnapshot()
        macros[m](sketch)
      }, true)
    }
    return macros
  }

  const setupCallback = (sketch) => {
    pchrome.value.macros = setupMacros(sketch)
    setupHotkeys(sketch)
  }

  const builder = (p5Instance) => {
    const pctInstance = new Sketch({ p5Instance, textManager: textManager.value, keypress, setupCallback })
    pchrome.value = pctInstance
    isPchromeInitialized.value = true

    if (import.meta.env.DEV) {
      window.pchrome = pctInstance
      window.setPolychromeParams = (newParams) => {
        for (const key in newParams) {
          if (Object.prototype.hasOwnProperty.call(newParams, key)) {
            if (typeof newParams[key] === 'object' && newParams[key] !== null && !Array.isArray(newParams[key]) && pctInstance.params[key]) {
              Object.assign(pctInstance.params[key], newParams[key])
            } else {
              pctInstance.params[key] = newParams[key]
            }
          }
        }
        pctInstance.clearCanvas({ layers: pctInstance.layers, params: pctInstance.params })
        pctInstance.undo.takeSnapshot()
      }
      window.setPolychromeText = (text) => {
        textManager.value.setText(text)
      }
    }
  }

  randomPost()
    .then((texts) => {
      corpus.value = corpus.value.concat(texts)
    })
    .catch()
    .finally((_) => {
      currentText.value = randElem(corpus.value)
      resetTextPosition()
      new P5(builder, 'sketch-holder')
    })
})
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
