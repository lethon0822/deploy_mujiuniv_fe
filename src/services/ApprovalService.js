// src/services/approvalService.js
import axios from './httpRequester'

// 신청 승인/거부 처리
export async function decideApplication(appId, userId, status, scheduleType) {
  const body = {
    appId,
    userId,
    status,        // "승인" or "거부"
    scheduleType,  // "휴학신청" / "복학신청" / "휴직신청" / "복직신청"
  };
  const res = await axios.patch("/staff/approval", body);
  return res.data;
}

// 신청 목록 조회
export async function fetchApplications({ year, semester, scheduleType }) {
  const params = { year };

  if (semester) {
    params.semester = semester; // 값이 있을 때만 추가
  }
  if (scheduleType) {
    params.scheduleType = scheduleType;
  }

  const res = await axios.get("/staff/approval", { params });
  return res.data;
}
