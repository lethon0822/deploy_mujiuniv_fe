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
    <div class="table-wrapper desktop-view">
      <table>
        <thead>
          <tr>
            <th class="code">과목코드</th>
            <th class="deptName">학과</th>
            <th class="title">교과목명</th>
            <th class="classroom">강의실</th>
            <th class="type">이수구분</th>
            <th class="professor" v-show="props.show.professorName">
              담당교수
            </th>
            <th class="grade">수강대상</th>
            <th class="time">강의시간</th>
            <th class="credit">학점</th>
            <th class="maxStd">정원</th>
            <th class="remStd" v-show="props.show.remStd">잔여</th>
            <th
              v-show="props.show.enroll || props.show.cancel"
              class="enroll-action"
            >
              수강
            </th>
            <th v-show="props.show.modify" class="status">승인여부</th>
            <th
              v-show="
                props.show.setting ||
                props.show.modify ||
                props.show.check ||
                props.show.approve
              "
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
            <td class="professor" v-show="props.show.professorName">
              {{ course.professorName }}
            </td>
            <td class="grade">
              <template v-if="course.grade === 0"> 수강희망자 </template>
              <template v-else>
                {{ course.deptName + " " + course.grade }}학년
              </template>
            </td>
            <td class="time">{{ course.time }}</td>
            <td class="credit">{{ course.credit }}</td>
            <td class="maxStd">
              <span class="remaining-count">{{ course.maxStd }}</span>
            </td>
            <td
              v-show="props.show.modify"
              class="status"
              :class="change(course.status)"
            >
              {{ course.status }}
            </td>
            <td class="remStd" v-show="props.show.remStd">
              <span class="remaining-count">{{ course.remStd }}</span>
            </td>
            <td v-show="props.show.enroll" class="enroll-action">
              <button
                class="enroll-btn"
                :class="{ enrolled: course.enrolled }"
                :disabled="course.enrolled"
                @click="$emit('enroll', course)"
              >
                {{ course.enrolled ? "신청완료" : "수강신청" }}
              </button>
            </td>
            <td v-show="props.show.cancel" class="enroll-action">
              <button
                class="cancel-btn"
                @click="$emit('cancel', course.courseId)"
              >
                수강취소
              </button>
            </td>
            <td
              v-show="
                props.show.setting ||
                props.show.check ||
                props.show.modify ||
                props.show.approve
              "
              class="button"
            >
              <button
                v-show="props.show.setting"
                class="enroll-btn"
                @click="send(course.courseId, course)"
              >
                관리
              </button>
              <button
                v-show="props.show.check"
                class="enroll-btn"
                @click="$emit('check', course.courseId, course.title)"
              >
                강의평 보기
              </button>
              <router-link
                v-show="props.show.modify && course.status !== '승인'"
                :to="{ name: 'ModifyCourse', params: { id: course.courseId } }"
                class="setting"
              >
                <button class="enroll-btn d-flex">수정</button>
              </router-link>
              <div v-show="props.show.approve" class="approve-buttons">
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
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mobile-view">
      <div
        v-for="course in props.courseList"
        :key="course.courseId"
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
            {{ course.title }}
          </div>
        </div>

        <div class="course-info">
          <div class="info-row" v-show="props.show.deptName">
            <span class="label">학과:</span>
            <span>{{
              course.type === "교양" ? "교양학부" : course.deptName
            }}</span>
          </div>
          <div class="info-row">
            <span class="label">강의실:</span>
            <span>{{ course.classroom }}</span>
          </div>
          <div class="info-row">
            <span class="label">이수구분:</span>
            <span>{{ course.type }}</span>
          </div>
          <div class="info-row" v-show="props.show.professorName">
            <span class="label">담당교수:</span>
            <span>{{ course.professorName }}</span>
          </div>
          <div class="info-row">
            <span class="label">수강대상:</span>
            <span>{{
              course.grade === 0
                ? "수강희망자"
                : course.deptName + " " + course.grade + "학년"
            }}</span>
          </div>
          <div class="info-row">
            <span class="label">시간:</span>
            <span>{{ course.time }}</span>
          </div>
          <div class="info-row">
            <span class="label">학점:</span>
            <span>{{ course.credit }}</span>
          </div>
          <div class="info-row">
            <span class="label">정원:</span>
            <span class="remaining-count">{{ course.maxStd }}</span>
          </div>
          <div class="info-row" v-show="props.show.remStd">
            <span class="label">잔여:</span>
            <span class="remaining-count">{{ course.remStd }}</span>
          </div>
        </div>

        <div class="course-actions">
          <button
            v-show="props.show.enroll"
            class="enroll-btn"
            :class="{ enrolled: course.enrolled }"
            :disabled="course.enrolled"
            @click="$emit('enroll', course)"
          >
            {{ course.enrolled ? "신청완료" : "수강신청" }}
          </button>
          <button
            v-show="props.show.cancel"
            class="cancel-btn"
            @click="$emit('cancel', course.courseId)"
          >
            수강취소
          </button>
          <button
            v-show="props.show.setting"
            class="enroll-btn"
            @click="send(course.courseId, course)"
          >
            관리
          </button>
          <button
            v-show="props.show.check"
            class="enroll-btn"
            @click="$emit('check', course.courseId, course.title)"
          >
            강의평 보기
          </button>
          <router-link
            v-show="props.show.modify && course.status !== '승인'"
            :to="{ name: 'ModifyCourse', params: { id: course.courseId } }"
            class="setting"
          >
            <button class="enroll-btn">수정</button>
          </router-link>
          <div v-show="props.show.approve" class="approve-buttons">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  margin: 20px auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1430px;
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

/* 비율 재조정 */
th.code,
td.code {
  width: 8%;
}
th.deptName,
td.deptName {
  width: 8%;
}
th.title,
td.title {
  width: 10%;
}
th.classroom,
td.classroom {
  width: 10%;
}
th.type,
td.type {
  width: 7%;
}
th.professor,
td.professor {
  width: 10%;
}
th.grade,
td.grade {
  width: 10.5%;
}
th.time,
td.time {
  width: 7%;
}
th.credit,
td.credit {
  width: 6.5%;
}
th.maxStd,
td.maxStd {
  width: 6.5%;
}
th.remStd,
td.remStd {
  width: 6.5%;
}
th.status,
td.status {
  width: 5%;
}
th.enroll-action,
td.enroll-action {
  width: 14%;
  text-align: center;
}
th.button,
td.button {
  width: 12%;
  text-align: center;
}

/* 모바일 카드 */
.mobile-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 16px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-code {
  font-size: 12px;
  color: #666;
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

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  width: 70px;
  flex-shrink: 0;
}

.course-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.approve-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}

.approve-buttons button {
  flex: 1;
}

/* 모바일 */
@media all and (min-width: 480px) and (max-width: 767px) {
  .table-container {
    padding: 15px;
    background-color: #f8f9fa;
    border: none;
    box-shadow: none;
  }

  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .course-actions button {
    flex: 1;
    min-width: 0;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .table-container {
    width: 100vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
    padding: 20px 20px 0 20px;
    max-width: none;
    margin: 0;
  }

  th.code,
  td.code {
    display: none;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .table-container {
    padding: 20px 20px 0 20px;
  }
}
</style>
