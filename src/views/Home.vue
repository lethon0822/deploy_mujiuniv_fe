<script setup>
import Header from "@/components/common/Header.vue";
import SideBar from "@/components/common/SideBar.vue";
import { useRoute } from "vue-router";
import { ref, computed } from "vue";

const route = useRoute();
const isMenuOpen = ref(false);

// const isDefaultHome = computed(
//   () => route.path === "/" || route.path === "/main"
// );

const toggleMenuOpen = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <div>
    <Header @toggle-menu="toggleMenuOpen" />
    <div class="d-flex main">
      <SideBar :is-menu-open="isMenuOpen" @close-menu="isMenuOpen = false" />
      <div v-if="isMenuOpen" class="overlay" @click="isMenuOpen = false" />
      <div class="dummy"></div>
      <div class="content d-flex">
        <div class="router">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  margin-top: 60px;
  height: calc(100vh - 60px);
  overflow: hidden;
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
  padding-right: 8px;
  margin-right: -8px;
}

.content:has(.transcript-history-page) {
  flex: none;
  width: 100%;
}

.router {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgba(128, 128, 128, 0.3) transparent;
}

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

.home-widgets {
  display: flex;
  margin-top: 20px;
  align-items: flex-start;
  justify-content: center;
}

.accordian {
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background: #fff;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.23);
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.overlay {
  position: fixed;
  top: 60px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 60px);
  background-color: #f0f6fc;
  opacity: 0.5;
  z-index: 998;
  cursor: pointer;
}

@media (max-width: 1023px) {
  .main {
    display: flex;
  }

  .dummy {
    display: none;
  }

  .content {
    padding-right: 4px;
    margin-right: -4px;
    display: flex;
    height: calc(100vh - 60px);
  }

  .router {
    scrollbar-width: auto;
    height: 100%;
  }

  .router::-webkit-scrollbar {
    width: 12px;
  }

  .router::-webkit-scrollbar-thumb {
    background-color: rgba(128, 128, 128, 0.4);
    border-radius: 6px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .home-widgets {
    flex-direction: column;
    align-items: center;
  }

  .home-widgets > *:last-child {
    flex: none;
  }
}

@media (min-width: 1024px) {
  .router {
    width: 100%;
  }
}

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
