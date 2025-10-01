<script setup>
import BaseModal from "./BaseModal.vue";
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "success",
  },
});

const emit = defineEmits(["close", "confirm"]);

const modalContent = computed(() => {
  return props.content || "작업이 성공적으로 완료되었습니다.";
});

const handleClose = () => {
  emit("close");
};

const handleConfirm = () => {
  emit("confirm");
  emit("close");
};
</script>

<template>
  <BaseModal
    :title="props.title"
    :content="modalContent"
    :type="props.type"
    :closeOnEnter="false"
    @close="handleClose"
  >
    <div class="button-wrapper">
      <button class="btn custom-yes" @click="handleConfirm">확인</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.button-wrapper {
  display: flex;
  justify-content: center;
}
::v-deep(.button-wrapper button) {
  flex: 1;
  max-width: 50%;
  padding: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}
::v-deep(.custom-yes) {
  background: radial-gradient(circle at center, #cfcfcf 100%);
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 12px 0;
  font-weight: 600;
}

::v-deep(.custom-yes:hover) {
  background: radial-gradient(circle at center, #dcdcdc 0%, #bfbfbf 100%);
}
</style>
