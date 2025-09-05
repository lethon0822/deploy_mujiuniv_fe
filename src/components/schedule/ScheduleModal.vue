<script setup>
import { ref, watch, computed } from 'vue';
import { createSchedule, updateSchedule, deleteSchedule } from '@/services/scheduleService';
import { TYPE_ORDER } from '@/constants/scheduleTypes';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editItem: { type: Object, default: null },
  defaultSemesterId: { type: Number, required: true },
  pickedDate: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue', 'saved']);

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const form = ref({
  scheduleId: null,
  semesterId: props.defaultSemesterId,
  scheduleType: '',   // 드롭다운
  startDate: '',
  endDate: '',
  description: '',
});

/* 로딩/알림/확인 */
const isSaving = ref(false);
const notice = ref({ open: false, type: 'success', msg: '' });
let afterNotice = null; // 알림 닫힌 뒤 실행할 콜백

const confirmBox = ref({ open: false, msg: '', onOk: null });

function openNotice(msg, type = 'success', after = null) {
  notice.value = { open: true, type, msg };
  afterNotice = after;
}
function closeNotice() {
  notice.value.open = false;
  if (afterNotice) afterNotice();
  afterNotice = null;
}
function openConfirm(msg, onOk) {
  confirmBox.value = { open: true, msg, onOk };
}
function closeConfirm() {
  confirmBox.value.open = false;
  confirmBox.value.onOk = null;
}

watch(
  () => props.editItem,
  (v) => {
    if (v) {
      form.value = {
        scheduleId: v.id,
        semesterId: v.semesterId,
        scheduleType: v.scheduleType,
        startDate: v.startDate,
        endDate: v.endDate,
        description: v.description ?? '',
      };
    } else {
      form.value = {
        scheduleId: null,
        semesterId: props.defaultSemesterId,
        scheduleType: TYPE_ORDER[0] || '',  // 기본값
        startDate: props.pickedDate || '',
        endDate: props.pickedDate || '',
        description: '',
      };
    }
  },
  { immediate: true }
);

const close = () => (visible.value = false);

/* 기본 유효성 검사 */
function validate() {
  if (!form.value.scheduleType) return '일정명을 선택해 주세요.';
  if (!TYPE_ORDER.includes(form.value.scheduleType)) return '유효하지 않은 일정명입니다.';
  if (!form.value.startDate || !form.value.endDate) return '시작일과 종료일을 입력해 주세요.';
  if (new Date(form.value.startDate) > new Date(form.value.endDate)) return '종료일은 시작일 이후여야 합니다.';
  return '';
}

const save = async () => {
  const err = validate();
  if (err) {
    openNotice(err, 'error');
    return;
  }
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    if (form.value.scheduleId) {
      await updateSchedule(form.value);
      openNotice('일정이 수정되었습니다.', 'success', () => {
        emit('saved'); close();
      });
    } else {
      await createSchedule(form.value);
      openNotice('일정이 등록되었습니다.', 'success', () => {
        emit('saved'); close();
      });
    }
  } catch (e) {
    openNotice('처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.', 'error');
  } finally {
    isSaving.value = false;
  }
};

const removeItem = async () => {
  if (!form.value.scheduleId) return;
  openConfirm('정말 삭제할까요?', async () => {
    closeConfirm();
    if (isSaving.value) return;
    isSaving.value = true;
    try {
      await deleteSchedule(form.value.scheduleId);
      openNotice('일정이 삭제되었습니다.', 'success', () => {
        emit('saved'); close();
      });
    } catch (e) {
      openNotice('삭제 중 오류가 발생했습니다.', 'error');
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
          <strong>{{ form.scheduleId ? '일정 수정' : '새 일정 추가' }}</strong>
          <button class="icon" @click="close" aria-label="닫기">✕</button>
        </div>

        <div class="body">
          <!-- 일정명 드롭다운 -->
          <label class="row">
            <span class="label">일정명</span>
            <select v-model="form.scheduleType" class="select">
              <option disabled value="">선택</option>
              <option v-for="t in TYPE_ORDER" :key="t" :value="t">{{ t }}</option>
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
            <textarea v-model="form.description" rows="3" placeholder="선택 사항"></textarea>
          </label>
        </div>

        <div class="actions">
          <button class="primary" :disabled="isSaving" @click="save">
            {{ form.scheduleId ? '저장' : '추가' }}
          </button>
          <button class="ghost" :disabled="isSaving" @click="close">취소</button>
          <button v-if="form.scheduleId" class="danger" :disabled="isSaving" @click="removeItem">삭제</button>
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
          <button class="danger" @click="confirmBox.onOk && confirmBox.onOk()">삭제</button>
          <button class="ghost" @click="closeConfirm">취소</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
/* ===== 메인 모달 ===== */
.sch-overlay{
  position:fixed; inset:0; background:rgba(0,0,0,.5);
  display:flex; align-items:center; justify-content:center;
  z-index:2000;
}
.sch-dialog{
  display:block;
  width:480px; background:#fff; border-radius:16px;
  box-shadow:0 10px 30px rgba(0,0,0,.15);
}
.title{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid #eee}
.icon{background:transparent;border:none;font-size:18px;cursor:pointer}
.body{padding:16px 18px;display:flex;flex-direction:column;gap:12px}
.row{display:flex;align-items:center;gap:12px}
.label{width:72px;color:#666;font-size:14px}
input, textarea, select{
  flex:1;border:1px solid #ddd;border-radius:10px;padding:10px 12px;font-size:14px;outline:none;background:#fff;
}
input:focus, textarea:focus, select:focus{border-color:#3BBEFF}
.select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,#999 50%),linear-gradient(135deg,#999 50%,transparent 50%),linear-gradient(to right,transparent,transparent);
  background-position: calc(100% - 16px) calc(50% - 2px), calc(100% - 10px) calc(50% - 2px), 100% 0;
  background-size:6px 6px,6px 6px,2.5em 2.5em; background-repeat:no-repeat;}
.actions{display:flex;justify-content:flex-end;gap:10px;padding:12px 18px 16px;border-top:1px solid #eee}
button.primary{background:#3BBEFF;border:none;color:#fff;border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:600}
button.primary:disabled{opacity:.6; cursor:not-allowed}
button.ghost{background:#f5f5f5;border:none;border-radius:10px;padding:8px 14px;cursor:pointer}
button.danger{background:#ff5252;border:none;color:#fff;border-radius:10px;padding:8px 14px;cursor:pointer}

/* ===== 공용 미니 모달(알림/확인) ===== */
.mini-overlay{
  position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.25); z-index:2100;
}
.mini-dialog{
  width:360px; background:#fff; border-radius:14px; box-shadow:0 10px 28px rgba(0,0,0,.2);
  padding:18px 18px 14px; text-align:center;
}
.mini-dialog.success .mini-msg{ color:#1b5e20 }
.mini-dialog.error .mini-msg{ color:#c62828 }
.mini-dialog.confirm .mini-msg{ color:#333 }
.mini-msg{ white-space:pre-line; font-weight:600; margin-bottom:12px; }
.mini-actions{ display:flex; gap:10px; justify-content:center; }
</style>