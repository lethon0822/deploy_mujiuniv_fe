<script setup>
import { reactive, ref } from "vue";

const state = reactive({
  approvalList: [
    // 더미데이터
    {
      id: 1,
      year: 2025,
      semester: 1,
      userName: "김연주",
      departmentName: "컴퓨터공학과",
      approval: "휴직",
      reason: "과목 변경",
      approvalDate: "2025-08-29",
      checkDate: "2025-08-30",
      approvalState: "처리중",
    },
    {
      id: 2,
      year: 2025,
      semester: 1,
      userName: "이민호",
      departmentName: "전자공학과",
      approval: "휴학",
      reason: "개인사유",
      approvalDate: "2025-08-28",
      checkDate: "2025-08-29",
      approvalState: "승인",
    },
  ],
});

// 모달 상태
const showModal = ref(false);
const selectedApproval = ref(null);

// 처리하기 버튼 클릭
function openModal(approval) {
  selectedApproval.value = approval;
  showModal.value = true;
}
</script>

<template>
  <div class="table-container">
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="year">연도</th>
            <th class="semester">학기</th>
            <th class="userName">이름</th>
            <th class="departmentName">학과</th>
            <th class="approval">신청구분</th>
            <th class="reason">변동사유</th>
            <th class="approvalDate">신청일자</th>
            <th class="checkDate">접수일자</th>
            <th class="approvalState">처리여부</th>
            <th class="button">　</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="approval in state.approvalList" :key="approval.id">
            <td class="year">{{ approval.year }}년</td>
            <td class="semester">{{ approval.semester }}학기</td>
            <td class="userName">{{ approval.userName }}</td>
            <td class="departmentName">{{ approval.departmentName }}</td>
            <td class="approval">{{ approval.approval }}</td>
            <td class="reason">{{ approval.reason }}</td>
            <td class="approvalDate">{{ approval.approvalDate }}</td>
            <td class="checkDate">{{ approval.checkDate }}</td>
            <td class="approvalState">{{ approval.approvalState }}</td>
            <td>
              <!-- 승인/거부가 아니면 버튼 표시 -->
              <button
                v-if="
                  approval.approvalState !== '승인' &&
                  approval.approvalState !== '거부'
                "
                @click="openModal(approval)"
                class="red"
              >
                처리하기
              </button>

              <button class="not-pointer gray" v-else>처리완료</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  margin: 20px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1430px;
  min-width: 1350px;
  border: 0.2 solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #cdcdcd #f0f0f0;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  table-layout: auto;
}

thead {
  color: #333;
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
  text-align: center;
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
  padding: 8px 4px;
  border-right: none;
  font-size: 13px;
}
thead th,
tbody td {
  color: #343a40;
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

.not-pointer {
  cursor: auto;
}

.setting {
  padding-top: 2px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  justify-content: center;
}
.red {
  background-color: #d61421;
  font-weight: 600;
}
.gray {
  background-color: #666;
  font-weight: 600;
}
.blue {
  background-color: #2460ce;
  font-weight: 700;
}

.status {
  width: 120px;
}
.button {
  width: 150px;
}

th.year,
td.year,
th.semester,
td.semester,
th.name,
td.name,
th.approval,
td.approval,
th.professor,
td.professor {
  width: 130px;
  text-align: center;
}

th.departmentName,
td.departmentName {
  width: 150px;
  text-align: center;
}
</style>
