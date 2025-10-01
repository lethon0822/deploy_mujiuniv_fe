<script setup>
import { watch, ref } from "vue";
import { fetchApplications, decideApplication } from "@/services/ApprovalService";
import YnModal from "@/components/common/YnModal.vue";
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
    msg: `신청자: ${app.userName}\n유형: ${app.scheduleType}\n\n'${status}' 처리 하시겠습니까?`,
    onOk: async () => {
      try {
        const msg = await decideApplication(
          app.appId,
          app.userId,
          status,
          app.scheduleType
        );
        alert(msg);

        // ✅ 현재 필터 유지해서 다시 조회
        // ApprovalFilterBar에서 마지막 검색 조건을 props로 내려주거나 store에 보관
        await loadApplications(lastFilters.value);  

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
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">학적 신청 승인/거부 관리</h2>
     <WhiteBox>
      <div v-if="loading" class="text-center py-8">불러오는 중...</div>

      <table v-else class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-2 border">연도</th>
            <th class="p-2 border">학기</th>
            <th class="p-2 border">이름</th>
            <th class="p-2 border">학과</th>
            <th class="p-2 border">신청구분</th>
            <th class="p-2 border">변동사유</th>
            <th class="p-2 border">신청일자</th>
            <th class="p-2 border">처리여부</th>
            <th class="p-2 border">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.appId">
            <td class="p-2 border text-center">{{ app.year }}년</td>
            <td class="p-2 border text-center">{{ app.semester }}학기</td>
            <td class="p-2 border text-center">{{ app.userName }}</td>
            <td class="p-2 border text-center">{{ app.deptName || "-" }}</td>
            <td class="p-2 border text-center">{{ app.scheduleType }}</td>
            <td class="p-2 border">{{ app.reason }}</td>
            <td class="p-2 border text-center">{{ formatDate(app.createdAt) }}</td>
            <td class="p-2 border text-center">{{ app.status }}</td>
            <td class="p-2 border text-center">
              <button
                class="px-2 py-1 bg-green-500 text-white rounded mr-1 disabled:opacity-50"
                @click="openConfirm(app, '승인')"
                :disabled="app.status !== '처리중'">
                승인
              </button>
              <button
                class="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
                @click="openConfirm(app, '거부')"
                :disabled="app.status !== '처리중'">
                거부
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </WhiteBox>

    <!-- 확인 모달 -->
    <YnModal
      v-if="modalState.open"
      :message="modalState.msg"
      :show="modalState.open"
      type="confirm"
      @ok="modalState.onOk(); modalState.open = false"
      @close="modalState.open = false"
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
}

.btn-danger {
  background-color: #ff3b30;
  color: #fff;
  border: none;
  height: 32px;
  min-width: 80px;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.btn-danger:hover {
  background-color: #e03128;
}

.btn-danger:active {
  background-color: #b3271f;
}

.btn-success {
  background-color: #5ba666;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-success:hover {
  background-color: #4a8955;
}

.btn-success:active {
  background-color: #3e7548;
}

.btn-secondary {
  background-color: #6c757d;
  height: 32px;
  min-width: 80px;
  font-size: 12px;
  color: white;
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
