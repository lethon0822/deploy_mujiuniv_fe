import axios from "@/services/httpRequester"

export const getMemberList = (params) =>
  axios.get('/user/list', { params }).then(res => res.data);

// 신입생 들고오기 
export const newStudents = () =>
  axios.get('/user/freshman/count').then(res => res.data);

// 졸업 예정자 
export const findGraduationCandidates = () =>
  axios.get('/student/graduation/count').then(res => res.data);