import axios from "./httpRequester";

// 영구 성적 조회
export function GradesbyCourse(params) {
  return axios.get("/student/grade/permanent", { params });
}

// 금학기 성적 조회
export function getMyCurrentGrades(params) {
  return axios.get("/student/grade/current", { params });
}
