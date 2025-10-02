<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Notices from "@/components/common/Notices.vue";
import CombinedScheduleView from "@/components/schedule/CombinedScheduleView.vue";

const selectedDate = ref(new Date());

const loadWidgetOrder = () => {
  const savedOrder = sessionStorage.getItem("widgetOrder");
  if (savedOrder) {
    try {
      const parsedOrder = JSON.parse(savedOrder);
      if (Array.isArray(parsedOrder) && parsedOrder.length > 0) {
        return parsedOrder;
      }
    } catch (e) {
      console.error("위젯 순서 파싱 실패:", e);
    }
  }
  return ["notices", "schedule"];
};

const widgetOrder = ref(loadWidgetOrder());
const isDragging = ref(false);
const draggedWidget = ref(null);
const draggedElement = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
const dragPosition = ref({ x: 0, y: 0 });
const dropTarget = ref(null);
const originalPositions = ref({});
const dragStartTime = ref(0);
const hasMoved = ref(false);

const saveWidgetOrder = () => {
  sessionStorage.setItem("widgetOrder", JSON.stringify(widgetOrder.value));
};

const startDrag = (e, widgetType) => {
  // e.preventDefault();

  dragStartTime.value = Date.now();
  hasMoved.value = false;
  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

  const widgetElement = e.currentTarget.closest("[data-widget-type]");
  const rect = widgetElement.getBoundingClientRect();

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

  const originalX =
    originalPositions.value[draggedWidget.value]?.x + dragOffset.value.x;
  const originalY =
    originalPositions.value[draggedWidget.value]?.y + dragOffset.value.y;

  const deltaX = Math.abs(clientX - originalX);
  const deltaY = Math.abs(clientY - originalY);

  if (deltaX > 10 || deltaY > 10 || Date.now() - dragStartTime.value > 300) {
    startActualDrag(e);
  }
  if (e.type.includes("touch")) {
    e.preventDefault();
  }
};

const startActualDrag = (e) => {
  if (isDragging.value) return;
  isDragging.value = true;
  hasMoved.value = true;
  const targetWidgetSelector = `[data-widget-type="${draggedWidget.value}"]`;
  const rect = document
    .querySelector(targetWidgetSelector)
    .getBoundingClientRect();
  const clone = document.querySelector(targetWidgetSelector).cloneNode(true);
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
  document.removeEventListener("mousemove", handlePreMove);
  document.removeEventListener("mouseup", handlePreEnd);
  document.removeEventListener("touchmove", handlePreMove);
  document.removeEventListener("touchend", handlePreEnd);
  if (e.type.includes("touch")) {
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
  } else {
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);
  }
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
  // 모든 이벤트 리스너 제거
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
        return { type: "schedule", component: CombinedScheduleView };
      return null;
    })
    .filter(Boolean);
});

watch(widgetOrder, saveWidgetOrder, { deep: true });
</script>

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

      <CombinedScheduleView
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
  margin-top: 40px;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
}

.widget-container {
  cursor: grab;
  border-radius: 12px;
  user-select: none;
  overflow: hidden;
}

.widget-container:active:not(.dragging-mode) {
  cursor: grabbing;
}

.widget-container:active:not(.dragging-mode) {
  cursor: grabbing;
}

.placeholder {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 12px;
  filter: grayscale(50%) brightness(90%);
  pointer-events: none;
  user-select: none;
  transform: scale(0.95);
  transition: transform 0.3s ease;
}

.drop-target {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 12px 35px rgba(63, 126, 166, 0.3);
  animation: pulse 1s infinite alternate;
}

/* 드래그 중이 아닐 때, 모든 내부 요소는 정상 작동 */
.widget-container:not(.dragging-mode) :deep(button),
.widget-container:not(.dragging-mode) :deep(input),
.widget-container:not(.dragging-mode) :deep(textarea),
.widget-container:not(.dragging-mode) :deep(select),
.widget-container:not(.dragging-mode) :deep(a),
.widget-container:not(.dragging-mode) :deep(.nav),
.widget-container:not(.dragging-mode) :deep(.add),
.widget-container:not(.dragging-mode) :deep(.card),
.widget-container:not(.dragging-mode) :deep(.day-cell),
.widget-container:not(.dragging-mode) :deep(.d) {
  pointer-events: auto;
  cursor: pointer;
}

/* 드래그 중일 때는 모든 위젯의 내부 요소들 비활성화 */
.dragging-mode :deep(div),
.dragging-mode :deep(button),
.dragging-mode :deep(input),
.dragging-mode :deep(textarea),
.dragging-mode :deep(select),
.dragging-mode :deep(a),
.dragging-mode :deep(.nav),
.dragging-mode :deep(.add),
.dragging-mode :deep(.card),
.dragging-mode :deep(.day-cell),
.dragging-mode :deep(.d),
.dragging-mode :deep(.li) {
  pointer-events: none;
  cursor: default;
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

/* 모바일 */
@media (max-width: 767px) {
  .home-widgets {
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
    padding: 0 10px;
  }

  .home-widgets :deep(.compact-notice-widget) {
    width: calc(100vw - 20px) !important;
    max-width: 100% !important;
    min-width: 300px !important;
  }
}

:deep(.list-enter-active),
:deep(.list-leave-active),
:deep(.list-move) {
  transition: all 0.5s ease;
}

:deep(.list-enter-from),
:deep(.list-leave-to) {
  opacity: 0;
  transform: translateY(20px);
}

:deep(.list-leave-active) {
  position: absolute;
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .home-widgets {
    flex-direction: column;
    align-items: center;
  }

  .home-widgets :deep(.compact-notice-widget) {
    width: 90vw !important;
    max-width: 700px !important;
    min-width: 500px !important;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .home-widgets :deep(.compact-notice-widget) {
    width: 600px !important;
    max-width: 600px !important;
    min-width: 600px !important;
  }
}
</style>
