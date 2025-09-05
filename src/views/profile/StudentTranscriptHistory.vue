<script setup>
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "@/stores/account";
import { getMyCurrentGrades } from "@/services/GradeService";
import { useRouter } from "vue-router";

const courseList = ref([]);
const searchTerm = ref("");
const router = useRouter();
const userStore = useUserStore();

async function fetchGrades() {
  try {
    const semesterId = userStore.semesterId;
    const res = await getMyCurrentGrades({ semesterId });
    courseList.value = res.data;
    console.log("성적 데이터 원본:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("성적 조회 실패:", error);
  }
}

onMounted(() => {
  fetchGrades();
});

const filteredCourses = computed(() => {
  if (!searchTerm.value) return courseList.value;
  return courseList.value.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const goToSurvey = (courseId) => {
  router.push({ path: "/course/survey", query: { courseId } });
};

// 수정된 강의평가 완료 여부 확인 함수
const isEvaluationCompleted = (course) => {
  return !!course.evScore || course.evScore === 0; // 0점도 평가 완료로 인정하고 싶다면
};

const canViewGrades = (course) => {
  return isEvaluationCompleted(course);
};
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1>금학기 성적조회</h1>
      <p>
        금학기 성적을 조회할 수 있으며, 상세 확인은 강의 평가 완료 후
        가능합니다.
      </p>

      <div class="search-bar">
        <div class="search-input">
          <i class="bi bi-search search-icon"></i>
          <input type="text" placeholder="강의이름 검색" v-model="searchTerm" />
        </div>
      </div>
    </div>

    <div class="course-list">
      <div
        v-for="(course, index) in filteredCourses"
        :key="course.courseCode"
        class="course-card"
      >
        <div class="course-header">
          <div class="course-info">
            <span class="course-number">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <span class="course-title">{{ course.title }}</span>
            <span class="course-divider">|</span>
            <span class="course-code me-3">{{ course.courseCode }}</span>
            <div class="course-actions">
              <div
                v-if="isEvaluationCompleted(course)"
                class="d-flex align-items-center"
                style="color: #00664f; font-weight: 600"
              >
                <i class="bi bi-check-circle-fill me-2"></i> 강의 평가 완료
              </div>
              <button
                v-else
                class="btn btn-danger"
                @click="goToSurvey(course.courseId)"
              >
                <i class="bi bi-pen me-1"></i> 강의 평가
              </button>
            </div>
          </div>
        </div>

        <!-- 성적 표시 부분 - 강의평가 완료된 경우만 표시 -->
        <div v-if="canViewGrades(course)" class="grade-stats">
          <div class="stat-item">
            <span class="stat-label">학점</span>
            <span class="stat-value">{{
              course.point ?? course.grade ?? "-"
            }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">평점</span>
            <span class="stat-value grade">{{
              course.rank ?? course.totalScore ?? "-"
            }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">출석</span>
            <span class="stat-value">{{ course.attendanceScore ?? "-" }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">중간고사</span>
            <span class="stat-value">{{ course.midScore ?? "-" }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">기말고사</span>
            <span class="stat-value">{{ course.finScore ?? "-" }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">기타</span>
            <span class="stat-value">{{ course.otherScore ?? "-" }}</span>
          </div>
        </div>

        <!-- 강의평가 미완료 시 경고 메시지 -->
        <div v-else class="warning-message">
          <i class="bi bi-exclamation-triangle text-danger me-2"></i>
          <span class="text-danger">
            강의 평가 미완료로 성적 조회가 제한됩니다. 평가를 먼저 완료해
            주세요.
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 50px;
  box-sizing: border-box;
}

.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.header-card h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.header-card p {
  color: #666;
  font-size: 13px;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.search-bar {
  margin-top: 16px;
}

.search-input {
  position: relative;
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
  z-index: 1;
}

.search-input input {
  width: 100%;
  padding: 12px 12px 12px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  box-sizing: border-box;
}

.search-input input::placeholder {
  color: #999;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.course-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  border-radius: 8px 8px 0 0;
}

.course-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.course-number {
  font-weight: 600;
  color: #333;
  font-size: 13px;
}

.course-title {
  font-weight: 600;
  color: #333;
  font-size: 14px;
  word-break: break-word;
}

.course-divider {
  color: #999;
  font-size: 13px;
}

.course-code {
  color: #666;
  font-size: 13px;
}

.course-actions {
  align-self: flex-start;
}

.btn {
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-weight: 500;
  width: 120px;
  height: 36px;
  white-space: nowrap;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.grade-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px 16px;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.stat-value.grade {
  color: #007bff;
}

.warning-message {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 16px;
  background: #fff3cd;
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
}

.text-danger {
  color: #dc3545 !important;
}

.me-1 {
  margin-right: 0.25rem;
}

.me-2 {
  margin-right: 0.5rem;
}

/* 모바일 (해상도 480px ~ 767px) */
@media all and (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .course-header {
    padding: 14px;
    gap: 10px;
  }

  .course-info {
    gap: 4px;
  }

  .course-title {
    font-size: 13px;
  }

  .btn {
    width: 100px;
    height: 32px;
    font-size: 11px;
    padding: 6px 10px;
  }

  .grade-stats {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 16px 12px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 13px;
  }

  .warning-message {
    padding: 16px 12px;
    font-size: 12px;
  }
}

/* 테블릿 (해상도 768px ~ 1023px) */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    padding: 20px 24px;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .search-input {
    max-width: 350px;
  }

  .course-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    gap: 16px;
  }

  .course-info {
    gap: 8px;
  }

  .course-title {
    font-size: 14px;
  }

  .course-actions {
    flex-shrink: 0;
  }

  .grade-stats {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 24px;
    padding: 22px 18px;
  }

  .stat-item {
    flex-direction: row;
    gap: 6px;
    min-width: 80px;
  }

  .stat-label {
    font-size: 13px;
  }

  .stat-value {
    font-size: 14px;
  }

  .warning-message {
    padding: 22px 18px;
    font-size: 14px;
  }
}

/* PC (해상도 1024px 이상) */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 50px;
  }

  .header-card {
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .search-input {
    max-width: 400px;
  }

  .search-input input {
    padding: 10px 12px 10px 35px;
    font-size: 13px;
  }

  .course-list {
    gap: 20px;
  }

  .course-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    gap: 16px;
  }

  .course-info {
    gap: 8px;
  }

  .course-number,
  .course-title,
  .course-divider,
  .course-code {
    font-size: 14px;
  }

  .course-actions {
    align-self: auto;
  }

  .btn {
    width: 120px;
    height: 36px;
    font-size: 12px;
    padding: 6px 12px;
  }

  .grade-stats {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px 19px;
    gap: 40px;
    flex-wrap: nowrap;
  }

  .stat-item {
    flex-direction: row;
    gap: 8px;
  }

  .stat-label {
    font-size: 14px;
  }

  .stat-value {
    font-size: 15px;
  }

  .warning-message {
    padding: 25px 19px;
    font-size: 15px;
  }
}
</style>
