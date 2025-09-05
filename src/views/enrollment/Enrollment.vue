<script setup>

import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CourseTable from "@/components/course/CourseTable.vue";
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

import { ref, onMounted, computed } from "vue";
// 학기 아이디 피니아에서 가져옴.
import { useUserStore } from "@/stores/account";

const userStore = useUserStore();
const semesterId = userStore.semesterId;
console.log("현재 학기아이디: ", semesterId);

const departments = ref([]);
const years = ref([]);
const courseList = ref([]); // 이번학기 개설 강의 목록
const mySugangList = ref([]); // 수강신청한 강의 목록
const lastFilters = ref({}); // 마지막 검색 필터 저장용 변수

// 신청 학점 계산
const totalCredit = computed(() =>
  mySugangList.value.reduce((sum, course) => sum + course.credit, 0)
);

// 신청 과목 수 계산
const courseCount = computed(() => mySugangList.value.length);

onMounted(async () => {
  // 학과, 연도 불러오기
  const departmentRes = await getDepartments();
  departments.value = departmentRes.data;

  const yearRes = await getYears();
  years.value = yearRes.data;

  // 1. 내 수강신청 내역 가져오기
  const mySugangListRes = await getMySugangList(semesterId);
  mySugangList.value = mySugangListRes.data;

  // 2. 개설 강의 조회
  const defaultFilters = {
    year: new Date().getFullYear(),
    semester: 2,
  };
  lastFilters.value = { ...defaultFilters };

  const courseListRes = await getCourseListByFilter(defaultFilters);

  // 3. 신청 내역 기준으로 enrolled 표시
  courseList.value = courseListRes.data.map((course) => {
    course.enrolled = mySugangList.value.some(
      (c) => c.courseId === course.courseId
    );
    return course;
  });
});

// 필터에 따른 개설 강의 목록 조회
const handleSearch = async (filters) => {
  console.log("검색 필터 전달됨:", filters);
  lastFilters.value = { ...filters };
  const courseListRes = await getCourseListByFilter(filters);
  console.log("개설 강의 내역 백엔드 응답:", courseListRes.data);
  courseList.value = courseListRes.data;
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
      alert("수강신청이 완료되었습니다.");

      try {
        // 강의 목록 리패치 시 신청 완료 버튼 띄우기 위함
        const fetchCourseListRes = await getCourseListByFilter(
          lastFilters.value
        );
        courseList.value = fetchCourseListRes.data.map((course) => {
          course.enrolled = mySugangList.value.some(
            (c) => c.courseId === course.courseId
          );
          return course;
        });
      } catch (error) {
        alert("목록 새로고침 실패. 페이지를 새로고침 해주세요.");
      }
    }
  } catch (error) {
    const err = error.response?.data;
    alert(err?.message || "예기치 못한 오류가 발생했습니다.");
  }
};

// 수강 취소 처리 함수
const handleCancel = async (courseId) => {
  if (!confirm("수강신청을 취소하시겠습니까?")) return;

  try {
    const res = await deleteSugangCancel(courseId);

    // 성공 시만 처리
    if (res.status === 200) {
      // mySugangList에서 제거
      mySugangList.value = mySugangList.value.filter(
        (course) => course.courseId !== courseId
      );

      // courseList에서도 enrolled = false, 잔여 인원 +1
      const idx = courseList.value.findIndex(
        (course) => course.courseId === courseId
      );
      if (idx !== -1) {
        courseList.value[idx].enrolled = false;
        courseList.value[idx].remStd += 1;
      }

      alert("수강신청이 취소되었습니다.");
    }
  } catch (error) {
    if (error.response?.status === 400) {
      alert(error.response?.data || "수강취소 실패");
    } else {
      alert("수강신청 취소 실패! 예기치 못한 오류가 발생했습니다.");
    }
    console.error(error);
  }
};
</script>

<template>
  <!-- 페이지 -->
  <div class="page">
    <h1 class="page-title">수강신청 관리</h1>
  </div>
  <SearchFilterBar
    :state="true"
    :departments="departments"
    :enrollment="true"
    :semester="2"
    @search="handleSearch"
  />

  <!-- 개설 과목 목록 -->
  <h5
    style="
      font-size: 20px;
      font-weight: 700;
      color: #343a40;
      margin: 50px 0px 10px 80px;
    "
  >
    개설 과목 목록
  </h5>
  <CourseTable
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
  <div class="creditInfo" style="margin-top: -30px">
    <h5
      style="
        font-size: 20px;
        font-weight: 700;
        color: #343a40;
        margin: 50px 0px 10px 80px;
      "
    >
      수강신청 내역
    </h5>
    <div
      class="credit-box"
      style="
        color: #343a40;
        font-size: 15px;
        margin-top: 60px;
        margin-right: 80px;
      "
    >
      <span>최대 학점: 18학점</span>
      <span>신청 학점: {{ totalCredit }}학점</span>
      <span>신청 과목 수: {{ courseCount }}개</span>
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
</template>

<style lang="scss" scoped>
.creditInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.credit-box {
  display: flex;
  gap: 20px;
  font-size: 17px;
  color: #333;
  font-weight: 500;
}

.table-container {
  margin-top: 2px;
}

/* 페이지 */
.page {
  padding: 20px 24px 5px;
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 8px 0 16px 50px;
}
</style>
