<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const courses = ref([]); // 강의 목록
const selectedCourseId = ref(null); // 선택한 강의 ID
const students = ref([]); // 학생 목록
const loading = ref(false);
const errorMessage = ref('');

// 강의 목록 불러오기
const fetchCourses = async () => {
  try {
    const res = await axios.get('/professor/course');
    courses.value = res.data;
  } catch (err) {
    console.error(err);
    errorMessage.value = '강의 목록을 불러오는데 실패했습니다.';
  }
};

// 선택한 강의의 학생 목록 불러오기
const fetchStudents = async () => {
  if (!selectedCourseId.value) return;
  loading.value = true;
  errorMessage.value = '';
  try {
    const res = await axios.get(
      `/professor/course/${selectedCourseId.value}/students`
    );
    students.value = res.data;
  } catch (err) {
    console.error(err);
    errorMessage.value = '학생 목록을 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCourses(); // 처음 페이지 진입 시 강의 목록 불러오기
});
</script>

<template>
  <div class="student-table-wrapper">
    <h2>강의별 학생 조회</h2>

    <!-- 강의 선택 -->
    <div class="form-group">
      <label for="courseSelect">강의 선택</label>
      <select
        id="courseSelect"
        v-model="selectedCourseId"
        @change="fetchStudents"
      >
        <option disabled value="">강의를 선택하세요</option>
        <option
          v-for="course in courses"
          :key="course.courseId"
          :value="course.courseId"
        >
          {{ course.courseName }}
        </option>
      </select>
    </div>

    <!-- 로딩 -->
    <div v-if="loading">학생 목록을 불러오는 중...</div>

    <!-- 에러 메시지 -->
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

    <!-- 학생 리스트 테이블 -->
    <table v-if="students.length > 0" class="student-table">
      <thead>
        <tr>
          <th>수강신청 ID</th>
          <th>학번</th>
          <th>로그인ID</th>
          <th>이름</th>
          <th>학년</th>
          <th>학과</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.enrollmentId">
          <td>{{ student.enrollmentId }}</td>
          <td>{{ student.userId }}</td>
          <td>{{ student.loginId ?? '-' }}</td>
          <td>{{ student.userName }}</td>
          <td>{{ student.gradeYear }}</td>
          <td>{{ student.departmentName }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading && !errorMessage">학생 정보가 없습니다.</div>
  </div>
</template>

<style scoped>
.student-table-wrapper {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fafafa;
}

h2 {
  margin-bottom: 16px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 16px;
}

select {
  padding: 6px;
  font-size: 14px;
}

.student-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.student-table th,
.student-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.error {
  color: red;
  margin: 10px 0;
}
</style>
