import axios from "axios";

export const postNotice = (params) =>
  axios.post('/notice', {params}).catch(e => e.response);

export const searchNotice = (params) =>
  axios.get('/notice', { params }).catch(e => e.response);

export const searchNoticeTitleAndContent = (params) =>
  axios.get('/notice/search', { params }).catch(e => e.response);

export const getNoticeDetail = (noticeId) =>
  axios.get(`/notice/${noticeId}`).catch(e => e.response);

export const updateNotice = (noticeId, params) =>
  axios.put(`/notice/${noticeId}`, params).catch(e => e.response);

export const deleteNotice = (noticeId) =>
  axios.delete(`/notice/${noticeId}`).catch(e => e.response);