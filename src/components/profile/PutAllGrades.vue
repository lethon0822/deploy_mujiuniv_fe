<script setup>
const { grades, creditByCategory, semesterGrades } = defineProps([
  "grades",
  "creditByCategory",
  "semesterGrades",
]);
</script>

<template>
  <div class="override-whitebox-margin">
    <!-- 과목별 성적 테이블 -->
    <h4>과목별 성적</h4>
    <div class="table-container">
      <table class="fixed_headers">
        <thead>
          <tr>
            <th class="index">순번</th>
            <th class="grade">학년</th>
            <th class="semester">학기</th>
            <th class="courseCode">과목코드</th>
            <th>교과목명</th>
            <th class="credit">학점</th>
            <th class="rank">등급</th>
            <th class="type">이수구분</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(grade, index) in grades" :key="index">
            <td class="index">{{ index + 1 }}</td>
            <td class="grade">{{ grade.grade }}</td>
            <td class="semester">{{ grade.semester }}</td>
            <td class="courseCode">{{ grade.courseCode }}</td>
            <td class="title">{{ grade.title }}</td>
            <td class="credit">{{ grade.credit }}</td>
            <td class="rank">{{ grade.rank || "-" }}</td>
            <td class="type">{{ grade.type }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 이수구분별 취득학점 테이블 -->
    <h4>이수구분별 취득학점</h4>
    <div class="table-container">
      <table class="fixed_headers">
        <thead>
          <tr>
            <th>순번</th>
            <th>학년</th>
            <th>학기</th>
            <th>전공필수</th>
            <th>전공선택</th>
            <th>교양</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in creditByCategory" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ record.grade }}</td>
            <td>{{ record.semester }}</td>
            <td>{{ record.majorRequired }}</td>
            <td>{{ record.majorElective }}</td>
            <td>{{ record.generalEducation }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 학기별 성적 테이블 -->
    <h4>학기별 성적</h4>
    <div class="table-container">
      <table class="fixed_headers">
        <thead>
          <tr>
            <th>순번</th>
            <th>학년</th>
            <th>학기</th>
            <th>신청학점</th>
            <th>취득학점</th>
            <th>평균점수</th>
            <th>평균평점</th>
            <th>석차</th>
            <th>인원</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(semesterGrade, index) in semesterGrades" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ semesterGrade.grade }}</td>
            <td>{{ semesterGrade.semester }}</td>
            <td>{{ semesterGrade.requestedCredits }}</td>
            <td>{{ semesterGrade.acquiredCredits }}</td>
            <td>{{ semesterGrade.avgScore }}</td>
            <td>{{ semesterGrade.avgGradePoint }}</td>
            <td>{{ semesterGrade.grading }}</td>
            <td>{{ semesterGrade.totalStudents }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.table-container {
  border-radius: 5px;
  max-width: 1300px;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-color: #888 #fff;
  border-radius: 5px 5px 0 0;
}

.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

thead {
  color: white;
  background-color: #364157;
}

thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 6px 5px;
  text-align: center;
  font-weight: 600;
  background-color: #364157;
}

tbody {
  text-align: center;
  color: black;
}

tbody tr {
  border-bottom: 1px solid #ddd;
  height: 40px;
}

h4 {
  font-weight: bold;
  color: #364157;
  margin-left: 25px;
  margin-top: 30px;
}

/*수동 컨트롤러 */

td.credit {
  text-align: center;
  padding-left: 80px;
}

th.credit {
  text-align: center;
  padding-left: 80px;
}

td.index,
th.index {
  white-space: nowrap;
  text-align: center;
  padding-left: 30px;
}

td.grade,
th.grade {
  white-space: nowrap;
  text-align: center;
  padding-left: 30px;
}

td.semester,
th.semester {
  white-space: nowrap;
  text-align: center;
  padding-left: 30px;
}

td.courseCode,
th.courseCode {
  white-space: nowrap;
  text-align: left;
  padding-left: 60px;
}

td.title {
  white-space: nowrap;
  text-align: left;
  padding-left: 0px;
}

td.rank,
th.rank {
  white-space: nowrap;
  text-align: left;
  padding-left: 50px;
}

td.rank {
  padding-left: 60px;
}

td.type,
th.type {
  white-space: nowrap;
  text-align: center;
  padding-right: 30px;
}
</style>
