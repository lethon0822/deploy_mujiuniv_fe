<script setup>
import { useUserStore } from '@/stores/account';
const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const userStore = useUserStore();
const now = new Date();
const year = now.getFullYear();

let semester = userStore.state.signedUser.semesterId % 2 === 1 ? 1 : 2
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <div class="privacy">

        <template v-if="userStore.state.signedUser.userRole !== 'staff'">
          <h2>{{ userStore.state.signedUser.userName }}</h2>
          <div>{{ userStore.state.signedUser.loginId }}</div>
          <div>{{ userStore.state.signedUser.deptName }}</div>
        </template>

        <template v-else>
          <h4>{{ year }}학년도 {{ semester }}학기</h4>
          <h4>처리중 안건</h4>
          <div class="work-cover">
            <div class="work-card">
              <span>강의개설신청</span>
            </div>
            <div class="work-card">
              <span>인사관리변동</span>
            </div>
          </div>
        </template>

      </div>
      <div class="quick-menu">
        <h4>빠른메뉴</h4>
        <!-- 학생용 퀵메뉴 -->
        <template v-if="userStore.state.signedUser.userRole === 'student'">
          <div class="quick-btn">
            <router-link :to="`${student}/grade/permanent`">
              <button class="btn btn-success">영구성적조회</button>
            </router-link>
            <router-link to="/application">
              <button class="btn btn-success">휴·복학신청</button>
            </router-link>
          </div>
          <div class="quick-btn">
            <router-link to="/renewal/privacy">
              <button class="btn btn-success">개인정보변경</button>
            </router-link>
            <router-link :to="`${student}/graduation`">
              <button class="btn btn-success">졸업자가진단</button>
            </router-link>
          </div>
        </template>

        <!-- 교수용 퀵메뉴 -->
        <template v-if="userStore.state.signedUser.userRole === 'professor'">
          <div class="quick-btn">
            <router-link :to="`${professor}/course/management`">
              <button class="btn btn-success">강의관리</button>
            </router-link>
            <router-link :to="`${professor}/survey/check`">
              <button class="btn btn-success">강의평가조회</button>
            </router-link>
          </div>
          <div class="quick-btn">
            <router-link to="/renewal/privacy">
              <button class="btn btn-success">개인정보변경</button>
            </router-link>
            <router-link to="/application">
              <button class="btn btn-success">휴·복직신청</button>
            </router-link>
          </div>
        </template>

        <!-- 교직원용 퀵메뉴 -->
        <template v-if="userStore.state.signedUser.userRole === 'staff'">
          <div class="quick-btn">
            <router-link :to="`${professor}/course/management`">
              <button class="btn btn-success">강의개설승인관리</button>
            </router-link>
            <router-link :to="`${professor}/survey/check`">
              <button class="btn btn-success">학적 및 인사관리</button>
            </router-link>
          </div>
          <div class="quick-btn">
            <router-link to="/renewal/privacy">
              <button class="btn btn-success">개인정보변경</button>
            </router-link>
            <router-link to="/application">
              <button class="btn btn-success">휴·복직신청</button>
            </router-link>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
h2{
font-weight: 700;
}
.main-content {
  max-width: 1200px;
  margin: 0 auto;
}
.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 15px 15px 13px 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.work-cover{
  display: flex;
  gap: 3rem;
}

.work-card{
  width: 250px;
  height: 100px;
  border: 1px solid #5ba666;
  border-radius: 10px ;
  padding: 1rem;
  
  
}

.work-card > span{
  font-size: 18px;
}

.quick-menu{
  margin: 20px 0;
}
.quick-btn{
  display: flex;
  margin: 10px 0;
  gap: 10px;
}

.btn{
  padding:8px 5px;
  border: 0;
  background-color: #5ba666;
  width: 120px ;
}


</style>
