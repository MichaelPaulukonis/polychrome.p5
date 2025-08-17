<template lang="pug">
#playback

  textarea#script(placeholder="[script goes here]", v-model="editableScript")

  #buttons
    button(@click="doPlayback") {{ playing ?  'playing' : 'Playback' }}
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { playback } from '@/src/scripting/playback'
import { script as recordingScript } from '@/assets/scripts/repeat.js'

const props = defineProps({
  pchrome: {
    type: Object,
    default: () => ({})
  },
  script: {
    type: Array,
    default: () => ([])
  },
  originalCapturing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['scriptUpdated', 'capturing'])

const defaultScript = recordingScript
const editableScript = ref('')
const errorMessage = ref('')
const capturing = ref(false)
const playing = ref(false)

const output = () => {
  const pScript = props.pchrome.output()
  editableScript.value = stringify(pScript)
}

const doPlayback = () => {
  try {
    playing.value = true
    props.pchrome.playback = playback({ script: jsonify(), pct: props.pchrome })
    props.pchrome.start(props.pchrome.APP_MODES.PLAYBACK)
  } catch (err) {
    props.pchrome.stop()
    errorMessage.value = err
  } finally {
    playing.value = false
  }
}

const keep = () => {
  emit('scriptUpdated', jsonify())
}

const stringify = (lines) => {
  return lines.map(JSON.stringify).join('\n')
}

const jsonify = () => {
  try {
    const stringyArray = editableScript.value.split('\n').filter(l => l.trim().length > 0).map(JSON.parse)
    return stringyArray
  } catch (err) {
    errorMessage.value = err
    return []
  }
}

const clearMessages = () => {
  errorMessage.value = ''
}

const clearCanvas = () => {
  props.pchrome.clearCanvas({ layers: props.pchrome.layers, params: props.pchrome.params })
}

const clearScripts = () => {
  props.pchrome.clearRecording()
  editableScript.value = ''
  emit('scriptUpdated', jsonify([]))
}

const loadRecording = () => {
  editableScript.value = stringify(defaultScript)
}

const saveFrames = () => {
  capturing.value = !capturing.value
  emit('capturing', capturing.value)
}

onMounted(() => {
  props.pchrome.stop()
  editableScript.value = stringify(props.script)
  capturing.value = props.originalCapturing
})

onUnmounted(() => {
  props.pchrome.start()
})
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
