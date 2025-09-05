<script setup>
import CourseTable from '@/components/course/CourseTable.vue';
import SearchFilterBar from '@/components/common/SearchFilterBar.vue';
import WhiteBox from '@/components/common/WhiteBox.vue';
import { reactive, ref } from 'vue';
import { findMyCourse, checkSurvey } from '@/services/professorService';

const state = reactive({
  resultItem: [],
  visable: false,
  course: false,
  comment: [],
  avg: 0,
  title: '',
});

const courseList = ref([]); // 현재 유저의 전체 강의 목록

const myCourse = async (filters) => {
  state.comment = [];
  const json = {
    year: filters.year,
    semester: filters.semester,
  };

  const res = await findMyCourse(json);

  if (res.data.length > 0) {
    courseList.value = res.data;
    const result = courseList.value.filter((item) => {
      return item.status === '승인';
    });
    state.resultItem = result;
    state.course = false;

    return;
  }
  state.resultItem = [];
  state.course = true;
};

const check = async (courseId, title) => {
  const res = await checkSurvey(courseId);
  if (res.data.length > 0) {
    state.title = title;
    state.comment = res.data;
    console.log('코멘트:', state.comment);
    for (let item of state.comment) {
      state.avg += item.evScore;
    }
    state.visable = false;
    return;
  }

  state.comment = [];
  state.visable = true;
};
</script>

<template>
  <WhiteBox :title="'강의평가조회'">
    <SearchFilterBar @search="myCourse" />
    <CourseTable
      :course-list="state.resultItem"
      maxHeight="500px"
      :show="{ check: true }"
      @check="check"
    />
    <template v-if="state.course">
      <div class="d-flex no-comment">
        <span>등록된 강의가 없습니다.</span>
      </div>
    </template>

    <div class="d-flex check-comment">
      <h3><b>강의평</b></h3>
      <span>{{ state.title }}</span>
    </div>
    <hr />
    <template v-if="state.comment.length > 0">
      <template v-for="(item, index) in state.comment" :key="index">
        <div class="comment-container" v-if="item !== null && item !== ''">
          <div class="comment">
            <span>{{ item.review }}</span>
          </div>
        </div>
      </template>
    </template>
    <template v-if="state.visable">
      <div class="d-flex no-comment">
        <span>등록된 평가가 없습니다.</span>
      </div>
    </template>
  </WhiteBox>
</template>

<style scoped>
.comment-container {
  margin: 10px 0;
  margin-left: 15px;
  border-radius: 5px;
  width: 100%;
  max-height: 350px;
  max-width: 1430px;
  min-width: 1350px;
  overflow-y: auto; /*세로 스크롤*/
  scrollbar-gutter: stable; /* 스크롤바로 인해 테이블 컬럼 정렬 깨짐 방지*/
}

.check-comment {
  align-items: center;
  margin-top: 50px;
  gap: 20px;
}

.check-comment h3 {
  margin: 0;
}

hr {
  margin-top: 5px;
  margin-bottom: 20px;
}
.comment {
  margin: 3px;
  margin-bottom: 10px;
  min-height: 100px;
  max-width: 1346px;
  min-width: 1346px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 20px;
}

.no-comment {
  justify-content: center;
  margin: 10px;
}
</style>
