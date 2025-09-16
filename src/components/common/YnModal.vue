<script setup>
import { defineEmits, onMounted, onUnmounted } from "vue";

const props = defineProps({
  content: { type: String, default: "작업이 성공적으로 완료되었습니다." },
  type: { type: String, default: "success" },
});

const emit = defineEmits(["close"]);

const close = () => {
  emit("close");
};

const handleKeyup = (event) => {
  if (event.key === "Enter" || event.key === "Escape") {
    close();
  }
};

onMounted(() => {
  window.addEventListener("keyup", handleKeyup);
});

onUnmounted(() => {
  window.removeEventListener("keyup", handleKeyup);
});
</script>

<template>
  <div class="modal-overlay" @click="close">
    <div class="modal-frame" @click.stop>
      <div class="modal-header">
        <div class="icon-container" :class="type">
          <div class="icon-circle">
            <span v-if="type === 'success'" class="icon-check"></span>
            <span v-else class="icon-warning">!</span>
          </div>
        </div>
        <button type="button" class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="modal-content">
        <h3 class="modal-title" :class="type">
          {{ type === "success" ? "Success!" : "Warning!" }}
        </h3>
        <p class="modal-message">{{ props.content }}</p>
        <div class="modal-actions">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 100px;
  z-index: 1000;
}

.modal-frame {
  width: 400px;
  min-height: 250px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(-20px);
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.modal-header {
  display: flex;
  justify-content: center;
  padding-top: 30px;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: relative;
}

.icon-container.success {
  background-color: rgba(76, 175, 80, 0.1);
}

.icon-container.warning {
  background-color: rgba(255, 107, 107, 0.1);
}

.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.success .icon-circle {
  background: linear-gradient(
    to right,
    #aef4c3,
    #83e9b9,
    #57deb0,
    #2cd3a9,
    #00c9a7
  );
  animation: iconPulse 0.6s ease-out;
}

.warning .icon-circle {
  background-color: #ff6b6b;
  animation: iconPulse 0.6s ease-out;
}

.icon-check {
  display: block;
  width: 20px;
  height: 30px;
  border: solid white;
  border-width: 0 4px 4px 0;
  transform: rotate(45deg);
  opacity: 0;
  animation: checkFadeIn 0.5s ease-out 0.3s forwards;
}

.icon-warning {
  font-family: "Arial", sans-serif;
  color: #fff;
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  opacity: 0;
  animation: warningFadeIn 0.5s ease-out 0.3s forwards;
}

.modal-content {
  padding: 30px;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #333;
}

.modal-title.success {
  color: #79d8c0;
}

.modal-title.warning {
  color: #ff6b6b;
}

.modal-message {
  font-size: 15px;
  font-weight: 400;
  color: #7e7e7e;
  margin-bottom: 25px;
  line-height: 1.5;
}

.modal-actions {
  gap: 15px;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
  color: #888;
  transition: color 0.2s ease-in-out;
}

.close-btn:hover {
  color: #333;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes checkFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes warningFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 480px) {
  .modal-frame {
    width: 90%;
    max-width: 350px;
  }

  .icon-container {
    width: 70px;
    height: 70px;
  }

  .icon-circle {
    width: 50px;
    height: 50px;
  }

  .icon-check {
    width: 18px;
    height: 28px;
  }

  .icon-warning {
    font-size: 32px;
  }

  .modal-content {
    padding: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-message {
    font-size: 14px;
  }
}
</style>
