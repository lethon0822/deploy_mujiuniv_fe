<script setup>
import { watch, ref, onMounted, onUnmounted } from "vue";
import Calendar from "@/components/schedule/Calendar.vue";
import ScheduleWidget from "@/components/schedule/ScheduleWidget.vue";

const props = defineProps({
  selected: { type: Date, required: true },
  selectedTypes: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:selected"]);

// ✅ 부모가 넘겨준 selected를 reactive하게 감시
const handleUpdateSelected = (newDate) => {
  emit("update:selected", newDate); // 부모에게 전달 (상위에서 관리 중)
};

// 키보드 이벤트 막기
const handleKeyDown = (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.stopPropagation();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown, { capture: true });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown, { capture: true });
});
</script>

<template>
  <div class="schedule-combined-view">
    <div class="calendar-container">
      <Calendar
        :selected="props.selected"
        @update:selected="handleUpdateSelected"
        :selectedTypes="props.selectedTypes"
      />
    </div>

    <div class="schedule-widget-container">
      <ScheduleWidget
        :selected="props.selected"
        :selectedTypes="props.selectedTypes"
      />
    </div>
  </div>
</template>

<style scoped>
.schedule-combined-view {
  display: flex;
  flex-direction: row;
  height: 430px;
  min-width: 800px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
}

.calendar-container {
  width: 400px;
  box-sizing: border-box;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
  position: relative;
}

.schedule-widget-container {
  flex-grow: 1;
  min-width: 300px;
  padding: 14px 14px 14px 16px;
  box-sizing: border-box;
}

.calendar-container :deep(.calendar) {
  transform: scale(0.9);
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: 100% !important;
}

.calendar-container :deep(.day-cell) {
  height: 48px !important;
  padding: 4px !important;
  border: none !important;
  background: white !important;
}

.calendar-container :deep(.calendar-grid) .day-cell {
  border-right: none !important;
  border-bottom: none !important;
}

.calendar-container :deep(.calendar-header) {
  padding: 20px !important;
  border-bottom: none !important;
}

.calendar-container :deep(.day-headers) {
  border-top: 1px solid #f0f0f0 !important;
  border-bottom: 1px solid #f0f0f0 !important;
  background: white !important;
}

.calendar-container :deep(.event-bar) {
  display: none !important;
}

.calendar-container :deep(.day-number) {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
}

.schedule-widget-container :deep(.widget) {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 모바일  */
@media (max-width: 767px) {
  .schedule-combined-view {
    min-width: 400px;
  }

  .calendar-container {
    display: none;
  }

  .schedule-widget-container {
    width: 100%;
    padding: 14px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .schedule-combined-view {
    transform: scale(0.9);
    transform-origin: top center;
    margin-bottom: -45px;
  }
}
</style>
