<script setup>
import YnModal from "./YnModal.vue";
import { defineProps, defineEmits } from "vue";

// Header.vue에서 전달받는 props 정의
const props = defineProps({
  // `Header.vue`에서 보낸 `message`를 `content`로 받습니다.
  content: {
    type: String,
    default: "오류 발생, 잠시 후 다시 시도해주십시오.",
  },
});

// 부모 컴포넌트(Header.vue)로 보낼 이벤트를 정의합니다.
// Header.vue는 이 'confirm'과 'cancel' 이벤트를 기다립니다.
const emit = defineEmits(["confirm", "cancel"]);

// '예' 버튼 클릭 시 실행될 함수
const handleConfirm = () => {
  // 부모 컴포넌트에게 '확인' 이벤트를 보냅니다.
  emit("confirm");
};

// '아니오' 버튼 클릭 시 실행될 함수
const handleCancel = () => {
  // 부모 컴포넌트에게 '취소' 이벤트를 보냅니다.
  emit("cancel");
};
</script>

<template>
  <YnModal :content="props.content" @close="handleCancel">
    <div class="button-wrapper">
      <button class="btn btn-secondary" @click="handleCancel">아니오</button>
      <button class="btn custom-yes" @click="handleConfirm">예</button>
    </div>
  </YnModal>
</template>

<style scoped>
/* 이전과 동일한 스타일입니다. */
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
