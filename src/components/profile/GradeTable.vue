<script setup>
import { defineProps } from "vue";

const props = defineProps({
  courseList: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="table-container" :style="{ maxHeight: '600px' }">
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="year-th">연도</th>
            <th class="semester-th">학기</th>
            <th class="type-th">이수구분</th>
            <th class="courseCode-th">과목코드</th>
            <th class="title-th">과목명</th>
            <th class="professorName-th">담당교수</th>
            <th class="grade-th">학년</th>
            <th class="credit-th">학점</th>
            <th class="rank-th">등급</th>
            <th class="point-th">평점</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in courseList" :key="course.courseCode">
            <td class="year-col">{{ course.year }}</td>
            <td class="semester-col">{{ course.semester }}</td>
            <td class="type-col">{{ course.type }}</td>
            <td class="courseCode-col">{{ course.courseCode }}</td>
            <td class="title-col">{{ course.title }}</td>
            <td class="professorName-col">{{ course.professorName }}</td>
            <td class="grade-col">{{ course.grade }}학년</td>
            <td class="credit-col">{{ course.credit }}</td>
            <td class="rank-col">{{ course.rank }}</td>
            <td class="point-col">{{ course.point }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  margin: 20px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1430px; /* 최대 너비 제한 */
  border: 0.2px solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;

  /* 넘칠 경우 가로 스크롤 가능하도록 */
  overflow-x: auto;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto; /* hidden → auto */
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #cdcdcd #f0f0f0;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

thead {
  color: #333;
  background-color: #f8f9fa;
}
thead th {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 2;
  padding: 12px 4px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

thead th::before,
thead th::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #969696;
}

thead th::before {
  top: 0;
}

thead th::after {
  bottom: 0;
}

tbody {
  text-align: center;
  color: black;
  background-color: white;
}
tbody tr {
  border-bottom: 1px solid #747474;
  height: 40px;
  background-color: white;
}
tbody tr:hover {
  background-color: #f8f9fa;
}
tbody td {
  padding: 8px 4px;
  border-right: none;
  font-size: 13px;
}
thead th,
tbody td {
  color: #343a40;
}

/* 버튼 */
button {
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin: 2px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

button.enroll-btn {
  background-color: #2460ce;
  color: #fff;
}

button.enroll-btn:hover {
  background-color: #1f53b5;
}

.enroll-btn.enrolled {
  background-color: gray;
  cursor: not-allowed;
}

.enroll-btn.enrolled:hover {
  background-color: gray;
}

button.cancel-btn {
  background-color: #f44336;
}

button.cancel-btn:hover {
  background-color: #d32f2f;
}

.link {
  color: #2460ce;
  cursor: pointer;
  text-decoration: underline;
}
.link:hover {
  color: #1f53b5;
}
.setting {
  padding-top: 2px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  justify-content: center;
}
.red {
  color: #d61421;
  font-weight: 600;
}
.gray {
  color: #666;
  font-weight: 600;
}
.blue {
  color: #2460ce;
  font-weight: 700;
}

.remaining-count {
  color: #28a745;
  font-weight: 600;
}

.status {
  width: 120px;
}
.button {
  width: 150px;
}

th.code,
td.code,
th.deptName,
td.deptName,
th.title,
td.title,
th.classroom,
td.classroom,
th.type,
td.type,
th.professor,
td.professor {
  width: 130px;
  text-align: center;
}

th.grade,
td.grade {
  width: 150px;
  text-align: center;
}

td.time,
th.time {
  width: 110px;
  text-align: center;
}

th.credit,
td.credit {
  width: 60px;
  text-align: center;
}

th.maxStd,
td.maxStd,
th.remStd,
td.remStd {
  width: 120px;
  text-align: center;
}

td.enroll-action {
  width: 120px;
  text-align: center;
}

/* 모바일 */
@media all and (max-width: 767px) {
  .table-container {
    min-width: auto;
    padding: 15px 10px 0 10px;
  }

  /* 기존 컬럼들 숨김 */
  .year-col,
  .semester-col,
  .type-col,
  .courseCode-col,
  .professorName-col,
  .year-th,
  .semester-th,
  .type-th,
  .courseCode-th,
  .professorName-th {
    display: none;
  }

  .title-col,
  .title-th,
  .grade-col,
  .credit-col,
  .rank-col,
  .point-col,
  .grade-th,
  .credit-th,
  .rank-th,
  .point-th {
    display: table-cell;
  }

  thead th {
    font-size: 12px;
    padding: 10px 2px;
  }
  tbody td {
    font-size: 11px;
    padding: 6px 2px;
  }
}

/* 테블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    min-width: auto;
    max-width: 100%;
    margin: 15px;
    padding: 20px 20px 0 20px;
  }

  thead th {
    font-size: 13px;
    padding: 11px 3px;
  }

  tbody td {
    font-size: 12px;
    padding: 7px 3px;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .table-container {
    min-width: auto; /* 또는 제거 */
    max-width: 1430px;
    width: 90%; /* 화면 너비에 맞게 가변적 */
    margin: 20px auto; /* 중앙 정렬 유지 */
  }
}
</style>
