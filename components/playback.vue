<template lang="pug">
#playback
  textarea#script(placeholder="[script goes here]", v-model="editableScript")

  #buttons
    button(@click="playback") Playback
    button(@click="output") Output recording
    button(@click="keep") Keep script
    button(@click="clearCanvas") Clear Canvas
    button(@click="clearScripts") Erase recording
    button(@click="loadRecording") Load Recording

  #error(v-if="errorMessage", @click="clearMessages")
    p {{ errorMessage }}
</template>

<script>
import { playScript } from '@/assets/javascript/playback'
import recording from '@/assets/scripts/small.js'

export default {
  props: {
    pchrome: {
      type: Object,
      default () {
        return {}
      }
    },
    script: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      defaultScript: recording.script,
      editableScript: '',
      errorMessage: ''
    }
  },
  mounted () {
    this.pchrome.stop(this.pchrome.APP_MODES.PLAYBACK)
    this.editableScript = this.stringify(this.script)
  },
  unmounted () {
    this.pchrome.start()
  },
  methods: {
    output () {
      const pScript = this.pchrome.output()
      this.editableScript = this.stringify(pScript)
    },
    playback () {
      try {
        playScript(this.jsonify(), this.pchrome)
      } catch (err) {
        this.errorMessage = err
      }
    },
    keep () {
      this.$emit('scriptUpdated', this.jsonify())
    },
    stringify (lines) {
      return lines.map(JSON.stringify).join('\n')
    },
    jsonify () {
      try {
        const stringyArray = this.editableScript.split('\n').filter(l => l.trim().length > 0).map(JSON.parse)
        return stringyArray
      } catch (err) {
        this.errorMessage = err
        return []
      }
    },
    clearMessages () {
      this.errorMessage = ''
    },
    clearCanvas () {
      this.pchrome.clearCanvas()
    },
    clearScripts () {
      this.pchrome.clearRecording()
      this.editableScript = ''
      this.$emit('scriptUpdated', this.jsonify([]))
    },
    loadRecording () {
      this.editableScript = this.stringify(this.defaultScript)
    }

  }
}
</script>

<style scoped>
#script {
  box-sizing: border-box;
  padding: 1rem;
  margin: auto;
  /* min-height: 50vh;
  max-height: 50vh; */
  height: 50vh;
  width: 100%;
  border: 1px solid #000;
}

#playback {
  margin: 1rem;
  padding: 1rem;
}

#error {
  background: red;
}
</style>
