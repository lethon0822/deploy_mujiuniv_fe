import axios from "@/services/httpRequester"

//수강 신청 
export const postEnrollCourse = (sugangReq) => {
    return axios.post('/student/sugang', sugangReq); 
}

//수강 취소
export const deleteSugangCancel = (courseId) => {
    return axios.delete(`/student/sugang/cancel/${courseId}`);
}



//나의 수강신청 내역 onMounted 때 띄울 용도
export const getMySugangList = (semesterId) => {
    return axios.get("/student/sugang/current"
        ,{
            params: {semesterId}
        }
    ).catch((e) => e.response);
  };

