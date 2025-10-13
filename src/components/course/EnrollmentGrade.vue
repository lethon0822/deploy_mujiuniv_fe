<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";
import YnModal from "@/components/common/YnModal.vue";
import Confirm from "@/components/common/Confirm.vue";
import noDataImg from "@/assets/find.png";
import { courseStudentList } from "@/services/professorService";
import axios from "axios";

const userStore = useUserStore();
const route = useRoute();

const TOTAL_DAYS = 50;

const W = { att: 0.1, mid: 0.3, fin: 0.4, etc: 0.2 };
const search = ref("");
const isSaving = ref(false);

const state = reactive({
  allChecked: false,
  courseId: Number(route.query.id),
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

const toNum = (v) => (Number.isFinite(+v) ? +v : 0);
const clip100 = (v) => Math.min(100, Math.max(0, toNum(v)));

function updateAttendanceEval(r) {
  r.attendanceDays = Math.min(50, Math.max(0, r.attendanceDays));

  r.absentDays = TOTAL_DAYS - r.attendanceDays;

  const absent = r.absentDays;
  if (absent <= 5) r.attendanceEval = 100;
  else if (absent <= 9) r.attendanceEval = 90;
  else if (absent <= 13) r.attendanceEval = 80;
  else if (absent <= 17) r.attendanceEval = 70;
  else if (absent <= 21) r.attendanceEval = 60;
  else if (absent <= 25) r.attendanceEval = 50;
  else r.attendanceEval = 0;

  calc(r);
}

const calc = (r) => {
  r.midterm = clip100(r.midterm);
  r.finalExam = clip100(r.finalExam);
  r.etcScore = clip100(r.etcScore);
  r.attendanceEval = clip100(r.attendanceEval);

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

onMounted(async () => {
  try {
    state.loading = true;

    let courseId = route.query.id;
    if (typeof courseId === "string" && courseId.startsWith("temp-")) {
      courseId = courseId.split("-")[1];
    }
    state.courseId = Number(courseId);

    const res = await courseStudentList(state.courseId);
    if (Array.isArray(res.data)) {
      state.rows = res.data.map((s) => {
        const r = {
          ...s,
          deptName: s.departmentName ?? "",
          gradeYear: s.gradeYear ?? "",

          attendanceDays: s.attended ?? 50,
          absentDays: s.absent ?? 0,
          attendanceEval: s.attendanceScore ?? 0,

          midterm: s.midterm ?? s.midScore ?? 0,
          finalExam: s.finalExam ?? s.finScore ?? 0,
          etcScore: s.etcScore ?? s.otherScore ?? 0,
          total: s.total ?? 0,
          grade: s.grade ?? "F",
          gpa: s.gpa ?? 0,
          checked: false,
          scoreId: s.scoreId ?? null,
          isEditing: false,
        };
        updateAttendanceEval(r);
        return r;
      });
    }
  } catch (e) {
    state.error = "학생 목록을 불러오지 못했습니다.";
    console.error("❌ 목록 오류:", e);
  } finally {
    state.loading = false;
  }
});

const saveGrades = async () => {
  await saveSelected(true);
};

const updateGrade = async (row) => {
  const payload = {
    enrollmentId: row.enrollmentId,
    midScore: row.midterm,
    finScore: row.finalExam,
    attendanceScore: row.attendanceDays,
    otherScore: row.etcScore,
    grade: row.gradeYear ?? 0,
  };

  try {
    await axios.put("/professor/course/grade", payload);
    showModal("성적이 저장되었습니다.", "success");
    row.isEditing = false;
  } catch (e) {
    console.error("❌ 성적 저장 오류:", e);
    showModal("성적 저장 실패", "error");
  }
};

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const filtered = computed(() => {
  const kw = search.value.trim();
  if (!kw) return state.rows;
  return state.rows.filter(
    (r) =>
      String(r.loginId ?? "").includes(kw) ||
      String(r.userName ?? "").includes(kw)
  );
});

const toggleAll = () => {
  state.allChecked = !state.allChecked;
  filtered.value.forEach((s) => {
    s.checked = state.allChecked;
  });
};

async function saveSelected(isSaveAll = false) {
  const studentsToSave = isSaveAll
    ? state.rows
    : state.rows.filter((r) => r.checked);

  if (studentsToSave.length === 0) {
    showModal("저장할 학생 데이터가 없습니다.", "warning");
    return;
  }

  try {
    for (const r of studentsToSave) {
      const midScore = Math.round(Number(r.midterm) ?? 0);
      const finScore = Math.round(Number(r.finalExam) ?? 0);
      const attendanceScore = Math.round(Number(r.attendanceEval) ?? 0);
      const otherScore = Math.round(Number(r.etcScore) ?? 0);

      const payload = {
        enrollmentId: r.enrollmentId,
        midScore,
        finScore,
        attendanceScore,
        otherScore,
      };

      if (r.scoreId) {
        await axios.put("/professor/course/grade", payload);
      } else {
        await axios.post("/professor/course/grade", payload);
      }
    }

    showModal(
      isSaveAll
        ? "모든 학생 성적이 저장되었습니다!"
        : "선택한 학생 성적이 저장되었습니다!",
      "success"
    );
  } catch (err) {
    console.error("❌ 성적 저장 오류:", err);
    showModal("성적 저장 실패", "error");
  }
}

const exportSelectedCsv = () => {
  const selectedStudents = state.rows.filter((r) => r.checked);

  if (selectedStudents.length === 0) {
    showModal("내보낼 학생을 선택해주세요.", "warning");
    return;
  }

  const header = [
    "학번",
    "이름",
    "학년",
    "학과",
    "출석일수(50)",
    "결석일수",
    "출결평가(100)",
    "중간평가(100)",
    "기말평가(100)",
    "기타평가(100)",
    "총점",
    "등급",
    "평점",
  ];

  const rows = selectedStudents.map((r) => [
    r.loginId ?? "",
    r.userName ?? "",
    r.gradeYear ?? "",
    r.deptName ?? "",
    r.attendanceDays ?? 0,
    r.absentDays ?? 0,
    r.attendanceEval ?? 0,
    r.midterm ?? 0,
    r.finalExam ?? 0,
    r.etcScore ?? 0,
    r.total ? r.total.toFixed(1) : 0,
    r.grade ?? "F",
    r.gpa ? r.gpa.toFixed(1) : 0,
  ]);

  const csvContent =
    "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.course?.title}_선택_성적부_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// 내보내기 
const exportAllCsv = () => {
  if (!state.rows.length) {
    showModal('내보낼 데이터가 없습니다.', 'error');
    return;
  }

  const header = [
    '학번',
    '이름',
    '학년',
    '학과',
    '출석일수',
    '결석일수',
    '출결평가',
    '중간',
    '기말',
    '기타',
    '총점',
    '등급',
    '평점',
  ];

  const rows = state.rows.map((r) => [
    r.loginId,
    r.userName,
    r.gradeYear,
    r.deptName,
    r.attendanceDays,
    r.absentDays,
    r.attendanceEval,
    r.midterm,
    r.finalExam,
    r.etcScore,
    r.total,
    r.grade,
    r.gpa,
  ]);

  const csvContent =
    '\uFEFF' + // ✅ BOM 추가 (UTF-8-BOM 인식용)
    [header, ...rows].map((e) => e.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = '성적입력_내보내기.csv';
  link.click();
};

const exportCsv = () => {
  const selected = state.rows.filter((r) => r.checked);

  if (selected.length > 0) {
    // 선택 내보내기
    exportSelectedCsv();
  } else {
    //  전체 내보내기
    exportAllCsv();
  }
};


</script>

<template>
  <div class="container">
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
    />
    <div class="header-card">
      <div class="course-header">
        <div class="icon-box">
          <i class="bi bi-book"></i>
        </div>
        <h1 class="page-title">{{ state.course?.title }}·성적입력 및 정정</h1>
        <div class="state error" v-if="state.error">{{ state.error }}</div>
      </div>

      <div class="att-wrap">
        <div class="toolbar">
          <div class="left">
            <button class="btn btn-secondary" @click="toggleAll">
              전체선택
            </button>
            <button class="btn btn-success" @click="exportCsv">
              <i class="bi bi-download me-2"></i>
              내보내기
            </button>
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
              @click="saveSelected(true)"
            >
              <i class="bi bi-folder me-2"></i>
              전체 저장
            </button>
          </div>
        </div>

        <div v-if="state.error" class="state error">{{ state.error }}</div>

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

                  <td>
                    <input
                      class="num"
                      type="number"
                      min="0"
                      max="50"
                      v-model.number="r.attendanceDays"
                      :readonly="!r.isEditing"
                      @input="updateAttendanceEval(r)"
                    />
                  </td>
                  <td>{{ r.absentDays }}</td>

                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.attendanceEval"
                      readonly
                    />
                  </td>

                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.midterm"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>

                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.finalExam"
                      :readonly="!r.isEditing"
                      @input="r.isEditing && calc(r)"
                    />
                  </td>

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
                    <div v-else class="button-group">
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

.btn-primary {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2a5c74;
}

.btn-light {
  background-color: #f8f9fa;
  color: #343a40;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #94a3b8;
}

.button-group {
  display: flex;
  gap: 8px;
  justify-content: center;
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
