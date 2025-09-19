<script setup>
import { useRoute } from "vue-router";
import { ref } from "vue";
import logo from "@/assets/muji_horizontaLogo.svg";
import Login from "@/views/login/Login.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

import img1 from "@/assets/1.jpg";
import img2 from "@/assets/2.jpg";
import img3 from "@/assets/3.jpg";
import img4 from "@/assets/4.jpg";
import img5 from "@/assets/5.jpg";

const images = [img1, img2, img3, img4, img5];

// 공지사항 데이터 (하드코딩)
const notices = ref([
  {
    id: 1,
    title: "2025년 시스템 정기 점검 안내",
    date: "2025-07-28",
    isImportant: true,
    content: "안정적인 서비스 제공을 위해 시스템 정기 점검을 실시합니다.",
    views: 245,
  },
  {
    id: 2,
    title: "새로운 기능 업데이트 - 다크모드 지원",
    date: "2025-07-27",
    isImportant: false,
    content: "사용자 편의성 향상을 위해 다크모드 기능이 추가되었습니다.",
    views: 189,
  },
  {
    id: 3,
    title: "[중요] 개인정보 처리방침 변경 안내",
    date: "2025-07-25",
    isImportant: true,
    content: "개인정보 보호법 개정에 따른 처리방침 변경사항을 안내드립니다.",
    views: 567,
  },
  {
    id: 4,
    title: "서비스 이용약관 개정 안내",
    date: "2025-07-20",
    isImportant: false,
    content: "서비스 품질 향상을 위한 이용약관 일부 개정 사항입니다.",
    views: 123,
  },
  {
    id: 5,
    title: "고객센터 운영시간 변경 안내",
    date: "2025-07-18",
    isImportant: false,
    content: "고객센터 운영시간이 변경되오니 참고 부탁드립니다.",
    views: 89,
  },
  {
    id: 6,
    title: "[긴급] 보안 업데이트 완료 안내",
    date: "2025-07-15",
    isImportant: true,
    content: "보안 취약점 패치를 위한 긴급 업데이트가 완료되었습니다.",
    views: 432,
  },
]);

const route = useRoute();
//로그인 여부 확인
</script>

<template>
  <router-view />
  <div class="container">
    <div class="content-wrapper">
      <div class="logo-container">
        <img :src="logo" alt="로고" class="logo-img" />
      </div>

      <div class="main-content-box">
        <div class="leftSide">
          <div class="swiper-wrapper-container">
            <Swiper
              :modules="[Autoplay, EffectFade]"
              :slides-per-view="1"
              :space-between="0"
              :loop="true"
              :effect="'fade'"
              :fade-effect="{ crossFade: true }"
              :autoplay="{ delay: 4000, disableOnInteraction: false }"
              :speed="1000"
              class="mySwiper"
            >
              <SwiperSlide v-for="(img, idx) in images" :key="idx">
                <img :src="img" alt="슬라이드 이미지" />
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <div class="rightSide">
          <div class="right-content">
            <div class="login-section">
              <Login />
            </div>

            <div class="notice-section">
              <div class="notice-header">
                <h3 class="notice-title">공지사항</h3>
                <span class="notice-count">총 {{ notices.length }}건</span>
              </div>

              <div class="notice-board">
                <div class="notice-header-row">
                  <span class="header-num">번호</span>
                  <span class="header-title">제목</span>
                  <span class="header-date">등록일</span>
                  <span class="header-views">조회</span>
                </div>

                <div class="notice-list">
                  <div
                    v-for="(notice, index) in notices"
                    :key="notice.id"
                    class="notice-row"
                    :class="{ important: notice.isImportant }"
                  >
                    <span class="notice-num">{{ notices.length - index }}</span>
                    <div class="notice-title-cell">
                      <span v-if="notice.isImportant" class="important-badge"
                        >중요</span
                      >
                      <span class="notice-text">{{ notice.title }}</span>
                    </div>
                    <span class="notice-date">{{ notice.date }}</span>
                    <span class="notice-views">{{ notice.views }}</span>
                  </div>
                </div>
              </div>

              <div class="notice-footer">
                <div class="pagination">
                  <button class="page-btn">‹</button>
                  <button class="page-btn active">1</button>
                  <button class="page-btn">2</button>
                  <button class="page-btn">3</button>
                  <button class="page-btn">›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 900px;
  box-sizing: border-box;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  max-width: 1500px;
}

.logo-container {
  width: 100%;
  max-width: 1500px;
  display: flex;
  justify-content: flex-start;
}

.logo-img {
  height: 60px;
  padding: 0;
  margin: 0;
  object-fit: contain;
}

.main-content-box {
  display: flex;
  width: 100%;
  height: 700px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 0;
  min-height: 0;
}

.leftSide {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.swiper-wrapper-container {
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;
}

.mySwiper {
  width: 100% !important;
  height: 100% !important;
  position: absolute;
  top: 0;
  left: 0;
}

.mySwiper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.rightSide {
  flex: 1.2;
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 20px 40px 40px 40px;
  min-width: 0;
}

.right-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.login-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.notice-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.notice-count {
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 12px;
}

.notice-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.notice-header-row {
  display: grid;
  grid-template-columns: 40px 1fr 70px 40px;
  gap: 10px;
  padding: 8px 0;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: center;
  margin-bottom: 5px;
}

.header-title {
  text-align: left !important;
  padding-left: 10px;
}

.notice-list {
  flex: 1;
  overflow-y: auto;
}

.notice-row {
  display: grid;
  grid-template-columns: 40px 1fr 70px 40px;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.notice-row:hover {
  background-color: #f8f9fa;
}

.notice-row.important {
  background-color: #fff8f0;
}

.notice-row.important:hover {
  background-color: #ffefd6;
}

.notice-num {
  text-align: center;
  color: #666;
  font-size: 12px;
}

.notice-title-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-left: 10px;
}

.important-badge {
  background: #ff4757;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 2px;
  margin-right: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.notice-text {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.notice-row.important .notice-text {
  font-weight: 500;
}

.notice-date {
  font-size: 11px;
  color: #999;
  text-align: center;
}

.notice-views {
  font-size: 11px;
  color: #666;
  text-align: center;
}

.notice-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.page-btn {
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.page-btn:hover {
  background: #f8f9fa;
  border-color: #ccc;
}

.page-btn.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-btn.active:hover {
  background: #0056b3;
  border-color: #0056b3;
}

.page-btn.active:hover {
  background: #0056b3;
  border-color: #0056b3;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    padding-top: 20px;
    padding: 10px;
  }
  .logo-container {
    margin-bottom: 10px;
  }
  .logo-img {
    display: none;
  }
  .main-content-box {
    flex-direction: column;
    height: auto;
    min-height: 800px;
    border-radius: 10px;
  }
  .leftSide {
    flex: none;
    height: 250px;
  }
  .rightSide {
    flex: none;
    height: auto;
    padding: 20px;
  }
  .right-content {
    min-height: 500px;
  }
  .login-section {
    margin-bottom: 20px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    padding-top: 30px;
    padding: 20px;
  }
  .logo-container {
    margin-bottom: 15px;
  }
  .logo-img {
    display: none;
  }
  .main-content-box {
    flex-direction: column;
    height: auto;
    min-height: 800px;
  }
  .leftSide {
    flex: none;
    height: 300px;
  }
  .rightSide {
    flex: none;
    height: auto;
    padding: 30px;
  }
  .right-content {
    min-height: 400px;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .logo-container {
    max-width: 1500px; /* main-content-box의 max-width와 동일 */
    margin-right: 0;
  }
  .logo-img {
    height: 60px;
  }
  .main-content-box {
    display: flex;
    flex-direction: row;
    height: 700px;
    width: 100%;
    max-width: 1500px;
  }
  .leftSide {
    flex: 1;
    height: 100%;
  }
  .rightSide {
    flex: 1.2;
    padding: 20px 40px 40px 40px;
  }
}
</style>
