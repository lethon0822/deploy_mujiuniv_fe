<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue';
import WhiteBox from '@/components/common/WhiteBox.vue';
import YnModal from '@/components/common/YnModal.vue';
import { sendMail, confirmCode, renewalPwd } from '@/services/emailService';
import { getPrivacy, putPrivacy } from '@/services/privacyService';
import { useUserStore } from '@/stores/account';

const userStore = useUserStore();

const state = reactive({
  form: {
    loginId: '',
    userName: '',
    address: '',
    addDetail: '',
    postcode: '',
    phone: '',
    email: '',
    authCode: '',
    newPassword: '',
    confirmPassword: '',
    isVerified: false,
  },
  verifiedToken: null,

  showYnModal: false,
  ynModalMessage: '',
  ynModalType: 'info',

  showTimer: false,
});

onMounted(async () => {
  const res = await getPrivacy();
  console.log(res.data);
  Object.assign(state.form, res.data);
});

const canChangePw = computed(() => state.form.isVerified);

const showModal = (message, type = 'info') => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

function formatPhone(e) {
  let v = (e?.target?.value ?? state.form.phone)
    .replace(/\D/g, '')
    .slice(0, 11);
  if (v.length < 4) state.form.phone = v;
  else if (v.length < 8) state.form.phone = `${v.slice(0, 3)}-${v.slice(3)}`;
  else state.form.phone = `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
}

function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = '';
      let extraAddr = '';
      if (data.userSelectedType === 'R') {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === 'R') {
        if (data.bname !== '' && /(동|로|가)$/.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraAddr +=
            extraAddr !== '' ? ', ' + data.buildingName : data.buildingName;
        }
        if (extraAddr !== '') {
          extraAddr = ' (' + extraAddr + ')';
        }
      }

      state.form.postcode = data.zonecode;
      state.form.address = addr + extraAddr;

      setTimeout(() => {
        document.getElementById('sample6_detailAddress')?.focus();
      }, 0);
    },
  }).open();
}

async function saveProfile() {
  const res = putPrivacy(state.form);
  console.log(res);
  showModal('저장되었습니다.', 'success');
}

async function sendCode() {
  showModal('인증번호를 발송하는 중입니다. 잠시만 기다려주세요.', 'warning');

  if (!state.form.email) {
    console.log('나 여깃다');
    return;
  }
  try {
    const res = await sendMail({ email: state.form.email });
    if (res && res.status === 200) {
      startTimer();
      showModal('등록된 이메일로 인증번호가 전송되었습니다.', 'success');
    } else {
      showModal('인증번호 발송에 실패했습니다.\n다시 시도해주세요.', 'error');
      console.log('여깃음');
    }
  } catch (err) {
    showModal('인증번호 발송에 실패했습니다.\n다시 시도해주세요.', 'error');
    console.log('아니임 여기임');
  }
}

async function verifyCode() {
  if (!/^\d{6}$/.test(state.form.authCode)) {
    showModal('6자리 숫자를 입력하세요.', 'error');
    return;
  }

  try {
    const res = await confirmCode({
      email: state.form.email,
      authCode: state.form.authCode,
    });
    if (res && res.status === 200) {
      showModal(
        '인증이 완료되었습니다. \n 변경할 비밀번호를 입력해주세요.',
        'success'
      );
      console.log('인증 성공');
      state.form.isVerified = true;
      state.showTimer = false;
    } else {
      showModal(
        '인증에 실패하였습니다. \n 인증번호를 잘 확인해주세요.',
        'error'
      );
      console.log('인증 실패');
    }
  } catch (err) {
    showModal('인증에 실패하였습니다. \n 잠시 후에 실행해주세요.', 'error');
    console.log('인증 실패22');
  }
}

async function changePasswordClick() {
  if (
    !canChangePw.value &&
    state.form.newPassword !== state.form.confirmPassword
  ) {
    return;
  }
  try {
    const res = await renewalPwd({
      email: state.form.email,
      password: state.form.newPassword,
    });
    if (res && res.status === 200) {
      showModal('비밀번호가 변경되었습니다.', 'success');

      state.form.newPassword = '';
      state.form.confirmPassword = '';
      state.form.authCode = '';
      state.form.isVerified = false;
      state.verifiedToken = null;
    } else {
      showModal('비밀번호를 다시 확인해주세요.', 'error');
    }
  } catch (err) {
    console.error(err);
    showModal('비밀번호 변경 중 오류가 발생했습니다.', 'error');
  }
}

watch(
  () => state.form.email,
  () => {
    state.form.isVerified = false;
    state.verifiedToken = null;
  }
);
watch(
  () => state.form.authCode,
  () => {
    state.form.isVerified = false;
    state.verifiedToken = null;
  }
);

const time = ref();
let intervalId = null;

const formatTime = (totalSecond) => {
  let minute = Math.floor(totalSecond / 60);
  let second = totalSecond % 60;

  if (minute < 0 && second < 0) {
    minute = 0;
    second = 0;
  }
  const minuteText = minute >= 10 ? minute : `0${minute}`;
  const secondText = second >= 10 ? second : `0${second}`;
  return `${minuteText}:${secondText}`;
};

const startTimer = async () => {
  state.showTimer = true;
  clearInterval(intervalId);
  time.value = 3 * 60;
  intervalId = setInterval(async () => {
    if (time.value > 0) {
      time.value--;
    } else {
      clearInterval(intervalId);
      state.showTimer = false;
    }
  }, 1000);
};
</script>

<template>
  <div class="container">
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
    />
    <div class="header-card">
      <h1>개인정보변경</h1>
      <p>개인정보를 수정할 수 있으며, 저장 후 변경사항이 반영됩니다.</p>
    </div>

    <!-- 상단: 학번 / 이름 -->
    <WhiteBox class="wb">
      <div class="section-title">본인정보</div>
      <div class="grid-2">
        <div class="form-item">
          <label>{{
            userStore.state.signedUser.userRole === 'student' ? '학번' : '사번'
          }}</label>
          <input class="input" v-model="state.form.loginId" readonly />
        </div>
        <div class="form-item">
          <label>이름</label>
          <input class="input" v-model="state.form.userName" readonly />
        </div>
      </div>
    </WhiteBox>

    <!-- 본인정보 -->
    <WhiteBox class="wb wb--accent">
      <div class="section-title">주소</div>

      <div class="grid-2">
        <div class="form-item postcode-item" style="margin-bottom: 25px">
          <label>우편번호</label>
          <div class="hstack">
            <input
              class="input postcode-input"
              v-model="state.form.postcode"
              readonly
            />
            <button class="btn btn-primary" @click="sample6_execDaumPostcode">
              <i class="bi bi-search"></i>주소찾기
            </button>
          </div>
        </div>
      </div>

      <div class="grid-2">
        <div class="form-item">
          <label>주소</label>
          <input class="input" v-model="state.form.address" readonly />
        </div>
        <div class="form-item">
          <label>상세주소</label>
          <input
            id="sample6_detailAddress"
            class="input"
            v-model="state.form.addDetail"
          />
        </div>
      </div>

      <div class="grid-2" style="margin-top: 25px">
        <div class="form-item">
          <label>전화번호</label>
          <input
            class="input"
            v-model="state.form.phone"
            @input="formatPhone"
          />
        </div>
        <div class="form-item">
          <label>Email</label>
          <input class="input" v-model="state.form.email" />
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-success btn--main-action" @click="saveProfile">
          저장
        </button>
      </div>
    </WhiteBox>

    <!-- 비밀번호 변경 -->
    <WhiteBox class="wb">
      <div class="section-title">비밀번호 변경</div>
      <div style="color: #bbb">
        비밀번호 변경을 위한 위한 인증번호는 등록된 이메일로 전송됩니다.
      </div>
      <div class="grid-4">
        <div class="form-item">
          <label>인증번호</label>
          <input
            type="text"
            class="input"
            v-model="state.form.authCode"
            placeholder="인증번호 입력"
            inputmode="numeric"
            maxlength="6"
          />

          <span class="me-1 time" v-if="state.showTimer">{{
            formatTime(time)
          }}</span>
        </div>
        <div class="form-item" style="display: flex; align-items: flex-end">
          <button
            type="button"
            class="btn btn-primary"
            @click="sendCode"
            style="width: 100%"
          >
            인증번호 발송
          </button>
        </div>
        <div
          class="form-item verify-wrapper"
          style="display: flex; align-items: flex-end"
        >
          <button
            class="btn btn-primary verify-code-btn"
            :disabled="!/^\d{6}$/.test(state.form.authCode)"
            @click="verifyCode"
          >
            인증번호 확인
          </button>
        </div>
      </div>

      <div style="color: #bbb">
        비밀번호는 8자 이상 20자 이하, 숫자와 알파벳 등으로 구성되어야 합니다.
      </div>
      <div class="grid-2">
        <div class="form-item">
          <label>신규 비밀번호</label>
          <input
            type="password"
            class="input"
            v-model="state.form.newPassword"
            placeholder="비밀번호"
          />
        </div>
        <div class="form-item">
          <label>신규 비밀번호 확인</label>
          <input
            type="password"
            class="input"
            v-model="state.form.confirmPassword"
            placeholder="비밀번호 확인"
          />
        </div>
      </div>

      <div class="actions">
        <button
          class="btn btn-success btn--main-action"
          :disabled="!canChangePw"
          @click="changePasswordClick"
        >
          비밀번호 변경
        </button>
      </div>
    </WhiteBox>
  </div>
</template>

<style scoped>
.input,
input[type='text'],
input[type='number'],
input[type='search'] {
  -webkit-appearance: none;
  appearance: none;
}

.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 50px;
  box-sizing: border-box;
}

.header-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
}

.header-card h1 {
  font-size: 22px;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 8px;
}

.header-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
}

.white-box {
  min-height: auto;
}
.wb {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 24px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

/* 섹션 헤더 */
.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6eef7;
}

/* 폼 레이아웃 */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 25px;
  gap: 10px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  margin-bottom: 25px;
  gap: 10px;
}

.col-2 {
  grid-column: span 2;
}

.form-item label {
  display: block;
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}

.hstack {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input {
  width: 100%;
  padding: 12px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f7f8f9;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px; /* 아이콘과 텍스트 간격 */
}

.btn--main-action {
  line-height: 1.2;
  width: 100%;
  max-width: 200px;
}

.btn-success {
  background-color: #5ba666;
  color: #fff;
  border: none;
  height: 44px;
  min-width: 120px;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-success:hover {
  background-color: #4a8955;
}

.btn-success:active {
  background-color: #3e7548;
}

.btn-primary {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  height: 44px;
  min-width: 120px;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2a5c74;
}

.btn-primary:active {
  background-color: #204658;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 35px;
}

/* 모바일 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 12px;
  }

  .header-card {
    padding: 14px;
    margin-bottom: 14px;
  }

  .header-card h1 {
    font-size: 18px;
  }

  .header-card p {
    font-size: 12px;
  }

  .grid-2 {
    grid-template-columns: 1fr;
  }

  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .verify-wrapper {
    grid-column: 1 / -1;
  }

  .verify-code-btn {
    width: 100%;
  }

  .form-item.postcode-item {
    grid-column: span 2;
  }

  .form-item.postcode-item .hstack > input.postcode-input {
    flex-grow: 1;
    min-width: 0;
  }

  .form-item.postcode-item .hstack > button {
    flex-shrink: 0;
    width: auto;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 100%;
    min-height: auto;
    max-width: 1550px;
    padding: 16px 10px;
    overflow: hidden;
  }

  .header-card {
    padding: 20px;
    margin-bottom: 20px;
  }

  .header-card h1 {
    font-size: 21px;
  }
  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }

  .verify-code-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    grid-column: 1 / -1;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 30px;
  }

  .header-card {
    padding: 24px 24px 8px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(3, 1fr);
  }

  .verify-code-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    grid-column: 1 / -1;
  }
}
</style>
