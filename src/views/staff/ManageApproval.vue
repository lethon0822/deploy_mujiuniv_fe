<script setup>
import { ref } from "vue";
import ApprovalFilterBar from "@/components/staff/ApprovalFilterBar.vue";
import ApprovalTable from "@/components/staff/ApprovalTable.vue";

const filters = ref({});

function onSearch(newFilters) {
  filters.value = newFilters; // 테이블로 내려줌
}
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">학적 및 인사 관리</h1>
      <p>학적 및 인사 변동 신청을 조회하고 승인·반려 할 수 있습니다.</p>
      <div class="filter-section">
        <ApprovalFilterBar @search="onSearch" />
      </div>
    </div>

    <ApprovalTable :filters="filters" />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
}

.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
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

.filter-section {
  margin-top: 16px;
}

.filter-section :deep(.filter-bar),
.filter-section :deep(.academic-filter-bar) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
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

  .header-card h1 {
    font-size: 22px;
  }

  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
