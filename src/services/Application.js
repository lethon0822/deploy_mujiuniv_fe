
import axios from './httpRequester'

// ---------- util ----------
function normalizeApplications(raw) {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data) ? raw.data
    : Array.isArray(raw?.list) ? raw.list
    : Array.isArray(raw?.data?.list) ? raw.data.list
    : []
  return rows.map(it => ({
    appId: it.appId ?? it.app_id,
    status: it.status,
    reason: it.reason ?? '',
    submittedAt: it.submittedAt ?? it.createdAt ?? it.created_at,
    scheduleType: it.scheduleType ?? it.schedule_type,
    scheduleStart: it.scheduleStart ?? it.startDate ?? it.start_datetime,
    scheduleEnd: it.scheduleEnd ?? it.endDate ?? it.end_datetime,
    year: it.year,
    semester: it.semester,
  }))
}

// ---------- API ----------
/** 다음 학기 ID 조회 */
export const getNextSemesterId = (currentSemesterId) =>
  axios.get('/application/next-semester', { params: { currentSemesterId } })

/** 일정창 열려있는지 */
export const isScheduleOpenNow = (scheduleId) =>
  axios.get('/application/is-open', { params: { scheduleId } })

/** 단순 사유 신청 */
export const createAppForReason = (payload) =>
  axios.post('/application/reason', payload)

/** 정규 신청 */
export const createApplication = (payload) =>
  axios.post('/application', payload)

/** 내 신청 목록 */
export async function fetchMyApplications(userId) {
  const res = await axios.get('/application/my', { params: { userId } })
  return normalizeApplications(res?.data)
}

/** 신청 취소 */
export const cancelApplication = (appId, userId) =>
  axios.put(`/application/cancel/${appId}`, null, { params: { userId } })
