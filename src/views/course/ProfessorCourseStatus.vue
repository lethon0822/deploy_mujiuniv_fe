<script setup>
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import { findMyCourse } from "@/services/professorService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ApprovalFilterBar from "@/components/staff/ApprovalFilterBar.vue";

const courseList = ref([]);
const router = useRouter();
const isMobile = ref(window.innerWidth <= 767);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 767;
};

onMounted(() => {
  window.addEventListener("resize", checkMobile);
  checkMobile();

  // 초기 강의 목록 조회
  findMyCourse().then((res) => {
    courseList.value = res.data;
  });
});

const myCourse = async (filters) => {
  const json = {
    year: filters.year,
    semester: filters.semester,
  };
  const res = await findMyCourse(json);
  courseList.value = res.data;
};

const move = () => {
  router.push("/professor/course/registration");
};
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">강의 신청현황 조회</h1>
      <p>
        신청한 신규 강의에 대한 승인 상태와 진행 현황을 확인하고 내용을 수정할
        수 있습니다.
      </p>
      <div class="filter-section">
        <SearchFilterBar @search="myCourse" />
        <ApprovalFilterBar :isMobile="isMobile.value" @search="myCourse" />
      </div>
    </div>

    <CourseTable
      :course-list="courseList"
      :show="{ modify: true }"
      class="some"
    />
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

  :deep(.filter-bar) label {
    min-width: auto !important;
  }

  .content-section {
    gap: 14px;
  }

  :deep(.mobile-card .course-actions .setting) {
    width: 100% !important;
  }
  :deep(.mobile-card .course-actions .setting button) {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 10px 0 !important;
    font-size: 14px !important;
    border-radius: 6px !important;
    min-width: 0 !important;
    height: 40px !important;
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
