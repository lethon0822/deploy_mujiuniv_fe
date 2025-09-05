<script setup>
import ApprovalFilterBar from "@/components/staff/ApprovalFilterBar.vue";
import ApprovalTable from "@/components/staff/ApprovalTable.vue";
</script>

<template>
  <!-- 페이지 -->
  <div class="page">
    <h1 class="page-title">신분변동관리</h1>
  </div>

  <ApprovalFilterBar></ApprovalFilterBar>
  <ApprovalTable></ApprovalTable>
</template>

<style scoped>
/* 페이지 */
.page {
  padding: 16px 24px 48px;
}
.page-title {
  font-size: 22px;
  font-weight: 600px;
  margin: 8px 0 -100px;
}

.profile-wrapper {
  display: flex;
  gap: 180px;
  align-items: flex-start;
}
</style>
