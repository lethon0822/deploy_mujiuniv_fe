<script setup>
import YnModal from './YnModal.vue';

const props = defineProps({
  content: { type: String, default: "오류 발생, 잠시 후 다시 시도해주십시오." },
 
});

</script>

<template>
  <YnModal :content="props.content">
    <button class="btn btn-secondary">아니오</button>
    <button class="btn btn-success">예</button>
  </YnModal>
</template>

<style scoped>

</style>