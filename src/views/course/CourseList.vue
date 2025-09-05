<script setup>
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import { getDepartments, getYears } from "@/services/CourseService";
import { ref, onMounted } from "vue";
import { getCourseListByFilter } from "@/services/CourseService";

const departments = ref([]);
const years = ref([]);
const courseList = ref([]); // 전체 강의 목록

onMounted(async () => {
  // 학과, 연도 불러오기
  const departmentRes = await getDepartments();
  console.log(departmentRes.data);
  departments.value = departmentRes.data;

  const yearRes = await getYears();
  console.log(yearRes.data);
  years.value = yearRes.data;

  // 개설 강의 조회
  const defaultFilters = {
    year: new Date().getFullYear(),
  };

  const courseListRes = await getCourseListByFilter(defaultFilters);
  courseList.value = courseListRes.data;
});

const handleSearch = async (filters) => {
  console.log("필터: ", filters);
  const courseListRes = await getCourseListByFilter(filters);
  console.log("강의조회: ", courseListRes.data);
  console.log("courseListRes:", courseListRes);
  console.log("courseListRes.data:", courseListRes.data);
  courseList.value = courseListRes.data.filter(
    (course) => course.status === "승인"
  );
};
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">강의조회</h1>
      <p>
        수강을 희망하는 강의의 정보를 확인하고, 강의 계획서를 미리 살펴보세요.
      </p>
      <div class="filter-section">
        <SearchFilterBar
          :state="true"
          :departments="departments"
          :years="years"
          @search="handleSearch"
        ></SearchFilterBar>
      </div>
    </div>

    <CourseTable
      :courseList="courseList"
      maxHeight="800px"
      :show="{
        professorName: true,
        semester: true,
      }"
    ></CourseTable>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 50px;
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
  margin: 0 0 16px 0;
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
@media all and (min-width: 480px) and (max-width: 767px) {
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
    padding: 20px 24px;
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
    padding: 20px 24px 24px 50px;
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
