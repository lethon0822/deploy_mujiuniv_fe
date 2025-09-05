import axios from "./httpRequester";

export const deptGet = (params) => {
  return axios.get("/staff/department", { params }).catch((e) => e.response);
};

export const deptGetHead = id => {
  return axios.get(`/staff/department/head?dept_id=${id}`, id).catch(e => e.response);
}

export const deptPost = (jsonBody) => {
  return axios.post("/staff/department", jsonBody).catch((e) => e.response);
};

export const deptPut = (jsonBody) =>{
  return axios.put("/staff/department", jsonBody).catch((e) => e.response);
}

export const deptPatch = (id) =>{
  return axios.patch(`staff/department?id=${id}`,id).catch(e=>e.response);
}