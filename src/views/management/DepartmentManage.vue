<script setup>
import { reactive, onMounted, watch } from "vue";
import { deptGet, deptPost } from "@/services/DeptManageService";
import DeptUpdateModal from "@/components/management/DeptUpdateModal.vue";
import YnModal from "@/components/common/YnModal.vue";
import Confirm from "@/components/common/Confirm.vue";
import noDataImg from "@/assets/find.png";
import { createDeptCode } from "@/services/DeptManageService";

const state = reactive({
  form: {
    deptName: "",
    deptOffice: "",
    deptTel: "",
    deptMaxStd: 300,
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
  isMobile: false,
  isSearched: false,
  visibleDeptList: [],

  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  showConfirmModal: false,
});

const deptList = async (params = { keyword: "", status: "" }) => {
  const res = await deptGet(params);
  console.log(res);
  state.deptList = res.data.result;

  if (state.isMobile && !state.isSearched) {
    state.visibleDeptList = state.deptList.slice(0, 5);
  } else {
    state.visibleDeptList = state.deptList;
  }
};

const searchDept = async () => {
  state.isSearched = true;
  await deptList(state.search);
  if (state.isMobile) {
    state.visibleDeptList = state.deptList.slice(0, 5);
  } else {
    state.visibleDeptList = state.deptList;
  }
};

onMounted(async () => {
  const handleResize = () => {
    state.isMobile = window.innerWidth <= 767;

    if (state.isMobile && !state.isSearched) {
      state.visibleDeptList = state.deptList.slice(0, 5);
    } else {
      state.visibleDeptList = state.deptList;
    }
  };

  handleResize();
  window.addEventListener("resize", handleResize);
  state.isSearched = false;
  await deptList();
});

//학과코드 생성
const createCode = async() =>{
  const res = await createDeptCode();
  state.form.deptCode = res.data.result

}

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
      state.errors.deptName =
        state.form.deptName.trim() === "" ? "학과명은 필수 항목입니다." : null;
      break;
    case "deptOffice":
      state.errors.deptOffice =
        state.form.deptOffice.trim() === ""
          ? "학과 사무실은 필수 항목입니다."
          : null;
      break;
    case "headProfId":
      // 학과장은 선택사항이므로 항상 null (에러 없음)
      state.errors.headProfId = null;
      break;
  }
};

Object.keys(state.form).forEach((field) => {
  watch(
    () => state.form[field],
    () => regex(field)
  );
});

const newDept = () => {
  Object.keys(state.form).forEach((field) => {
    regex(field);
  });

  const errorEntries = Object.entries(state.errors);
  const hasErrors = errorEntries.some(([key, value]) => {
    const isError = value !== null && value !== "" && value !== undefined;
    console.log(`${key}: ${value} → ${isError ? "에러" : "정상"}`);
    return isError;
  });

  // console.log("전체 에러 존재 여부:", hasErrors);

  if (hasErrors) {
    state.ynModalMessage = "입력값을 확인해주세요.";
    state.ynModalType = "warning";
    state.showYnModal = true;
    state.showConfirmModal = false;
    return;
  }

  state.showConfirmModal = true;
  // state.showYnModal = false;
};

const handleConfirm = async () => {
  state.showConfirmModal = false;
  try {
    const res = await deptPost(state.form);
    state.ynModalMessage = "학과가 성공적으로 개설되었습니다.";
    state.ynModalType = "success";
    state.showYnModal = true;
    await deptList();
  } catch (err) {
    console.error(err);
    state.ynModalMessage = "학과 개설 중 오류가 발생했습니다.";
    state.ynModalType = "error";
    state.showYnModal = true;
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

  <div class="container">
    <div class="header-card">
      <h1>학과관리</h1>
      <p>학과를 개설하고 수정 및 폐지 처리 할 수 있습니다.</p>
      <div class="dept-form-container">
        <form @submit.prevent="newDept">
          <div class="dept-form-grid">
            <div class="tab">
              <label for="deptCode" class="form-label"><b>학과코드</b></label>
              <div class="d-flex create-code">
                <input
                  type="text"
                  id="deptCode"
                  maxlength="4"
                  class="form-control"
                  v-model="state.form.deptCode"
                  disabled
                />
                <button type="button" class="btn btn-light" @click="createCode">코드 생성</button>
              </div>
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

            <!-- <div class="tab">
              <label for="headProfId" class="form-label"><b>학과장명</b></label>
              <input
                type="text"
                id="headProfId"
                class="form-control"
                v-model="state.form.headProfId"
              />
            </div> -->

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
              <label for="deptTel" class="form-label"
                ><b>학과 전화번호</b></label
              >
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
              <label for="deptMaxStd" class="form-label"
                ><b>학과 정원</b></label
              >
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

          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-large">
              <i class="bi bi-plus-circle"></i>학과개설
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="table-container">
      <div class="filter-bar">
        <div class="filter-input-group">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="state.search.keyword"
              class="search-input"
              type="text"
              placeholder="학과명을 입력하세요"
              @keyup.enter="searchDept"
            />
          </div>

          <div class="filter-wrapper">
            <i class="bi bi-funnel filter-icon"></i>
            <select
              name="filter"
              class="filter-select"
              v-model="state.search.status"
            >
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
            <i class="bi bi-search"></i>
            조회
          </button>
        </div>
      </div>

      <div class="table-wrapper desktop-view">
        <table v-if="state.visibleDeptList.length > 0">
          <thead>
            <tr>
              <th class="dept-code">학과코드</th>
              <th class="dept-name">학과명</th>
              <th class="dept-office">학과사무실</th>
              <th class="dept-head">학과장명</th>
              <th class="dept-tel">학과 전화번호</th>
              <th class="dept-max">정원</th>
              <th class="dept-people">인원</th>
              <th class="dept-status">상태</th>
              <th class="dept-btn">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in state.visibleDeptList" :key="item.deptId">
              <td class="dept-code">{{ item.deptCode }}</td>
              <td class="dept-name">{{ item.deptName }}</td>
              <td class="dept-office">{{ item.deptOffice }}</td>
              <td class="dept-head">
                {{ item.userName === null ? "-" : item.userName }}
              </td>
              <td class="dept-tel">{{ item.deptTel }}</td>
              <td class="dept-max">
                <span class="remaining-count">{{ item.deptMaxStd }}</span>
              </td>
              <td class="dept-people">
                <span class="remaining-count">{{ item.deptPeople }}</span>
              </td>
              <td
                class="dept-status"
                :class="item.status === '0' ? 'red' : 'blue'"
              >
                {{ item.status === "1" ? "운영중" : "폐지" }}
              </td>
              <td class="dept-btn">
                <template v-if="item.status === '1'">
                  <button
                    class="btn btn-primary btn-small"
                    @click="modal(item)"
                  >
                    정보수정
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
          <p>검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>

    <div class="mobile-view">
      <div v-if="state.visibleDeptList.length === 0" class="empty-state">
        <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
        <p>검색 결과가 없습니다.</p>
      </div>

      <div
        v-else
        v-for="item in state.visibleDeptList"
        :key="item.deptId"
        class="mobile-card"
      >
        <div class="course-header">
          <div class="course-code">{{ item.deptCode }}</div>
          <div
            class="course-status"
            :class="item.status === '0' ? 'red' : 'blue'"
          >
            {{ item.status === "1" ? "운영중" : "폐지" }}
          </div>
        </div>

        <div class="course-title">
          {{ item.deptName }}
        </div>

        <div class="course-info">
          <div class="info-row">
            <div class="info-cell me-4">
              <span class="label">사무실:</span>
              <span>{{ item.deptOffice }}</span>
            </div>
            <div class="info-cell">
              <span class="label">학과장:</span>
              <span>{{ item.userName === null ? "-" : item.userName }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-cell me-4">
              <span class="label">전화번호:</span>
              <span>{{ item.deptTel }}</span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-cell me-4">
              <span class="label">정원:</span>
              <span class="remaining-count">{{ item.deptMaxStd }}</span>
            </div>
            <div class="info-cell">
              <span class="label">인원:</span>
              <span class="remaining-count">{{ item.deptPeople }}</span>
            </div>
          </div>
        </div>

        <div class="course-actions" v-if="item.status === '1'">
          <button class="btn btn-primary btn-medium" @click="modal(item)">
            수정
          </button>
        </div>
      </div>
    </div>
  </div>

  <YnModal
    v-if="state.showYnModal"
    :content="state.ynModalMessage"
    :type="state.ynModalType"
    @close="state.showYnModal = false"
  />
  <Confirm
    v-if="state.showConfirmModal"
    :show="state.showConfirmModal"
    :content ="'학과를 개설 하시겠습니까?'"
    :type="'warning'"
    @confirm="handleConfirm"
    @cancel="state.showConfirmModal = false"
  />
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 0;
  box-sizing: border-box;
}

.header-card {
  position: relative;
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
}

.header-card h1 {
  font-size: 22px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
}

.header-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
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

.line {
  margin-bottom: 10px;
}

.dept-form-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.tab {
  padding: 10px;
}

.form-label {
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
  color: #374151;
}

.create-code{
  gap: 10px;
}

.create-code > input{
  background-color: #f3f3f3;
}

.create-code > button{
  width: 100px;
  border: 1px solid #c6c8cc;
}

label {
  font-weight: 700;
}

input,
select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 14px;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

input:focus,
select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input::placeholder {
  color: #9ca3af;
}


.error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 버튼 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px; /* 아이콘과 텍스트 간격 */
}

.btn-small {
  height: 32px;
  min-width: 80px;
  font-size: 12px;
}

.btn-medium {
  height: 36px;
  min-width: 100px;
  font-size: 13px;
}

.btn-large {
  height: 44px;
  min-width: 120px;
  font-size: 14px;
}

.btn-primary {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2a5c74;
}

.btn-primary:active {
  background-color: #204658;
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

/* 필터바 */
.filter-bar {
  padding: 5px 0;
  margin-bottom: 20px;
}

.filter-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 5px 40px !important;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input:focus {
  border-color: #cbd5e1;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #94a3b8;
}

.filter-wrapper {
  position: relative;
  min-width: 150px;
}

.filter-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
  z-index: 1;
}

.filter-select {
  height: 36px;
  font-size: 13px;
  padding: 3px 0px 0px 45px;
  color: #777;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  transition: all 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  min-width: 80px;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
  outline: none;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.table-wrapper {
  display: block;
  max-height: 345px;
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

/* 컬럼별 너비 설정 */
th.dept-code,
td.dept-code {
  width: 10%;
}
th.dept-name,
td.dept-name {
  width: 15%;
}
th.dept-office,
td.dept-office {
  width: 15%;
}
th.dept-head,
td.dept-head {
  width: 12%;
}
th.dept-tel,
td.dept-tel {
  width: 15%;
}
th.dept-max,
td.dept-max {
  width: 8%;
}
th.dept-people,
td.dept-people {
  width: 8%;
}
th.dept-status,
td.dept-status {
  width: 8%;
}
th.dept-btn,
td.dept-btn {
  width: 9%;
}

/* 상태 색상 */
.red {
  color: #d61421;
  font-weight: 600;
}

.blue {
  color: #2460ce;
  font-weight: 700;
}

.mobile-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 20px;
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
}

.mobile-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-code {
  font-size: 12px;
  color: #343a40;
  font-weight: 500;
}

.course-status {
  font-size: 12px;
  font-weight: 600;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.course-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-cell {
  flex: 1 1 45%;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 12px;
  color: #4a5568;
  font-weight: 600;
  margin-right: 8px;
}

.course-info span:not(.label) {
  font-size: 14px;
}

.course-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .table-container {
    margin: auto auto 10px auto !important;
    width: 100%;
    position: static;
    transform: none;
    box-shadow: none;
  }

  .dept-form-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .tab {
    padding: 6px;
  }

  .filter-bar {
    padding: 15px 0;
  }

  .filter-input-group {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .search-wrapper,
  .filter-wrapper {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }

  .btn-success {
    width: 100%;
    margin-top: 5px;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
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

  .btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .form-actions {
    margin-top: 15px;
  }

  input,
  select {
    padding: 8px 32px 8px 12px;
    font-size: 14px;
  }

  .error {
    font-size: 11px;
  }

  .btn-success,
  .btn-primary {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .table-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 20px 20px 0 20px;
    max-width: none;
    margin: 0;
  }

  .dept-form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tab {
    padding: 8px;
  }

  .filter-bar {
    padding: 20px 0;
  }

  .filter-input-group {
    justify-content: center;
    gap: 15px;
  }

  .body-line {
    height: 240px;
  }

  th.dept-code,
  td.dept-code {
    width: 8%;
  }
  th.dept-name,
  td.dept-name {
    width: 12%;
  }
  th.dept-office,
  td.dept-office {
    width: 12%;
  }
  th.dept-head,
  td.dept-head {
    width: 10%;
  }
  th.dept-tel,
  td.dept-tel {
    width: 12%;
  }
  th.dept-max,
  td.dept-max {
    width: 8%;
  }
  th.dept-people,
  td.dept-people {
    width: 8%;
  }
  th.dept-status,
  td.dept-status {
    width: 8%;
  }
  th.dept-btn,
  td.dept-btn {
    width: 10%;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 30px;
  }

  .header-card {
    padding: 24px;
    margin-bottom: 24px;
  }

  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
