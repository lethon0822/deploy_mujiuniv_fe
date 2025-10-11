<script setup>
import { reactive, onMounted, watch } from "vue";
import { useUserStore } from "@/stores/account";
import { deptNameGet } from "@/services/DeptManageService";
const emit = defineEmits(["search"]);

const userStore = useUserStore();
const props = defineProps({
  state: Boolean,
});

const data = reactive({
  department:[],
  semester:[]
})

const filters = reactive({
  type: "",
  keyword: "",
  deptId: "",
  sid: userStore.state.signedUser.semesterId
});

onMounted(async() =>{
  const res = await deptNameGet();
  data.department = res.data

  onSearch(); // 최초 1회 자동 조회 
})

const onSearch = () => {
  emit("search", { ...filters });
};

watch(
  () => [  filters.type, filters.deptId, filters.keyword],
  () => {
    onSearch();
  }
);

// 이수 구분이 교양이면 학과 조건 안 넘어가도록 deptId 널처리 
watch(
  () => filters.type,
  (newVal) => {
    if (newVal === "교양") {
      filters.deptId = "";
    } 
  }
);
</script>

<template>
  <div class="filter-bar">
    <!-- 이수구분 -->
    <div v-if="props.state" class="filter-group">
      <label>이수구분</label>
      <select v-model="filters.type" class="select-input">
        <option value="">전체</option>
        <option value="전공필수">전공필수</option>
        <option value="전공선택">전공선택</option>
        <option value="교양필수">교양필수</option>
        <option value="교양선택">교양선택</option>
      </select>
    </div>
    
    <div class="filter-group">
      <label>학과</label>
      <select
        v-model="filters.deptId"
        :disabled="filters.type === '교양필수' || filters.type === '교양선택'"
        class="select-input wide"
      >

        <option value="">
          {{ filters.type === '교양필수'|| filters.type === '교양선택' ? '교양학부' : '전체' }}
        </option>

        <template v-if="filters.type !== '교양필수' && filters.type !== '교양선택'">
          <option
            v-for="d in data.department"
            :key="d.deptId"
            :value="d.deptId"
          >
            {{ d.deptName }}
          </option>
        </template>
      </select>
    </div>

    <!-- 교과목명 -->
    <div class="filter-group keyword-wrapper">
      <label>교과목명</label>
      <input
        type="text"
        v-model="filters.keyword"
        placeholder="교과목명을 입력하세요"
        class="text-input"
      />
      <button @click="onSearch" class="btn btn-success">
        <i class="bi bi-search"></i>조회
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 6px 29px;
  background-color: #fff;
  border-radius: 8px;
  flex-wrap: wrap;
  margin-left: 75px;
  margin-right: 73px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.filter-bar label {
  font-size: 15px;
  font-weight: bold;
  color: #2d3748;
  min-width: max-content;
}

.keyword-wrapper {
  flex-grow: 1;
  gap: 12px;
  white-space: auto;
}

.keyword-wrapper .text-input {
  max-width: 300px;
  width: 100%;
  min-width: 150px;
}
.keyword-wrapper .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px; /* 아이콘과 텍스트 간격 */
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

.select-input,
.number-input,
.text-input {
  height: 36px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #777;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
}

.select-input:focus,
.number-input:focus,
.text-input:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.select-input:hover,
.number-input:hover,
.text-input:hover {
  border-color: #cbd5e1;
}

.select-input {
  min-width: 80px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}

.select-input.wide {
  min-width: 120px;
}

.number-input-wrapper {
  position: relative;
  display: inline-block;
}

.number-input {
  width: 90px;
  text-align: center;
  padding-right: 30px;
}

.spinner-buttons {
  position: absolute;
  right: 2px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  height: 30px;
}

.spinner-btn {
  width: 18px;
  height: 15px;
  border: none;
  background-color: #fff;
  color: #718096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  line-height: 1;
  padding: 0;
  margin: 0;
  border-radius: 3px;
  transition: all 0.15s ease;
}

.spinner-btn:hover {
  background-color: #edf2f7;
  color: #4a5568;
}

.spinner-btn:active {
  background-color: #e2e8f0;
}

.spinner-up {
  border-bottom: 1px solid #e2e8f0;
  border-radius: 3px 3px 0 0;
}

.spinner-down {
  border-radius: 0 0 3px 3px;
}

.text-input {
  min-width: 200px;
}

.text-input::placeholder {
  color: #a0aec0;
}

.select-input:disabled,
.number-input:disabled {
  background-color: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
  border-color: #e2e8f0;
}

.select-input:disabled {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
}

/* 기본 스피너 숨기기 */
.number-input::-webkit-inner-spin-button,
.number-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input[type="number"] {
  -moz-appearance: textfield;
}

/* 모바일 */
@media (max-width: 767px) {
  .filter-bar {
    flex-direction: column;
    gap: 18px;
    padding: 18px;
    margin-left: 0;
    margin-right: 0;
  }

  .filter-group {
    width: 100%;
    justify-content: space-between;
  }

  .filter-bar label {
    font-size: 14px;
    min-width: 70px;
    flex-shrink: 0;
  }

  .select-input,
  .number-input,
  .text-input {
    height: 34px;
    font-size: 13px;
  }

  .select-input {
    min-width: 110px;
    flex-grow: 1;
  }

  .select-input.wide {
    min-width: 110px;
  }

  .number-input {
    width: 85px;
  }

  .text-input {
    min-width: 150px;
    flex-grow: 1;
  }

  .keyword-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .keyword-wrapper .text-input {
    max-width: none;
    min-width: auto;
  }

  .keyword-wrapper .btn {
    width: 100%;
    height: 38px;
  }

  .filter-bar .filter-group:nth-child(1) {
    display: none;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .filter-bar {
    gap: 10px;
    padding: 8px 20px;
    margin-left: 20px;
    margin-right: 20px;
  }

  .filter-bar label {
    font-size: 14px;
  }

  .select-input,
  .number-input,
  .text-input {
    height: 34px;
    font-size: 13px;
  }

  .keyword-wrapper .text-input {
    max-width: 250px;
    min-width: 120px;
  }

  .year-filter,
  .semester-filter {
    display: none !important;
  }
}

/* PC  */
@media all and (min-width: 1024px) {
  .filter-bar {
    gap: 25px;
    margin-left: 75px;
    margin-right: 73px;
  }

  .keyword-wrapper .text-input {
    max-width: 300px;
    min-width: 150px;
  }
}
</style>
