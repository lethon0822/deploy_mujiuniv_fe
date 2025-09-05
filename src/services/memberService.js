import axios from "@/services/httpRequester"

export const getMemberList = (params) =>
  axios.get('/staff/member', { params }).then(res => res.data);