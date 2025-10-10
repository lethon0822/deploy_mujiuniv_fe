<script setup>
import ProfessorCourseFilter from "@/components/common/ProfessorCourseFilter.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import YnModal from "@/components/common/YnModal.vue";
import { ref, onMounted, computed, reactive } from "vue";
import { useRouter } from "vue-router";
import { getPendingCourse } from "@/services/ApprovalService";
import { useUserStore } from "@/stores/account";

const allCourseList = ref([]);
const courseList = ref([]);
const router = useRouter();
const userStore = useUserStore();

const state = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

onMounted(async () => {
  const sid = userStore.state.signedUser.semesterId
  const res = await getPendingCourse({sid});
  console.log(res);
  courseList.value = res.data;
});

const myCourse = async (filters) => {
  console.log("myCourse 함수 호출됨:", filters);
  const res = await getPendingCourse(filters)
  console.log("siasia",res)

  // const keyword = filters.keyword ? filters.keyword.toLowerCase() : "";

  // if (allCourseList.value.length === 0) {
  //   console.log("데이터가 아직 로드되지 않아 필터링을 건너뜁니다.");
  //   return;
  // }

  // const newFilteredList = allCourseList.value.filter((course) => {
  //   const titleMatch = course.title?.toLowerCase().includes(keyword) || false;
  //   const classroomMatch =
  //     course.classroom?.toLowerCase().includes(keyword) || false;
  //   const professorMatch =
  //     course.professorName?.toLowerCase().includes(keyword) || false;
  //   const keywordMatch = titleMatch || classroomMatch || professorMatch;

  //   const semesterMatch =
  //     filters.semester && filters.semester !== ""
  //       ? String(course.semester) === String(filters.semester)
  //       : true;

  //   const approvalStatusMatch = filters.approvalStatus
  //     ? course.status === filters.approvalStatus
  //     : true;

  //   const normalizedCourseType = course.type?.trim().toLowerCase() || "";
  //   const normalizedFilterType = filters.type.trim().toLowerCase();

  //   const typeMatch = filters.type
  //     ? normalizedCourseType.includes(normalizedFilterType)
  //     : true;

  //   console.log(
  //     `Filtering course: "${course.title}", course.type="${course.type}", normalizedCourseType="${normalizedCourseType}", filter.type="${filters.type}", approvalStatus=${course.status}, filter.approvalStatus=${filters.approvalStatus}, approvalStatusMatch=${approvalStatusMatch}, typeMatch=${typeMatch}`
  //   );

  //   const match =
  //     keywordMatch && semesterMatch && approvalStatusMatch && typeMatch;

  //   if (!match) {
  //     console.log(`❌ 제외된 강의: ${course.title}`, {
  //       keywordMatch,
  //       semesterMatch,
  //       approvalStatusMatch,
  //       typeMatch,
  //     });
  //   } else {
  //     console.log(`✔️ 포함된 강의: ${course.title}`);
  //   }

  //   return match;
  // });

  // courseList.value = newFilteredList;
  // console.log("필터링된 강의 목록:", courseList.value);
};

const move = () => {
  router.push("/professor/course/registration");
};

const openApprovalModal = (course, action) => {
  selectedCourse.value = course;
  approvalAction.value = action;
  rejectionReason.value = "";
  showApprovalModal.value = true;
};

const closeApprovalModal = () => {
  showApprovalModal.value = false;
  selectedCourse.value = null;
  approvalAction.value = "";
  rejectionReason.value = "";
};

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const selectedCourse = ref(null);
const approvalAction = ref("");
const rejectionReason = ref("");
const showApprovalModal = ref(false);

const handleApproval = async () => {
  if (!selectedCourse.value) return;

  if (approvalAction.value === "reject" && !rejectionReason.value.trim()) {
    showModal("반려 사유를 입력해주세요.", "error");
    return;
  }

  try {
    const requestData = {
      courseId: selectedCourse.value.id,
      action: approvalAction.value,
      reason: approvalAction.value === "reject" ? rejectionReason.value : null,
    };

    const courseIndex = allCourseList.value.findIndex(
      (c) => c.id === selectedCourse.value.id
    );
    if (courseIndex !== -1) {
      allCourseList.value[courseIndex].status =
        approvalAction.value === "approve" ? "승인완료" : "반려";
    }
    myCourse({ keyword: "", semester: "", approvalStatus: "", type: "" });

    closeApprovalModal();

    const actionText = approvalAction.value === "approve" ? "승인" : "반려";
    showModal(`강의가 ${actionText} 처리되었습니다.`, "success");
  } catch (error) {
    console.error("승인/반려 처리 실패:", error);
    showModal("처리 중 오류가 발생했습니다.", "error");
  }
};

// const departments = computed(() => {
//   const set = new Set();
//   courseList.value.forEach((course) => {
//     if (course.type !== "교양필수" || course.type !== "교양선택") set.add(course.deptName);
//   });
//   return [...set];
// });
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">강의개설 승인 관리</h1>
      <p>
        신청한 신규 강의에 대한 승인 상태와 진행 현황을 확인하고 내용을 수정할
        수 있습니다.
      </p>
      <div class="filter-section">
        <ProfessorCourseFilter
          :state="true"
          @search="myCourse"
        />
      </div>
    </div>

    <CourseTable
      :course-list="courseList"
      :show="{ modify: false, approve: true, professorName: true }"
      :show-modal="showModal"
      class="some"
    />

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

.header-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.filter-section {
  margin-top: 16px;
}

.filter-section :deep(.filter-bar),
.filter-section :deep(.academic-filter-bar) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

  :deep(.filter-bar) label {
    min-width: auto !important;
  }

  .content-section {
    gap: 14px;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-body {
    padding: 20px;
  }

  .course-details {
    gap: 6px;
  }

  .modal-footer {
    padding: 12px 20px;
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
    padding: 12px;
  }

  .approval-table {
    font-size: 12px;
  }

  .approval-table th,
  .approval-table td {
    padding: 12px 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .btn-action {
    width: 100%;
    padding: 8px;
    font-size: 11px;
  }

  :deep(.mobile-card .course-actions .setting) {
    width: 100% !important;
  }
  :deep(.mobile-card .course-actions .setting button) {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 10px 0 !important;
    font-size: 14px !important;
    border-radius: 6px !important;
    min-width: 0 !important;
    height: 40px !important;
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

  .approval-table th,
  .approval-table td {
    padding: 14px 10px;
  }

  .modal-content {
    max-width: 450px;
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

  .content-section {
    gap: 24px;
  }

  .filter-section {
    display: flex;
    justify-content: flex-start;
  }

  .filter-section :deep(.filter-bar),
  .filter-section :deep(.academic-filter-bar) {
    justify-content: flex-start !important;
    text-align: left !important;
  }
}
</style>
