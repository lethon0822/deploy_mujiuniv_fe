<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/account";
import { getDepartments, getYears } from "@/services/CourseService";
import { successDate } from "@/services/CommonMethod";
import { useEnrollment } from "./useEnrollment";
import ConfirmModal from "@/components/common/Confirm.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import YnModal from "@/components/common/YnModal.vue";

const state = reactive({
  confirmTarget: null,
  confirmMessage: "",
  confirmAction: null,
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  showConfirmModal: false,
  check: false // 탭 진입 실패시 back을 위한 확인용
});

const router = useRouter();
const userStore = useUserStore();
const semesterId = userStore.state.signedUser?.semesterId;

const departments = ref([]);
const years = ref([]);

//Enrollment 로직 가져오기
const {
  mySugangList,
  courseList,
  lastFilters,
  fetchCourses,
  fetchMyList,
  enroll,
  cancel,
} = useEnrollment();

const isMobile = ref(false);
const isSearched = ref(false);
const isSidebarOpen = ref(false);

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const handleYnModalClose = () => {
  console.log(state.check)
  state.showYnModal = false;

  // 탭 진입 실패시 다음 if문 실행(진입 이전 화면으로 돌아감)
  if(state.check){
    state.check = false 
    if (window.history.length > 1) {
      router.back();
      return; 
    } 
    router.push("/main");
    return; 
  }

  // 나머지 모달 닫기 
  if (
    state.ynModalType === "success" &&
    state.ynModalMessage.includes("수강신청이 완료") &&
    !isMobile.value
  ) {
    if (!isSidebarOpen.value) {
      toggleSidebar();
    }
  }
  state.ynModalMessage = "";
  state.ynModalType = "info";
};

const openConfirm = (message, onConfirm) => {
  state.confirmMessage = message;
  state.confirmAction = onConfirm;
  state.showConfirmModal = true;
};

const handleConfirm = () => {
  if (typeof state.confirmAction === "function") {
    state.confirmAction();
  }
  state.showConfirmModal = false;
};

const closeConfirmModal = () => {
  state.showConfirmModal = false;
};

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const totalCredit = computed(() =>
  mySugangList.value.reduce((sum, course) => sum + Number(course.credit), 0)
);

const courseCount = computed(() => mySugangList.value.length);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 767;
};

const handleKeydown = (event) => {
  if (event.key === "Enter") {
    if (state.showYnModal || state.showConfirmModal) {
      return;
    }

    if (isSidebarOpen.value) {
      toggleSidebar();
    }
  }
};

onMounted(async () => {
  checkDate();
  try {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    window.addEventListener("keydown", handleKeydown);

    const departmentRes = await getDepartments();
    departments.value = departmentRes.data;

    const yearRes = await getYears();
    years.value = yearRes.data;

    await fetchMyList(semesterId);

    if (!isMobile.value) {
      const defaultFilters = {
        year: new Date().getFullYear(),
        semester: 2,
      };
      lastFilters.value = { ...defaultFilters };

      const success = await fetchCourses(defaultFilters);
      if (!success) {
        showModal("개설 과목 목록을 불러오지 못했습니다.", "error");
      }
    }
  } catch (err) {
    console.error("초기 데이터 로딩 에러:", err);
    showModal("데이터를 불러오는 중 오류가 발생했습니다.", "error");
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("keydown", handleKeydown);
});

const handleSearch = async (filters) => {
  console.log(" 받은 filters:", filters);
  try {
    const ok = await fetchCourses(filters);

    if (!ok) {
      showModal("과목 목록 조회 실패", "error");
    }
    isSearched.value = true;
  } catch (err) {
    console.error("검색 중 오류:", err);
    showModal("검색 실패", "error");
  }
};

const handleEnroll = (course) => {
  openConfirm("수강신청을 하시겠습니까?", async () => {
    try {
      await enroll(course.courseId);
      showModal("수강신청이 완료되었습니다", "success");
    } catch (error) {
      showModal(
        error.response?.data?.message || "예기치 못한 오류가 발생했습니다.",
        "error"
      );
    } finally {
      // 성공/실패 상관없이 강의 목록 갱신
      await fetchCourses(lastFilters.value);
    }
  });
};

const handleCancel = (courseId) => {
  openConfirm("수강신청을 취소하시겠습니까?", async () => {
    try {
      await cancel(courseId);
      showModal("수강신청이 취소되었습니다.", "success");
    } catch (error) {
      if (error.response?.status === 400) {
        showModal(error.response?.data?.message || "수강취소 실패", "warning");
      } else {
        showModal(
          "수강신청 취소 실패! 예기치 못한 오류가 발생했습니다..",
          "error"
        );
      }
    } finally {
      // 성공/실패 상관없이 강의 목록 갱신
      await fetchCourses(lastFilters.value);
    }
  });
};

// 탭 진입시 기간 체크 
const checkDate = async () =>{
  const postMessage = await successDate(userStore.state.signedUser.semesterId,"수강신청");
  const putMessage = await successDate(userStore.state.signedUser.semesterId,"수강정정");
  console.log(postMessage)
  console.log(putMessage)

  if(postMessage && putMessage){
    state.check = true
    showModal(postMessage, "warning")
    return 
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div
      class="container"
      :class="{ 'sidebar-open': isSidebarOpen && !isMobile }"
    >
      <div class="header-card">
        <div class="header-content">
          <h1 class="page-title">수강신청 관리</h1>
          <p>
            희망하는 강의를 조회하고 신청하세요. 신청된 강의는 ‘수강신청 내역’
            탭에서 다시 확인 가능 합니다.
          </p>
          <div class="filter-section">
            <SearchFilterBar
              :state="true"
              :departments="departments"
              :enrollment="true"
              :semester="'2'"
              @search="handleSearch"
            />
          </div>
        </div>
        <div
          v-if="!isMobile && !isSidebarOpen"
          class="bottom-tab"
          @click="toggleSidebar"
        >
          <div class="tab-content">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 15L12 9L6 15"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="tab-text">수강신청 내역</span>
            <div class="tab-badge" v-if="courseCount > 0">
              ({{ courseCount }})
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <CourseTable
          v-if="!isMobile || (isMobile && isSearched)"
          :courseList="courseList"
          maxHeight="500px"
          :show="{
            professorName: true,
            remStd: true,
            enroll: true,
            cancel: false,
            deptName: true,
          }"
          @enroll="handleEnroll"
        />

        <div v-if="isMobile" class="mobile-credit-section">
          <div class="credit-info-card container-box">
            <h5 class="credit-title">수강신청 내역</h5>
            <div class="credit-box">
              <div class="credit-item">
                <strong>최대 학점</strong>
                <span>18학점</span>
              </div>
              <div class="divider" />
              <div class="credit-item">
                <strong>신청 학점</strong>
                <span>{{ totalCredit }}학점</span>
              </div>
              <div class="divider" />
              <div class="credit-item">
                <strong>신청 과목 수</strong>
                <span>{{ courseCount }}개</span>
              </div>
            </div>
          </div>

          <CourseTable
            :courseList="mySugangList"
            maxHeight="500px"
            :show="{
              professorName: true,
              remStd: true,
              enroll: false,
              cancel: true,
              deptName: false,
            }"
            @cancel="handleCancel"
          />
        </div>
      </div>
    </div>

    <div v-if="!isMobile" class="bottom-panel" :class="{ open: isSidebarOpen }">
      <div class="panel-content">
        <div class="panel-header-inline">
          <div class="header-info">
            <h5 class="panel-title">수강신청 내역</h5>
            <div class="divider">|</div>
            <span class="info-item">최대 학점 18학점</span>
            <div class="divider">|</div>
            <span class="info-item highlight"
              >신청학점 {{ totalCredit }}학점</span
            >
            <div class="divider">|</div>
            <span class="info-item">신청 과목수 {{ courseCount }}개</span>
          </div>
          <button class="close-btn" @click="toggleSidebar">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <div class="panel-course-list">
          <div
            v-for="course in mySugangList"
            :key="course.courseId"
            class="panel-course-card"
          >
            <div class="card-header">
              <div class="course-type-badge" :class="course.type">
                {{ course.type }}
              </div>
            </div>

            <div class="course-title-small">
              {{ course.title || course.courseName }}
            </div>

            <div class="course-details">
              <div class="detail-row">
                <span class="detail-icon"
                  ><i class="bi bi-person-fill"></i
                ></span>
                <span class="detail-text">{{ course.professorName }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-icon"
                  ><i class="bi bi-cursor-fill"></i
                ></span>
                <span class="detail-text">{{ course.classroom }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-icon"><i class="bi bi-alarm"></i></span>
                <span class="detail-text">{{ course.time }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-icon"><i class="bi bi-award"></i></span>
                <span class="detail-text">{{ course.credit }}학점</span>
              </div>
            </div>
            <button
              class="cancel-btn"
              @click="handleCancel(course.courseId)"
              title="수강취소"
            >
              수강취소
            </button>
          </div>

          <div v-if="mySugangList.length === 0" class="empty-state">
            <div class="empty-icon">📚</div>
            <div class="empty-text">수강신청한 과목이 없습니다</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <YnModal
    v-if="state.showYnModal"
    :content="state.ynModalMessage"
    :type="state.ynModalType"
    @close="handleYnModalClose"
  />

  <ConfirmModal
    v-if="state.showConfirmModal"
    :content="state.confirmMessage"
    type="warning"
    @confirm="handleConfirm"
    @cancel="closeConfirmModal"
  />
</template>

<style scoped>
/* 기존 스타일은 유지 */
.page-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
  transition: padding-bottom 0.3s ease;
}

.container.sidebar-open {
  padding-bottom: 320px;
}

.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.header-content {
  flex: 1;
}

.header-card h1 {
  font-size: 22px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
}

.header-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.filter-section {
  margin-top: 16px;
}

.filter-section :deep(.filter-bar),
.filter-section :deep(.academic-filter-bar) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.bottom-tab {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #0d6efd;
  color: white;
  border: 1px solid #e9ecef;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.3s ease;
  box-shadow: 0 -4px 15px rgba(13, 110, 253, 0.2);
  padding: 12px 24px;
  max-width: 300px;
  width: auto;
  text-align: center;
}

.bottom-tab * {
  color: white !important;
  fill: white !important;
  stroke: white !important;
}

.bottom-tab:hover {
  background: #0b5ed7;
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-content svg {
  color: #0d6efd;
}

.tab-text {
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.tab-badge {
  font-size: 14px;
  font-weight: 600;
  color: #6c757d;
}

.bottom-panel {
  position: fixed;
  bottom: -350px;
  left: 0;
  right: 0;
  height: 350px;
  background: white;
  border-top: 1px solid #e9ecef;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  transition: bottom 0.3s ease;
  z-index: 1000;
  overflow: hidden;
}

.bottom-panel.open {
  bottom: 0;
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 20px;
}

.panel-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e9ecef;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: #343a40;
  margin: 0;
}

.divider {
  color: #dee2e6;
  font-weight: 300;
}

.info-item {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  white-space: nowrap;
}

.info-item.highlight {
  color: #0d6efd;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6c757d;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #495057;
}

.panel-course-list {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
  padding: 0 4px;
}

@media all and (min-width: 1500px) {
  .panel-course-list {
    grid-template-columns: repeat(5, 1fr);
  }
}

.panel-course-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  transition: all 0.2s ease;
  height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.panel-course-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
}

.course-type-badge.전공필수 {
  background: #f3e5f5;
  color: #7b1fa2;
}

.course-type-badge.전공선택 {
  background: #e3f2fd;
  color: #1976d2;
}

.course-type-badge.교양필수 {
  background: #e8f5e8;
  color: #388e3c;
}

.course-type-badge.교양선택 {
  background: #fff3e0;
  color: #f57c00;
}

.course-title-small {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.3;
  word-break: keep-all;
}

.course-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-icon {
  font-size: 12px;
  width: 14px;
  flex-shrink: 0;
}

.detail-text {
  font-size: 13px;
  color: #6c757d;
  word-break: break-all;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  text-align: center;
}

.cancel-btn-small {
  display: none;
}

.cancel-btn {
  background-color: #ff3b30;
  color: #fff;
  border: none;
  border-radius: 4px;
  height: 32px;
  min-width: 80px;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background-color: #e03128;
}

.cancel-btn:active {
  background-color: #b3271f;
}

.mobile-credit-section .credit-info-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin: 50px auto 16px auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.mobile-credit-section .credit-title {
  font-size: 20px;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 12px;
}

.mobile-credit-section .credit-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.mobile-credit-section .credit-item {
  display: flex;
  flex-direction: row;
  font-size: 15px;
  color: #000;
}

.mobile-credit-section .credit-item strong {
  font-weight: 600;
  color: #343a40;
  margin-right: 8px;
}

.mobile-credit-section .divider {
  width: 1px;
  height: 20px;
  background-color: #e2e8f0;
}

.container-box {
  max-width: 1500px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
    flex-direction: column;
    align-items: stretch;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .mobile-credit-section .credit-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .mobile-credit-section .credit-box {
    gap: 12px;
  }

  .mobile-credit-section .credit-item {
    font-size: 14px;
  }

  .mobile-credit-section .divider {
    display: none;
  }

  .sidebar-toggle {
    display: none;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .container.sidebar-open {
    margin-right: 350px;
  }

  .sidebar {
    width: 350px;
    right: -350px;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .filter-section {
    display: flex;
    justify-content: flex-start;
  }

  .filter-section :deep(.filter-bar),
  .filter-section :deep(.academic-filter-bar) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 30px;
  }

  .header-card {
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .filter-section {
    display: flex;
    justify-content: flex-start;
  }

  .filter-section :deep(.filter-bar),
  .filter-section :deep(.academic-filter-bar) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
}
</style>
