<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";
import YnModal from "@/components/common/YnModal.vue";
import Confirm from "@/components/common/Confirm.vue";
import noDataImg from "@/assets/find.png";
import { courseStudentList, findMyCourse } from "@/services/professorService";
import axios from "axios";

const userStore = useUserStore();
const route = useRoute();

const attendDate = ref(new Date().toISOString().slice(0, 10));
const search = ref("");
const W = { att: 0.1, mid: 0.3, fin: 0.4, etc: 0.2 };

const state = reactive({
  allChecked: false,
  courseId: Number(route.query.id),
  sid: userStore.semesterId,
  courses: [],
  course: null,
  rows: [],
  loading: true,
  error: "",
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  showConfirmModal: false,
  confirmTarget: null,
});

const isSaving = ref(false);

/** 숫자 보정 */
const toNum = (v) => (Number.isFinite(+v) ? +v : 0);
const clip100 = (v) => Math.min(100, Math.max(0, toNum(v)));

/** 자동계산 */
const calc = (r) => {
  r.attendanceEval = clip100(r.attendanceEval);
  r.midterm = clip100(r.midterm);
  r.finalExam = clip100(r.finalExam);
  r.etcScore = clip100(r.etcScore);

  const total =
    r.attendanceEval * W.att +
    r.midterm * W.mid +
    r.finalExam * W.fin +
    r.etcScore * W.etc;

  r.total = total;
  r.grade =
    total >= 95
      ? "A+"
      : total >= 90
      ? "A"
      : total >= 85
      ? "B+"
      : total >= 80
      ? "B"
      : total >= 75
      ? "C+"
      : total >= 70
      ? "C"
      : total >= 60
      ? "D"
      : "F";
  r.gpa = {
    "A+": 4.5,
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    D: 1.0,
    F: 0,
  }[r.grade];
};

/** 학생 목록 불러오기 */
onMounted(async () => {
  try {
    state.loading = true;

    let courseIdFromRoute = route.query.id;
    console.log("route.query.id:", courseIdFromRoute);

    if (
      typeof courseIdFromRoute === "string" &&
      courseIdFromRoute.startsWith("temp-")
    ) {
      courseIdFromRoute = courseIdFromRoute.split("-")[1];
    }

    state.courseId = Number(courseIdFromRoute);
    console.log("최종 courseId:", state.courseId);

    state.course = {
      title: route.query.title || "강의",
    };

    // 학생 목록 가져오기
    const res = await courseStudentList(state.courseId);
    console.log("학생 리스트 res.data:", res.data);

    if (Array.isArray(res.data)) {
      state.rows = res.data.map((s) => {
        const attended = Number(s.attendanceDays ?? 0); // 실제 출석 횟수
        const totalWeeks = 50; // 총 50일 고정

        return {
          ...s,
          deptName: s.departmentName ?? "",
          gradeYear: s.gradeYear ?? "",
          attendanceDays: 50,
          absentDays: 0,
          attendanceEval: s.attendanceEval !== null ? s.attendanceEval : 0,
          midterm: s.midterm !== null ? s.midterm : 0,
          finalExam: s.finalExam !== null ? s.finalExam : 0,
          etcScore: s.etcScore !== null ? s.etcScore : 0,
          total: s.total ?? 0,
          grade: s.grade ?? "F",
          gpa: s.gpa ?? 0,
          checked: false,
          scoreId: s.scoreId ?? null,
          isEditing: false,
        };
      });

      state.rows.forEach(calc);
    } else {
      console.warn("⚠️ res.data가 배열이 아님:", res.data);
      state.rows = [];
    }
  } catch (e) {
    state.error = "학생 목록을 불러오지 못했습니다.";
    console.error("❌ 학생 목록 로딩 오류:", e);
  } finally {
    state.loading = false;
  }
});

// ✅ 성적 저장 (POST)
const saveGrades = async () => {
  const toPost = state.rows
    .filter((r) => r.checked)
    .map((r) => ({
      enrollmentId: r.enrollmentId,
      midScore: r.midterm,
      finScore: r.finalExam,
      attendanceScore: r.attendanceEval,
      otherScore: r.etcScore,
    }));

  if (toPost.length === 0) {
    alert("선택된 학생이 없습니다.");
    return;
  }

  try {
    await axios.post(`/professor/course/${state.courseId}/grade`, toPost);
    alert("✅ 성적 저장 성공!");
  } catch (e) {
    console.error("❌ 성적 저장 오류:", e.response?.data || e);
    alert("성적 저장 실패!");
  }
};

// ✅ 성적 수정 (PUT)
const updateGrade = async (row) => {
  const payload = {
    enrollmentId: row.enrollmentId,
    midScore: row.midterm,
    finScore: row.finalExam,
    attendanceScore: row.attendanceEval,
    otherScore: row.etcScore,
  };

  try {
    await axios.put("/professor/course/grade", payload);
    alert("✅ 성적 수정 성공!");
    row.isEditing = false; // 성적 수정 완료시 다시 수정버튼으로 전환
  } catch (e) {
    console.error("❌ 성적 수정 오류:", e.response?.data || e);
    alert("성적 수정 실패!");
  }
};

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

/** 검색 */
const filtered = computed(() => {
  const kw = search.value.trim();
  if (!kw) return state.rows;
  return state.rows.filter(
    (r) =>
      String(r.loginId ?? "").includes(kw) ||
      String(r.userName ?? "").includes(kw)
  );
});

/* 전체선택 토글 */
const toggleAll = () => {
  state.allChecked = !state.allChecked;
  filtered.value.forEach((s) => {
    s.checked = state.allChecked;
  });
};

/** ✅ 선택 저장 */
async function saveSelected() {
  const selected = state.rows.filter((r) => r.checked);
  if (selected.length === 0) {
    showModal("수정할 학생을 선택하세요.", "error");
    return;
  }

  isSaving.value = true;

  try {
    for (const r of selected) {
      const midScore = Math.round(Number(r.midterm) ?? 0);
      const finScore = Math.round(Number(r.finalExam) ?? 0);
      const attendanceScore = Math.round(Number(r.attendanceEval) ?? 0);
      const otherScore = Math.round(Number(r.etcScore) ?? 0);

      if (r.scoreId) {
        // 성적 수정
        await axios.put("/professor/course/grade", {
          enrollmentId: r.enrollmentId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
        });
      } else {
        // 신규 성적 등록
        await axios.post("/professor/course/grade", {
          enrollmentId: r.enrollmentId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
        });
      }
    }

    showModal("선택한 학생 성적이 저장되었습니다!", "success");
  } catch (err) {
    console.error("❌ 성적 저장 오류:", err);
    showModal("성적 저장 실패", "error");
  } finally {
    isSaving.value = false;
  }
}

/** 행 초기화 */
function resetRow(r) {
  state.confirmTarget = r;
  state.showConfirmModal = true;
}

function handleConfirm() {
  const r = state.confirmTarget;
  if (!r) return;

  r.attendanceDays = 0;
  r.absence = 0;
  r.attendanceEval = 0;
  r.midterm = 0;
  r.finalExam = 0;
  r.etcScore = 0;
  r.total = 0;
  r.grade = "F";
  r.gpa = 0;
  r.checked = false;

  // 초기화 후 상태 정리
  state.confirmTarget = null;
  state.showConfirmModal = false;
}

/** CSV 내보내기 */
function exportCsv() {
  const header = [
    "학번",
    "이름",
    "학년",
    "학과",
    "출석일수",
    "결석일수",
    "출결평가",
    "중간평가",
    "기말평가",
    "기타평가",
    "총점",
    "등급",
    "평점",
  ];

  const rows = state.rows.map((r) => [
    r.loginId ?? "",
    r.userName ?? "",
    r.gradeYear ?? "",
    r.deptName ?? "",
    r.attendanceDays ?? 0,
    r.absence ?? 0,
    r.attendanceEval ?? 0,
    r.midterm ?? 0,
    r.finalExam ?? 0,
    r.etcScore ?? 0,
    r.total ?? 0,
    r.grade ?? "",
    r.gpa ?? 0,
  ]);

  const csvContent =
    "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `grades_${state.courseId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="container">
    <div class="header-card">
      <div class="course-header">
        <div class="icon-box">
          <i class="bi bi-book"></i>
        </div>
        <h1 class="page-title">{{ state.course?.title }}성적입력 및 정정</h1>
      </div>

      <div class="att-wrap">
        <!-- 툴바 -->
        <div class="toolbar">
          <div class="left">
            <button class="btn btn-secondary" @click="toggleAll">
              전체선택
            </button>
            <button class="btn btn-success" @click="exportCsv">
              <i class="bi bi-download me-2"></i>
              내보내기
            </button>
            <!-- <div class="date">
              <input type="date" v-model="attendDate" />
            </div> -->
          </div>

          <div class="right">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="search"
                class="search-input"
                type="text"
                placeholder="이름 또는 학번 검색"
              />
            </div>

            <button
              class="btn btn-primary"
              :disabled="isSaving"
              @click="saveSelected"
            >
              <i class="bi bi-folder me-2"></i>
              {{ isSaving ? "저장 중..." : "저장" }}
            </button>
          </div>
        </div>

        <!-- 상태 -->
        <div v-if="state.error" class="state error">{{ state.error }}</div>

        <!-- 테이블 -->
        <div class="table-container">
          <div class="table-wrapper desktop-view">
            <table v-if="filtered.length">
              <thead>
                <tr>
                  <th></th>
                  <th>학번</th>
                  <th>이름</th>
                  <th>학년</th>
                  <th>학과</th>
                  <th>출석일수</th>
                  <th>결석일수</th>
                  <th>출결평가</th>
                  <th>중간평가</th>
                  <th>기말평가</th>
                  <th>기타평가</th>
                  <th>총점</th>
                  <th>등급</th>
                  <th>평점</th>
                  <th>수정</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in filtered" :key="r.enrollmentId">
                  <td><input type="checkbox" v-model="r.checked" /></td>
                  <td>{{ r.loginId }}</td>
                  <td>{{ r.userName }}</td>
                  <td>{{ r.gradeYear }}</td>
                  <td>{{ r.deptName }}</td>

                  <!-- 출석일수 -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      min="0"
                      max="50"
                      v-model.number="r.attendanceDays"
                      :readonly="!r.isEditing"
                      @input="
                        r.absentDays =
                          50 - Math.max(0, Math.min(50, r.attendanceDays))
                      "
                    />
                  </td>
                  <td>{{ r.absentDays }}</td>

                  <<<<<<< HEAD
                  <!-- 출석일수: 교수자가 직접 수정 (0~15 제한) -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      min="0"
                      max="50"
                      v-model.number="r.attendanceDays"
                      @input="
                        r.attendanceDays = Math.min(
                          50,
                          Math.max(0, r.attendanceDays)
                        );
                        r.absentDays = 50 - r.attendanceDays;
                      "
                    />
                  </td>
                  =======
                  <!-- 출결평가 -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.attendanceEval"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>
                  >>>>>>> ad7030eb815eec78319d5c05665eca1d97556434

                  <!-- 중간 -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.midterm"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>

                  <!-- 기말 -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.finalExam"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>

                  <!-- 기타 -->
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.etcScore"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>

                  <td>{{ r.total.toFixed(1) }}</td>
                  <td>{{ r.grade }}</td>
                  <td>{{ r.gpa.toFixed(1) }}</td>

                  <!-- 수정/저장 버튼 -->
                  <td>
                    <div v-if="!r.isEditing">
                      <button
                        type="button"
                        class="btn btn-secondary w-full"
                        @click="r.isEditing = true"
                      >
                        수정
                      </button>
                    </div>
                    <div v-else class="flex gap-1">
                      <button
                        type="button"
                        class="btn btn-primary w-full"
                        @click="updateGrade(r)"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        class="btn btn-light w-full"
                        @click="r.isEditing = false"
                      >
                        취소
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
              <p>검색 결과가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
    />
    <Confirm
      v-if="state.showConfirmModal"
      :show="state.showConfirmModal"
      :type="'error'"
      @confirm="handleConfirm"
      @close="state.showConfirmModal = false"
    />
  </div>
</template>

<style scoped>
/* 레이아웃 */
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

.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #afb0b2;
  font-weight: 500;
}

.empty-image {
  max-width: 80px;
  opacity: 0.8;
  margin-top: -10px;
  margin-bottom: 20px;
}

.att-wrap {
  padding-top: 6px;
}

.course-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  margin-top: 8px;
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

/* 툴바 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.date input {
  height: 37px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.search:focus,
.filter:focus,
.date input:focus,
.note:focus {
  outline: none;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-wrapper {
  position: relative;
}

.search-wrapper .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 14px;
}

.search-wrapper .search-input {
  width: 250px;
  padding: 6px 12px 8px 32px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
}

.search-wrapper .search-input:hover {
  border-color: #cbd5e1;
}

.search-wrapper .search-input:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

/* 버튼 */
.btn {
  height: 35px;
  padding: 0 20px;
  border-radius: 6px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
}

/* 테이블 */
.table-container {
  margin: auto auto 50px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1500px;
  position: relative;
  overflow: hidden;
  padding: 15px 0 0 0;
}

.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: auto;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #969696 #fff;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  color: #343a40;
  background-color: #f8f9fa;
}

thead th {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 2;
  padding: 12px 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

thead th::before,
thead th::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #969696;
}

thead th::before {
  top: 0;
}

thead th::after {
  bottom: 0;
}

tbody {
  color: black;
  background-color: white;
}

tbody tr {
  border-bottom: 1px solid #747474;
  height: 40px;
  background-color: white;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

tbody td {
  padding: 8px 10px;
  border-right: none;
  font-size: 13px;
  text-align: center;
  word-wrap: break-word;
  vertical-align: middle;
}

tbody td.title {
  text-align: center;
  vertical-align: middle;
  white-space: normal;
  word-break: break-all;
  line-height: 1.3;
  padding: 8px 10px;
}

.num {
  width: 72px;
  height: 30px;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
}

.num:focus {
  border-color: #1e90ff;
  box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.12);
}

.state {
  padding: 18px;
  color: #475569;
}

.state.error {
  color: #b91c1c;
}

.tbl {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.tbl thead th,
.tbl tbody td {
  text-align: center;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  vertical-align: middle;
}

.tbl thead th:nth-child(1),
.tbl tbody td:nth-child(1) {
  width: 44px;
}
.tbl thead th:nth-child(2),
.tbl tbody td:nth-child(2) {
  width: 100px;
}
.tbl thead th:nth-child(3),
.tbl tbody td:nth-child(3) {
  width: 90px;
}
.tbl thead th:nth-child(4),
.tbl tbody td:nth-child(4) {
  width: 80px;
}
.tbl thead th:nth-child(5),
.tbl tbody td:nth-child(5) {
  width: 160px;
}
.tbl thead th:nth-child(6),
.tbl tbody td:nth-child(6) {
  width: 92px;
}
.tbl thead th:nth-child(7),
.tbl tbody td:nth-child(7) {
  width: 92px;
}
.tbl thead th:nth-child(8),
.tbl tbody td:nth-child(8) {
  width: 92px;
}
.tbl thead th:nth-child(9),
.tbl tbody td:nth-child(9) {
  width: 92px;
}
.tbl thead th:nth-child(10),
.tbl tbody td:nth-child(10) {
  width: 92px;
}
.tbl thead th:nth-child(11),
.tbl tbody td:nth-child(11) {
  width: 92px;
}
.tbl thead th:nth-child(12),
.tbl tbody td:nth-child(12) {
  width: 80px;
}
.tbl thead th:nth-child(13),
.tbl tbody td:nth-child(13) {
  width: 70px;
}
.tbl thead th:nth-child(14),
.tbl tbody td:nth-child(14) {
  width: 70px;
}
.tbl thead th:nth-child(15),
.tbl tbody td:nth-child(15) {
  width: 76px;
}

/* 모바일 */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }

  .header-card {
    padding: 16px;
    margin-bottom: 16px;
  }

  .course-header {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 18px;
  }

  .toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .left,
  .right {
    width: 100%;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .left .btn,
  .left .date {
    flex-grow: 1;
    min-width: 100px;
  }

  .right .btn {
    order: 3;
    flex-grow: 1;
  }

  .search-wrapper {
    order: 1;
    flex-grow: 2;
    min-width: 150px;
  }

  .search-wrapper .search-input,
  .date input {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
  }

  .table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    min-width: 1200px;
  }

  thead th {
    font-size: 12px;
    padding: 10px 6px;
  }

  tbody td {
    font-size: 12px;
    padding: 6px 4px;
  }

  .num {
    width: 60px;
    font-size: 12px;
  }

  .btn {
    font-size: 12px;
    padding: 0 12px;
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

  .page-title {
    font-size: 22px;
  }

  .toolbar {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 12px;
  }

  .left,
  .right {
    flex-grow: 1;
    gap: 8px;
  }

  .search-wrapper {
    flex-grow: 1;
    flex-basis: 200px;
    min-width: 150px;
  }

  .search-wrapper .search-input {
    width: 100%;
  }

  .date input {
    height: 37px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    min-width: 1200px;
  }

  td,
  th {
    padding: 8px;
    font-size: 13px;
  }

  .desktop-view {
    display: block;
  }

  .mobile-view {
    display: none;
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

  .course-header {
    margin-bottom: 30px;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .search-wrapper .search-input {
    width: 250px;
  }

  table {
    min-width: 1200px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  .desktop-view {
    display: block;
  }

  .mobile-view {
    display: none;
  }
}
</style>
