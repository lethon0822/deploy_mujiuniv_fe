import axios from "@/services/httpRequester"

//searchFilter에 따른 수강 신청 가능한 강의 리스트 조회 
export const getAvailableEnrollmentsCourses = (filters) => {
    return axios.get("/student/enrollment", {
      params: {
        year: filters.year,
        semester: filters.semester,
        grade: filters.grade,
        type: filters.type,
        deptId: filters.deptId,
        keyword: filters.keyword
      }
    }).catch((e) => e.response);
  };
  

//수강 신청 
export const postEnrollCourse = (sugangReq) => {
    return axios.post('/student/enrollment', sugangReq); 
}

//수강 취소
export const deleteSugangCancel = (courseId) => {
    return axios.delete(`/student/enrollment/cancel/${courseId}`);
}


//나의 수강신청 내역 onMounted 때 띄울 용도
export const getMySugangList = (semesterId) => {
    return axios.get("/student/enrollment/current"
        ,{
            params: {semesterId}
        }
    ).catch((e) => e.response);
  };

