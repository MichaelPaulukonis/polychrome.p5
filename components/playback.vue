<template lang="pug">
#playback
  //- atom-spinner(
  //-   v-show="playing",
  //-   :animation-duration="1000",
  //-   :size="60",
  //-   :color="'#ff1d5e'"
  //- )

  textarea#script(placeholder="[script goes here]", v-model="editableScript")

  #buttons
    button(@click="playback") {{ playing ?  'playing' : 'Playback' }}
    button(@click="output") Output script
    button(@click="keep") Keep script
    button(@click="clearCanvas") Clear Canvas
    button(@click="clearScripts") Erase script
    button(@click="loadRecording") Load script
    button(@click="saveFrames")
      | {{ capturing ? 'Capture Frames' : 'Stop Capture' }}

  #error(v-if="errorMessage", @click="clearMessages")
    p {{ errorMessage }}
</template>

<script>
import { playback } from '@/src/playback'
import recording from '@/assets/scripts/rotate.circle.js'
import { AtomSpinner } from 'epic-spinners'

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
    },
    originalCapturing: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      defaultScript: recording.script,
      editableScript: '',
      errorMessage: '',
      capturing: false,
      playing: false
    }
  },
  components: {
    AtomSpinner
  },
  mounted () {
    this.pchrome.stop()
    this.editableScript = this.stringify(this.script)
    this.capturing = this.originalCapturing
  },
  unmounted () {
    // reset pchrome
    this.pchrome.start()
  },
  methods: {
    output () {
      const pScript = this.pchrome.output()
      this.editableScript = this.stringify(pScript)
    },
    playback () {
      try {
        this.playing = true
        // if button for record, switch here
        this.pchrome.playback = playback({ script: this.jsonify(), pct: this.pchrome })
        this.pchrome.start(this.pchrome.APP_MODES.PLAYBACK)
        // ah, but when done.... in unmounted ???
      } catch (err) {
        this.pchrome.stop()
        this.errorMessage = err
      } finally {
        this.playing = false
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
      this.pchrome.clearCanvas({ layers: this.pchrome.layers, params: this.pchrome.params })
    },
    clearScripts () {
      this.pchrome.clearRecording()
      this.editableScript = ''
      this.$emit('scriptUpdated', this.jsonify([]))
    },
    loadRecording () {
      this.editableScript = this.stringify(this.defaultScript)
    },
    saveFrames () {
      this.capturing = !this.capturing
      this.$emit('capturing', this.capturing)
    }
  }
}
</script>

<style scoped>
#script {
  box-sizing: border-box;
  padding: 1rem;
  margin: auto;
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
