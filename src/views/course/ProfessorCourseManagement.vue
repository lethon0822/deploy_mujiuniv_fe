<script setup>
import { reactive, onMounted } from "vue";
import { findMyCourse } from "@/services/professorService";
import { useUserStore } from "@/stores/account";
import { useRouter } from "vue-router";
import { changeCodeToTime } from "@/services/CommonMethod";

const userStore = useUserStore();
const signedUser = userStore.state.signedUser;
const router = useRouter();

const state = reactive({
  data: [],
  result: [],
  sid: signedUser.semesterId,
});

onMounted(async () => {
  const json = {
    sid: state.sid,
  };
  const res = await findMyCourse(json);
  console.log(res);
  state.data = res.data.result;

  state.result = state.data.filter((item) => {
    return item.status === "승인";
  });

  const sortArray = state.result.toSorted((a, b) => {
      return a.title.localeCompare(b.title) // 문자열 정렬시 localeComparte 사용
  })
  state.result = sortArray

});

const attendance = (id) => {
  const course = state.result.find((c) => c.courseId === id);

  router.push({
    path: "/pro/attendance",
    query: {
      id: id,
      title: course?.title || "",
    },
  });
};

const enrollmentGrade = (id) => {
  const course = state.result.find((c) => c.courseId === id);

  router.push({
    path: "/pro/enrollmentgrade",
    query: {
      id: id,
      title: course?.title || "",
    },
  });
};


</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1>강의 관리</h1>
      <p>강의 출석부를 관리하고 학생 성적을 입력 및 수정 할 수 있습니다.</p>

      <div class="search-bar">
        <div class="search-input">
          <i class="bi bi-search search-icon"></i>
          <input type="text" placeholder="강의 이름 검색" />
        </div>
      </div>
    </div>

    <div class="course-list">
      <div
        v-for="course in state.result"
        :key="course.courseId"
        class="course-card"
      >
        <div class="course-header">
          <div class="icon-box">
            <i class="bi bi-book"></i>
          </div>
          <h3 class="course-title">{{ course.title }}</h3>
        </div>

        <div class="course-info">
          <!-- 왼쪽 열 -->
          <div class="info-column">
            <div class="info-row">
              <span class="label">강의코드:</span>
              <span class="value">{{ course.courseCode }}</span>
            </div>
            <div class="info-row">
              <span class="label"
                ><i class="bi bi-alarm me-2"></i>강의시간:</span
              >
              <span class="value">{{ changeCodeToTime(course.time) }}</span>
            </div>
            <div class="info-row">
              <span class="label"><i class="bi bi-award me-2"></i>학점:</span>
              <span class="value">{{ course.credit }}</span>
            </div>
          </div>

          <!-- 오른쪽 열 -->
          <div class="info-column">
            <div class="info-row">
              <span class="label"
                ><i class="bi bi-calendar me-2"></i>학기:</span
              >
              <span class="value">{{ course.semester }}</span>
            </div>
            <div class="info-row">
              <span class="label"
                ><i class="bi bi-cursor-fill me-2"></i>강의실:</span
              >
              <span class="value">{{ course.classroom }}</span>
            </div>
            <div class="info-row">
              <span class="label"
                ><i class="bi bi-people-fill me-2"></i>수강인원:</span
              >
              <span class="value student-number"
                >{{ course.courseStudent }}명</span
              >
            </div>
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
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
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
  font-size: 22px;
  font-weight: 600;
  color: #343a40;
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
  padding: 10px 12px 10px 35px;
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

.search-input input:focus {
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
}

.icon-box {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: #edf7f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box i {
  font-size: 20px;
  color: #166534;
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
  font-size: 22px;
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
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 20px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.info-row {
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  margin-right: 5px;
}

.value {
  color: #333;
  font-size: 14px;
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
}

.btn-attendance {
  background: #007bff;
  color: white;
}

.btn-attendance:hover {
  background: #0056b3;
}

@media (max-width: 767px) {
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

/* 모바일 */
@media (max-width: 767px) {
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

  .course-info {
    gap: 4px;
  }

  .course-title {
    font-size: 22px;
  }

  .btn {
    width: 100%;
    padding: 7px 25px;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }
}

/* 테블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  .course-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    gap: 16px;
  }

  .btn {
    width: 50%;
    padding: 7px 25px;
    font-size: 14px;
    font-weight: 500;
    flex-shrink: 0;
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }

  .course-card {
    padding: 20px 30px 20px 30px;
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

  .search-input {
    max-width: 400px;
  }

  .search-input input {
    padding: 10px 12px 10px 35px;
    font-size: 13px;
  }

  .btn {
    width: 50%;
    padding: 7px 25px;
    font-size: 15px;
    font-weight: 500;
    height: 45px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }

  .course-card {
    padding: 35px 45px 35px 45px;
  }
}
</style>
