<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";
import YnModal from "@/components/common/YnModal.vue";
import Confirm from "@/components/common/Confirm.vue";
import { courseStudentList, findMyCourse } from "@/services/professorService";
import axios from "axios";

const userStore = useUserStore();
const route = useRoute();

const attendDate = ref(new Date().toISOString().slice(0, 10));
const search = ref("");
const W = { att: 0.1, mid: 0.3, fin: 0.4, etc: 0.2 };

const state = reactive({
  allChecked: false,
  courseId: route.query.id,
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
    // 강좌 정보 가져오기 (첫 번째 코드와 동일하게)
    const courseRes = await findMyCourse({ sid: state.sid });
    const courses = Array.isArray(courseRes.data)
      ? courseRes.data
      : courseRes.data?.data ?? [];

    state.courses = courses.filter((item) => item.status === "승인");

    const courseIdFromQuery = Number(route.query.id);
    state.courseId = courseIdFromQuery;

    state.course = state.courses.find(
      (c) => Number(c.courseId) === Number(state.courseId)
    );

    // 학생 목록 가져오기
    const res = await courseStudentList(state.courseId);
    console.log("학생 리스트 res: ", res.data);
    state.rows = res.data.map((s) => ({
      ...s,
      deptName: s.deptName ?? "",
      gradeYear: s.grade ?? "",
      attendanceDays: s.attendanceDays ?? 0,
      absence: s.absence ?? 0,
      attendanceEval: s.attendanceEval ?? 0,
      midterm: s.midterm ?? 0,
      finalExam: s.finalExam ?? 0,
      etcScore: s.etcScore ?? 0,
      total: 0,
      grade: "F",
      gpa: 0,
      checked: false,
    }));

    state.rows.forEach(calc);

    // ✅ 하드코딩 지워줘요
    if (state.rows.length > 0) {
      state.confirmTarget = state.rows[0];
      state.showConfirmModal = true;
    }
    // ✅
  } catch (e) {
    state.error = "학생 목록을 불러오지 못했습니다.";
    console.error(e);
  } finally {
    state.loading = false;
  }
});

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
    showModal("수정할 학생을 선택하세요.", "warning");
    return;
  }

  isSaving.value = true;

  try {
    const toPost = [];
    const toPut = [];

    for (const r of selected) {
      const midScore = Math.round(Number(r.midterm) ?? 0);
      const finScore = Math.round(Number(r.finalExam) ?? 0);
      const attendanceScore = Math.round(Number(r.attendanceEval) ?? 0);
      const otherScore = Math.round(Number(r.etcScore) ?? 0);
      const rank = r.grade ?? "F";

      if (r.scoreId) {
        toPut.push({
          scoreId: r.scoreId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
          rank,
          grade: Number(r.grade ?? 0),
        });
      } else {
        toPost.push({
          enrollmentId: r.enrollmentId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
          rank,
          grade: Number(r.grade ?? 0),
        });
      }
    }

    console.log("toPost payload:", toPost);
    console.log("toPut payload:", toPut);

    if (toPost.length) {
      await axios.post("/professor/course/grade", toPost);
    }
    if (toPut.length) {
      await axios.put("/professor/course/grade", toPut);
    }
    showModal("선택한 학생 성적이 저장되었습니다!", "success");
  } catch (err) {
    console.error("성적 저장 오류:", err);

    showModal("성적 저장 실패", "warning");
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
        <h1 class="page-title">{{ state.course?.title }}·성적입력 및 정정</h1>
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
            <div class="date">
              <input type="date" v-model="attendDate" />
            </div>
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
        <div v-if="state.loading" class="state">불러오는 중…</div>
        <div v-else-if="state.error" class="state error">{{ state.error }}</div>

        <!-- 테이블 -->
        <div class="table-container">
          <div class="table-wrapper desktop-view">
            <table v-if="filtered.length">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      v-model="state.allChecked"
                      @change="toggleAll"
                      style="display: none"
                    />
                  </th>
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
                  <td class="left-cell">{{ r.deptName }}</td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.attendanceDays"
                    />
                  </td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.absence"
                    />
                  </td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.attendanceEval"
                      @input="calc(r)"
                    />
                  </td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.midterm"
                      @input="calc(r)"
                    />
                  </td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.finalExam"
                      @input="calc(r)"
                    />
                  </td>
                  <td>
                    <input
                      class="num"
                      type="number"
                      v-model.number="r.etcScore"
                      @input="calc(r)"
                    />
                  </td>
                  <td>{{ r.total.toFixed(1) }}</td>
                  <td>{{ r.grade }}</td>
                  <td>{{ r.gpa.toFixed(1) }}</td>
                  <td>
                    <button
                      type="button"
                      class="btn btn-secondary w-full"
                      @click="resetRow(r)"
                    >
                      수정
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="state">표시할 학생이 없습니다.</div>
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
      :type="'warning'"
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

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6c757d;
    font-size: 14px;
  }

  .search-input {
    width: 250px;
    padding: 6px 12px 8px 32px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
    appearance: none;

    &:hover {
      border-color: #cbd5e1;
    }

    &:focus {
      border-color: #94a3b8;
      box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
    }
  }
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
  table-layout: fixed;
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

/* 입력 */
.num {
  width: 72px;
  height: 30px;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

/* 상태 */
.state {
  padding: 18px;
  color: #475569;
}
.state.error {
  color: #b91c1c;
}

/* 숫자 입력칸 */
.num {
  width: 100%;
  height: 30px;
  text-align: left; /* <-- 왼쪽 정렬 */
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  box-sizing: border-box; /* <-- td 폭에 맞게 */
}

.num:focus {
  border-color: #1e90ff;
  box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.12);
}

/* 테이블 고정 레이아웃 */
.tbl {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 셀 크기 고정 */
}

/* 헤더와 셀 크기 일치시키기 */
.tbl thead th,
.tbl tbody td {
  text-align: center;
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  vertical-align: middle;
}

/* 각 컬럼별 고정 width */
.tbl thead th:nth-child(1),
.tbl tbody td:nth-child(1) {
  width: 44px;
} /* 체크박스 */
.tbl thead th:nth-child(2),
.tbl tbody td:nth-child(2) {
  width: 100px;
} /* 학번 */
.tbl thead th:nth-child(3),
.tbl tbody td:nth-child(3) {
  width: 90px;
} /* 이름 */
.tbl thead th:nth-child(4),
.tbl tbody td:nth-child(4) {
  width: 80px;
} /* 학년 */
.tbl thead th:nth-child(5),
.tbl tbody td:nth-child(5) {
  width: 160px;
} /* 학과 */
.tbl thead th:nth-child(6),
.tbl tbody td:nth-child(6) {
  width: 92px;
} /* 출석일수 */
.tbl thead th:nth-child(7),
.tbl tbody td:nth-child(7) {
  width: 92px;
} /* 결석일수 */
.tbl thead th:nth-child(8),
.tbl tbody td:nth-child(8) {
  width: 92px;
} /* 출결평가 */
.tbl thead th:nth-child(9),
.tbl tbody td:nth-child(9) {
  width: 92px;
} /* 중간평가 */
.tbl thead th:nth-child(10),
.tbl tbody td:nth-child(10) {
  width: 92px;
} /* 기말평가 */
.tbl thead th:nth-child(11),
.tbl tbody td:nth-child(11) {
  width: 92px;
} /* 기타평가 */
.tbl thead th:nth-child(12),
.tbl tbody td:nth-child(12) {
  width: 80px;
} /* 총점 */
.tbl thead th:nth-child(13),
.tbl tbody td:nth-child(13) {
  width: 70px;
} /* 등급 */
.tbl thead th:nth-child(14),
.tbl tbody td:nth-child(14) {
  width: 70px;
} /* 평점 */
.tbl thead th:nth-child(15),
.tbl tbody td:nth-child(15) {
  width: 76px;
} /* 수정 버튼 */

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
}
</style>
