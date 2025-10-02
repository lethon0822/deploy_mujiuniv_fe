<script setup>
import CourseTable from "@/components/course/CourseTable.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import { reactive, ref, onMounted, computed } from "vue";
import { findMyCourse, checkSurvey } from "@/services/professorService";
import { sortArrayByTitle } from "@/services/CommonMethod";

const itemsPerPage = 5;

const state = reactive({
  courseList: [],
  resultCourse: [],
  comment: [],
  resultComment: [],
  visable: false,
  avg: 0,
  title: "",
  selectedCourse: false,
  showAll: false,
});

const displayedComments = computed(() => {
  if (state.showAll || state.resultComment.length <= itemsPerPage) {
    return state.resultComment;
  }
  return state.resultComment.slice(0, itemsPerPage);
});

const handleSearch = async (filters) => {
  await myCourse(filters);
};

const myCourse = async (filters) => {
  const json = {
    year: filters.year,
    semester: filters.semester,
  };

  const res = await findMyCourse(json);

  if (res.data.result.length > 0) {
    state.courseList = res.data.result;
    //filter =>{} 사용시 return 을 적어야함 {} 없으면 return 안해도 됨
    const result = state.courseList.filter((item) => {
      return item.status === "승인";
    });
    state.resultCourse = sortArrayByTitle(result)
  }
};

//코멘트 체크
const check = async (courseId, title) => {
  state.visable = false;
  state.selectedCourse = true;
  state.showAll = false;
  state.title = title;

  const res = await checkSurvey(courseId);
  if (res.status !== 200 && res.data.result.length === 0) {
    state.visable = true;
    return;
  }
  state.comment = res.data.result;
  const result = state.comment.filter(
    (item) => item.review !== null && String(item.review).trim() !== ""
  );
  state.resultComment = result;

  let total = 0;
  if(state.comment){
    for (let item of state.comment) {
      total += item.evScore;
    }
  }
  state.avg = state.comment.length !== 0 ?(total / state.comment.length).toFixed(1) : 0;
  console.log(state.avg)
  

  if (state.resultComment.length === 0) {
    state.visable = true;
  }

  if (state.showAll || state.resultComment.length <= itemsPerPage) {
    return state.resultComment;
  }
  return state.resultComment.slice(0, itemsPerPage);
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
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1 class="page-title">강의평가조회</h1>
      <p>담당 강의의 학생 평가 내용을 확인 할 수 있습니다.</p>
      <div class="filter-section">
        <SearchFilterBar @search="handleSearch" />
      </div>
    </div>

    <CourseTable
      :course-list="state.resultCourse"
      maxHeight="500px"
      :show="{ check: true }"
      @check="check"
    />

    <!-- 등록된 강의가 없을 때 -->
    <template v-if="!state.courseList">
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
              <span class="review-count">
                {{ state.comment.length ? state.comment.lenght : 0 }}개의 평가
                <i class="bi bi-star-fill me-2 ms-2"></i> {{ state.avg}}/5
              </span>
              <span class="review-count">
                {{ state.resultComment.length ? state.resultComment.length : 0}}개의 코멘트
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
            v-if="state.resultComment.length > itemsPerPage"
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

        <!-- 등록된 코멘트가 없을 때 -->
        <template v-if="state.visable">
          <div class="d-flex no-comment">
            <span>등록된 코멘트가 없습니다.</span>
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
