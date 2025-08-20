<template lang="pug">
#app
  #title polychrome text

  ClientOnly
    HelpModal(ref="helpModal" @close="pchrome.start()")

  AboutModal(ref="aboutModal" @close="pchrome.start()")

  ClientOnly
    PlaybackModal(ref="playbackModal" :pchrome="pchrome" :script="script" @scriptUpdated="script = $event" @close="pchrome.start()")

  ClientOnly
    TextManagerModal(ref="textManagerModal" :textManager="textManager" :corpus="corpus" :currentText="currentText" @textUpdated="currentText = $event" @close="pchrome.start()")

  button(@click="openHelpModal") help
  button(@click="openAboutModal") About
  button(@click="openPlaybackModal") Playback
  button(@click="openTextManagerModal") Text Manager
  button(@click="useNuxtApp().$setFocus()") Focus on Canvas
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
import HelpModal from '@/components/HelpModal.vue'
import AboutModal from '@/components/AboutModal.vue'
import PlaybackModal from '@/components/PlaybackModal.vue'
import TextManagerModal from '@/components/TextManagerModal.vue'
import Counter from '@/components/captureCounter.vue'

import TextManager from '@/src/text/TextManager'
import Sketch from '@/src/sketch.js'
import randomPost from '@/src/text/tumblr-random.js'
import { texts } from '@/src/text/corpus.js'
import Macros from '@/src/gui/macros.js'
import { setupHotkeys } from '@/src/gui/keys.js'
import * as keypress from 'keypress.js'
import { useRuntimeConfig } from 'nuxt/app' // Added import

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const currentText = ref('placeholder')
const pchrome = ref({})
const script = ref([])
const textManager = ref({})
const helpModal = ref(null)
const aboutModal = ref(null)
const playbackModal = ref(null)
const textManagerModal = ref(null)
const isPchromeInitialized = ref(false)

const corpus = ref(texts)

const openHelpModal = () => {
  pchrome.value.stop()
  helpModal.value.isOpen = true
}

const openAboutModal = () => {
  pchrome.value.stop()
  aboutModal.value.isOpen = true
}

const openPlaybackModal = () => {
  pchrome.value.stop()
  playbackModal.value.isOpen = true
}

const openTextManagerModal = () => {
  pchrome.value.stop()
  textManagerModal.value.isOpen = true
}

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

  const { app } = useRuntimeConfig() // Get runtime config
  const baseURL = app.baseURL // Get baseURL

  const builder = (p5Instance) => {
    const pctInstance = new Sketch({ p5Instance, textManager: textManager.value, keypress, setupCallback, baseURL }) // Pass baseURL
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
  font-family: "Graphik";
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