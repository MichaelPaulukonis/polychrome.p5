<template lang="pug">
#counter {{ count }} / {{ total }}
</template>

<script setup>
defineProps({
  total: Number,
  count: Number
})
</script>

<style lang="scss" scoped>
@use '~/assets/css/utilities/variables' as *;

#counter {
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0 1rem 1rem 0;
  height: 3rem;
  background-color: $primary;
  text-decoration: none;
  color: #ffffff;
  cursor: pointer;
  border: 0;
  text-align: center;
}
</style>
