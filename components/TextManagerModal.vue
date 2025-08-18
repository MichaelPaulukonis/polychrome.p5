<template>
  <div v-if="isOpen" class="modal-overlay" @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @keydown.esc="isOpen = false" tabindex="0" ref="modalOverlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Text Manager</h3>
        <button @click="isOpen = false">X</button>
      </div>
      <div>
        <textarea v-model="newText" rows="10" cols="50"></textarea>
        <button @click="setText">Set Text</button>
        <button @click="randomText">Random Text</button>
        <button @click="resetTextPosition">Reset Text Position</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  textManager: {
    type: Object,
    required: true
  },
  corpus: {
    type: Array,
    required: true
  },
  currentText: {
    type: String,
    required: true
  }
})

const isOpen = ref(false)
const newText = ref(props.currentText)
const modalOverlay = ref(null)

const emit = defineEmits(['scriptUpdated', 'textUpdated', 'close'])

watch(isOpen, (newValue) => {
  if (newValue) {
    // When the modal opens, focus the overlay to enable ESC key dismissal
    nextTick(() => {
      modalOverlay.value?.focus()
    })
  } else {
    emit('close')
  }
})

watch(() => props.currentText, (newValue) => {
  newText.value = newValue
})

const randElem = arr => arr[Math.floor(Math.random() * arr.length)]

const setText = () => {
  props.textManager.setText(newText.value)
  emit('textUpdated', newText.value)
}

const randomText = () => {
  const text = randElem(props.corpus)
  props.textManager.setText(text)
  emit('textUpdated', text)
  newText.value = text
}

const resetTextPosition = () => {
  props.textManager.setText(props.currentText)
  newText.value = props.currentText
}

defineExpose({ isOpen })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  pointer-events: auto;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
  max-width: 80%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  margin: 0;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}

textarea {
  width: 100%;
  height: 200px; /* Fixed height */
  overflow-y: auto; /* Enable vertical scrolling */
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  margin-right: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
