<script setup>
import { confirmCode, renewalPwd, sendMail } from "@/services/emailService";
import { reactive, onMounted, onUnmounted } from "vue";
import YnModal from "@/components/common/YnModal.vue";

const state = reactive({
  data: {
    email: "",
    authCode: "",
    renewalTap: false,
    renewalPwd: "",
    confirmPwd: "",
  },
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  isCodeSent: false,
  isLoading: false,
  currentStep: 1,
});

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

async function sendCode() {
  state.isLoading = true;
  try {
    const res = await sendMail({ email: state.data.email });
    if (res && res.status === 200) {
      console.log("성공");
      state.isCodeSent = true;
      state.currentStep = 2;
      showModal("인증번호가 발송되었습니다.", "success");
    } else {
      console.log("뭔가 문제가 생김");
      showModal(
        "인증번호 발송에 실패했습니다. 이메일을 확인해주세요.",
        "error"
      );
    }
  } catch (err) {
    console.log("다른 문제가 생김");
    showModal("오류가 발생했습니다. 다시 시도해주세요.", "error");
  } finally {
    state.isLoading = false;
  }
}

async function submitCode() {
  if (!state.data.authCode) {
    return;
  }

  state.isLoading = true;
  try {
    const res = await confirmCode({
      email: state.data.email,
      authCode: state.data.authCode,
    });
    if (res && res.status === 200) {
      showModal(
        "인증이 완료되었습니다. 새로운 비밀번호를 설정해주세요.",
        "success"
      );
      state.data.renewalTap = true;
      state.currentStep = 3;
    } else {
      console.log("미친거 완료가 안됨");
      showModal("인증번호가 일치하지 않습니다.", "error");
    }
  } catch (err) {
    console.log("난리난리");
    showModal("인증 확인에 실패했습니다.", "error");
  } finally {
    state.isLoading = false;
  }
}

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};

async function renewal() {
  if (state.data.renewalPwd !== state.data.confirmPwd) {
    console.log("두 비밀번호 일치 안한다");
    showModal("비밀번호가 일치하지 않습니다.", "error");
    return;
  }

  state.isLoading = true;
  const res = await renewalPwd({
    email: state.data.email,
    password: state.data.renewalPwd,
  });

  state.isLoading = false;
  if (res && res.status === 200) {
    showModal("비밀번호가 변경되었습니다.", "success");
    close();
    return;
  } else {
    showModal("비밀번호 변경 실패. 다시 시도해주세요.", "error");
  }
}

const handleKeydown = (event) => {
  if (event.key === "Escape" && !state.showYnModal) {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">비밀번호 변경</h2>
        <button class="close-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="step-indicator">
        <div class="step-bar">
          <div
            class="step-progress"
            :style="{ width: (state.currentStep / 3) * 100 + '%' }"
          ></div>
        </div>
        <div class="step-text">{{ state.currentStep }} / 3</div>
      </div>

      <div class="modal-content">
        <div v-if="state.currentStep === 1" class="form-section">
          <div class="form-group">
            <label class="form-label"
              >가입하신 이메일 주소를 입력해주세요</label
            >
            <div class="input-wrapper">
              <input
                type="email"
                class="form-input"
                :class="{ loading: state.isLoading }"
                placeholder="example@email.com"
                v-model="state.data.email"
              />
              <div v-if="state.isLoading" class="input-loading"></div>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary"
            @click="sendCode"
            :disabled="!state.data.email || state.isLoading"
          >
            <span v-if="state.isLoading" class="spinner"></span>
            {{ state.isLoading ? "발송 중..." : "인증번호 받기" }}
          </button>
        </div>

        <div v-if="state.currentStep === 2" class="form-section">
          <div class="form-group">
            <label class="form-label"
              >이메일로 전송된 인증번호를 입력해주세요</label
            >
            <div class="input-wrapper">
              <input
                type="text"
                class="form-input"
                :class="{ loading: state.isLoading }"
                placeholder="인증번호 6자리"
                v-model="state.data.authCode"
                maxlength="6"
              />
              <div v-if="state.isLoading" class="input-loading"></div>
            </div>
            <p class="help-text">{{ state.data.email }}로 발송되었습니다</p>
          </div>

          <button
            type="button"
            class="btn-text"
            @click="sendCode"
            :disabled="state.isLoading"
          >
            인증번호를 받지 못하셨나요?
          </button>

          <button
            type="button"
            class="btn-primary"
            @click="submitCode"
            :disabled="!state.data.authCode || state.isLoading"
          >
            <span v-if="state.isLoading" class="spinner"></span>
            {{ state.isLoading ? "확인 중..." : "다음" }}
          </button>
        </div>

        <div v-if="state.currentStep === 3" class="form-section">
          <div class="form-group">
            <label class="form-label">새 비밀번호</label>
            <input
              type="password"
              class="form-input"
              placeholder="8자 이상 입력해주세요"
              v-model="state.data.renewalPwd"
            />
          </div>

          <div class="form-group">
            <label class="form-label">새 비밀번호 확인</label>
            <input
              type="password"
              class="form-input"
              placeholder="비밀번호를 다시 입력해주세요"
              v-model="state.data.confirmPwd"
            />
          </div>

          <button
            type="button"
            class="btn-primary"
            @click="renewal"
            :disabled="
              !state.data.renewalPwd ||
              !state.data.confirmPwd ||
              state.isLoading
            "
          >
            <span v-if="state.isLoading" class="spinner"></span>
            {{ state.isLoading ? "변경 중..." : "완료" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <YnModal
    v-if="state.showYnModal"
    :content="state.ynModalMessage"
    :type="state.ynModalType"
    @close="state.showYnModal = false"
  />
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.2s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 24px 24px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 8px;
}

.close-btn:hover {
  color: #1f2937;
  background: #f3f4f6;
}

.step-indicator {
  padding: 0 24px 20px;
}

.step-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.step-progress {
  height: 100%;
  background: #3f7ea6;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.step-text {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  text-align: right;
}

.modal-content {
  padding: 0 32px 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.5;
  margin: 0;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 13px 16px;
  font-size: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  transition: all 0.2s;
  outline: none;
  background: #ffffff;
}

.form-input:focus {
  border-color: #3f7ea6;
  background: #f9fafb;
  box-shadow: 0 0 0 3px rgba(63, 126, 166, 0.08);
}

.form-input::placeholder {
  color: #d1d5db;
}

.help-text {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.input-loading {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #e5e7eb;
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}

.input-loading::after {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, #3f7ea6, transparent);
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    left: -50%;
  }
  100% {
    left: 150%;
  }
}

.btn-text {
  background: none;
  border: none;
  color: #3f7ea6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  text-align: center;
  transition: color 0.2s;
  text-decoration: underline;
  margin-top: -6px;
}

.btn-text:hover:not(:disabled) {
  color: #2d5c7a;
}

.btn-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 15px;
  font-size: 15px;
  font-weight: 600;
  color: white;
  background: #3f7ea6;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #2d5c7a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(63, 126, 166, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@media (max-width: 400px) {
  .modal-overlay {
    padding: 0;
  }

  .modal-container {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
    align-self: flex-end;
  }

  .modal-header {
    padding: 16px 16px 12px;
  }

  .modal-title {
    font-size: 17px;
  }

  .step-indicator {
    padding: 0 16px 16px;
  }

  .step-text {
    font-size: 12px;
  }

  .modal-content {
    padding: 0 16px 16px;
  }

  .form-section {
    gap: 14px;
  }

  .form-group {
    gap: 8px;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input {
    padding: 11px 12px;
    font-size: 14px;
    border-radius: 8px;
  }

  .input-loading {
    border-radius: 0 0 8px 8px;
  }

  .help-text {
    font-size: 12px;
  }

  .btn-text {
    font-size: 13px;
    margin-top: -4px;
  }

  .btn-primary {
    padding: 13px;
    font-size: 14px;
    border-radius: 8px;
  }
}
</style>
