// scheduleService.js
import axios from './httpRequester';

export async function getSchedulesByMonth(year, month, semesterId) {
  const yyyyMM = `${year}-${String(month).padStart(2, '0')}`
  const res = await axios.get('/schedule', { params: { month: yyyyMM, semesterId } })
  const data = res?.data
  if (Array.isArray(data)) return data
  return []
}

// 등록
export const createSchedule = (payload) =>
  axios.post('/schedule', payload)

// 수정 (id 포함)
export const updateSchedule = (id, payload) =>
  axios.put(`/schedule/${id}`, payload)

// 삭제 (id path variable)
export const deleteSchedule = (id) =>
  axios.delete(`/schedule/${id}`)

// 단일 일정 조회 (옵션)
export const getScheduleById = async (id) => {
  const res = await axios.get(`/schedule/${id}`)
  return res.data
}