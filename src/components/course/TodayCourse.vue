<script setup>
import { onMounted, reactive } from 'vue';

</script>

<template>
  <div class="card-cover">
    <div class="card-title">
      <div class="name">
        <h5>공학윤리와 사회</h5>
        <span>박도흠</span>
      </div>
      <div class="course-type-badge type" :class="'교양필수'">교양필수 </div>
    </div>
    <div>
      <span>목 16:00 ~ 17:30 | 청학관 404호</span>
    </div>
  </div>

</template>

<style scoped>
.card-cover{
  border: 1px solid #5ba666;
  border-radius: 10px;
  padding: 15px;
  margin: 10px 0;
  
}

.card-title{
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
}

.name{
  display: flex;
  gap: 10px;
}

.type{
  text-align: center;
  width:60px;
  padding:2px;
  border-radius: 5px;
}

.course-type-badge.전공필수 {
  background: #f3e5f5;
  color: #7b1fa2;
}

.course-type-badge.전공선택 {
  background: #e3f2fd;
  color: #1976d2;
}

.course-type-badge.교양필수 {
  background: #e8f5e8;
  color: #388e3c;
}

.course-type-badge.교양선택 {
  background: #fff3e0;
  color: #f57c00;
}


  
</style>