<script setup>
import ProfessorCourseFilter from "@/components/common/ProfessorCourseFilter.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import { findMyCourse } from "@/services/professorService";
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/account";

const userStore = useUserStore();
const allCourseList = ref([]);
const courseList = ref([]);
const router = useRouter();
const isLoading = ref(true); // 데이터 로딩 상태 추가


const data = reactive({
  courseList:[],
  sid: userStore.state.signedUser.semesterId
})

onMounted(async () => {
  try {
    const json = {
      sid: data.sid
    }
    const res = await findMyCourse(json);
    console.log("didi",res)
    data.courseList = res.data.result

    // 여기서 status 값들만 뽑아서 콘솔 찍어보기 (확인용)
    // const statusSet = new Set();
    // res.data.forEach((course) => statusSet.add(course.status));
    // console.log("강의 상태 종류들:", [...statusSet]);
  } catch (error) {
    console.error("강의 목록 초기 로딩 실패:", error);
  } finally {
    isLoading.value = false; // 로딩 완료
  }
});



const myCourse = (filters) => {
  console.log("myCourse 함수 호출됨:", filters);
  const keyword = filters.keyword ? filters.keyword.toLowerCase() : "";

  if (allCourseList.value.length === 0) {
    console.log("데이터가 아직 로드되지 않아 필터링을 건너뜁니다.");
    return;
  }

  const newFilteredList = allCourseList.value.filter((course) => {
    const titleMatch = course.title?.toLowerCase().includes(keyword) || false;
    const classroomMatch =
      course.classroom?.toLowerCase().includes(keyword) || false;
    const professorMatch =
      course.professorName?.toLowerCase().includes(keyword) || false;
    const keywordMatch = titleMatch || classroomMatch || professorMatch;

    const semesterMatch =
      filters.semester && filters.semester !== ""
        ? String(course.semester) === String(filters.semester)
        : true;

    // 승인 상태 필터 적용
    const approvalStatusMatch = filters.approvalStatus
      ? course.status === filters.approvalStatus
      : true;

    const normalizedCourseType = course.type?.trim().toLowerCase() || "";
    const normalizedFilterType = filters.type.trim().toLowerCase();

    const typeMatch = filters.type
      ? normalizedCourseType.includes(normalizedFilterType)
      : true;

    console.log(
      `Filtering course: "${course.title}", course.type="${course.type}", normalizedCourseType="${normalizedCourseType}", filter.type="${filters.type}", approvalStatus=${course.status}, filter.approvalStatus=${filters.approvalStatus}, approvalStatusMatch=${approvalStatusMatch}, typeMatch=${typeMatch}`
    );

    const match =
      keywordMatch && semesterMatch && approvalStatusMatch && typeMatch;

    if (!match) {
      console.log(`❌ 제외된 강의: ${course.title}`, {
        keywordMatch,
        semesterMatch,
        approvalStatusMatch,
        typeMatch,
      });
    } else {
      console.log(`✔️ 포함된 강의: ${course.title}`);
    }

    return match;
  });

  courseList.value = newFilteredList;
  console.log("필터링된 강의 목록:", courseList.value);
};


const departments = computed(() => {
  const set = new Set();
  courseList.value.forEach((course) => {
    if (course.type !== "교양") set.add(course.deptName);
  });
  return [...set];
});
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
        <ProfessorCourseFilter
          :state="true"
          :departments="departments"
          @search="myCourse"
        />
      </div>
    </div>

    <CourseTable
      :course-list="data.courseList"
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
