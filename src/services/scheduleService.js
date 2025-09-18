// src/services/scheduleService.js
import axiosInstance from './httpRequester'

// ===================== util =====================

// 단건 표준화
function normalizeOne(it = {}) {
  if (!it || typeof it !== 'object') return null
  return {
    scheduleId: it.scheduleId ?? it.schedule_id ?? null,
    semesterId: it.semesterId ?? it.semester_id ?? null,
    scheduleType: it.scheduleType ?? it.schedule_type ?? null,
    startDate:
      (it.startDate ?? it.startDatetime ?? it.start_datetime)?.toString()?.slice(0, 10) ?? null,
    endDate:
      (it.endDate ?? it.endDatetime ?? it.end_datetime)?.toString()?.slice(0, 10) ?? null,
    description: it.description ?? '',
    createdAt: it.createdAt ?? it.created_at ?? null,
  }
}

// 배열 표준화
function normalizeSchedules(raw) {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data) ? raw.data
    : Array.isArray(raw?.list) ? raw.list
    : Array.isArray(raw?.data?.list) ? raw.data.list
    : []

  return rows.map(normalizeOne)
}

// 한글 ↔︎ enum 매핑 (서버가 enum 기대하는 경우 대비)
const KO_TO_ENUM = {
  '휴학신청': 'LEAVE_APPLY',
  '복학신청': 'RETURN_APPLY',
  // 혹시 UI에서 줄여 부르면 대비
  '휴학': 'LEAVE_APPLY',
  '복학': 'RETURN_APPLY',
}

// function mapScheduleType(val) {
//   if (!val) return val
//   // 이미 enum 형태면 그대로 사용
//   const upper = String(val).trim().toUpperCase()
//   if (upper.includes('LEAVE') || upper.includes('RETURN')) return val
//   // 한글 키 매핑 (소문자 비교)
//   const koKey = String(val).trim()
//   if (KO_TO_ENUM[koKey]) return KO_TO_ENUM[koKey]
//   return val // 모르면 그대로 전달
// }
function mapScheduleType(val) {
  return val; // 변환 안 함
}

// ===================== API =====================

/** 월별 일정 조회 */
export async function getSchedulesByMonth(year, month, semesterId) {
  const yyyyMM = `${year}-${String(month).padStart(2, '0')}`
  const res = await axiosInstance.get('/schedule', {
    params: { month: yyyyMM, semesterId }
  })
  return normalizeSchedules(res?.data)
}

/**
 * 특정 학기/유형 스케줄 조회
 * - 404 => 일정 없음: null 반환 (throw 안 함)
 * - 응답 형태가 단건/배열/래핑객체 어떤 것이 와도 단건으로 표준화해서 반환
 *   (여러 건이면 첫 건 사용)
 */
export async function getScheduleFor(params) {
  // params: { semesterId, scheduleType }
  const safeParams = {
    ...params,
    scheduleType: mapScheduleType(params?.scheduleType),
  }

  try {
    // 디버깅 로그(필요 없으면 지워도 됨)
    // console.log('🔥 getScheduleFor', axiosInstance.defaults.baseURL, safeParams)

    const res = await axiosInstance.get('/schedule/for', { params: safeParams })

    // 서버가 단건을 주거나, 배열/리스트로 줄 수 있으니 방어적으로 처리
    const data = res?.data
    if (!data) return null

    // 배열이면 첫 건, 객체면 그대로
    const first =
      (Array.isArray(data) && data[0]) ||
      (Array.isArray(data?.data) && data.data[0]) ||
      (Array.isArray(data?.list) && data.list[0]) ||
      (Array.isArray(data?.data?.list) && data.data.list[0]) ||
      data

    return normalizeOne(first)
  } catch (err) {
    const status = err?.response?.status
    if (status === 404) {
      // 일정이 등록되어 있지 않은 정상 케이스로 간주
      // console.warn('현재 조건에 해당하는 일정이 없습니다.')
      return null
    }
    // 그 외는 그대로 에러 전파
    throw err
  }
}

/** 등록 */
export const createSchedule = (payload) =>
  axiosInstance.post('/schedule', payload)

/** 수정 */
export const updateSchedule = (id, payload) =>
  axiosInstance.put(`/schedule/${id}`, payload)

/** 삭제 */
export const deleteSchedule = (id) =>
  axiosInstance.delete(`/schedule/${id}`, { data: null }) // 🔑 body 강제 제거

/** 단일 조회 */
export const getScheduleById = async (id) => {
  try {
    const res = await axiosInstance.get(`/schedule/${id}`)
    // 단건 표준화
    const normalized =
      normalizeOne(res?.data) ??
      normalizeSchedules(res?.data)?.[0] ??
      null
    return normalized
  } catch (err) {
    if (err?.response?.status === 404) return null
    throw err
  }
}