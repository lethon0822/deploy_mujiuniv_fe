<script setup>
import { watch, ref } from "vue";
import {
  fetchApplications,
  decideApplication,
} from "@/services/ApprovalService";
import ApprovalModal from "@/components/common/ApprovalModal.vue";
import WhiteBox from "@/components/common/WhiteBox.vue";

const props = defineProps({
  filters: { type: Object, default: () => ({}) },
});

const applications = ref([]);
const loading = ref(false);

watch(
  () => props.filters,
  async (val) => {
    if (!val) return;
    loading.value = true;
    try {
      applications.value = await fetchApplications(val);
    } finally {
      loading.value = false;
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
  loading.value = true;
  try {
    applications.value = await fetchApplications(filters);
  } finally {
    loading.value = false;
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
    },
  };
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const close = () => {
  modalState.value.open = false;
};
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="loading">불러오는 중...</div>

    <div v-else class="table-wrapper">
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
            <td>{{ app.status }}</td>
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

    <!-- 확인 모달 -->
    <ApprovalModal
      :show="modalState.open"
      :message="modalState.msg"
      @approve="modalState.onOk && modalState.onOk()"
      @reject="close"
    />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}

.table-container {
  margin: auto auto auto;
  max-height: 430px;
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

.loading {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
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

/* 승인 버튼 */
.btn-approve {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-approve:not(:disabled):hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.btn-approve:disabled {
  background-color: #b0c4de;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 거부 버튼 */
.btn-reject {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-reject:not(:disabled):hover {
  background-color: #d9363e;
  transform: scale(1.05);
}

.btn-reject:disabled {
  background-color: #f5a3a5;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 모바일 */
@media (max-width: 767px) {
  .table-container {
    width: 100%;
    position: static;
    transform: none;
    padding: 15px;
    background-color: #f0f4f8;
    border: none;
    box-shadow: none;
  }

  .mobile-view {
    display: block;
  }

  .desktop-view {
    display: none;
  }

  /* 모바일 카드 스타일 */
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .empty-state {
    padding: 0;
  }

  .course-code {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .course-status {
    font-size: 14px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 5px;
  }

  .course-status.red {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .course-status.gray {
    background-color: #e2e8f0;
    color: #64748b;
  }

  .course-status.blue {
    background-color: #e0f2fe;
    color: #0284c7;
  }

  .course-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1a202c;
  }

  .course-title .link {
    text-decoration: none;
    color: inherit;
  }

  .course-title .link:hover {
    color: #2460ce;
    text-decoration: underline;
  }

  .course-info {
    margin-bottom: 20px;

    padding-top: 10px;
  }

  .info-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: #4a5568;
    font-weight: 600;

    margin-right: 8px;
  }

  .course-info span:not(.label) {
    font-size: 14px;
  }

  .remaining-remStd {
    color: #db3619;
    font-weight: 700;
  }

  .course-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 10px;
  }

  .course-actions button {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }

  .approve-buttons {
    display: flex;
    gap: 10px;
    width: 100%;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 10px 0;
    max-width: none;
    margin: 0;
  }

  th.code,
  td.code {
    display: none;
  }

  th.grade,
  td.grade {
    display: none;
  }

  th.classroom,
  td.classroom {
    display: none;
  }

  thead th {
    font-size: 12px;
    padding: 10px 6px;
  }

  tbody td {
    font-size: 12px;
    padding: 6px 4px;
  }

  tbody td.title {
    font-size: 12px;
    padding: 6px 4px;
  }

  .action-buttons-stack {
    gap: 2px;
  }

  .button-divider {
    margin: 2px 0;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .table-container {
    padding: 20px;
    max-width: 100%;
    margin: 0 auto;
  }

  tbody tr {
    height: 60px;
  }

  tbody td.button {
    vertical-align: middle;
    padding: 8px 10px;
  }

  .action-buttons-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    align-items: center;
  }

  .approve-buttons {
    display: flex;
    gap: 8px;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .approve-buttons button {
    flex-shrink: 0;
    min-width: 60px;
  }
}
</style>
