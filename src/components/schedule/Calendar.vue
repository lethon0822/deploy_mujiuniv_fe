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
  const first = new Date(Date.UTC(year.value, month.value - 1, 1));
  const startIdx = first.getUTCDay();
  const lastDay = new Date(Date.UTC(year.value, month.value, 0)).getUTCDate();
  const prevLastDay = new Date(
    Date.UTC(year.value, month.value - 1, 0)
  ).getUTCDate();

  const rows = [];
  let day = 1;
  let nextMonthDay = 1;

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
          day: nextMonthDay,
          isPrevMonth: false,
          isNextMonth: true,
        });
        nextMonthDay++;
      }
    }
    rows.push(row);
    if (day > lastDay && nextMonthDay > 7) break;
  }

  matrix.value = rows;
};

/* -------------------------
  데이터 로드
-------------------------- */
const fetchMonthSchedules = async () => {
  try {
    const arr = await getSchedulesByMonth(year.value, month.value);

    const validSchedules = Array.isArray(arr)
      ? arr.filter((it) => it && it.startDate)
      : [];

    schedules.value = props.selectedTypes.length
      ? validSchedules.filter((it) =>
          props.selectedTypes.includes(it.scheduleType)
        )
      : validSchedules;

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
const monthFirst = () => {
  const date = new Date(Date.UTC(year.value, month.value - 1, 1));
  return date;
};

const monthLast = () => {
  const date = new Date(Date.UTC(year.value, month.value, 0));
  return date;
};

const rowFor = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);

  const firstVisibleDay = new Date(Date.UTC(year.value, month.value - 1, 1));
  firstVisibleDay.setUTCDate(
    firstVisibleDay.getUTCDate() - firstVisibleDay.getUTCDay()
  );

  const diffTime = d.getTime() - firstVisibleDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return Math.floor(diffDays / 7) + 1;
};

const colFor = (date) => {
  const d = new Date(date);
  return d.getUTCDay() + 1;
};

const splitAndClipByWeek = (event) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(0, 0, 0, 0);

  const out = [];
  const mf = monthFirst();
  const ml = monthLast();

  const firstVisibleDay = new Date(Date.UTC(year.value, month.value - 1, 1));
  firstVisibleDay.setUTCDate(
    firstVisibleDay.getUTCDate() - firstVisibleDay.getUTCDay()
  );

  let cur = new Date(firstVisibleDay);

  while (
    cur.getUTCFullYear() < end.getUTCFullYear() ||
    (cur.getUTCFullYear() === end.getUTCFullYear() &&
      cur.getUTCMonth() < end.getUTCMonth()) ||
    (cur.getUTCFullYear() === end.getUTCFullYear() &&
      cur.getUTCMonth() === end.getUTCMonth() &&
      cur.getUTCDate() <= end.getUTCDate())
  ) {
    const wkEnd = new Date(cur);
    wkEnd.setUTCDate(cur.getUTCDate() + 6);
    wkEnd.setUTCHours(0, 0, 0, 0);

    const clipStart = new Date(
      Math.max(cur.getTime(), start.getTime(), mf.getTime())
    );
    const clipEnd = new Date(
      Math.min(wkEnd.getTime(), end.getTime(), ml.getTime())
    );

    if (clipStart.getTime() <= clipEnd.getTime()) {
      out.push({
        ...event,
        clipStart,
        clipEnd,
      });
    }
    cur.setUTCDate(cur.getUTCDate() + 7);
  }
  return out;
};

/* -------------------------
  bars 계산
-------------------------- */
const computeBars = () => {
  const acc = [];
  const occupiedSlots = {};
  const MAX_LINES = 2;

  const sortedSchedules = [...schedules.value].sort((a, b) => {
    if (!a || !a.startDate) return 1;
    if (!b || !b.startDate) return -1;
    return new Date(a.startDate) - new Date(b.startDate);
  });

  // 숨겨진 이벤트 메타 정보: { row: { count: number, minDate: Date } }
  const hiddenMetaByRow = {};

  for (const ev of sortedSchedules ?? []) {
    const pieces = splitAndClipByWeek(ev);

    if (pieces.length === 0) continue;

    const eventKey = ev.scheduleId || ev.id || ev.title;

    for (const p of pieces) {
      const row = rowFor(p.clipStart);
      const colStart = colFor(p.clipStart);
      const colEnd = colFor(p.clipEnd);

      if (!occupiedSlots[row]) {
        occupiedSlots[row] = new Set();
      }

      let stackIndex = 0;
      while (occupiedSlots[row].has(stackIndex) && stackIndex < MAX_LINES) {
        stackIndex++;
      }

      if (stackIndex < MAX_LINES) {
        // 사용된 stack 라인 표시
        for (let col = colStart; col <= colEnd; col++) {
          occupiedSlots[row].add(stackIndex);
        }

        acc.push({
          key: `${eventKey}-${p.clipStart.getTime()}`,
          title: ev.scheduleType,
          color: TYPE_META[ev.scheduleType]?.color || "#bbb",
          rowStart: row,
          colStart,
          colEnd,
          stackIndex,
        });
      } else {
        // 숨겨진 바 처리: 해당 row 기준으로 가장 빠른 시작 날짜를 기록
        const startDate = new Date(ev.startDate);
        if (!hiddenMetaByRow[row]) {
          hiddenMetaByRow[row] = {
            count: 1,
            minDate: startDate,
          };
        } else {
          hiddenMetaByRow[row].count++;
          if (startDate < hiddenMetaByRow[row].minDate) {
            hiddenMetaByRow[row].minDate = startDate;
          }
        }
      }
    }
  }

  // 숨겨진 바 생성
  Object.entries(hiddenMetaByRow).forEach(([rowStr, meta]) => {
    const row = parseInt(rowStr, 10);
    const col = colFor(meta.minDate); // 가장 빠른 시작 날짜 기준 열 위치

    acc.push({
      key: `hidden-bar-${row}`,
      title: `+${meta.count}`,
      color: "#999",
      rowStart: row,
      colStart: col,
      colEnd: col + 1,
      stackIndex: MAX_LINES,
      isHiddenCounter: true,
    });
  });

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
  const sel = new Date(Date.UTC(year.value, month.value - 1, cellData.day));
  model.value = new Date(
    sel.getUTCFullYear(),
    sel.getUTCMonth(),
    sel.getUTCDate()
  ); // 로컬로 변환
  emit("date-click", model.value);
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

watch([year, month], sync);
watch(model, (val) => {
  year.value = val.getFullYear();
  month.value = val.getMonth() + 1;
});
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
          :class="{ 'hidden-counter': bar.isHiddenCounter }"
          :style="{
            'background-color': bar.color,
            'grid-row-start': bar.rowStart,
            'grid-row-end': bar.rowStart + 1,
            'grid-column-start': bar.colStart,
            'grid-column-end': bar.colEnd + 1,
            top: `calc(40px + ${bar.stackIndex * 20}px)`,
          }"
        >
          <span class="event-title" v-if="!bar.isHiddenCounter">{{
            bar.title
          }}</span>

          <span class="hidden-counter-text" v-else>{{ bar.title }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

---

<style scoped>
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

.day-number.is-saturday {
  color: #3b82f6;
}
.day-number.is-sunday {
  color: #ef4444;
}

.is-other-month .day-number {
  color: #d1d5db;
}

.is-today .day-number {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.is-selected .day-number {
  background: #1f2937;
  color: white;
  font-weight: 600;
}

.hidden-counter {
  background-color: #6b7280 !important;
  cursor: default;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hidden-counter-text {
  color: white;
  user-select: none;
}

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
  position: absolute;
  left: 5px;
  right: 5px;
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
