<script setup>
import { reactive, provide, onMounted } from "vue";
import CourseDetail from "@/components/course/CourseDetail.vue";
import WaveLoader from "./components/common/WaveLoader.vue";
import { useLoadingStore } from "@/stores/loading";
import { watch } from "vue";

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

// F5 새로고침 시 로딩 표시 : 데이터 겹쳐보이는 거 방지용 발표 때만 보이고 지금은 주석
// onMounted(() => {
//   loading.showLoading("페이지를 불러오는 중...");

//   setTimeout(() => {
//     loading.hideLoading();
//   }, 800);
// });

watch(
  () => show.modal,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
);
</script>

<template>
  <div>
    <div v-if="loading.isLoading" class="loading-overlay">
      <div class="loading-content">
        <WaveLoader />
        <p v-if="loading.loadingMessage" class="loading-message">
          {{ loading.loadingMessage }}
        </p>
      </div>
    </div>

    <template v-if="show.modal">
      <div class="modal-overlay" @click="show.modal = false">
        <div class="modal-container" @click.stop>
          <div class="modal-content">
            <button class="modal-close-btn" @click="show.modal = false">
              <i class="bi bi-x close-icon"></i>
            </button>
            <CourseDetail :id="show.id" />
          </div>
        </div>
      </div>
    </template>

    <router-view />
  </div>
</template>

<style lang="scss">
:root {
  --app-bg: #f8f9fa;
}

html,
body,
#app {
  height: 100%;
  margin: 0;
  background-color: var(--app-bg);
  overflow-x: hidden;
  color: #343a40;
  font-size: 13px;
}

div {
  box-sizing: border-box;
}

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
  z-index: 10000;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  z-index: 9999;
}

.modal-container {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 800px;
  max-height: 95vh;
  overflow: hidden;
}

.modal-content {
  padding: 40px 20px 20px;
  overflow-y: auto;
  max-height: calc(95vh - 60px);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.modal-content::-webkit-scrollbar {
  display: none;
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  z-index: 10;
}

.close-icon {
  font-size: 30px;
  color: #888;
  transition: color 0.3s ease, transform 0.2s ease;
}

.modal-close-btn:hover .close-icon {
  color: #343a40;
  transform: scale(1.1);
}

/* 모바일 */
@media (max-width: 767px) {
  .modal-overlay {
    align-items: center;
  }

  .modal-container {
    max-width: 95%;
    max-height: 90vh;
  }

  .modal-content {
    padding: 30px 15px 15px;
  }

  .modal-close-btn {
    top: 10px;
    right: 10px;
  }

  .close-icon {
    font-size: 24px;
  }
}

// 고해상도 화면
@media (min-width: 1200px) {
  .modal-container {
    max-width: 1000px;
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.modal-container {
  animation: modalFadeIn 0.2s ease-out;
}
</style>
