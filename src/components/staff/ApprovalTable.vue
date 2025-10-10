<script setup>
import { watch, ref } from "vue";
import {
  fetchApplications,
  decideApplication,
} from "@/services/ApprovalService";
import ApprovalModal from "@/components/common/ApprovalModal.vue";
import noDataImg from "@/assets/find.png";

const props = defineProps({
  filters: { type: Object, default: () => ({}) },
});

const applications = ref([]);

watch(
  () => props.filters,
  async (val) => {
    if (!val) return;
    try {
      applications.value = await fetchApplications(val);
    } catch (err) {
      console.error(err);
    }
  },
  { deep: true, immediate: true }
);

const modalState = ref({
  open: false,
  msg: "",
  onOk: null,
});

async function loadApplications(filters) {
  try {
    applications.value = await fetchApplications(filters);
  } catch (err) {
    console.error(err);
  }
}

function openConfirm(app, status) {
  modalState.value = {
    open: true,
    msg: `신청자: ${app.userName}\n 유형: ${app.scheduleType}\n\n'${status}' 처리 하시겠습니까?`,
    onOk: async () => {
      try {
        const msg = await decideApplication(
          app.appId,
          app.userId,
          status,
          app.scheduleType
        );
        alert(msg);
        await loadApplications(props.filters);
      } catch (err) {
        console.error(err);
        alert("처리 중 오류 발생");
      }
      modalState.value.open = false;
    },
  };
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);

  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function statusClass(s) {
  return {
    "badge pending": s === "처리중",
    "badge ok": s === "승인",
    "badge reject": s === "거부",
  };
}

function getMobileStatusClass(s) {
  return {
    "status-badge pending": s === "처리중",
    "status-badge ok": s === "승인",
    "status-badge reject": s === "거부",
  };
}

const close = () => {
  modalState.value.open = false;
};
</script>

<template>
  <div class="table-container">
    <div class="desktop-view" v-if="applications.length > 0">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>연도</th>
              <th>학기</th>
              <th>이름</th>
              <th>학과</th>
              <th>신청구분</th>
              <th>변동사유</th>
              <th>신청일자</th>
              <th>처리여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in applications" :key="app.appId">
              <td>{{ app.year }}년</td>
              <td>{{ app.semester }}학기</td>
              <td>{{ app.userName }}</td>
              <td>{{ app.deptName || "-" }}</td>
              <td>{{ app.scheduleType }}</td>
              <td>{{ app.reason }}</td>
              <td>{{ formatDate(app.createdAt) }}</td>
              <td>
                <span :class="statusClass(app.status)">
                  {{ app.status }}
                </span>
              </td>
              <td>
                <button
                  class="btn-approve"
                  @click="openConfirm(app, '승인')"
                  :disabled="app.status !== '처리중'"
                >
                  승인
                </button>
                <button
                  class="btn-reject"
                  @click="openConfirm(app, '거부')"
                  :disabled="app.status !== '처리중'"
                >
                  거부
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      v-else
      class="desktop-view"
      style="
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div class="empty-state">
        <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
        <p>검색 결과가 없습니다.</p>
      </div>
    </div>

    <div class="mobile-view">
      <template v-if="applications.length === 0"> </template>
      <template v-else>
        <div class="card" v-for="app in applications" :key="app.appId">
          <div class="card-header">
            <div class="card-title">{{ app.userName }}</div>
            <div :class="getMobileStatusClass(app.status)">
              {{ app.status }}
            </div>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">학년도/학기:</span>
              <span>{{ app.year }}년 {{ app.semester }}학기</span>
            </div>
            <div class="info-row">
              <span class="label">학과:</span>
              <span>{{ app.deptName || "-" }}</span>
            </div>
            <div class="info-row">
              <span class="label">신청구분:</span>
              <span>{{ app.scheduleType }}</span>
            </div>
            <div class="info-row">
              <span class="label">변동사유:</span>
              <span>{{ app.reason }}</span>
            </div>
            <div class="info-row">
              <span class="label">신청일자:</span>
              <span>{{ formatDate(app.createdAt) }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="btn-approve"
              @click="openConfirm(app, '승인')"
              :disabled="app.status !== '처리중'"
            >
              승인
            </button>
            <button
              class="btn-reject"
              @click="openConfirm(app, '거부')"
              :disabled="app.status !== '처리중'"
            >
              거부
            </button>
          </div>
        </div>
      </template>
    </div>

    <ApprovalModal
      :show="modalState.open"
      :message="modalState.msg"
      @approve="modalState.onOk && modalState.onOk()"
      @reject="close"
    />
  </div>
</template>

<style scoped>
.table-container {
  margin: auto auto 50px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1500px;
  border: 0.2px solid #74747480;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #969696 #fff;
}

table {
  min-width: 1200px;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

thead th:nth-child(1) {
  width: 10%;
}
thead th:nth-child(2) {
  width: 10%;
}
thead th:nth-child(3) {
  width: 10%;
}
thead th:nth-child(4) {
  width: 10%;
}
thead th:nth-child(5) {
  width: 10%;
}
thead th:nth-child(6) {
  width: 18%;
}
thead th:nth-child(7) {
  width: 10%;
}
thead th:nth-child(8) {
  width: 10%;
}
thead th:nth-child(9) {
  width: 20%;
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
  padding: 12px 4px;
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
  height: auto;
  background-color: white;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

tbody td {
  padding: 8px 4px;
  font-size: 13px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

tbody tr td:nth-child(6) {
  white-space: normal;
  word-break: break-word;
  padding: 8px 4px;
  height: auto;
}

tbody tr td:last-child {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
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

.btn-approve {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  background-color: #3f7ea6;
  color: #fff;
  transition: background-color 0.2s ease;
  height: 32px;
  min-width: 80px;
  font-size: 12px;
}

.btn-approve:hover {
  background-color: #2a5c74;
}

.btn-approve:active {
  background-color: #204658;
}

.btn-reject {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  background-color: #ff3b30;
  color: #fff;
  transition: background-color 0.2s ease;
  height: 32px;
  min-width: 80px;
  font-size: 12px;
}

.btn-reject:hover {
  background-color: #e03128;
}

.btn-reject:active {
  background-color: #b3271f;
}

.btn-approve:disabled,
.btn-reject:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-approve,
.btn-reject {
  cursor: pointer;
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

/* 모바일 */
@media (max-width: 767px) {
  .table-container {
    width: 100%;
    padding: 12px;
    background-color: #f0f4f8;
    border: none;
    box-shadow: none;
    max-width: none;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid #e5e7eb;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    background-color: white;
    border-bottom: none !important;
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: #1f2937;
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

  .card-body {
    margin-bottom: 16px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 13px;
    font-weight: 600;
    min-width: 80px;
  }

  .card-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .card-actions button {
    flex: 1 1 0;
    min-width: 100px;
    padding: 10px 15px;
    font-size: 13px;
    border-radius: 6px;
    height: 36px;
  }
}

/* 태블릿 */
@media (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 10px 0;
    max-width: none;
    margin: 0;
  }

  .table-wrapper {
    overflow-x: hidden;
  }

  table {
    min-width: 100%;
    width: 100%;
    table-layout: fixed;
  }

  thead th {
    font-size: 12px;
    padding: 10px 4px;
  }

  tbody td {
    font-size: 12px;
    padding: 6px 4px;
  }

  thead th:nth-child(1) {
    width: 6%;
  }
  thead th:nth-child(2) {
    width: 6%;
  }
  thead th:nth-child(3) {
    width: 8%;
  }
  thead th:nth-child(4) {
    width: 10%;
  }
  thead th:nth-child(5) {
    width: 8%;
  }
  thead th:nth-child(6) {
    width: 15%;
  }
  thead th:nth-child(7) {
    width: 10%;
  }
  thead th:nth-child(8) {
    width: 10%;
  }
  thead th:nth-child(9) {
    width: 15%;
  }

  .btn-approve {
    min-width: 45px;
    height: 30px;
    padding: 0 4px;
  }
  .btn-reject {
    min-width: 45px;
    height: 30px;
    padding: 0 4px;
  }
}

/* PC */
@media (min-width: 1024px) {
  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
