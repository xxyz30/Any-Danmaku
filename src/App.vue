<template>
  <div class="root">
    <Base></Base>
  </div>
</template>

<script setup lang="ts">
import Base from './components/Base.vue';
</script>
<style scoped>
.root {
  position: fixed;
  bottom: 20px;
  right: 10px;
  z-index: 10000;
}
</style>
