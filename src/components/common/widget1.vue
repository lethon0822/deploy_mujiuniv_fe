<script setup>
import { useUserStore } from '@/stores/account';
import { countApp } from '@/services/ApprovalService';
import { onMounted, ref } from 'vue';

const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const userStore = useUserStore();
const now = new Date();
const year = now.getFullYear();

const data = ref([])

onMounted(async()=>{
  if(userStore.state.signedUser.userRole === 'staff'){
    const res = await countApp(userStore.state.signedUser.semesterId);
    data.value = res.data
    console.log("아악:",data.value.countCourse)
  }
})

let semester = userStore.state.signedUser.semesterId % 2 === 1 ? 1 : 2
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <!-- <div class="privacy">
        <template v-if="userStore.state.signedUser.userRole !== 'staff'">
          <h2>{{ userStore.state.signedUser.userName }}</h2>
          <div>{{ userStore.state.signedUser.loginId }}</div>
          <div>{{ userStore.state.signedUser.deptName }}</div>
        </template>
      </div> -->
      <template v-if="userStore.state.signedUser.userRole === 'staff'">
        <div class="staff">
          <h4>{{ year }}학년도 {{ semester }}학기</h4>
          <h4>처리중 안건</h4>
          <div class="work-cover">
            <router-link :to="`${staff}/approval/course`">
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
            <router-link :to="`${staff}/approval`">
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
        </template>

      
      <div class="quick-menu">
        <div class="header">
          <i class="bi bi-lightning-charge"></i>
          <h2>빠른메뉴</h2>
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
            <router-link :to="`${student}/graduation`">
              <button class="quick-btn">
                <i class="bi bi-mortarboard"></i>
                <span>졸업자가진단</span>
              </button>
            </router-link>
          </div>
        </template>

        <!-- 교수용 퀵메뉴 -->
        <template v-if="userStore.state.signedUser.userRole === 'professor'">
          <div class="quick-btn-grid">
            <router-link :to="`${professor}/course/management`">
              <button class="quick-btn">
                <i class="bi bi-file-earmark-text"></i>
                <span>강의관리</span>
              </button>
            </router-link>
            <router-link :to="`${professor}/survey/check`">
              <button class="quick-btn">
                <i class="bi bi-file-earmark-check"></i>
                <span>강의평가조회</span>
              </button>
            </router-link>
            <router-link to="/renewal/privacy">
              <button class="quick-btn">
                <i class="bi bi-person-gear"></i>
                <span>개인정보변경</span>
              </button>
            </router-link>
            <router-link to="/application">
              <button class="quick-btn">
                <i class="bi bi-file-earmark-check"></i>
                <span>휴·복직신청</span>
              </button>
            </router-link>
          </div>
        </template>

        <!-- 교직원용 퀵메뉴 -->
        <template v-if="userStore.state.signedUser.userRole === 'staff'">
          <div class="quick-btn-grid staff">
            <router-link :to="`${staff}/schedule`">
              <button class="quick-btn">
                <i class="bi bi-calendar-check"></i>
                <span>학사일정관리</span>
              </button>
            </router-link>
            <router-link :to="`${staff}/member`">
              <button class="quick-btn">
                <i class="bi bi-person-gear"></i>
                <span>구성원현황</span>
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

a{
  text-decoration: none;
  color: inherit; 
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
  min-height: 430px;
}

.work-cover{
  display: flex;
  gap: 3rem;
}

.work-card{
  width: 200px;
  height: 100px;
  border: 1px solid #5ba666;
  border-radius: 10px ;
  padding: 1rem;
  font-weight: 500;
}

.work-title{
  font-size: 16px;
  margin-bottom: 1.2rem;
}

.work-content{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
}

.work-content > div{
  margin-right: 3px;
}
.work-content > div > span:nth-of-type(2) {
  font-size: 14px;
  margin-left: 2px;
}

.count{
  color: #5ba666;
  font-size: 25px;
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

/* .quick-menu {
  padding: 10px 24px;
} */

.header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-bottom: 1px solid #e5e7eb;
  height: 50px;
}

.header i {
  font-size: 18px;
  color: #6b7280;
}

.header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  letter-spacing: -0.01em;
  /* border: 1px solid #e5e7eb; */
}

.staff{
  padding: 25px;
}

.quick-btn-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  /* margin-top: 2px; */
  padding: 10px 24px;
  margin-top: 10px;
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
  padding: 27px 12px;
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
