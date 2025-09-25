<script setup>
import { ref, onMounted, computed, watch } from "vue";
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

const ymd = (d) => {
  if (!d) return "";
  const year = d.getFullYear();
  const month = fmt2(d.getMonth() + 1);
  const date = fmt2(d.getDate());
  return `${year}-${month}-${date}`;
};

const fetchData = async () => {
  console.log(`🔄 API 호출: ${y.value}년 ${m.value}월`);

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
    if (props.selectedTypes.length > 0) {
      schedules = schedules.filter((item) =>
        props.selectedTypes.includes(item.scheduleType)
      );
    }
    items.value = schedules;
  } catch (error) {
    console.error("❌ API 호출 실패:", error);
    items.value = [];
  }
};

const isDateInRange = (schedule, targetDate) => {
  const targetStr = ymd(targetDate);
  let startStr = schedule.startDate;
  let endStr = schedule.endDate;

  if (startStr && startStr.includes("T")) {
    startStr = startStr.split("T")[0];
  }
  if (endStr && endStr.includes("T")) {
    endStr = endStr.split("T")[0];
  }

  return startStr <= targetStr && targetStr <= endStr;
};

const todaySchedules = computed(() => {
  const result = items.value.filter((item) =>
    isDateInRange(item, props.selected)
  );
  return result;
});

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

const changeDate = (newDate) => {
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

// 동적으로 점의 색상을 결정하는 함수를 추가했습니다.
const getDotColor = (item) => {
  const type = item.scheduleType;
  // TYPE_META 객체에서 해당 타입의 색상을 찾고, 없으면 기본값으로 회색을 반환합니다.
  return (TYPE_META[type] && TYPE_META[type].color) || "#9AA0A6";
};

watch([y, m], fetchData, { immediate: true });
watch(() => props.selectedTypes, fetchData, { deep: true });

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
        <span
          class="dot"
          :style="{ backgroundColor: getDotColor(item) }"
        ></span>
        <div class="txt">
          <div class="t">{{ item.title || item.scheduleType }}</div>
          <div class="date-range">
            {{ ymd(new Date(item.startDate)) }} ~
            {{ ymd(new Date(item.endDate)) }}
          </div>
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
  width: 400px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
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

.date-range {
  font-size: 12px;
  color: #777;
  white-space: nowrap;
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
  flex: 1;
  overflow-y: auto;
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
