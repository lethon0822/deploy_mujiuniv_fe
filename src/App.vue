<script setup>
import { reactive, provide, } from "vue";
import CourseDetail from "@/components/course/CourseDetail.vue";
import { useLoadingStore } from "@/stores/loading";

const show = reactive({
  modal: false,
  id: null,
});

const openModal = (id) => {
  console.log("id:", id);
  show.modal = true;
  show.id = id;
  console.log("show.id", show.id);
};

provide("openModal", openModal);

const loading = useLoadingStore();


</script>

<template>
  <div>
    <!-- 전역 로딩 오버레이 -->
    <div v-if="loading.isLoading" class="loading-overlay">
      <div class="loading-content"></div>
    </div>

    <!-- 상세 모달 -->
    <template v-if="show.modal">
      <div class="black-bg" @click="show.modal = false">
        <div class="cover">
          <div class="white-bg" @click.stop>
            <i class="bi bi-x close-icon" @click="show.modal = false"></i>
            <CourseDetail :id="show.id" />
          </div>
        </div>
      </div>
    </template>

    <router-view />
  </div>
</template>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  margin: 0;
  background-color: #f8f9fa;
  overflow-x: hidden;
  color: #343a40;
  font-size: 12px;
}

div {
  box-sizing: border-box;
}

// 전역 로딩 오버레이 스타일
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000; // 모든 것 위에 표시
}

.loading-content {
  text-align: center;
  padding: 20px;
  background: transparent;
  border-radius: 15px;
  min-width: 200px;
}

.loading-message {
  margin-top: 20px;
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.black-bg {
  display: flex;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  padding: 20px;
  z-index: 9999;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10px;
  padding-left: 200px;
}

.cover {
  overflow: hidden;
  border-radius: 8px;
}

.close {
  font-size: 20px;
  font-weight: 800;
  background-color: #2460ce;
  color: #fff;
  width: 30px;
  height: 30px;
  cursor: pointer;
  text-align: center;
  margin-left: auto;
  border-radius: 8px;
  line-height: 30px;
  margin-right: 28px;
}

.white-bg {
  width: 800px;
  height: 800px;
  background: white;
  padding: 50px 20px 0 20px;
  overflow-y: auto;
  position: relative;
  border-radius: 8px;
}

.close-icon {
  position: absolute;
  top: -5px;
  right: 20px;
  font-size: 40px;
  font-weight: bold;
  cursor: pointer;
  color: #343a40;
  transition: color 0.3s ease, transform 0.2s ease;
}

.close-icon:hover {
  color: #495057 !important;
  transform: scale(1.1);
}
</style>
