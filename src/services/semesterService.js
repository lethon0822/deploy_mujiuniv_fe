import axios from 'axios';

export const getNextSemesterId = (currentSemesterId) => {
    return axios.get(`/semesters/${currentSemesterId}/next`).then(r => r.data.semesterId);
}


