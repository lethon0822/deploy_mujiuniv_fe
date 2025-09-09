<script setup>
const props = defineProps({
  title: { type: String, default: "" },
  maxHeight: { type: String, default: "100vh" },
  bodyPadding: { type: String, default: "24px" },
});
</script>

<template>
  <div
    class="white-box"
    :style="{ '--max-height': maxHeight, '--body-padding': bodyPadding }"
  >
    <!-- Header -->
    <header class="white-box__header" v-if="title || $slots.header">
      <h2 class="white-box__title" v-if="title">{{ title }}</h2>
      <div class="white-box__actions">
        <slot name="header"></slot>
      </div>
    </header>

    <!-- Body -->
    <main class="white-box__body">
      <slot></slot>
    </main>

    <!-- Footer -->
    <footer class="white-box__footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<style scoped>
.white-box {
  /* Layout */
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  max-height: var(--max-height);

  /* Visual */
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);

  /* Behavior */
  overflow: hidden;

  /* Responsive */
  min-width: 320px;
  min-height: 200px;
}

/* Header */
.white-box__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #ffffff;

  /* Sticky */
  position: sticky;
  top: 0;
  z-index: 10;
}

.white-box__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.5;
}

.white-box__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* Body */
.white-box__body {
  flex: 1;
  overflow: auto;
  padding: var(--body-padding);

  /* 스크롤바 스타일 */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.white-box__body::-webkit-scrollbar {
  width: 6px;
}

.white-box__body::-webkit-scrollbar-track {
  background: #f9fafb;
}

.white-box__body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.white-box__body::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Footer */
.white-box__footer {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  background: #ffffff;

  /* Sticky */
  position: sticky;
  bottom: 0;
  z-index: 5;
}

/* Responsive */
@media (max-width: 767px) {
  .white-box {
    border-radius: 8px;
    min-width: 280px;
  }

  .white-box__header,
  .white-box__footer {
    padding: 16px 20px;
  }

  .white-box__title {
    font-size: 1rem;
  }

  .white-box__body {
    --body-padding: 20px;
  }
}

@media (max-width: 480px) {
  .white-box {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .white-box__header,
  .white-box__footer {
    padding: 12px 16px;
  }

  .white-box__body {
    --body-padding: 16px;
  }
}
</style>
