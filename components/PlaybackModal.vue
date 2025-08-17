<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Playback
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
        </div>
      </template>
      <Playback
        :pchrome="pchrome"
        :script="script"
        @scriptUpdated="script = $event"
        @capturing="pchrome.params.capturing = $event"
      />
    </UCard>
  </UModal>
</template>

<script setup>
import { ref } from 'vue'
import Playback from '@/components/playback.vue'

const isOpen = ref(false)

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
</script>