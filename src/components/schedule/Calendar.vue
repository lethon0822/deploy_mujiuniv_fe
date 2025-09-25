<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { fmt2 } from "@/services/date";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { TYPE_META } from "@/constants/scheduleTypes";
import Icon from "@/assets/free-icon-arrow.png";

const props = defineProps({
  selectedTypes: { type: Array, default: () => [] },
});

const model = defineModel("selectedDate", {
  type: Date,
  default: () => new Date(),
});

const emit = defineEmits(["month-loaded", "date-click"]);

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
const year = ref(model.value.getFullYear());
const month = ref(model.value.getMonth() + 1);

const matrix = ref([]);
const schedules = ref([]);
const bars = ref([]);
const today = new Date();

const monthNames = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

/* -------------------------
  달력 매트릭스
-------------------------- */
const build = () => {
  const first = new Date(year.value, month.value - 1, 1);
  const startIdx = first.getDay();
  const lastDay = new Date(year.value, month.value, 0).getDate();
  const prevLastDay = new Date(year.value, month.value - 1, 0).getDate();
  const rows = [];
  let day = 1;

  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      if (r === 0 && c < startIdx) {
        row.push({
          day: prevLastDay - startIdx + c + 1,
          isPrevMonth: true,
        });
      } else if (day <= lastDay) {
        row.push({ day, isPrevMonth: false });
        day++;
      } else {
        row.push({
          day: day - lastDay,
          isPrevMonth: false,
          isNextMonth: true,
        });
        day++;
      }
    }
    rows.push(row);
    if (day > lastDay + 7) break;
  }
  matrix.value = rows;
};

/* -------------------------
  데이터 로드
-------------------------- */
const fetchMonthSchedules = async () => {
  try {
    const arr = await getSchedulesByMonth(year.value, month.value);
    schedules.value = props.selectedTypes.length
      ? arr.filter((it) => props.selectedTypes.includes(it.scheduleType))
      : arr;
    emit("month-loaded", schedules.value);
    computeBars();
  } catch (e) {
    console.error(e);
    schedules.value = [];
    bars.value = [];
    emit("month-loaded", []);
  }
};

/* -------------------------
  좌표/보정
-------------------------- */
const monthFirst = () => new Date(year.value, month.value - 1, 1);
const monthLast = () => new Date(year.value, month.value, 0);

const rowFor = (date) => {
  const d = new Date(date);
  const first = monthFirst();
  const offset = d.getDate() + first.getDay() - 1;
  return Math.floor(offset / 7) + 2; // CSS Grid 라인에 맞게 +2
};

const colFor = (date) => {
  const d = new Date(date);
  return d.getDay() + 1; // CSS Grid 라인에 맞게 +1
};

const splitAndClipByWeek = (event) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const out = [];
  let cur = new Date(start);

  while (cur <= end) {
    const wkStart = new Date(cur);
    const wkEnd = new Date(cur);
    wkEnd.setDate(wkEnd.getDate() + (6 - wkEnd.getDay()));
    if (wkEnd > end) wkEnd.setTime(end.getTime());

    const mf = monthFirst();
    const ml = monthLast();
    const clipStart = wkStart < mf ? mf : wkStart;
    const clipEnd = wkEnd > ml ? ml : wkEnd;

    if (clipStart <= clipEnd) {
      out.push({
        ...event,
        partStart: wkStart,
        partEnd: wkEnd,
        clipStart,
        clipEnd,
      });
    }

    cur = new Date(wkEnd);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
};

/* -------------------------
  bars 계산
-------------------------- */
const computeBars = () => {
  const acc = [];
  const occupiedSlots = {};

  const sortedSchedules = [...schedules.value].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  for (const ev of sortedSchedules ?? []) {
    const pieces = splitAndClipByWeek(ev);
    let stackIndex = 0;
    let foundSlot = false;
    while (!foundSlot) {
      foundSlot = true;
      for (const p of pieces) {
        const row = rowFor(p.clipStart);
        if (occupiedSlots[row] && occupiedSlots[row].has(stackIndex)) {
          foundSlot = false;
          break;
        }
      }
      if (!foundSlot) {
        stackIndex++;
      }
    }

    for (const p of pieces) {
      const row = rowFor(p.clipStart);
      const colStart = colFor(p.clipStart);
      const colEnd = colFor(p.clipEnd);

      if (!occupiedSlots[row]) {
        occupiedSlots[row] = new Set();
      }
      for (let i = colStart; i <= colEnd; i++) {
        occupiedSlots[row].add(stackIndex);
      }

      acc.push({
        key: `${ev.scheduleId || ev.id}-${p.partStart.getTime()}`,
        title: ev.scheduleType,
        color: TYPE_META[ev.scheduleType]?.color || "#bbb",
        rowStart: row,
        colStart: colStart,
        colEnd: colEnd,
        stackIndex,
      });
    }
  }
  bars.value = acc;
};

/* -------------------------
  달 이동
-------------------------- */
const prev = () => {
  if (month.value === 1) {
    month.value = 12;
    year.value--;
  } else month.value--;
  sync();
};
const next = () => {
  if (month.value === 12) {
    month.value = 1;
    year.value++;
  } else month.value++;
  sync();
};

const sync = () => {
  build();
  fetchMonthSchedules();
};

/* -------------------------
  날짜 선택
-------------------------- */
const pick = (cellData) => {
  if (!cellData || cellData.isPrevMonth || cellData.isNextMonth) return;
  const sel = new Date(
    `${year.value}-${fmt2(month.value)}-${fmt2(cellData.day)}`
  );
  model.value = sel;
  emit("date-click", sel);
};

/* -------------------------
  키보드 이벤트 핸들러
-------------------------- */
const handleKeyDown = (event) => {
  if (event.key === "Escape") {
    prev();
  } else if (event.key === "Enter") {
    next();
  }
};

onMounted(() => {
  sync();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

watch([year, month], build);
watch(() => props.selectedTypes.slice(), fetchMonthSchedules, { deep: true });
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="month-navigation">
        <button class="nav-btn" @click.prevent="prev">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <h2 class="month-title">{{ monthNames[month - 1] }} {{ year }}</h2>
        <button class="nav-btn" @click.prevent="next">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="calendar-wrapper">
      <div class="day-headers">
        <div v-for="dayName in dayNames" :key="dayName" class="day-header">
          {{ dayName }}
        </div>
      </div>

      <div class="calendar-grid">
        <template v-for="(row, ri) in matrix" :key="ri">
          <div
            v-for="(cellData, ci) in row"
            :key="`${ri}-${ci}`"
            class="day-cell"
            @click="pick(cellData)"
            :class="{
              'is-today':
                cellData.day &&
                !cellData.isPrevMonth &&
                !cellData.isNextMonth &&
                year === today.getFullYear() &&
                month === today.getMonth() + 1 &&
                cellData.day === today.getDate(),
              'is-selected':
                cellData.day &&
                !cellData.isPrevMonth &&
                !cellData.isNextMonth &&
                model &&
                cellData.day === model.getDate() &&
                month === model.getMonth() + 1 &&
                year === model.getFullYear(),
              'is-other-month': cellData.isPrevMonth || cellData.isNextMonth,
            }"
          >
            <span
              class="day-number"
              :class="{
                'is-sunday': ci === 0,
                'is-saturday': ci === 6,
              }"
            >
              {{ cellData.day }}
            </span>
          </div>
        </template>
        <div
          v-for="(bar, index) in bars"
          :key="bar.key"
          class="event-bar"
          :style="{
            'background-color': bar.color,
            'grid-row-start': bar.rowStart,
            'grid-row-end': bar.rowStart + 1,
            'grid-column-start': bar.colStart,
            'grid-column-end': bar.colEnd + 1,
            top: `calc(40px + ${bar.stackIndex * 20}px)`,
          }"
        >
          <span class="event-title">{{ bar.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* PC and general styles */
.calendar {
  background: white;
  border-radius: 0px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  min-width: 380px;
  max-width: 850px;
  width: 100%;
}

/* Header */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: none;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.month-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  min-width: 180px;
  text-align: center;
}

/* Calendar */
.calendar-wrapper {
  position: relative;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.day-header {
  padding: 12px 6px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
}

.day-cell {
  height: 110px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 10px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.day-cell:hover {
  background: #f9fafb;
}

.day-cell:last-child {
  border-right: none;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  display: inline-block;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* 날짜 숫자에 직접 적용되는 스타일 */
.day-number.is-saturday {
  color: #3b82f6;
}
.day-number.is-sunday {
  color: #ef4444;
}

/* 다른 달 날짜 */
.is-other-month .day-number {
  color: #d1d5db;
}

/* 오늘 날짜 */
.is-today .day-number {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

/* 선택된 날짜 */
.is-selected .day-number {
  background: #1f2937;
  color: white;
  font-weight: 600;
}

/* Events */
.event-bar {
  height: 16px;
  border-radius: 4px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  color: white;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute; /* 절대 위치를 사용하여 셀 위에 겹쳐지도록 함 */
  left: 5px; /* 왼쪽 간격 */
  right: 5px; /* 오른쪽 간격 */
  z-index: 10;
}

.event-title {
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* 모바일 반응형 (max-width: 767px) - 위젯처럼 더 작게 */
@media (max-width: 767px) {
  .calendar {
    min-width: 280px;
  }

  .calendar-header {
    padding: 10px 12px;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
  }

  .month-title {
    font-size: 18px;
    min-width: unset;
  }

  .nav-btn {
    width: 24px;
    height: 24px;
  }

  .day-headers {
    font-size: 11px;
    padding: 0 4px;
  }

  .day-header {
    padding: 8px 0;
  }

  .day-cell {
    height: 70px;
    padding: 6px;
  }

  .day-number {
    font-size: 12px;
    width: 20px;
    height: 20px;
  }

  .event-bar {
    height: 10px;
    transform: unset;
    margin: 0 2px;
    padding: 0 2px;
  }

  .event-title {
    font-size: 8px;
  }
}

/* 태블릿 반응형 (min-width: 768px and max-width: 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .calendar-header {
    padding: 16px 20px;
  }

  .month-title {
    font-size: 20px;
    min-width: 160px;
  }

  .nav-btn {
    width: 28px;
    height: 28px;
  }

  .day-header {
    padding: 12px 6px;
    font-size: 12px;
  }

  .day-cell {
    height: 90px;
    padding: 10px;
  }

  .day-number {
    font-size: 14px;
    width: 24px;
    height: 24px;
  }

  .event-bar {
    height: 12px;
    transform: unset;
    margin: 0 3px;
  }

  .event-title {
    font-size: 10px;
  }
}

/* 데스크톱 (min-width: 1024px) */
@media (min-width: 1024px) {
  .calendar-header {
    padding: 24px 32px;
  }

  .month-title {
    font-size: 24px;
    min-width: 200px;
  }

  .day-header {
    padding: 16px 8px;
    font-size: 14px;
  }

  .day-cell {
    height: 110px;
    padding: 10px;
  }

  .day-number {
    font-size: 16px;
    width: 24px;
    height: 24px;
  }

  .event-bar {
    height: 14px;
    transform: unset;
    margin: 0 4px;
  }

  .event-title {
    font-size: 11px;
  }
}
</style>
