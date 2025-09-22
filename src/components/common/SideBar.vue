<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";

defineProps({
  isMenuOpen: Boolean,
});

const accordian = ref(null);
const route = useRoute();
const userStore = useUserStore();

const slideUp = (element) => {
  if (!element) return;

  element.style.height = element.scrollHeight + "px";
  element.offsetHeight; // force reflow
  element.style.transition = "height 0.3s ease";
  element.style.height = "0px";
  element.style.overflow = "hidden";

  setTimeout(() => {
    element.style.display = "none";
    element.style.height = "";
    element.style.overflow = "";
    element.style.transition = "";
  }, 300);
};

const slideDown = (element) => {
  if (!element) return;

  element.style.display = "block";
  element.style.height = "0px";
  element.style.overflow = "hidden";
  element.style.transition = "height 0.3s ease";

  nextTick(() => {
    element.style.height = element.scrollHeight + "px";

    setTimeout(() => {
      element.style.height = "";
      element.style.overflow = "";
      element.style.transition = "";
    }, 300);
  });
};

const toggleMenu = (liElement) => {
  if (!liElement) return;

  const parentUl = liElement.parentElement;
  if (!parentUl) return;

  const allActiveItems = parentUl.querySelectorAll("li.active");
  allActiveItems.forEach((item) => {
    if (item !== liElement) {
      item.classList.remove("active");
      const subMenu = item.querySelector("ul");
      if (subMenu) {
        slideUp(subMenu);
        subMenu.classList.remove("show-dropdown");
      }
    }
  });

  const isActive = liElement.classList.contains("active");

  if (isActive) {
    liElement.classList.remove("active");
    const subMenu = liElement.querySelector("ul");
    if (subMenu) {
      slideUp(subMenu);
      subMenu.classList.remove("show-dropdown");
    }
  } else {
    liElement.classList.add("active");
    const subMenu = liElement.querySelector("ul");
    if (subMenu) {
      slideDown(subMenu);
      subMenu.classList.add("show-dropdown");
    }
  }
};

const handleMenuClick = (event) => {
  const link = event.target;

  // router-link 클릭 시 메뉴는 토글하지 않음
  if (
    link.tagName.toLowerCase() === "a" &&
    link.classList.contains("router-link")
  ) {
    return; // 라우터 링크는 그대로 동작하게 함
  }

  // 일반 메뉴 항목 클릭 시 토글
  if (link.tagName.toLowerCase() === "a") {
    event.preventDefault();
    const li = link.closest("li");
    if (li) toggleMenu(li);
  }
};

const openMenuByRoute = () => {
  if (!accordian.value) return;

  let path = route.path;

  // 현재 경로에 해당하는 링크 찾기
  const target = accordian.value.querySelector(`li a[href="${path}"]`);

  if (target) {
    let parent = target.parentElement;
    while (parent && parent !== accordian.value) {
      if (parent.tagName === "LI") {
        parent.classList.add("active");
        const subMenu = parent.querySelector("ul");
        if (subMenu) {
          subMenu.classList.add("show-dropdown");
          subMenu.style.display = "block";
        }
      }
      parent = parent.parentElement;
    }
  }
};

let menuClickHandlers = [];

const setupEventListeners = () => {
  if (!accordian.value) return;

  // 기존 이벤트 리스너 제거
  removeEventListeners();

  const menuLinks = accordian.value.querySelectorAll("a");

  menuLinks.forEach((link) => {
    const handler = (event) => handleMenuClick(event);
    link.addEventListener("click", handler);
    menuClickHandlers.push({ element: link, handler });
  });
};

const removeEventListeners = () => {
  menuClickHandlers.forEach(({ element, handler }) => {
    element.removeEventListener("click", handler);
  });
  menuClickHandlers = [];
};

onMounted(() => {
  setupEventListeners();
  openMenuByRoute();
});

onUnmounted(() => {
  removeEventListeners();
});

watch(
  () => route.path,
  () => {
    openMenuByRoute();
  }
);

// userStore가 변경될 때 이벤트 리스너 재설정
watch(
  () => userStore.state.signedUser?.userRole,
  () => {
    nextTick(() => {
      setupEventListeners();
      openMenuByRoute();
    });
  }
);
</script>

<template>
  <div class="accordian" :class="{ open: isMenuOpen }" ref="accordian">
    <ul>
      <!-- 학적 -->
      <template v-if="userStore.state.signedUser?.userRole !== 'staff'">
        <li class="menu-hakjeok">
          <a href="javascript:void(0);">학적</a>
          <ul>
            <li>
              <router-link to="/profile" class="router-link">
                학적기본사항관리
              </router-link>
            </li>
            <li>
              <router-link to="/renewal/privacy" class="router-link">
                개인정보변경
              </router-link>
            </li>

            <li v-if="userStore.state.signedUser?.userRole === 'student'">
              <router-link to="/application" class="router-link">
                휴·복학신청
              </router-link>
            </li>
            <li v-if="userStore.state.signedUser?.userRole === 'professor'">
              <router-link to="/application" class="router-link">
                휴·복직신청
              </router-link>
            </li>
          </ul>
        </li>
      </template>

      <template v-if="userStore.state.signedUser?.userRole === 'student'">
        <li class="menu-sugang">
          <a href="javascript:void(0);">수강</a>
          <ul>
            <li>
              <router-link to="/enrollment" class="router-link">
                수강신청 관리
              </router-link>
            </li>
          </ul>
        </li>
      </template>

      <!-- 강의 -->
      <li class="menu-gangui">
        <a href="javascript:void(0);">강의</a>
        <ul>
          <li>
            <router-link to="/course/history" class="router-link">
              강의조회
            </router-link>
          </li>
          <template v-if="userStore.state.signedUser?.userRole === 'professor'">
            <li>
              <router-link
                to="/professor/course/registration"
                class="router-link"
              >
                강의개설
              </router-link>
            </li>
            <li>
              <router-link to="/professor/course/state" class="router-link">
                강의신청현황조회
              </router-link>
            </li>
            <li>
              <router-link
                to="/professor/course/management"
                class="router-link"
              >
                강의관리
              </router-link>
            </li>
            <li>
              <router-link to="/professor/survey/check" class="router-link">
                강의평가조회
              </router-link>
            </li>
          </template>
        </ul>
      </li>

      <!-- 성적 -->
      <template v-if="userStore.state.signedUser?.userRole === 'student'">
        <li class="menu-score">
          <a href="javascript:void(0);">성적</a>
          <ul>
            <li>
              <router-link to="/grade/permanent" class="router-link">
                영구성적조회
              </router-link>
            </li>
            <li>
              <router-link to="/grade/current" class="router-link">
                금학기성적조회
              </router-link>
            </li>
          </ul>
        </li>

        <!-- 졸업 -->
        <li class="menu-graduate">
          <a href="javascript:void(0);">졸업</a>
          <ul>
            <li>
              <router-link to="/graduation" class="router-link">
                졸업자가진단
              </router-link>
            </li>
          </ul>
        </li>
      </template>

      <!-- 시스템관리 -->
      <template v-if="userStore.state.signedUser?.userRole === 'staff'">
        <li class="menu-management">
          <a href="javascript:void(0);">시스템관리</a>
          <ul>
            <li>
              <router-link to="/schedule" class="router-link">
                학사일정관리
              </router-link>
            </li>
            <li>
              <router-link to="/deptmanage" class="router-link">
                학과관리
              </router-link>
            </li>
            <li>
              <router-link to="/staff/approval" class="router-link">
                학적변동신청
              </router-link>
            </li>
            <li>
              <router-link to="/staff/approval/course" class="router-link">
                강의개설승인관리
              </router-link>
            </li>
            <li>
              <router-link to="/staff" class="router-link">
                구성원현황
              </router-link>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-weight: 700;
  background-color: #fff;
}

.accordian {
  position: fixed;
  top: 60px;
  left: 0;
  height: calc(100vh - 60px);
  width: 60vw;
  background: white;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.23);
  overflow-y: auto;
  z-index: 999;
  transform: translateX(-60vw);
  transition: transform 0.3s ease;
}

.accordian.open {
  transform: translateX(0);
}

/* 스크롤바 */
.accordian::-webkit-scrollbar {
  width: 5px;
  height: 8px;
}
.accordian::-webkit-scrollbar-track {
  background-color: #e4e4e4;
}
.accordian::-webkit-scrollbar-thumb {
  background: #0089ff;
  transition: 0.5s;
}
.accordian::-webkit-scrollbar-thumb:hover {
  background: #d5b14c;
}

.accordian ul {
  list-style: none;
}

.accordian ul li {
  list-style: none;
  position: relative;
}

.accordian ul li > a {
  color: #343a40;
  background-color: white;
  text-decoration: none;
  display: block;
  padding: 13px 15px;
  margin-bottom: 1px;
  font-weight: 500;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
}

.accordian li.menu-sugang > a,
.accordian li.menu-hakjeok > a,
.accordian li.menu-gangui > a,
.accordian li.menu-etc > a,
.accordian li.menu-score > a,
.accordian li.menu-management > a,
.accordian li.menu-graduate > a {
  background-color: #fff;
  color: #343a40;
  outline: 1px solid #d9d9d9;
  font-weight: 700;
}

.accordian ul li ul {
  display: none;
  margin: 0;
  position: relative;
  padding-left: 0;
  width: 100%;
}

.accordian ul li.active > ul.show-dropdown {
  border-bottom: 1px solid #d9d9d9;
  display: block;
}

.accordian ul li ul li a {
  background-color: #f8f9fa !important;
  color: #343a40;
  margin-bottom: 0;
  padding-left: 15px;
  cursor: pointer;
}

.accordian ul li ul li.active > a,
.accordian ul li ul li > a.active {
  background-color: #e9f5e8 !important;
  color: #00664f;
  box-shadow: none !important;
}

.accordian a:not(:only-child):after {
  content: "\f105";
  position: absolute;
  right: 20px;
  top: 10px;
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 20px;
  transition: 0.3s;
}

.accordian li.active > a:not(:only-child):after {
  transform: rotate(90deg);
}

.accordian ul li ul li a:hover,
.accordian ul li ul li a:focus {
  background-color: #e9f5e8 !important;
  color: #00664f;
}

/* 모바일 & 태블릿 */
@media (max-width: 1023px) {
  .accordian {
    width: 300px !important;
    transform: translateX(-300px);
    border-top-right-radius: 15px;
    border-bottom-right-radius: 15px;
  }

  .accordian.open {
    transform: translateX(0);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
  }

  .accordian ul li > a {
    padding: 15px 15px;
    font-size: 13px;
  }

  .accordian li.menu-sugang > a,
  .accordian li.menu-hakjeok > a,
  .accordian li.menu-gangui > a,
  .accordian li.menu-etc > a,
  .accordian li.menu-score > a,
  .accordian li.menu-management > a,
  .accordian li.menu-graduate > a {
    font-weight: 500;
  }
}

/* PC */
@media (min-width: 1024px) {
  .accordian {
    width: 250px !important;
    transform: translateX(0) !important;
    transition: none !important;
  }
}
</style>
