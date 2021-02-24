<template lang="pug">
#playback
  atom-spinner(
    v-show="isPlaying",
    :animation-duration="1000",
    :size="60",
    :color="'#ff1d5e'"
  )

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
import { playback } from '@/assets/javascript/playback'
import recording from '@/assets/scripts/small.js'
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
    }
  },
  data () {
    return {
      defaultScript: recording.script,
      editableScript: '',
      errorMessage: ''
    }
  },
  components: {
    AtomSpinner
  },
  mounted () {
    this.pchrome.stop()
    this.editableScript = this.stringify(this.script)
  },
  unmounted () {
    this.pchrome.start()
  },
  computed: {
    isPlaying () {
      return this.pchrome.appMode === this.pchrome.APP_MODES.PLAYBACK
    }
  },
  methods: {
    output () {
      const pScript = this.pchrome.output()
      this.editableScript = this.stringify(pScript)
    },
    playback () {
      try {
        this.pchrome.playback = playback({ script: this.jsonify(), pct: this.pchrome })
        this.pchrome.start(this.pchrome.APP_MODES.PLAYBACK)
      } catch (err) {
        this.pchrome.stop()
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
