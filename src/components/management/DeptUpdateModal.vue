<script setup>
import { reactive, onMounted } from "vue";
import Modal from "../common/Modal.vue";
import { deptGetHead, deptPatch, deptPut } from "@/services/DeptManageService";

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
  if (!props.dept) {
    return;
  }
  const res = await deptGetHead(props.dept.deptId);

  console.log("aiai:", res);
  state.professor = res.data.result;
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
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h5 class="modal-title">학과 정보 변경</h5>
        <button type="button" class="btn-close" @click="close">×</button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
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
              <label class="form-check-label">학과정보 변경</label>
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
              <input
                type="text"
                id="d-code"
                v-model="state.form.deptCode"
                class="form-control"
              />
            </div>

            <div class="box">
              <label class="code" for="d-name">학과명</label>
              <input
                type="text"
                id="d-name"
                v-model="state.form.deptName"
                class="form-control"
              />
            </div>

            <div class="box">
              <label class="code" for="d-head">학과장명</label>
              <select
                name="headName"
                id="d-head"
                class="form-control"
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
              <input
                type="text"
                id="d-office"
                v-model="state.form.deptOffice"
                class="form-control"
              />
            </div>

            <div class="box">
              <label class="code" for="d-tel">학과 전화번호</label>
              <input
                type="text"
                id="d-tel"
                v-model="state.form.deptTel"
                class="form-control"
              />
            </div>

            <div class="box">
              <label class="code" for="d-max">학과 정원</label>
              <input
                type="text"
                id="d-max"
                v-model="state.form.deptMaxStd"
                class="form-control"
              />
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
                class="form-control"
              />
            </div>
            <div class="alert alert-danger">
              <strong>경고:</strong> 학과를 폐지하시겠습니까? 이 작업은 되돌릴
              수 없습니다.
            </div>
          </template>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <template v-if="state.checked">
          <button type="button" class="btn btn-secondary" @click="close">
            취소
          </button>
          <button type="button" class="btn btn-success" @click="update">
            수정
          </button>
        </template>
        <template v-else>
          <button type="button" class="btn btn-secondary" @click="close">
            취소
          </button>
          <button type="button" class="btn btn-danger" @click="update">
            폐지
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  background-color: #fff;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-radius: 4px;
}

.btn-close:hover {
  background-color: #f8f9fa;
  color: #000;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px 15px;
  background-color: #fff;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal-footer .btn {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
}

/* Form Elements */
p {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.select-box {
  display: flex;
  gap: 40px;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.select-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.select-item input[type="radio"] {
  margin: 0;
}

.form-check-label {
  color: #333;
  cursor: pointer;
}

.box {
  margin-bottom: 16px;
}

.code {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Bootstrap-style Form Controls */
.form-control {
  display: block;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  color: #495057;
  background-color: #fff;
  border-color: #80bdff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control::placeholder {
  color: #6c757d;
  opacity: 1;
}

/* Bootstrap Alert */
.alert {
  position: relative;
  padding: 12px 16px;
  margin: 16px 0;
  border: 1px solid transparent;
  border-radius: 4px;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

/* 확인 모달 스타일 */
.confirm-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.confirm-header {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 0;
}

.confirm-body {
  padding: 20px;
  text-align: center;
}

.confirm-text {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  color: #333;
}

.confirm-footer {
  padding: 12px 20px;
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.confirm-footer .btn {
  flex: 1;
}
</style>
