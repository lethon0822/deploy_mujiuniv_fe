<script setup>
import Header from "@/components/common/Header.vue";
import SideBar from "@/components/common/SideBar.vue";
import Notices from "@/components/common/Notices.vue";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const isMenuOpen = ref(false);

const toggleMenuOpen = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <div>
    <Header @toggle-menu="toggleMenuOpen" />

    <div class="d-flex main">
      <SideBar :is-menu-open="isMenuOpen" />
      <div class="dummy"></div>
      <SideBar />

      <div class="content d-flex">
        <div class="router">
          <router-view />
          <Notices v-if="route.path === '/'" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  margin-top: 60px;
  height: calc(100vh - 60px); /* 헤더 빼고 꽉 채움 */
  overflow: hidden; /* 부모 스크롤 막음 */
  display: flex;
}

.sidebar {
  width: 250px;
  box-sizing: border-box;
}

.dummy {
  width: 250px;
}

.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  /* 스크롤바가 컨테이너 밖으로 나오도록 패딩 추가 */
  padding-right: 8px;
  margin-right: -8px;
}

.content:has(.transcript-history-page) {
  flex: none;
  width: 100%;
}

.router {
  flex: 1;
  overflow-y: auto; /* overlay 대신 auto 사용 (더 나은 호환성) */
  overflow-x: hidden;
  height: 100%;
  /* 스크롤바 스타일링 */
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(128, 128, 128, 0.3) transparent; /* Firefox */
}

/* WebKit 기반 브라우저 (Chrome, Safari 등) */
.router::-webkit-scrollbar {
  width: 8px;
  background: transparent;
}

.router::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  border: 1px solid transparent;
  background-clip: padding-box;
  transition: background-color 0.2s ease;
}

.router::-webkit-scrollbar-thumb:hover {
  background-color: rgba(128, 128, 128, 0.5);
}

.router::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

/* 반응형에서 더미 숨김 */
@media (max-width: 1023px) {
  .main {
    display: flex; /* flex 레이아웃 유지 */
  }

  .dummy {
    display: none;
  }

  .content {
    /* 모바일에서 스크롤바가 제대로 보이도록 조정 */
    padding-right: 4px;
    margin-right: -4px;
    display: flex; /* flex 레이아웃 유지 */
    height: calc(100vh - 60px); /* 명시적 높이 설정 */
  }

  .router {
    /* 모바일에서 스크롤바 두께 조정 */
    scrollbar-width: auto; /* Firefox에서 기본 두께 사용 */
    height: 100%; /* 높이 확실히 설정 */
  }

  .router::-webkit-scrollbar {
    width: 12px; /* 모바일에서 더 두꺼운 스크롤바 */
  }

  .router::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.4);
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
}

@media (min-width: 1024px) {
  .router {
    width: 100%;
  }
}

/* 터치 디바이스에서 스크롤바 항상 표시 */
@media (hover: none) and (pointer: coarse) {
  .router::-webkit-scrollbar {
    width: 14px;
  }

  .router::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.5);
    border-radius: 7px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .content {
    padding-right: 6px;
    margin-right: -6px;
  }
}
</style>
