<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch, defineEmits } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";

// 부모 컴포넌트에 보낼 'close-menu' 이벤트를 정의합니다.
const emit = defineEmits(["close-menu"]);

defineProps({
  isMenuOpen: Boolean,
});

const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const accordian = ref(null);
const route = useRoute();
const userStore = useUserStore();

// 화면 너비를 반응형으로 추적
const isMobileOrTablet = ref(false);

const updateScreenSize = () => {
  isMobileOrTablet.value = window.innerWidth <= 1023; // CSS의 @media (max-width: 1023px)와 일치
};

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
  const link = event.target.closest("a");
  if (!link) return;

  if (link.href && link.classList.contains("router-link")) {
    if (isMobileOrTablet.value) {
      emit("close-menu");
    }
    return;
  }

  event.preventDefault();
  const li = link.closest("li");
  if (li) toggleMenu(li);
};

const openMenuByRoute = () => {
  if (!accordian.value) return;

  let path = route.path;

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
  updateScreenSize();
  window.addEventListener("resize", updateScreenSize);
  setupEventListeners();
  openMenuByRoute();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenSize);
  removeEventListeners();
});

watch(
  () => route.path,
  () => {
    openMenuByRoute();
  }
);

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

            <li v-if="userStore.state.signedUser.userRole === 'student'">
              <router-link to="/application" class="router-link">
                {{
                  userStore.state.signedUser.userRole === "student"
                    ? "휴·복학신청"
                    : "휴·복직신청"
                }}
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
              <router-link :to="`${student}/enrollment`" class="router-link">
                수강신청 관리
              </router-link>
            </li>
          </ul>
        </li>
      </template>

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
                :to="`${professor}/course/registration`"
                class="router-link"
              >
                강의개설
              </router-link>
            </li>
            <li>
              <router-link
                :to="`${professor}/course/state`"
                class="router-link"
              >
                강의신청현황조회
              </router-link>
            </li>
            <li>
              <router-link
                :to="`${professor}/course/management`"
                class="router-link"
              >
                강의관리
              </router-link>
            </li>
            <li>
              <router-link
                :to="`${professor}/survey/check`"
                class="router-link"
              >
                강의평가조회
              </router-link>
            </li>
          </template>
        </ul>
      </li>

      <template v-if="userStore.state.signedUser?.userRole === 'student'">
        <li class="menu-score">
          <a href="javascript:void(0);">성적</a>
          <ul>
            <li>
              <router-link
                :to="`${student}/grade/permanent`"
                class="router-link"
              >
                영구성적조회
              </router-link>
            </li>
            <li>
              <router-link :to="`${student}/grade/current`" class="router-link">
                금학기성적조회
              </router-link>
            </li>
          </ul>
        </li>

        <li class="menu-graduate">
          <a href="javascript:void(0);">졸업</a>
          <ul>
            <li>
              <router-link :to="`${student}/graduation`" class="router-link">
                졸업자가진단
              </router-link>
            </li>
          </ul>
        </li>
      </template>

      <template v-if="userStore.state.signedUser.userRole === 'staff'">
        <li class="menu-management">
          <a href="javascript:void(0);">시스템관리</a>
          <ul>
            <li>
              <router-link :to="`${staff}/schedule`" class="router-link">
                학사일정관리
              </router-link>
            </li>
            <li>
              <router-link :to="`${staff}/deptmanage`" class="router-link">
                학과관리
              </router-link>
            </li>
            <li>
              <router-link :to="`${staff}/approval`" class="router-link">
                학적변동신청
              </router-link>
            </li>
            <li>
              <router-link :to="`${staff}/approval/course`" class="router-link">
                강의개설승인관리
              </router-link>
            </li>
            <li>
              <router-link :to="`${staff}/member`" class="router-link">
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
