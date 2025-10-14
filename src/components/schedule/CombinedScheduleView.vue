<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import Calendar from "@/components/schedule/Calendar.vue";
import ScheduleWidget from "@/components/schedule/ScheduleWidget.vue";

const props = defineProps({
  selected: { type: Date, required: true },
  selectedTypes: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:selected"]);

// ✅ 내부에서 timestamp(숫자)로 관리하면 Date 객체 참조 이슈가 사라짐
const localTimestamp = ref(props.selected.getTime());

// ✅ 부모 → 자식 동기화
watch(
  () => props.selected,
  (val) => {
    const time = val?.getTime?.() ?? new Date(val).getTime();
    if (time !== localTimestamp.value) {
      localTimestamp.value = time;
    }
  }
);

// ✅ 자식 → 부모 동기화
watch(localTimestamp, (val) => {
  emit("update:selected", new Date(val));
});

// ✅ Date 변환용 computed (v-model:selected에서 사용)
const localSelected = computed({
  get: () => new Date(localTimestamp.value),
  set: (v) => (localTimestamp.value = v.getTime()),
});

// ✅ 키보드 이벤트 방지
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
        v-model:selected="localSelected"
        :selectedTypes="props.selectedTypes"
      />
    </div>

    <div class="schedule-widget-container">
      <ScheduleWidget
        v-model:selected="localSelected"
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
  padding: 20px 30px 20px 20px;
  box-sizing: border-box;
}

/* 📅 달력 스타일 정리 */
.calendar-container :deep(.calendar) {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: 100% !important;
}

.calendar-container :deep(.day-cell) {
  display: flex;
  justify-content: center;
  align-items: center; 
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
  align-items: center;
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
}

/* 📋 위젯 스타일 */
.schedule-widget-container :deep(.widget) {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
}

/* 📱 모바일 */
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

/* 💻 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .schedule-combined-view {
    transform: scale(0.9);
    transform-origin: top center;
    margin-bottom: -45px;
  }

  .schedule-widget-container {
    padding: 20px 30px 20px 30px !important;
  }

  .calendar-container {
    width: 450px;
  }
}
</style>
