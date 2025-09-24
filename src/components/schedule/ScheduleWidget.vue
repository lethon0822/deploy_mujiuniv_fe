<script setup>
import { ref, onMounted, computed } from "vue";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { fmt2 } from "@/services/date.js";

const today = new Date();
const y = today.getFullYear(),
  m = today.getMonth() + 1;
const items = ref([]);
const selected = ref(new Date(today)); // 새 Date 객체로 복사

onMounted(async () => {
  try {
    const { data } = await getSchedulesByMonth(y, m);
    items.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("스케줄 조회 실패:", error);
    items.value = [];
  }
});

const ymd = (d) =>
  `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
const inRange = (it, d) =>
  new Date(it.startDate) <= d && d <= new Date(it.endDate);
const todayList = computed(() =>
  (items.value || []).filter((it) => inRange(it, selected.value))
);

// 날짜 변경 함수들 - 새 Date 객체 생성
const goToPrevDay = () => {
  const newDate = new Date(selected.value);
  newDate.setDate(newDate.getDate() - 1);
  selected.value = newDate;
};

const goToNextDay = () => {
  const newDate = new Date(selected.value);
  newDate.setDate(newDate.getDate() + 1);
  selected.value = newDate;
};

// 주간 날짜 표시를 위한 computed
const weekDays = computed(() => {
  const result = [];
  const baseDate = new Date(selected.value);

  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    result.push({
      date: date.getDate(),
      isSelected: i === 0,
    });
  }

  return result;
});
</script>

<template>
  <div class="widget">
    <div class="head">
      <b>{{ y }}년 {{ m }}월</b>
      <span class="right"
        >{{ ymd(selected) }} ({{
          ["일", "월", "화", "수", "목", "금", "토"][selected.getDay()]
        }})</span
      >
    </div>
    <div class="mini">
      <!-- 수정된 날짜 네비게이션 -->
      <button class="nav" @click="goToPrevDay">‹</button>
      <div class="days">
        <span
          v-for="(day, index) in weekDays"
          :key="index"
          class="d"
          :class="{ sel: day.isSelected }"
        >
          {{ day.date }}
        </span>
      </div>
      <button class="nav" @click="goToNextDay">›</button>
    </div>

    <ul class="list" v-if="todayList.length">
      <li v-for="it in todayList" :key="it.id" class="li">
        <span class="dot"></span>
        <div class="txt">
          <div class="t">{{ it.scheduleType }}</div>
          <div class="d">{{ it.startDate }} ~ {{ it.endDate }}</div>
        </div>
      </li>
    </ul>
    <div class="empty" v-else>등록된 일정이 없습니다.</div>
  </div>
</template>

<style scoped>
.widget {
  width: 340px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
  padding: 14px;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.head b {
  font-size: 14px;
}
.right {
  font-size: 12px;
  color: #666;
}
.mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 10px;
}
.nav {
  background: #f2f6ff;
  border: none;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
}
.nav:hover {
  background: #e8f0ff;
}
.days {
  display: flex;
  gap: 8px;
}
.d {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f7f9ff;
  font-size: 12px;
  user-select: none;
}
.sel {
  background: #3bbeff !important;
  color: #fff;
}
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}
.li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: #f9f9ff;
  border: 1px solid #eef0ff;
  border-radius: 12px;
  padding: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27c161;
  margin-top: 6px;
  flex-shrink: 0;
}
.txt {
  flex: 1;
}
.t {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 2px;
}
.d {
  font-size: 12px;
  color: #777;
}
.empty {
  color: #888;
  background: #fafafa;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  font-size: 13px;
}
</style>
