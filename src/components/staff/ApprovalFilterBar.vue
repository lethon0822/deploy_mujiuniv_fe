<script setup>
import { reactive, watch } from "vue";
import { getList } from "@/services/Application";

const props = defineProps({
  state: Boolean,
  departments: Array,
  semester: String,
});

let today = new Date();
let year = today.getFullYear();

const filters = reactive({
  year: "",
  semester: "",
  departmentName: "",
  approvalState: "",
  keyword: "",
});

filters.year = year;

</script>

<template>
  <div class="filter-bar">
    <div class="filter-group">
      <label>연도</label>
      <template v-if="enroll">
        <div class="number-input-wrapper">
          <input
            type="number"
            v-model="filters.year"
            class="number-input"
            disabled
            readonly
          />
        </div>
      </template>

      <template v-else>
        <div class="number-input-wrapper">
          <input
            type="number"
            :min="year - 5"
            :max="year"
            step="1"
            v-model="filters.year"
            class="number-input"
            readonly
          />
          <div class="spinner-buttons">
            <button
              type="button"
              class="spinner-btn spinner-up"
              @click="filters.year = Math.min(filters.year + 1, year)"
            >
              ▲
            </button>
            <button
              type="button"
              class="spinner-btn spinner-down"
              @click="filters.year = Math.max(filters.year - 1, year - 5)"
            >
              ▼
            </button>
          </div>
        </div>
      </template>
    </div>

    <div class="filter-group">
      <label>학기</label>
      <select
        v-model="filters.semester"
        class="select-input"
        :disabled="props.semester"
      >
        <template v-if="props.semester">
          <option :value="props.semester">{{ props.semester }}학기</option>
        </template>
        <template v-else>
          <option value="">전체</option>
          <option value="1">1학기</option>
          <option value="2">2학기</option>
        </template>
      </select>
    </div>

    <div class="filter-group">
      <label>학과</label>
      <select
        v-model="filters.departmentName"
        class="select-input"
        :disabled="props.departmentName"
      >
        <template v-if="props.departmentName">
          <option :value="props.departmentName">{{ props.departmentName }}</option>
        </template>
        <template v-else>
          <option value="">전체</option>
        </template>
      </select>
    </div>

    <div class="filter-group">
      <label>접수여부</label>
      <select
        v-model="filters.approvalState"
        class="select-input"
        :disabled="props.approvalState"
      >
        <template v-if="props.approvalState">
          <option :value="props.approvalState">{{ props.approvalState }}</option>
        </template>
        <template v-else>
          <option value="">전체</option>
          <option value="1">처리중</option>
          <option value="2">승인</option>
          <option value="3">거부</option>
        </template>
      </select>
    </div>

    <div class="filter-group keyword-wrapper">
      <label>이름</label>
      <input
        type="text"
        v-model="filters.keyword"
        placeholder="이름을 입력하세요"
        class="text-input"
      />
      <button @click="onSearch" class="btn btn-success">조회</button>
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
  border: 0.2 solid #74747480;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
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
  gap: 10px;
  white-space: auto;
}

.keyword-wrapper .text-input {
  max-width: 300px;
  width: 100%;
  min-width: 150px;
}
.keyword-wrapper .btn {
  white-space: nowrap;
  flex-shrink: 0;
}

.select-input,
.number-input,
.text-input {
  height: 36px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #2d3748;
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
</style>
