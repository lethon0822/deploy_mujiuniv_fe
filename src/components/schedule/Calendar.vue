<script setup>
import { ref, watch, onMounted } from "vue";
import { fmt2 } from "@/services/date";
import { getSchedulesByMonth } from "@/services/scheduleService";
import { expandDates } from "@/services/date";
import { TYPE_META } from "@/constants/scheduleTypes";
// 아이콘(좌/우 동일 이미지면 하나만 가져다 rotate)
import Icon from "@/assets/free-icon-arrow.png";

const props = defineProps({
  selectedTypes: { type: Array, default: () => [] }, // 타입 필터
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
// 날짜별 타입 Set 저장 (YYYY-MM-DD => Set(types))
const marksByDate = ref(new Map());
// 일정 바 정보 저장 (각 row별로 일정 바들을 관리)
const scheduleBars = ref([]);

const build = () => {
  const first = new Date(year.value, month.value - 1, 1);
  const startIdx = first.getDay();
  const lastDay = new Date(year.value, month.value, 0).getDate();
  const rows = [];
  let day = 1;

  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      if (r === 0 && c < startIdx) row.push("");
      else if (day <= lastDay) row.push(day++);
      else row.push("");
    }
    rows.push(row);
    if (day > lastDay) break;
  }
  matrix.value = rows;
};

const fetchMonthMarks = async () => {
  try {
    const arr = await getSchedulesByMonth(year.value, month.value);
    const map = new Map();

    // 필터링된 일정들
    const filteredSchedules = arr.filter((it) => {
      return (
        !props.selectedTypes.length ||
        props.selectedTypes.includes(it.scheduleType)
      );
    });

    filteredSchedules.forEach((it) => {
      expandDates(it.startDate, it.endDate).forEach((d) => {
        if (!map.has(d)) map.set(d, new Set());
        map.get(d).add(it.scheduleType);
      });
    });

    marksByDate.value = map;

    // 일정 바 생성
    createScheduleBars(filteredSchedules);

    emit("month-loaded", arr);
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    marksByDate.value = new Map();
    scheduleBars.value = [];
    emit("month-loaded", []);
  }
};

const prev = () => {
  if (month.value === 1) {
    month.value = 12;
    year.value--;
  } else {
    month.value--;
  }
  sync();
};

const next = () => {
  if (month.value === 12) {
    month.value = 1;
    year.value++;
  } else {
    month.value++;
  }
  sync();
};

// 일정 바 생성 함수
const createScheduleBars = (schedules) => {
  const bars = [];
  const currentMonth = `${year.value}-${fmt2(month.value)}`;

  schedules.forEach((schedule) => {
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);

    // 현재 월에 포함되는 부분만 처리
    const monthStart = new Date(year.value, month.value - 1, 1);
    const monthEnd = new Date(year.value, month.value, 0);

    const displayStart = startDate < monthStart ? monthStart : startDate;
    const displayEnd = endDate > monthEnd ? monthEnd : endDate;

    if (displayStart <= monthEnd && displayEnd >= monthStart) {
      // 시작일과 종료일이 속한 row와 column 찾기
      const startRow = Math.floor(
        (displayStart.getDate() + monthStart.getDay() - 1) / 7
      );
      const endRow = Math.floor(
        (displayEnd.getDate() + monthStart.getDay() - 1) / 7
      );

      // 같은 행에 있는 경우
      if (startRow === endRow) {
        const startCol = (displayStart.getDate() + monthStart.getDay() - 1) % 7;
        const endCol = (displayEnd.getDate() + monthStart.getDay() - 1) % 7;

        bars.push({
          id: `${schedule.id || Math.random()}-${startRow}`,
          row: startRow,
          startCol,
          endCol,
          type: schedule.scheduleType,
          title: schedule.scheduleType, // scheduleType을 제목으로 사용
          color: TYPE_META[schedule.scheduleType]?.color || "#bbb",
        });
      } else {
        // 여러 행에 걸쳐 있는 경우
        for (let row = startRow; row <= endRow; row++) {
          let startCol, endCol;

          if (row === startRow) {
            // 첫 번째 행: 시작일부터 행 끝까지
            startCol = (displayStart.getDate() + monthStart.getDay() - 1) % 7;
            endCol = 6;
          } else if (row === endRow) {
            // 마지막 행: 행 시작부터 종료일까지
            startCol = 0;
            endCol = (displayEnd.getDate() + monthStart.getDay() - 1) % 7;
          } else {
            // 중간 행: 전체
            startCol = 0;
            endCol = 6;
          }

          bars.push({
            id: `${schedule.id || Math.random()}-${row}`,
            row,
            startCol,
            endCol,
            type: schedule.scheduleType,
            title: schedule.scheduleType, // scheduleType을 제목으로 사용
            color: TYPE_META[schedule.scheduleType]?.color || "#bbb",
            isFirst: row === startRow,
            isLast: row === endRow,
          });
        }
      }
    }
  });

  // row별로 정렬하고 레이어 할당
  const rowGroups = {};
  bars.forEach((bar) => {
    if (!rowGroups[bar.row]) rowGroups[bar.row] = [];
    rowGroups[bar.row].push(bar);
  });

  Object.keys(rowGroups).forEach((rowKey) => {
    const rowBars = rowGroups[rowKey].sort((a, b) => a.startCol - b.startCol);
    const layers = [];

    rowBars.forEach((bar) => {
      let layerIndex = 0;
      while (layers[layerIndex]) {
        const hasOverlap = layers[layerIndex].some(
          (existingBar) =>
            !(
              bar.endCol < existingBar.startCol ||
              bar.startCol > existingBar.endCol
            )
        );
        if (!hasOverlap) break;
        layerIndex++;
      }

      if (!layers[layerIndex]) layers[layerIndex] = [];
      layers[layerIndex].push(bar);
      bar.layer = layerIndex;
    });
  });

  scheduleBars.value = bars;
};

const sync = () => {
  build();
  fetchMonthMarks();
};

// 특정 row의 바들 반환
const getBarsForRow = (rowIndex) => {
  return scheduleBars.value.filter((bar) => bar.row === rowIndex);
};

const isToday = (d) => {
  if (!d) return false;
  const today = new Date();
  return (
    today.getFullYear() === year.value &&
    today.getMonth() + 1 === month.value &&
    today.getDate() === d
  );
};

const isSelected = (d) => {
  if (!d || !model.value) return false;
  return (
    model.value.getFullYear() === year.value &&
    model.value.getMonth() + 1 === month.value &&
    model.value.getDate() === d
  );
};

// 해당 날짜의 타입 배열
const typesFor = (d) => {
  if (!d) return [];
  const key = `${year.value}-${fmt2(month.value)}-${fmt2(d)}`;
  return Array.from(marksByDate.value.get(key) || []);
};

const pick = (d) => {
  if (!d) return;
  const sel = new Date(`${year.value}-${fmt2(month.value)}-${fmt2(d)}`);
  model.value = sel;
  emit("date-click", sel);
};

// 이전 달의 날짜인지 확인
const isPrevMonth = (d) => {
  return !d;
};

// 다음 달의 날짜인지 확인 (현재는 빈 문자열로 처리되므로 실제로는 사용되지 않음)
const isNextMonth = (d) => {
  return false;
};

onMounted(sync);

// 년/월은 달력 그리드만 다시 구성
watch([year, month], build);

// 타입 필터는 마킹만 다시 산출
watch(() => props.selectedTypes.slice(), fetchMonthMarks, { deep: true });
</script>

<template>
  <div class="calendar">
    <h3 class="cal-title">
      <button type="button" class="nav prev" @click.prevent="prev">
        <img :src="Icon" alt="prev" class="rot" />
      </button>
      <span class="ym">
        <b>{{ year }}</b> 년 <b>{{ month }}</b> 월
      </span>
      <button type="button" class="nav next" @click.prevent="next">
        <img :src="Icon" alt="next" />
      </button>
    </h3>

    <table class="tbl">
      <!-- 7열을 정확히 1/7로 고정 -->
      <colgroup>
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
        <col style="width: 14.2857143%" />
      </colgroup>

      <thead>
        <tr>
          <th v-for="d in dayNames" :key="d">
            <b>{{ d }}</b>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(row, ri) in matrix" :key="ri" class="calendar-row">
          <td
            v-for="(d, ci) in row"
            :key="ci"
            class="day-cell"
            :class="{
              'day-cell--empty': !d,
            }"
            @click="pick(d)"
          >
            <!-- 일정 바들 (첫 번째 셀에만 표시) -->
            <div
              v-if="ci === 0 && getBarsForRow(ri).length"
              class="schedule-bars"
            >
              <div
                v-for="bar in getBarsForRow(ri)"
                :key="bar.id"
                class="schedule-bar"
                :style="{
                  left: `${(bar.startCol / 7) * 100}%`,
                  width: `${((bar.endCol - bar.startCol + 1) / 7) * 100}%`,
                  backgroundColor: bar.color,
                  top: `${bar.layer * 20 + 2}px`,
                  zIndex: 10,
                }"
                :title="bar.title"
              >
                <span class="schedule-bar__text" v-if="bar.isFirst !== false">
                  {{ bar.title }}
                </span>
              </div>
            </div>

            <div
              class="day"
              :class="{
                'day--sun': ci === 0 && d,
                'day--sat': ci === 6 && d,
                'day--today': isToday(d),
                'day--selected': isSelected(d),
                'day--empty': !d,
              }"
            >
              <div class="day__num">{{ d }}</div>
              <div class="day__dots" v-if="d && typesFor(d).length">
                <i
                  v-for="t in typesFor(d).slice(0, 3)"
                  :key="t"
                  class="day__dot"
                  :style="{ background: TYPE_META[t]?.color || '#bbb' }"
                />
                <span v-if="typesFor(d).length > 3" class="day__more">
                  +{{ typesFor(d).length - 3 }}
                </span>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="legend">
      <span v-for="(meta, t) in TYPE_META" :key="t" class="legend__item">
        <i class="legend__dot" :style="{ background: meta.color }"></i>
        {{ t }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* 컨테이너 */
.calendar {
  border-radius: 20px;
  border: #dedede 1px solid;
  margin-left: 25px;
  margin-top: 10px;
  width: 100%;
  background: #fff;
  padding: 35px 45px 25px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  color: #343a40;
}

/* 타이틀 중앙, 양 끝 화살표 */
.cal-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  padding: 4px 0;
  font-size: 24px;
  font-weight: 800;
  color: #343a40;
}

/* 내비게이션 버튼 */
.cal-title .nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  z-index: 1;
  transition: background 0.2s ease;
}

.cal-title .nav.prev {
  left: 0;
}

.cal-title .nav.next {
  right: 0;
}

.cal-title .nav:hover {
  background: #f5f7fa;
}

.cal-title .nav img {
  width: 22px;
}

.rot {
  transform: rotate(180deg);
}

.tbl {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  font-size: 20px;
  margin-top: 20px;

  /* 열 너비 1/7 고정 */
  .tbl thead th,
  .tbl tbody .day-cell {
    width: 14.2857143%;
    box-sizing: border-box;
  }
}

/* 요일 헤더 */
.tbl thead tr {
  background: #f8fafc;
}

.tbl thead th {
  color: #495057;
  text-align: center;
  font-weight: 800;
  padding: 12px 0;
  border-right: 1px solid #e1e5e9;
  border-bottom: 1px solid #e1e5e9;
}

.tbl thead th:last-child {
  border-right: none;
}

/* 날짜 셀 */
.day-cell {
  height: 78px;
  text-align: center;
  vertical-align: top;
  background: #fff;
  padding: 0;
  border-right: 1px solid #e1e5e9;
  border-bottom: 1px solid #e1e5e9;
  position: relative;
}

.day-cell:last-child {
  border-right: none;
}

.day-cell--empty {
  background: #f8fafc;
  cursor: default;
}

/* 날짜 컨텐츠 */
.day {
  width: 100%;
  height: 100%;
  padding: 30px 4px 4px 4px; /* 상단 패딩을 늘려서 일정 바 공간 확보 */
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.day--empty {
  cursor: default;
  pointer-events: none;
}

.day:not(.day--empty):hover {
  background: rgba(59, 130, 246, 0.1);
}

/* 오늘 강조 */
.day--today {
  background: #fff3cd;
  position: relative;
}

.day--today::after {
  content: "";
  position: absolute;
  inset: 2px;
  border: 2px solid #ffc107;
  border-radius: 8px;
  pointer-events: none;
}

/* 선택된 날짜 */
.day--selected {
  background: #e3f2fd;
  position: relative;
}

.day--selected::after {
  content: "";
  position: absolute;
  inset: 2px;
  border: 2px solid #2196f3;
  border-radius: 8px;
  pointer-events: none;
}

/* 오늘이면서 선택된 경우 */
.day--today.day--selected {
  background: linear-gradient(135deg, #fff3cd 50%, #e3f2fd 50%);
}

.day--today.day--selected::after {
  border: 2px solid #ff9800;
}

/* 날짜 숫자 */
.day__num {
  font-weight: 700;
  color: #343a40;
  font-size: 16px;
  margin-bottom: 2px;
}

/* 주말 색상 */
.day--sun .day__num {
  color: #dc3545;
}

.day--sat .day__num {
  color: #007bff;
}

.day--today .day__num {
  color: #343a40 !important;
  font-weight: 800;
}

/* 일정 점들 */
.day__dots {
  display: flex;
  gap: 3px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: auto;
}

.day__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.day__more {
  font-size: 10px;
  color: #666;
  font-weight: 500;
}

/* 범례 */
.legend {
  margin-top: 16px;
  font-size: 12px;
  color: #6c757d;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .calendar {
    margin-left: 10px;
    padding: 20px 15px 15px;
  }

  .cal-title {
    font-size: 20px;
  }

  .tbl {
    font-size: 16px;
  }

  .day-cell {
    height: 70px; /* 모바일에서는 높이 줄임 */
  }

  .day {
    padding: 20px 4px 4px 4px; /* 모바일에서 상단 패딩 줄임 */
  }

  .schedule-bar {
    height: 14px;
    font-size: 10px;
  }

  .day__num {
    font-size: 14px;
  }

  .day__dot {
    width: 5px;
    height: 5px;
  }
}
</style>
