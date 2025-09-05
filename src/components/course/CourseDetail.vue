<script setup>
import { reactive, onMounted } from "vue";
import { loadCourse } from "@/services/CourseService";

const props = defineProps({
  id: Number,
});

const state = reactive({
  form: {
    classroom: "",
    type: "전공",
    semester: 1,
    time: "",
    title: "",
    credit: null,
    weekPlan: "",
    textBook: "",
    goal: "",
    maxStd: null,
    deptName: "",
    userName: "",
    grade: null,
  },
});

onMounted(() => {
  loadCourseDetail(props.id);
});

const loadCourseDetail = async (id) => {
  console.log("아이디", id);
  const res = await loadCourse(id);
  console.log("res:", res);
  if (res === undefined || res.status !== 200) {
    alert("오류 발생. 잠시 후 다시 실행해주십시오.");
    return;
  }
  state.form = res.data;
  if (state.form.type === "교양") {
    state.form.deptName = "교양학부";
  }
};
</script>

<template>
  <div class="course-plan-title" title="강의계획서">강의계획서</div>
  <div class="section">
    <div class="info-grid">
      <div class="label"><i class="bi bi-book"></i> 교과목명:</div>
      <div class="value">{{ state.form.title }}</div>

      <div class="label"><i class="bi bi-person"></i> 담당교수:</div>
      <div class="value">{{ state.form.userName }}</div>

      <div class="label"><i class="bi bi-bookmark-dash"></i> 이수구분:</div>
      <div class="value">{{ state.form.type }}</div>

      <div class="label"><i class="bi bi-archive"></i> 학과명:</div>
      <div class="value">{{ state.form.deptName }}</div>

      <div class="label"><i class="bi bi-bookmark-dash"></i> 이수학점:</div>
      <div class="value">{{ state.form.credit }}</div>

      <div class="label"><i class="bi bi-archive"></i> 학기:</div>
      <div class="value">{{ state.form.semester }}</div>

      <div class="label"><i class="bi bi-stopwatch"></i> 강의시간:</div>
      <div class="value">{{ state.form.time }}</div>

      <div class="label"><i class="bi bi-people"></i> 수강대상:</div>
      <div class="value">
        <template v-if="state.form.type === '전공'">
          {{ state.form.deptName + " " + state.form.grade }}학년
        </template>
        <template v-else>수강희망자</template>
      </div>

      <div class="label"><i class="bi bi-binoculars"></i> 수강정원:</div>
      <div class="value">{{ state.form.maxStd }}</div>

      <div class="label"><i class="bi bi-geo-alt"></i> 강의실:</div>
      <div class="value">{{ state.form.classroom }}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">교재</div>
    <div class="label"><i class="bi bi-book"></i> 교과목명:</div>
    <div class="value">{{ state.form.textBook }}</div>
  </div>

  <div class="section">
    <div class="section-title">강의목표</div>
    <div class="value">{{ state.form.goal }}</div>
  </div>

  <div class="section">
    <div class="section-title">주차별계획</div>
    <div class="value" style="white-space: pre-line">
      {{ state.form.weekPlan }}
    </div>
  </div>

  <!-- 평가방법 -->
  <div class="section">
    <h3 class="section-title">평가방법</h3>
    <div class="evaluation">
      <div class="eval-item">
        <div class="eval-label">출석</div>
        <div class="eval-score">20%</div>
      </div>
      <div class="eval-item">
        <div class="eval-label">중간고사</div>
        <div class="eval-score">40%</div>
      </div>
      <div class="eval-item">
        <div class="eval-label">기말고사</div>
        <div class="eval-score">40%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-plan-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e0e0e0;
  margin-bottom: 15px;
}

.white-box {
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 24px;
  font-family: "Noto Sans KR", sans-serif;
}

.section {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 10px 30px 20px 30px;
  border-radius: 8px;
  border: 0.2px solid #74747450;
  background-color: #f8f9fa;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #343a40;
}

.info-grid {
  display: grid;
  grid-template-columns: 110px 250px 110px 150px;
  row-gap: 12px;
  column-gap: 16px;
  font-size: 15px;
}

.label {
  font-weight: 600;
  color: #747474;
}

.value {
  color: #747474;
}

.evaluation {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.eval-item {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: 8px;
  background: #e9f5e8;
  border-radius: 8px;
  border: 0.2px solid #00664f50;
}

.eval-label {
  font-size: 12px;
  color: #343a40;
  margin-bottom: 4px;
}

.eval-score {
  font-size: 20px;
  font-weight: 600;
  color: #00664f;
}

.course-plan-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e0e0e0;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
