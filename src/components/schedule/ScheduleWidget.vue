<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { fmt2 } from "@/services/date.js";
import { TYPE_META } from "@/constants/scheduleTypes";

const props = defineProps({
  selected: { type: Date, required: true },
  selectedTypes: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:selected"]);

const items = ref([]);
const debugMode = ref(true);

const y = computed(() => props.selected.getFullYear());
const m = computed(() => props.selected.getMonth() + 1);

// ==================== ✅ API 호출 ====================
const fetchData = async () => {
  console.log("✅ fetchData() 호출됨:", y.value, m.value);
  try {
    const response = await getSchedulesByMonth(y.value, m.value);

    let schedules = [];
    if (Array.isArray(response)) {
      schedules = response;
    } else if (response && Array.isArray(response.data)) {
      schedules = response.data;
    } else {
      console.warn("⚠️ 예상치 못한 API 응답 형태:", response);
    }
    //console.log("📡 API 응답:", response);
    // 선택된 타입 필터
    if (props.selectedTypes.length > 0) {
      schedules = schedules.filter((item) =>
        props.selectedTypes.includes(item.scheduleType)
      );
    }

    items.value = schedules;
  } catch (error) {
    console.error("❌ 일정 불러오기 실패:", error);
    items.value = [];
  }
};


// ✅ 처음 페이지 진입 시 바로 일정 불러오기
onMounted(() => {
  fetchData();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// ==================== ✅ 날짜 관련 유틸 ====================
const ymd = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = fmt2(d.getMonth() + 1);
  const date = fmt2(d.getDate());
  return `${year}-${month}-${date}`;
};

// ==================== ✅ 일정 필터링 ====================
const isDateInRange = (schedule, targetDate) => {
  const targetStr = ymd(targetDate);

  // 👇 가능한 모든 필드명을 커버 (API 응답 or DB 기준)
  let startStr =
    schedule.startDate ||
    schedule.start_datetime ||
    schedule.startDatetime;
  let endStr =
    schedule.endDate ||
    schedule.end_datetime ||
    schedule.endDatetime;

  if (!startStr || !endStr) return false;

  // "2025-10-01T00:00:00" → "2025-10-01"
  if (startStr.includes("T")) startStr = startStr.split("T")[0];
  if (endStr.includes("T")) endStr = endStr.split("T")[0];

  return startStr <= targetStr && targetStr <= endStr;
};
const todaySchedules = computed(() =>
  items.value.filter((item) => isDateInRange(item, props.selected))
);

// watch(todaySchedules, (val) => {
//   console.log("🎯 todaySchedules 변경됨:", val);
// });

// ==================== ✅ 주간 날짜 계산 ====================
const weekDays = computed(() => {
  const base = new Date(props.selected);
  const arr = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    arr.push({
      date: d.getDate(),
      fullDate: d,
      isSelected: i === 0,
    });
  }
  return arr;
});

// ==================== ✅ 날짜 이동 ====================
const changeDate = (newDate) => emit("update:selected", newDate);

const goToPrevDay = () => {
  const newDate = new Date(props.selected);
  newDate.setDate(newDate.getDate() - 1);
  changeDate(newDate);
};

const goToNextDay = () => {
  const newDate = new Date(props.selected);
  newDate.setDate(newDate.getDate() + 1);
  changeDate(newDate);
};

const selectWeekDay = (dayInfo) => changeDate(dayInfo.fullDate);

// ==================== ✅ 색상 유틸 ====================
const getDotColor = (item) =>
  TYPE_META[item.scheduleType]?.color || "#9AA0A6";

// ==================== ✅ 반응형 처리 ====================
// 월 바뀔 때마다 API 다시 호출
watch([y, m], fetchData, { immediate: true });
// 필터 타입 바뀔 때 다시 호출
watch(() => props.selectedTypes, fetchData, { deep: true });
// ✅ 날짜 클릭할 때도 필터 자동 반응 (todaySchedules는 computed라 OK)

// ==================== ✅ 디버그 표시 ====================
const debugInfo = computed(() => ({
  selectedDate: ymd(props.selected),
  totalItems: items.value.length,
  todayItems: todaySchedules.value.length,
  selectedTypes: props.selectedTypes,
}));

// ==================== ✅ 키보드 네비 ====================
const handleKeyDown = (event) => {
  if (event.key === "ArrowLeft") goToPrevDay();
  if (event.key === "ArrowRight") goToNextDay();
};
</script>

<template>
  <div class="widget">
    <div class="head">
      <b>{{ y }}년 {{ m }}월</b>
      <span class="right">
        {{ ymd(props.selected) }} ({{
          ["일", "월", "화", "수", "목", "금", "토"][props.selected.getDay()]
        }})
      </span>
    </div>

    <div class="mini">
      <button class="nav" @click="goToPrevDay">‹</button>
      <div class="days">
        <span
          v-for="(day, index) in weekDays"
          :key="index"
          class="d"
          :class="{ sel: day.isSelected }"
          @click="selectWeekDay(day)"
        >
          {{ day.date }}
        </span>
      </div>
      <button class="nav" @click="goToNextDay">›</button>
    </div>

    <div v-if="todaySchedules.length" class="list-container">
      <ul class="list">
        <li
          v-for="item in todaySchedules"
          :key="item.id || item.scheduleId"
          class="li"
        >
          <span class="dot" :style="{ backgroundColor: getDotColor(item) }"></span>
          <div class="txt">
            <div class="t">{{ item.title || item.scheduleType }}</div>
            <div class="date-range">
              {{ ymd(new Date(item.startDate)) }} ~
              {{ ymd(new Date(item.endDate)) }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div v-else class="empty">
      등록된 일정이 없습니다.
      <div class="debug" v-if="debugMode">
        <small>
          {{ debugInfo.selectedDate }} | 전체: {{ debugInfo.totalItems }}개 |
          오늘: {{ debugInfo.todayItems }}개
        </small>
      </div>
    </div>
  </div>
</template>


<style scoped>
.widget {
  width: 400px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 14px;
  height: 430px;
  display: flex;
  flex-direction: column;
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
  background: #e4e7eb;
  border: none;
  border-radius: 8px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.nav:hover {
  background: #e8f0ff;
}

.nav:active {
  background: #dde8ff;
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
  cursor: pointer;
  transition: all 0.2s;
}

.d:hover:not(.sel) {
  background: #e8f0ff;
  transform: scale(1.05);
}

.date-range {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
}

.d.sel {
  background: #1b1b1b !important;
  color: #fff;
  transform: scale(1.1);
}

.list-container {
  flex: 1;
  overflow-y: hidden;
  box-sizing: border-box;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  overflow-y: scroll;
  height: 100%;
}

.list::-webkit-scrollbar {
  width: 12px;
}
.list::-webkit-scrollbar-track {
  background: transparent;
}
.list::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 6px;
  border: 3px solid transparent;
  background-clip: padding-box;
}

.li {
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f9f9ff;
  border: 1px solid #eef0ff;
  border-radius: 12px;
  padding: 8px;
  transition: background 0.2s;
}
.li:hover {
  background: #f2f8ff;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
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
  white-space: nowrap;
  margin-left: 4px;
  margin-right: 4px;
}

.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #888;
  background: #fafafa;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  font-size: 13px;
}

.debug {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
}
</style>
