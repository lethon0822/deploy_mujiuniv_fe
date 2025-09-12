// scheduleService.js
import axios from './httpRequester';

export async function getSchedulesByMonth(year, month, semesterId) {
  const yyyyMM = `${year}-${String(month).padStart(2, '0')}`
  const res = await axios.get('/schedule', { params: { yyyymm: yyyyMM, semesterId } })
  const rows = Array.isArray(res?.data) ? res.data
              : Array.isArray(res?.data?.list) ? res.data.list
              : Array.isArray(res?.data?.data) ? res.data.data
              : Array.isArray(res?.data?.data?.list) ? res.data.data.list
              : []
   // 표준화
   return rows.map(it => ({
     scheduleId:  it.scheduleId  ?? it.schedule_id,
     semesterId:  it.semesterId  ?? it.semester_id,
     scheduleType:it.scheduleType?? it.schedule_type,
     startDate:  (it.startDate   ?? it.startDatetime   ?? it.start_date   ?? it.start_datetime)?.slice(0,10),
     endDate:    (it.endDate     ?? it.endDatetime     ?? it.end_date     ?? it.end_datetime)?.slice(0,10),
     description: it.description ?? ''
   }))
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