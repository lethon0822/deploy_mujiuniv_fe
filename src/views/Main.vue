<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Notices from "@/components/common/Notices.vue";
import ScheduleWidget from "@/components/schedule/ScheduleWidget.vue";
import { useUserStore } from "@/stores/account";

const selectedDate = ref(new Date());
const userStore = useUserStore();

const widgetOrder = ref(["notices", "schedule"]);

const draggedItem = ref(null);
const isDragging = ref(false);

const BASE_URL = import.meta.env.VITE_BASE_URL;

const loadWidgetOrder = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/user-settings/widget-order`);
    if (!response.ok) {
      console.error(
        "Failed to load widget order:",
        response.status,
        response.statusText
      );
      return;
    }
    const savedOrder = await response.json();
    if (savedOrder && Array.isArray(savedOrder)) {
      widgetOrder.value = savedOrder;
    }
  } catch (error) {
    console.warn("위젯 순서 로드 실패:", error);
  }
};

const saveWidgetOrder = async () => {
  try {
    await fetch(`${BASE_URL}/api/user-settings/widget-order`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(widgetOrder.value),
    });
  } catch (error) {
    console.error("위젯 순서 저장 실패:", error);
  }
};

const handleDragStart = (e, widgetType) => {
  draggedItem.value = widgetType;
  isDragging.value = true;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", widgetType);

  const dragImage = e.target.cloneNode(true);
  dragImage.style.transform = "rotate(5deg)";
  dragImage.style.opacity = "0.8";
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, 50, 50);
  setTimeout(() => document.body.removeChild(dragImage), 0);
};

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

const handleDrop = (e, targetWidgetType) => {
  e.preventDefault();

  const sourceWidget = draggedItem.value;
  if (sourceWidget && sourceWidget !== targetWidgetType) {
    const sourceIndex = widgetOrder.value.indexOf(sourceWidget);
    const targetIndex = widgetOrder.value.indexOf(targetWidgetType);

    widgetOrder.value[sourceIndex] = targetWidgetType;
    widgetOrder.value[targetIndex] = sourceWidget;

    saveWidgetOrder();
  }

  draggedItem.value = null;
  isDragging.value = false;
};

const handleDragEnd = () => {
  draggedItem.value = null;
  isDragging.value = false;
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
  <div class="home-widgets" :class="{ dragging: isDragging }">
    <div
      v-for="widget in sortedWidgets"
      :key="widget.type"
      class="widget-container"
      :draggable="true"
      :class="{
        'being-dragged': draggedItem === widget.type,
        'drag-target': draggedItem && draggedItem !== widget.type,
      }"
      @dragstart="handleDragStart($event, widget.type)"
      @dragover="handleDragOver"
      @drop="handleDrop($event, widget.type)"
      @dragend="handleDragEnd"
    >
      <!-- 드래그 핸들 -->
      <div class="drag-handle" title="드래그해서 위치 변경">
        <i class="bi bi-grip-vertical"></i>
      </div>

      <!-- 공지사항 위젯 -->
      <Notices v-if="widget.type === 'notices'" />

      <!-- 스케줄 위젯 -->
      <ScheduleWidget
        v-else-if="widget.type === 'schedule'"
        :selected="selectedDate"
      />
    </div>
  </div>
</template>

<style scoped>
.home-widgets {
  display: flex;
  margin-top: 20px;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.widget-container {
  position: relative;
  cursor: grab;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.widget-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-container:active {
  cursor: grabbing;
}

.being-dragged {
  opacity: 0.5;
  transform: rotate(5deg) scale(0.95);
  z-index: 1000;
}

.drag-target {
  border: 2px dashed #3f7ea6;
  background-color: rgba(63, 126, 166, 0.05);
}

.dragging .widget-container:not(.being-dragged) {
  opacity: 0.7;
}

.drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  color: #666;
  font-size: 12px;
}

.widget-container:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  background: white;
  border-color: #3f7ea6;
  color: #3f7ea6;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 기존 위젯 크기 설정 */
.home-widgets :deep(.compact-notice-widget) {
  width: 600px !important;
  max-width: 600px !important;
  min-width: 600px !important;
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

  .drag-handle {
    display: none;
  }
}
</style>
