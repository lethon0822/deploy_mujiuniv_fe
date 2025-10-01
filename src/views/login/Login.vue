<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "@/services/accountService";
import { useUserStore } from "@/stores/account";
import Modal from "@/components/common/Modal.vue";
import Id from "@/views/login/Id.vue";
import RenewalPwd from "@/views/login/RenewalPwd.vue";
import YnModal from "@/components/common/YnModal.vue";
const router = useRouter();
const isModalOpen = ref(false);
const modalContent = ref(null);
const isErrorModalOpen = ref(false);
const errorMessage = ref("");
const errorType = ref("warning");
const state = reactive({
  form: { loginId: "", password: "" },
});
const openModal = (type) => {
  modalContent.value = type === "id" ? "id" : "renewal";
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  modalContent.value = null;
};
const closeErrorModal = () => {
  isErrorModalOpen.value = false;
  errorMessage.value = "";
};
const submit = async () => {
  try {
    const res = await login(state.form);
    if (res && res.status === 200 && res.data) {
      const userStore = useUserStore();
      userStore.setSignedUser(res.data.result);
      userStore.setSigndUserPic();
      state.form.password = "";
      //타이머 계산을 위한 로그인 시간 기록(로그인 시간을 로컬스토리지에 저장)
      localStorage.setItem("tokenStartTime", Date.now());
      router.replace({ path: "/main" });
      return;
    }

    if (res && res.status === 400) {
      errorMessage.value = "아이디/비밀번호를 확인해주세요.";
      errorType.value = "error";
      isErrorModalOpen.value = true;
      return;
    }
    errorMessage.value = "로그인 처리 중 문제가 발생했습니다.";
    errorType.value = "error";
    isErrorModalOpen.value = true;
  } catch (e) {
    console.error(e);
    errorMessage.value =
      "네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    errorType.value = "error";
    isErrorModalOpen.value = true;
  }
};
</script>
<template>
  <div class="login">
    <div class="login-container">
      <h2 class="login-title">로그인</h2>
      <!-- 안내 메시지 -->
      <div class="info-message">
        <i class="bi bi-info-circle"></i>
        학사행정시스템 이용을 위해 로그인을 해주세요.
      </div>
      <form class="login-form" @submit.prevent="submit">
        <div class="input-group">
          <div class="input-wrapper">
            <input
              type="text"
              class="login-input"
              id="loginId"
              placeholder="아이디"
              v-model="state.form.loginId"
              required
            />
            <i class="bi bi-person-fill input-icon"></i>
          </div>
        </div>
        <div class="input-group">
          <div class="input-wrapper">
            <input
              type="password"
              class="login-input"
              id="password"
              placeholder="비밀번호"
              v-model="state.form.password"
              autocomplete="off"
              required
            />
            <i class="bi bi-lock-fill input-icon"></i>
          </div>
        </div>
        <button type="submit" class="login-button">로그인</button>
      </form>
      <div class="login-links">
        <a href="#" class="link" @click.prevent="openModal('id')">아이디찾기</a>
        <span class="divider">|</span>
        <a href="#" class="link" @click.prevent="openModal('renewal')"
          >비밀번호변경</a
        >
      </div>
      <Modal v-if="isModalOpen" @close="closeModal">
        <component
          :is="modalContent === 'id' ? Id : RenewalPwd"
          @close="closeModal"
        />
      </Modal>
      <YnModal
        v-if="isErrorModalOpen"
        :content="errorMessage"
        :type="errorType"
        @close="closeErrorModal"
      />
    </div>
  </div>
</template>
<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.login-container {
  width: 100%;
  max-width: 320px;
  padding: 10px 0 0 0;
}
.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}
.info-message {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  color: #3F7EA6;
}
.info-message i {
  font-size: 13px;
  flex-shrink: 0;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
}
.input-group {
  position: relative;
}
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.login-input {
  width: 100%;
  height: 48px;
  padding: 0 150px 0 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
}
.login-input:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
.login-input::placeholder {
  color: #999;
}
.input-icon {
  position: absolute;
  right: 16px;
  font-size: 18px;
  color: #999;
  pointer-events: none;
}
.login-button {
  width: 100%;
  height: 48px;
  background: #3F7EA6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.login-button:hover {
  background: #2A5C74;
}
.login-button:active {
  transform: translateY(1px);
}
.login-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.link {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s ease;
}
.link:hover {
  color: #333;
  text-decoration: underline;
}
.divider {
  color: #ccc;
  font-size: 12px;
}
/* 모바일 */
@media (max-width: 768px) {
  .login-container {
    max-width: 280px;
  }
  .login-title {
    font-size: 22px;
    margin-bottom: 16px;
  }
  .info-message {
    font-size: 11px;
    padding: 8px 10px;
  }
  .login-input,
  .login-button {
    height: 44px;
  }
  .login-button {
    font-size: 15px;
  }
}
/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .login-container {
    max-width: 320px;
  }
}
/* PC */
@media all and (min-width: 1024px) {
  .login-container {
    max-width: 320px;
  }
}
</style>