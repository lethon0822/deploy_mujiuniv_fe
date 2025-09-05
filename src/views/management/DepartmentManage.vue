<script setup>
import whiteBox from "@/components/common/WhiteBox.vue";
import { reactive, onMounted, watch } from "vue";
import { deptGet, deptPost } from "@/services/DeptManageService";
import DeptUpdateModal from "@/components/management/DeptUpdateModal.vue";

const state = reactive({
  form: {
    deptName: "",
    headProfId: 0,
    deptOffice: "",
    deptTel: "",
    deptMaxStd: 0,
    deptCode: "",
  },
  errors: {
    deptName: null,
    headProfId: null,
    deptOffice: null,
    deptTel: null,
    deptMaxStd: null,
    deptCode: null,
  },
  deptList: [],
  search: {
    keyword: "",
    status: "",
  },
  showModal: false,
  selectItem: null,
});

const deptList = async (params) => {
  const res = await deptGet(params);
  console.log("알이에수", res);

  state.deptList = res.data;
  console.log("list", state.deptList);
};

const searchDept = async () => {
  deptList(state.search);
};

onMounted(async () => {
  deptList();
});

const regex = (data) => {
  switch (data) {
    case "deptCode":
      const codePattern = /^[A-Z]{4}$/;
      state.errors.deptCode = codePattern.test(state.form.deptCode)
        ? null
        : "학과코드는 영어 대문자 4자로 구성되어야 합니다.";
      break;
    case "deptTel":
      const telPattern = /^\d{2,3}-\d{3,4}-\d{4}$/;
      state.errors.deptTel =
        state.form.deptTel && !telPattern.test(state.form.deptTel)
          ? "전화번호 형식이 올바르지 않습니다 (예: 02-123-4567)."
          : null;
      break;
    case "deptMaxStd":
      const capacity = Number(state.form.deptMaxStd);
      state.errors.deptMaxStd =
        isNaN(capacity) || capacity < 300 || capacity >= 500
          ? "학과 정원은 300명 이상 500명 미만이어야 합니다."
          : null;
      break;
    case "deptName":
      state.errors.deptName = state.form.deptName
        ? null
        : "학과명은 필수 항목입니다.";
      break;
    case "deptOffice":
      state.errors.deptOffice = state.form.deptOffice
        ? null
        : "학과 사무실은 필수 항목입니다.";
      break;
  }
};

Object.keys(state.form).forEach((field) => {
  watch(
    () => state.form[field],
    () => regex(field)
  );
});

const newDept = async () => {
  // 제출 전 전체 필드 검증
  Object.keys(state.form).forEach((field) => regex(field));

  // 2. 에러가 있으면 제출 중단
  if (Object.values(state.errors).some((e) => e)) {
    alert("입력값을 확인해주세요.");
    return;
  }

  // 3. 사용자 확인
  if (!confirm("학과를 개설 하시겠습니까?")) return;

  // 4. 학과장 ID가 0이면 null 처리
  if (state.form.headProfId === 0) {
    state.form.headProfId = null;
  }

  try {
    const res = await deptPost(state.form);
    console.log(res);
    // 필요 시 리스트 갱신
    deptList();
    alert("학과가 성공적으로 개설되었습니다.");
  } catch (err) {
    console.error("학과 개설 중 에러:", err);
    alert("학과 개설 중 오류가 발생했습니다.");
  }
};

const modal = (item) => {
  state.selectItem = item;
  state.showModal = true;
};

const closeModal = () => {
  state.showModal = false;
  deptList();
};
</script>

<template>
  <template v-if="state.showModal === true">
    <DeptUpdateModal @close="closeModal" :dept="state.selectItem" />
  </template>
  <whiteBox :title="'학과관리'" class="white1">
    <div class="dept-form-container">
      <form @submit.prevent="newDept">
        <div class="dept-form-grid">
          <div class="tab">
            <label for="deptCode" class="form-label"><b>학과코드</b></label>
            <input
              type="text"
              id="deptCode"
              maxlength="4"
              class="form-control"
              v-model="state.form.deptCode"
            />
            <span class="error" v-if="state.errors.deptCode">{{
              state.errors.deptCode
            }}</span>
          </div>

          <div class="tab">
            <label for="deptName" class="form-label"><b>학과명</b></label>
            <input
              type="text"
              id="deptName"
              class="form-control"
              v-model="state.form.deptName"
            />
            <span class="error" v-if="state.errors.deptName">{{
              state.errors.deptName
            }}</span>
          </div>

          <div class="tab">
            <label for="headProfId" class="form-label"><b>학과장명</b></label>
            <input
              type="text"
              id="headProfId"
              class="form-control"
              v-model="state.form.headProfId"
            />
          </div>

          <div class="tab">
            <label for="deptOffice" class="form-label"
              ><b>학과 사무실</b></label
            >
            <input
              type="text"
              id="deptOffice"
              class="form-control"
              v-model="state.form.deptOffice"
            />
            <span class="error" v-if="state.errors.deptOffice">{{
              state.errors.deptOffice
            }}</span>
          </div>

          <div class="tab">
            <label for="deptTel" class="form-label"><b>학과 전화번호</b></label>
            <input
              type="text"
              class="form-control"
              v-model="state.form.deptTel"
              @input="
                state.form.deptTel = state.form.deptTel
                  .replace(/\D/g, '') // 숫자만 남기기
                  .replace(
                    /^(\d{0,2})(\d{0,3})(\d{0,4}).*/,
                    (_, p1, p2, p3) => {
                      return [p1, p2, p3].filter(Boolean).join('-');
                    }
                  )
              "
            />
            <span class="error" v-if="state.errors.deptTel">{{
              state.errors.deptTel
            }}</span>
          </div>

          <div class="tab">
            <label for="deptMaxStd" class="form-label"><b>학과 정원</b></label>
            <input
              type="text"
              id="deptMaxStd"
              class="form-control"
              v-model="state.form.deptMaxStd"
            />
            <span class="error" v-if="state.errors.deptMaxStd">{{
              state.errors.deptMaxStd
            }}</span>
          </div>
        </div>

        <!-- 버튼은 grid 바깥 -->
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">학과개설</button>
        </div>
      </form>
    </div>
  </whiteBox>

  <whiteBox class="white2">
    <div class="d-flex filter-bar">
      <div class="cover d-flex">
        <div class="search">
          <i class="bi bi-search"></i>
        </div>
        <input
          type="text"
          placeholder="학과명을 입력하세요"
          v-model="state.search.keyword"
        />
      </div>
      <div class="cover d-flex">
        <div class="search">
          <i class="bi bi-funnel"></i>
        </div>
        <select name="filter" class="filter" v-model="state.search.status">
          <option value="">상태/전체</option>
          <option value="1">운영중</option>
          <option value="0">폐지</option>
        </select>
      </div>
      <button
        class="btn btn-success"
        @click="searchDept"
        @keyup.enter="searchDept"
      >
        조회
      </button>
    </div>
    <!-- 학과목록 -->
    <div class="container">
      <div class="table-wrapper">
        <div class="title-line">
          <table class="dept-table">
            <thead>
              <tr>
                <th class="dept-code">학과코드</th>
                <th class="dept-name">학과</th>
                <th class="dept-office">학과사무실</th>
                <th class="dept-head">학과장명</th>
                <th class="dept-tel">학과 전화번호</th>
                <th class="dept-max">학과 정원</th>
                <th class="dept-people">학과 인원</th>
                <th class="dept-status">상태</th>
                <th class="dept-btn">
                  <span v-for="n in 10" :key="n">&nbsp;</span>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="body-line">
          <table class="dept-table">
            <tbody>
              <tr
                v-for="item in state.deptList"
                :key="item.deptId"
                class="tr-line"
              >
                <td>{{ item.deptCode }}</td>
                <td>{{ item.deptName }}</td>
                <td>{{ item.deptOffice }}</td>
                <td>{{ item.userName === null ? "-" : item.userName }}</td>
                <td>{{ item.deptTel }}</td>
                <td>{{ item.deptMaxStd }}</td>
                <td>{{ item.deptPeople }}</td>
                <td :class="item.status === '0' ? 'not-do' : 'do'">
                  {{ item.status === "1" ? "운영중" : "폐지" }}
                </td>
                <td class="btn-td">
                  <template v-if="item.status === '1'">
                    <button class="btn btn-primary" @click="modal(item)">
                      수정
                    </button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </whiteBox>
</template>

<style scoped>
.white-box {
  min-height: auto;
  min-width: 1270px;
  width: 1550px;
  margin-top: 20px;
}
.line {
  margin-bottom: 10px;
}

.dept-form-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3열 */
  gap: 15px;
}

.tab {
  padding: 10px;
}
.form-label {
  font-weight: 500;
}

label {
  font-weight: 700;
}

input {
  border-radius: 10px;
  background-color: #f8f9fa;
  border: 2px solid #e5e7eb;
}

.error {
  color: red;
  font-size: 0.8rem;
  margin-left: 4px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.white2 {
  max-height: 400px;
}

.filter-bar {
  gap: 20px;
  justify-content: end;
  margin-bottom: 10px;
}

.cover {
  padding: 5px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background-color: #f8f9fa;
}

.cover input {
  border: none;
  border-radius: 0;
  color: #7b7b7b;
  outline: none;
}

.cover input::placeholder {
  color: #9e9e9e;
}

.cover select {
  width: 150px;
  border: none;
  outline: none;
  color: #7b7b7b;
}

.bi-search {
  color: #7b7b7b;
}

.search {
  width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter {
  border-radius: 10px;
  background-color: #f8f9fa;
  border: 2px solid #e5e7eb;
}

/* 학과 목록 표 */

.container {
  min-height: auto;
  min-width: 1430px;
  height: 360px;
}

/* 가로 스크롤 가능 */
/* 컨테이너 높이 조절 */
/* .table-wrapper {
  max-height: 360px; 
} */

/* 테이블 레이아웃 고정 */

.dept-table {
  width: 100%;
  border-collapse: collapse;
}

/* thead 고정 */
.title-line {
  background-color: #fff; /* 헤더 배경색 지정 */
  border-top: 2px solid #7b7b7b;
  border-bottom: 1px solid #7b7b7b;
}

.body-line {
  width: 100%;
  height: 250px;
  overflow-y: scroll;
}

.not-do {
  color: #db3619;
}

/* tbody 높이 제한 + 스크롤은 위 .table-wrapper에서 */
.dept-table th,
.dept-table td {
  padding: 12px 16px;
  text-align: center;
}

/* 행 호버 효과 */
.dept-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* 상태 색상 */
.status-processing {
  color: #e53e3e; /* 빨간색 */
  font-weight: 500;
}

.status-complete {
  color: #38a169; /* 초록색 */
  font-weight: 500;
}

/* 버튼 스타일 */

.btn-edit {
  background-color: #3182ce;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: #2b6cb0;
}

/* th */
.dept-table th.dept-code {
  width: 128px;
}
.dept-table th.dept-name {
  width: 247px;
}
.dept-table th.dept-office {
  width: 216px;
}
.dept-table th.dept-max {
  width: 95px;
}
.dept-table th.dept-people {
  width: 110px;
}

.dept-table th.dept-btn {
  width: 190px;
}
.tr-line {
  border-bottom: 1px solid #c4c4c4;
}
</style>
