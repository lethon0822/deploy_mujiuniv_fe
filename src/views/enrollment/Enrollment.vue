<script setup>
import { reactive } from "vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import YnModal from "@/components/common/YnModal.vue";
import {
  getDepartments,
  getYears,
  getCourseListByFilter,
} from "@/services/CourseService";
import {
  postEnrollCourse,
  deleteSugangCancel,
  getMySugangList,
} from "@/services/SugangService";

import { ref, onMounted, onUnmounted, computed } from "vue";
import { useUserStore } from "@/stores/account";

const state = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

const userStore = useUserStore();
const semesterId = userStore.semesterId;

const departments = ref([]);
const years = ref([]);
const courseList = ref([]); // 이번학기 개설 강의 목록
const mySugangList = ref([]); // 수강신청한 강의 목록
const lastFilters = ref({}); // 마지막 검색 필터 저장용 변수

const isMobile = ref(false);
const isSearched = ref(false); // 검색 여부 상태

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

// 신청 학점 계산
const totalCredit = computed(() =>
  mySugangList.value.reduce((sum, course) => sum + Number(course.credit), 0)
);

// 신청 과목 수 계산
const courseCount = computed(() => mySugangList.value.length);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 767;
};

// 초기 데이터 로딩
onMounted(async () => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // 공통 데이터 로딩
  const departmentRes = await getDepartments();
  departments.value = departmentRes.data;

  const yearRes = await getYears();
  years.value = yearRes.data;

  const mySugangListRes = await getMySugangList(semesterId);
  mySugangList.value = mySugangListRes.data;
  console.log(mySugangList.value);

  // 모바일이 아니면 기본 개설과목 리스트 바로 로딩
  if (!isMobile.value) {
    const defaultFilters = {
      year: new Date().getFullYear(),
      semester: 2,
    };
    lastFilters.value = { ...defaultFilters };

    const courseListRes = await getCourseListByFilter(defaultFilters);
    courseList.value = courseListRes.data.map((course) => {
      course.enrolled = mySugangList.value.some(
        (c) => c.courseId === course.courseId
      );
      return course;
    });
  }
});

// 리사이즈 이벤트 해제
onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

// 필터에 따른 개설 강의 목록 조회
const handleSearch = async (filters) => {
  lastFilters.value = { ...filters };
  const courseListRes = await getCourseListByFilter(filters);

  courseList.value = courseListRes.data.map((course) => {
    course.enrolled = mySugangList.value.some(
      (c) => c.courseId === course.courseId
    );
    return course;
  });

  isSearched.value = true;
};

// 수강 신청 처리 함수
const handleEnroll = async (course) => {
  const sugangReq = { courseId: course.courseId };

  if (!confirm("수강신청을 하시겠습니까?")) return;

  try {
    const sugangRes = await postEnrollCourse(sugangReq);

    if (sugangRes.status === 200) {
      const updatedCourse = sugangRes.data;

      const idx = courseList.value.findIndex(
        (c) => c.courseId === updatedCourse.courseId
      );

      if (idx !== -1) {
        courseList.value[idx].remStd = updatedCourse.remStd;
        courseList.value[idx].enrolled = true;
      }

      mySugangList.value.push(updatedCourse);
      showModal("수강신청이 완료되었습니다.", "success");

      try {
        const fetchCourseListRes = await getCourseListByFilter(lastFilters.value);
        courseList.value = fetchCourseListRes.data.map((course) => {
          course.enrolled = mySugangList.value.some(
            (c) => c.courseId === course.courseId
          );
          return course;
        });
      } catch (error) {
        showModal("목록 새로고침 실패. 페이지를 새로고침 해주세요.", "warning");
      }
    }
  } catch (error) {
    const err = error.response?.data;
    showModal(err?.message || "예기치 못한 오류가 발생했습니다.", "warning");
  }
};


// 수강 취소 처리 함수
const handleCancel = async (courseId) => {
  if (!confirm("수강신청을 취소하시겠습니까?")) return;

  try {
    const res = await deleteSugangCancel(courseId);

    if (res.status === 200) {
      mySugangList.value = mySugangList.value.filter(
        (course) => course.courseId !== courseId
      );

      const idx = courseList.value.findIndex(
        (course) => course.courseId === courseId
      );
      if (idx !== -1) {
        courseList.value[idx].enrolled = false;
        courseList.value[idx].remStd += 1;
      }
      showModal("수강신청이 취소되었습니다.", "warning");
    }
  } catch (error) {
    if (error.response?.status === 400) {
      showModal(error.response?.data || "수강취소 실패", "warning");
    } else {
      showModal("수강신청 취소 실패! 예기치 못한 오류가 발생했습니다.", "warning");
    }
    console.error(error);
  }
};

</script>

<template>
  <div class="container">
    <YnModal
        v-if="state.showYnModal"
        :content="state.ynModalMessage"
        :type="state.ynModalType"
        @close="state.showYnModal = false"
      />
    <div class="header-card">
      <h1 class="page-title">수강신청 관리</h1>
      <p>
        수강을 희망하는 강의의 정보를 확인하고, 강의 계획서를 미리 살펴보세요.
      </p>
      <div class="filter-section">
        <SearchFilterBar
    :state="true"
    :departments="departments"
    :enrollment="true"
    :semester="2"
    @search="handleSearch"
       </SearchFilterBar>
      </div>
    </div>

    <CourseTable
    v-if="!isMobile || (isMobile && isSearched)"
    :courseList="courseList"
    maxHeight="500px"
    :show="{
      professorName: true,
      remStd: true,
      enroll: true,
      cancel: false,
      deptName: true,
    }"
    @enroll="handleEnroll"
  />

 
<!-- 나의 수강신청 내역 -->
<div class="credit-info-card container-box">
  <h5 class="credit-title">수강신청 내역</h5>
  <div class="credit-box">
    <div class="credit-item">
      <strong>최대 학점</strong>
      <span>18학점</span>
    </div>
    <div class="divider" />
    <div class="credit-item">
      <strong>신청 학점</strong>
      <span>{{ totalCredit }}학점</span>
    </div>
    <div class="divider" />
    <div class="credit-item">
      <strong>신청 과목 수</strong>
      <span>{{ courseCount }}개</span>
    </div>
  </div>
</div>

<CourseTable
    :courseList="mySugangList"
    maxHeight="500px"
    :show="{
      professorName: true,
      remStd: true,
      enroll: false,
      cancel: true,
      deptName: false,
    }"
    @cancel="handleCancel"
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

/* 나의 수강신청 내역  */
.credit-info-card {
  border: 1px solid transparent;
}

.credit-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;

}

.credit-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.credit-item {
  display: flex;
  flex-direction: row;
  font-size: 15px;
  color: #000;
}

.credit-item strong {
  font-weight: 600;
  color: #343a40;
  margin-bottom: 4px;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
}

.container-box {
  max-width: 1500px;
  margin: 0 auto;
  box-sizing: border-box;
}

.credit-item strong {
  margin-right: 8px;
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

  .credit-info-card {
    margin: 50px auto auto auto;
  }

  .credit-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .credit-box {
    gap: 12px;
  }

  .credit-item {
    font-size: 14px;
  }

  .divider {
    display: none;
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

  .credit-info-card {
    margin: 50px auto auto auto;
  }

  .credit-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .credit-box {
    gap: 18px;
  }

  .credit-item {
    font-size: 15px;
  }

  .divider {
    display: block;
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
