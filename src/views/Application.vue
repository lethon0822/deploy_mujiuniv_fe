<script setup>
import { ref, watch, computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/account";
import YnModal from "@/components/common/YnModal.vue";
import ConfirmModal from "@/components/common/Confirm.vue";
import noDataImg from "@/assets/find.png";
import { getScheduleFor } from "@/services/scheduleService";
import {
  createApplication,
  fetchMyApplications,
  deleteApplication,
} from "@/services/Application";

// ===== Pinia =====
const userStore = useUserStore();
const { state } = storeToRefs(userStore);

const showConfirm = ref(false);
const confirmMessage = ref("신청을 삭제하시겠습니까?");
let currentAppId = null;

function openConfirm(appId) {
  currentAppId = appId;
  showConfirm.value = true;
}

const modalState = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

const showModal = (message, type = "info") => {
  modalState.ynModalMessage = message;
  modalState.ynModalType = type;
  modalState.showYnModal = true;
};

// 사용자 기본정보
const studentNumber = computed(
  () =>
    state.value.signedUser?.studentNumber ??
    state.value.signedUser?.loginId ??
    "-"
);
const deptName = computed(() => state.value.signedUser?.deptName ?? "-");

// 사용자 역할 판정
const isStudent = computed(() => {
  const r = (state.value.signedUser?.userRole || "").toString().toLowerCase();
  return r.includes("student") || r.includes("학생");
});

// 라벨
const pageTitle = computed(() =>
  isStudent.value ? "휴학 · 복학 신청" : "휴직 · 복직 신청"
);
const leaveLabel = computed(() => (isStudent.value ? "휴학" : "휴직"));
const returnLabel = computed(() => (isStudent.value ? "복학" : "복직"));
const endDateHint = computed(() => `${leaveLabel.value}시`);

// ===== 폼 상태 =====
const appType = ref("LEAVE");
const reason = ref("");
const schedule = ref(null);
const loadingSchedule = ref(false);
const submitting = ref(false);
const isReturn = computed(() => appType.value === "RETURN");

const today = new Date().toISOString().split("T")[0];
// 학생 입력값
const startDate = ref(today);
const endDate = ref("");

// 영어 → 한글 맵핑
function typeKo(t) {
  if (isStudent.value) return t === "LEAVE" ? "휴학신청" : "복학신청";
  return t === "LEAVE" ? "휴직신청" : "복직신청";
}

// 날짜 포맷 안전하게 꺼내기
function getDate(obj, key) {
  if (!obj) return "";
  return (obj[key] ?? obj[`${key}_datetime`] ?? obj[`${key}Date`] ?? "")
    ?.toString()
    ?.slice(0, 10);
}

// ===== 종료일 기본값 계산 =====
function pad(n) {
  return n.toString().padStart(2, "0");
}

function getYearAndSemester(semesterId) {
  if (!semesterId) return { year: null, semester: null };
  const year = 2020 + Math.ceil(semesterId / 2); // id=1 → 2021부터 시작
  const semester = semesterId % 2 === 1 ? 1 : 2; // 홀수=1학기, 짝수=2학기
  return { year, semester };
}

function getDefaultEndDateFromId(semesterId) {
  const { year, semester } = getYearAndSemester(semesterId);
  if (!year || !semester) return "";

  const nextYear = year + 1;
  if (semester === 1) return `${nextYear}-03-01`;
  if (semester === 2) return `${nextYear}-08-31`;
  return "";
}

// 학기 일정 조회
async function resolveNextSchedule() {
  const semesterId = state.value.signedUser?.semesterId;
  if (!semesterId) return;
  loadingSchedule.value = true;
  try {
    // 현재 신청 유형 ex) "휴직신청", "복직신청"
    const scheduleType = typeKo(appType.value)?.trim();

    // 우선 현재 신청 유형 일정 조회
    let res = await getScheduleFor({
      semesterId,
      scheduleType,
    });

    // 💡 복직신청 일정이 없으면 → 휴직신청 일정으로 대체
    if (!res && scheduleType === "복직신청") {
      res = await getScheduleFor({
        semesterId,
        scheduleType: "휴직신청",
      });
    }

    schedule.value = res;
  } catch (err) {
    console.error("resolveNextSchedule 오류:", err);
    schedule.value = null;
  } finally {
    loadingSchedule.value = false;
  }
}
watch(
  [() => state.value.signedUser?.semesterId, appType],
  resolveNextSchedule,
  { immediate: true }
);

// 기본값 세팅
watch(
  [schedule, () => appType.value],
  () => {
    startDate.value = today;
    endDate.value = getDefaultEndDateFromId(11);
  },
  { immediate: true }
);

// 복학/복직이면 종료일 비움
watch(isReturn, (v) => {
  if (v) endDate.value = "";
});

// 날짜 제한
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

const isDateOutOfRange = computed(() => {
  const min = dateBounds.value.minStart;
  const max = dateBounds.value.maxStart;

  if (!min && !max) return false; // 범위 없으면 무조건 활성화

  if (min && today < min) return true;
  if (max && today > max) return true;

  return false;
});

// 제출 가능 조건
const canSubmit = computed(() => {
  if (!schedule.value?.scheduleId || submitting.value) return false;
  if (!startDate.value) return false;
  if (!isReturn.value && !endDate.value) return false;

  const min = dateBounds.value.minStart;
  const max = dateBounds.value.maxStart;

  if (min && startDate.value < min) return false;
  if (max && startDate.value > max) return false;

  if (!isReturn.value && endDate.value < startDate.value) return false;

  return true;
});

// 신청
async function submit() {
  if (!canSubmit.value) return;

  if (
    !isReturn.value &&
    startDate.value &&
    endDate.value &&
    endDate.value < startDate.value
  ) {
    showModal("종료일은 시작일 이후여야 합니다.", "error");
    return;
  }

  submitting.value = true;
  try {
    const payload = {
      scheduleId: schedule.value.scheduleId,
      scheduleType: typeKo(appType.value)?.trim(),
      reason: reason.value?.trim() || null,
      startDatetime: startDate.value || null,
      endDatetime: isReturn.value ? null : endDate.value || null,
    };
console.log("sdfsdfg", payload)
    await createApplication(payload);

    showModal("신청이 접수되었습니다.", "success");
    reason.value = "";
    await loadList();
  } catch (e) {
    const message =
      e?.response?.data?.message ?? "신청 중 오류가 발생했습니다.";
    showModal(message, "error");
  } finally {
    submitting.value = false;
  }
}

// 목록
const rows = ref([]);
const statusFilter = ref("");
const listLoading = ref(false);

async function loadList() {
  listLoading.value = true;
  try {
    const apiData = await fetchMyApplications(state.value.signedUser?.userId);
    rows.value = statusFilter.value
      ? apiData.filter((r) => r.status === statusFilter.value)
      : apiData;
  } catch (e) {
    console.error("loadList 오류", e);
  } finally {
    listLoading.value = false;
  }
}
onMounted(loadList);
function onCancel(appId) {
  currentAppId = appId;
  showConfirm.value = true;
}
async function handleConfirm() {
  showConfirm.value = false;
  try {
    await deleteApplication(currentAppId, state.value.signedUser?.userId);
    await loadList();
    showModal("신청이 삭제되었습니다.", "success");
  } catch (e) {
    const message =
      e?.response?.data?.message ?? "삭제 중 오류가 발생했습니다.";
    showModal(message, "error");
  }
}

function handleCancel() {
  showConfirm.value = false;
}

// 라벨/뱃지/날짜 포맷
const shortType = (scheduleType) => {
  switch (scheduleType) {
    case "휴학신청":
      return "휴학";
    case "복학신청":
      return "복학";
    case "휴직신청":
      return "휴직";
    case "복직신청":
      return "복직";
    default:
      return scheduleType;
  }
};
function formatDate(v) {
  return v ? v.toString().slice(0, 10) : "-";
}
function statusClass(s) {
  return {
    "badge pending": s === "처리중",
    "badge ok": s === "승인",
    "badge reject": s === "거부",
  };
}
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1>{{ pageTitle }}</h1>
      <p>
        신청서를 작성한 후 [신청제출] 버튼을 눌러주세요. 제출이 완료되면 아래에
        신청 내역이 조회됩니다.
      </p>

      <div class="form-grid">
        <label>{{
          userStore.state.signedUser.userRole === "student" ? "학번" : "사번"
        }}</label>
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
            <i class="bi bi-dash-circle"></i>
            {{ leaveLabel }}
          </button>
          <button
            type="button"
            :class="{ on: appType === 'RETURN' }"
            @click="appType = 'RETURN'"
          >
            <i class="bi bi-check-circle"></i>
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
            required
            :disabled="isDateOutOfRange"
          />
          <span v-if="isDateOutOfRange" class="muted">
            오늘 날짜는 학사일정 범위 밖입니다.</span
          >
          <!-- <span class="muted" v-if="loadingSchedule">불러오는 중…</span> -->
        </div>

        <label>종료일 ({{ endDateHint }})</label>
        <div class="inline">
          <input type="date" v-model="endDate" readonly class="readonly-date" />
        </div>

        <label>상세 사유</label>
        <textarea
          v-model="reason"
          rows="3"
          placeholder="구체적인 사유를 입력하세요"
        ></textarea>
      </div>

      <div class="actions">
        <button
          type="submit"
          class="btn btn-primary"
          @click="submit"
          :disabled="!canSubmit"
        >
          <i class="bi bi-plus-circle"></i>
          신청제출
        </button>
      </div>
    </div>

    <div class="table-container">
      <div class="table-wrapper desktop-view">
        <table v-if="rows.length > 0">
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
            <tr v-for="r in rows" :key="r.appId">
              <td>{{ r.year }}</td>
              <td>{{ r.semester === "1" ? "1학기" : "2학기" }}</td>
              <td>{{ shortType(r.scheduleType) }}</td>
              <td>{{ r.reason || "-" }}</td>
              <td>{{ userStore.state.signedUser.deptName }}</td>
              <td>{{ formatDate(r.submittedAt) }}</td>
              <td>{{ formatDate(r.submittedAt) }}</td>
              <td>
                <span :class="statusClass(r.status)">{{ r.status }}</span>
              </td>
              <td>
                <button
                  v-if="r.status === '처리중'"
                  class="btn btn-danger"
                  @click="onCancel(r.appId)"
                >
                  삭제하기
                </button>
                <span v-else class="text-muted">처리완료</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
          <p>검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>

    <div class="mobile-view">
      <div v-if="rows.length === 0" class="empty-state">
        <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
        <p>검색 결과가 없습니다.</p>
      </div>

      <div v-for="approval in rows" :key="approval.appId" class="mobile-card">
        <div class="card-header">
          <div class="student-info">
            <h3 class="student-name">
              {{ state.signedUser?.userName || "-" }}
            </h3>
            <span class="department">{{
              userStore.state.signedUser.deptName
            }}</span>
          </div>
          <div class="status-badge" :class="statusClass(approval.status)">
            {{ approval.status }}
          </div>
        </div>
        <div class="card-content">
          <div class="info-grid">
            <div class="info-item">
              <span class="label">연도/학기</span
              ><span class="value"
                >{{ approval.year }}년
                {{ approval.semester === "1" ? "1학기" : "2학기" }}</span
              >
            </div>
            <div class="info-item">
              <span class="label">신청구분</span
              ><span class="value">{{ shortType(approval.scheduleType) }}</span>
            </div>
            <div class="info-item">
              <span class="label">변동사유</span
              ><span class="value">{{ approval.reason || "-" }}</span>
            </div>
            <div class="info-item">
              <span class="label">신청일자</span
              ><span class="value">{{ formatDate(approval.submittedAt) }}</span>
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
            삭제하기
          </button>
          <button v-else class="btn btn-secondary w-100" disabled>
            처리완료
          </button>
        </div>
      </div>
    </div>

    <YnModal
      v-if="modalState.showYnModal"
      :content="modalState.ynModalMessage"
      :type="modalState.ynModalType"
      @close="modalState.showYnModal = false"
    />
    <ConfirmModal
      v-if="showConfirm"
      :content="confirmMessage"
      type="warning"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
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
  color: #666;
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
  font-size: 13px;
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
  font-size: 13px;
  background: #fff;
  outline: none;
  color: #747474;
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

.form-grid label {
  font-size: 13px;
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
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  color: #374151;
  padding: 9px 20px;
  border-radius: 999px;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.25s ease;
  box-shadow: inset 0 -1px 2px rgba(0, 0, 0, 0.05);
}

.toggle button:hover {
  background: #e5e7eb;
  border-color: #cbd5e1;
  color: #111827;
}

.toggle button.on {
  background: #5ba666;
  border-color: #5ba666;
  color: white;
  font-weight: 500;
}

/* ===== 버튼 ===== */
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px;
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.btn-primary {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  height: 44px;
  min-width: 120px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2a5c74;
}

.btn-primary:active {
  background-color: #204658;
}

.btn-danger {
  background-color: #ff3b30;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-danger:hover {
  background-color: #e03128;
}

.btn-danger:active {
  background-color: #b3271f;
}

/* ===== 필터 ===== */
.filter-bar {
  padding: 15px 0 20px 0;
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
  width: 160px;
  flex-shrink: 0;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 13px;
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
  font-size: 13px;
  font-weight: 600;
}

.badge.pending {
  color: #d97706;
}

.badge.ok {
  color: #2460ce;
}

.badge.reject {
  color: #d61421;
}

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

.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #afb0b2;
  font-weight: 500;
}

.empty-image {
  max-width: 80px;
  opacity: 0.8;
  margin-top: -10px;
  margin-bottom: 20px;
}

.student-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.department {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 8px 8px;
  border-radius: 5px;
  text-align: center;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.ok {
  background-color: #e0f2fe;
  color: #0284c7;
}

.status-badge.reject {
  background-color: #fee2e2;
  color: #dc2626;
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
  font-size: 13px;
  font-weight: 600;
  min-width: 80px;
}

.value {
  font-size: 13px;
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

.readonly-date::-webkit-calendar-picker-indicator {
  display: none; /* 크롬, 사파리 달력 아이콘 제거 */
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
    font-size: 13px;
    border-radius: 6px;
  }

  .actions {
    margin-top: 15px;
  }

  .btn-primary {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 13px;
    border-radius: 6px;
  }
}

/* 태블릿 - 가로 스크롤 제거 */
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
    width: 100%;
    padding: 20px 20px 0 20px;
    overflow-x: hidden;
  }

  .table-wrapper {
    overflow-x: hidden;
  }

  table {
    table-layout: auto;
    min-width: 100%;
  }

  /* 태블릿에서 날짜 컬럼 줄바꿈 처리 */
  tbody td:nth-child(6),
  tbody td:nth-child(7) {
    font-size: 11px;
    line-height: 1.2;
    white-space: normal;
    word-break: keep-all;
    padding: 4px 6px;
  }

  /* 버튼 크기는 유지 */
  .btn-danger {
    min-width: 100px;
    font-size: 13px;
    white-space: nowrap;
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
