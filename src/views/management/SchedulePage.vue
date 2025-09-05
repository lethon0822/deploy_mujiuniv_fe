<script setup>
import { ref } from 'vue';
import Calendar from '@/components/schedule/Calendar.vue';
import ScheduleList from '@/components/schedule/ScheduleList.vue';
import ScheduleModal from '@/components/schedule/ScheduleModal.vue';
import { ymd } from '@/services/date';
import { TYPE_ORDER, TYPE_META } from '@/constants/scheduleTypes';
import { useUserStore } from '@/stores/account'

const userStore = useUserStore();
const selectedDate = ref(new Date());
const selectedYmd = ref(ymd(selectedDate.value));
const modalOpen = ref(false);
const editItem = ref(null);
const DEFAULT_SEMESTER_ID = userStore.semesterId;

// 타입 필터
const selectedTypes = ref([...TYPE_ORDER]);

const onDateClick = (d) => {
  selectedDate.value = d;
  selectedYmd.value = ymd(d);
};

const openCreate = () => { editItem.value = null; modalOpen.value = true; };
const openEdit = (item) => { editItem.value = item; modalOpen.value = true; };
const handleSaved = () => { onDateClick(selectedDate.value); };

const toggleType = (t) => {
  const i = selectedTypes.value.indexOf(t);
  if (i >= 0) selectedTypes.value.splice(i, 1);
  else selectedTypes.value.push(t);
};
const selectAll = () => { selectedTypes.value = [...TYPE_ORDER]; };
</script>

<template>
  <div class="wrap">
    <!-- 좌: Calendar (자체 카드만 사용) -->
    <div class="left">
      <Calendar
        class="cal"
        v-model:selectedDate="selectedDate"
        :selected-types="selectedTypes"
        @date-click="onDateClick"
      />
    </div>

    <!-- 우: 칩 + 학사일정 목록 (외부 카드 제거) -->
    <div class="right">
      <div class="chips-row">
        <div class="chips-inner">
          <button
            v-for="t in TYPE_ORDER" :key="t"
            class="chip" :class="{ on: selectedTypes.includes(t) }"
            @click="toggleType(t)"
          >
            <i class="dot" :style="{ background: TYPE_META[t]?.color }"></i>{{ t }}
          </button>
        </div>
      </div>

      <!-- ✅ 외부 .list-card 래퍼 삭제, ScheduleList만 배치 -->
      <div class="list-flex">
        <!-- ✅ 평탄화 클래스 부여 -->
        <ScheduleList
          class="flat-list"
          :date="selectedDate"
          :selected-ymd="selectedYmd"
          :selected-types="selectedTypes"
          @add-click="openCreate"
          @edit-click="openEdit"
        />
      </div>
    </div>

    <ScheduleModal
      v-model="modalOpen"
      :edit-item="editItem"
      :picked-date="selectedYmd"
      :default-semester-id="DEFAULT_SEMESTER_ID"
      @saved="handleSaved"
    />
  </div>
</template>

<style scoped>
/* ===== 레이아웃: 우측 고정폭 + 하단 라인 일치 ===== */
.wrap{
  display:grid;
  grid-template-columns: 1fr 560px;   /* 우측 고정폭, 좌측 자동 확장 */
  gap:28px;
  align-items:stretch;                /* 두 컬럼을 한 행 높이로 스트레치 */
  width:100%;
  max-width:1600px;
  margin:0 auto;
  font-size:16.5px;
}

.left{ display:flex; }                /* 달력은 자체 카드 하나만 */
.right{ display:flex; flex-direction:column; margin-top: 10px; }

/* ---- 칩 레일: 좌우 라인 맞추고, 가로/세로 간격 분리 제어 ---- */
.chips-row{ width:100%; margin-bottom:10px; }

.chips-inner{
  padding: 0 24px 8px;      /* 리스트 카드와 좌우 라인 동일(+아래 숨쉬기) */
  display:flex;
  flex-wrap:wrap;
  column-gap: 12px;         /* ✅ 가로 간격 */
  row-gap: 8px;             /* ✅ 줄바꿈됐을 때 세로 간격 */
  align-items:center;
  justify-content:flex-start;
}

/* ---- 칩 버튼: 살짝 컴팩트하고 통일된 크기 ---- */
.chip{
  all: unset;
  box-sizing:border-box;
  display:inline-flex; align-items:center; justify-content:center;
  gap: 6px;                 /* ✅ 아이콘과 라벨 사이 간격 */
  min-width: 108px;         /* 폭 일정 (문구 길이 달라도 균형) */
  height: 34px;             /* 살짝 낮게 → 덜 답답 */
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #E5E7EB;
  background: #fff;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 34px;
  color: #343A40 !important;
  cursor: pointer;
  transition: transform .05s, box-shadow .2s, background .2s, border-color .2s;
}
.chip *{ color:#343A40 !important; }

.chip:hover{ background:#f7f9fc; box-shadow:0 2px 6px rgba(0,0,0,.05); }
.chip.on{ background:#EAF6FF; border-color:#BFE7FF; }
.chip.ghost{ background:#F5F5F5; border-color:#E5E7EB; }

.dot{ width: 8px; height: 8px; border-radius: 50%; }  /* ✅ 점 크기 살짝 축소 */

/* ---- 넓은 화면에선 간격을 약간 여유롭게 ---- */
@media (min-width: 1440px){
  .chips-inner{ column-gap: 14px; }
  .chip{ min-width: 112px; }
}

/* ---- 좁은 화면 대응: 폭 풀고 래핑 시 보기 좋게 ---- */
@media (max-width: 1200px){
  .chips-inner{ padding: 0 16px 8px; }
  .chip{ min-width: unset; padding: 0 12px; }
}

/* ===== 목록 영역: 남는 높이를 채워 달력 하단과 정렬 ===== */
.list-flex{
  flex:1;                             /* ⬅️ 오른쪽 열의 남는 높이를 차지 */
  display:flex;
  flex-direction:column;
}

/* ===== 평탄화: ScheduleList가 자체 카드(박스)를 가지고 있다면 제거 =====
   - 아래 셀렉터들은 '가능성 높은' 루트/카드 클래스에 대한 :deep 오버라이드야.
   - 실제 클래스명이 다르면, 해당 이름만 맞춰주면 됨. */
.flat-list :deep(.list-root),
.flat-list :deep(.white-box),
.flat-list :deep(.card),
.flat-list :deep(.schedule-list),
.flat-list :deep(.container){
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

/* 목록 헤더(“학사일정 목록”, +일정 추가)만 간단 제목줄처럼 보이게 */
.flat-list :deep(.list-header){
  display:flex; align-items:center; justify-content:space-between;
  padding: 0 24px 10px;               /* 칩과 좌우 라인 맞춤 */
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
  background: transparent;
  border-radius: 0;
  color:#343A40;
}

/* 리스트 아이템 카드(개별 일정)는 그대로 둬도 되고, 살짝 여백만 */
.flat-list :deep(.schedule-item){
  margin: 10px 24px;                  /* 좌우 24px로 칩/헤더와 라인 맞춤 */
}

/* (선택) 리스트 전체 스크롤이 필요하면 다음 라인 활성화
.flat-list { overflow:auto; }
*/
</style>
