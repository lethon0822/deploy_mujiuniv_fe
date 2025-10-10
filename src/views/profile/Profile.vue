<script setup>
import {
  ref,
  reactive,
  onMounted,
  watch,
  computed,
  nextTick,
  onUnmounted,
} from "vue";
import Chart from "chart.js/auto";
import YnModal from "@/components/common/YnModal.vue";
import {
  deleteProfilePic,
  getUserProfile,
  patchProfilePic,
} from "@/services/Profile";
import { useUserStore } from "@/stores/account";
import { useAuthenticationStore } from "@/stores/authentication";
import { getMyGpa } from "@/services/GradeService";
import ProfessorWorkBoard from "@/components/profile/ProfessorWorkBoard.vue";

const userStore = useUserStore();
const authenticationStore = useAuthenticationStore();
const props = defineProps({
  profile: {
    type: Object,
    default: () => ({}),
  },
});

const totalCredit = ref(0);
const totalGpa = ref(0);
const totalMajorGpa = ref(0);
const progressRate = computed(() => {
  return Math.round((totalCredit.value / 130) * 100);
});

const progressPercent = progressRate;

// 통신 데이터 저장
const state = reactive({
  profile: {
    loginId: "",
    userName: "",
    deptName: "",
    status: "",
    birthDate: "",
    email: "",
    postcode: "",
    address: "",
    addDetail: "",
    phone: "",
    grade: 0,
    entDate: "",
    semester: 0,
    hireDate: "",
    userPic: "",
  },
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

// 이미지 관련 상태
const selectedImage = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);
const currentProfileImage = ref(null); // 세션 저장용 프로필 이미지

// 그래프 데이터
const chartRef = ref(null);
let chartInstance = null;

//그래프 데이터
const chartData = {
  labels: ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"],
  datasets: [
    {
      label: "전체평점",
      data: [],
      borderColor: "#A3C1E1",
      backgroundColor: "rgba(255, 154, 162, 0.1)",
      fill: false,
      tension: 0,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#A3C1E1",
      pointBorderColor: "#FFFFFF",
      pointBorderWidth: 2,
      borderWidth: 3,
    },
    {
      label: "전공평점",
      data: [],
      borderColor: "#A8D5BA",
      backgroundColor: "rgba(181, 234, 215, 0.1)",
      fill: false,
      tension: 0,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: "#A8D5BA",
      pointBorderColor: "#FFFFFF",
      pointBorderWidth: 2,
      borderWidth: 3,
      hidden: true,
    },
    // { //   label: "취득학점", //   data: [], //   borderColor: "transparent", //   backgroundColor: "rgba(199, 206, 219, 0.1)", //   fill: false, //   tension: 0, //   pointRadius: 0, //   pointHoverRadius: 0, //   pointBackgroundColor: "#F3B57A", //   pointBorderColor: "#FFFFFF", //   pointBorderWidth: 2, //   borderWidth: 3, //   yAxisID: "y1", // },
  ],
};

// 그래프 모양
const createChart = () => {
  if (chartRef.value) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    chartInstance = new Chart(chartRef.value, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },

          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#2D3748",
            bodyColor: "#4A5568",
            borderColor: "#E2E8F0",
            borderWidth: 1,
            cornerRadius: 6,
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.parsed.y}점`;
              },
            },
          },
        },
        scales: {
          x: {
            offset: true,
            grid: {
              display: false,
            },
            ticks: {
              color: "#718096",
              font: {
                size: 11,
              },
            },
          },
          y: {
            position: "left",
            beginAtZero: true,
            min: -0.5,
            max: 5,
            grid: {
              display: false,
            },
            ticks: {
              stepSize: 0.5,
              color: "#718096",
              font: {
                size: 11,
              },
              callback: function (value) {
                if (value < 0) {
                  return "";
                }

                if (value > 4.5) {
                  return "";
                }
                return value.toFixed(1);
              },
            },
          },
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
            borderWidth: 2,
          },
          line: {
            borderWidth: 2,
            tension: 0,
          },
        },
      },
    });
  }
};

const initializeCustomLegend = () => {
  const legendTabs = document.querySelectorAll(".custom-legend .legend-tab");

  legendTabs.forEach((tab) => {
    const index = parseInt(tab.getAttribute("data-dataset-index"));
    const isActive = index === 0; // 0번 데이터셋이 기본 활성화

    if (isActive) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }

    tab.addEventListener("click", (e) => {
      const clickedTab = e.currentTarget;
      const index = parseInt(clickedTab.getAttribute("data-dataset-index"));

      if (!chartInstance) return;

      chartInstance.data.datasets.forEach((dataset, i) => {
        chartInstance.setDatasetVisibility(i, false);
      });
      chartInstance.setDatasetVisibility(index, true);
      chartInstance.update();

      legendTabs.forEach((t) => t.classList.remove("active"));
      clickedTab.classList.add("active");
    });
  });
};

const baseUrl = import.meta.env.VITE_BASE_URL;
let imgUrl = "";

onMounted(async () => {
  const res = await getUserProfile();
  state.profile = res.data.result;

  imgUrl = `${baseUrl}/mujiuniv/user/profile/${userStore.state.signedUser.userId}/${state.profile.userPic}`;
  loadUserProfileImage();

  const resGpa = await getMyGpa();
  const gpaData = resGpa.data.result;

  totalCredit.value = gpaData.reduce(
    (sum, item) => sum + Number(item.totalCredit),
    0
  );

  totalGpa.value = gpaData.reduce((sum, item) => sum + Number(item.gpa), 0);
  totalMajorGpa.value = gpaData.reduce(
    (sum, item) => sum + Number(item.majorGpa),
    0
  );

  const labels = chartData.labels;
  totalGpa.value = (totalGpa.value / gpaData.length).toFixed(2);
  totalMajorGpa.value = (totalMajorGpa.value / gpaData.length).toFixed(2);

  const gpaArr = Array(labels.length).fill(null);
  const majorArr = Array(labels.length).fill(null);
  const creditArr = Array(labels.length).fill(null);

  gpaData.forEach((item, idx) => {
    if (idx < labels.length) {
      gpaArr[idx] = item.gpa;
      majorArr[idx] = item.majorGpa;
      creditArr[idx] = item.totalCredit;
    }
  });

  chartData.datasets[0].data = gpaArr;
  chartData.datasets[1].data = majorArr;

  nextTick(() => {
    createChart();
    initializeCustomLegend();
  });
});

const loadUserProfileImage = () => {
  if (imgUrl) {
    currentProfileImage.value = imgUrl;
  } else {
    console.log("기본 아이콘");
  }
};

// 컴포넌트 언마운트 시 차트 정리
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

watch(
  () => props.profile.loginId,
  (newLoginId) => {
    if (newLoginId) {
      selectedImage.value = null;
      imagePreview.value = null;
      currentProfileImage.value = null;

      loadUserProfileImage();
    }
  }
);

// 이미지 선택 처리
const handleImageSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // 파일 크기 체크
    if (file.size > 5 * 1024 * 1024) {
      showModal("파일 크기는 5MB 이하여야 합니다.", "error");
      return;
    } // 파일 형식 체크

    if (!file.type.startsWith("image/")) {
      showModal("이미지 파일만 업로드 가능합니다.", "error");
      return;
    }

    selectedImage.value = file; // 미리보기 생성

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// 카메라 아이콘 클릭시 파일 선택창 열기
const openFileDialog = () => {
  fileInput.value.click();
};

// 이미지 제거
const removeImage = async () => {
  const res = await deleteProfilePic();
  if (res.status === 200) {
    selectedImage.value = null;
    imagePreview.value = null;
    fileInput.value.value = "";
    authenticationStore.setSigndUserPic(
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjBGMEYwIi8+CjxjaXJjbGUgY3g9IjYwIiBjeT09IjQwIiByPSIxNiIgZmlsbD0iIzZDNzU3RCIvPgo8cGF0aCBkPSJNMzAgODBDMzAgNzEuMTYzNCA0NC41MzY2IDY0IDYwIDY0Qzc1LjQ2MzQgNjQgOTAgNzEuMTYzNCA5MCA4MFYxMDBIMzBWODBaIiBmaWxsPSIjNkM3NTdEIi8+Cjwvc3ZnPg=="
    );
  } // // 세션에서도 제거 // const sessionKey = `profileImage_${props.profile.loginId}`; // sessionStorage.removeItem(sessionKey); // currentProfileImage.value = null;
};

// 포트폴리오용 프로필 저장
const updateProfile = async () => {
  try {
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // 이미지가 선택되었다면 세션에 저장
    if (!selectedImage.value || !imagePreview.value) {
      console.log("저장할 이미지가 없음");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("loginId", props.profile.loginId);
    formDataToSend.append("pic", selectedImage.value);

    const res = await patchProfilePic(formDataToSend);
    if (res.status == 200) {
      showModal("사진이 성공적으로 업데이트 되었습니다.", "success");
      state.profile.userPic = res.data.result.userPic;
    } // const response = await fetch("/api/profile/update", { //   method: "POST", //   headers: { //     "Content-Type": "application/json", //     Authorization: `Bearer ${localStorage.getItem("authToken")}`, //   }, //   body: JSON.stringify(formDataToSend), // }); // if (response.ok || true) { //   alert( //     "프로필이 성공적으로 업데이트되었습니다.\n(이미지는 세션 동안만 유지됩니다)" //   ); //   // 임시 미리보기 상태 초기화 //   selectedImage.value = null; //   imagePreview.value = null; // }
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    showModal("프로필 업데이트 중 오류가 발생했습니다.", "error");
  }
};

/* 탭 */
const activeTab = ref("기본프로필");

const tabs = [
  { id: "기본프로필", label: "기본프로필", icon: "bi-person-fill" },
  { id: "개인정보", label: "개인정보", icon: "bi-clipboard-check" },
];

const currentData = computed(() => {
  // return profileData[activeTab.value] || {};
  return {};
});

const setActiveTab = (tabId) => {
  activeTab.value = tabId;
};

const STATUS = computed(() => [
  { value: "", label: "상태: 전체" },
  { value: "0", label: isStudent.value ? "휴학" : "휴직" },
  { value: "1", label: isStudent.value ? "재학" : "재직" },
  { value: "2", label: isStudent.value ? "졸업" : "퇴직" },
]);
const getStatusLabel = (status) => {
  const found = STATUS.value.find((s) => s.value === status);
  return found ? found.label : "-";
};

const isStudent = computed(
  () => userStore.state.signedUser.userRole === "student"
);

const isProfessor = computed(
  () => userStore.state.signedUser.userRole === "professor"
);
</script>

<template>
  <YnModal
    v-if="state.showYnModal"
    :content="state.ynModalMessage"
    :type="state.ynModalType"
    @close="state.showYnModal = false"
  />

  <div class="profile-wrapper">
    <div class="left-panel">
      <div class="profile-image-section">
        <div class="avatar-wrapper">
          <div class="avatar">
            <img
              v-if="imagePreview || currentProfileImage"
              :src="imagePreview || currentProfileImage"
              alt="프로필 이미지"
              class="profile-img"
            />
            <svg v-else class="avatar-icon" fill="#6c757d" viewBox="0 0 24 24">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </div>
          <div class="camera-icon" @click="openFileDialog">
            <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
              <path
                d="M12 15.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"
              />
            </svg>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleImageSelect"
            style="display: none"
          />
        </div>
      </div>

      <div class="image-action-buttons" v-if="selectedImage">
        <button class="btn btn-success" @click="updateProfile">저장</button>
        <button class="btn btn-secondary" @click="removeImage">
          이미지 제거
        </button>
      </div>

      <div class="tab-navigation">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="right-panel">
      <div class="tab-content">
        <div v-if="activeTab === '기본프로필'">
          <div class="content-grid">
            <div class="field-group full-width">
              <label class="field-label">이름</label>
              <div class="field-value boxed-value">
                {{ state.profile.userName }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">{{
                userStore.state.signedUser.userRole === "student"
                  ? "학번"
                  : "사번"
              }}</label>
              <div class="field-value boxed-value">
                {{ state.profile.loginId }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">학과</label>
              <div class="field-value boxed-value">
                {{ state.profile.deptName }}
              </div>
            </div>
            <template v-if="userStore.state.signedUser.userRole === 'student'">
              <div class="field-group">
                <label class="field-label">학년</label>
                <div class="field-value boxed-value">
                  {{ state.profile.grade }}
                </div>
              </div>
              <div class="field-group">
                <label class="field-label">학기</label>
                <div class="field-value boxed-value">
                  {{ state.profile.semester }}
                </div>
              </div>
            </template>
            <div class="field-group">
              <label class="field-label">{{
                userStore.state.signedUser.userRole === "student"
                  ? "등록일자"
                  : "고용일자"
              }}</label>
              <div class="field-value boxed-value">
                {{
                  userStore.state.signedUser.userRole === "student"
                    ? state.profile.entDate
                    : state.profile.hireDate
                }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">{{
                userStore.state.signedUser.userRole === "student"
                  ? "학적상태"
                  : "재직상태"
              }}</label>
              <div class="field-value boxed-value">
                {{ getStatusLabel(state.profile.status) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeTab === '개인정보'">
          <div class="content-grid">
            <div class="field-group">
              <label class="field-label">생년월일</label>
              <div class="field-value boxed-value">
                {{ state.profile.birthDate }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">연락처</label>
              <div class="field-value boxed-value">
                {{ state.profile.phone }}
              </div>
            </div>
            <div class="field-group">
              <label class="field-label">이메일</label>
              <div class="field-value boxed-value">
                {{ state.profile.email }}
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">우편번호</label>
              <div class="field-value boxed-value">
                {{ state.profile.postcode }}
              </div>
            </div>
            <div class="field-group full-width">
              <label class="field-label">주소</label>
              <div class="field-value boxed-value">
                {{ state.profile.address }}
              </div>
            </div>
            <div class="field-group full-width">
              <label class="field-label">상세주소</label>
              <div class="field-value boxed-value">
                {{ state.profile.addDetail }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bin">
    <h2>　</h2>
  </div>

  <template v-if="userStore.state.signedUser.userRole === 'student'">
    <div class="progress-container">
      <h2
        style="
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 12px;
          font-weight: bold;
        "
      >
        전체 졸업 달성률
      </h2>
      <div class="progress">
        <div
          class="progress-bar"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
      <div style="text-align: center; margin-top: -8px">
        <span style="font-size: 12px; color: #718096">
          {{ totalCredit }} / 130 학점
        </span>
        <span style="font-size: 12px; color: #4a5568">
          ( {{ progressRate }} % 달성 )
        </span>
      </div>
    </div>

    <div class="graph">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        "
      >
        <h2
          style="font-size: 14px; color: #4a5568; font-weight: bold; margin: 0"
        >
          학년별 평점 현황
        </h2>
        <span
          class="gpa-info"
          style="font-size: 12px; color: #4a5568; font-weight: 500"
        >
          누적 평점 <span style="color: #e63946">{{ totalGpa }}</span> · 전공
          평점 <span style="color: #e63946">{{ totalMajorGpa }}</span>
        </span>
      </div>

      <div class="chart-container">
        <div class="custom-legend">
          <button class="legend-tab active" data-dataset-index="0">
            전체평점
          </button>
          <button class="legend-tab" data-dataset-index="1">전공평점</button>
        </div>

        <canvas ref="chartRef"></canvas>
      </div>

      <div class="chart-container" style="height: 300px">
        <canvas ref="chartRef"></canvas>
      </div>
    </div>
  </template>

  <!-- 교수용: 업무 게시판 -->
  <template v-if="isProfessor">
    <div class="professor-board-wrapper">
      <ProfessorWorkBoard />
    </div>
  </template>
</template>

<style scoped lang="scss">
.profile-wrapper {
  display: flex;
  margin: 40px auto 0 auto;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  max-width: 1000px;
}

.professor-board-wrapper {
  max-width: 1000px;
  margin: 20px auto;
}

.left-panel {
  flex-shrink: 0;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0 0 0;
  background-color: #f5f5f5;
  border-radius: 8px 0 0 8px;
}

.right-panel {
  flex-grow: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
}

.profile-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.avatar-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  overflow: hidden;
}

.avatar-icon {
  width: 80px;
  height: 80px;
  fill: #6c757d;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.camera-icon {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 40px;
  height: 40px;
  background-color: #6c757d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #545b62;
  }
  svg {
    width: 20px;
    height: 20px;
  }
}

.image-action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tab-navigation {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tab-button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  padding: 12px 24px;
  text-align: left;
}

.tab-button:hover {
  background-color: #f0f0f0;
}

.tab-button.active {
  color: #00664f;
  background-color: #e9f5e8;
  border-left: 3px solid #00664f;
}

.tab-button:not(.active) {
  color: #6b7280;
}

.tab-content {
  padding: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px 15px;
}

.field-group {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
}

.field-value {
  color: #1f2937;
}

.full-width {
  grid-column: span 2;
}

.boxed-value {
  border: 1px solid #e5e7eb;
  padding: 5px 15px;
  border-radius: 8px;
  background-color: #f9fafb;
}

.progress-container,
.graph {
  max-width: 900px;
  margin: 20px auto;
  padding: 16px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress {
  height: 10px;
  background-color: #e2e8f0;
  border-radius: 6px;
  margin-bottom: 18px;
  overflow: hidden;
}

.progress-bar {
  background: linear-gradient(90deg, #febe3a 0%, #ffd964 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
  height: 100%;
}

.bin {
  display: none;
}

//그래프 탭
.custom-legend {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: -150px;
  position: relative;
  z-index: 100;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.legend-tab {
  cursor: pointer;
  background-color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  white-space: nowrap;

  /* 🔽 탭 기본 상태 (비활성화)는 연한 회색 테두리 */
  border: 1px solid #e2e8f0;
  color: #4a5568;
}

.legend-tab::before {
  content: "•";
  font-size: 18px;
  margin-right: 4px;
  margin-top: 1px;
  line-height: 1;
  /* 🔽 아이콘 기본 상태 (비활성화)도 연한 회색으로 통일 */
  color: #c0ccda;
}

/* 3. 활성화된 탭 공통 스타일: 배경 흰색 유지, 테두리만 변경 */
.legend-tab.active {
  background-color: white !important;
  color: #2d3748;
  font-weight: 600;
}
.legend-tab.active::before {
  content: "•";
  margin-right: 4px;
}

/* 4. 전체평점 (0) 활성화: 파란색 테두리와 점 */
.legend-tab[data-dataset-index="0"].active {
  border-color: #a3c1e1;
}
.legend-tab[data-dataset-index="0"].active::before {
  color: #a3c1e1;
}

/* 5. 전공평점 (1) 활성화: 녹색 테두리와 점 */
.legend-tab[data-dataset-index="1"].active {
  border-color: #a8d5ba;
}
.legend-tab[data-dataset-index="1"].active::before {
  color: #a8d5ba;
}
/* 모바일 */
@media (max-width: 767px) {
  .profile-wrapper {
    flex-direction: column;
    margin: 15px;
  }

  .left-panel {
    width: 100%;
    border-radius: 8px 8px 0 0;
    border-right: none;
    padding: 20px 0;
  }

  .right-panel {
    border-radius: 0 0 8px 8px;
  }

  .tab-navigation {
    flex-direction: row;
    overflow-x: auto;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }

  .tab-button {
    flex: 1;
    justify-content: center;
    font-size: 13px;
    padding: 10px;
    white-space: nowrap;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .full-width {
    grid-column: span 1;
  }

  .avatar-wrapper {
    width: 120px;
    height: 120px;
  }

  .camera-icon {
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .progress-container,
  .graph {
    margin: 16px 12px;
    padding: 12px;
  }
}

/* 태블릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .profile-wrapper {
    flex-direction: row;
    margin: 30px auto;
    max-width: 95%;
  }

  .left-panel {
    width: 250px;
    border-radius: 8px 0 0 8px;
    border-right: 1px solid #e5e7eb;
    padding: 20px 0 0 0;
  }

  .right-panel {
    border-radius: 0 8px 8px 0;
  }

  .tab-navigation {
    flex-direction: column;
    justify-content: flex-start;
  }

  .tab-button.active {
    border-left: 3px solid #00664f;
  }

  .tab-button:not(.active) {
    border-left: none;
  }

  .content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px 15px;
  }

  .full-width {
    grid-column: span 2;
  }

  .progress-container,
  .graph {
    max-width: 95%;
    margin: 20px auto 30px auto;
    padding: 16px;
  }
}

/* PC */
@media (min-width: 1024px) {
  .profile-wrapper {
    flex-direction: row;
  }

  .left-panel {
    width: 250px;
    border-radius: 8px 0 0 8px;
    border-right: 1px solid #e5e7eb;
    padding: 20px 0 0 0;
  }

  .right-panel {
    border-radius: 0 8px 8px 0;
  }

  .tab-navigation {
    flex-direction: column;
    justify-content: flex-start;
  }
  .tab-button.active {
    border-left: 3px solid #00664f;
  }
  .tab-button:not(.active) {
    border-left: none;
  }

  .content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px 15px;
  }

  .full-width {
    grid-column: span 2;
  }

  .image-action-buttons {
    flex-direction: row;
    width: auto;
  }

  .progress-container,
  .graph {
    max-width: 1000px;
  }
}
</style>
