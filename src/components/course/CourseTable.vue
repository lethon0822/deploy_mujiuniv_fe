<script setup>
import { useRouter } from "vue-router";
import { inject } from "vue";
import axios from "axios";

//  props는 반드시 변수에 담아 사용
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
    }),
  },
});
defineEmits(["enroll", "cancel", "check"]);

const change = (status) => {
  if (status === "거부") return "gray";
  if (status === "승인") return "blue";
  return "red";
};

const openModal = inject("openModal");
const openLink = (id) => openModal(id);

const router = useRouter();
const send = (id, json) => {
  const jsonBody = JSON.stringify(json);
  router.push({
    path: `/professor/course/${id}/students`,
    state: { data: jsonBody },
  });
};

//  승인/거부 API 호출
const patchCourseStatus = async (courseId, status, userId = 0) => {
  try {
    const payload = { courseId, status, userId };
    const res = await axios.patch("/staff/approval/course", payload);

    if (res.status === 200) {
      alert(`강의가 ${status} 처리되었습니다.`);

      //  props.courseList 로 접근해야 함
      const target = props.courseList.find((c) => c.courseId === courseId);
      if (target) target.status = status;
    } else {
      console.error("응답 오류:", res);
      alert("승인/거부 실패 (서버 응답 오류)");
    }
  } catch (err) {
    console.error("승인/거부 실패:", err);
    alert("처리 중 오류가 발생했습니다.");
  }
};
</script>

<template>
  <div class="table-container">
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="code">과목코드</th>
            <th class="deptName">학과</th>
            <th class="title">교과목명</th>
            <th class="classroom">강의실</th>
            <th class="type">이수구분</th>
            <th class="professor" v-if="props.show.professorName">담당교수</th>
            <th class="grade">수강대상</th>
            <th class="time">강의시간</th>
            <th class="credit">학점</th>
            <th class="maxStd">정원</th>
            <th class="remStd" v-if="props.show.remStd">잔여</th>
            <th
              v-if="props.show.enroll || props.show.cancel"
              class="enroll-action"
            >
              수강
            </th>
            <th v-if="props.show.modify" class="status">승인여부</th>
            <th
              v-if="props.show.setting || props.show.modify || props.show.check"
              class="button"
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="course in props.courseList" :key="course.courseId">
            <td class="code">{{ course.courseCode }}</td>
            <td class="deptName">
              <div v-if="course.type === '교양'">교양학부</div>
              <div v-else>{{ course.deptName }}</div>
            </td>
            <td class="title">
              <div @click="openLink(course.courseId)" class="link">
                {{ course.title }}
              </div>
            </td>
            <td class="classroom">{{ course.classroom }}</td>
            <td class="type">{{ course.type }}</td>
            <td class="professor" v-if="props.show.professorName">
              {{ course.professorName }}
            </td>
            <template v-if="course.grade === 0">
              <td>수강희망자</td>
            </template>
            <template v-else>
              <td class="grade">
                {{ course.deptName + " " + course.grade }}학년
              </td>
            </template>
            <td class="time">{{ course.time }}</td>
            <td class="credit">{{ course.credit }}</td>
            <td class="maxStd">
              <span class="remaining-count">{{ course.maxStd }}</span>
            </td>
            <td
              v-if="props.show.modify"
              class="status"
              :class="change(course.status)"
            >
              {{ course.status }}
            </td>
            <td class="remStd" v-if="props.show.remStd">
              <span class="remaining-count">{{ course.remStd }}</span>
            </td>
            <td v-if="props.show.enroll" class="enroll-action">
              <button
                class="enroll-btn"
                :class="{ enrolled: course.enrolled }"
                :disabled="course.enrolled"
                @click="$emit('enroll', course)"
              >
                {{ course.enrolled ? "신청완료" : "수강신청" }}
              </button>
            </td>
            <td v-else-if="props.show.cancel" class="enroll-action">
              <button
                class="cancel-btn"
                @click="$emit('cancel', course.courseId)"
              >
                수강취소
              </button>
            </td>
            <td v-else-if="props.show.setting" class="button">
              <button class="enroll-btn" @click="send(course.courseId, course)">
                관리
              </button>
            </td>
            <td v-else-if="props.show.check" class="button">
              <button
                class="enroll-btn"
                @click="$emit('check', course.courseId, course.title)"
              >
                강의평 보기
              </button>
            </td>
            <td
              v-else-if="props.show.modify"
              class="button"
              v-if="course.status !== '승인'"
            >
              <router-link
                :to="{ name: 'ModifyCourse', params: { id: course.courseId } }"
                class="setting"
              >
                <button class="enroll-btn d-flex">수정</button>
              </router-link>
            </td>
            <td v-if="props.show.approve" class="button">
              <button
                class="enroll-btn"
                @click="patchCourseStatus(course.courseId, '승인')"
              >
                승인
              </button>
              <button
                class="cancel-btn"
                @click="patchCourseStatus(course.courseId, '거부')"
              >
                거부
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  margin: 20px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1430px;
  margin: 20px auto;
  border: 0.2px solid #74747480;
  position: relative;
  background-color: white;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 25px 25px 0 25px;
}

.table-wrapper {
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #cdcdcd #f0f0f0;
}

table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  table-layout: auto;
}
thead {
  color: #333;
  background-color: #f8f9fa;
}
thead th {
  position: sticky;
  top: 0;
  background-color: #fff;
  z-index: 2;
  padding: 12px 4px;
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
  text-align: center;
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
  padding: 8px 4px;
  border-right: none;
  font-size: 13px;
}
thead th,
tbody td {
  color: #343a40;
}

/* 버튼 */
button {
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  margin: 2px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

button.enroll-btn {
  background-color: #2460ce;
  color: #fff;
}

button.enroll-btn:hover {
  background-color: #1f53b5;
}

.enroll-btn.enrolled {
  background-color: gray;
  cursor: not-allowed;
}

.enroll-btn.enrolled:hover {
  background-color: gray;
}

button.cancel-btn {
  background-color: #f44336;
}

button.cancel-btn:hover {
  background-color: #d32f2f;
}

.link {
  color: #2460ce;
  cursor: pointer;
  text-decoration: underline;
}
.link:hover {
  color: #1f53b5;
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

.status {
  width: 120px;
}
.button {
  width: 150px;
}

th.code,
td.code,
th.deptName,
td.deptName,
th.title,
td.title,
th.classroom,
td.classroom,
th.type,
td.type,
th.professor,
td.professor {
  width: 130px;
  text-align: center;
}

th.grade,
td.grade {
  width: 150px;
  text-align: center;
}

td.time,
th.time {
  width: 110px;
  text-align: center;
}

th.credit,
td.credit {
  width: 60px;
  text-align: center;
}

th.maxStd,
td.maxStd,
th.remStd,
td.remStd {
  width: 120px;
  text-align: center;
}

td.enroll-action {
  width: 120px;
  text-align: center;
}
</style>
