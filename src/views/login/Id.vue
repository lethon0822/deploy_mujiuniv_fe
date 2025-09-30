<script setup>
import { reactive, onMounted, onUnmounted } from "vue";
import YnModal from "@/components/common/YnModal.vue";
import { findId } from "@/services/accountService";

const state = reactive({
  form: {
    email: "",
    phone: "",
  },
  data: {
    userName: "",
    loginId: "",
  },
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  isLoading: false,
});

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

function formatPhone(event) {
  let digits = event.target.value.replace(/\D/g, "");

  if (digits.length > 11) digits = digits.slice(0, 11);

  let formatted = "";
  if (digits.length >= 11) {
    formatted = digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (digits.length >= 7) {
    formatted = digits.replace(
      /(\d{3})(\d{1,4})(\d{0,4})/,
      (match, p1, p2, p3) => {
        return p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`;
      }
    );
  } else if (digits.length >= 4) {
    formatted = digits.replace(/(\d{3})(\d{0,4})/, "$1-$2");
  } else {
    formatted = digits;
  }

  state.form.phone = formatted;
}

const submit = async () => {
  if (state.isLoading) return;

  state.isLoading = true;
  state.data = { userName: "", loginId: "" };

  try {
    const res = await findId(state.form);

    if (res && res.status === 200 && res.data && res.data.loginId) {
      state.data = res.data;
    } else {
      showModal("일치하는 회원 정보가 없습니다.", "error");
    }
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    showModal("오류가 발생했습니다. 다시 시도해주세요.", "error");
  } finally {
    state.isLoading = false;
  }
};

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};

const reset = () => {
  state.data = { userName: "", loginId: "" };
  state.form = { email: "", phone: "" };
};

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
        <h2 class="modal-title">아이디 찾기</h2>
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

      <div class="modal-content">
        <div v-if="!state.data.loginId" class="form-section">
          <div class="form-group">
            <label class="form-label">이메일</label>
            <div class="input-wrapper">
              <input
                type="email"
                class="form-input"
                :class="{ loading: state.isLoading }"
                v-model="state.form.email"
                placeholder="example@email.com"
              />
              <div v-if="state.isLoading" class="input-loading"></div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">휴대폰 번호</label>
            <div class="input-wrapper">
              <input
                type="text"
                class="form-input"
                :class="{ loading: state.isLoading }"
                v-model="state.form.phone"
                @input="formatPhone"
                maxlength="13"
                placeholder="010-0000-0000"
              />
              <div v-if="state.isLoading" class="input-loading"></div>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary"
            @click="submit"
            :disabled="
              !state.form.email || !state.form.phone || state.isLoading
            "
          >
            <span v-if="state.isLoading" class="spinner"></span>
            {{ state.isLoading ? "조회 중..." : "아이디 찾기" }}
          </button>
        </div>

        <div v-else class="result-section">
          <div class="result-icon">
            <svg
              class="result-check-icon"
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 16L14 20L22 12"
                stroke="white"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h3 class="result-title">아이디를 찾았습니다</h3>

          <div class="result-box">
            <div class="result-item">
              <span class="result-label">이름</span>
              <span class="result-value">{{ state.data.userName }}</span>
            </div>
            <div class="result-divider"></div>
            <div class="result-item">
              <span class="result-label">아이디</span>
              <span class="result-value highlight">{{
                state.data.loginId
              }}</span>
            </div>
          </div>

          <button type="button" class="btn-primary" @click="reset">
            다시 찾기
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

.result-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  text-align: center;
}

.result-icon {
  width: 60px;
  height: 60px;
  background: #3f7ea6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  margin-bottom: 2px;
}

.result-icon .result-check-icon {
  width: 28px;
  height: 28px;
}

.result-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  margin-top: -6px;
}

.result-box {
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.result-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 600;
}

.result-value.highlight {
  color: #3f7ea6;
  font-size: 16px;
}

.result-divider {
  height: 1px;
  background: #e5e7eb;
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

  .btn-primary {
    padding: 13px;
    font-size: 14px;
    border-radius: 8px;
  }

  .result-section {
    gap: 14px;
  }

  .result-icon {
    width: 50px;
    height: 50px;
    margin-top: 6px;
    margin-bottom: 0;
  }

  .result-icon .result-check-icon {
    width: 24px;
    height: 24px;
  }

  .result-title {
    font-size: 16px;
    margin-top: -4px;
  }

  .result-box {
    border-radius: 10px;
    padding: 14px 18px;
    gap: 10px;
  }

  .result-label {
    font-size: 12px;
  }

  .result-value {
    font-size: 14px;
  }

  .result-value.highlight {
    font-size: 15px;
  }
}
</style>
