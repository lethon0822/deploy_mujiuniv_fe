<script setup>
import { ref, watch, onMounted } from 'vue';
import { fmt2 } from '@/services/date';
import { getSchedulesByMonth } from '@/services/scheduleService';
import { expandDates } from '@/services/date';
import { TYPE_META } from '@/constants/scheduleTypes';
// 아이콘(좌/우 동일 이미지면 하나만 가져다 rotate)
import Icon from '@/assets/free-icon-arrow.png';
const props = defineProps({
  selectedTypes: { type: Array, default: () => [] }, // :흰색_확인_표시: 타입 필터
});
const model = defineModel('selectedDate', { type: Date, default: () => new Date() });
const emit = defineEmits(['month-loaded', 'date-click']);
const dayNames = ['일','월','화','수','목','금','토'];
const year = ref(model.value.getFullYear());
const month = ref(model.value.getMonth() + 1);
const matrix = ref([]);
// :흰색_확인_표시: 날짜별 타입 Set 저장 (YYYY-MM-DD => Set(types))
const marksByDate = ref(new Map());
const build = () => {
  const first = new Date(year.value, month.value - 1, 1);
  const startIdx = first.getDay();
  const lastDay = new Date(year.value, month.value, 0).getDate();
  const rows = [];
  let day = 1;
  for (let r=0;r<6;r++){
    const row = [];
    for(let c=0;c<7;c++){
      if (r===0 && c<startIdx) row.push('');
      else if (day<=lastDay) row.push(day++);
      else row.push('');
    }
    rows.push(row);
    if (day>lastDay) break;
  }
  matrix.value = rows;
};
const fetchMonthMarks = async () => {
  const arr = await getSchedulesByMonth(year.value, month.value);
  const map = new Map();
  arr.forEach(it => {
    // :흰색_확인_표시: 타입 필터 반영
    if (props.selectedTypes.length && !props.selectedTypes.includes(it.scheduleType)) return;
    expandDates(it.startDate, it.endDate).forEach(d => {
      if (!map.has(d)) map.set(d, new Set());
      map.get(d).add(it.scheduleType);
    });
  });
  marksByDate.value = map;
  emit('month-loaded', arr);
};
const prev = () => { month.value===1 ? (month.value=12, year.value--) : month.value--; sync(); };
const next = () => { month.value===12 ? (month.value=1, year.value++) : month.value++; sync(); };
const sync = () => { build(); fetchMonthMarks(); };
const isToday = (d) => {
  const t = new Date();
  return d && t.getFullYear()===year.value && t.getMonth()+1===month.value && t.getDate()===d;
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
  emit('date-click', sel);
};

// 오늘 체크처럼 선택(모델) 체크도 하나 추가
const isSelected = (d) => {
  if (!d || !model.value) return false;
  return (
    model.value.getFullYear() === year.value &&
    model.value.getMonth() + 1 === month.value &&
    model.value.getDate() === d
  );
};
onMounted(sync);
// 년/월은 달력 그리드만 다시 구성
watch([year, month], build);
// 타입 필터는 마킹만 다시 산출
watch(() => props.selectedTypes.slice(), fetchMonthMarks);
</script>
<template>
  <div class="calendar">
    <h3 class="cal-title">
  <button type="button" class="nav prev" @click.prevent="prev">
    <img :src="Icon" alt="prev" class="rot" />
  </button>
  <span class="ym"><b>{{ year }}</b> 년 <b>{{ month }}</b> 월</span>
  <button type="button" class="nav next" @click.prevent="next">
    <img :src="Icon" alt="next" />
  </button>
</h3>
    <table class="tbl">
  <!-- :흰색_확인_표시: 7열을 정확히 1/7로 고정 -->
  <colgroup>
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
    <col style="width:14.2857143%">
  </colgroup>
      <thead>
        <tr>
          <th v-for="d in dayNames" :key="d"><b>{{ d }}</b></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row,ri) in matrix" :key="ri">
          <td
            v-for="(d,ci) in row" :key="ci"
            class="day"
            :class="{ sun: ci===0, sat: ci===6, today: isToday(d), selected: isSelected(d) }"
            @click="pick(d)"
          >
            <div class="num">{{ d }}</div>
            <div class="dots" v-if="typesFor(d).length">
              <i v-for="t in typesFor(d).slice(0,3)" :key="t" class="dot"
                 :style="{ background: (TYPE_META[t]?.color || '#bbb') }"/>
              <span v-if="typesFor(d).length>3" class="more">+{{ typesFor(d).length-3 }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="legend">
      <span v-for="(meta,t) in TYPE_META" :key="t" class="leg">
        <i class="dot" :style="{background: meta.color}"></i>{{ t }}
      </span>
    </div>
  </div>
</template>
<style scoped>
/* 컨테이너 */
.calendar{
  border-radius:20px;
  border:#dedede 1px solid;
  margin-left: 25px;
  margin-top:10px;
  width:100%;
  background:#fff;
  padding:35px 45px 25px;
  box-shadow:0 0 10px rgba(0,0,0,.1);
  color:#343A40;
}
/* 타이틀 중앙, 양 끝 화살표 */
.cal-title{
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0;
  padding: 4px 0;
  font-size: 24px;
  font-weight: 800;
  color:#343A40;
}
/* :흰색_확인_표시: 버튼에 맞춘 규칙 (기존 .cal-title > a … 를 전부 이걸로 교체) */
.cal-title .nav{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px; height: 36px;
  display:flex; align-items:center; justify-content:center;
  border: none;                 /* 기본 회색 테두리 제거 */
  background: transparent;      /* 기본 회색 배경 제거 */
  border-radius: 10px;
  cursor: pointer;
  appearance: none; -webkit-appearance: none;
  z-index: 1;
}
.cal-title .nav.prev{ left: 0; }   /* ← 캘린더(타이틀 영역)의 왼쪽 끝 */
.cal-title .nav.next{ right: 0; }  /* → 캘린더(타이틀 영역)의 오른쪽 끝 */
.cal-title .nav:hover{ background:#f5f7fa; }
.cal-title .nav img{ width:22px; } /* 아이콘 크기 */
.rot{ transform:rotate(180deg); }
/* ===== 테이블: 균등열 + 요일바 회색 제거 & 구분선 추가 ===== */
.tbl{
  width:100%;
  border-collapse:separate;   /* thead 라운드 효과가 필요 없으므로 유지해도 OK */
  border-spacing:0;
  table-layout: fixed;        /* 열 너비를 콘텐츠와 무관하게 고정 */
  font-size:20px;
}
/* 열 너비 1/7 고정(안전망) */
.tbl thead th,
.tbl tbody td{
  width:14.2857143%;
  box-sizing:border-box;
  overflow:hidden;
}
/* 요일 행: 배경 제거 + 하단 얇은 실선 */
.tbl thead tr{
  background: transparent;
  border-bottom: 1px solid #E7E9EE;   /* :흰색_확인_표시: 요일/날짜 구분선 */
}
.tbl thead th{
  color:#111;
  text-align:center;
  font-weight:800;
  padding:12px 0;
}
.tbl thead th:first-child,
.tbl thead th:last-child{ border-radius:0; } /* 기존 라운드 무력화 */
/* ===== 날짜 셀 ===== */
.tbl tbody td{
  height:78px;
  text-align:center;
  vertical-align:top;
  background:#fff;
  padding: 0;                 /* 셀 내부는 .day가 패딩을 가짐 */
}
.day{
  cursor:pointer;
  padding-top:10px;
  border-radius:12px;         /* 오늘 강조가 자연스럽게 보이도록 */
  transition: background .15s ease;
}
.day:hover{ background:#f8fafc; }
/* 오늘: 칸을 색칠해 강조 */
.day.today{
  background: #FFF6D6;               /* 은은한 노랑 */
  box-shadow: inset 0 0 0 1px #FFE4A3;
}
/* 선택한 날짜: 파란 톤 박스 */
.day.selected{
  background:#EEF5FF;
  box-shadow: inset 0 0 0 1.5px #BFD9FF, 0 2px 0 rgba(0,0,0,.02);
}
.day.selected:hover{ background:#E8F1FF; }

/* 오늘이면서 선택되어 있으면 노랑 채움은 유지하고 파란 링만 추가 */
.day.selected.today{
  background:#FFF6D6; /* today 색 유지 */
  box-shadow: inset 0 0 0 2px #7BB9FF, 0 2px 0 rgba(0,0,0,.02);
}

.num{ font-weight:700; color:#343A40; }
/* 주말 색상(오늘은 검정 유지) */
.sun .num{ color:tomato; }
.sat .num{ color:#1e90ff; }
.day.today .num{ color:#343A40 !important; }
/* 타입 점 */
.dots{
  margin-top:6px;
  display:flex;
  gap:4px;
  justify-content:center;
  align-items:center;
}
.dot{ width:8px; height:8px; border-radius:50%; }
.more{ font-size:11px; color:#666 }
/* 범례 */
.legend{
  margin-top:12px;
  font-size:12.5px;
  color:#666;
  display:flex;
  gap:12px;
  flex-wrap:wrap;
}
.leg{ display:inline-flex; align-items:center; gap:6px }
</style>