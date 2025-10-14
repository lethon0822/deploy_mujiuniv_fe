<script setup>
import { onMounted, reactive } from 'vue';
import { changeCodeToTime } from '@/services/CommonMethod';
import { todayCourseStu } from '@/services/CourseService';
import { useUserStore } from '@/stores/account';

const data = reactive({
  courseList:[]
})

const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // 0~11이므로 +1
const day = String(now.getDate()).padStart(2, '0');

const today = `${year}-${month}-${day}`;

const getDayOfWeek = date =>{
  const week = ["G",'A',"B","C","D","E","F"]
  const getDayOfWeek = week[new Date(date).getDay()];
  return getDayOfWeek;
}

onMounted(async()=>{
  const info ={
    sid: useUserStore().state.signedUser.semesterId,
    time: getDayOfWeek(today),
    role: useUserStore().state.signedUser.userRole
  }
  const res = await todayCourseStu(info);
  data.courseList = res.data
})

</script>

<template>
  <template v-if="data.courseList.length< 1">
    <div>
      강의가 없습니다. 좋은 하루 보내세요
    </div>
  </template>
  <template v-else>
    <div class="card-cover" v-for="item in data.courseList">
      <div class="card-title">
        <div class="name">
          <h5>{{item.title}}</h5>
          <span>{{useUserStore().state.signedUser.userRole === "student" ? item.userName : null}}</span>
        </div>
        <div class="course-type-badge type" :class="item.type">{{ item.type }}</div>
      </div>
      <div>
        <span>{{changeCodeToTime(item.time)}} | {{item.classroom}}</span>
      </div>
    </div>
  </template>

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