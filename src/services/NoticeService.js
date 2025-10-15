import axios from "axios";

export const postNotice = (params) =>
  axios.post('/notice', params).catch(e => e.response);

export const searchNotice = (params) =>
  axios.get('/notice/common', { params }).catch(e => e.response);

export const searchNoticeTitleAndContent = (params) =>
  axios.get('/notice/common/title', { params }).catch(e => e.response);

export const getNoticeDetail = (noticeId) =>
  axios.get(`/notice/common/${noticeId}`).catch(e => e.response);

export const updateNotice = (noticeId, params) =>
  axios.put(`/notice/${noticeId}`, params).catch(e => e.response);

export const deleteNotice = (noticeId) =>
  axios.delete(`/notice/${noticeId}`).catch(e => e.response);

export const view = (json) =>
  axios.put('/notice/common',json).catch(e => e.response);