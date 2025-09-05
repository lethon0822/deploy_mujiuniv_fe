<script setup>
import { reactive, computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { courseStudentList } from "@/services/professorService";
import axios from "axios";

const route = useRoute();

/** 가중치 (출석/중간/기말/기타) */
const W = { att: 0.10, mid: 0.30, fin: 0.40, etc: 0.20 };

const st = reactive({
  q: "",
  allChecked: false,
  courseId: route.query.id,
  rows: [],
  loading: true,
  error: ""
});

const isSaving = ref(false);

/** 숫자 보정 */
const toNum = (v) => Number.isFinite(+v) ? +v : 0;
const clip100 = (v) => Math.min(100, Math.max(0, toNum(v)));

/** 자동계산 */
const calc = (r) => {
  r.attendanceEval = clip100(r.attendanceEval);
  r.midterm        = clip100(r.midterm);
  r.finalExam      = clip100(r.finalExam);
  r.etcScore       = clip100(r.etcScore);

  const total =
    r.attendanceEval * W.att +
    r.midterm        * W.mid +
    r.finalExam      * W.fin +
    r.etcScore       * W.etc;

  r.total = total;
  r.grade = total >= 95 ? "A+" :
            total >= 90 ? "A"  :
            total >= 85 ? "B+" :
            total >= 80 ? "B"  :
            total >= 75 ? "C+" :
            total >= 70 ? "C"  :
            total >= 60 ? "D"  : "F";
  r.gpa   = { "A+":4.5, A:4.0, "B+":3.5, B:3.0, "C+":2.5, C:2.0, D:1.0, F:0 }[r.grade];
};

/** 학생 목록 불러오기 */
onMounted(async () => {
  try {
    const res = await courseStudentList(st.courseId);
    console.log("학생 리스트 res: ",res.data);
    st.rows = res.data.map(s => ({
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

    st.rows.forEach(calc);
  } catch (e) {
    st.error = "학생 목록을 불러오지 못했습니다.";
    console.error(e);
  } finally {
    st.loading = false;
  }
});

/** 검색 */
const filtered = computed(() => {
  const kw = st.q.trim();
  if (!kw) return st.rows;
  return st.rows.filter(r =>
    String(r.loginId ?? "").includes(kw) ||
    String(r.userName ?? "").includes(kw)
  );
});

/** 전체선택 */
const toggleAll = () =>
  filtered.value.forEach(r => (r.checked = st.allChecked));

/** ✅ 선택 저장 */
async function saveSelected() {
  const selected = st.rows.filter(r => r.checked);
  if (selected.length === 0) {
    alert("수정할 학생을 선택하세요.");
    return;
  }

  isSaving.value = true;

  try {
    const toPost = [];
    const toPut = [];

    for (const r of selected) {
      const midScore        = Math.round(Number(r.midterm) ?? 0);
      const finScore        = Math.round(Number(r.finalExam) ?? 0);
      const attendanceScore = Math.round(Number(r.attendanceEval) ?? 0); // 출결 점수
      const otherScore      = Math.round(Number(r.etcScore) ?? 0);       // 기타 점수
      const rank            = r.grade ?? "F";

      if (r.scoreId) {
        // 수정 (PUT)
        toPut.push({
          scoreId: r.scoreId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
          rank,
          grade: Number(r.grade ?? 0)
        });
      } else {
        // 신규 등록 (POST)
        toPost.push({
          enrollmentId: r.enrollmentId,
          midScore,
          finScore,
          attendanceScore,
          otherScore,
          rank,
          grade: Number(r.grade ?? 0)
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

    alert("선택한 학생 성적이 저장되었습니다!");
  } catch (err) {
    console.error("성적 저장 오류:", err);
    alert("성적 저장 실패");
  } finally {
    isSaving.value = false;
  }
}

/** 행 초기화 */
function resetRow(r) {
  if (confirm(`${r.userName} 학생의 성적을 초기화하시겠습니까?`)) {
    r.attendanceDays = 0;
    r.absence        = 0;
    r.attendanceEval = 0;
    r.midterm        = 0;
    r.finalExam      = 0;
    r.etcScore       = 0;
    r.total          = 0;
    r.grade          = "F";
    r.gpa            = 0;
    r.checked        = false;
  }
}

/** CSV 내보내기 */
function exportCsv() {
  const header = [
    "학번","이름","학년","학과",
    "출석일수","결석일수","출결평가",
    "중간평가","기말평가","기타평가",
    "총점","등급","평점"
  ];

  const rows = st.rows.map(r => [
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
    r.gpa ?? 0
  ]);

  const csvContent =
    "\uFEFF" + [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `grades_${st.courseId}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="wrap">
    <div class="box">
      <h1 class="page-title">성적 관리</h1>
      <h3 class="subtitle">강의별 성적 입력 및 정정</h3>

      <!-- 툴바 -->
      <div class="toolbar">
        <div class="left">
          <button class="btn btn-light"
                  @click="st.allChecked=!st.allChecked; toggleAll()">
            전체선택
          </button>
          <button class="btn btn-light" @click="exportCsv">내보내기</button>
        </div>
        <div class="right">
          <div class="search">
            <span class="icon">🔍</span>
            <input v-model="st.q" placeholder="이름 또는 학번 검색" />
          </div>
          <button class="btn btn-primary" :disabled="isSaving" @click="saveSelected">
            {{ isSaving ? "저장 중..." : "선택 저장" }}
          </button>
        </div>
      </div>

      <!-- 상태 -->
      <div v-if="st.loading" class="state">불러오는 중…</div>
      <div v-else-if="st.error" class="state error">{{ st.error }}</div>

      <!-- 테이블 -->
      <div v-else class="table-scroll">
        <table class="tbl" v-if="filtered.length">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="st.allChecked" @change="toggleAll" /></th>
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
              <td><input class="num" type="number" v-model.number="r.attendanceDays" /></td>
              <td><input class="num" type="number" v-model.number="r.absence" /></td>
              <td><input class="num" type="number" v-model.number="r.attendanceEval" @input="calc(r)" /></td>
              <td><input class="num" type="number" v-model.number="r.midterm" @input="calc(r)" /></td>
              <td><input class="num" type="number" v-model.number="r.finalExam" @input="calc(r)" /></td>
              <td><input class="num" type="number" v-model.number="r.etcScore" @input="calc(r)" /></td>
              <td>{{ r.total.toFixed(1) }}</td>
              <td>{{ r.grade }}</td>
              <td>{{ r.gpa.toFixed(1) }}</td>
              <td><button class="btn btn-gray w-full" @click="resetRow(r)">수정</button></td>
            </tr>
          </tbody>
        </table>
        <div v-else class="state">표시할 학생이 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 레이아웃 */
.wrap { background:#f6f7f8; min-height:100vh; padding:20px; }
.box  { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:24px; }
.page-title { font-size:28px; font-weight:800; margin-bottom:20px; }
.subtitle   { color:#0d5c3e; font-weight:800; margin-bottom:12px; }

/* 툴바 */
.toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.left, .right { display:flex; align-items:center; gap:8px; }
.search { position:relative; }
.search .icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px; opacity:.6; }
.search input { width:200px; padding:4px 8px 4px 28px; border:1px solid #cbd5e1; border-radius:6px; }

/* 버튼 */
.btn { height:34px; padding:0 12px; border-radius:6px; cursor:pointer; font-weight:600; }
.btn-light { background:#eaf2ee; color:#0d5c3e; }
.btn-primary { background:#1e90ff; color:#fff; }
.btn-gray { background:#e5e7eb; }
.w-full { width:100%; }

/* 테이블 */
.table-scroll { overflow-x:auto; }
.tbl { min-width:1200px; width:100%; border:1px solid #e5e7eb; border-radius:8px; border-collapse:collapse; }
.tbl thead th { background:#0d5c3e; color:#fff; padding:8px; }
.tbl td { border-top:1px solid #e5e7eb; padding:6px; text-align:center; }
.tbl .left-cell { text-align:left; }

/* 입력 */
.num { width:72px; height:30px; text-align:center; border:1px solid #cbd5e1; border-radius:6px; }

/* 상태 */
.state { padding:18px; color:#475569; }
.state.error { color:#b91c1c; }

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
  box-shadow: 0 0 0 3px rgba(30, 144, 255, .12);
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
.tbl tbody td:nth-child(1) { width: 44px; }   /* 체크박스 */
.tbl thead th:nth-child(2),
.tbl tbody td:nth-child(2) { width: 100px; }  /* 학번 */
.tbl thead th:nth-child(3),
.tbl tbody td:nth-child(3) { width: 90px; }   /* 이름 */
.tbl thead th:nth-child(4),
.tbl tbody td:nth-child(4) { width: 80px; }   /* 학년 */
.tbl thead th:nth-child(5),
.tbl tbody td:nth-child(5) { width: 160px; }  /* 학과 */
.tbl thead th:nth-child(6),
.tbl tbody td:nth-child(6) { width: 92px; }   /* 출석일수 */
.tbl thead th:nth-child(7),
.tbl tbody td:nth-child(7) { width: 92px; }   /* 결석일수 */
.tbl thead th:nth-child(8),
.tbl tbody td:nth-child(8) { width: 92px; }   /* 출결평가 */
.tbl thead th:nth-child(9),
.tbl tbody td:nth-child(9) { width: 92px; }   /* 중간평가 */
.tbl thead th:nth-child(10),
.tbl tbody td:nth-child(10) { width: 92px; }  /* 기말평가 */
.tbl thead th:nth-child(11),
.tbl tbody td:nth-child(11) { width: 92px; }  /* 기타평가 */
.tbl thead th:nth-child(12),
.tbl tbody td:nth-child(12) { width: 80px; }  /* 총점 */
.tbl thead th:nth-child(13),
.tbl tbody td:nth-child(13) { width: 70px; }  /* 등급 */
.tbl thead th:nth-child(14),
.tbl tbody td:nth-child(14) { width: 70px; }  /* 평점 */
.tbl thead th:nth-child(15),
.tbl tbody td:nth-child(15) { width: 76px; }  /* 수정 버튼 */
</style>
