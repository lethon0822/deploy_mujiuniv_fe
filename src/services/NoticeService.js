// 등록
export const postNotice = (params) =>
    axios.post('/api/notice', params).catch(e => e.response);
  
  // 공지사항 검색 (제목+내용)
  export const searchNotice = (params) =>
    axios.get('/api/notice', { params }).catch(e => e.response);
  
  // 공지사항 검색 (제목만)
  export const searchNoticeTitle = (params) =>
    axios.get('/api/notice/noticeTitle', { params }).catch(e => e.response);
  
  // 공지사항 상세보기
  export const getNoticeDetail = (noticeId) =>
    axios.get(`/api/notice/${noticeId}`).catch(e => e.response);
  
  // 공지사항 수정
  export const updateNotice = (noticeId, params) =>
    axios.put(`/api/notice/${noticeId}`, params).catch(e => e.response);
  
  // 공지사항 삭제
  export const deleteNotice = (noticeId) =>
    axios.delete(`/api/notice/${noticeId}`).catch(e => e.response);