<script setup>
import { useUserStore } from "@/stores/account";
import { countApp } from "@/services/ApprovalService";
import { onMounted, ref, computed } from "vue";

const userStore = useUserStore();
const user = computed(() => userStore.state.signedUser);
const data = ref({ countCourse: 0, countApproval: 0 });

const now = new Date();
const year = now.getFullYear();
const semester = user.value.semesterId % 2 === 1 ? 1 : 2;

const routes = {
  professor: "/pro",
  student: "/ent",
  staff: "/aff",
};

const quickMenus = {
  student: [
    {
      to: `${routes.student}/grade/permanent`,
      icon: "bi-file-earmark-text",
      label: "영구성적조회",
    },
    { to: "/application", icon: "bi-file-earmark-check", label: "휴·복학신청" },
    { to: "/renewal/privacy", icon: "bi-person-gear", label: "개인정보변경" },
    {
      to: `${routes.student}/graduation`,
      icon: "bi-mortarboard",
      label: "졸업자가진단",
    },
  ],
  professor: [
    {
      to: `${routes.professor}/course/management`,
      icon: "bi-file-earmark-text",
      label: "강의관리",
    },
    {
      to: `${routes.professor}/survey/check`,
      icon: "bi-file-earmark-check",
      label: "강의평가조회",
    },
    { to: "/renewal/privacy", icon: "bi-person-gear", label: "개인정보변경" },
    { to: "/application", icon: "bi-file-earmark-check", label: "휴·복직신청" },
  ],
  staff: [
    {
      to: `${routes.staff}/schedule`,
      icon: "bi-calendar-check",
      label: "학사일정관리",
    },
    {
      to: `${routes.staff}/member`,
      icon: "bi-person-gear",
      label: "구성원현황",
    },
  ],
};

onMounted(async () => {
  if (user.value.userRole === "staff") {
    const res = await countApp(user.value.semesterId);
    data.value = res.data;
  }
});
</script>

<template>
  <div class="widget">
    <div v-if="user.userRole === 'staff'" class="staff-section">
      <h4>{{ year }}학년도 {{ semester }}학기</h4>
      <h4>처리중 안건</h4>
      <div class="work-grid">
        <router-link :to="`${routes.staff}/approval/course`">
          <div class="work-card">
            <div class="work-title">강의개설신청</div>
            <div class="work-content">
              <i class="bi bi-clock"></i>
              <div>
                <span class="count">{{ data.countCourse }}</span>
                <span>건</span>
              </div>
            </div>
          </div>
        </router-link>
        <router-link :to="`${routes.staff}/approval`">
          <div class="work-card">
            <div class="work-title">인사관리변동</div>
            <div class="work-content">
              <i class="bi bi-clock"></i>
              <div>
                <span class="count">{{ data.countApproval }}</span>
                <span>건</span>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div v-else>
      <div class="d-flex user">
        <div class="user-info">
          <div class="info-top">
            <div class="name">
            {{ userStore.state.signedUser.userName }}
            </div>
          </div>
          <div class="num">{{ userStore.state.signedUser.loginId }}</div>
          <div class="department">{{ userStore.state.signedUser.deptName }}</div>
        </div>
        <div class="user-application">
          <div class="work-card">
            <div class="work-title">처리중</div>
            <div class="work-content">
              <i class="bi bi-clock"></i>
              <div>
                <span class="count">{{ data.countCourse }}</span>
                <span>건</span>
              </div>
            </div>
          </div>
          <div class="work-card">
            <div class="work-title">완료</div>
            <div class="work-content">
              <i class="bi bi-clock"></i>
              <div>
                <span class="count">{{ data.countCourse }}</span>
                <span>건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="quick-section">
      <div class="widget-header">
        <i class="bi bi-lightning-charge"></i>
        <h2>빠른메뉴</h2>
      </div>
      <div class="quick-grid">
        <router-link
          v-for="menu in quickMenus[user.userRole]"
          :key="menu.to"
          :to="menu.to"
        >
          <button class="quick-btn">
            <i class="bi" :class="menu.icon"></i>
            <span>{{ menu.label }}</span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  text-decoration: none;
  color: inherit;
}

.widget {
  padding: 24px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  height: 430px;
  overflow: hidden;
}



.staff-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.work-grid {
  display: flex;
  gap: 16px;
  margin-bottom: 5px;
}

.work-card {
  flex: 1;
  min-height: 80px;
  padding: 15px 16px 7px 16px;
  border: 1px solid #5ba666;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 150px;
}

.work-title {
  font-size: 16px;
  color: #111827;
  margin-bottom: 15px;
}

.work-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  color: #6b7280;
}

.work-content .count {
  color: #5ba666;
  font-size: 25px;
  font-weight: 600;
}

.work-content span:last-child {
  font-size: 14px;
  margin-left: 2px;
}

/* 유저정보 */
.user{
  gap:10px;
}
.user-info{
  width: 50%;
}
.info-top{
  display: flex;
  align-items:baseline;
  gap: 3px;
}

.name{
  font-size: 25px;
  font-weight: 700;
}
.num{
  font-size: 14px;
  margin-left: 2px;
  color: #6c757d
}
.department{
  font-size: 16px;
}

.user-application{
  width: 50%;
  display: flex;
  gap:20px;
}

/* .btn-success{
  width: 100px;
  background-color: #5ba666;
  border-color: #5ba666;
} */

.widget-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
  height: 40px;
  box-sizing: border-box;
}

.widget-header i {
  font-size: 18px;
  color: #6b7280;
}

.widget-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 10px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 23px 12px;
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
