<script setup>
import { reactive, onMounted } from 'vue';
import Modal from '../common/Modal.vue';
import { deptGetHead, deptPatch, deptPut} from '@/services/DeptManageService';

const props = defineProps({
  dept: Object,
});
const state = reactive({
  form: {
    deptId: props.dept.deptId,
    headProfId: props.dept.headProfId,
    deptName: props.dept.deptName,
    deptOffice: props.dept.deptOffice,
    deptTel: props.dept.deptTel,
    deptMaxStd: props.dept.deptMaxStd,
    deptCode: props.dept.deptCode,
  },
  professor: [],
  checked: true,
});

onMounted(async () => {
  if (!props.dept) return;
  const res = await deptGetHead(props.dept.deptId);
  state.professor = res.data;
  console.log("aiai:", state.professor);
  console.log;
});

const change = (select) => {
  if (select === 1) {
    state.checked = true;
    return;
  }
  state.checked = false;
};

const update = async () => {
  try {
    if (state.checked === false) {
      await deptPatch(state.form.deptId);
    } else {
      await deptPut(state.form);
    }
    close();
  } catch (err) {
    console.error(err);
    alert("업데이트 중 오류 발생");
  }
};

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};
</script>

<template>
  <Modal :title="'학과 정보 변경'" @close="close">
    <div class="frame">
      <p>작업 선택</p>
      <div class="select-box">
        <div class="select-item">
          <input
            type="radio"
            name="select"
            @click="change(1)"
            :checked="state.checked"
          />
          <label class="form-check-label">학과 정보 변경</label>
        </div>
        <div class="select-item">
          <input
            type="radio"
            name="select"
            @click="change(0)"
            :checked="!state.checked"
          />
          <label class="form-check-label">학과 폐지</label>
        </div>
      </div>
      <!-- radio선택에 따라 창이 다르다 -->
      <template v-if="state.checked">
        <div class="box">
          <label class="code" for="d-code">학과코드</label>
          <input type="text" id="d-code" v-model="state.form.deptCode" />
        </div>

        <div class="box">
          <label class="code" for="d-name">학과명</label>
          <input type="text" id="d-name" v-model="state.form.deptName" />
        </div>

        <div class="box">
          <label class="code" for="d-head">학과장명</label>
          <select
            name="headName"
            id="d-head"
            class="d-head"
            v-model="state.form.headProfId"
          >
            <option
              v-for="proItem in state.professor"
              :key="proItem.userId"
              :value="proItem.userId"
            >
              {{ proItem.userName }}
            </option>
          </select>
        </div>

        <div class="box">
          <label class="code" for="d-office">학과 사무실</label>
          <input type="text" id="d-office" v-model="state.form.deptOffice" />
        </div>

        <div class="box">
          <label class="code" for="d-tel">학과 전화번호</label>
          <input type="text" id="d-tel" v-model="state.form.deptTel" />
        </div>

        <div class="box">
          <label class="code" for="d-max">학과 정원</label>
          <input type="text" id="d-max" v-model="state.form.deptMaxStd" />
        </div>

        <div class="button">
          <button class="btn btn-light" @click="close">취소</button>
          <button class="btn btn-success" @click="update">수정</button>
        </div>
      </template>
      <template v-else>
        <div class="box">
          <label class="code" for="d-code">학과 코드</label>
          <input
            type="text"
            id="d-code"
            placeholder="예:CSE001"
            v-model="state.form.deptCode"
          />
        </div>
        <div class="alert">
          <span
            ><b>경고:</b> 학과를 폐지하시겠습니까? 이 작업은 되돌릴 수
            없습니다.</span
          >
        </div>
        <div class="button">
          <button class="btn btn-light" @click="close">취소</button>
          <button class="btn btn-danger" @click="update">폐지</button>
        </div>
      </template>
    </div>
  </Modal>
</template>

<style scoped>
p {
  margin: 3px;
  font-size: 13px;
}

.select-box {
  display: flex;
  align-items: center;
  gap: 100px;
  font-size: 13px;
  margin-bottom: 15px;
}
.select-item {
  display: flex;
  gap: 4px;
}

.box {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px; /* 각 필드 간격 */
}

input {
  border-radius: 5px;
  border: 2px solid #e5e7eb;
}

input[type="text"] {
  padding: 5px;
  padding-left: 10px; /* placeholder 포함 입력 영역 전체에 공간 */
  /* input 주변 여백 */
}

input[type="text"]:focus {
  outline: none; /* 기본 파란색 아웃라인 제거 */
  border-color: #98c994; /* 원하는 색으로 변경 */
  box-shadow: 0 0 2px #98c994; /* 살짝 glow 효과 주고 싶으면 */
  padding-left: 3px;
}

input[type="text"]::placeholder {
  color: #c8c8c8;
}

select {
  padding: 5px;
  border-radius: 5px;
  border: 2px solid #e5e7eb;
}
select:focus {
  outline: none; /* 기본 파란색 아웃라인 제거 */
  border-color: #98c994; /* 원하는 색으로 변경 */
  box-shadow: 0 0 2px #98c994; /* 살짝 glow 효과 주고 싶으면 */
  padding-left: 3px;
}

.alert {
  background-color: #fdf2f2;
  border: 1px solid #facac9;
  color: #d3221e;
  padding: 10px 3px;
  text-align: center;
  margin: 20px 0;
}
.button {
  margin-top: 30px;
  display: flex; /* 버튼들을 가로로 나란히 배치 */
  gap: 10px; /* 버튼 사이 간격 */
}

.button .btn {
  flex: 1; /* 버튼이 부모 div 안에서 균등하게 늘어남 */
}

.btn-light {
  border: 1px solid #c5c5c5;
}
</style>
