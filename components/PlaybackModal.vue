<template>
  <div v-if="isOpen" class="modal-overlay" @click.stop @mousedown.stop @mouseup.stop @mousemove.stop @keydown.esc="isOpen = false" tabindex="0" ref="modalOverlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Playback</h3>
        <button @click="isOpen = false">X</button>
      </div>
      <Playback
        :pchrome="pchrome"
        :script="script"
        @scriptUpdated="script = $event"
        @capturing="pchrome.params.capturing = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Playback from '@/components/playback.vue'

const isOpen = ref(false)
const modalOverlay = ref(null)

const emit = defineEmits(['close'])

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

defineProps({
  pchrome: {
    type: Object,
    required: true
  },
  script: {
    type: Array,
    required: true
  }
})

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
</style>