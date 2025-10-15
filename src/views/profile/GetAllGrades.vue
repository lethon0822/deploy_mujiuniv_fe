<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/account";
import { GradesbyCourse } from "@/services/GradeService";

import AcademicFilterBar from "@/components/common/AcademicFilterBar.vue";
import GradeTable from "@/components/profile/GradeTable.vue";

const courseList = ref([]);
const isLoading = ref(false);
const userStore = useUserStore();

// 필터 상태
const filters = ref({
  semesterId: userStore.state.signedUser?.semesterId,
  grade: null,
  semester: null,
});

// 성적 조회
async function fetchGrades() {
  isLoading.value = true;

  try {
    const params = { semesterId: filters.value.semesterId };
    if (filters.value.grade) params.grade = parseInt(filters.value.grade);
    if (filters.value.semester)
      params.semester = parseInt(filters.value.semester);

    console.log("API 호출 파라미터:", params);
    const res = await GradesbyCourse(params);
    console.log("API 응답:", res.data.result);
    courseList.value = res.data.result || [];
  } catch (e) {
    console.error("성적 조회 실패", e);
    courseList.value = [];
  } finally {
    isLoading.value = false;
  }
}

function handleSearch(searchParams) {
  console.log("handleSearch 호출됨:", searchParams);

  const req = searchParams.req || {};
  filters.value = {
    semesterId: filters.value.semesterId,
    grade: req.grade || null,
    semester: req.semester || null,
  };

  fetchGrades();
}

fetchGrades();
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1>영구 성적조회</h1>
      <p>
        나의 최종 성적을 확인 가능하며, 현재 학기의 성적은 '현학기 성적조회'
        메뉴에서 조회 가능합니다.
      </p>

      <div class="filter-section">
        <AcademicFilterBar @search="handleSearch" />
      </div>
    </div>

    <div class="content-section">
      <GradeTable :courseList="courseList" :isLoading="isLoading" />
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
}

.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.header-card h1 {
  font-size: 22px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
}

.header-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.filter-section {
  margin-top: 16px;
}

.filter-section :deep(.filter-bar),
.filter-section :deep(.academic-filter-bar) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .content-section {
    gap: 14px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .content-section {
    gap: 20px;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 30px;
  }

  .header-card {
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .content-section {
    gap: 24px;
  }

  .filter-section {
    display: flex;
    justify-content: flex-start;
  }

  .filter-section :deep(.filter-bar),
  .filter-section :deep(.academic-filter-bar) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
}
</style>
