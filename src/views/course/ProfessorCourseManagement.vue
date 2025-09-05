<script setup>
import { reactive, onMounted } from "vue";
import { findMyCourse } from "@/services/professorService";
import { useUserStore } from "@/stores/account";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const state = reactive({
  data: [],
  result: [],
  sid: userStore.semesterId,
});

onMounted(async () => {
  const json = {
    "sid":state.sid
  }
  const res = await findMyCourse(json);
  console.log("믹",res)
  state.data = res.data;

  state.result = state.data.filter((item, index) => {
    return item.status === "승인";
  });
});

const attendance = (id) => {
  // console.log("넘겨줄 데이터", state.data);
  // const jsonBody = JSON.stringify(state.data);

  router.push({
    path: "/professor/attendance",
    query: { id: id },
  });
};

const enrollmentGrade = (id) => {
  // console.log("넘겨줄 데이터", state.data);
  // const jsonBody = JSON.stringify(state.data);

  router.push({
    path: "/enrollmentgrade",
    query: { id: id },
  });
};

const handleStudentManagement = (courseId) => {
  console.log(`학생 관리: ${courseId}`);
};

const handleAttendanceManagement = (courseId) => {
  console.log(`출결관리 및 성적: ${courseId}`);
};
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>강의 관리 시스템</h1>
      <p>담당 교수님의 강의 교과목에서 신청한 수강생을 조회합니다.</p>
    </div>

    <div class="search-bar">
      <div class="search-input">
        <i class="bi bi-search search-icon"></i>
        <input type="text" placeholder="강의 이름 검색" />
      </div>
    </div>

    <div class="course-list">
      <div
        v-for="course in state.result"
        :key="course.courseId"
        class="course-card"
      >
        <div class="course-header">
          <h3 class="course-title">{{ course.title }}</h3>
        </div>

        <div class="course-info">
          <div class="info-row">
            <span class="label">담당교수:</span>
            <span class="value">{{ userStore.userName }}</span>
          </div>
          <div class="info-row">
            <span class="label">강의시간:</span>
            <span class="value">{{ course.time }}</span>
          </div>
          <div class="info-row">
            <span class="label">학점:</span>
            <span class="value">{{ course.credit }}</span>
          </div>
          <div class="info-row">
            <span class="label">학기:</span>
            <span class="value">{{ course.semester }}</span>
          </div>
          <div class="info-row">
            <span class="label">강의실:</span>
            <span class="value">{{ course.classroom }}</span>
          </div>
          <div class="info-row">
            <span class="label">수강인원:</span>
            <span class="value student-number"
              >{{ course.courseStudent }}명</span
            >
          </div>
        </div>

        <!-- 버튼 -->
        <div class="course-actions">
          <button
            class="btn btn-success me-2"
            @click="attendance(course.courseId)"
          >
            <i class="bi bi-people-fill me-1"></i> 출석부 작성
          </button>

          <button
            class="btn btn-primary"
            @click="enrollmentGrade(course.courseId)"
          >
            <i class="bi bi-pen me-1"></i> 성적입력 및 정정
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  text-align: left;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 22px;
  font-weight: 600px;
  color: #333;
  margin-bottom: 8px;
}

.header p {
  color: #666;
  font-size: 14px;
}

.search-bar {
  margin: 20px 0;
}
.search-input {
  position: relative;
  max-width: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: none;
  border: 1px solid #e9ecef;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 16px;
  z-index: 1;
}
.search-input input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  background: transparent;
  box-sizing: border-box;
}
.search-input input::placeholder {
  color: #999;
}

.search-input input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.course-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
}

.course-number {
  background: #6c757d;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 15px;
}

.course-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.student-count {
  color: #666;
  font-size: 14px;
  background: #f8f9fa;
  padding: 4px 12px;
  border-radius: 12px;
}

.course-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  padding: 5px 0;
}

.label {
  min-width: 80px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.value {
  color: #333;
  font-size: 14px;
  flex: 1;
}

.student-number {
  color: #007bff;
  font-weight: 600;
}

.course-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 10px 210px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-student {
  background: #28a745;
  color: white;
}

.btn-student:hover {
  background: #218838;
  transform: translateY(-1px);
}

.btn-attendance {
  background: #007bff;
  color: white;
}

.btn-attendance:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .course-info {
    grid-template-columns: 1fr;
  }

  .course-actions {
    flex-direction: column;
  }

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .course-number {
    align-self: flex-start;
  }
}
</style>
