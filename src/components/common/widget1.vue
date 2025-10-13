<script setup>
import { useUserStore } from '@/stores/account';
const professor = "/pro";
const student = "/ent";
const staff = "/aff";

const userStore = useUserStore();
</script>

<template>
  <div class="main-content">
    <div class="compact-notice-widget">
      <div class="privacy">
        <h2>{{ userStore.state.signedUser.userName }}</h2>
        <div>{{ userStore.state.signedUser.loginId }}</div>
        <div>{{ userStore.state.signedUser.deptName }}</div>
      </div>
      <div class="quick-menu">
        <h4>빠른메뉴</h4>
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
            <router-link :to="`${student}/grade/permanent`">
              <button class="btn btn-success">졸업자가진단</button>
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
  width: 100px ;
}


</style>
