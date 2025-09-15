<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/account";
import { check } from "@/services/accountService";
import router from "@/router";
// API
import { getScheduleFor } from "@/services/scheduleService";
import {
  createApplication,
  fetchMyApplications,
  cancelApplication,
} from "@/services/Application";

// ===== Pinia =====
const userStore = useUserStore();
const { semesterId } = storeToRefs(userStore);

// (있다면 사용, 없으면 하이픈 표시)
const studentNumber = computed(
  () => userStore.studentNumber ?? userStore.loginId ?? "-"
);
const deptName = computed(
  () => userStore.deptName ?? userStore.state?.deptName ?? "-"
);

// 사용자 역할 판정(학생/그 외)
const isStudent = computed(() => {
  const r = (userStore.userRole || "").toString().toLowerCase();
  return r.includes("student") || r.includes("학생");
});

// UI 라벨/제목
const pageTitle = computed(() =>
  isStudent.value ? "휴·복학 신청" : "휴·복직 신청"
);
const leaveLabel = computed(() => (isStudent.value ? "휴학" : "휴직"));
const returnLabel = computed(() => (isStudent.value ? "복학" : "복직"));
const endDateHint = computed(() => `${leaveLabel.value}인 경우`);

// ===== 상단 폼 상태 =====
const appType = ref("LEAVE"); // 'LEAVE' | 'RETURN'
const reason = ref("");
const schedule = ref(null); // { scheduleId, startDate, endDate }
const loadingSchedule = ref(false);
const submitting = ref(false);
const isReturn = computed(() => appType.value === "RETURN");

// 날짜 선택 상태
const startDate = ref(""); // YYYY-MM-DD
const endDate = ref("");   // YYYY-MM-DD

// 영어 → 백엔드 타입(한글) 맵핑
const typeKo = (t) => {
  if (isStudent.value) return t === "LEAVE" ? "휴학신청" : "복학신청";
  return t === "LEAVE" ? "휴직신청" : "복직신청";
};

// schedule에서 날짜 안전하게 꺼내기
const getDate = (obj, key) => {
  if (!obj) return "";
  return (obj[key] ?? obj[`${key}_datetime`] ?? obj[`${key}Date`] ?? "")
    ?.toString()
    ?.slice(0, 10);
};

// 다음 학기의 해당 스케줄 조회 → Pinia semesterId 사용
async function resolveNextSchedule() {
  if (!semesterId.value) return;
  loadingSchedule.value = true;
  try {
    const res = await getScheduleFor({
      semesterId: semesterId.value,
      type: typeKo(appType.value),
    });
    schedule.value = res;
  } catch (err) {
    console.error("[resolveNextSchedule] 오류 발생", err);
    schedule.value = null;
  } finally {
    loadingSchedule.value = false;
  }
}

watch([semesterId, appType], resolveNextSchedule, { immediate: true });

// 스케줄/탭 바뀔 때 date 기본값 채우기
watch(
  [schedule, () => appType.value],
  () => {
    if (!schedule.value) {
      startDate.value = "";
      endDate.value = "";
      return;
    }
    startDate.value = getDate(schedule.value, "startDate") || "";
    endDate.value = getDate(schedule.value, "endDate") || "";
  },
  { immediate: true }
);

// 복학/복직이면 종료일 비활성 + 값 비우기
watch(isReturn, (v) => {
  if (v) endDate.value = "";
});

// 날짜 선택 범위(스케줄 기간으로 제한)
const dateBounds = computed(() => {
  const s = schedule.value;
  const min = getDate(s, "startDate") || "";
  const max = getDate(s, "endDate") || "";
  return {
    minStart: min,
    maxStart: max || undefined,
    minEnd: min,
    maxEnd: max || undefined,
  };
});

// 제출 가능 조건
const canSubmit = computed(() => {
  if (!schedule.value?.scheduleId || submitting.value) return false;
  if (!startDate.value) return false;
  if (!isReturn.value && !endDate.value) return false;
  return true;
});

// 신청
async function submit() {
  if (!canSubmit.value) return;

  if (!isReturn.value && startDate.value && endDate.value && endDate.value < startDate.value) {
    alert("종료일은 시작일 이후여야 합니다.");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      scheduleId: schedule.value.scheduleId,
      reason: reason.value?.trim() || null,
      startDatetime: startDate.value || null,
      endDatetime: isReturn.value ? null : endDate.value || null,
    };
    await createApplication(payload);
    alert("신청이 접수되었습니다.");
    reason.value = "";
    await loadList();
  } catch (e) {
    alert(e?.response?.data?.message ?? "신청 중 오류가 발생했습니다.");
  } finally {
    submitting.value = false;
  }
}

// ===== 하단 목록 =====
/*
const rows = ref([]);
const statusFilter = ref(""); // '' | '처리중' | '승인' | '거부'
const listLoading = ref(false);

async function loadList() {
  listLoading.value = true;
  try {
    const res = await fetchMyApplications(userStore.userId);
    rows.value = res;   // normalizeApplications()가 배열 리턴하니까 이렇게 받으면 돼
  } catch (e) {
    if (e?.response?.status === 401) {
      alert('세션이 만료되었어요. 다시 로그인 해주세요.');
      router.replace('/login');
    }
  } finally {
    listLoading.value = false;
  }
}
onMounted(loadList);
*/

// 테스트 하드코딩 데이터 연결되면 지울 것
const rows = ref([
  {
    appId: 1,
    year: "2024",
    semester: "2",
    scheduleType: "휴학신청",
    reason: "개인 사정",
    deptName: "컴퓨터공학과",
    submittedAt: "2024-01-15",
    status: "처리중",
    userName: "김학생",
  },
  {
    appId: 2,
    year: "2023",
    semester: "1",
    scheduleType: "복학신청",
    reason: "복학",
    deptName: "경영학과",
    submittedAt: "2023-12-20",
    status: "승인",
    userName: "이학생",
  },
  {
    appId: 3,
    year: "2020",
    semester: "1",
    scheduleType: "복학신청",
    reason: "복학",
    deptName: "경영학과",
    submittedAt: "2023-12-20",
    status: "거부",
    userName: "서학생",
  },
]);
const statusFilter = ref("");
const listLoading = ref(false);

async function loadList() {
  listLoading.value = true;
  try {
    const { data } = await fetchMyApplications(
      statusFilter.value ? { status: statusFilter.value } : undefined
    );
    const apiData = data ?? [];
    const filteredHardData = statusFilter.value
      ? rows.value.filter((row) => row.status === statusFilter.value)
      : rows.value;
    rows.value = [...filteredHardData, ...apiData];
  } finally {
    listLoading.value = false;
  }
}

async function onCancel(appId) {
  if (!confirm("신청을 취소하시겠습니까?")) return;
  try {
    await cancelApplication(appId);
    await loadList();
  } catch (e) {
    alert(e?.response?.data?.message ?? "취소 중 오류가 발생했습니다.");
  }
}

// 라벨/뱃지/날짜 포맷
const shortType = (scheduleType) => {
  switch (scheduleType) {
    case "휴학신청": return "휴학";
    case "복학신청": return "복학";
    case "휴직신청": return "휴직";
    case "복직신청": return "복직";
    default: return scheduleType;
  }
};
const formatDate = (v) => (v ? v.toString().slice(0, 10) : "-");
const statusClass = (s) => ({
  "badge pending": s === "처리중",
  "badge ok": s === "승인",
  "badge reject": s === "거부",
});
</script>


<template>
  <div class="container">
    <div class="header-card">
      <h1>{{ pageTitle }}</h1>
      <p>
        신청서를 작성한 후 [제출] 버튼을 눌러주세요. 제출이 완료되면 아래에
        신청 내역이 조회됩니다.
      </p>

      <div class="form-grid">
        <label>학번</label>
        <input :value="studentNumber" readonly />

        <label>학과</label>
        <input :value="deptName" readonly />

        <label>신청 구분</label>
        <div class="toggle">
          <button
            type="button"
            :class="{ on: appType === 'LEAVE' }"
            @click="appType = 'LEAVE'"
          >
            {{ leaveLabel }}
          </button>
          <button
            type="button"
            :class="{ on: appType === 'RETURN' }"
            @click="appType = 'RETURN'"
          >
            {{ returnLabel }}
          </button>
        </div>

        <label>시작일</label>
        <div class="inline">
          <input
            type="date"
            v-model="startDate"
            :min="dateBounds.minStart || undefined"
            :max="dateBounds.maxStart || undefined"
          />
          <span class="muted" v-if="loadingSchedule">불러오는 중…</span>
        </div>

        <label>종료일 ({{ endDateHint }})</label>
        <div class="inline">
          <input
            type="date"
            v-model="endDate"
            :min="dateBounds.minEnd || startDate"
            :max="dateBounds.maxEnd || undefined"
            :disabled="isReturn"
          />
        </div>

        <label>상세 사유</label>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="구체적인 사유를 입력하세요"
        ></textarea>
      </div>

      <div class="actions">
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-plus-circle"></i>신청제출
        </button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper desktop-view">
        <!-- 필터 -->
        <div class="filter-bar">
          <div class="filter-input-group">
            <div class="filter-wrapper">
              <i class="bi bi-funnel filter-icon"></i>
              <select
                class="filter-select"
                v-model="statusFilter"
                @change="loadList"
              >
                <option value="">상태/전체</option>
                <option value="처리중">처리중</option>
                <option value="승인">승인</option>
                <option value="거부">거부</option>
              </select>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>연도</th>
              <th>학기</th>
              <th>신청구분</th>
              <th>변동 사유</th>
              <th>학과</th>
              <th>신청일자</th>
              <th>접수일자</th>
              <th>접수여부</th>
              <th>신청</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rows.length === 0">
              <td colspan="9" class="empty">조회된 내역이 없습니다.</td>
            </tr>
            <tr v-for="r in rows" :key="r.appId">
              <td>{{ r.year }}</td>
              <td>{{ r.semester === "1" ? "1학기" : "2학기" }}</td>
              <td>{{ shortType(r.scheduleType) }}</td>
              <td>{{ r.reason || "-" }}</td>
              <td>{{ r.deptName || "-" }}</td>
              <td>{{ formatDate(r.submittedAt) }}</td>
              <td>{{ formatDate(r.submittedAt) }}</td>
              <td>
                <span :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td>
                <button
                  v-if="r.status === '처리중'"
                  class="btn btn-danger btn-sm"
                  @click="onCancel(r.appId)"
                >
                  취소하기
                </button>
                <span v-else class="text-muted">처리완료</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 모바일 카드 -->
    <div class="mobile-view">
      <div v-for="approval in rows" :key="approval.appId" class="mobile-card">
        <div class="card-header">
          <div class="student-info">
            <h3 class="student-name">{{ approval.userName || "-" }}</h3>
            <span class="department">{{ approval.deptName || "-" }}</span>
          </div>
          <div class="status-badge" :class="statusClass(approval.status)">
            {{ approval.status }}
          </div>
        </div>

        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">연도/학기</span>
              <span class="value"
                >{{ approval.year }}년
                {{ approval.semester === "1" ? "1학기" : "2학기" }}</span
              >
            </div>
            <div class="info-item">
              <span class="label">신청구분</span>
              <span class="value">{{ shortType(approval.scheduleType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">변동사유</span>
              <span class="value">{{ approval.reason || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="label">신청일자</span>
              <span class="value">{{ formatDate(approval.submittedAt) }}</span>
            </div>
            <div class="info-item">
              <span class="label">접수일자</span>
              <span class="value">{{ formatDate(approval.submittedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button
            v-if="approval.status === '처리중'"
            class="btn btn-danger w-100"
            @click="onCancel(approval.appId)"
          >
            취소하기
          </button>
          <button v-else class="btn btn-secondary w-100" disabled>
            처리완료
          </button>
        </div>
      </div>

      <!-- 조회된 내역 없을 때 -->
      <div v-if="rows.length === 0" class="empty-message">
        조회된 내역이 없습니다.
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  width: 100%;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
}
.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.header-card h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}
.header-card p {
  font-size: 13px;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.table-container {
  margin: auto auto 50px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1500px;
  border: 0.2px solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #969696 #fff;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

thead {
  color: #343a40;
  background-color: #f8f9fa;
}

thead th {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 2;
  padding: 12px 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

thead th::before,
thead th::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #969696;
}

thead th::before {
  top: 0;
}

thead th::after {
  bottom: 0;
}

tbody {
  color: black;
  background-color: white;
}

tbody tr {
  border-bottom: 1px solid #747474;
  height: 40px;
  background-color: white;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

tbody td {
  padding: 8px 10px;
  border-right: none;
  font-size: 13px;
  text-align: center;
  word-wrap: break-word;
  vertical-align: middle;
}

tbody td.title {
  text-align: center;
  vertical-align: middle;
  white-space: normal;
  word-break: break-all;
  line-height: 1.3;
  padding: 8px 10px;
}

.desc {
  color: #666;
  margin-bottom: 20px;
}

/* ===== 폼 ===== */
.form-grid {
  display: grid;
  grid-template-columns: 100px minmax(200px, 1fr);
  gap: 12px 16px;
  align-items: center;
}
.form-grid input,
.form-grid textarea,
.form-grid select {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: #fff;
  outline: none;
}
.form-grid input:read-only {
  background: #f9fafb;
}
.form-grid textarea {
  resize: vertical;
}
.inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-grid input:read-only {
  background: #f9fafb;
}
.form-grid input:disabled {
  background: #f5f5f5;
  color: #9ca3af;
}
.inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.muted {
  color: #777;
  font-size: 12px;
  font-weight: 500;
}

.toggle {
  display: flex;
  gap: 8px;
}
.toggle button {
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  padding: 8px 14px;
  border-radius: 10px;
}
.toggle button.on {
  background: #3bbeff;
  border-color: #3bbeff;
  color: #fff;
}

/* ===== 버튼 ===== */
button {
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin: 2px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.btn-primary {
  height: 41px;
  padding: 15px 16px;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: none;
  border-radius: 6px;
}

/* ===== 필터 ===== */
.filter-bar {
  padding: 15px 0 20px 0; /* 상하 여백 조정 */
  margin-bottom: 15px;
}

.filter-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.filter-wrapper {
  position: relative;
  width: 160px; /* min-width 대신 고정 width */
  flex-shrink: 0;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  z-index: 1;
}

.filter-select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 40px;
  color: #777;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  min-width: 80px;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
  outline: none;
}
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.badge.pending {
  background: #f3f4f6;
  color: #6b7280;
}
.badge.ok {
  background: #e7f7ec;
  color: #15803d;
}
.badge.reject {
  background: #fee2e2;
  color: #b91c1c;
}

/* 모바일 카드 */
.mobile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.department {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  min-width: 60px;
}

.status-approved {
  background-color: #dcfce7;
  color: #16a34a;
}

.status-rejected {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.card-content {
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
  min-width: 80px;
}

.value {
  font-size: 14px;
  color: #1f2937;
  text-align: right;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mobile-view {
  display: none;
}

.desktop-view {
  display: block;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .table-container {
    display: none;
    width: 100%;
    position: static;
    transform: none;
    padding: 15px;
    background-color: #f0f4f8;
    border: none;
    box-shadow: none;
  }

  .toggle {
    justify-content: center;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .card-actions button {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }

  .actions {
    margin-top: 15px;
  }

  .btn-primary {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }
}

/* 테블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .table-container {
    width: 102vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 20px 20px 0;
    max-width: none;
    margin: 0;
  }

  .mobile-view {
    display: none;
  }

  .desktop-view {
    display: block;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 30px;
  }

  .header-card {
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
