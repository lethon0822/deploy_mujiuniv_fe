<script setup>
import { getList } from "@/services/Application";
import { onMounted, reactive, ref } from "vue";

const state = reactive({
  approvalList: [
    {
      id: 1,
      year: 2025,
      semester: 2,
      userName: "김철수",
      departmentName: "컴퓨터공학과",
      approval: "휴학",
      reason: "군입대",
      approvalDate: "2025-03-01",
      checkDate: "2025-03-02",
      approvalState: "대기",
    },
    {
      id: 2,
      year: 2025,
      semester: 2,
      userName: "이영희",
      departmentName: "경영학과",
      approval: "복학",
      reason: "학업복귀",
      approvalDate: "2025-03-05",
      checkDate: "2025-03-06",
      approvalState: "승인",
    },
  ],
});

const showModal = ref(false);
const selectedApproval = ref(null);

const pullList = async () => {
  const json = {
    year: 2025,
    semester: 2,
  };
  const res = await getList(json);
  if (res.status === 200) {
    state.approvalList = res.data; // 서버 응답으로 교체
  }
};

function openModal(approval) {
  selectedApproval.value = approval;
  showModal.value = true;
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
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin: 2px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
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
