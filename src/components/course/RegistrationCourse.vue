<script setup>
import { reactive, onMounted, watch } from "vue";
import { saveCourse, modify } from "@/services/professorService";
import { useRouter } from "vue-router";
import YnModal from "@/components/common/YnModal.vue";
import ConfirmModal from "@/components/common/Confirm.vue";
import { loadCourse } from "@/services/CourseService";
import { useUserStore } from "@/stores/account";
import { findStartDateTime } from "@/services/scheduleService";


const props = defineProps({
  id: Number,
});
const userStore = useUserStore();
const router = useRouter();

const state = reactive({
  form: {
    deptName: userStore.state.signedUser.deptName,
    courseId: 0,
    classroom: "",
    semesterId: userStore.state.signedUser.semesterId,
    type: "전공필수",
    time: "",
    title: "",
    credit: null,
    weekPlan: "",
    textBook: "",
    goal: "",
    maxStd: null,
    grade: 1,
  },
  evaluation: {
    middleExam: 30,
    lastExam: 40,
    assignment: 20,
    attendanceRate: 10,
  },
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  showConfirmModal: false,
  confirmMessage: "",
  confirmAction: null,
  courseTime:{
    date:1,
    time:1

  }
});

//탭 기능자체를 막기 위해사용
const successDate = async () =>{
  const res = await findStartDateTime("강의개설");
  const start = res.data.startDatetime
  const end = res.data.endDatetime
  const now = new Date();
  const formatted = now.toISOString().slice(0, 19).replace('T', ' '); 
  console.log(formatted)
  if(formatted > end || formatted < start){
    showModal("신청기간이 아닙니다.", "warning",()=>{
    });
    return;
  }
}

watch(
  () => state.form.type,
  (newType) => {
    if (newType === "교양") {
      state.form.grade = 0;
    } else {
      state.form.grade = 1;
    }
  }
);

const openConfirmModal = (message, action) => {
  state.confirmMessage = message;
  state.confirmAction = action;
  state.showConfirmModal = true;
};

const handleConfirm = () => {
  state.showConfirmModal = false;
  if (state.confirmAction) {
    state.confirmAction();
    state.confirmAction = null;
  }
};

const closeConfirmModal = () => {
  state.showConfirmModal = false;
  state.confirmAction = null;
};

onMounted(async () => {
  if (props.id) {
    state.courseId = props.id;
    const res = await loadCourse(props.id);
    state.form = res.data;
  }
  successDate();
});

const submitConfirmed = async () => {
  let data = null;
  if (state.form.courseId > 0) {
    const res = await modify(state.form);
    data = res;
  } else {
    state.form.time = state.courseTime.date + state.courseTime.time
    console.log(state.form.time)
    const res = await saveCourse(state.form);
    data = res;
  }
  
  if (!data || data.status !== 200) {
    showModal(data.data.message, "error");
    console.log(data)
    return;
  }
  showModal("신청되었습니다. 페이지를 이동합니다", "success");
};

const submit = () => {
  openConfirmModal("개설 신청하시겠습니까?", submitConfirmed);
};

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const close = (type) => {
  state.showYnModal = false;
  if (type === "error") {
    return;
  }
  if (type ==="warning"){
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/main'); // 메인화면 새로고침시 history가 사라진다 
    }
  }
  router.push("/pro/course/state");
};

const resetForm = () => {
  state.form = {
    classroom: "",
    type: "전공필수",
    time: "",
    title: "",
    credit: null,
    weekPlan: "",
    textBook: "",
    goal: "",
    maxStd: null,
    grade: 1,
  };
};

const evalItems = [
  { key: "attendanceRate", label: "출석" },
  { key: "middleExam", label: "중간고사" },
  { key: "lastExam", label: "기말고사" },
  { key: "assignment", label: "과제" },
];
</script>

<template>
  <div class="container">
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="close(state.ynModalType)"
    />
    <ConfirmModal
      v-if="state.showConfirmModal"
      :content="state.confirmMessage"
      type="warning"
      @confirm="handleConfirm"
      @cancel="closeConfirmModal"
    />
    <div class="header-card">
      <h1 class="page-title">강의개설</h1>
      <p>
        새로운 강의를 개설해보세요. 강의계획서와 함께 강의정보를 입력하시면
        개설신청이 완료됩니다.
      </p>
    </div>

    <div class="white-box wb p-4">
      <div class="grid-2">
        <div>
          <h3 class="section-title-top">기본 정보</h3>
          <div class="form-item">
            <label for="title">교과목명</label>
            <input
              type="text"
              id="title"
              v-model="state.form.title"
              class="input"
            />
          </div>
          <div class="form-item">
            <label for="type">이수구분</label>
            <select id="type" v-model="state.form.type" class="input">
              <option value="전공필수">전공필수</option>
              <option value="전공선택">전공선택</option>
              <option value="교양">교양</option>
            </select>
          </div>
          <div class="form-item">
            <label for="credit">이수학점</label>
            <select id="credit" v-model="state.form.credit" class="input">
              <option :value="1">1</option>
              <option :value="2">2</option>
              <option :value="3">3</option>
            </select>
          </div>
          <div class="form-item">
            <label for="time">강의시간</label>
            <div class="d-flex gap-3">
            <select class="input" v-model="state.courseTime.date">
              <option value = "A">월</option>
              <option value = "B">화</option>
              <option value = "C">수</option>
              <option value = "D">목</option>
              <option value = "E">금</option>
            </select>
            <select class="input" v-model="state.courseTime.time">
              <option value = "1">09:00 ~ 10:20</option>
              <option value = "2">10:30 ~ 11:50</option>
              <option value = "3">12:00 ~ 01:20</option>
              <option value = "4">01:30 ~ 02:50</option>
              <option value = "5">03:00 ~ 04:20</option>
              <option value = "6">04:30 ~ 05:50</option>
              <option value = "7">06:00 ~ 07:20</option>
            </select>
            </div>
          </div>
          <div class="form-item">
            <label for="time">강의시간</label>
            <input
              type="text"
              id="time"
              v-model="state.form.time"
              class="input"
              placeholder="예: 수 1,2,3 & 목 4,5"
            />
          </div>
        </div>

        <div>
          <h3 class="section-title-top">수강 정보</h3>
          <div class="form-item">
            <label for="maxStd">수강인원</label>
            <input
              type="number"
              id="maxStd"
              v-model="state.form.maxStd"
              class="input"
            />
          </div>
          <div class="form-item">
            <label for="deptName">학과명</label>
            <input
              type="text"
              id="deptName"
              v-model="state.form.deptName"
              class="input"
              disabled
            />
          </div>
          <div class="form-item">
            <label for="grade">수강대상</label>
            <template v-if="state.form.type !== '교양'">
              <select id="grade" v-model="state.form.grade" class="input">
                <option v-for="num in 4" :key="num" :value="num">
                  {{ userStore.state.signedUser.deptName }} {{ num }}학년
                </option>
              </select>
            </template>
          </div>
          <div class="form-item">
            <label for="classroom">강의실</label>
            <input
              type="text"
              id="classroom"
              v-model="state.form.classroom"
              class="input"
            />
          </div>
        </div>
      </div>

      <h3 class="section-title">강의 계획</h3>
      <div class="form-item">
        <label for="textBook">교재정보</label>
        <input
          type="text"
          id="textBook"
          v-model="state.form.textBook"
          class="input"
        />
      </div>
      <div class="form-item">
        <label for="goal">강의목표</label>
        <textarea id="goal" v-model="state.form.goal" class="input"></textarea>
      </div>
      <div class="form-item">
        <label for="weekPlan">주차별계획</label>
        <textarea
          id="weekPlan"
          v-model="state.form.weekPlan"
          class="input"
        ></textarea>
      </div>

      <h3 class="section-title">평가 방법</h3>
      <div class="evaluation-grid">
        <div class="score-card" v-for="item in evalItems" :key="item.key">
          <label :for="item.key">{{ item.label }}</label>
          <div class="input-percent-wrapper">
            <input
              type="number"
              :id="item.key"
              v-model.number="state.evaluation[item.key]"
              min="0"
              max="100"
              class="input score-input"
              disabled
            />
            <span class="percent-symbol">%</span>
          </div>
        </div>
      </div>

      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="resetForm">
          초기화
        </button>
        <button type="button" class="btn btn-success" @click="submit">
          {{ state.form.courseId > 0 ? "수정" : "신청" }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input,
input[type="text"],
input[type="number"],
input[type="search"] {
  -webkit-appearance: none;
  appearance: none;
}

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

.form-item {
  margin-bottom: 16px; /* 여백 조정 가능 */
}

.white-box {
  min-height: auto;
}
.wb {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 24px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

/* 섹션 헤더 */
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  margin-top: 30px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6eef7;
}

.section-title-top {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6eef7;
}

/* 폼 레이아웃 */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 25px;
  gap: 10px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 25px;
  gap: 10px;
}

.col-2 {
  grid-column: span 2;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #343a40;
  margin-bottom: 6px;
}

.hstack {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input {
  width: 100%;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f7f8f9;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px;
  margin-bottom: 20px;
}

.btn-secondary {
  height: 44px;
  min-width: 120px;
  font-size: 14px;
}

.btn-success {
  background-color: #5ba666;
  color: #fff;
  border: none;
  height: 44px;
  min-width: 120px;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-success:hover {
  background-color: #4a8955;
}

.btn-success:active {
  background-color: #3e7548;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 50px;
  gap: 14px;
}

.evaluation-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.score-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px 16px;
  width: 120px;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.1);
  text-align: center;
  border: 1px solid #e5e7eb;
}

.score-card label {
  font-size: 14px;
  color: #343a40;
  margin-bottom: 8px;
  display: block;
}

.input-percent-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.score-input {
  border: none;
  outline: none;
  background: transparent;
  text-align: center;
  font-weight: bold;
  font-size: 20px;
}

.percent-symbol {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-weight: 600;
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

  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .verify-wrapper {
    grid-column: 1 / -1;
  }

  .verify-code-btn {
    width: 100%;
  }

  .evaluation-grid {
    flex-direction: column;
    gap: 12px;
  }

  .score-card {
    width: 100%;
    max-width: none;
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

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }
  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }

  .verify-code-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    grid-column: 1 / -1;
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
    padding: 24px 24px 8px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }

  .verify-code-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    grid-column: 1 / -1;
  }
}
</style>
