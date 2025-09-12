<!-- AttendanceView.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";
import { courseStudentList, findMyCourse } from "@/services/professorService";
import { watch } from "vue";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

/* 상단 컨트롤 */
const attendDate = ref(new Date().toISOString().slice(0, 10));
const search = ref("");
const filter = ref("전체"); // 전체/출석/결석/지각/병가/경조사
const allChecked = ref(false);
const isLoading = ref(false);

/* 전달 데이터 */
const state = reactive({
  data: [],
  courseId: route.query.id,
  sid: userStore.semesterId,
});

const attendanceOptions = [
  {
    value: "출석",
    label: "출석",
    icon: "bi bi-check-circle-fill",
    cls: "success",
  },
  {
    value: "지각",
    label: "지각",
    icon: "bi bi bi-alarm-fill",
    cls: "warning",
  },
  { value: "결석", label: "결석", icon: "bi bi-x-circle-fill", cls: "danger" },
  { value: "병가", label: "병가", icon: "bi bi-emoji-dizzy-fill", cls: "info" },
  {
    value: "경조사",
    label: "경조사",
    icon: "bi bi-people-fill",
    cls: "neutral",
  },
];

const statusMeta = (st) => {
  switch (st) {
    case "출석":
      return { label: "출석", cls: "success", icon: "bi bi-check-circle-fill" };
    case "결석":
      return { label: "결석", cls: "danger", icon: "bi bi-x-circle-fill" };
    case "지각":
      return {
        label: "지각",
        cls: "warning",
        icon: "bi bi-alarm-fill",
      };
    case "병가":
      return { label: "병가", cls: "info", icon: "bi bi-emoji-dizzy-fill" };
    case "경조사":
      return { label: "경조사", cls: "neutral", icon: "bi bi-people-fill" };
    default:
      return {
        label: st || "미지정",
        cls: "neutral",
        icon: "bi bi-question-circle",
      };
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    // 1. 내 강좌 조회
    const courseRes = await findMyCourse({ sid: state.sid });
    console.log("내 강좌 목록:", courseRes);

    // 승인된 강좌 목록
    state.courses = courseRes.data.filter((item) => item.status === "승인");

    // state.course에 첫 승인 강좌 할당 (없으면 undefined)
    state.course = state.courses.length > 0 ? state.courses[0] : null;

    // courseId가 없으면 첫 강좌 id로 세팅
    if (!state.courseId && state.course) {
      state.courseId = state.course.id;
    }

    // 2. 해당 강좌 학생 목록 조회
    if (state.courseId) {
      const studentRes = await courseStudentList(state.courseId);
      console.log("강좌 학생 목록:", studentRes);

      // 학생 데이터 가공
      state.data = studentRes.data.map((student) => ({
        ...student,
        checked: false,
        status: student.status ?? "결석",
        note: student.note ?? "",
      }));
      console.log(studentRes.data); // 학생 데이터 배열 전체
    }
  } catch (error) {
    console.error("데이터 로딩 중 오류:", error);
  } finally {
    isLoading.value = false;
  }
});

/* 필터/검색 */
const filtered = computed(() => {
  const kw = search.value.trim();
  return state.data.filter((s) => {
    const okSearch =
      !kw ||
      String(s.userName ?? "").includes(kw) ||
      String(s.loginId ?? "").includes(kw);
    const okFilter = filter.value === "전체" || s.status === filter.value;
    return okSearch && okFilter;
  });
});

/* 전체선택 토글 */
const toggleAll = () => {
  filtered.value.forEach((s) => {
    s.checked = allChecked.value;
  });
};

/* 저장 */
const saveAttendance = async () => {
  if (!attendDate.value) {
    alert("출결일자를 선택해주세요.");
    return;
  }
  isLoading.value = true;
  try {
    for (const s of state.data) {
      const payload = {
        attendDate: attendDate.value,
        enrollmentId: s.enrollmentId,
        status: s.status,
        note: s.note,
      };
      const { data: exists } = await axios.post(
        "/professor/course/check/exist",
        payload
      );
      if (exists === 0) await axios.post("/professor/course/check", payload);
      else await axios.put("/professor/course/check", payload);
    }
    alert("출결 저장 완료!");
    await router.push("/professor/attendance");
  } catch (e) {
    console.error("출결 저장 중 오류:", e);
    alert("출결 저장 중 오류가 발생했습니다.");
  } finally {
    isLoading.value = false;
  }
};

/* CSV 내보내기 (UTF-8 BOM) */
const exportCsv = () => {
  const header = [
    "학번",
    "이름",
    "학년",
    "학과",
    "출결상태",
    "비고",
    "학기",
    "일자",
  ];

  // 체크된 학생만 필터링
  const selectedStudents = state.data.filter((s) => s.checked);

  if (selectedStudents.length === 0) {
    alert("내보낼 학생을 선택해주세요.");
    return;
  }

  const rows = selectedStudents.map((s) => [
    s.loginId ?? "",
    s.userName ?? "",
    s.gradeYear ?? s.grade ?? "",
    s.departmentName ?? "",
    s.status ?? "",
    s.note ?? "",
    s.semester ?? "",
    attendDate.value,
  ]);

  const csvContent =
    "\uFEFF" + [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${state.courseId}_${attendDate.value}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

watch(
  () => filtered.value.map((s) => s.checked),
  (newVals) => {
    allChecked.value = newVals.length > 0 && newVals.every(Boolean);
  },
  { deep: true }
);
</script>

<template>
  <div class="container">
    <div class="header-card">
      <div class="icon-box">
        <i class="bi bi-book"></i>
      </div>
      <h1 class="page-title">{{ state.course?.title }}</h1>
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
            <div class="select-wrapper">
              <i class="bi bi-funnel"></i>
              <select name="filter" class="filter" v-model="filter">
                <option value="전체">상태/전체</option>
                <option value="출석">출석</option>
                <option value="결석">결석</option>
                <option value="지각">지각</option>
                <option value="병가">병가</option>
                <option value="경조사">경조사</option>
              </select>
            </div>
            <button
              class="btn btn-primary"
              :disabled="isLoading"
              @click="saveAttendance"
            >
              <i class="bi bi-folder me-2"></i>
              {{ isLoading ? "저장 중..." : "저장" }}
            </button>
          </div>
        </div>

        <!-- 표 -->
        <div class="table-container">
          <div class="table-wrapper desktop-view">
            <table>
              <thead>
                <tr>
                  <th style="width: 20px"></th>
                  <th style="width: 30px">학번</th>
                  <th style="width: 30px">이름</th>
                  <th style="width: 30px">학년</th>
                  <th style="width: 30px">학과</th>
                  <th style="width: 30px">출결상태</th>
                  <th style="width: 100px">상태 변경</th>
                  <th style="width: 150px">비고</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="s in filtered" :key="s.enrollmentId">
                  <td><input type="checkbox" v-model="s.checked" /></td>
                  <td>{{ s.loginId }}</td>
                  <td>{{ s.userName }}</td>
                  <td>{{ s.grade }}</td>
                  <td class="left-cell">{{ s.deptName }}</td>

                  <!-- 현재 상태 배지 -->
                  <td>
                    <span :class="['att-badge', statusMeta(s.status).cls]">
                      <i :class="statusMeta(s.status).icon"></i>
                      {{ statusMeta(s.status).label }}
                    </span>
                  </td>

                  <!-- 상태 변경 라디오 버튼 -->
                  <td>
                    <div class="att-selector">
                      <label
                        v-for="opt in attendanceOptions"
                        :key="opt.value"
                        class="att-option"
                        :class="{ selected: s.status === opt.value }"
                      >
                        <input
                          type="radio"
                          :name="`status-${s.enrollmentId}`"
                          :value="opt.value"
                          v-model="s.status"
                        />
                        <i :class="opt.icon"></i>
                        <span class="label">{{ opt.label }}</span>
                      </label>
                    </div>
                  </td>

                  <!-- 비고 입력 -->
                  <td>
                    <input
                      type="text"
                      v-model="s.note"
                      class="note"
                      placeholder="비고 입력"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

.att-wrap {
  padding-top: 6px;
}

/* 툴바 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chk-all {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.date input {
  height: 37px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.filter {
  height: 39px;
  padding: 0 25px;
  color: #777;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.filter:hover,
.filter:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
  outline: none;
}

.btn {
  height: 35px;
  padding: 0 20px;
  border-radius: 6px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
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

.select-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.select-wrapper i {
  position: absolute;
  left: 12px;
  pointer-events: none;
  color: #6c757d;
  font-size: 16px;
  z-index: 1;
}

.select-wrapper select {
  padding-left: 40px;
  padding-right: 40px;
  height: 37px;
  color: #777;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus {
    border-color: #94a3b8;
    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
  }
}

/* 표 */
.table-container {
  margin: auto auto 50px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1500px;
  position: relative;
  overflow: hidden;
  padding: 25px 0 0 0;
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
.note {
  width: 100%;
  min-width: 80px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0 8px;
}
.note:disabled {
  background: #f8fafc;
  color: #94a3b8;
}
.search:focus,
.filter:focus,
.date input:focus,
.note:focus {
  outline: none;
  border-color: #1e90ff;
  box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.12);
}

/* 라디오 그룹 */
.att-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  align-items: center;
}

.att-option {
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  text-align: center;
  transition: all 0.2s ease;
  background: #fff;
  position: relative;
}

.att-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.att-option:hover {
  transform: scale(1.05);
  background-color: #f8f9fa;
}

.att-option i {
  font-size: 16px;
  line-height: 1.2;
}

.att-option .label {
  font-size: 10px;
  margin-top: 2px;
}

.att-option.selected {
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-width: 2px;
  background-color: #e3f2fd;
  border-color: #2196f3;
  color: #0d47a1;
}

/* 배지 */
.att-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 28px;
  border: 1px solid transparent;
  user-select: none;
}
.att-badge i {
  font-size: 14px;
  line-height: 1;
}

/* 상태별 색상 */
.att-badge.success {
  background: #f1fdf4;
  color: #2c803a;
  border-color: #2c803a;
}
.att-badge.danger {
  background: #fdf2f2;
  color: #b11815;
  border-color: #b11815ab;
}
.att-badge.warning {
  background: #fefce7;
  color: #9c6100;
  border-color: #ffe600;
}
.att-badge.info {
  background: #faf5ff;
  color: #7b24d1;
  border-color: #7b24d1;
}
.att-badge.neutral {
  background: #f0f6ff;
  color: #2d53e2;
  border-color: #2d53e2;
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
