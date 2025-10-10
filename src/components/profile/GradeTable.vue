<script setup>
import { defineProps } from "vue";
import noDataImg from "@/assets/find.png";
import WaveLoader from "@/components/common/WaveLoader.vue";

const props = defineProps({
  courseList: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="table-container" :style="{ maxHeight: '600px' }">
    <div class="table-wrapper">
      <!-- 로딩 중 -->
      <div v-if="props.isLoading" class="loading-state">
        <WaveLoader />
        <p class="loading-text">데이터를 불러오는 중...</p>
      </div>

      <!-- 데이터 있을 때 -->
      <table v-else-if="props.courseList.length > 0">
        <thead>
          <tr>
            <th class="year-th">연도</th>
            <th class="grade-th">학년</th>
            <th class="semester-th">학기</th>
            <th class="title-th">과목명</th>
            <th class="type-th">이수구분</th>
            <th class="courseCode-th">과목코드</th>
            <th class="professorName-th">담당교수</th>
            <th class="credit-th">학점</th>
            <th class="rank-th">등급</th>
            <th class="point-th">평점</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in props.courseList" :key="course.courseCode">
            <td class="year-col">{{ course.year }}</td>
            <td class="grade-col">{{ course.grade }}학년</td>
            <td class="semester-col">{{ course.semester }}</td>
            <td class="title-col">{{ course.title }}</td>
            <td class="type-col">{{ course.type }}</td>
            <td class="courseCode-col">{{ course.courseCode }}</td>
            <td class="professorName-col">{{ course.professorName }}</td>
            <td class="credit-col">{{ course.credit }}</td>
            <td class="rank-col">{{ course.rank }}</td>
            <td class="point-col">{{ Number(course.point).toFixed(1) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 데이터 없을 때 -->
      <div v-else class="empty-state desktop-only">
        <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
        <p>검색 결과가 없습니다.</p>
      </div>

      <div
        class="empty-state-mobile"
        v-if="!props.isLoading && props.courseList.length === 0"
      ></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  border-radius: 8px;
  width: 100%;
  border: 0.2px solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
  margin: 0;
  overflow-x: auto;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #969696 #fff;
}

/* 로딩 상태 스타일 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  min-height: 300px;
}

.loading-text {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
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
  color: #000;
}

thead th {
  color: #343a40;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #afb0b2;
  font-weight: 500;
}

.empty-image {
  max-width: 80px;
  opacity: 0.8;
  margin-top: -10px;
  margin-bottom: 20px;
}

.empty-state-mobile {
  display: none;
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #afb0b2;
  font-weight: 500;
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
@media (max-width: 767px) {
  .table-container {
    min-width: auto;
    padding: 15px 10px 0 10px;
  }

  /* 로딩 상태 */
  .loading-state {
    padding: 60px 20px;
    min-height: 200px;
  }

  .loading-text {
    font-size: 13px;
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

  table.empty-table {
    display: none;
  }
  .empty-state-mobile {
    display: block;
  }

  .empty-state-mobile {
    padding: 0;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    min-width: auto;
    max-width: 100%;
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
    min-width: auto;
    width: 100%;
  }
}
</style>
