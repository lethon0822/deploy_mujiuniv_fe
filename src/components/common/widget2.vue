<script setup>
import TodayCourse from '../course/TodayCourse.vue';
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <span> <i class="bi bi-book"></i>  오늘의 수업</span>
      <TodayCourse/>
    </div>
  </div>
</template>

<style scoped>
.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 15px 15px 13px 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  min-height: 400px;
}
span{
  font-size: 20px;
  font-weight: 500;
  font-family: -apple-system;
}


.main-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
