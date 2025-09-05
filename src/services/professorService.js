import axios from "@/services/httpRequester"

// 강의등록
export const saveCourse = jsonBody =>{
  return axios.post("/professor/course", jsonBody).catch(e => e.response);
}
// 등록한 강의 보기
export const findMyCourse = params =>{
  return axios.get("/professor/course",{params}).catch(e => e.response);
}
// 강의 계획서 수정
export const modify = jsonBody =>{
  return axios.put ("/professor/course", jsonBody).catch(e => e.response);
}

//강의별 학생 리스트 조회
export const courseStudentList = id =>{
  return axios.get(`/professor/student?id=${id}`).catch(e => e.response);
}

// 교수 학과 조회 
export const professorDept = () =>{
  return axios.get('/professor/dept').catch(e => e.response);
}

// 강의 평가 조회
export const checkSurvey = (id) =>{
  return axios.get(`/professor/course/survey?id=${id}`).catch(e => e.response);
}