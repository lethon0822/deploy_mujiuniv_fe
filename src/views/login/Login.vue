<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { login, check } from "@/services/accountService";
import { useUserStore, useAccountStore } from "@/stores/account";
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
      console.log("res", res);
      const userStore = useUserStore();

      userStore.$patch({
        userName: res.data.result.userName ?? "",
        userId: res.data.result.userId ?? "",
        userRole: res.data.result.userRole ?? "",
        loginId: res.data.result.loginId ?? "",
        semesterId: res.data.result.semesterId ?? "",
        deptName: res.data.result.deptName ?? "",
      });

      const chk = await check();
      const ok = chk?.status === 200;

      const accountStore = useAccountStore();
      accountStore.setLoggedIn(ok);
      accountStore.setChecked(true);

      state.form.password = "";

      if (!ok) {
        errorMessage.value = "세션 확인에 실패했습니다. 다시 시도해주세요.";
        errorType.value = "error";
        isErrorModalOpen.value = true;
        return;
      }

      await router.replace({ path: "/" });
      return;
    }

    if (res && (res.status === 404 || res.status === 401)) {
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
      <form class="login-form" @submit.prevent="submit">
        <div class="input-group">
          ID
          <input
            type="text"
            class="login-input"
            id="loginId"
            placeholder="아이디"
            v-model="state.form.loginId"
            required
          />
        </div>
        <div class="input-group">
          PW
          <input
            type="password"
            class="login-input"
            id="password"
            placeholder="패스워드"
            v-model="state.form.password"
            autocomplete="off"
            required
          />
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
  padding: 0;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.input-group {
  position: relative;
}

.login-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
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
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.login-input::placeholder {
  color: #999;
}

.login-button {
  width: 100%;
  height: 48px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.login-button:hover {
  background: #0056b3;
}

.login-button:active {
  transform: translateY(1px);
}

.login-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
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

@media (max-width: 480px) {
  .login-container {
    max-width: 280px;
  }

  .login-title {
    font-size: 22px;
    margin-bottom: 24px;
  }

  .login-input,
  .login-button {
    height: 44px;
  }

  .login-button {
    font-size: 15px;
  }
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

@media (max-width: 480px) {
  .login-container {
    max-width: 280px;
  }

  .login-title {
    font-size: 22px;
    margin-bottom: 24px;
  }

  .login-input,
  .login-button {
    height: 44px;
  }

  .login-button {
    font-size: 15px;
  }
}
</style>
