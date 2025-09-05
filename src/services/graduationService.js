import axios from "@/services/httpRequester"

//졸업 자가 진단  
export const graduationDiagnoses = () => {
    return axios.get('/student/graduation'); 
}