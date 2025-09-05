import axios from "./httpRequester";
const path = "/course";

//searchFilter 학과 가져오는 용도
export const getDepartments = () => {
  return axios.get(`${path}/filter/department`).catch((e) => e.response);
};

//searchFilter 연도 가져오는 용도
export const getYears = () => {
  return axios.get(`${path}/filter/year`).catch((e) => e.response);
};

//searchFilter에 따른 강의 리스트 조회
export const getCourseListByFilter = (filters) => {
  return axios.get(path, {
    params: filters,
  });
};

// 강의조회
export const loadCourse = (course_id) => {
  if (!course_id) {
    return Promise.reject(new Error("course_id가 필요합니다."));
  }
  return axios.get(`/course/${course_id}`).catch((e) => e.response);
};

// 학생이 수강 중인 특정 강의의 enrollmentId 조회
export const getStudentCourseEnrollment = (courseId) => {
  if (!courseId) {
    return Promise.reject(new Error("courseId가 필요합니다."));
  }
  return axios
    .get(`/student/course`, { params: { courseId } })
    .catch((e) => e.response);
};
