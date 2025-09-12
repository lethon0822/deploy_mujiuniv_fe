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

  // ---------- util: 응답 표준화 ----------
function normalizeSchedules(raw) {
  const rows = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.list)
    ? raw.list
    : Array.isArray(raw?.data?.list)
    ? raw.data.list
    : [];
  return rows.map((it) => ({
    scheduleId: it.scheduleId ?? it.schedule_id ?? it.id,
    semesterId: it.semesterId ?? it.semester_id,
    scheduleType:
      it.scheduleType ?? it.schedule_type ?? it.type ?? it.scheduleName,
    startDate:
      (it.startDate ??
        it.startDatetime ??
        it.start_date ??
        it.start_datetime ??
        it.start)?.toString()?.slice(0, 10) || null,
    endDate:
      (it.endDate ??
        it.endDatetime ??
        it.end_date ??
        it.end_datetime ??
        it.end)?.toString()?.slice(0, 10) || null,
    description: it.description ?? "",
    createdAt:
      it.createdAt ?? it.created_at ?? it.submittedAt ?? it.submitted_at ?? null,
  }));
}

function equalsIgnoreCase(a, b) {
  return String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
}

function sanitizeId(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  
/**
 * 다음 학기의 특정 타입(예: '휴학신청'/'복학신청'/'휴직신청'/'복직신청') 스케줄 1건 조회
 * @param {{ semesterId: number|string, type: string }} opts
 * @returns {Promise<{scheduleId, semesterId, scheduleType, startDate, endDate, description, createdAt} | null>}
 */
export async function getScheduleFor({ semesterId, type }) {
  if (!type) throw new Error("type은 필수입니다.");
  const semId = sanitizeId(semesterId);

  // 1) 가장 가능성 높은 전용 엔드포인트 시도: /schedule/for
  try {
    const params1 = { scheduleType: type, type };
    if (semId !== null) params1.semesterId = semId;
    const res1 = await axios.get("/schedule/for", { params: params1 });
    let arr1 = normalizeSchedules(res1);
    arr1 = arr1.filter((s) =>
            (semId === null || String(s.semesterId) === String(semId)) &&
            (equalsIgnoreCase(s.scheduleType, type) ||
            equalsIgnoreCase(s.scheduleType, (type ?? "").replace("신청", "")))
          );
    if (arr1.length > 0) {
      // 시작일이 가장 빠른 것 우선
      arr1.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
      return arr1[0];
    }
  }  catch (err) {
    if (err?.response?.status !== 404) {
      console.warn("[getScheduleFor]/schedule/for error:", err?.response?.status || err);
    }
    // 무시하고 다음 전략 진행
  }

  // 2) 일반 목록 엔드포인트: /schedule (필터 파라미터 지원 가정)
  try {
    const params2 = { scheduleType: type, type };
    if (semId !== null) params2.semesterId = semId;
    const res2 = await axios.get("/schedule", { params: params2 });
    let arr2 = normalizeSchedules(res2);
    arr2 = arr2.filter((s) =>
            (semId === null || String(s.semesterId) === String(semId)) &&
            (equalsIgnoreCase(s.scheduleType, type) ||
              equalsIgnoreCase(s.scheduleType, (type ?? "").replace("신청", "")))
          );
    if (arr2.length > 0) {
      arr2.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
      return arr2[0];
    }
  } catch (err) {
    if (err?.response?.status !== 404) {
      console.warn("[getScheduleFor]/schedule error:", err?.response?.status || err);
    }

  // 3) 최후: 월간 조회 후 클라이언트에서 필터링 (현재/다음 달 대략 커버)
  //    필요시 이 부분은 호출부에서 yyyymm 전달받아 더 정확히 좁혀도 됨
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const arr3 = await getSchedulesByMonth(y, m, semId ?? undefined);
  let filtered = arr3.filter(
    (s) =>
      (semId === null || String(s.semesterId) === String(semId)) &&
    (equalsIgnoreCase(s.scheduleType, type) ||
    equalsIgnoreCase(s.scheduleType, (type ?? "").replace("신청", "")))
    );
  if (filtered.length > 0) {
    filtered.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
    return filtered[0];
  }

  // 못 찾으면 null 반환 (상위에서 처리)
  return null;
  }
}
// 등록
export const createSchedule = (payload) =>
  axios.post('/schedule', payload).catch(e => e.response);

// 수정 (id 포함)
export const updateSchedule = (id, payload) =>
  axios.put(`/schedule/${id}`, payload).catch(e => e.response);

// 삭제 (id path variable)
export const deleteSchedule = (id) =>
  axios.delete(`/schedule/${id}`).catch(e => e.response);

// 단일 일정 조회 (옵션)
export const getScheduleById = (id) => 
  axios.get(`/schedule/${id}`).catch(e => e.response);
