<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import Notices from "@/components/common/Notices.vue";
import ScheduleWidget from "@/components/schedule/ScheduleWidget.vue";
import { useUserStore } from "@/stores/account";

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

const startDrag = (e, widgetType) => {
  e.preventDefault();

  const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

  const rect = e.currentTarget.getBoundingClientRect();

  originalPositions.value[widgetType] = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };

  dragOffset.value = {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };

  dragPosition.value = {
    x: rect.left,
    y: rect.top,
  };

  isDragging.value = true;
  draggedWidget.value = widgetType;

  const clone = e.currentTarget.cloneNode(true);
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
  clone.classList.add("dragging-widget");
  clone.classList.add("no-transition");

  document.body.appendChild(clone);
  draggedElement.value = clone;

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
    if (widgetType && widgetType !== draggedWidget.value) {
      dropTarget.value = widgetType;
    } else {
      dropTarget.value = null;
    }
  } else {
    dropTarget.value = null;
  }
};

const handleEnd = (e) => {
  if (!isDragging.value) return;

  const clientX = e.type.includes("touch")
    ? e.changedTouches[0].clientX
    : e.clientX;
  const clientY = e.type.includes("touch")
    ? e.changedTouches[0].clientY
    : e.clientY;

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

  if (draggedElement.value) {
    draggedElement.value.remove();
    draggedElement.value = null;
  }

  isDragging.value = false;
  draggedWidget.value = null;
  dropTarget.value = null;

  document.removeEventListener("mousemove", handleMove);
  document.removeEventListener("mouseup", handleEnd);
  document.removeEventListener("touchmove", handleMove);
  document.removeEventListener("touchend", handleEnd);
};

const sortedWidgets = computed(() => {
  return widgetOrder.value
    .map((widgetType) => {
      if (widgetType === "notices") {
        return { type: "notices", component: Notices };
      } else if (widgetType === "schedule") {
        return { type: "schedule", component: ScheduleWidget };
      }
      return null;
    })
    .filter(Boolean);
});

watch(
  widgetOrder,
  () => {
    saveWidgetOrder();
  },
  { deep: true }
);

onMounted(() => {
  loadWidgetOrder();
});
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
      }"
      :data-widget-type="widget.type"
      @mousedown="startDrag($event, widget.type)"
      @touchstart="startDrag($event, widget.type)"
    >
      <Notices v-if="widget.type === 'notices'" />
      <ScheduleWidget
        v-else-if="widget.type === 'schedule'"
        :selected="selectedDate"
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

.widget-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-container:active {
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
}

.drop-target {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 12px 35px rgba(63, 126, 166, 0.3);

  animation: pulse 1s infinite alternate;
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
