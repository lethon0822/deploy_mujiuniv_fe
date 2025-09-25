<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Notices from "@/components/common/Notices.vue";
import ScheduleWidget from "@/components/schedule/ScheduleWidget.vue";
import { useUserStore } from "@/stores/account";

// This is the correct variable name, and it is initialized with a Date object.
const selectedDate = ref(new Date());
const userStore = useUserStore();

const widgetOrder = ref(["notices", "schedule"]);
const isDragging = ref(false);
const draggedWidget = ref(null);
const draggedElement = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
const dragPosition = ref({ x: 0, y: 0 });
const dropTarget = ref(null);
const originalPositions = ref({});
const dragStartTime = ref(0);
const hasMoved = ref(false);

const BASE_URL = import.meta.env.VITE_BASE_URL;

const loadWidgetOrder = () => {
  const savedOrder = sessionStorage.getItem("widgetOrder");
  if (savedOrder) {
    try {
      const parsedOrder = JSON.parse(savedOrder);
      if (Array.isArray(parsedOrder)) {
        widgetOrder.value = parsedOrder;
      }
    } catch (e) {
      console.error("위젯 순서 파싱 실패:", e);
      widgetOrder.value = ["notices", "schedule"];
    }
  }
};

const saveWidgetOrder = () => {
  sessionStorage.setItem("widgetOrder", JSON.stringify(widgetOrder.value));
};

const isDraggableTarget = (element) => {
  const nonDraggableSelectors = [
    "button",
    "input",
    "textarea",
    "select",
    "a",
    "[contenteditable]",
    ".nav",
    ".add",
    ".li",
    ".card",
    ".day-cell",
  ];
  for (const selector of nonDraggableSelectors) {
    if (element.matches?.(selector) || element.closest?.(selector)) {
      return false;
    }
  }
  return true;
};

const startDrag = (e, widgetType) => {
  if (!isDraggableTarget(e.target)) return;
  e.preventDefault();
  dragStartTime.value = Date.now();
  hasMoved.value = false;
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
  const rect = e.currentTarget.getBoundingClientRect();
  originalPositions.value[widgetType] = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
  dragOffset.value = { x: clientX - rect.left, y: clientY - rect.top };
  dragPosition.value = { x: rect.left, y: rect.top };
  draggedWidget.value = widgetType;
  if (e.type.includes("touch")) {
    document.addEventListener("touchmove", handlePreMove, { passive: false });
    document.addEventListener("touchend", handlePreEnd);
  } else {
    document.addEventListener("mousemove", handlePreMove);
    document.addEventListener("mouseup", handlePreEnd);
  }
};

const handlePreMove = (e) => {
  if (isDragging.value) {
    handleMove(e);
    return;
  }
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
  const deltaX = Math.abs(
    clientX -
      (originalPositions.value[draggedWidget.value]?.x + dragOffset.value.x)
  );
  const deltaY = Math.abs(
    clientY -
      (originalPositions.value[draggedWidget.value]?.y + dragOffset.value.y)
  );
  if (deltaX > 5 || deltaY > 5 || Date.now() - dragStartTime.value > 200) {
    startActualDrag(e);
  }
};

const startActualDrag = (e) => {
  if (isDragging.value) return;
  isDragging.value = true;
  hasMoved.value = true;
  const rect = document
    .querySelector(`[data-widget-type="${draggedWidget.value}"]`)
    .getBoundingClientRect();
  const clone = document
    .querySelector(`[data-widget-type="${draggedWidget.value}"]`)
    .cloneNode(true);
  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.zIndex = "9999";
  clone.style.pointerEvents = "none";
  clone.style.transition = "none";
  clone.style.transform = "none";
  clone.style.boxShadow = "0 10px 30px rgba(0,0,0,0.3)";
  clone.classList.add("dragging-widget", "no-transition");
  document.body.appendChild(clone);
  draggedElement.value = clone;
  handleMove(e);
};

const handleMove = (e) => {
  if (!isDragging.value || !draggedElement.value) return;
  e.preventDefault();
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
  dragPosition.value = {
    x: clientX - dragOffset.value.x,
    y: clientY - dragOffset.value.y,
  };
  draggedElement.value.style.left = dragPosition.value.x + "px";
  draggedElement.value.style.top = dragPosition.value.y + "px";
  const elementBelow = document.elementFromPoint(clientX, clientY);
  const targetWidget = elementBelow?.closest(
    ".widget-container:not(.placeholder)"
  );
  if (targetWidget) {
    const widgetType = targetWidget.dataset.widgetType;
    dropTarget.value =
      widgetType && widgetType !== draggedWidget.value ? widgetType : null;
  } else {
    dropTarget.value = null;
  }
};

const handlePreEnd = (e) => {
  if (isDragging.value) {
    handleEnd(e);
    return;
  }
  cleanup();
};

const handleEnd = (e) => {
  if (!isDragging.value) return;
  if (dropTarget.value) {
    const fromIndex = widgetOrder.value.indexOf(draggedWidget.value);
    const toIndex = widgetOrder.value.indexOf(dropTarget.value);
    if (fromIndex !== -1 && toIndex !== -1) {
      const newOrder = [...widgetOrder.value];
      const item = newOrder.splice(fromIndex, 1)[0];
      newOrder.splice(toIndex, 0, item);
      widgetOrder.value = newOrder;
      saveWidgetOrder();
    }
  }
  cleanup();
};

const cleanup = () => {
  if (draggedElement.value) {
    draggedElement.value.remove();
    draggedElement.value = null;
  }
  isDragging.value = false;
  draggedWidget.value = null;
  dropTarget.value = null;
  hasMoved.value = false;
  document.removeEventListener("mousemove", handlePreMove);
  document.removeEventListener("mouseup", handlePreEnd);
  document.removeEventListener("touchmove", handlePreMove);
  document.removeEventListener("touchend", handlePreEnd);
  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseup", handleEnd);
  document.removeEventListener("touchmove", handleMove);
  document.removeEventListener("touchend", handleEnd);
};

const sortedWidgets = computed(() => {
  return widgetOrder.value
    .map((widgetType) => {
      if (widgetType === "notices")
        return { type: "notices", component: Notices };
      if (widgetType === "schedule")
        return { type: "schedule", component: ScheduleWidget };
      return null;
    })
    .filter(Boolean);
});

watch(widgetOrder, saveWidgetOrder, { deep: true });

onMounted(() => {
  loadWidgetOrder();
});
</script>

--- ### **Corrected Parent Component Template** ```vue
<template>
  <transition-group name="list" tag="div" class="home-widgets">
    <div
      v-for="widget in sortedWidgets"
      :key="widget.type"
      class="widget-container"
      :class="{
        placeholder: isDragging && draggedWidget === widget.type,
        'drop-target': dropTarget === widget.type,
        'dragging-mode': isDragging,
      }"
      :data-widget-type="widget.type"
      @mousedown="startDrag($event, widget.type)"
      @touchstart="startDrag($event, widget.type)"
    >
      <Notices v-if="widget.type === 'notices'" />

      <ScheduleWidget
        v-if="widget.type === 'schedule'"
        :selected="selectedDate"
        @update:selected="selectedDate = $event"
      />
    </div>
  </transition-group>
</template>

<style scoped>
.home-widgets {
  display: flex;
  margin-top: 20px;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
}

.widget-container {
  cursor: grab;
  border-radius: 12px;
  transition: all 0.2s ease;
  user-select: none;
  overflow: hidden;
}

.widget-container:hover:not(.dragging-mode) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-container:active:not(.dragging-mode) {
  cursor: grabbing;
}

/* 드래그 모드가 아닐 때만 내부 요소들이 정상 작동 */
.widget-container:not(.dragging-mode) :deep(button),
.widget-container:not(.dragging-mode) :deep(input),
.widget-container:not(.dragging-mode) :deep(a),
.widget-container:not(.dragging-mode) :deep(.nav),
.widget-container:not(.dragging-mode) :deep(.add),
.widget-container:not(.dragging-mode) :deep(.li),
.widget-container:not(.dragging-mode) :deep(.card),
.widget-container:not(.dragging-mode) :deep(.day-cell) {
  pointer-events: auto;
  cursor: pointer;
}

.placeholder {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 12px;
  filter: grayscale(50%) brightness(90%);
  pointer-events: none;
  user-select: none;
  transform: scale(0.95);
}

.drop-target {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 12px 35px rgba(63, 126, 166, 0.3);
  animation: pulse 1s infinite alternate;
}

/* 드래그 중일 때는 모든 위젯의 내부 요소들 비활성화 */
.dragging-mode :deep(button),
.dragging-mode :deep(input),
.dragging-mode :deep(a),
.dragging-mode :deep(.nav),
.dragging-mode :deep(.add),
.dragging-mode :deep(.li),
.dragging-mode :deep(.card),
.dragging-mode :deep(.day-cell) {
  pointer-events: none;
}

:global(.no-transition) {
  transition: none !important;
}

@keyframes pulse {
  0% {
    transform: scale(1.05);
    box-shadow: 0 12px 35px rgba(63, 126, 166, 0.3);
  }
  100% {
    transform: scale(1.07);
    box-shadow: 0 16px 40px rgba(63, 126, 166, 0.5);
  }
}

:global(.dragging-widget) {
  border-radius: 12px !important;
  cursor: grabbing !important;
}

.home-widgets :deep(.compact-notice-widget) {
  width: 600px !important;
  max-width: 600px !important;
  min-width: 600px !important;
}

:deep(.list-enter-active),
:deep(.list-leave-active) {
  transition: all 10s ease;
}

:deep(.list-enter-from),
:deep(.list-leave-to) {
  opacity: 0;
  transform: translateY(20px);
}

:deep(.list-enter-to),
:deep(.list-leave-from) {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1023px) {
  .home-widgets {
    flex-direction: column;
    align-items: center;
  }

  .home-widgets :deep(.compact-notice-widget) {
    width: 90vw !important;
    max-width: 90vw !important;
    min-width: 300px !important;
  }
}
</style>
