<script setup>
import BaseModal from "./BaseModal.vue";
import { defineProps, defineEmits, computed, onMounted, ref } from "vue";

const props = defineProps({
  content: String,
  type: {
    type: String,
    default: "error",
  },
});

const modalContent = computed(() => {
  return (
    props.content ||
    (props.type === "success"
      ? "작업이 성공적으로 완료되었습니다."
      : "오류 발생, 잠시 후 다시 시도해주십시오.")
  );
});

const emit = defineEmits(["confirm", "cancel"]);

const handleConfirm = () => emit("confirm");
const handleCancel = () => emit("cancel");

const ynModalRef = ref(null);

onMounted(() => {
  if (ynModalRef.value && ynModalRef.value.$el) {
    ynModalRef.value.$el.focus();
  }
});
</script>

<template>
  <BaseModal
    ref="ynModalRef"
    tabindex="0"
    :content="modalContent"
    :type="props.type"
    @close="handleCancel"
    @keydown.enter.prevent.stop="handleConfirm"
    @keydown.escape.stop="handleCancel"
  >
    <div class="button-wrapper">
      <button class="btn btn-secondary" @click="handleCancel">아니오</button>
      <button class="btn custom-yes" @click="handleConfirm">예</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.button-wrapper {
  display: flex;
  gap: 10px;
}
::v-deep(.button-wrapper button) {
  flex: 1;
  max-width: 50%;
  padding: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
::v-deep(.btn-secondary) {
  background-color: #e0e0e0;
  color: #343a40;
  border: none;
  transition: background-color 0.2s ease;
}
::v-deep(.btn-secondary:hover) {
  background-color: #cfcfcf;
}
::v-deep(.custom-yes) {
  background: radial-gradient(circle at center, #00c9a7 0%, #57deb0 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 12px 0;
  font-weight: 600;
  transition: background-color 0.2s ease;
}
::v-deep(.custom-yes:hover) {
  background: radial-gradient(circle at center, #009e82 0%, #2cd3a9 100%);
}
</style>
