// src/services/scheduleService.js
import axios from './httpRequester'

// ---------- util: 공통 표준화 ----------
function normalizeSchedules(raw) {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data) ? raw.data
    : Array.isArray(raw?.list) ? raw.list
    : Array.isArray(raw?.data?.list) ? raw.data.list
    : []
  return rows.map(it => ({
    scheduleId: it.scheduleId ?? it.schedule_id,
    semesterId: it.semesterId ?? it.semester_id,
    scheduleType: it.scheduleType ?? it.schedule_type,
    startDate: (it.startDate ?? it.startDatetime ?? it.start_datetime)?.toString()?.slice(0,10) ?? null,
    endDate: (it.endDate ?? it.endDatetime ?? it.end_datetime)?.toString()?.slice(0,10) ?? null,
    description: it.description ?? '',
    createdAt: it.createdAt ?? it.created_at ?? null,
  }))
}

// ---------- API ----------
/** 월별 일정 조회 */
export async function getSchedulesByMonth(year, month, semesterId) {
  const yyyyMM = `${year}-${String(month).padStart(2, '0')}`
  const res = await axios.get('/schedule', { params: { month: yyyyMM, semesterId } })
  return normalizeSchedules(res?.data)
}

/** 특정 학기/유형 스케줄 조회 */
export async function getScheduleFor({ semesterId, type }) {
  if (!type) throw new Error('type은 필수입니다.')
  const res = await axios.get('/schedule/for', { params: { semesterId, scheduleType: type } })
  const rows = normalizeSchedules(res?.data)
  return rows.length > 0 ? rows[0] : null
}

/** 등록 */
export const createSchedule = (payload) => axios.post('/schedule', payload)

/** 수정 */
export const updateSchedule = (id, payload) => axios.put(`/schedule/${id}`, payload)

/** 삭제 */
export const deleteSchedule = (id) => axios.delete(`/schedule/${id}`)

/** 단일 조회 */
export const getScheduleById = (id) => axios.get(`/schedule/${id}`)
