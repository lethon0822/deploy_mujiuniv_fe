import axios from "@/services/httpRequester"

export const getMemberList = (params) =>
  axios.get('/user/list', { params }).then(res => res.data);