<script setup>
import { useRoute } from "vue-router";
import { ref, computed, onMounted, onUnmounted, provide } from "vue";
import logo from "@/assets/muji_horizontaLogo.svg";
import Login from "@/views/login/Login.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import { searchNotice } from "@/services/NoticeService";
import img1 from "@/assets/1.jpg";
import img2 from "@/assets/2.jpg";
import img3 from "@/assets/3.jpg";
import img4 from "@/assets/4.jpg";
import img5 from "@/assets/5.jpg";

const images = [img1, img2, img3, img4, img5];

// 전체 공지사항 데이터
const allNotices = ref([]);

// 데이터 로딩 함수
const loadAllNotices = async () => {
  const res = await searchNotice();
  if (res && res.status === 200) {
    allNotices.value = res.data;
    return res.data;
  }
  allNotices.value = [];
  return [];
};

provide("ALL_NOTICES", allNotices);
provide("LOAD_ALL_NOTICES", loadAllNotices);

const currentPageHome = ref(1);
const itemsPerPageHome = 5;

const paginatedNoticesHome = computed(() => {
  const start = (currentPageHome.value - 1) * itemsPerPageHome;
  const end = start + itemsPerPageHome;

  const sortedNotices = [...allNotices.value].sort(
    (a, b) => b.noticeId - a.noticeId
  );
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

const isModalOpen = ref(false);
const openModal = () => {
  currentPage.value = 1;
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
};

const currentPage = ref(1);
const itemsPerPage = 10;
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const sortedNotices = [...allNotices.value].sort(
    (a, b) => b.noticeId - a.noticeId
  );
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

onMounted(async () => {
  await loadAllNotices();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
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
                    :class="{ important: notice.type }"
                    @click="openModal()"
                  >
                    <span class="notice-num">{{
                      allNotices.length -
                      ((currentPageHome - 1) * itemsPerPageHome + index)
                    }}</span>
                    <div class="notice-title-cell">
                      <span v-if="notice.type" class="important-badge"
                        >중요</span
                      >
                      <span class="notice-text">{{ notice.noticeTitle }}</span>
                    </div>
                    <span class="notice-date">{{ notice.updatedAt }}</span>
                    <span class="notice-views">{{ notice.view }}</span>
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
                    <i class="fas fa-angle-left"></i>
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
                    <i class="fas fa-angle-right"></i>
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
        <button type="button" class="close-btn" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
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
            :class="{ important: notice.type }"
          >
            <span class="modal-notice-num">{{
              allNotices.length - ((currentPage - 1) * itemsPerPage + index)
            }}</span>
            <div class="modal-notice-title-cell">
              <span v-if="notice.type" class="important-badge"
                >중요</span
              >
              <span class="modal-notice-text">{{ notice.noticeTitle }}</span>
            </div>
            <span class="modal-notice-date">{{ notice.updatedAt }}</span>
            <span class="modal-notice-views">{{ notice.view }}</span>
          </div>
        </div>
        <div v-if="paginatedNotices.length === 0" class="no-notices">
          공지사항이 없습니다.
        </div>
      </div>
      <div class="modal-footer">
        <div class="modal-pagination">
          <button
            class="page-btn"
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-left"></i>
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
            <i class="fas fa-angle-right"></i>
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

/* 닫기 버튼 내부 아이콘/텍스트 크기 조정 */
.close-btn i {
  font-size: 24px;
}

.modal-body {
  padding: 20px 20px 0 20px;
  overflow-y: auto;
  flex: 1;
}

.no-notices {
  padding: 20px;
  text-align: center;
  color: #999;
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

/* Font Awesome 아이콘을 사용할 경우 텍스트를 대체 */
.page-btn i {
  font-size: 14px;
  line-height: 1;
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
