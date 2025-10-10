<script setup>
import BaseModal from "./BaseModal.vue";
import { computed } from "vue";

const props = defineProps({
  show: Boolean,
  message: String,
});

const emit = defineEmits(["approve", "reject"]);

const modalContent = computed(() => {
  return props.message || "처리하시겠습니까?";
});

const handleApprove = () => {
  emit("approve");
};

const handleReject = () => {
  emit("reject");
};
</script>

<template>
  <BaseModal
    v-if="show"
    :content="modalContent"
    type="warning"
    :closeOnEnter="false"
    @close="handleReject"
  >
    <div class="button-wrapper">
      <button class="btn btn-reject" @click="handleReject">거부</button>
      <button class="btn btn-approve" @click="handleApprove">승인</button>
    </div>
  </BaseModal>
</template>

<style scoped>
.modal-content {
  padding: 30px 30px !important;
}

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

::v-deep(.btn-reject) {
  background-color: #ff3b30;
  color: #fff;
}

::v-deep(.btn-reject:hover) {
  background-color: #e03128;
}

::v-deep(.btn-reject:active) {
  background-color: #b3271f;
}

::v-deep(.btn-approve) {
  background-color: #3f7ea6;
  color: #fff;
}

::v-deep(.btn-approve:hover) {
  background-color: #2a5c74;
}

::v-deep(.btn-approve:active) {
  background-color: #204658;
}
</style>
