<script setup>
import { reactive, computed, watch, onMounted } from "vue";
import WhiteBox from "@/components/common/WhiteBox.vue";
import { sendMail, confirmCode } from "@/services/emailService";
import { getPrivacy, putPrivacy } from "@/services/privacyService";

const state = reactive({
  form: {
    loginId: "",
    userName: "",
    address: "",
    addDetail: "",
    phone: "",
    email: "",

    authCode: "",
    newPassword: "",
    confirmPassword: "",
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
    .replace(/\D/g, "")
    .slice(0, 11);
  if (v.length < 4) state.form.phone = v;
  else if (v.length < 8) state.form.phone = `${v.slice(0, 3)}-${v.slice(3)}`;
  else state.form.phone = `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
}

function sample6_execDaumPostcode() {
  new daum.Postcode({
    oncomplete: function (data) {
      let addr = ""; // 주소
      let extraAddr = ""; // 참고항목

      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }

      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /(동|로|가)$/.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
      }

      // ✅ Vue state에 직접 반영
      state.form.zipcode = data.zonecode;
      state.form.address = addr + extraAddr;
      // 상세주소 입력칸에 포커스
      setTimeout(() => {
        document.getElementById("sample6_detailAddress")?.focus();
      }, 0);
    },
  }).open();
}

async function saveProfile() {
  const res = putPrivacy(state.form);
  console.log(res);
  alert("저장되었습니다.");
}

/** ✅ 이메일로 코드 발송 */
async function sendCode() {
  if (!state.data.email) return;
  try {
    const res = await sendMail({ email: state.form.email });
    if (res && res.status === 200) {
      alert("등록된 이메일로 인증번호가 전송되었습니다.");
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
    alert("6자리 숫자를 입력하세요.");
    return;
  }

  try {
    const res = await confirmCode({
      email: state.form.email,
      authCode: state.form.authCode,
    });
    if (res && res.status === 200) {
      alert("인증 성공");
      // 인증 성공 후 추가 동작 가능
      state.form.isVerified = true;
    } else {
      alert("인증 실패");
      // 메세지
    }
  } catch (err) {
    alert("인증 실패22");
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
    const res = await renewalPwd({
      email: state.form.email,
      password: state.form.newPassword,
    });
    if (res && res.status === 200) {
      alert("비밀번호가 변경되었습니다.");
      // 필요하면 폼 초기화
      state.form.newPassword = "";
      state.form.confirmPassword = "";
      state.form.authCode = "";
      state.form.isVerified = false;
      state.verifiedToken = null;
    } else {
      alert("비밀번호 변경에 실패했습니다.");
    }
  } catch (err) {
    console.error(err);
    alert("비밀번호 변경 중 오류가 발생했습니다.");
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
  <div class="container">
    <div class="header-card">
      <h1>개인정보변경</h1>
      <p>개인정보를 수정할 수 있으며, 저장 후 변경사항이 반영됩니다.</p>
    </div>

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

      <div class="grid-3">
        <div class="form-item">
          <label>우편번호</label>
          <div class="hstack">
            <input
              class="input zipcode-input"
              v-model="state.form.zipcode"
              readonly
            />
            <button
              class="btn btn-outline-secondary"
              @click="sample6_execDaumPostcode"
            >
              주소찾기
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
        <button class="btn btn-success" @click="saveProfile">저장</button>
      </div>
    </WhiteBox>

    <!-- 비밀번호 변경 -->
    <WhiteBox class="wb">
      <div class="section-title">비밀번호 변경</div>

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

      <div class="actions" style="margin-top: 35px">
        <button
          class="btn btn-success"
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
input[type="text"],
input[type="number"],
input[type="search"] {
  -webkit-appearance: none;
  appearance: none;
}

/* --- 컨테이너 & 헤더 카드 --- */
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
  margin: 0 0 16px 0;
  line-height: 1.4;
}

/* WhiteBox 공통 + 변형 */
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

/* Bootstrap 버튼 스타일 오버라이드로 기존 디자인 유지 */
.btn {
  border: 0;
  cursor: pointer;
  padding: 12px 14px !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  transition: transform 0.05s ease, filter 0.15s !important;
  white-space: nowrap;
  line-height: 1.2 !important;
}

.btn:active {
  transform: translateY(1px) !important;
}

.btn-success {
  background-color: #2f855a !important;
  border-color: #2f855a !important;
  color: #fff !important;
  padding: 12px 30px !important;
}

.btn-success:hover {
  background-color: #276749 !important;
  border-color: #276749 !important;
}

.btn-success:disabled {
  filter: grayscale(0.4) !important;
  cursor: not-allowed !important;
  background-color: #2f855a !important;
  border-color: #2f855a !important;
}

.btn-primary {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
  color: #fff !important;
}

.btn-primary:hover {
  background-color: #1d4ed8 !important;
  border-color: #1d4ed8 !important;
}

.btn-primary:disabled {
  filter: grayscale(0.4) !important;
  cursor: not-allowed !important;
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

/* Bootstrap outline 버튼 */
.btn-outline-secondary {
  background-color: #fff !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
}

.btn-outline-secondary:hover {
  background-color: #f8f9fa !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

/* 액션 영역: 가운데 정렬 */
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

  .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .verify-wrapper {
    grid-column: 1 / -1; /* ✅ 전체 너비 차지 */
  }

  .verify-code-btn {
    width: 100%; /* 버튼 너비도 전체로 */
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 95%;
    max-width: 960px;
    margin: 0 auto;
    padding: 16px;
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
    grid-column: 1 / -1; /* 전체 칼럼 너비 차지 */
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .container {
    max-width: 1500px;
    margin: 0 auto;
    padding: 20px 24px 24px 50px;
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
    grid-column: 1 / -1; /* 전체 칼럼 너비 차지 */
  }
}
</style>
