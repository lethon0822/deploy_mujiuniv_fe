<script setup>
import { confirmCode, renewalPwd, sendMail } from '@/services/emailService';
import { reactive } from 'vue';


const state = reactive({
  data: {
    email: '',
    authCode: '',
    renewalTap: false,
    renewalPwd: '',
    confirmPwd: '',
  },
});

async function sendCode() {
  try {
    const res = await sendMail({email: state.data.email});
    if (res && res.status === 200) {
      alert('성공');
    } else {
      //
    }
  } catch (err) {
    //
  }
}


async function submitCode() {
  if (!state.data.authCode) {
    return;
  }


  try {
    const res = await confirmCode({
      email: state.data.email,
      authCode: state.data.authCode,
    });
    if (res && res.status === 200) {
      alert("인증이 완료되었습니다. 새로운 비밀번호를 설정해주세요.");
      state.data.renewalTap = true;
    } else {
      // 메세지
    }
  } catch (err) {
    // 메세지
  }
}

const emit = defineEmits(["close"]);
const close = () => {
  emit("close");
};

async function renewal() {
  if (state.data.renewalPwd !== state.data.confirmPwd) {
    alert("두 비밀번호 일치 안한다")
    return;
  }
  const res = await renewalPwd({
    email: state.data.email,          
    password: state.data.renewalPwd,
  });


  if (res && res.status === 200) {
    alert("비밀번호가 변경되었습니다.");
    close();
    return;
  } else {
    alert("비밀번호 변경 실패")
  }
}

</script>


<template>
  <h2 class="title">비밀번호 변경</h2>
  <div class="container">
    <div
      class="py-4 d-flex flex-column gap-3"
      @submit.prevent="submit"
      v-if="state.data.renewalTap === false"
    >
      <label class="labels">이메일:</label>
      <div class="d-flex">
        <input
          type="email"
          class="form-control"
          placeholder="이메일을 입력해주세요."
          v-model="state.data.email"
          required
          인증번호
          요청
        />
      </div>
      <label class="labels">인증번호:</label>
      <div class="d-flex">
        <input
          type="text"
          class="form-control"
          placeholder="인증번호를 입력해주세요."
          v-model="state.data.authCode"
        />
        <button button="button" class="h6 btn py-3 mt-3 btn-primary auth" @click="sendCode">
          인증번호 요청
        </button>
      </div>
      <button button="button" class="w-100 h6 btn py-3 mt-3 btn-primary" @click="submitCode">
        제출
      </button>
    </div>

    <div class="showId mt-4" v-else>
      <label class="labels">새 비밀번호:</label>
      <div class="d-flex">
        <input
          type="text"
          class="form-control"
          v-model="state.data.renewalPwd"
          required
          인증번호
          요청
        />
      </div>
      <label class="labels">새 비밀번호 확인:</label>
      <div class="d-flex">
        <input
          type="password"
          class="form-control"
          v-model="state.data.confirmPwd"
          required
          인증번호
          요청
        />
      </div>
      <button type="button" class="w-100 h6 btn py-3 mt-3 btn-primary" @click="renewal" >
        확인
      </button>
    </div>
  </div>
</template>


<style scoped>
.container {
  max-width: 400px;
}
.title {
  text-align: center;
  margin: 50px 0 0px;
  font-weight: 600;
}
.labels {
  margin-left: 10px;
}
input {
  margin: 10px;
}
.email {
  width: 500px;
  padding: 20px;
}
.auth {
  display: flex;
  width: 220px;
  height: 40px;
  justify-content: center;
  align-items: center;
}
</style>