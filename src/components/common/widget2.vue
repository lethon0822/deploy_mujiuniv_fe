<script setup>
import TodayCourse from "../course/TodayCourse.vue";
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <div class="header">
        <i class="bi bi-book"></i>
        <h2>오늘의 수업</h2>
      </div>
      <div class="content">
        <TodayCourse />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  min-height: 350px;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.header i {
  font-size: 20px;
  color: #6b7280;
}

.header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.content {
  padding: 10px 24px 10px 24px;
  background: #ffffff;
}
</style>
