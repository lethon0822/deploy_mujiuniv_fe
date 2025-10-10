<script setup>
import { ref } from "vue";
import Calendar from "@/components/schedule/Calendar.vue";
import ScheduleList from "@/components/schedule/ScheduleList.vue";
import ScheduleModal from "@/components/schedule/ScheduleModal.vue";
import { ymd } from "@/services/date";
import { TYPE_ORDER, TYPE_META } from "@/constants/scheduleTypes";
import { useUserStore } from "@/stores/account";
import { getScheduleBySemesterAndType } from "@/services/scheduleService";

const userStore = useUserStore();
const selectedDate = ref(new Date());
const selectedYmd = ref(ymd(selectedDate.value));
const modalOpen = ref(false);
const editItem = ref(null);
const DEFAULT_SEMESTER_ID = userStore.state.signedUser?.semesterId || 0;

// 타입 필터 - 처음에는 모두 선택
const selectedTypes = ref([...TYPE_ORDER]);

const calendarRef = ref(null);
const listRef = ref(null);

const onDateClick = (d) => {
  selectedDate.value = d;
  selectedYmd.value = ymd(d);
};

const openCreate = () => {
  editItem.value = null;
  modalOpen.value = true;
};
const openEdit = (item) => {
  editItem.value = item;
  modalOpen.value = true;
};
const handleSaved = () => {
  calendarRef.value?.refresh();
  listRef.value?.refresh();
};

const jumpToType = async (t) => {
  // 이미 선택된 타입이면 해제, 아니면 해당 타입만 선택
  if (selectedTypes.value.length === 1 && selectedTypes.value[0] === t) {
    selectedTypes.value = [...TYPE_ORDER]; // 전체 보기로 복귀
  } else {
    selectedTypes.value = [t]; // 해당 타입만 선택
  }

  // 타입을 선택했을 때만 해당 일정으로 이동
  if (selectedTypes.value.length === 1) {
    try {
      const target = await getScheduleBySemesterAndType(DEFAULT_SEMESTER_ID, t);
      if (target) {
        const d = new Date(target.startDatetime);
        selectedDate.value = d;
        selectedYmd.value = ymd(d);
      } else {
        console.warn("해당 학기에는 이 타입 일정 없음:", t);
      }
    } catch (e) {
      console.error("jumpToType error", e);
    }
  }
};
</script>

<template>
  <div class="wrap">
    <!-- 좌: Calendar -->
    <div class="left">
      <Calendar
        ref="calendarRef"
        class="cal"
        v-model:selectedDate="selectedDate"
        @date-click="onDateClick"
      />
    </div>

    <!-- 우: 칩 + 학사일정 목록 -->
    <div class="right">
      <div class="chips-row">
        <div class="chips-inner">
          <button
            v-for="t in TYPE_ORDER"
            :key="t"
            class="chip"
            :class="{
              on: selectedTypes.length === 1 && selectedTypes.includes(t),
            }"
            @click="jumpToType(t)"
          >
            <i class="dot" :style="{ background: TYPE_META[t]?.color }"></i
            >{{ t }}
          </button>
        </div>
      </div>

      <div class="list-flex">
        <ScheduleList
          ref="listRef"
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
.wrap {
  display: grid;
  grid-template-columns: 1fr 560px;
  gap: 28px;
  align-items: stretch;
  width: 89%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 0;
  font-size: 16.5px;
}

.left {
  display: flex;
}

.right {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.chips-row {
  width: 100%;
  margin-bottom: 10px;
}

.chips-inner {
  padding: 0 24px 8px;
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.chip {
  all: unset;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 108px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 34px;
  color: #343a40 !important;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.chip:hover {
  background: #f7f9fc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.chip:active {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chip.on {
  background: #eaf6ff;
  border-color: #bfe7ff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  transform: scale(1.02);
}

.chip.on:hover {
  background: #d6f0ff;
  transform: scale(1.02) translateY(-1px);
}

.chip.on:active {
  transform: scale(0.98);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.list-flex {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.flat-list :deep(.list-root),
.flat-list :deep(.white-box),
.flat-list :deep(.card),
.flat-list :deep(.schedule-list),
.flat-list :deep(.container) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
}

.flat-list :deep(.list-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
  background: transparent;
  border-radius: 0;
  color: #343a40;
}

.flat-list :deep(.schedule-item) {
  margin: 10px 24px;
}

/* 태블릿 */
@media (max-width: 1023px) {
  .wrap {
    display: block;
    padding: 16px;
    max-width: none;
  }

  .left {
    margin-bottom: 20px;
  }

  .right {
    margin-top: 0;
  }

  .chips-inner {
    padding: 0 16px 8px;
    column-gap: 8px;
  }

  .chip {
    min-width: 90px;
    height: 32px;
    font-size: 12px;
    padding: 0 10px;
  }

  .flat-list :deep(.list-header) {
    padding: 0 16px 8px;
  }

  .flat-list :deep(.schedule-item) {
    margin: 8px 16px;
  }
}

/* 모바일 */
@media (max-width: 767px) {
  .wrap {
    padding: 12px;
    font-size: 14px;
  }

  .chips-inner {
    padding: 0 12px 8px;
    gap: 6px;
  }

  .chip {
    min-width: 80px;
    height: 30px;
    font-size: 11px;
    padding: 0 8px;
    gap: 4px;
  }

  .dot {
    width: 6px;
    height: 6px;
  }

  .flat-list :deep(.list-header) {
    padding: 0 12px 6px;
    font-size: 14px;
  }

  .flat-list :deep(.schedule-item) {
    margin: 6px 12px;
  }
}

/* ===== 아주 작은 화면 (480px 이하) ===== */
@media (max-width: 480px) {
  .chips-inner {
    justify-content: center;
  }

  .chip {
    flex: 1;
    min-width: 70px;
    max-width: 100px;
  }
}
</style>
