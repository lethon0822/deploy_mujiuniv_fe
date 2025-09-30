<script setup>
import { ref, onMounted } from "vue";
import { fetchApplications, decideApplication } from "@/services/ApprovalService";
import WhiteBox from "@/components/common/WhiteBox.vue";
import YnModal from "@/components/common/YnModal.vue";

const applications = ref([]);
const loading = ref(false);


// 선택된 연도/학기
const year = ref(new Date().getFullYear());
const semester = ref(1); // 1학기 기본값

// 모달 상태
const modalState = ref({
  open: false,
  msg: "",
  onOk: null,
});

async function loadApplications() {
  loading.value = true;
  try {
    applications.value = await fetchApplications({
      year: year.value,
      semester: semester.value,
    });
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
        await loadApplications();
      } catch (err) {
        console.error(err);
        alert("처리 중 오류 발생");
      }
    },
  };
}

onMounted(loadApplications);
</script>

<template>
  <div>
    <h2 class="text-xl font-bold mb-4">학적 신청 승인/거부 관리</h2>

    <WhiteBox>
      <template #header>
        <div class="flex justify-between items-center w-full">
          <!-- 왼쪽: 학기 선택 -->
          <div class="flex items-center space-x-2">
            <select v-model="year" class="border rounded px-2 py-1">
              <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">
                {{ y }}년
              </option>
            </select>

            <select v-model="semester" class="border rounded px-2 py-1">
              <option :value="1">1학기</option>
              <option :value="2">2학기</option>
            </select>

            <button
              @click="loadApplications"
              class="px-3 py-1 bg-blue-500 text-white rounded">
              조회
            </button>
          </div>

          <!-- 오른쪽: 새로고침 -->
          <button
            @click="loadApplications"
            class="px-3 py-1 bg-gray-500 text-white rounded">
            새로고침
          </button>
        </div>
      </template>

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
            <td class="p-2 border text-center">{{ app.deptName }}</td>
            <td class="p-2 border text-center">{{ app.scheduleType }}</td>
            <td class="p-2 border">{{ app.reason }}</td>
            <td class="p-2 border text-center">
                {{ new Date(app.createdAt).toLocaleDateString() }}
            </td>
            <td class="p-2 border text-center">
                {{ app.status }}
            </td>
            <td class="p-2 border text-center">
                <button
                class="px-2 py-1 bg-green-500 text-white rounded mr-1 disabled:opacity-50"
                @click="openConfirm(app, '승인')"
                :disabled="app.status !== '처리중'"
                >
                승인
                </button>
                <button
                class="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
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
    <YnModal
      v-if="modalState.open"
      :message="modalState.msg"
      :show="modalState.open"
      type="confirm"
      @ok="modalState.onOk(); modalState.open = false"
      @cancel="modalState.open = false"
    />
  </div>
</template>