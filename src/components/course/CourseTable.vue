<script setup>
import { useRouter } from "vue-router";
import { inject, reactive, computed } from "vue";
import YnModal from "@/components/common/YnModal.vue";
import noDataImg from "@/assets/find.png";
import { updateCourseStatus } from "@/services/ApprovalService";
import { changeCodeToTime } from "@/services/CommonMethod";

const props = defineProps({
  courseList: Array,
  maxHeight: {
    type: String,
    default: "700px",
  },
  show: {
    type: Object,
    default: () => ({
      professorName: false,
      remStd: false,
      enroll: false,
      cancel: false,
      deptName: true,
      setting: false,
      modify: false,
      approve: false,
      check: false,
    }),
  },
  showModal: {
    type: Function,
    default: null,
  },
});
defineEmits(["enroll", "cancel", "check"]);

const state = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const change = (status) => {
  if (status === "반려") return "gray";
  if (status === "승인") return "blue";
  return "red";
};

const openModal = inject("openModal", () => {});
const openLink = (id) => {
  if (id && openModal) {
    openModal(id);
  }
};

const router = useRouter();
const send = (id, json) => {
  if (!id) return;
  const jsonBody = JSON.stringify(json);
  router.push({
    path: `/professor/course/${id}/students`,
    state: { data: jsonBody },
  });
};

const navigateToModify = (courseId) => {
  if (!courseId) {
    console.error("courseId가 없습니다.");
    return;
  }
  try {
    router.push({
      name: "ModifyCourse",
      params: { id: courseId },
    });
  } catch (error) {
    console.error("라우터 네비게이션 에러:", error);
  }
};

const patchCourseStatus = async (courseId, status) => {
  const form = {
    courseId: courseId,
    status: status,
  };
  // try {
  const res = await updateCourseStatus(form);
  showModal(`강의가 ${status} 처리되었습니다.`, "success");

  // 배열에서
  const index = props.courseList.findIndex((c) => c.courseId === courseId);
  if (index > -1) {
    props.courseList.splice(index, 1);
  }
};

const columnMeta = [
  { key: "code", defaultWidth: 6, show: "always" },
  { key: "emptySpace", defaultWidth: 1, show: "always" },
  { key: "deptName", defaultWidth: 8, show: "deptName" },
  { key: "title", defaultWidth: 10, show: "always" },
  { key: "classroom", defaultWidth: 8, show: "always" },
  { key: "type", defaultWidth: 5, show: "always" },
  { key: "professor", defaultWidth: 7, show: "professorName" },
  { key: "grade", defaultWidth: 10, show: "always" },
  { key: "time", defaultWidth: 7, show: "always" },
  { key: "credit", defaultWidth: 3, show: "always" },
  { key: "maxStd", defaultWidth: 4, show: "always" },
  { key: "remStd", defaultWidth: 4, show: "remStd" },
  { key: "status", defaultWidth: 6, show: "modify" },
  { key: "enrollAction", defaultWidth: 10, show: "enrollOrCancel" },
  { key: "button", defaultWidth: 10, show: "actionButton" },
];

const computedColumnWidths = computed(() => {
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;

  let currentMeta = columnMeta;
  if (isTablet) {
    currentMeta = columnMeta.filter(
      (col) =>
        col.key !== "code" &&
        col.key !== "grade" &&
        col.key !== "classroom" &&
        col.key !== "emptySpace"
    );
  }

  const visibleColumns = currentMeta.filter((col) => {
    if (col.key === "emptySpace") return true;
    if (col.show === "always") return true;
    if (col.show === "enrollOrCancel")
      return props.show.enroll || props.show.cancel;
    if (col.show === "actionButton")
      return (
        props.show.setting ||
        props.show.modify ||
        props.show.check ||
        props.show.approve
      );
    if (col.key === "status") return props.show.modify;
    return props.show[col.show];
  });

  const totalDefaultWidth = visibleColumns.reduce(
    (sum, col) => sum + col.defaultWidth,
    0
  );
  const widths = {};
  if (totalDefaultWidth > 0) {
    visibleColumns.forEach((col) => {
      widths[col.key] = `${(col.defaultWidth / totalDefaultWidth) * 100}%`;
    });
  }
  return widths;
});
</script>

<template>
  <div class="table-container">
    <div class="table-wrapper desktop-view" v-if="props.courseList.length > 0">
      <table>
        <thead>
          <tr>
            <th :style="{ width: computedColumnWidths.code }" class="code">
              과목코드
            </th>
            <th :style="{ width: computedColumnWidths.emptySpace }"></th>
            <th
              v-show="props.show.deptName"
              :style="{ width: computedColumnWidths.deptName }"
              class="deptName"
            >
              학과
            </th>
            <th :style="{ width: computedColumnWidths.title }" class="title">
              교과목명
            </th>
            <th
              :style="{ width: computedColumnWidths.classroom }"
              class="classroom"
            >
              강의실
            </th>
            <th :style="{ width: computedColumnWidths.type }" class="type">
              이수구분
            </th>
            <th
              v-show="props.show.professorName"
              :style="{ width: computedColumnWidths.professor }"
              class="professor"
            >
              담당교수
            </th>
            <th :style="{ width: computedColumnWidths.grade }" class="grade">
              수강대상
            </th>
            <th :style="{ width: computedColumnWidths.time }" class="time">
              강의시간
            </th>
            <th :style="{ width: computedColumnWidths.credit }" class="credit">
              학점
            </th>
            <th :style="{ width: computedColumnWidths.maxStd }" class="maxStd">
              정원
            </th>
            <th
              v-show="props.show.remStd"
              :style="{ width: computedColumnWidths.remStd }"
              class="remStd"
            >
              잔여
            </th>
            <th
              v-show="props.show.enroll || props.show.cancel"
              :style="{ width: computedColumnWidths.enrollAction }"
              class="enroll-action"
            >
              수강
            </th>
            <th
              v-show="props.show.modify"
              :style="{ width: computedColumnWidths.status }"
              class="status"
            >
              승인여부
            </th>
            <th
              v-show="
                props.show.setting ||
                props.show.modify ||
                props.show.check ||
                props.show.approve
              "
              :style="{ width: computedColumnWidths.button }"
              class="button"
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="course in props.courseList"
            :key="course.courseId || course.id"
          >
            <td :style="{ width: computedColumnWidths.code }" class="code">
              {{ course.courseCode }}
            </td>
            <td :style="{ width: computedColumnWidths.emptySpace }"></td>
            <td
              v-show="props.show.deptName"
              :style="{ width: computedColumnWidths.deptName }"
              class="deptName"
            >
              <div v-if="course.type?.includes('교양')">교양학부</div>
              <div v-else>{{ course.deptName }}</div>
            </td>
            <td class="title" :style="{ width: computedColumnWidths.title }">
              <div @click="openLink(course.courseId)" class="link">
                {{ course.title || course.courseName }}
              </div>
            </td>
            <td
              :style="{ width: computedColumnWidths.classroom }"
              class="classroom"
            >
              {{ course.classroom }}
            </td>
            <td :style="{ width: computedColumnWidths.type }" class="type">
              {{ course.type }}
            </td>
            <td
              v-show="props.show.professorName"
              :style="{ width: computedColumnWidths.professor }"
              class="professor"
            >
              {{ course.professorName }}
            </td>
            <td :style="{ width: computedColumnWidths.grade }" class="grade">
              <template v-if="course.grade === 0 || course.type?.includes('교양')"> 수강희망자 </template>
              <template v-else>
                {{ course.deptName + " " + course.grade }}학년
              </template>
            </td>
            <td :style="{ width: computedColumnWidths.time }" class="time">
              {{ changeCodeToTime(course.time) }}
            </td>
            <td :style="{ width: computedColumnWidths.credit }" class="credit">
              {{ course.credit }}
            </td>
            <td :style="{ width: computedColumnWidths.maxStd }" class="maxStd">
              <span class="remaining-count">{{ course.maxStd }}</span>
            </td>
            <td
              class="remStd"
              v-show="props.show.remStd"
              :style="{ width: computedColumnWidths.remStd }"
            >
              <span class="remaining-count remaining-remStd">{{
                course.remStd
              }}</span>
            </td>
            <td
              v-show="props.show.enroll || props.show.cancel"
              :style="{ width: computedColumnWidths.enrollAction }"
              class="enroll-action"
            >
              <button
                v-show="props.show.enroll"
                class="btn btn-sm enroll-btn"
                :class="{ enrolled: course.enrolled }"
                :disabled="course.enrolled"
                @click="$emit('enroll', course)"
              >
                {{ course.enrolled ? "신청완료" : "수강신청" }}
              </button>
              <button
                v-show="props.show.cancel"
                class="btn btn-sm cancel-btn"
                @click="$emit('cancel', course.courseId)"
              >
                수강취소
              </button>
            </td>
            <td
              v-show="props.show.modify"
              :style="{ width: computedColumnWidths.status }"
              class="status"
              :class="change(course.status)"
            >
              {{ course.status }}
            </td>
            <td
              v-if="
                props.show.setting ||
                props.show.check ||
                props.show.modify ||
                props.show.approve
              "
              class="button"
              :style="{ width: computedColumnWidths.button }"
            >
              <button
                v-show="props.show.setting"
                class="btn btn-sm enroll-btn"
                @click="send(course.courseId, course)"
              >
                관리
              </button>

              <button
                v-show="props.show.check"
                class="btn btn-sm enroll-btn"
                @click="$emit('check', course.courseId, course.title)"
              >
                강의평 보기
              </button>

              <button
                v-show="props.show.modify && course.status === '처리중'"
                class="btn btn-sm btn-secondary"
                @click="navigateToModify(course.courseId)"
              >
                수정
              </button>

              <div v-show="props.show.approve" class="action-buttons-stack">
                <div class="approve-buttons">
                  <button
                    class="btn btn-sm enroll-btn"
                    @click="patchCourseStatus(course.courseId, '승인')"
                  >
                    승인
                  </button>

                  <button
                    class="btn btn-sm cancel-btn"
                    @click="patchCourseStatus(course.courseId, '반려')"
                  >
                    반려
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="desktop-view"
      style="
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <div class="empty-state">
        <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
        <p>검색 결과가 없습니다.</p>
      </div>
    </div>

    <div class="mobile-view">
      <template v-if="props.courseList.length === 0">
        <div class="empty-state"></div>
      </template>
      <template v-else>
        <div
          v-for="(course, index) in props.courseList"
          :key="course.courseId || course.id"
          class="mobile-card"
        >
          <div class="course-header">
            <div class="course-code">{{ course.courseCode }}</div>
            <div
              v-show="props.show.modify"
              class="course-status"
              :class="change(course.status)"
            >
              {{ course.status }}
            </div>
          </div>

          <div class="course-title">
            <div @click="openLink(course.courseId)" class="link">
              {{ course.title || course.courseName }}
            </div>
          </div>

          <div class="course-info">
            <div class="info-row" v-show="props.show.deptName">
              <div class="info-cell me-4">
                <span class="label">학과:</span>
                <span>{{
                  course.type === "교양" ? "교양학부" : course.deptName
                }}</span>
              </div>
              <div class="info-cell">
                <span class="label">강의실:</span>
                <span>{{ course.classroom }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell me-4">
                <span class="label">이수구분:</span>
                <span>{{ course.type }}</span>
              </div>
              <div class="info-cell" v-show="props.show.professorName">
                <span class="label">담당교수:</span>
                <span>{{ course.professorName }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell me-4">
                <span class="label">수강대상:</span>
                <span>
                  {{
                    course.grade === 0 || (course.type?.includes("교양"))
                      ? "수강희망자"
                      : course.deptName + " " + course.grade + "학년"
                  }}
                </span>
              </div>
              <div class="info-cell">
                <span class="label">시간:</span>
                <span>{{ course.time }}</span>
              </div>
            </div>

            <div class="info-row">
              <div class="info-cell">
                <span class="label">학점:</span>
                <span>{{ course.credit }}</span>
              </div>
            </div>

            <div class="info-row" v-show="props.show.remStd">
              <div class="info-cell me-4">
                <span class="label">정원:</span>
                <span class="remaining-count">{{ course.maxStd }}</span>
              </div>
              <div class="info-cell">
                <span class="label">잔여:</span>
                <span class="remaining-count remaining-remStd">{{
                  course.remStd
                }}</span>
              </div>
            </div>
          </div>

          <div class="course-actions">
            <button
              v-show="props.show.enroll"
              class="btn btn-md enroll-btn"
              :class="{ enrolled: course.enrolled }"
              :disabled="course.enrolled"
              @click="$emit('enroll', course)"
            >
              {{ course.enrolled ? "신청완료" : "수강신청" }}
            </button>
            <button
              v-show="props.show.cancel"
              class="btn btn-md cancel-btn"
              @click="$emit('cancel', course.courseId)"
            >
              수강취소
            </button>
            <button
              v-show="props.show.setting"
              class="btn btn-md enroll-btn"
              @click="send(course.courseId, course)"
            >
              관리
            </button>
            <button
              v-show="props.show.check"
              class="btn btn-md enroll-btn"
              @click="$emit('check', course.courseId, course.title)"
            >
              강의평 보기
            </button>
            <div v-show="props.show.approve" class="approve-buttons">
              <button
                class="btn btn-md enroll-btn"
                @click="patchCourseStatus(course.courseId, '승인')"
              >
                승인
              </button>
              <button
                class="btn btn-md cancel-btn"
                @click="patchCourseStatus(course.courseId, '반려')"
              >
                반려
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
      @confirm="state.showYnModal = false"
    />
  </div>
</template>

<style scoped lang="scss">
.table-container {
  margin: auto auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1500px;
  border: 0.2px solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
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
  height: 48px;
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

.link {
  color: #2460ce;
  cursor: pointer;
  text-decoration: underline;
  display: inline-block;
  width: 100%;
}

.link:hover {
  color: #1f53b5;
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

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px;
}

/* 작음 */
.btn-sm {
  height: 32px;
  min-width: 70px;
  font-size: 12px;
}

/* 기본 */
.btn-md {
  height: 36px;
  min-width: 100px;
  font-size: 13px;
}

/* 큼 */
.btn-lg {
  height: 44px;
  min-width: 120px;
  font-size: 14px;
}

button.enroll-btn {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  transition: background-color 0.2s ease;
}

button.enroll-btn:hover {
  background-color: #2a5c74;
}

button.enroll-btn:active {
  background-color: #204658;
}

button.cancel-btn {
  background-color: #ff3b30;
  color: #fff;
  border: none;
  transition: background-color 0.2s ease;
}

button.cancel-btn:hover {
  background-color: #e03128;
}

button.cancel-btn:active {
  background-color: #b3271f;
}

button:disabled,
.btn:disabled {
  background-color: #999;
  color: white;
  cursor: not-allowed;
  pointer-events: none;
  opacity: 1;
}

.setting {
  padding-top: 2px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #fff;
  justify-content: center;
}

.red {
  color: #d61421;
  font-weight: 600;
}

.gray {
  color: #666;
  font-weight: 600;
}

.blue {
  color: #2460ce;
  font-weight: 700;
}

.remaining-count {
  color: #28a745;
  font-weight: 600;
}

/* 단계적 버튼 배치 */
.action-buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.button-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 4px 0;
  width: 100%;
}

.approve-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.approve-buttons button {
  flex-shrink: 0;
}

/* 모바일 카드 */
.mobile-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 20px;
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
}

.mobile-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-code {
  font-size: 12px;
  color: #343a40;
  font-weight: 500;
}

.course-status {
  font-size: 12px;
  font-weight: 600;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.course-info {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-cell {
  flex: 1 1 45%;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 12px;
  color: #343a40;
  font-weight: 500;
  width: 70px;
  flex-shrink: 0;
}

.course-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 모바일 */
@media (max-width: 767px) {
  .table-container {
    width: 100%;
    position: static;
    transform: none;
    padding: 15px;
    background-color: #f0f4f8;
    border: none;
    box-shadow: none;
  }

  .mobile-view {
    display: block;
  }

  .desktop-view {
    display: none;
  }

  /* 모바일 카드 스타일 */
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .empty-state {
    padding: 0;
  }

  .course-code {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .course-status {
    font-size: 14px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 5px;
  }

  .course-status.red {
    background-color: #fee2e2;
    color: #dc2626;
  }

  .course-status.gray {
    background-color: #e2e8f0;
    color: #64748b;
  }

  .course-status.blue {
    background-color: #e0f2fe;
    color: #0284c7;
  }

  .course-title {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1a202c;
  }

  .course-title .link {
    text-decoration: none;
    color: inherit;
  }

  .course-title .link:hover {
    color: #2460ce;
    text-decoration: underline;
  }

  .course-info {
    margin-bottom: 20px;

    padding-top: 10px;
  }

  .info-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .label {
    font-size: 14px;
    color: #4a5568;
    font-weight: 600;

    margin-right: 8px;
  }

  .course-info span:not(.label) {
    font-size: 14px;
  }

  .remaining-remStd {
    color: #db3619;
    font-weight: 700;
  }

  .course-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding-top: 10px;
  }

  .course-actions button {
    flex: 1 1 auto;
    min-width: 120px;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 6px;
  }

  .approve-buttons {
    display: flex;
    gap: 10px;
    width: 100%;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 10px 0;
    max-width: none;
    margin: 0;
  }

  th.code,
  td.code {
    display: none;
  }

  th.grade,
  td.grade {
    display: none;
  }

  th.classroom,
  td.classroom {
    display: none;
  }

  thead th {
    font-size: 12px;
    padding: 10px 6px;
  }

  tbody td {
    font-size: 12px;
    padding: 6px 4px;
  }

  tbody td.title {
    font-size: 12px;
    padding: 6px 4px;
  }

  .action-buttons-stack {
    gap: 2px;
  }

  .button-divider {
    margin: 2px 0;
  }
}

/* PC */
@media all and (min-width: 1024px) and (max-width: 1231px) {
  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>