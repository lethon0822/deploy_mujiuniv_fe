<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "@/stores/account";
import { graduationDiagnoses } from "@/services/graduationService";

const isLoading = ref(false);
const isDone = ref(false);

const state = reactive({
  graduation: {
    majorRequiredCredits: 0,
    majorElectiveCredits: 0,
    generalRequiredCredits: 0,
    generalElectiveCredits: 0,
    shortageMajorRequiredCredits: 0,
    shortageMajorElectiveCredits: 0,
    shortageGeneralRequiredCredits: 0,
    shortageGeneralElectiveCredits: 0,
    totalCompletedCredits: 0,
    totalShortageCredits: 0,
    graduationResult: "",
    details:
      "본 자가진단은 시뮬레이션 이수 학점을 기준으로 졸업 요건 충족 여부를 판단합니다.\n" +
      "전공필수, 전공선택, 교양필수, 교양선택, 총이수학점을 기준으로 자동 계산됩니다.\n" +
      "※ 실제 졸업 승인 여부는 소속 학과 및 행정실 확인을 통해 최종 결정됩니다.",
  },
});

const userStore = useUserStore();
const semesterId = userStore.state.signedUser?.semesterId;

async function startSimulation() {
  isLoading.value = true;

  try {
    const [res] = await Promise.all([
      graduationDiagnoses(semesterId),
      new Promise((resolve) => setTimeout(resolve, 700)),
    ]);
    state.graduation = res.data.result;
    console.log(state.graduation);
    isDone.value = true;
  } catch (err) {
    console.error("시뮬레이션 오류:", err);
  } finally {
    isLoading.value = false;
  }
  // 테스트용
  // state.graduation.generalElectiveCredits = 100;
  // state.graduation.shortageGeneralElectiveCredits = 0;
  // state.graduation.graduationResult='졸업 요건 달성';
  // state.graduation.details='축하합니다. 졸업 요건을 모두 충족하였습니다.';
}

// 카드 설정 배열
const cardConfig = [
  {
    label: "전공필수",
    earned: "majorRequiredCredits",
    shortage: "shortageMajorRequiredCredits",
    total: 36,
    delay: 0,
  },
  {
    label: "전공선택",
    earned: "majorElectiveCredits",
    shortage: "shortageMajorElectiveCredits",
    total: 34,
    delay: 0,
  },
  {
    label: "교양필수",
    earned: "generalRequiredCredits",
    shortage: "shortageGeneralRequiredCredits",
    total: 15,
    delay: 0,
  },
  {
    label: "교양선택",
    earned: "generalElectiveCredits",
    shortage: "shortageGeneralElectiveCredits",
    total: 15,
    delay: 0,
  },
];
</script>

<template>
  <div class="container">
    <!-- 상단 헤더 -->
    <div class="header-card">
      <h1>졸업 자가진단</h1>
      <p class="desc">
        이수 현황을 확인하고 졸업 가능 여부를 간편하게 체크해보세요.
      </p>

      <button
        class="btn-green"
        @click="startSimulation"
        :disabled="isLoading || isDone"
      >
        <span v-if="isLoading" class="loader"></span>
        {{ isLoading ? "분석중..." : isDone ? "분석완료" : "시뮬레이션 시작" }}
      </button>
    </div>

    <!-- 졸업 요건 현황 -->
    <div class="section-box">
      <h3 class="section-title">졸업 요건 현황</h3>

      <!-- 카드 반복 -->
      <div class="grid-responsive">
        <div class="stat-card" v-for="c in cardConfig" :key="c.label">
          <div class="card-header">
            <p class="stat-label">{{ c.label }}</p>
            <span
              class="badge"
              :class="{
                complete: isDone && state.graduation[c.shortage] === 0,
                danger: isDone && state.graduation[c.shortage] > 0,
              }"
            >
              {{
                isDone
                  ? state.graduation[c.shortage] > 0
                    ? ((state.graduation[c.earned] / c.total) * 100).toFixed(
                        1
                      ) + "%"
                    : "완료"
                  : ""
              }}
            </span>
          </div>

          <!-- 프로그레스바 -->
          <div class="progress" :class="{ 'no-shimmer': isDone }">
            <div
              class="progress-bar"
              :class="{
                complete: isDone && state.graduation[c.earned] >= c.total,
              }"
              :style="{
                width: isDone
                  ? (state.graduation[c.earned] / c.total) * 100 + '%'
                  : '0%',
                transition: `width ${(
                  state.graduation[c.earned] / c.total
                ).toFixed(3)}s ease`,
              }"
            ></div>
          </div>

          <!-- 하단 -->
          <div class="stat-row">
            <p class="stat-desc">
              {{ isDone ? state.graduation[c.earned] : "ㅡ" }} /
              {{ isDone ? c.total : "ㅡ" }}학점
            </p>
            <p
              class="status"
              :class="{
                danger: isDone && state.graduation[c.shortage] > 0,
                ok: isDone && state.graduation[c.shortage] === 0,
              }"
            >
              {{
                isDone
                  ? state.graduation[c.shortage] > 0
                    ? state.graduation[c.shortage] + "학점 부족"
                    : "달성 완료"
                  : "분석 전"
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- 전체 졸업요건 달성률 -->
      <div class="progress-container">
        <h4 class="progress-title">전체 졸업요건 달성률</h4>
        <div class="progress total-progress" :class="{ 'no-shimmer': isDone }">
          <div
            class="progress-bar total-progress-bar"
            :style="{
              width: (state.graduation.totalCompletedCredits / 130) * 100 + '%',
            }"
          ></div>
        </div>
        <div class="progress-text" v-if="isDone">
          {{ state.graduation.totalCompletedCredits }} / 130학점
        </div>
        <div class="progress-text" v-else>분석 전</div>
      </div>

      <!-- 결과 메시지 -->
      <div v-if="isDone">
        <div
          v-if="state.graduation.graduationResult === '졸업 요건 달성'"
          class="alert-success"
        >
          <div class="ad-result">{{ state.graduation.graduationResult }}</div>
          {{ state.graduation.details }}
        </div>
        <div v-else class="alert-danger">
          <div class="ad-result">
            <i
              class="bi bi-exclamation-triangle-fill"
              style="margin-right: 8px; color: #b91c1c"
            ></i>
            {{ state.graduation.graduationResult }}
          </div>
          {{ state.graduation.details }}
        </div>
      </div>
      <div v-else class="alert-danger">
        {{ state.graduation.details }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 30px;
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

.section-box {
  background: #fff;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 25px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 40px 0;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #9ae59b, #5edfd3);
  border-radius: 2px;
}

.desc {
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
  margin: 0;
}

/* 버튼 & 로딩 */
.btn-green {
  background: #5ba666;
  height: 44px;
  min-width: 120px;
  font-size: 14px;
  color: white;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

.btn-green:hover:not(:disabled) {
  background: #4a8955;
}

.btn-green:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #198754;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 반응형 카드 그리드 */
.grid-responsive {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, 1fr);
}

/* 카드 하나 */
.stat-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 160px;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* 카드 상단 (제목 + 뱃지) */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-label {
  font-weight: 600;
  font-size: 15px;
  margin: 0;
}

.badge {
  font-size: 12px;
  font-weight: 600;
  border-radius: 15px;
  padding: 4px 8px;
  white-space: nowrap;
}

.badge.complete {
  background: #ccf5d0;
  color: #166534;
}

.badge.danger {
  background: #ffe5b4;
  color: #b91c1c;
}

/* 프로그레스 바 */
.progress {
  background: #e2e8f0;
  border-radius: 10px;
  height: 10px;
  margin: 16px 0;
  overflow: hidden;
  position: relative;
}

.progress::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0.3) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress.no-shimmer::after {
  display: none !important;
}

.progress-bar {
  background: linear-gradient(90deg, #febe3a, #ff8c00);
  height: 100%;
  transition: width 0.8s ease;
}

.progress-bar.complete {
  background: linear-gradient(90deg, #71d17a, #198754);
  height: 100%;
  transition: width 5s ease, background 1s ease;
}

/* 카드 하단 (설명 + 상태) */
.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.stat-desc {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  margin: 0;
}

.status {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.status.ok {
  color: #198754;
}

.status.danger {
  color: #dc3545;
}

.status.pending {
  color: #6c757d;
}

/* 전체 진행률 */
.progress-container {
  margin: 40px 0 30px;
}

.progress-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
}

.progress.total-progress {
  height: 14px;
  border-radius: 7px;
  background-color: #e5e7eb;
}

.total-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #febe3a, #ff8c00);
  transition: width 0.8s ease;
}

.progress-text {
  margin-top: 6px;
  font-size: 12px;
  color: #374151;
  text-align: center;
}

/* 결과 메시지 */
.alert-success {
  margin-top: 20px;
  padding: 12px;
  background: #dcfce7;
  color: #166534;
  border: 1px solid #16a34a;
  border-radius: 6px;
  font-size: 15px;
  text-align: center;
  white-space: pre-line;
}
.alert-danger {
  margin-top: 20px;
  padding: 12px;
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  font-size: 15px;
  text-align: center;
  white-space: pre-line;
}
.ad-result {
  margin: 10px;
  font-size: 30px;
  font-weight: 700;
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

  .section-box {
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 16px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 30px;
  }

  .desc {
    font-size: 13px;
  }

  .btn-green {
    width: 100%;
    padding: 12px;
    font-size: 15px;
  }

  .grid-responsive {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-card {
    min-height: 120px;
    padding: 15px;
  }

  .stat-label {
    font-size: 14px;
  }

  .badge {
    font-size: 11px;
    padding: 3px 6px;
  }

  .progress {
    height: 8px;
    margin: 6px 0;
  }

  .stat-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 8px;
  }

  .stat-desc {
    font-size: 12px;
  }

  .status {
    font-size: 12px;
  }

  .progress-container {
    margin: 30px 0 15px;
  }

  .progress-title {
    font-size: 15px;
  }

  .progress.total-progress {
    height: 12px;
    border-radius: 6px;
  }

  .progress-text {
    font-size: 11px;
  }

  .ad-result {
    font-size: 20px;
    margin: 5px 0;
  }

  .alert-success,
  .alert-danger {
    text-align: left;
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

  .section-box {
    padding: 30px;
    margin-bottom: 30px;
    border-radius: 18px;
  }

  .section-title {
    font-size: 26px;
    margin-bottom: 35px;
  }

  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .btn-green {
    width: 100%;
    padding: 12px;
    font-size: 15px;
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
    padding: 24px;
    margin-bottom: 24px;
  }

  .header-card h1 {
    font-size: 22px;
  }

  .section-box {
    padding: 30px;
    margin-bottom: 30px;
  }
}
</style>
