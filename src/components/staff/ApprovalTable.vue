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
    <!-- 데스크톱 테이블 뷰 -->
    <div class="desktop-view" v-if="applications.length > 0">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>0
              <th>연도</th>
              <th>학기</th>
              <th>이름</th>
              <th>학과</th>
              <th>신청구분</th>
              <th>변동사유</th>
              <th>신청일자</th>
              <th>처리여부</th>
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
    </div>

    <!-- 데스크톱 빈 상태 -->
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

    <!-- 모바일 카드 뷰 -->
    <div class="mobile-view">
      <template v-if="applications.length === 0">
        <div class="empty-state">
          <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
          <p>검색 결과가 없습니다.</p>
        </div>
      </template>
      <template v-else>
        <div class="card" v-for="app in applications" :key="app.appId">
          <div class="card-header">
            <div class="card-title">{{ app.userName }}</div>
            <div
              class="card-status"
              :class="{ processing: app.status === '처리중' }"
            >
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
  height: 48px;
  background-color: white;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

tbody td {
  padding: 8px 10px;
  font-size: 13px;
  text-align: center;
  word-wrap: break-word;
  vertical-align: middle;
}

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
    padding: 15px;
    background-color: #f0f4f8;
    border: none;
    box-shadow: none;
    max-height: none;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .card {
    background-color: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
  }

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a202c;
  }

  .card-status {
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
    background-color: #e2e8f0;
    color: #64748b;
  }

  .card-status.processing {
    background-color: #e0f2fe;
    color: #0284c7;
  }

  .card-body {
    margin-bottom: 16px;
  }

  .info-row {
    display: flex;
    padding: 6px 0;
    font-size: 14px;
  }

  .label {
    color: #64748b;
    font-weight: 600;
    margin-right: 8px;
    min-width: 90px;
  }

  .card-actions {
    display: flex;
    gap: 8px;
  }

  .card-actions button {
    flex: 1;
    padding: 10px;
    font-size: 14px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
  }

  .empty-image {
    max-width: 80px;
    opacity: 0.8;
    margin-bottom: 20px;
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

  thead th {
    font-size: 12px;
    padding: 10px 6px;
  }

  tbody td {
    font-size: 12px;
    padding: 6px 4px;
  }
}

/* PC */
@media (min-width: 1024px) and (max-width: 1231px) {
  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
