<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { fmt2 } from "@/services/date.js";

const props = defineProps({
  selected: { type: Date, required: true },
});
const emit = defineEmits(["update:selected"]);

const items = ref([]);

// y, m은 props.selected 기준으로 computed 처리
const y = computed(() => props.selected.getFullYear());
const m = computed(() => props.selected.getMonth() + 1);

// 스케줄 API 호출: selected 날짜의 연월이 바뀔 때마다 다시 호출하기 위해 watch 사용
watch(
  [y, m],
  async ([newY, newM]) => {
    try {
      const { data } = await getSchedulesByMonth(newY, newM);
      items.value = Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("스케줄 조회 실패:", error);
      items.value = [];
    }
  },
  { immediate: true }
);

// 날짜 포맷 함수
const ymd = (d) =>
  `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;

// 일정이 날짜 범위에 포함되는지 체크
const inRange = (it, d) =>
  new Date(it.startDate) <= d && d <= new Date(it.endDate);

// 선택된 날짜에 해당하는 일정 필터링
const todayList = computed(() =>
  (items.value || []).filter((it) => inRange(it, props.selected))
);

// 날짜 이동 함수 (하루씩 이동)
const goToPrevDay = () => {
  const newDate = new Date(props.selected);
  newDate.setDate(newDate.getDate() - 1);
  emit("update:selected", newDate);
};

const goToNextDay = () => {
  const newDate = new Date(props.selected);
  newDate.setDate(newDate.getDate() + 1);
  emit("update:selected", newDate);
};

// 주간 날짜 표시 (선택된 날짜 기준 ±3일)
const weekDays = computed(() => {
  const result = [];
  const baseDate = new Date(props.selected);

  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    result.push({
      date: date.getDate(),
      fullDate: date, // 만약 날짜 선택 기능 넣을 때 쓸 수도 있음
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
        >{{ ymd(props.selected) }} ({{
          ["일", "월", "화", "수", "목", "금", "토"][props.selected.getDay()]
        }})</span
      >
    </div>
    <div class="mini">
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
