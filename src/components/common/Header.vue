<script setup>
import logo from "@/assets/logoW.svg";
import ConfirmModal from "@/components/common/Confirm.vue";
import { useUserStore } from "@/stores/account";
import { logout, reissue } from "@/services/accountService";
import { useRouter } from "vue-router";
import { ref, reactive, defineEmits, onMounted, onUnmounted } from "vue";
import YnModal from "@/components/common/YnModal.vue";

const emit = defineEmits(["toggle-menu"]);
const router = useRouter();
const userStore = useUserStore();

const logoutErrorMessage = ref("");
const state = reactive({
  showLogoutConfirm: false,
  showAutoLogout: false,
  showLogoutErrorModal: false,
  isDropdownOpen: false
})

//타이머 작업

const time = ref(5.5 * 60)
// 초 → "MM:SS" 문자열 변환
const formatTime = (totalSecond) => {
  const minute = Math.floor(totalSecond / 60) // 소수점 제거
  const second = totalSecond % 60
  const minuteText = minute >= 10 ? minute : `0${minute}`
  const secondText = second >= 10 ? second : `0${second}`
  return `${minuteText}:${secondText}`
}

let intervalId = null

// 카운트다운 함수 (화살표 함수)
const startTimer = () => {
  intervalId = setInterval(async() => {
    if(time.value === 300){
      state.showAutoLogout = true
    } else if (time.value > 0) {
      time.value--
    } 
    else {
      clearInterval(intervalId); // 먼저 멈춤
      alert("시간이 만료되어 로그아웃 되었습니다.")
      confirmLogout();
    }
  }, 1000)
}

const refresh = async() =>{
  await reissue();
  clearInterval(intervalId);
  time.value = 1800;
  startTimer();
  state.showAutoLogout = false;
}

const openLogoutConfirm = () => {
  state.showLogoutConfirm = true;
};

const confirmLogout = async () => {
  state.showLogoutConfirm = false;
  try {
    const res = await logout();
    if (res.status === 200) {
      userStore.signOut();
      router.push("/login");
    } else {
      // 서버에서 200 외의 상태 코드를 보낼 경우
      logoutErrorMessage.value =
        "로그아웃에 실패했습니다. (상태 코드: " + res.status + ")";
      state.showLogoutErrorModal = true;
    }
  } catch (error) {
    // 네트워크 오류, 서버 오류 등
    console.error("로그아웃 중 에러 발생:", error);
    logoutErrorMessage.value =
      "네트워크 오류로 로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    state.showLogoutErrorModal = true;
  }
};

const cancelLogout = () => {
  state.showLogoutConfirm = false;
  state.showAutoLogout = false;
};

const logoutAccount = (check) => {
  if(check){
    openLogoutConfirm();
  }
  confirmLogout();
};

// 반응형
const toggleDropdown = () => {
  state.isDropdownOpen = !state.isDropdownOpen;
};

const logoutAndClose = () => {
  openLogoutConfirm();
  state.isDropdownOpen = false;
};

const closeDropdown = (event) => {
  const dropdown = event.target.closest(".logout-dropdown");
  if (!dropdown) {
    state.isDropdownOpen = false;
  }
};

const onHamburgerClick = () => {
  emit("toggle-menu");
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
  startTimer();
});

onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
  if (intervalId) clearInterval(intervalId)
});

</script>

<template>
  <header>
    <div class="navbar" style="background-color: #00664f; height: 60px">
      <button
        class="hamburger-btn"
        @click="onHamburgerClick"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <div
        class="container-fluid d-flex justify-content-between align-items-center px-4"
        style="flex: 1"
      >
        <div class="logo d-flex align-items-center" @click="$router.push('/')">
          <img :src="logo" alt="로고 아이콘" height="40" />
          <span class="systemText">학사관리시스템</span>
        </div>

        <template v-if="userStore.state.isSigned">
          <div class="menus">
            <div class="me-2">
              <span class="me-1 time">{{ formatTime(time) }}</span>
              <button class="btn btn-light time-btn" @click="refresh">시간연장</button>
            </div>

            <span class="welcome-text"
              >{{ userStore.state.signedUser.userName }}님 반갑습니다</span
            >
            <span class="divider">|</span>
            <a class="logout-text" @click="logoutAccount(1)">로그아웃</a>

            <div
              class="logout-dropdown"
              @click.stop="toggleDropdown"
              tabindex="0"
              @keydown.enter.prevent="toggleDropdown"
              @keydown.space.prevent="toggleDropdown"
              aria-haspopup="true"
              :aria-expanded="state.isDropdownOpen.toString()"
            >
              <i class="bi bi-box-arrow-right logout-icon" title="로그아웃"></i>

              <div class="dropdown-menu" :class="{ open: state.isDropdownOpen }">
                <div class="dropdown-item welcome-dropdown">
                  {{ userStore.state.signedUser.userName }}님 반갑습니다
                </div>
                <button
                  class="dropdown-item logout-btn"
                  @click="logoutAndClose"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </header>

  <ConfirmModal
    v-if="state.showLogoutConfirm"
    title="Log-Out"
    content="로그아웃 하시겠습니까?"
    type="success"
    @confirm="confirmLogout"
    @cancel="cancelLogout"
  />

  <ConfirmModal
    v-if="state.showAutoLogout"
    title="Log-Out"
    content="자동 로그아웃까지 5분 남았습니다. 연장하시겠습니까?"
    type="success"
    @confirm="refresh"
    @cancel="cancelLogout"
  />

  <YnModal
    v-if="state.showLogoutErrorModal"
    :content="logoutErrorMessage"
    type="error"
    @close="state.showLogoutErrorModal = false"
  />

<!-- 시간 만료시 알려주는 용도 -->
  <!-- <YnModal
    v-if="state.showAutoLogout"
    :content="'시간이 만료되어 로그아웃 되었습니다.'"
    type="error"
    @close="state.showLogoutErrorModal = false"
  /> -->

</template>

<style scoped>
.time{
  font-size: 1.2rem;
}
.time-btn{
  border-radius: 25px;
  padding:1px 4px;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  background-color: #00664f;
  z-index: 1000;
  box-sizing: border-box;
  min-width: 320px;
}

body,
main,
#app {
  padding-top: 60px;
}

.logo {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.logo img {
  height: 40px;
  margin-right: 8px;
}

.systemText {
  font-size: 20px;
  font-weight: 600;
  color: white;
  user-select: none;
}

.menus {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  user-select: none;
  position: relative;
  justify-content: flex-end;
  min-width: 140px;
  padding-right: 10px;
}

.welcome-text {
  font-weight: 500;
  display: inline-block;
}

.logout-text {
  cursor: pointer;
  color: white;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
}

.divider {
  user-select: none;
  color: white;
}

/* 햄버거 버튼  */
.hamburger-btn {
  display: none;
  font-size: 28px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 10px;
}

.logout-icon {
  display: none;
  font-size: 25px;
  color: white;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  margin-left: 10px;
}

.logout-dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.0975);
  padding: 8px 0;
  min-width: 230px;
  opacity: 0;
  pointer-events: none;
  user-select: none;
  color: #333;
  transition: opacity 0.3s ease;
  z-index: 9999;
  display: block !important;
}

.dropdown-menu.open {
  opacity: 1;
  pointer-events: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #444;
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;
}

.dropdown-item:hover {
  background-color: #fafafa;
}

.welcome-dropdown {
  font-weight: 600;
  border-bottom: 1px solid #eee;
  margin-bottom: 6px;
  color: #555;
}

.logout-btn {
  background: transparent;
  border: none;
  color: #444;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 0 0 6px 6px;
  transition: background-color 0.2s ease;
}

.logout-btn:hover {
  background-color: #fafafa;
}

@media (max-width: 1024px) {
  .hamburger-btn {
    display: block;
  }

  .logo img {
    display: none;
  }

  .systemText {
    font-size: 18px;
  }

  .welcome-text,
  .logout-text,
  .divider {
    display: none;
  }

  .logout-icon {
    display: inline-block;
    margin-left: 0;
  }

  .menus {
    min-width: 100px;
    gap: 6px;
    padding-right: 8px;
  }
}

@media (max-width: 480px) {
  .logout-icon {
    font-size: 18px;
    padding: 4px;
  }

  .menus {
    min-width: 80px;
    padding-right: 6px;
    gap: 4px;
  }

  .systemText {
    font-size: 16px;
  }
}
</style>