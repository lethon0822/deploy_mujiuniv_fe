<script setup>
import { defineProps, ref } from 'vue';

const props = defineProps({
  academicInfo: {
    type: Object,
    required: true,
  },
});

const academicInfo = ref({
  status: '',
  majors: [],
  earlyGraduate: '',
  admissionDate: '',
  requestedMajors: [],
  thesisStatus: '',
  admissionType: '',
  admissionDepartment: '',
  teaching: '',
  bachelorMaster: '',
})

</script>

<template>
  <div class="info-box">
    <!-- 첫번째 -->
    <div class="one">
      <table>
        <tbody>
          <tr>
            <td class="label-cell">학적상태</td>
            <td class="value-cell">{{academicInfo.status}}</td>
          </tr>

          <tr>
            <td class="label-cell" rowspan="2">전공(부/복수/연계)</td>
            <td class="value-cell">{{academicInfo.majors[0]}}</td>
          </tr>
          <tr>
            <td class="value-cell">{{academicInfo.majors[1]}}</td>
          </tr>

          <tr>
            <td class="label-cell">조기졸업</td>
            <td class="value-cell">{{academicInfo.earlyGraduate}} </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 두번째 -->
    <div class="two">
      <table>
        <tbody>
          <tr>
            <td class="label-cell">입학일자</td>
            <td class="value-cell">{{academicInfo.admissionDate}}</td>
          </tr>

          <tr>
            <td class="label-cell" rowspan="2">신청학부</td>
            <td class="value-cell">{{ academicInfo.requestedMajors[0] }}</td>
          </tr>
          <tr>
            <td class="value-cell">{{ academicInfo.requestedMajors[1] }}</td>
          </tr>

          <tr>
            <td class="label-cell">졸업논문</td>
            <td class="value-cell">{{ academicInfo.thesisStatus }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 세번째 -->
    <div class="three">
      <table>
        <tbody>
          <tr>
            <td class="label-cell">입학구분</td>
            <td class="value-cell">{{ academicInfo.admissionType }}</td>
          </tr>

          <tr>
            <td class="label-cell">입학학부</td>
            <td class="value-cell">{{ academicInfo.admissionDepartment }}</td>
          </tr>

          <tr>
            <td class="label-cell">교직이수</td>
            <td class="value-cell">
              <select v-model="academicInfo.teaching">
                <option value="">선택</option>
                <option value="이수중">이수중</option>
                <option value="미이수">미이수</option>
              </select>
            </td>
          </tr>

          <tr>
            <td class="label-cell">학석사연계</td>
            <td class="value-cell">{{ academicInfo.bachelorMaster }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.info-box {
  display: flex;
  justify-content: center;
}

.one,
.two,
.three {
  flex: none;
  width: auto;
}

table {
  width: auto;
  border-collapse: collapse;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 100%;
}

td {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  vertical-align: middle;
}

.label-cell {
  background-color: #364157;
  color: white;
  font-weight: bold;
  width: 150px;
}

.value-cell {
  background-color: white;
  color: black;
  width: 300px;
}

select {
  width: 100%;
  padding: 4px;
  border: 1px solid #ced4da;
  border-radius: 3px;
  font-size: 13px;
}
</style>
