<script setup>
import { onMounted, onUnmounted } from "vue";
import TodayCourse from "../course/TodayCourse.vue";
import InfoMuji from "../management/InfoMuji.vue";
import { useUserStore } from "@/stores/account";

const userStore = useUserStore();
const isStaff = userStore.state.signedUser.userRole === "staff";

const handleResize = () => {
  if (isStaff) {
    window.dispatchEvent(new Event("resize"));
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <div class="widget">
    <div class="widget-header">
      <i class="bi bi-book"></i>
      <h2>{{ isStaff ? "무지대 정보" : "오늘의 수업" }}</h2>
    </div>
    <div class="widget-content" :class="{ 'staff-mobile': isStaff }">
      <TodayCourse v-if="!isStaff" />
      <InfoMuji v-else />
    </div>
  </div>
</template>

<style scoped>
.widget {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 430px;
  overflow: hidden;
}

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  height: 50px;
  box-sizing: border-box;
}

.widget-header i {
  font-size: 18px;
  color: #6b7280;
}

.widget-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.widget-content {
  padding: 20px 24px;
  height: calc(430px - 50px);
  overflow: visible;
  box-sizing: border-box;
}

.widget-content :deep(*) {
  max-height: 100%;
  overflow: visible;
}

@media (max-width: 767px) {
  .widget-content.staff-mobile {
    padding: 20px 24px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .widget-content.staff-mobile :deep(.info-cover > div:first-child) {
    display: none !important;
  }

  .widget-content.staff-mobile :deep(.info-cover) {
    display: block !important;
    width: 100% !important;
    max-width: 450px !important;
  }

  .widget-content.staff-mobile :deep(.count-result) {
    width: 100% !important;
    padding: 0 !important;
  }

  .widget-content.staff-mobile :deep(.count-card) {
    max-width: 100% !important;
    margin: 12px 0 !important;
    height: 60px !important;
    font-size: 16px !important;
  }

  .widget-content.staff-mobile :deep(.title) {
    font-size: 17px !important;
    font-weight: 600 !important;
    margin-bottom: 10px !important;
  }
}

@media (min-width: 768px) {
  .widget-content.staff-mobile :deep(canvas) {
    max-width: 100% !important;
    height: auto !important;
  }

  .widget-content.staff-mobile :deep(.chart-container) {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
