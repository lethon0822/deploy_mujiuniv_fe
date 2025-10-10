<script setup>
import { ref, computed } from "vue";

const allRequests = [
  {
    id: 1,
    studentName: "김지수",
    type: "학업 상담",
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isUrgent: true,
  },
  {
    id: 2,
    studentName: "이도현",
    type: "진로 상담",
    requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isUrgent: false,
  },
  {
    id: 3,
    studentName: "박서준",
    type: "대면 요청",
    requestDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
    isUrgent: false,
  },
  {
    id: 4,
    studentName: "최민지",
    type: "학업 상담",
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isUrgent: true,
  },
];

const deadlineData = [
  { id: 101, title: "연구비 정산 최종 마감", date: "10/15" },
  { id: 102, title: "논문 지도 학생 배정 신청", date: "10/05" },
  { id: 103, title: "2025년도 교내 연구 과제 접수", date: "10/30" },
];

const searchQuery = ref("");
const selectedType = ref("전체");
const selectedUrgency = ref("전체");

const formatRelativeDate = (date) => {
  const diffTime = Math.abs(new Date() - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "어제";
  return `${diffDays}일 전`;
};

const calculateDDay = (dateString) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(new Date().getFullYear() + "/" + dateString);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const filteredRequests = computed(() => {
  let filtered = allRequests;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (r) =>
        r.studentName.includes(searchQuery.value) ||
        r.type.includes(searchQuery.value)
    );
  }

  if (selectedType.value !== "전체") {
    filtered = filtered.filter((r) => r.type === selectedType.value);
  }

  if (selectedUrgency.value === "긴급") {
    filtered = filtered.filter((r) => r.isUrgent);
  } else if (selectedUrgency.value === "일반") {
    filtered = filtered.filter((r) => !r.isUrgent);
  }

  return filtered.sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
    return b.requestDate - a.requestDate;
  });
});

const processedDeadlines = computed(() => {
  return deadlineData
    .map((d) => ({ ...d, dDay: calculateDDay(d.date) }))
    .filter((d) => d.dDay >= 0)
    .sort((a, b) => a.dDay - b.dDay);
});

const totalPending = computed(() => filteredRequests.value.length);
const urgentCount = computed(
  () => filteredRequests.value.filter((r) => r.isUrgent).length
);

const counselingTypes = ["전체", "학업 상담", "진로 상담", "대면 요청"];

const goToDetail = (type, id) => {
  console.log(`${type} 항목 ID ${id} 상세 페이지로 이동`);
};
</script>

<template>
  <div class="dashboard">
    <div class="container">
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">상담 요청 현황</h2>
          <span class="count">{{ filteredRequests.length }}건</span>
        </div>

        <div class="filter-bar">
          <div class="search-input">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="학생명 또는 상담 유형 검색"
            />
          </div>

          <select v-model="selectedType" class="select select-input wide">
            <option v-for="type in counselingTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>

          <select v-model="selectedUrgency" class="select select-input">
            <option value="전체">전체</option>
            <option value="긴급">긴급</option>
            <option value="일반">일반</option>
          </select>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>상태</th>
              <th>학생명</th>
              <th>유형</th>
              <th>요청일</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in filteredRequests"
              :key="request.id"
              @click="goToDetail('counseling', request.id)"
              class="table-row"
            >
              <td>
                <span v-if="request.isUrgent" class="badge urgent">긴급</span>
                <span v-else class="badge">대기</span>
              </td>
              <td class="name">{{ request.studentName }}</td>
              <td class="type">{{ request.type }}</td>
              <td class="date">
                {{ formatRelativeDate(request.requestDate) }}
              </td>
              <td class="arrow">
                <i class="bi bi-chevron-right"></i>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredRequests.length === 0" class="empty">
          검색 결과가 없습니다
        </div>
      </section>

      <!-- 마감일 -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">연구 및 행정 마감일</h2>
          <span class="count">{{ processedDeadlines.length }}건</span>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>항목명</th>
              <th>마감일</th>
              <th>D-DAY</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="deadline in processedDeadlines"
              :key="deadline.id"
              class="table-row"
            >
              <td class="deadline-title">{{ deadline.title }}</td>
              <td class="date">{{ deadline.date }}</td>
              <td>
                <span class="dday" :class="{ urgent: deadline.dDay <= 7 }">
                  D-{{ deadline.dDay }}
                </span>
              </td>
              <td class="arrow">
                <i class="bi bi-chevron-right"></i>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="processedDeadlines.length === 0" class="empty">
          다가오는 마감일이 없습니다
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  min-height: 100vh;
  background: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 섹션 */
.section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.count {
  font-size: 13px;
  color: #666;
}

/* 필터 */
.filter-bar {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
}

.search-input {
  position: relative;
  flex-grow: 1;
  max-width: none;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
  z-index: 1;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  box-sizing: border-box;
}

.search-input input::placeholder {
  color: #777;
}

.search-input input:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.select {
  flex-shrink: 0;
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

.select:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.select:focus {
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

/* 테이블 */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #fafafa;
}

.table th {
  text-align: center;
  padding: 14px 24px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.15s;
}

.table tbody tr:hover {
  background: #fafafa;
}

.table td {
  padding: 16px 24px;
  font-size: 14px;
  color: #1a1a1a;
  text-align: center;
}

.name {
  font-weight: 500;
}

.type {
  color: #666;
}

.date {
  color: #999;
  font-size: 13px;
}

.deadline-title {
  font-weight: 500;
}

.arrow {
  color: #ccc;
  text-align: right;
  width: 40px;
}

/* 뱃지 */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #f0f0f0;
  color: #666;
}

.badge.urgent {
  background: #ffebee;
  color: #d32f2f;
}

.dday {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: #f0f0f0;
  color: #666;
}

.dday.urgent {
  background: #fff3e0;
  color: #f57c00;
}

/* 빈 상태 */
.empty {
  padding: 60px 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 반응형 */
@media (max-width: 768px) {
  .dashboard {
    padding: 20px 16px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
  }

  .select {
    width: 100%;
  }

  .table {
    font-size: 13px;
  }

  .table th,
  .table td {
    padding: 12px 16px;
  }
}
</style>
