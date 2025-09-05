<script setup>
import { defineEmits } from "vue";

const props = defineProps({
  title: { type: String, default: '' }

})

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};



</script>
<!-- Modal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-window">
      <div class="title-bar">
        <h3>{{ props.title }}</h3>
        <div class="close-btn" @click="close">
          <i class="fa-solid fa-xmark"></i>
        </div>
      </div>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-window {
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 400px;
  max-width: 90vw;
  border-radius: 10px;
}
.title-bar {
  border-bottom: 1px solid #ccc;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 10px;
}

h3{
  margin:0
}
.close-btn {
  width: 28px;
  height: 28px;
  font-size: 18px;
  font-family: "Segoe UI", "Tahoma", "Arial", sans-serif;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 0;
  line-height: 1;
}
.close-btn:hover {
  background: #e0e0e0;
  border-radius: 10px;
}
.close-btn:active {
  background: #d0d0d0;
  border: 1px solid #777;
}
.modal-body {
  padding: 16px;
}
@media (max-width: 480px) {
  .modal-window {
    width: 320px;
  }
  .modal-body {
    padding: 12px;
  }
}
</style>
