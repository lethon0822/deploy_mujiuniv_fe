<!-- AttendanceView.vue -->
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/account";
import { courseStudentList, findMyCourse } from "@/services/professorService";
import YnModal from "@/components/common/YnModal.vue";
import noDataImg from "@/assets/find.png";
import { watch } from "vue";
import axios from "axios";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

/* 상단 컨트롤 */
const attendDate = ref(new Date().toISOString().slice(0, 10));
const search = ref("");
const filter = ref("전체");
const allChecked = ref(false);
const isLoading = ref(false);

/* 모바일 모달 관련 */
const showMobileModal = ref(false);
const selectedStudent = ref(null);

const state = reactive({
  data: [],
  courseId: Number(route.query.id),
  sid: userStore.semesterId,
  courses: [],
  course: null,
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
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

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

/* 모바일 모달 관련 함수 */
const openMobileModal = (student) => {
  selectedStudent.value = { ...student };
  showMobileModal.value = true;
};

const closeMobileModal = () => {
  showMobileModal.value = false;
  selectedStudent.value = null;
};

const saveMobileAttendance = () => {
  const index = state.data.findIndex(
    (s) => s.enrollmentId === selectedStudent.value.enrollmentId
  );
  if (index !== -1) {
    state.data[index] = { ...selectedStudent.value };
  }
  closeMobileModal();
};

onMounted(async () => {
  isLoading.value = true;
  try {
    const courseIdFromQuery = Number(route.query.id);
    state.courseId = courseIdFromQuery;

    // query에서 제목 가져오기
    state.course = {
      title: route.query.title || "강의",
    };

    if (state.courseId) {
      const studentRes = await courseStudentList(state.courseId);
      state.data = studentRes.data.map((student) => ({
        ...student,
        checked: false,
        status: student.status ?? "출석",
        note: student.note ?? "",
      }));

      console.log("학생목록:", state.data);
    }
  } catch (error) {
    console.error("학생목록 로딩 오류:", error);
  } finally {
    isLoading.value = false;
  }
});

const selectedCourse = computed(() =>
  state.courses.find((c) => c.id === Number(state.courseId))
);

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
  allChecked.value = !allChecked.value;
  filtered.value.forEach((s) => {
    s.checked = allChecked.value;
  });
};

/* 저장 */
const saveAttendance = async () => {
  if (!attendDate.value) {
    showModal("출결일자를 선택해주세요.", "warning");
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

      // 존재 여부 확인 없이 바로 PUT 호출
      await axios.put("/professor/course/check", payload);
    }

    showModal("출결 저장 완료!", "success");
    await router.push("/pro/attendance"); // 라우트 prefix 확인해봐 ("/pro" 인지 "/professor" 인지!)
  } catch (e) {
    console.error("출결 저장 중 오류:", e);
    showModal("출결 저장 중 오류가 발생했습니다.", "error");
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
    "출결",
    "비고",
    "학기",
    "일자",
  ];

  // 체크된 학생만 필터링
  const selectedStudents = state.data.filter((s) => s.checked);

  if (selectedStudents.length === 0) {
    showModal("내보낼 학생을 선택해주세요.", "warning");
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
      <div class="course-header">
        <div class="icon-box">
          <i class="bi bi-book"></i>
        </div>
        <h1 class="page-title">{{ state.course?.title }}·출석부</h1>
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

        <!-- 데스크톱/태블릿 표 -->
        <div class="table-container desktop-view">
          <div class="table-wrapper" v-if="filtered.length > 0">
            <table>
              <thead>
                <tr>
                  <th style="width: 25px"></th>

                  <th style="width: 30px">학번</th>
                  <th style="width: 30px">이름</th>
                  <th style="width: 30px">학년</th>
                  <th style="width: 30px">학과</th>
                  <th style="width: 40px">출결</th>
                  <th style="width: 90px">상태 변경</th>

                  <th style="width: 150px">비고</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="s in filtered" :key="s.enrollmentId">
                  <td><input type="checkbox" v-model="s.checked" /></td>
                  <td>{{ s.loginId }}</td>
                  <td>{{ s.userName }}</td>
                  <td>{{ s.gradeYear }}</td>
                  <td class="left-cell">{{ s.departmentName }}</td>

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
          <div class="empty-state" v-else>
            <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
            <p>검색 결과가 없습니다.</p>
          </div>
        </div>

        <!-- 모바일 카드 리스트 -->
        <div class="mobile-view">
          <div class="student-cards" v-if="filtered.length > 0">
            <div
              v-for="s in filtered"
              :key="s.enrollmentId"
              class="student-card"
              @click="openMobileModal(s)"
            >
              <div class="card-header">
                <div class="student-info">
                  <div class="student-name">{{ s.userName }}</div>
                  <div class="student-id">{{ s.loginId }}</div>
                </div>
                <div class="checkbox-wrapper">
                  <input type="checkbox" v-model="s.checked" @click.stop />
                </div>
              </div>
              <div class="card-body">
                <div class="info-row">
                  <span class="label">학년:</span>
                  <span class="value">{{ s.grade }}</span>
                </div>
                <div class="info-row">
                  <span class="label">학과:</span>
                  <span class="value">{{ s.deptName }}</span>
                </div>
                <div class="info-row">
                  <span class="label">출결:</span>
                  <span :class="['att-badge', statusMeta(s.status).cls]">
                    <i :class="statusMeta(s.status).icon"></i>
                    {{ statusMeta(s.status).label }}
                  </span>
                </div>
                <div class="info-row" v-if="s.note">
                  <span class="label">비고:</span>
                  <span class="value">{{ s.note }}</span>
                </div>
              </div>
              <div class="card-footer">
                <i class="bi bi-pencil-square"></i>
                <span>탭하여 수정</span>
              </div>
            </div>
          </div>
          <div class="empty-state" v-else>
            <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
            <p>검색 결과가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 모바일 모달 -->
    <div v-if="showMobileModal" class="modal-overlay" @click="closeMobileModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>출결 수정</h3>
          <button class="close-btn" @click="closeMobileModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedStudent">
          <div class="student-info-modal">
            <div class="info-item">
              <label>학번:</label>
              <span>{{ selectedStudent.loginId }}</span>
            </div>
            <div class="info-item">
              <label>이름:</label>
              <span>{{ selectedStudent.userName }}</span>
            </div>
            <div class="info-item">
              <label>학년:</label>
              <span>{{ selectedStudent.grade }}</span>
            </div>
            <div class="info-item">
              <label>학과:</label>
              <span>{{ selectedStudent.deptName }}</span>
            </div>
          </div>

          <div class="attendance-selector-modal">
            <label class="section-label">출결 상태</label>
            <div class="status-options">
              <label
                v-for="opt in attendanceOptions"
                :key="opt.value"
                class="status-option"
                :class="{ selected: selectedStudent.status === opt.value }"
              >
                <input
                  type="radio"
                  :value="opt.value"
                  v-model="selectedStudent.status"
                />
                <div class="option-content">
                  <i :class="opt.icon"></i>
                  <span>{{ opt.label }}</span>
                </div>
              </label>
            </div>
          </div>

          <div class="note-section">
            <label class="section-label">비고</label>
            <textarea
              v-model="selectedStudent.note"
              class="note-input"
              placeholder="비고를 입력하세요"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeMobileModal">
            취소
          </button>
          <button class="btn btn-primary" @click="saveMobileAttendance">
            저장
          </button>
        </div>
      </div>
    </div>

    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
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

/* 표 - 데스크톱/태블릿 */
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

.student-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 15px;
}

.student-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.student-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.student-id {
  font-size: 14px;
  color: #6b7280;
}

.checkbox-wrapper {
  margin-left: 12px;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.card-body {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.info-row .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  color: #6b7280;
  font-size: 14px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.modal-body {
  padding: 0 20px 20px 20px;
}

.student-info-modal {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.info-item span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.section-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.attendance-selector-modal {
  margin-bottom: 24px;
}

.status-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.status-option {
  cursor: pointer;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s ease;
  background: white;
}

.status-option:hover {
  border-color: #3b82f6;
  background-color: #f8faff;
}

.status-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.status-option input[type="radio"] {
  display: none;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.option-content i {
  font-size: 20px;
}

.option-content span {
  font-size: 12px;
  font-weight: 500;
}

.note-section {
  margin-bottom: 20px;
}

.note-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.note-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.modal-footer .btn {
  min-width: 80px;
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
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

/* 라디오 */
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

  /* 툴바 (Toolbar) */
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

  .select-wrapper {
    order: 2;
    flex-grow: 1;
    min-width: 100px;
  }

  .search-wrapper .search-input,
  .date input,
  .select-wrapper select {
    width: 100%;
    height: 40px;
    box-sizing: border-box;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .student-name {
    font-size: 16px;
  }

  .student-id {
    font-size: 13px;
  }

  .info-row .label,
  .info-row .value {
    font-size: 13px;
  }

  .student-name,
  .student-id,
  .info-row .value {
    overflow-wrap: break-word;
    word-break: break-word;
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

  .content-section {
    gap: 20px;
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

  .select-wrapper {
    flex-grow: 0;
  }

  .date input {
    height: 37px;
  }

  .filter {
    height: 39px;
    font-size: 14px;
  }

  .table-wrapper {
    overflow-x: auto;
  }

  td,
  th {
    padding: 8px;
    font-size: 13px;
  }

  .att-selector {
    gap: 4px;
  }

  .att-option {
    min-width: 45px;
    padding: 4px 6px;
    font-size: 11px;
  }

  .att-option i {
    font-size: 14px;
  }

  .att-option .label {
    font-size: 10px;
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

  /* 추가 */
  .toolbar {
    flex-wrap: wrap;
  }

  .search-wrapper .search-input {
    width: 250px;
  }

  .desktop-view {
    display: block;
  }

  .mobile-view {
    display: none;
  }
}
</style>
