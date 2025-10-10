<script setup>
const props = defineProps({
  show: Boolean,
  message: String,
});
const emit = defineEmits(["approve", "reject"]);
</script>

<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <p class="modal-message">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn-approve" @click="$emit('approve')">확인</button>
        <button class="btn-reject" @click="$emit('reject')">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-message {
  margin-bottom: 22px;
  font-size: 16px;
  font-weight: 500;
  white-space: pre-line; /* 줄바꿈(\n) 지원 */
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-approve {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-approve:hover {
  background-color: #0056b3;
}

.btn-reject {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-reject:hover {
  background-color: #d9363e;
}
</style>
