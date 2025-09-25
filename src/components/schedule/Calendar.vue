<script setup>
import { ref, watch, onMounted } from "vue";
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
const bars = ref([]); // 막대
const today = new Date();

/* -------------------------
   달력 매트릭스
-------------------------- */
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
  return Math.floor(offset / 7) + 2; // 1줄: 요일 헤더 보정
};

const colFor = (date) => {
  const d = new Date(date);
  return d.getDay() + 1; // 1~7
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
  const stackIndexByRow = {}; // {row: nextIndex}

  for (const ev of schedules.value ?? []) {
    const pieces = splitAndClipByWeek(ev);
    for (const p of pieces) {
      const row = rowFor(p.clipStart);
      const c1 = colFor(p.clipStart);
      const c2 = colFor(p.clipEnd) + 1;

      if (!stackIndexByRow[row]) stackIndexByRow[row] = 0;
      const stackIndex = stackIndexByRow[row]++;

      acc.push({
                key: `${ev.scheduleId || ev.id}-${p.partStart.getTime()}`,
                title: ev.scheduleType,   // 👈 description 대신 scheduleType
                color: TYPE_META[ev.scheduleType]?.color || "#bbb",
                rowStart: row,
                rowEnd: row + 1,
                colStart: c1,
                colEnd: c2,
                stackIndex,
              });


    }
  }
  console.log("✅ bars computed:", acc);
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
const pick = (d) => {
  if (!d) return;
  const sel = new Date(`${year.value}-${fmt2(month.value)}-${fmt2(d)}`);
  model.value = sel;
  emit("date-click", sel);
};

onMounted(sync);
watch([year, month], build);
watch(() => props.selectedTypes.slice(), fetchMonthSchedules, { deep: true });
</script>

<template>
  <div class="calendar">
    <h3 class="cal-title">
      <button class="nav prev" @click.prevent="prev">
        <img :src="Icon" alt="prev" class="rot" />
      </button>
      <span class="ym"><b>{{ year }}</b> 년 <b>{{ month }}</b> 월</span>
      <button class="nav next" @click.prevent="next">
        <img :src="Icon" alt="next" />
      </button>
    </h3>

    <div class="calendar-wrapper">
      <!-- 날짜 grid -->
      <div class="calendar-grid">
        <div v-for="d in dayNames" :key="d" class="day-header">{{ d }}</div>
        <template v-for="(row, ri) in matrix" :key="ri">
          <div
            v-for="(d, ci) in row"
            :key="`${ri}-${ci}`"
            class="day-cell"
            @click="pick(d)"
            :class="{
              today:
                d &&
                year === today.getFullYear() &&
                month === today.getMonth() + 1 &&
                d === today.getDate(),
              selected:
                d &&
                model &&
                d === model.getDate() &&
                month === model.getMonth() + 1 &&
                year === model.getFullYear(),
            }"
          >
            <span v-if="d" class="day-num">{{ d }}</span>
          </div>
        </template>
      </div>

      <!-- 이벤트 bars -->
      <div class="events-layer">
        <div
          v-for="b in bars"
          :key="b.key"
          class="event-bar"
          :title="b.title"
          :style="{
            gridRowStart: b.rowStart,
            gridRowEnd: b.rowEnd,
            gridColumnStart: b.colStart,
            gridColumnEnd: b.colEnd,
            transform: `translateY(${22 + b.stackIndex * 14}px)`,
            background: b.color,
          }"
        >
          {{ b.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
.cal-title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 24px;
  font-weight: 800;
}
.cal-title .nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 10px;
}
.cal-title .nav.prev {
  left: 0;
}
.cal-title .nav.next {
  right: 0;
}
.cal-title .nav img {
  width: 22px;
}
.rot {
  transform: rotate(180deg);
}

/* === 달력 === */
.calendar-wrapper {
  position: relative;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 100px;
  margin-top: 20px;
}
.day-header,

.day-header {
  background: #f8fafc;
  font-weight: 800;
  text-align: center;
  padding: 10px;
}
.day-cell {
  border: none;
  border: 1px solid #eee;
  padding-top: 25px;   /* 🔥 날짜 숫자와 bar 사이 간격 확보 */
  padding: 4px;
  position: relative;
}

.day-num {
  font-size: 14px;
  font-weight: 600;
  position: absolute;
  top: 4px;
  left: 6px;
  z-index: 3;
}

/* 오늘/선택 표시 */
.today {
  border: 2px solid #ff9800;
  border-radius: 6px;
}
.selected {
  border: 2px solid #2196f3;
  border-radius: 6px;
}

/* === 막대 === */
.events-layer {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 100px;
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.event-bar {
  display: flex;                /* flex 컨테이너 */
  align-items: center;          /* 세로 가운데 */
  justify-content: center;      /* 가로 가운데 */

  height: 12px;                 /* bar 높이 */
  border-radius: 4px;
  padding: 0 6px;

  font-size: 12px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
