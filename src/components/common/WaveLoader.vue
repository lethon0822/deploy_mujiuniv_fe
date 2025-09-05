<script setup></script>

<template>
  <div class="wave-loader">
    <div class="wave-bar"></div>
    <div class="wave-bar"></div>
    <div class="wave-bar"></div>
    <div class="wave-bar"></div>
    <div class="wave-bar"></div>
  </div>
</template>

<style scoped>
.wave-loader {
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 4px;
  height: 60px;
}

.wave-bar {
  width: 8px;
  height: 40px;
  background: #4ecdc4;
  border-radius: 4px;
  animation: wave 1.2s ease-in-out infinite;
}

.wave-bar:nth-child(1) {
  animation-delay: 0s;
  background: #4ecdc4;
}

.wave-bar:nth-child(2) {
  animation-delay: 0.1s;
  background: #ff6b9d;
}

.wave-bar:nth-child(3) {
  animation-delay: 0.2s;
  background: #ffb74d;
}

.wave-bar:nth-child(4) {
  animation-delay: 0.3s;
  background: #4ecdc4;
}

.wave-bar:nth-child(5) {
  animation-delay: 0.4s;
  background: #ff6b9d;
}

@keyframes wave {
  0%,
  40%,
  100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}
</style>
