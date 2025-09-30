<script setup>
import { useRoute } from "vue-router";
import { ref, computed, onMounted, onUnmounted } from "vue";
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
// 전체 공지사항 데이터 (확장된 리스트)
const allNotices = ref([
  {
    id: 1,
    title: "2025년 시스템 정기 점검 안내",
    date: "2025-07-28",
    isImportant: true,
    content:
      "안정적인 서비스 제공을 위해 시스템 정기 점검을 실시합니다. 점검 시간 동안 서비스 이용이 일시적으로 제한될 수 있으니, 중요한 작업은 미리 완료해 주시기 바랍니다.",
    views: 245,
  },
  {
    id: 2,
    title: "새로운 기능 업데이트 - 다크모드 지원",
    date: "2025-07-27",
    isImportant: false,
    content:
      "사용자 편의성 향상을 위해 다크모드 기능이 추가되었습니다. 설정에서 다크모드를 활성화하여 눈의 피로를 줄이고 편안하게 서비스를 이용해 보세요.",
    views: 189,
  },
  {
    id: 3,
    title: "[중요] 개인정보 처리방침 변경 안내",
    date: "2025-07-25",
    isImportant: true,
    content:
      "개인정보 보호법 개정에 따른 처리방침 변경사항을 안내드립니다. 변경된 내용은 홈페이지 하단의 '개인정보 처리방침'에서 확인하실 수 있습니다. 이용에 참고 부탁드립니다.",
    views: 567,
  },
  {
    id: 4,
    title: "서비스 이용약관 개정 안내",
    date: "2025-07-20",
    isImportant: false,
    content:
      "서비스 품질 향상을 위한 이용약관 일부 개정 사항입니다. 개정된 약관은 2025년 8월 1일부터 적용됩니다. 자세한 내용은 공지사항을 확인해 주세요.",
    views: 123,
  },
  {
    id: 5,
    title: "고객센터 운영시간 변경 안내",
    date: "2025-07-18",
    isImportant: false,
    content:
      "고객센터 운영시간이 변경되오니 참고 부탁드립니다. 평일 오전 9시부터 오후 6시까지로 변경되었습니다. 주말 및 공휴일은 휴무입니다.",
    views: 89,
  },
  {
    id: 6,
    title: "[긴급] 보안 업데이트 완료 안내",
    date: "2025-07-15",
    isImportant: true,
    content:
      "보안 취약점 패치를 위한 긴급 업데이트가 완료되었습니다. 고객님의 안전한 서비스 이용을 위해 항상 최신 보안 상태를 유지하고 있습니다.",
    views: 432,
  },
  {
    id: 7,
    title: "여름휴가 기간 고객지원 안내",
    date: "2025-07-10",
    isImportant: false,
    content:
      "여름휴가 기간 중 고객지원 운영 일정을 안내드립니다. 이 기간 동안에는 문의 답변이 다소 지연될 수 있는 점 양해 부탁드립니다.",
    views: 156,
  },
  {
    id: 8,
    title: "서버 성능 개선 작업 완료",
    date: "2025-07-08",
    isImportant: false,
    content:
      "서버 성능 개선을 통해 더욱 빠른 서비스를 제공합니다. 이번 개선 작업으로 인해 서비스 접속 속도가 획기적으로 빨라졌습니다.",
    views: 203,
  },
  {
    id: 9,
    title: "[알림] 비밀번호 보안 강화 권장사항",
    date: "2025-07-05",
    isImportant: true,
    content:
      "계정 보안 강화를 위한 비밀번호 변경을 권장합니다. 3개월에 한 번씩 비밀번호를 변경하여 개인정보를 안전하게 보호해 주세요.",
    views: 378,
  },
  {
    id: 10,
    title: "모바일 앱 버전 업데이트 안내",
    date: "2025-07-01",
    isImportant: false,
    content:
      "모바일 앱의 새로운 버전이 출시되었습니다. 앱스토어에서 최신 버전으로 업데이트하여 다양한 신규 기능을 이용해 보세요.",
    views: 291,
  },
  {
    id: 11,
    title: "서비스 점검 안내 (2)",
    date: "2025-06-28",
    isImportant: false,
    content:
      "안정적인 서비스 제공을 위해 시스템 정기 점검을 실시합니다. 점검 시간 동안 일부 기능이 제한될 수 있습니다.",
    views: 110,
  },
  {
    id: 12,
    title: "웹사이트 UI/UX 개선",
    date: "2025-06-25",
    isImportant: false,
    content:
      "웹사이트의 사용성을 높이기 위해 디자인을 개선했습니다. 더욱 직관적이고 편리한 사용 환경을 경험해 보세요.",
    views: 95,
  },
  {
    id: 13,
    title: "고객 문의 응대 지연 안내",
    date: "2025-06-20",
    isImportant: false,
    content:
      "일시적인 문의량 증가로 인해 답변이 지연될 수 있습니다. 순차적으로 답변드리고 있으니, 양해 부탁드립니다.",
    views: 78,
  },
  {
    id: 14,
    title: "[필독] 보안 강화 정책 변경",
    date: "2025-06-15",
    isImportant: true,
    content:
      "사용자 계정 보호를 위한 새로운 보안 정책이 적용됩니다. 본인 인증 절차가 강화되었으니 이용에 불편 없으시길 바랍니다.",
    views: 280,
  },
  {
    id: 15,
    title: "새로운 서비스 출시 예정",
    date: "2025-06-10",
    isImportant: false,
    content: "새롭고 유용한 서비스를 곧 선보일 예정입니다. 기대해 주세요!",
    views: 150,
  },
]);
// 메인 화면 공지사항 피그네이션을 위한 상태 및 로직
const currentPageHome = ref(1);
const itemsPerPageHome = 5;
const paginatedNoticesHome = computed(() => {
  const start = (currentPageHome.value - 1) * itemsPerPageHome;
  const end = start + itemsPerPageHome;
  const sortedNotices = [...allNotices.value].sort((a, b) => b.id - a.id);
  return sortedNotices.slice(start, end);
});
const totalPagesHome = computed(() => {
  return Math.ceil(allNotices.value.length / itemsPerPageHome);
});
const pageButtonsHome = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPagesHome.value; i++) {
    pages.push(i);
  }
  return pages;
});
const changePageHome = (page) => {
  if (page >= 1 && page <= totalPagesHome.value) {
    currentPageHome.value = page;
  }
};
// 모달 상태 관리
const isModalOpen = ref(false);
const openModal = () => {
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};
// 모달 피그네이션을 위한 상태 및 로직
const currentPage = ref(1);
const itemsPerPage = 10;
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const sortedNotices = [...allNotices.value].sort((a, b) => b.id - a.id);
  return sortedNotices.slice(start, end);
});
const totalPages = computed(() => {
  return Math.ceil(allNotices.value.length / itemsPerPage);
});
const pageButtons = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
const handleKeydown = (event) => {
  if (event.key === "Escape" && isModalOpen.value) {
    closeModal();
  }
};
onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
const route = useRoute();
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
                <button class="more-btn" @click="openModal()">+ 더보기</button>
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
                    v-for="(notice, index) in paginatedNoticesHome"
                    :key="notice.id"
                    class="notice-row"
                    :class="{ important: notice.isImportant }"
                    @click="openModal()"
                  >
                    <span class="notice-num">{{
                      allNotices.length -
                      ((currentPageHome - 1) * itemsPerPageHome + index)
                    }}</span>
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
                  <button
                    class="page-btn"
                    @click="changePageHome(currentPageHome - 1)"
                    :disabled="currentPageHome === 1"
                  >
                    ‹
                  </button>
                  <button
                    v-for="page in pageButtonsHome"
                    :key="page"
                    class="page-btn"
                    :class="{ active: page === currentPageHome }"
                    @click="changePageHome(page)"
                  >
                    {{ page }}
                  </button>
                  <button
                    class="page-btn"
                    @click="changePageHome(currentPageHome + 1)"
                    :disabled="currentPageHome === totalPagesHome"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <button type="button" class="close-btn" @click="closeModal">×</button>
        <h2 class="modal-title">전체 공지사항</h2>
      </div>
      <div class="modal-body">
        <div class="modal-notice-header">
          <span class="modal-header-num">번호</span>
          <span class="modal-header-title">제목</span>
          <span class="modal-header-date">등록일</span>
          <span class="modal-header-views">조회</span>
        </div>
        <div class="modal-notice-list">
          <div
            v-for="(notice, index) in paginatedNotices"
            :key="notice.id"
            class="modal-notice-row"
            :class="{ important: notice.isImportant }"
          >
            <span class="modal-notice-num">{{
              allNotices.length - ((currentPage - 1) * itemsPerPage + index)
            }}</span>
            <div class="modal-notice-title-cell">
              <span v-if="notice.isImportant" class="important-badge"
                >중요</span
              >
              <span class="modal-notice-text">{{ notice.title }}</span>
            </div>
            <span class="modal-notice-date">{{ notice.date }}</span>
            <span class="modal-notice-views">{{ notice.views }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="modal-pagination">
          <button
            class="page-btn"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            ‹
          </button>
          <button
            v-for="page in pageButtons"
            :key="page"
            class="page-btn"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            ›
          </button>
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
  margin-top: 20px;
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 2px solid #f0f0f0;
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.more-btn {
  background: #3f7ea6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-btn:hover {
  background: #2a5c74;
  transform: translateY(-1px);
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
  overflow-y: hidden;
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
  background: #3f7ea6;
  border-color: #3f7ea6;
  color: white;
}

.page-btn.active:hover {
  background: #2a5c74;
  border-color: #2a5c74;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  padding: 0 !important;
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  background-color: #fff;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: left;
  padding-right: 40px;
  margin-top: 25px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #000;
}

.modal-body {
  padding: 20px 20px 0 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-notice-header {
  display: grid;
  grid-template-columns: 60px 1fr 100px 60px;
  gap: 15px;
  padding: 12px 0;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-align: center;
  margin-bottom: 10px;
}

.modal-header-title {
  text-align: left !important;
  padding-left: 15px;
}

.modal-notice-list {
  flex: 1;
  overflow-y: auto;
}

.modal-notice-row {
  display: grid;
  grid-template-columns: 60px 1fr 100px 60px;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

.modal-notice-row:hover {
  background-color: #f8f9fa;
}

.modal-notice-row.important {
  background-color: #fff8f0;
}

.modal-notice-row.important:hover {
  background-color: #ffefd6;
}

.modal-notice-num {
  text-align: center;
  color: #666;
  font-size: 13px;
}

.modal-notice-title-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-left: 15px;
}

.modal-notice-text {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.modal-notice-row.important .modal-notice-text {
  font-weight: 500;
}

.modal-notice-date {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.modal-notice-views {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.modal-footer {
  padding: 20px 15px;
  background-color: #fff;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.modal-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
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
  .notice-footer {
    border-top: none;
  }

  /* 모바일 모달 */
  .modal-overlay {
    padding: 10px;
  }
  .modal-content {
    max-height: 95vh;
  }
  .modal-notice-header {
    grid-template-columns: 40px 1fr 70px 40px;
    gap: 8px;
    font-size: 12px;
  }
  .modal-notice-row {
    grid-template-columns: 40px 1fr 70px 40px;
    gap: 8px;
    padding: 12px 0;
    font-size: 13px;
  }
  .modal-notice-title-cell {
    padding-left: 8px;
  }
  .modal-header-title {
    padding-left: 8px !important;
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
  .notice-footer {
    border-top: none;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .logo-container {
    max-width: 1500px;
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
