<script setup>
import { getList } from "@/services/Application";
import { onMounted, reactive, ref } from "vue";

const state = reactive({
  approvalList: [
  ],
});

const showModal = ref(false);
const showDetailModal = ref(false);
const showConfirmModal = ref(false);
const selectedApproval = ref(null);
const confirmAction = ref("");
const confirmMessage = ref("");

const pullList = async () => {
  const json = {
    year: 2025,
    semester: 2,
    scheduleType: ""
  };
  const res = await getList(json);
  if (res.status === 200) {
    state.approvalList = res.data;
  } else {
    console.error("조회 실패", res);
  }
};

function openModal(approval) {
  selectedApproval.value = approval;
  showDetailModal.value = true;
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedApproval.value = null;
}

function showConfirmDialog(action) {
  confirmAction.value = action;
  if (action === "approve") {
    confirmMessage.value = "신청을 승인 하시겠습니까?";
  } else if (action === "reject") {
    confirmMessage.value = "신청을 거부 하시겠습니까?";
  }
  showDetailModal.value = false;
  showConfirmModal.value = true;
}

function closeConfirmModal() {
  showConfirmModal.value = false;
  confirmAction.value = "";
  confirmMessage.value = "";
}

function handleConfirm() {
  if (selectedApproval.value) {
    if (confirmAction.value === "approve") {
      selectedApproval.value.approvalState = "승인";
    } else if (confirmAction.value === "reject") {
      selectedApproval.value.approvalState = "거부";
    }
  }
  closeConfirmModal();
  selectedApproval.value = null;
}

const getStatusClass = (status) => {
  switch (status) {
    case "승인":
      return "status-approved";
    case "거부":
      return "status-rejected";
    case "대기":
      return "status-pending";
    default:
      return "status-pending";
  }
};

onMounted(() => {
  pullList();
});
</script>

<template>
  <div class="table-container">
    <div class="table-wrapper desktop-view">
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
            <th>접수일자</th>
            <th>처리여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="approval in state.approvalList" :key="approval.id">
            <td>{{ approval.year }}년</td>
            <td>{{ approval.semester }}학기</td>
            <td>{{ approval.userName }}</td>
            <td>{{ approval.departmentName }}</td>
            <td>{{ approval.approval }}</td>
            <td>{{ approval.reason }}</td>
            <td>{{ approval.approvalDate }}</td>
            <td>{{ approval.checkDate }}</td>
            <td>
              <span
                class="status-badge"
                :class="getStatusClass(approval.approvalState)"
              >
                {{ approval.approvalState }}
              </span>
            </td>
            <td>
              <button
                v-if="
                  approval.approvalState !== '승인' &&
                  approval.approvalState !== '거부'
                "
                @click="openModal(approval)"
                class="btn btn-danger btn-sm"
              >
                처리하기
              </button>
              <button v-else class="btn btn-secondary btn-sm" disabled>
                처리완료
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 모바일 카드 -->
  <div class="mobile-view">
    <div
      v-for="approval in state.approvalList"
      :key="approval.id"
      class="mobile-card"
    >
      <div class="card-header">
        <div class="student-info">
          <h3 class="student-name">{{ approval.userName }}</h3>
          <span class="department">{{ approval.departmentName }}</span>
        </div>
        <div
          class="status-badge"
          :class="getStatusClass(approval.approvalState)"
        >
          {{ approval.approvalState }}
        </div>
      </div>

      <div class="card-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">연도/학기</span>
            <span class="value"
              >{{ approval.year }}년 {{ approval.semester }}학기</span
            >
          </div>
          <div class="info-item">
            <span class="label">신청구분</span>
            <span class="value">{{ approval.approval }}</span>
          </div>
          <div class="info-item">
            <span class="label">변동사유</span>
            <span class="value">{{ approval.reason }}</span>
          </div>
          <div class="info-item">
            <span class="label">신청일자</span>
            <span class="value">{{ approval.approvalDate }}</span>
          </div>
          <div class="info-item">
            <span class="label">접수일자</span>
            <span class="value">{{ approval.checkDate }}</span>
          </div>
        </div>
      </div>

      <div class="card-actions">
        <button
          v-if="
            approval.approvalState !== '승인' &&
            approval.approvalState !== '거부'
          "
          @click="openModal(approval)"
          class="btn btn-danger btn-sm w-100"
        >
          처리하기
        </button>
        <button v-else class="btn btn-secondary w-100" disabled>
          처리완료
        </button>
      </div>
    </div>
  </div>

  <!-- 상세 정보 모달 -->
  <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ selectedApproval?.approval }} 신청</h3>
        <button class="modal-close" @click="closeDetailModal">×</button>
      </div>
      <div class="modal-body">
        <div class="detail-info">
          <div class="info-row">
            <span class="info-label">학번</span>
            <span class="info-value">{{
              selectedApproval?.id || "HLU7140"
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">학과</span>
            <span class="info-value">{{
              selectedApproval?.departmentName
            }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">신청구분</span>
            <span class="info-value">{{ selectedApproval?.approval }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">사유</span>
            <span class="info-value">{{ selectedApproval?.reason }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">연락처</span>
            <span class="info-value">02-1234-5678</span>
          </div>
          <div class="info-row">
            <span class="info-label">실제사유</span>
            <span class="info-value">100원</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" @click="closeDetailModal">취소</button>
        <button class="btn btn-success" @click="showConfirmDialog('approve')">
          승인
        </button>
      </div>
    </div>
  </div>

  <!-- 확인 모달 -->
  <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
    <div class="confirm-modal" @click.stop>
      <div class="confirm-content">
        <p>{{ confirmMessage }}</p>
        <div class="confirm-buttons">
          <button class="btn btn-outline" @click="closeConfirmModal">
            아니오
          </button>
          <button class="btn btn-success" @click="handleConfirm">네</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.desktop-view {
  display: none;
}

.mobile-view {
  display: block;
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

/* 버튼 */
button {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin: 2px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-outline {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.btn-outline:hover {
  background-color: #5a6268;
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 20px 24px;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #4b5563;
  min-width: 80px;
}

.info-value {
  color: #1f2937;
  text-align: right;
}

.modal-footer {
  padding: 16px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal-footer button {
  padding: 8px 16px;
  font-size: 14px;
}

/* 확인 모달 */
.confirm-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.confirm-content {
  padding: 32px 24px 24px;
  text-align: center;
}

.confirm-content p {
  font-size: 16px;
  color: #1f2937;
  margin: 0 0 24px;
  font-weight: 500;
}

.confirm-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-buttons button {
  padding: 8px 24px;
  font-size: 14px;
  min-width: 80px;
}

/* 모바일 */
@media (max-width: 767px) {
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

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .card-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 10px;
  }

  .card-actions button {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .confirm-modal {
    width: 95%;
    margin: 20px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
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
@media all and (min-width: 1024px) and (max-width: 1231px) {
  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
