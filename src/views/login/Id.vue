<script setup>
import { reactive } from "vue";
import { findId } from "@/services/accountService";

const state = reactive({
  form: {
    email: "",
    phone: "",
  },
  data: {
    name: "",
    loginId: "",
  },
});
function formatPhone(event) {
  let digits = event.target.value.replace(/\D/g, ""); // 숫자만 추출

  if (digits.length > 11) digits = digits.slice(0, 11); // 11자리까지만

  let formatted = "";
  if (digits.length >= 11) {
    formatted = digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (digits.length >= 7) {
    formatted = digits.replace(/(\d{3})(\d{3,4})(\d{0,4})/, "$1-$2-$3");
  } else if (digits.length >= 4) {
    formatted = digits.replace(/(\d{3})(\d{0,4})/, "$1-$2");
  } else {
    formatted = digits;
  }

  state.form.phone = formatted;
}

const submit = async () => {
  try {
    const res = await findId(state.form);

    // 데이터가 없거나 loginId가 비어있으면 경고창 표시
    if (!res.data || !res.data.loginId) {
      alert("일치하는 회원 정보가 없습니다.");
      state.data = { userName: "", loginId: "" }; // 결과 초기화
    } else {
      state.data = res.data;
    }
  } catch (error) {
    alert("오류가 발생했습니다. 다시 시도해주세요.");
    console.error(error);
  }
};
</script>

<template>
  <h2 class="title">아이디 찾기</h2>
  <div class="findId">
    <div class="container">
      <!-- 결과 없을 때만 입력 폼 표시 -->
      <form
        class="py-4 d-flex flex-column gap-3"
        @submit.prevent="submit"
        v-if="!state.data.loginId"
      >
        <div>
          이메일:
          <input
            type="email"
            class="form-control"
            v-model="state.form.email"
            placeholder="이메일을 입력해 주세요."
            required
          />
        </div>
        <div>
          핸드폰:
          <input
            type="text"
            class="form-control"
            v-model="state.form.phone"
            @input="formatPhone"
            maxlength="13"
            placeholder="휴대폰 번호를 입력해 주세요."
            required
          />
        </div>
        <button class="w-100 h6 btn py-3 mt-3 btn-primary">조회</button>
      </form>

      <!-- 결과 있을 때만 결과 표시 -->
      <div class="showId mt-4" v-if="state.data.loginId">
        <p class="alert alert-success text-center">
          🔐 찾은 아이디<br />
          <strong>이름: {{ state.data.userName }}</strong><br />
          <strong>아이디: {{ state.data.loginId }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 예시 스타일 */
.findId {
  max-width: 400px;
  margin: auto;
}
.title {
  text-align: center;
  margin: 20px 0 0px;
  font-weight: 600;
}
.showId {
  display: flex;
  justify-content: center;
}
.showId {
  display: flex;
  justify-content: center;
}

.alert-success {
  font-size: 1rem;
  padding: 1rem;
  border-radius: 8px;
}
</style>
