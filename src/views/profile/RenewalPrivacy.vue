<script setup>
import { reactive, computed, watch, onMounted } from 'vue';
import WhiteBox from '@/components/common/WhiteBox.vue';
import { sendMail, confirmCode } from '@/services/emailService';
import { getPrivacy, putPrivacy, putPwd } from '@/services/privacyService';

const state = reactive({
  form: {
    loginId: '',
    userName: '',
    address: '',
    addDetail: '',
    phone: '',
    email: '',

    authCode: '',
    newPassword: '',
    confirmPassword: '',
    isVerified: false, // ✅ 인증 성공 플래그
  },
  verifiedToken: null, // ✅ 서버가 주는 1회용 토큰
});

onMounted(async () => {
  const res = await getPrivacy();
  Object.assign(state.form, res.data);
});

const canChangePw = computed(() => state.form.isVerified);

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
      let addr = ''; // 주소
      let extraAddr = ''; // 참고항목

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

      // ✅ Vue state에 직접 반영
      state.form.zipcode = data.zonecode;
      state.form.address = addr + extraAddr;
      // 상세주소 입력칸에 포커스
      setTimeout(() => {
        document.getElementById('sample6_detailAddress')?.focus();
      }, 0);
    },
  }).open();
}

async function saveProfile() {
  const res = putPrivacy(state.form);
  console.log(res);
  alert('저장되었습니다.');
}

/** ✅ 이메일로 코드 발송 */
async function sendCode() {
  if (!state.data.email) return;
  try {
    const res = await sendMail({ email: state.form.email });
    if (res && res.status === 200) {
      alert('등록된 이메일로 인증번호가 전송되었습니다.');
    } else {
      //
    }
  } catch (err) {
    //
  }
}

/** ✅ 코드 검증 → verifiedToken 수령 */
async function verifyCode() {
  if (!/^\d{6}$/.test(state.form.authCode)) {
    alert('6자리 숫자를 입력하세요.');
    return;
  }

  try {
    const res = await confirmCode({
      email: state.form.email,
      authCode: state.form.authCode,
    });
    if (res && res.status === 200) {
      alert('인증 성공');
      // 인증 성공 후 추가 동작 가능
      state.form.isVerified = true;
    } else {
      alert('인증 실패');
      // 메세지
    }
  } catch (err) {
    alert('인증 실패22');
    // 메세지
  }
}

/** ✅ 비번 변경 (서버에 verifiedToken 제출) */
async function changePasswordClick() {
  if (
    !canChangePw.value &&
    state.form.newPassword !== state.form.confirmPassword
  ) {
    return;
  }
  try {
    const res = await putPwd({
      email: state.form.email,
      password: state.form.newPassword,
    });
    if (res && res.status === 200) {
      alert('비밀번호가 변경되었습니다.');
      // 필요하면 폼 초기화
      state.form.newPassword = '';
      state.form.confirmPassword = '';
      state.form.authCode = '';
      state.form.isVerified = false;
      state.verifiedToken = null;
    } else {
      alert('비밀번호 변경에 실패했습니다.');
    }
  } catch (err) {
    console.error(err);
    alert('비밀번호 변경 중 오류가 발생했습니다.');
  }
}

/** 이메일/코드 변경 시 재인증 요구 */
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
</script>

<template>
  <div class="page">
    <h1 class="page-title">개인정보변경</h1>

    <!-- 상단: 학번 / 이름 -->
    <WhiteBox class="wb">
      <div class="grid-2">
        <div class="form-item">
          <label>학번</label>
          <input class="input" v-model="state.form.loginId" />
        </div>
        <div class="form-item">
          <label>이름</label>
          <input class="input" v-model="state.form.userName" />
        </div>
      </div>
    </WhiteBox>

    <!-- 본인정보 -->
    <WhiteBox class="wb wb--accent">
      <div class="section-title">본인정보</div>

      <div class="grid-2">
        <div class="form-item">
          <label>우편번호</label>
          <div class="hstack">
            <input class="input" v-model="state.form.zipcode" readonly />
            <button class="btn btn-outline" @click="sample6_execDaumPostcode">
              주소찾기
            </button>
          </div>
        </div>

        <div class="form-item col-2">
          <label>주소</label>
          <input class="input" v-model="state.form.address" readonly />
        </div>

        <div class="form-item col-2">
          <label>상세주소</label>
          <input
            id="sample6_detailAddress"
            class="input"
            v-model="state.form.addDetail"
          />
        </div>

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
        <button class="btn btn-primary" @click="saveProfile">저장</button>
      </div>
    </WhiteBox>

    <!-- 비밀번호 변경 -->
    <WhiteBox class="wb">
      <div class="section-title">비밀번호 변경</div>

      <div class="grid-2">
        <div class="form-item col-2">
          <label>인증번호</label>
          <div class="hstack hstack-auth">
            <input
              type="text"
              class="input input-auth"
              v-model="state.form.authCode"
              placeholder="인증번호 입력"
              inputmode="numeric"
              maxlength="6"
            />
            <button type="button" class="btn btn-blue" @click="sendCode">
              인증번호 발송
            </button>
            <button
              class="btn btn-blue"
              :disabled="!/^\d{6}$/.test(state.form.authCode)"
              @click="verifyCode"
            >
              인증번호 확인
            </button>
          </div>
        </div>

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
          class="btn btn-primary"
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
/* 브라우저 기본 외형 제거 (특히 사파리/크롬) */
.input,
input[type='text'],
input[type='number'],
input[type='search'] {
  -webkit-appearance: none;
  appearance: none;
}

/* 인증번호 줄: 세 칸을 균등 분배 (인풋/버튼 모두 같은 폭) */
.hstack-auth .input-auth,
.hstack-auth .btn {
  flex: 0 0 140px;
}

/* 인풋 높이 강제 통일 (버튼과 정확히 같게 하고 싶으면 btn 패딩과 맞춤) */
.input-auth {
  height: 40px; /* 버튼과 동일 높이로 맞춤 */
  line-height: 40px;
}
/* 페이지 */
.page {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px 0px 24px 5px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 8px 0 16px 28px;
}

/* WhiteBox 공통 + 변형 */
.white-box {
  min-height: auto;
}
.wb {
  background: #fff;
  border-radius: 10px;
  padding: 22px 24px;
  margin-bottom: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
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
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
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
  gap: 8px;
  align-items: center;
}
.spacer {
  display: block;
}

/* 인풋/버튼 통일 스타일 */
.input {
  width: 100%;
  padding: 10px 12px;
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

/* 버튼 */
.btn {
  border: 0;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.05s ease, filter 0.15s;
  white-space: nowrap;
}
.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background: #2f855a;
  color: #fff;
} /* 그린 */
.btn-primary:disabled {
  filter: grayscale(0.4);
  cursor: not-allowed;
}
.btn-blue {
  background: #2563eb;
  color: #fff;
} /* 파랑 */
.btn-outline {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}

/* 액션 영역: 가운데 정렬 */
.actions {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

/* 반응형 보완 */
@media (max-width: 920px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
  .col-2 {
    grid-column: span 1;
  }
}
</style>
