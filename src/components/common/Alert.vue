<script setup>
import YnModal from './YnModal.vue';

const props = defineProps({
  content: { type: String },
 
});

</script>

<template>
  <YnModal :content="props.content">
    <button class="btn btn-success">확인</button>
  </YnModal>
</template>

<style scoped>

</style>