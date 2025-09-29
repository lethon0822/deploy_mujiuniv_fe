import { ref } from "vue";
import {
  postEnrollCourse,
  deleteSugangCancel,
  getMySugangList,
  getAvailableEnrollmentsCourses,
} from "@/services/SugangService";

export function useEnrollment() {
  const mySugangList = ref([]); // 내 수강 신청 내역 
  const courseList = ref([]);   // 수강 신청 가능한 강의 리스트 목록 
  const lastFilters = ref({});  // 마지막으로 선택한 필터 

  // 강의 목록 조회
  const fetchCourses = async (filters) => {
    try {
      const res = await getAvailableEnrollmentsCourses(filters);
      if (!Array.isArray(res.data)) return false;

      lastFilters.value = filters;
      courseList.value = res.data.map((c) => ({
        ...c,
        enrolled: mySugangList.value.some((m) => m.courseId === c.courseId),
      }));
      return true;
    } catch (e) {
      console.error("fetchCourses error:", e);
      throw e;
    }
  };

  // 내 수강신청 목록 조회
  const fetchMyList = async (semesterId) => {
    try {
      const res = await getMySugangList(semesterId);
      if (!Array.isArray(res.data)) return false;

      mySugangList.value = res.data;
      return true;
    } catch (e) {
      console.error("fetchMyList error:", e);
      throw e;
    }
  };

  // 수강 신청
  const enroll = async (courseId) => {
    try {
      await postEnrollCourse({ courseId });
      // 바로 내 수강신청 목록에 추가
      const enrolledCourse = courseList.value.find((c) => c.courseId === courseId);
      if (enrolledCourse) {
        mySugangList.value = [...mySugangList.value, { ...enrolledCourse }];
      }
      await fetchCourses(lastFilters.value); // 최신화
      return true;
    } catch (e) {
      console.error("enroll error:", e);
      throw e;
    }
  };

  // 수강 취소
  const cancel = async (courseId) => {
    try {
      await deleteSugangCancel(courseId);
      mySugangList.value = mySugangList.value.filter(
        (c) => c.courseId !== courseId
      );
      await fetchCourses(lastFilters.value); // 최신화
      return true;
    } catch (e) {
      console.error("cancel error:", e);
      throw e;
    }
  };

  return {
    mySugangList,
    courseList,
    lastFilters,
    fetchCourses,
    fetchMyList,
    enroll,
    cancel,
  };
}
