<script setup>
import { watch, ref } from "vue";
import { fetchApplications, decideApplication } from "@/services/ApprovalService";
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
        await loadApplications(props.filters);  // 필터 유지 재조회
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

const close = () =>{
  modalState.value.open = false 
}
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">학적 신청 승인/거부 관리</h2>
    <WhiteBox class="p-4">
      <div v-if="loading" class="text-center py-8">불러오는 중...</div>

      <table
        v-else
        class="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm"
      >
        <thead>
          <tr class="bg-gray-100 text-gray-700 text-sm">
            <th class="p-3 border border-gray-200">연도</th>
            <th class="p-3 border border-gray-200">학기</th>
            <th class="p-3 border border-gray-200">이름</th>
            <th class="p-3 border border-gray-200">학과</th>
            <th class="p-3 border border-gray-200">신청구분</th>
            <th class="p-3 border border-gray-200">변동사유</th>
            <th class="p-3 border border-gray-200">신청일자</th>
            <th class="p-3 border border-gray-200">처리여부</th>
            <th class="p-3 border border-gray-200">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in applications"
            :key="app.appId"
            class="hover:bg-gray-50 transition"
          >
            <td class="p-3 border border-gray-200 text-center">
              {{ app.year }}년
            </td>
            <td class="p-3 border border-gray-200 text-center">
              {{ app.semester }}학기
            </td>
            <td class="p-3 border border-gray-200 text-center">
              {{ app.userName }}
            </td>
            <td class="p-3 border border-gray-200 text-center">
              {{ app.deptName || "-" }}
            </td>
            <td class="p-3 border border-gray-200 text-center">
              {{ app.scheduleType }}
            </td>
            <td class="p-3 border border-gray-200">{{ app.reason }}</td>
            <td class="p-3 border border-gray-200 text-center">
              {{ formatDate(app.createdAt) }}
            </td>
            <td class="p-3 border border-gray-200 text-center">
              {{ app.status }}
            </td>
            <td class="p-3 border border-gray-200 text-center">
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
    </WhiteBox>

    <!-- 확인 모달 -->
    <ApprovalModal
      :show="modalState.open"
      :message="modalState.msg"
      @approve="modalState.onOk && modalState.onOk()"
      @reject="modalState.open=false"
      @click = "close"
    />
  </div>
</template>

<style scoped>
/* 승인 버튼 */
.btn-approve {
  background-color: #007bff; /* 파란색 */
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 6px;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-approve:hover:enabled {
  background-color: #0056b3;
  transform: scale(1.05);
}

.btn-approve:disabled {
  background-color: #b0c4de;
  cursor: not-allowed;
}

/* 거부 버튼 */
.btn-reject {
  background-color: #ff4d4f; /* 빨간색 */
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-reject:hover:enabled {
  background-color: #d9363e;
  transform: scale(1.05);
}

.btn-reject:disabled {
  background-color: #f5a3a5;
  cursor: not-allowed;
}
</style>
