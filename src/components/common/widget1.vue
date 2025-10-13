<script setup>
import { useUserStore } from "@/stores/account";
const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const userStore = useUserStore();
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <!-- <div class="privacy">
        <h2>{{ userStore.state.signedUser.userName }}</h2>
        <div class="user-info">{{ userStore.state.signedUser.loginId }}</div>
        <div class="user-info">{{ userStore.state.signedUser.deptName }}</div>
      </div> -->
      <div class="quick-menu">
        <div class="header">
          <i class="bi bi-lightning-charge"></i>
          <h3>빠른메뉴</h3>
        </div>
        <template v-if="userStore.state.signedUser.userRole === 'student'">
          <div class="quick-btn-grid">
            <router-link :to="`${student}/grade/permanent`">
              <button class="quick-btn">
                <i class="bi bi-file-earmark-text"></i>
                <span>영구성적조회</span>
              </button>
            </router-link>
            <router-link to="/application">
              <button class="quick-btn">
                <i class="bi bi-file-earmark-check"></i>
                <span>휴·복학신청</span>
              </button>
            </router-link>
            <router-link to="/renewal/privacy">
              <button class="quick-btn">
                <i class="bi bi-person-gear"></i>
                <span>개인정보변경</span>
              </button>
            </router-link>
            <router-link :to="`${student}/grade/permanent`">
              <button class="quick-btn">
                <i class="bi bi-mortarboard"></i>
                <span>졸업자가진단</span>
              </button>
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.privacy {
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.privacy h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.user-info {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.quick-menu {
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.header i {
  font-size: 18px;
  color: #6b7280;
}

.header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.quick-btn-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-btn-grid a {
  text-decoration: none;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 20px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.quick-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-1px);
}

.quick-btn i {
  font-size: 24px;
  color: #10b981;
}

.quick-btn span {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.4;
}
</style>
