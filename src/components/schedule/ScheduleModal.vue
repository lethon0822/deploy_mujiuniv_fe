<script setup>
import { ref, watch, computed } from "vue";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/services/scheduleService";
import { TYPE_ORDER } from "@/constants/scheduleTypes";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editItem: { type: Object, default: null },
  defaultSemesterId: { type: Number, required: true },
  pickedDate: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "saved"]);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

// 내부 폼 상태
const form = ref({
  scheduleId: null,
  semesterId: props.defaultSemesterId,
  scheduleType: "",
  startDate: "",
  endDate: "",
  description: "",
});

const isSaving = ref(false);
const notice = ref({ open: false, type: "success", msg: "" });
let afterNotice = null;
const confirmBox = ref({ open: false, msg: "", onOk: null });

// 알림 모달
function openNotice(msg, type = "success", after = null) {
  notice.value = { open: true, type, msg };
  afterNotice = after;
}
function closeNotice() {
  notice.value.open = false;
  if (afterNotice) afterNotice();
  afterNotice = null;
}

// 확인 모달
function openConfirm(msg, onOk) {
  confirmBox.value = { open: true, msg, onOk };
}
function closeConfirm() {
  confirmBox.value.open = false;
  confirmBox.value.onOk = null;
}
// editItem → form 매핑
watch(
  () => props.editItem,
  (v) => {
    if (v) {
      console.log("defaultSemesterId:", props.defaultSemesterId);
      form.value = {
        scheduleId: v.scheduleId ?? v.id ?? null,
        semesterId: v.semesterId ?? props.defaultSemesterId,
        scheduleType: v.scheduleType ?? "",
        startDate: v.startDate ?? "",
        endDate: v.endDate ?? "",
        description: v.description ?? "",
      };
    } else {
      form.value = {
        scheduleId: null,
        semesterId: props.defaultSemesterId,
        scheduleType: TYPE_ORDER[0] || "",
        startDate: props.pickedDate || "",
        endDate: props.pickedDate || "",
        description: "",
      };
    }
  },
  { immediate: true }
);

const close = () => (visible.value = false);

// 유효성 검사
function validate() {
  if (!form.value.scheduleType) return "일정명을 선택해 주세요.";
  if (!form.value.startDate || !form.value.endDate)
    return "시작일과 종료일을 입력해 주세요.";
  if (new Date(form.value.startDate) > new Date(form.value.endDate))
    return "종료일은 시작일 이후여야 합니다.";
  return "";
}

// 저장
const save = async () => {
  const err = validate();
  if (err) {
    openNotice(err, "error");
    return;
  }
  if (isSaving.value) return;
  isSaving.value = true;
  
  console.log("form before save:", form.value); // ✅ 여기
  console.log("defaultSemesterId in save:", props.defaultSemesterId);

  // ✅ 서버에서 요구하는 필드명에 맞춰 변환
  const payload = {
    semesterId: form.value.semesterId,
    scheduleType: form.value.scheduleType,
    startDatetime: `${form.value.startDate}T00:00:00`,
    endDatetime: `${form.value.endDate}T23:59:59`,
    description: form.value.description || " ",
  };

  try {
    if (form.value.scheduleId) {
      await updateSchedule(form.value.scheduleId, payload);
      openNotice("일정이 수정되었습니다.", "success", () => {
        emit("saved");
        close();
      });
    } else {
      await createSchedule(payload);
      openNotice("일정이 등록되었습니다.", "success", () => {
        emit("saved");
        close();
      });
    }
  } catch (e) {
    console.error(e);
    openNotice("처리 중 오류가 발생했습니다.", "error");
  } finally {
    isSaving.value = false;
  }
};

// 삭제
const removeItem = async () => {
  if (!form.value.scheduleId) return;
  openConfirm("정말 삭제할까요?", async () => {
    closeConfirm();
    if (isSaving.value) return;
    isSaving.value = true;
    try {
      await deleteSchedule(form.value.scheduleId);
      openNotice("일정이 삭제되었습니다.", "success", () => {
        emit("saved");
        close();
      });
    } catch (e) {
      console.log("di:",e)
      openNotice("삭제 중 오류가 발생했습니다.", "error");
    } finally {
      isSaving.value = false;
    }
  });
};

</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="sch-overlay" @click.self="close">
      <div class="sch-dialog" role="dialog" aria-modal="true">
        <div class="title">
          <strong>{{ form.scheduleId ? "일정 수정" : "새 일정 추가" }}</strong>
          <button class="icon" @click="close" aria-label="닫기">✕</button>
        </div>

        <div class="body">
          <!-- 일정명 드롭다운 -->
          <label class="row">
            <span class="label">일정명</span>
            <select v-model="form.scheduleType" class="select">
              <option disabled value="">선택</option>
              <option v-for="t in TYPE_ORDER" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </label>

          <label class="row">
            <span class="label">시작일</span>
            <input type="date" v-model="form.startDate" />
          </label>

          <label class="row">
            <span class="label">종료일</span>
            <input type="date" v-model="form.endDate" />
          </label>

          <label class="row">
            <span class="label">설명</span>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="선택 사항"
            ></textarea>
          </label>
        </div>

        <div class="actions">
          <button class="primary" :disabled="isSaving" @click="save">
            {{ form.scheduleId ? "저장" : "추가" }}
          </button>
          <button class="ghost" :disabled="isSaving" @click="close">
            취소
          </button>
          <button
            v-if="form.scheduleId"
            class="danger"
            :disabled="isSaving"
            @click="removeItem"
          >
            삭제
          </button>
        </div>
      </div>
    </div>

    <!-- ✅ 알림 모달 -->
    <div v-if="notice.open" class="mini-overlay">
      <div class="mini-dialog" :class="notice.type">
        <div class="mini-msg" v-text="notice.msg"></div>
        <div class="mini-actions">
          <button class="primary" @click="closeNotice">확인</button>
        </div>
      </div>
    </div>

    <!-- ✅ 삭제 확인 모달 -->
    <div v-if="confirmBox.open" class="mini-overlay">
      <div class="mini-dialog confirm">
        <div class="mini-msg" v-text="confirmBox.msg"></div>
        <div class="mini-actions">
          <button class="danger" @click="confirmBox.onOk && confirmBox.onOk()">
            삭제
          </button>
          <button class="ghost" @click="closeConfirm">취소</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* ===== 메인 모달 ===== */
.sch-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  box-sizing: border-box;
}
.sch-dialog {
  display: block;
  width: 480px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
}
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
}
.icon {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.label {
  width: 72px;
  color: #666;
  font-size: 14px;
}
input,
textarea,
select {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
input:focus,
textarea:focus,
select:focus {
  border-color: #3bbeff;
}
.select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #999 50%),
    linear-gradient(135deg, #999 50%, transparent 50%),
    linear-gradient(to right, transparent, transparent);
  background-position: calc(100% - 16px) calc(50% - 2px),
    calc(100% - 10px) calc(50% - 2px), 100% 0;
  background-size: 6px 6px, 6px 6px, 2.5em 2.5em;
  background-repeat: no-repeat;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 18px 16px;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  background: #fff;
  border-radius: 0 0 16px 16px;
}
button.primary {
  background: #3bbeff;
  border: none;
  color: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
}
button.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
button.ghost {
  background: #f5f5f5;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}
button.danger {
  background: #ff5252;
  border: none;
  color: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}

/* ===== 공용 미니 모달(알림/확인) ===== */
.mini-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  z-index: 2100;
  padding: 20px;
  box-sizing: border-box;
}
.mini-dialog {
  width: 360px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
  padding: 18px 18px 14px;
  text-align: center;
  max-width: 100%;
}
.mini-dialog.success .mini-msg {
  color: #1b5e20;
}
.mini-dialog.error .mini-msg {
  color: #c62828;
}
.mini-dialog.confirm .mini-msg {
  color: #333;
}
.mini-msg {
  white-space: pre-line;
  font-weight: 600;
  margin-bottom: 12px;
}
.mini-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* ========== 반응형 디자인 ========== */

/* 모바일 (768px 이하) */
@media (max-width: 768px) {
  .sch-overlay {
    padding: 10px;
    align-items: flex-start;
    padding-top: 30px;
  }

  .sch-dialog {
    width: 100%;
    border-radius: 12px;
    margin: 0;
  }

  .title {
    padding: 14px 16px;
    border-radius: 12px 12px 0 0;
  }

  .title strong {
    font-size: 16px;
  }

  .icon {
    font-size: 20px;
    padding: 4px;
  }

  .body {
    padding: 14px 16px;
    gap: 16px;
  }

  .row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .label {
    width: 100%;
    font-size: 15px;
    font-weight: 600;
    color: #444;
  }

  input,
  textarea,
  select {
    padding: 12px 14px;
    font-size: 16px; /* iOS에서 줌 방지 */
    border-radius: 8px;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .actions {
    padding: 14px 16px 16px;
    flex-direction: column-reverse;
    gap: 8px;
    border-radius: 0 0 12px 12px;
  }

  .actions button {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border-radius: 8px;
  }

  /* 미니 모달 */
  .mini-overlay {
    padding: 15px;
  }

  .mini-dialog {
    width: 100%;
    max-width: 320px;
    padding: 20px 16px 16px;
    border-radius: 12px;
  }

  .mini-msg {
    font-size: 15px;
    margin-bottom: 16px;
  }

  .mini-actions {
    flex-direction: column;
    gap: 8px;
  }

  .mini-actions button {
    width: 100%;
    padding: 12px 16px;
    font-size: 16px;
    border-radius: 8px;
  }
}

/* 태블릿 (768px 이상 1023px 이하) */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .sch-overlay {
    padding: 15px;
  }

  .sch-dialog {
    width: 90%;
    max-width: 520px;
    border-radius: 14px;
  }

  .title {
    padding: 15px 17px;
    border-radius: 14px 14px 0 0;
  }

  .title strong {
    font-size: 17px;
  }

  .body {
    padding: 15px 17px;
    gap: 14px;
  }

  .row {
    align-items: flex-start;
  }

  .label {
    width: 80px;
    font-size: 14.5px;
    margin-top: 10px;
  }

  input,
  textarea,
  select {
    padding: 11px 13px;
    font-size: 15px;
  }

  .actions {
    padding: 13px 17px 15px;
    border-radius: 0 0 14px 14px;
  }

  .actions button {
    padding: 9px 15px;
    font-size: 14px;
  }

  /* 미니 모달 */
  .mini-dialog {
    width: 90%;
    max-width: 380px;
    padding: 19px 17px 15px;
    border-radius: 13px;
  }

  .mini-msg {
    font-size: 15px;
  }

  .mini-actions button {
    padding: 9px 15px;
    font-size: 14px;
  }
}

/* 데스크톱 (1024px 이상) */
@media all and (min-width: 1024px) {
  .sch-overlay {
    padding: 20px;
  }

  .sch-dialog {
    width: 520px;
    border-radius: 18px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .sch-dialog:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  }

  .title {
    padding: 18px 20px;
    border-radius: 18px 18px 0 0;
  }

  .title strong {
    font-size: 18px;
  }

  .icon {
    transition: all 0.15s ease;
    border-radius: 4px;
  }

  .icon:hover {
    background: #f5f5f5;
    transform: scale(1.1);
  }

  .body {
    padding: 18px 20px;
    gap: 16px;
  }

  .row {
    transition: all 0.15s ease;
  }

  .row:hover .label {
    color: #333;
  }

  .label {
    width: 80px;
    font-size: 15px;
    transition: color 0.15s ease;
  }

  input,
  textarea,
  select {
    padding: 12px 14px;
    font-size: 15px;
    transition: all 0.15s ease;
  }

  input:hover,
  textarea:hover,
  select:hover {
    border-color: #bbb;
  }

  input:focus,
  textarea:focus,
  select:focus {
    box-shadow: 0 0 0 3px rgba(59, 190, 255, 0.1);
  }

  .actions {
    padding: 14px 20px 18px;
    border-radius: 0 0 18px 18px;
  }

  .actions button {
    padding: 10px 16px;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  button.primary:hover:not(:disabled) {
    background: #2da9e1;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 190, 255, 0.3);
  }

  button.ghost:hover {
    background: #ebebeb;
    transform: translateY(-1px);
  }

  button.danger:hover {
    background: #e64545;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
  }

  /* 미니 모달 */
  .mini-dialog {
    width: 400px;
    padding: 22px 20px 18px;
    border-radius: 16px;
    transition: transform 0.2s ease;
  }

  .mini-msg {
    font-size: 16px;
  }

  .mini-actions button {
    padding: 10px 18px;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .mini-actions button:hover {
    transform: translateY(-1px);
  }
}
</style>
