<script setup>
import CourseTable from "@/components/course/CourseTable.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import { reactive, ref, onMounted, computed } from "vue";
import { findMyCourse, checkSurvey } from "@/services/professorService";
import { getDepartments, getYears } from "@/services/CourseService";

const departments = ref([]);
const years = ref([]);
const courseList = ref([]);
const itemsPerPage = 5;

/*
const state = reactive({
  resultItem: [],
  visable: false,
  course: false,
  comment: [],
  avg: 0,
  title: "",
  selectedCourse: false, 
  showAll: false,
});
*/

const displayedComments = computed(() => {
  if (state.showAll || state.comment.length <= itemsPerPage) {
    return state.comment;
  }
  return state.comment.slice(0, itemsPerPage);
});

onMounted(async () => {
  const depRes = await getDepartments();
  departments.value = depRes.data;

  const yearRes = await getYears();
  years.value = yearRes.data;
});

const handleSearch = async (filters) => {
  await myCourse(filters);
};

const myCourse = async (filters) => {
  state.comment = [];
  state.selectedCourse = false;
  state.showAll = false;

  const json = {
    year: filters.year,
    semester: filters.semester,
  };

  const res = await findMyCourse(json);

  if (res.data.length > 0) {
    courseList.value = res.data;
    const result = courseList.value.filter((item) => {
      return item.status === "승인";
    });
    state.resultItem = result;
    state.course = false;
    return;
  }
  state.resultItem = [];
  state.course = true;
};

const check = async (courseId, title) => {
  state.selectedCourse = true;
  state.showAll = false;
  state.title = title;

  const res = await checkSurvey(courseId);
  if (res.data.length > 0) {
    state.comment = res.data;
    console.log("코멘트:", state.comment);

    state.avg = 0;
    for (let item of state.comment) {
      if (item.evScore) {
        state.avg += item.evScore;
      }
    }
    if (state.comment.length > 0) {
      state.avg = (state.avg / state.comment.length).toFixed(1);
    }

    state.visable = false;
    return;
  }

  state.comment = [];
  state.visable = true;
};

const toggleShowAll = () => {
  state.showAll = !state.showAll;
};

const closeReview = () => {
  state.selectedCourse = false;
  state.comment = [];
  state.showAll = false;
  state.visable = false;
};

// 강의평 테스트용 하드코딩 데이터 나중에 지울것
const state = reactive({
  resultItem: [],
  visable: false,
  course: false,
  comment: [
    {
      review:
        "교수님이 정말 친절하시고 강의 내용도 체계적으로 잘 정리되어 있습니다. 과제는 조금 많지만 실무에 도움이 되는 내용들이라 만족스럽습니다.",
      evScore: 4.5,
    },
    {
      review:
        "이론과 실습의 균형이 잘 맞춰져 있어서 좋았습니다. 특히 프로젝트를 통해 실제로 데이터베이스를 설계해볼 수 있어서 많이 배웠습니다.",
      evScore: 4.0,
    },
    {
      review:
        "수업 진도가 적절하고 질문에 대해서도 성의껏 답변해주십니다. 중간고사, 기말고사 난이도도 적당했어요.",
      evScore: 4.2,
    },
    {
      review:
        "강의 자료가 매우 잘 정리되어 있고, 복습하기 좋게 만들어져 있습니다. 추천하는 강의입니다!",
      evScore: 4.8,
    },
    {
      review:
        "처음에는 어려웠지만 교수님께서 차근차근 설명해주셔서 점점 이해할 수 있었습니다. SQL 실습이 특히 도움이 되었어요.",
      evScore: 4.1,
    },
    {
      review:
        "과제량이 적당하고 시험도 수업 내용 범위 내에서 출제됩니다. 성실하게 수강하면 좋은 성적을 받을 수 있어요.",
      evScore: 4.3,
    },
    {
      review:
        "실무 경험이 풍부한 교수님이셔서 이론뿐만 아니라 현장에서 사용되는 기술들도 많이 배울 수 있었습니다.",
      evScore: 4.7,
    },
    {
      review:
        "교재와 함께 추가 자료들도 많이 제공해주셔서 학습에 도움이 되었습니다. 질문에 대한 피드백도 빨랐어요.",
      evScore: 4.0,
    },
    {
      review:
        "온라인 수업도 잘 진행하셨고, 녹화본도 제공해주셔서 복습하기 좋았습니다.",
      evScore: 3.9,
    },
    {
      review:
        "프로젝트 중심의 수업이라 실제로 손으로 해볼 수 있어서 좋았습니다. 팀 프로젝트도 의미있었어요.",
      evScore: 4.4,
    },
  ],
  avg: 0,
  title: "데이터베이스 시스템 (DB001)",
  selectedCourse: true,
  showAll: false,
});
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">강의평가조회</h1>
      <p>수강한 강의에 대한 학생들의 평가를 확인 할 수 있습니다.</p>
      <div class="filter-section">
        <SearchFilterBar
          :departments="departments"
          :years="years"
          @search="handleSearch"
        />
      </div>
    </div>

    <CourseTable
      :course-list="state.resultItem"
      maxHeight="500px"
      :show="{ check: true }"
      @check="check"
    />

    <!-- 등록된 강의가 없을 때 -->
    <template v-if="state.course">
      <div class="d-flex no-comment">
        <span>등록된 강의가 없습니다.</span>
      </div>
    </template>

    <!-- 강의평 섹션 - 강의를 선택했을 때만 표시 -->
    <template v-if="state.selectedCourse">
      <div class="review-section">
        <div class="d-flex check-comment">
          <div class="review-header">
            <div style="text-align: center">
              <div class="gray-bar"></div>
            </div>
            <h3>
              <b><i class="bi bi-chat-left-text me-3"></i>강의평</b>
            </h3>
            <div class="review-info">
              <span class="course-title">{{ state.title }}</span>
              <span class="review-count" v-if="state.comment.length > 0">
                총 {{ state.comment.length }}개의 평가
              </span>
            </div>
          </div>
          <button
            class="close-review-btn"
            @click="closeReview"
            title="강의평 닫기"
          >
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <hr />

        <!-- 강의평이 있을 때 -->
        <template v-if="state.comment.length > 0 && !state.visable">
          <template v-for="(item, index) in displayedComments" :key="index">
            <div class="comment-container" v-if="item !== null && item !== ''">
              <div class="comment">
                <div class="comment-header">
                  <span class="comment-number"
                    >{{ index + 1 }}번째 평가<i
                      class="bi bi-people-fill ms-2"
                    ></i
                  ></span>
                  <span class="comment-score" v-if="item.evScore">
                    <i class="bi bi-star-fill me-2"></i>평점:
                    {{ item.evScore }}/5
                  </span>
                </div>
                <span class="comment-text">{{ item.review }}</span>
              </div>
            </div>
          </template>

          <!-- 더보기/접기 버튼 -->
          <div
            class="load-more-section"
            v-if="state.comment.length > itemsPerPage"
          >
            <button class="load-more-btn" @click="toggleShowAll">
              <template v-if="!state.showAll">
                더보기
                <i class="bi bi-chevron-down"></i>
              </template>
              <template v-else>
                접기
                <i class="bi bi-chevron-up"></i>
              </template>
            </button>
          </div>
        </template>

        <!-- 등록된 평가가 없을 때 -->
        <template v-if="state.visable">
          <div class="d-flex no-comment">
            <span>등록된 평가가 없습니다.</span>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
  box-sizing: border-box;
}

.filter-section :deep(.filter-bar) {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
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

.filter-section {
  margin-top: 16px;
}

.gray-bar {
  width: 200px;
  height: 15px;
  border-radius: 999px;
  background-color: #e8e8e8;
  margin-bottom: 30px;
  display: inline-block;
}

.review-section {
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.no-comment {
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin: 20px 0;
}

.no-comment span {
  color: #6c757d;
  font-size: 16px;
  font-weight: 500;
}

.check-comment {
  justify-content: space-between;
  align-items: flex-start;
  margin: 0 0 16px 0;
  padding: 0 8px;
}

.review-header {
  flex: 1;
}

.review-header h3 {
  margin: 0 0 8px 0;
  color: #0d6efd;
  font-size: 20px;
  font-weight: 600;
}

.review-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-title {
  color: #495057;
  font-size: 16px;
  font-weight: 500;
}

.review-count {
  color: #6c757d;
  font-size: 13px;
  font-weight: 400;
}

.close-review-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 20px;
}

.close-review-btn:hover {
  background-color: #f8f9fa;
  color: #495057;
}

hr {
  border: none;
  height: 1px;
  background-color: #e9ecef;
  margin: 16px 0 24px 0;
}

.comment-container {
  margin-bottom: 16px;
  padding: 0;
}

.comment {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
}

.comment:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.comment-number {
  color: #6c757d;
  font-size: 13px;
  font-weight: 500;
}

.comment-score {
  color: #0d6efd;
  font-size: 13px;
  font-weight: 600;
}

.comment-text {
  color: #343a40;
  font-size: 15px;
  line-height: 1.6;
  display: block;
  word-break: break-word;
}

.load-more-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.load-more-btn {
  background-color: #3bbeff;
  border: 0.2px solid #e5e7eb;
  color: #fff;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.load-more-btn:hover {
  background-color: #1dafff;
  border-color: #1dafff;
}

.load-more-btn i {
  font-size: 12px;
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

  .gray-bar {
    width: 150px;
    height: 10px;
    margin-left: 0;
  }

  .review-section {
    padding: 16px;
    margin-top: 16px;
  }

  .check-comment {
    position: relative;
  }

  .close-review-btn {
    position: absolute;
    top: 0;
    right: 0;
    margin-top: 0;
    align-self: auto;
  }

  .review-header h3 {
    font-size: 18px;
  }

  .course-title {
    font-size: 14px;
  }

  .review-count {
    font-size: 12px;
  }

  .no-comment {
    padding: 32px 16px;
    margin: 16px 0;
  }

  .no-comment span {
    font-size: 14px;
  }

  .comment {
    padding: 16px;
    border-radius: 6px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .comment-text {
    font-size: 14px;
    line-height: 1.5;
  }

  .load-more-btn {
    padding: 10px 20px;
    font-size: 13px;
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

  .filter-section :deep(.filter-bar .filter-group) {
    gap: 10px !important;
    display: flex !important;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }

  :deep(.filter-bar) {
    gap: 30px !important;
  }

  :deep(.year-filter),
  :deep(.semester-filter) {
    display: block !important;
  }

  .review-section {
    padding: 18px;
  }

  .review-header h3 {
    font-size: 19px;
  }

  .course-title {
    font-size: 15px;
  }

  .no-comment {
    padding: 36px 18px;
    margin: 18px 0;
  }

  .no-comment span {
    font-size: 15px;
  }

  .comment {
    padding: 18px;
    border-radius: 7px;
  }

  .comment-text {
    font-size: 14px;
    line-height: 1.55;
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

  .filter-section {
    display: flex;
    justify-content: flex-start;
  }

  .filter-section :deep(.filter-bar),
  .filter-section :deep(.academic-filter-bar) {
    justify-content: flex-start !important;
    text-align: left !important;
  }

  .review-section {
    padding: 20px;
  }

  .comment {
    padding: 20px;
  }
}
</style>
