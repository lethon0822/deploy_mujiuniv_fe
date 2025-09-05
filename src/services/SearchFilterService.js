import axios from "./httpRequester";
const path = '/course/filter'

export const getDepartments = () => {
    return axios.get(`${path}/department`).catch(e => e.response);
}

export const getYears = () => {
    return axios.get(`${path}/year`).catch(e => e.response);
}