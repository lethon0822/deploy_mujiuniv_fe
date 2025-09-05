<!-- 강의 신청 현황  -->
<script setup>
import WhiteBox from "@/components/common/WhiteBox.vue";
import SearchFilterBar from "@/components/common/SearchFilterBar.vue";
import CourseTable from "@/components/course/CourseTable.vue";
import { findMyCourse } from "@/services/professorService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";


const courseList = ref([]);
const router = useRouter();


onMounted(async ()=>{
  const res = await findMyCourse();
  console.log('마마',res)
  courseList.value = res.data;

});

const myCourse = async (filters) => {
  const json = {
    year: filters.year,
    semester: filters.semester,
  };
  const res = await findMyCourse(json);
  courseList.value = res.data;
};

const move = () => {
  router.push("/professor/course/registration");
};
</script>
<template>
  <WhiteBox :title="'강의개설신청 및 신청현황조회'">
    <SearchFilterBar @search="myCourse" />
    <CourseTable
      :course-list="courseList"
      :show="{ modify: true }"
      class="some"
    />
    <div>
      <button class="enroll-btn" @click="move">개설신청</button>
    </div>
  </WhiteBox>
</template>
<style scoped>
button {
  display: flex;
  margin-right: 26px;
  color: white;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease; /* 버튼 클릭시 툭 바뀌는 게 아닌 0.2초 동안 천천히 바뀜 */
}
button.enroll-btn {
  background-color: #364157;
  color: #fff;
  margin-left: auto;
  margin-right: 38px;
}
.move {
  padding-top: 2px;
  text-decoration: none;
  color: #fff;
  justify-content: flex-end;
}
</style>
