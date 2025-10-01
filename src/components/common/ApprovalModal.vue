<script setup>
const props = defineProps({
  show: Boolean,
  message: String,
});
const emit = defineEmits(["approve", "reject", "close"]);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn-approve" @click="$emit('approve')">승인</button>
        <button class="btn-reject" @click="$emit('close')">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
.modal-message {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.btn-approve {
  background-color: #007bff;
  color: white; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
}
.btn-reject {
  background-color: #ff4d4f;
  color: white; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer;
}
</style>
