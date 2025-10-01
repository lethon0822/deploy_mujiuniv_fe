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
  showAutoLogoutConfirm: false,
  showAutoLogout: false,
  showLogoutErrorModal: false,
  isDropdownOpen: false,
});

// 아래는 localStorage에 저장된 accesstoken시간을 가져오게 하는 변수들
const localkey = localStorage.getItem("authentication");
const localvalue = JSON.parse(localkey);
const expiresAt = localvalue.state.signedUser.expiresAt;
const startTime = localStorage.getItem("tokenStartTime");

// 로딩시 초기 타이머
const loadTime =
  expiresAt - Math.floor((Date.now() - Number(startTime)) / 1000);

//타이머 작업
//ms로 나와서 sec으로 기준을 바꿈
const time = ref(loadTime);
let intervalId = null;

const formatTime = (totalSecond) => {
  let minute = Math.floor(totalSecond / 60); // 소수점 제거
  let second = totalSecond % 60;
  // 음수가 될 경우 문제가 생김
  if (minute < 0 && second < 0) {
    minute = 0;
    second = 0;
  }
  const minuteText = minute >= 10 ? minute : `0${minute}`;
  const secondText = second >= 10 ? second : `0${second}`;
  return `${minuteText}:${secondText}`;
};

// 타이머(추후 web worker를 사용하여 오차를 줄이고자 한다)
// 로그아웃 전환 두개 만들기 1. 컨펌창 없이, 2. 컨펌창 있게 (설정시 loadtime체크 1800 이상 차이나면 그냥 로그 아웃 )
const startTimer = async () => {
  intervalId = setInterval(async () => {
    // if((Date.now() - Number(startTime))/1000 < 1800){
    //   logout();
    // }
    if (time.value === 300) {
      state.showAutoLogoutConfirm = true;
      time.value--;
    } else if (time.value > 0) {
      time.value--;
    } else {
      clearInterval(intervalId); // 먼저 멈춤
      state.showAutoLogout = true;
    }
  }, 1000);
};

const refresh = async () => {
  state.showAutoLogoutConfirm = false;
  const res = await reissue();
  if (res.status !== 200 || res.status === undefined) {
    state.showLogoutErrorModal = true;
    logoutErrorMessage.value = "잠시 후 다시 시도해주십시오";
    return;
  }
  clearInterval(intervalId);
  time.value = 1800;
  localStorage.setItem("tokenStartTime", Date.now());
  startTimer();
  state.showAutoLogout = false;
};

const closeAutoLogout = async () => {
  state.showAutoLogout = false;
  confirmLogout();
};

const openLogoutConfirm = () => {
  state.showLogoutConfirm = true;
};

const confirmLogout = async () => {
  state.showLogoutConfirm = false;
  try {
    const res = await logout();
    if (res.status === 200) {
      userStore.signOut();
      localStorage.removeItem("tokenStartTime");
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
  state.showAutoLogoutConfirm = false;
};

const logoutAccount = (check) => {
  openLogoutConfirm();
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
  if (intervalId) clearInterval(intervalId);
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
            <div class="session-timer-container">
              <div class="timer-display" :class="{ warning: time <= 300 }">
                <i class="bi bi-clock timer-icon"></i>
                <span class="timer-text">{{ formatTime(time) }}</span>
              </div>
              <button
                class="extend-btn"
                @click="refresh"
                title="세션 시간 연장"
              >
                <i class="bi bi-arrow-clockwise"></i>
                <span class="extend-text">연장</span>
              </button>
            </div>

            <span class="welcome-text"
              >{{ userStore.state.signedUser.userName }}님 반갑습니다</span
            >
            <span class="divider">|</span>
            <a class="logout-text" @click="logoutAccount()">로그아웃</a>

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

              <div
                class="dropdown-menu"
                :class="{ open: state.isDropdownOpen }"
              >
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
    v-if="state.showAutoLogoutConfirm"
    title=""
    content="자동 로그아웃까지 5분 남았습니다. 연장하시겠습니까?"
    type="warning"
    @confirm="refresh"
    @cancel="cancelLogout"
  />

  <YnModal
    v-if="state.showLogoutErrorModal"
    :content="logoutErrorMessage"
    type="error"
    @close="state.showLogoutErrorModal = false"
  />

  <YnModal
    v-if="state.showAutoLogout"
    :content="'로그인 정보가 만료되어 로그인 화면으로 돌아갑니다'"
    type="success"
    @close="closeAutoLogout"
  />
</template>

<style scoped>
.session-timer-container {
  display: flex;
  align-items: stretch;
  gap: 8px;
  padding: 10px 0;
  border-radius: 4px;
}

.timer-display {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 7px 0 10px;
  color: #ffffff;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.timer-display.warning {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
  font-weight: 700;
}

.timer-display.warning .timer-icon {
  color: #ffc107;
}

.timer-icon {
  font-size: 16px;
  color: #fff;
  animation: none;
}

.timer-text {
  font-size: 15px;
  font-family: Arial, sans-serif;
  min-width: 52px;
  text-align: center;
}

.extend-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;

  background-color: #fcfcfc; /* 더 밝은 흰색 */
  color: #00664f;
  border: none;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.1s ease;
  box-shadow: none;
}

.extend-btn:active {
  background-color: #d0d0d0;
  transform: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.extend-btn i {
  font-size: 14px;
}

.extend-text {
  font-size: 14px;
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
  z-index: 1001;
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

/* 햄버거 버튼  */
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
  z-index: 1001;
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
  z-index: 1001;
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

  .session-timer-container {
    padding: 6px 10px;
    gap: 6px;
  }

  .timer-icon {
    font-size: 14px;
  }

  .timer-text {
    font-size: 13px;
    min-width: 48px;
  }

  .extend-btn {
    padding: 5px 8px;
    font-size: 13px;
  }

  .extend-btn:active {
    background-color: #c0c0c0;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .extend-btn i {
    font-size: 13px;
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

  .session-timer-container {
    padding: 5px 8px;
    gap: 4px;
    border-radius: 4px;
  }

  .timer-icon {
    font-size: 13px;
  }

  .timer-text {
    font-size: 12px;
    min-width: 42px;
  }

  .extend-text {
    display: none;
  }

  .extend-btn {
    padding: 5px 8px;
    border-radius: 4px;
  }

  .extend-btn i {
    font-size: 14px;
  }
}
</style>
