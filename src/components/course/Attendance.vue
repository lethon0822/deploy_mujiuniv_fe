<!-- AttendanceView.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { courseStudentList } from "@/services/professorService";
import WhiteBox from "@/components/common/WhiteBox.vue";
import axios from "axios";

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
  data: [], //
  courseId: route.query.id,
});

/* 상태 옵션 - attendanceOptions로 이름 통일 */
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

/* 상태 → 배지 메타 */
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
  const res = await courseStudentList(state.courseId);
  console.log("알이에쓰:", res);

  state.data = res.data;

  // const passJson = history.state?.data;
  // const passid = history.state?.id;

  state.data = res.data.map((student) => ({
    ...student,
    checked: false, // 새 속성 추가
    status: student.status ?? "결석", // 필요하면 다른 기본값도 넣기
    note: student.note ?? "", // 필요하면 note 기본값
  }));
});

// 아래 필터 부분 오류 때문에 주석 처리 했습니다
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
const toggleAll = () =>
  filtered.value.forEach((s) => (s.checked = allChecked.value));

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
  const rows = state.data.map((s) => [
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
</script>

<template>
  <WhiteBox title="출결 관리" class="full-width">
    <div class="att-wrap">
      <h3 class="page-subtitle">컴퓨터 과학개론 출석부</h3>

      <!-- 툴바 -->
      <div class="toolbar">
        <div class="left">
          <label class="chk-all">
            <input type="checkbox" v-model="allChecked" @change="toggleAll" />
            <span>전체선택</span>
          </label>
          <button class="btn btn-light" @click="exportCsv">내보내기</button>
          <div class="date">
            <input type="date" v-model="attendDate" />
          </div>
        </div>

        <div class="right">
          <input
            v-model="search"
            class="search"
            type="text"
            placeholder="이름 또는 학번 검색"
            aria-label="검색"
          />
          <select v-model="filter" class="filter">
            <option value="전체">상태/전체</option>
            <option value="출석">출석</option>
            <option value="결석">결석</option>
            <option value="지각">지각</option>
            <option value="병가">병가</option>
            <option value="경조사">경조사</option>
          </select>
          <button
            class="btn btn-primary"
            :disabled="isLoading"
            @click="saveAttendance"
          >
            {{ isLoading ? "저장 중..." : "저장" }}
          </button>
        </div>
      </div>

      <!-- 표 -->
      <div class="table-scroll">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 40px">
                <input
                  type="checkbox"
                  v-model="allChecked"
                  @change="toggleAll"
                />
              </th>
              <th style="width: 30px">학번</th>
              <th style="width: 30px">이름</th>
              <th style="width: 30px">학년</th>
              <th style="width: 50px">학과</th>
              <th style="width: 50px">출결상태</th>
              <th style="width: 90px">상태 변경</th>
              <th style="width: 100px">비고</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="s in state.data" :key="s.enrollmentId">
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
  </WhiteBox>
</template>

<style scoped lang="scss">
.full-width {
  width: 100%;
  max-width: none;
}

.att-wrap {
  padding-top: 6px;
}
.page-subtitle {
  color: #0d5c3e;
  font-weight: 800;
  margin-bottom: 12px;
}

/* 툴바 */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
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
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.search {
  width: 240px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.filter {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.btn {
  height: 34px;
  padding: 0 12px;
  border-radius: 6px;
  border: 0;
  cursor: pointer;
  font-weight: 600;
}
.btn-light {
  background: #eaf2ee;
  color: #0d5c3e;
}
.btn-primary {
  background: #1e90ff;
  color: #fff;
}

/* 표 */
.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tbl {
  min-width: 1200px;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.tbl thead th {
  background: #0d5c3e;
  color: #fff;
  font-weight: 700;
  height: 40px;
  padding: 0 8px;
  text-align: center;
  box-shadow: inset 0 -1px #0b4b32, inset -1px 0 #0b4b32;
}
.tbl thead th:last-child {
  box-shadow: inset 0 -1px #0b4b32;
}
.tbl tbody td {
  background: #fff;
  padding: 6px 8px;
  text-align: center;
  color: #111827;
  box-shadow: inset 0 1px #e5e7eb, inset -1px 0 #e5e7eb;
  vertical-align: middle;
}
.tbl tbody td.left-cell {
  text-align: left;
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
</style>
