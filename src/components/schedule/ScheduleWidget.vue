<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { fmt2 } from "@/services/date.js";

const props = defineProps({
  selected: { type: Date, required: true },
  selectedTypes: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:selected"]);

const items = ref([]);
const debugMode = ref(true); // 디버그 모드

// y, m은 props.selected 기준으로 computed 처리
const y = computed(() => props.selected.getFullYear());
const m = computed(() => props.selected.getMonth() + 1);

// 날짜 포맷 함수
const ymd = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = fmt2(d.getMonth() + 1);
  const date = fmt2(d.getDate());
  return `${year}-${month}-${date}`;
};

// API 호출 함수
const fetchData = async () => {
  console.log(`🔄 API 호출: ${y.value}년 ${m.value}월`);

  try {
    const response = await getSchedulesByMonth(y.value, m.value);
    console.log("📡 API 응답:", response);

    // 응답 파싱
    let schedules = [];
    if (Array.isArray(response)) {
      schedules = response;
    } else if (response && Array.isArray(response.data)) {
      schedules = response.data;
    } else {
      console.warn("⚠️ 예상치 못한 API 응답 형태:", response);
    }

    console.log(`📋 파싱된 스케줄 (${schedules.length}개):`, schedules);

    // selectedTypes 필터링
    if (props.selectedTypes.length > 0) {
      schedules = schedules.filter((item) =>
        props.selectedTypes.includes(item.scheduleType)
      );
      console.log(`🔍 타입 필터링 후 (${schedules.length}개):`, schedules);
    }

    items.value = schedules;
    console.log("✅ 최종 items:", items.value);
  } catch (error) {
    console.error("❌ API 호출 실패:", error);
    items.value = [];
  }
};

// 날짜 범위 체크 함수 - 완전히 새로 작성
const isDateInRange = (schedule, targetDate) => {
  const targetStr = ymd(targetDate);
  let startStr = schedule.startDate;
  let endStr = schedule.endDate;

  // ISO 형식 처리
  if (startStr && startStr.includes("T")) {
    startStr = startStr.split("T")[0];
  }
  if (endStr && endStr.includes("T")) {
    endStr = endStr.split("T")[0];
  }

  const result = startStr <= targetStr && targetStr <= endStr;

  if (debugMode.value) {
    console.log(`📅 날짜 체크: ${schedule.title || schedule.scheduleType}`);
    console.log(`   범위: ${startStr} ~ ${endStr}`);
    console.log(`   대상: ${targetStr}`);
    console.log(`   결과: ${result}`);
  }

  return result;
};

// 선택된 날짜의 일정들
const todaySchedules = computed(() => {
  const result = items.value.filter((item) =>
    isDateInRange(item, props.selected)
  );

  console.log(`📆 ${ymd(props.selected)} 일정 (${result.length}개):`, result);
  return result;
});

// 주간 날짜 계산
const weekDays = computed(() => {
  const result = [];
  const baseDate = new Date(props.selected);

  for (let i = -3; i <= 3; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    result.push({
      date: date.getDate(),
      fullDate: new Date(date),
      isSelected: i === 0,
    });
  }

  return result;
});

// 날짜 변경 함수들
const changeDate = (newDate) => {
  console.log("🔄 날짜 변경:", ymd(newDate));
  emit("update:selected", newDate);
};

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

const selectWeekDay = (dayInfo) => {
  changeDate(dayInfo.fullDate);
};

// 감시자들
watch([y, m], fetchData, { immediate: true });
watch(() => props.selectedTypes, fetchData, { deep: true });

// 디버그 정보
const debugInfo = computed(() => ({
  selectedDate: ymd(props.selected),
  totalItems: items.value.length,
  todayItems: todaySchedules.value.length,
  selectedTypes: props.selectedTypes,
}));
</script>

<template>
  <div class="widget">
    <div class="head">
      <b>{{ y }}년 {{ m }}월</b>
      <span class="right">
        {{ ymd(props.selected) }}
        ({{
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

    <ul class="list" v-if="todaySchedules.length">
      <li
        v-for="item in todaySchedules"
        :key="item.id || item.scheduleId"
        class="li"
      >
        <span class="dot"></span>
        <div class="txt">
          <div class="t">{{ item.title || item.scheduleType }}</div>
          <div class="d">{{ item.startDate }} ~ {{ item.endDate }}</div>
        </div>
      </li>
    </ul>

    <div class="empty" v-else>
      등록된 일정이 없습니다.
      <div class="debug" v-if="debugMode">
        <small
          >{{ debugInfo.selectedDate }} | 전체: {{ debugInfo.totalItems }}개 |
          오늘: {{ debugInfo.todayItems }}개</small
        >
      </div>
    </div>
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
.d.sel {
  background: #3bbeff !important;
  color: #fff;
  transform: scale(1.1);
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
  transition: background 0.2s;
}
.li:hover {
  background: #f2f8ff;
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
.debug {
  margin-top: 8px;
  font-size: 11px;
  color: #999;
}
</style>
