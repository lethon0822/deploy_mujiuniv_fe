<script setup>
import logo from "@/assets/logoW.svg";
import { useAccountStore, useUserStore } from "@/stores/account";
import { logout } from "@/services/accountService";
import { useRouter } from "vue-router";
import { ref, defineEmits, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["toggle-menu"]);

const router = useRouter();
const userStore = useUserStore();
const account = useAccountStore();

const onHamburgerClick = () => {
  emit("toggle-menu");
};

const logoutAccount = async () => {
  if (!confirm("로그아웃 하시겠습니까?")) return;
  const res = await logout();
  if (!res || res.status !== 200) return;
  account.setLoggedIn(false);
  router.push("/login");
};

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const logoutAndClose = async () => {
  await logoutAccount();
  isDropdownOpen.value = false;
};

// 바깥 클릭 시 드롭다운 닫기
const closeDropdown = (event) => {
  const dropdown = event.target.closest(".logout-dropdown");
  if (!dropdown) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
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

        <template v-if="account.state.loggedIn">
          <div class="menus">
            <span class="welcome-text"
              >{{ userStore.userName }}님 반갑습니다</span
            >
            <span class="divider">|</span>
            <a class="logout-text" @click="logoutAccount">로그아웃</a>

            <div
              class="logout-dropdown"
              @click.stop="toggleDropdown"
              tabindex="0"
              @keydown.enter.prevent="toggleDropdown"
              @keydown.space.prevent="toggleDropdown"
              aria-haspopup="true"
              :aria-expanded="isDropdownOpen.toString()"
            >
              <i class="bi bi-box-arrow-right logout-icon" title="로그아웃"></i>

              <div class="dropdown-menu" :class="{ open: isDropdownOpen }">
                <div class="dropdown-item welcome-dropdown">
                  {{ userStore.userName }}님 반갑습니다
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
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  padding: 10px 20px;
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
  margin-right: 10px;
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

/* 로그아웃 버튼 */
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

/* 반응형 */
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

  /* 데스크탑 텍스트 숨기기 */
  .welcome-text,
  .logout-text,
  .divider {
    display: none;
  }

  /* 모바일 아이콘 보이기 */
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

/* 480px 이하일 때 좀 더 작게 */
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
