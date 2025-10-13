<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/account";
import YnModal from "@/components/common/YnModal.vue";
import ConfirmModal from "@/components/common/Confirm.vue";
import { postNotice, searchNotice, searchNoticeTitleAndContent, 
        getNoticeDetail, updateNotice, deleteNotice } from "@/services/NoticeService";

//전체 공지사항 데이터
// const allNotices = ref([
//   {
//     id: 1,
//     title: "2025년 시스템 정기 점검 안내",
//     date: "2025-07-28",
//     isImportant: true,
//     content:
//       "안정적인 서비스 제공을 위해 시스템 정기 점검을 실시합니다.\n\n점검 일시: 2025년 8월 1일 02:00 ~ 06:00 (4시간)\n점검 내용:\n- 서버 안정성 개선\n- 보안 패치 적용\n- 데이터베이스 최적화\n\n점검 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.\n이용에 불편을 드려 죄송합니다.",
//     views: 245,
//     author: "관리자",
//   },
//   {
//     id: 2,
//     title: "새로운 기능 업데이트 - 다크모드 지원",
//     date: "2025-07-27",
//     isImportant: false,
//     content:
//       "사용자 편의성 향상을 위해 다크모드 기능이 추가되었습니다.\n\n주요 변경사항:\n- 다크모드/라이트모드 전환 가능\n- 사용자 설정에 따른 자동 테마 적용\n- 모든 페이지에서 일관된 디자인 제공\n\n설정 > 화면 설정에서 변경하실 수 있습니다.",
//     views: 189,
//     author: "개발팀",
//   },
//   {
//     id: 3,
//     title: "[중요] 개인정보 처리방침 변경 안내",
//     date: "2025-07-25",
//     isImportant: true,
//     content:
//       "개인정보 보호법 개정에 따른 처리방침 변경사항을 안내드립니다.\n\n주요 변경사항:\n- 개인정보 수집 및 이용 목적 명확화\n- 개인정보 보유 및 이용기간 조정\n- 개인정보 처리 위탁 관련 사항 추가\n\n자세한 내용은 개인정보 처리방침 페이지를 확인해주세요.",
//     views: 567,
//     author: "법무팀",
//   },
//   {
//     id: 4,
//     title: "서비스 이용약관 개정 안내",
//     date: "2025-07-20",
//     isImportant: false,
//     content:
//       "서비스 품질 향상을 위한 이용약관 일부 개정 사항입니다.\n\n개정 내용:\n- 서비스 이용 범위 명확화\n- 사용자 의무사항 추가\n- 서비스 중단 관련 조항 개선\n\n개정된 약관은 2025년 8월 1일부터 적용됩니다.",
//     views: 123,
//     author: "운영팀",
//   },
//   {
//     id: 5,
//     title: "고객센터 운영시간 변경 안내",
//     date: "2025-07-18",
//     isImportant: false,
//     content:
//       "고객센터 운영시간이 변경되오니 참고 부탁드립니다.\n\n변경 전: 평일 09:00 ~ 18:00\n변경 후: 평일 09:00 ~ 19:00, 토요일 10:00 ~ 16:00\n\n일요일 및 공휴일은 휴무입니다.\n긴급 문의는 온라인 채팅을 이용해주세요.",
//     views: 89,
//     author: "고객지원팀",
//   },
//   {
//     id: 6,
//     title: "[긴급] 보안 업데이트 완료 안내",
//     date: "2025-07-15",
//     isImportant: true,
//     content: "보안 취약점 패치를 위한 긴급 업데이트가 완료되었습니다.",
//     views: 432,
//     author: "관리자",
//   },
//   {
//     id: 7,
//     title: "여름휴가 기간 고객지원 안내",
//     date: "2025-07-10",
//     isImportant: false,
//     content: "여름휴가 기간 중 고객지원 운영 일정을 안내드립니다.",
//     views: 156,
//     author: "고객지원팀",
//   },
//   {
//     id: 8,
//     title: "서버 성능 개선 작업 완료",
//     date: "2025-07-08",
//     isImportant: false,
//     content: "서버 성능 개선을 통해 더욱 빠른 서비스를 제공합니다.",
//     views: 203,
//     author: "개발팀",
//   },
//   {
//     id: 9,
//     title: "[알림] 비밀번호 보안 강화 권장사항",
//     date: "2025-07-05",
//     isImportant: true,
//     content: "계정 보안 강화를 위한 비밀번호 변경을 권장합니다.",
//     views: 378,
//     author: "보안팀",
//   },
//   {
//     id: 10,
//     title: "모바일 앱 버전 업데이트 안내",
//     date: "2025-07-01",
//     isImportant: false,
//     content: "모바일 앱의 새로운 버전이 출시되었습니다.",
//     views: 291,
//     author: "개발팀",
//   },
// ]);

const allNotices = ref([]); // 초기값 빈 배열

// 전체 공지 불러오기
const loadNotices = async () => {
  const res = await searchNotice({});
  if (res.status) {
    allNotices.value = res.data;
  } 
};

// const loadNotices = async () => {
//   try {
//     const res = await searchNotice({}); // axios GET 호출
//     if (res && res.data) {
//       // 배열 안 객체를 reactive로 감싸서 반응형 보장
//       allNotices.value = res.data.map(n => reactive({ ...n }));
//     } else {
//       allNotices.value = [];
//     }
//   } catch (err) {
//     console.error("공지 불러오기 실패:", err);
//     allNotices.value = [];
//   }
// };

// onMounted(() => {
//   loadNotices(); // 화면 로딩 시 자동 불러오기
// });

// 상태 관리
const searchKeyword = ref("");
const filterType = ref("all");
const activeTab = ref("all"); // 학생/교수용 탭
const currentPage = ref(1);
const selectedNotice = ref(null); //선택된 공지
const isWriteModalOpen = ref(false);
const editMode = ref(false);
const showConfirm = ref(false);
const confirmCallback = ref(null);
const nextId = ref(11);

const form = reactive({
  data: reactive({
    title: "",
    content: "",
    isImportant: false,
    author: "관리자",
  }),
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 사용자 권한 확인
const isStaffUser = computed(
  () => userStore.state.signedUser?.userRole === "staff"
);

const state = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
  showConfirmModal: false,
  confirmMessage: "",
  confirmCallback: null,
});

const showModal = (message, type = "info") => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const closeConfirm = () => {
  showConfirm.value = false;
};

// 한 페이지에 보여줄 아이템 수 (5개로 설정)
const itemsPerPage = 5;

// 필터링된 공지사항
const filteredNotices = computed(() => {
  return allNotices.value.filter((notice) => {
    // 검색 키워드 필터링 (교직원만)
    const matchesKeyword = isStaffUser.value
      ? !searchKeyword.value.trim() ||
        notice.title
          .toLowerCase()
          .includes(searchKeyword.value.toLowerCase()) ||
        notice.content.toLowerCase().includes(searchKeyword.value.toLowerCase())
      : true;

    // 타입 필터링
    const currentFilter = isStaffUser.value
      ? filterType.value
      : activeTab.value;
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "important" && notice.isImportant) ||
      (currentFilter === "normal" && !notice.isImportant);

    return matchesKeyword && matchesFilter;
  });
});

// 페이지네이션
const totalPages = computed(() =>
  Math.ceil(filteredNotices.value.length / itemsPerPage)
);
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredNotices.value.slice(start, end);
});

// 공지사항 상세보기
const NoticeDetail = (page) => {
  router.push(`/notice/${page}`);
};

//글쓰기 모달
// const openWriteModal = () => {
//   form.value = { title: "", content: "", isImportant: false, author: "관리자" };
//   editMode.value = false;
//   isWriteModalOpen.value = true;
// };
const openWriteModal = () => {
  form.title = "";
  form.content = "";
  form.isImportant = false;
  form.author = "관리자";
  editMode.value = false;
  isWriteModalOpen.value = true;
};

const closeWriteModal = () => {
  isWriteModalOpen.value = false;
  form.value = { title: "", content: "", isImportant: false, author: "관리자" };
};

// 수정 모달
const openEditModal = (notice) => {
  form.value = { ...notice };
  selectedNotice.value = notice;
  editMode.value = true;
  isWriteModalOpen.value = true;
};

// 저장
// const saveNotice =  async() => {
//   if (!form.data.title.trim() || !form.data.content.trim()) {
//     showModal("제목과 내용을 입력해주세요.", "error");
//     return;
//   }

//   if (editMode.value) {
//     allNotices.value = allNotices.value.map((n) =>
//       n.id === selectedNotice.value.id ? { ...n, ...form.value } : n
//     );
//     showModal("수정 완료", "success");
//   } else {
//     const res = await postNotice(form.data)
//     allNotices.value = [res.data, ...allNotices.value];
//     console.log(" sgjsje",allNotices.value);

//     nextId.value++;
//     showModal("작성 완료", "success");
//   }
//   closeWriteModal();
// };

const saveNotice = async () => {
  if (!form.data.title.trim() || !form.data.content.trim()) {
    showModal("제목과 내용을 입력해주세요.", "error");
    return;
  }

  if (editMode.value) {
    // 수정 모드
    allNotices.value = allNotices.value.map((n) =>
      n.id === selectedNotice.value.id ? { ...n, ...form.data } : n
    );
    showModal("수정 완료", "success");
  } else {
    // 새 공지 등록
    const res = await postNotice(form.data); // form.data 그대로 사용
    if (res && res.data) {
      allNotices.value = [res.data, ...allNotices.value]; // 화면 즉시 반영
      nextId.value++;
      showModal("작성 완료", "success");
    }
  }

  closeWriteModal();
};

// const saveNotice = async () => {
//   if (!form.data.title.trim() || !form.data.content.trim()) {
//     showModal("제목과 내용을 입력해주세요.", "error");
//     return;
//   }

//   if (editMode.value) {
//     allNotices.value = allNotices.value.map((n) =>
//       n.id === selectedNotice.value.id ? { ...n, ...form.data } : n
//     );
//     showModal("수정 완료", "success");
//   } else {
//     const res = await postNotice(form.data);
//     if (res && res.data) {
//       await loadNotices(); // DB 기준으로 전체 공지 갱신
//       showModal("작성 완료", "success");
//     }
//   }

//   closeWriteModal();
// };

// 삭제
const deleteNoticeById = async (id) => {
  const res = await deleteNotice(id);
  openConfirmModal("정말 삭제하시겠습니까?", () => {
    if(res.status == 200) {
      allNotices.value = allNotices.value.filter((n) => n.id !== id);
      selectedNotice.value = null;
      showModal("삭제 완료", "success");
    }
  });
};

const openConfirmModal = (message, callback) => {
  state.confirmMessage = message;
  state.confirmCallback = callback;
  state.showConfirmModal = true;
};

const closeConfirmModal = () => {
  state.showConfirmModal = false;
  state.confirmCallback = null;
};

const handleConfirm = () => {
  if (state.confirmCallback) {
    state.confirmCallback();
  }
  closeConfirmModal();
};

// 탭 변경 (학생/교수용)
const changeTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = 1;
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 순번 계산
const getNoticeNumber = (index) => {
  const totalCount = filteredNotices.value.length;
  const number = totalCount - ((currentPage.value - 1) * itemsPerPage + index);
  return number;
};

// ESC로 모달 닫기
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    if (isWriteModalOpen.value) closeWriteModal();
    if (selectedNotice.value) selectedNotice.value = null;
    if (state.showYnModal) state.showYnModal = false;
    if (state.showConfirmModal) closeConfirmModal();
  }
};

onMounted(async () => {
  const res = await searchNotice();
  if (res && res.status == 200) {
    allNotices.value = res.data;
    console.log(allNotices.value);
  }
  
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="notice-page">
    <!-- 📌 상세보기 -->

    <div v-if="selectedNotice" class="notice-detail-box">
      <div class="detail-title">{{ selectedNotice.title }}</div>

      <div class="detail-meta">
        <div class="meta-row">
          <span class="meta-label">작성자:</span>
          <span>{{ selectedNotice.author }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">작성일:</span>
          <span>{{ selectedNotice.date }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">조회수:</span>
          <span>{{ selectedNotice.views }}</span>
        </div>
      </div>

      <div class="detail-content">{{ selectedNotice.content }}</div>

      <div class="detail-actions">
        <button class="notice-list-btn" @click="router.push('/main')">
          목록으로
        </button>
        <button
          v-if="isStaffUser"
          class="notice-edit-btn"
          @click="openEditModal(selectedNotice)"
        >
          수정
        </button>
        <button
          v-if="isStaffUser"
          class="notice-delete-btn"
          @click="deleteNotice(selectedNotice.id)"
        >
          삭제
        </button>
      </div>
    </div>

    <!-- 📌 목록 보기 -->
    <main v-if="!selectedNotice" class="main-content">
      <div class="content-container">
        <div class="compact-notice-widget">
          <span class="top-title">
            <i class="bi bi-megaphone-fill me-2" style="margin: 5px"></i>무지대
            공지사항
          </span>

          <!-- 교직원용 필터 -->
          <div v-if="isStaffUser" class="search-filter-section">
            <div class="search-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input
                v-model="searchKeyword"
                placeholder="검색"
                class="search-input-box"
              />
            </div>
            <div class="filter-area">
              <select v-model="filterType" class="filter-select">
                <option value="all">전체</option>
                <option value="important">중요 공지</option>
                <option value="normal">일반 공지</option>
              </select>
              <button class="write-btn" @click="openWriteModal">글쓰기</button>
            </div>
          </div>

          <!-- 학생/교수용 탭 -->
          <div v-if="!isStaffUser" class="tab-section">
            <div class="tab-container">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'all' }"
                @click="changeTab('all')"
              >
                전체
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'important' }"
                @click="changeTab('important')"
              >
                중요공지
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'normal' }"
                @click="changeTab('normal')"
              >
                일반공지
              </button>
            </div>
          </div>

          <div class="notice-board">
            <div class="notice-list-container">
              <div class="list-header">
                <div class="list-item-header-number">번호</div>
                <div class="list-item-header-title">제목</div>
                <div class="list-item-header-date">등록일</div>
                <div class="list-item-header-views">조회</div>
              </div>
              <template v-if="paginatedNotices.length > 0">
                <div
                  v-for="(notice, index) in paginatedNotices"
                  :key="notice.id"
                  class="notice-list-row"
                  :class="{ 'important-row': notice.isImportant }"
                  @click="NoticeDetail(notice.id)"
                >
                  <div class="list-item-data-number">
                    {{ getNoticeNumber(index) }}
                  </div>
                  <div class="list-item-data-title">
                    <span v-if="notice.isImportant" class="important-badge"
                      >중요</span
                    >
                    {{ notice.title }}
                  </div>
                  <div class="list-item-data-date">{{ notice.date }}</div>
                  <div class="list-item-data-views">{{ notice.views }}</div>
                </div>
              </template>
              <div v-else class="empty-state">검색 결과가 없습니다.</div>
            </div>

            <div v-if="totalPages > 1" class="pagination-section">
              <div class="pagination">
                <button
                  class="page-btn"
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  &lt;
                </button>

                <button
                  v-for="page in totalPages"
                  :key="page"
                  :class="['page-btn', { active: currentPage === page }]"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>

                <button
                  class="page-btn"
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-show="isWriteModalOpen" class="modal-overlay">
      <div class="modal-content write-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editMode ? "공지사항 수정" : "공지사항 작성" }}
          </h3>
          <button class="close-btn" @click="closeWriteModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>작성자</label>
              <input
                v-model="form.data.author"
                type="text"
                class="form-input"
              />
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.data.isImportant"
                  type="checkbox"
                  class="form-checkbox"
                />
                중요 공지사항
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>제목</label>
            <input v-model="form.data.title" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="form.data.content"
              class="form-textarea"
              rows="12"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeWriteModal">
            취소
          </button>
          <button class="btn btn-primary" @click="saveNotice">
            {{ editMode ? "수정 완료" : "작성 완료" }}
          </button>
        </div>
      </div>
    </div>
    <YnModal
      v-if="state.showYnModal"
      :content="state.ynModalMessage"
      :type="state.ynModalType"
      @close="state.showYnModal = false"
    />
    <ConfirmModal
      v-if="state.showConfirmModal"
      :content="state.confirmMessage"
      type="warning"
      @confirm="handleConfirm"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<style scoped>
.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 14px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.notice-page {
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.notice-detail-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 50px auto !important;
  max-width: 1500px;
}

.top-title {
  display: block;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
}

.search-wrapper {
  position: relative;
  flex: 1;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  color: #999;
  font-size: 14px;
}

.search-input-box {
  width: 100%;
  padding: 7px 12px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  background: white;
  box-sizing: border-box;
}

/* 탭 스타일 (학생/교수용) */
.tab-section {
  margin-bottom: 10px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #3f7ea6;
}

.tab-btn.active {
  color: #3f7ea6;
  border-bottom-color: #3f7ea6;
}

.search-filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.search-input {
  position: relative;
  max-width: 100%;
}

.search-input input {
  width: 100%;
  padding: 10px 12px 10px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  background: white;
  box-sizing: border-box;
}

.search-input input::placeholder {
  color: #999;
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-select {
  height: 36px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #777;
  outline: none;
  transition: all 0.2s ease;
  appearance: none;
  min-width: 80px;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 32px;
}

.filter-select {
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.filter-select:hover {
  border-color: #cbd5e1;
}

.select-input.wide {
  min-width: 120px;
}

.write-btn {
  background-color: #3f7ea6;
  color: #fff;
  border-radius: 4px;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.write-btn:hover {
  background-color: #2a5c74;
}

.write-btn:active {
  background-color: #204658;
}

.notice-board {
  background: white;
}

.board-header {
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.board-title {
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin: 0;
}

.notice-list-container {
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 80px 50px;
  gap: 10px;
  padding: 10px 15px;
  background: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
  font-weight: 600;
  color: #495057;
  text-align: center;
  font-size: 12px;
}
.list-item-header-number {
  text-align: center;
}
.list-item-header-title {
  text-align: center;
}
.list-item-header-date {
  text-align: center;
}
.list-item-header-views {
  text-align: center;
}

.notice-list-row {
  display: grid;
  grid-template-columns: 40px 1fr 80px 50px;
  gap: 10px;
  padding: 12px 15px;
  border-bottom: 1px solid #e9ecef;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 13px;
  color: #343a40;
}

.notice-list-row:last-child {
  border-bottom: none;
}

.notice-list-row:hover {
  background-color: #f8f9fa;
}

.important-row {
  background-color: #fff8f0;
  font-weight: 500;
}

.important-row:hover {
  background-color: #ffefd6;
}

.list-item-data-number {
  text-align: center;
  color: #666;
  font-size: 12px;
}

.list-item-data-title {
  display: flex;
  align-items: center;
  min-width: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-data-date {
  text-align: center;
  color: #868e96;
  font-size: 12px;
}

.list-item-data-views {
  text-align: center;
  color: #868e96;
  font-size: 12px;
}

.important-badge {
  background: #ff4757;
  color: white;
  font-size: 9px;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 6px;
  font-weight: 500;
  flex-shrink: 0;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 16px;
  background: white;
}

.pagination-section {
  padding-top: 5px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 7px;
}
.page-btn {
  background: white;
  border: 1px solid #ddd;
  color: #666;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  min-width: 30px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #ccc;
}

.page-btn.active {
  background: #3f7ea6;
  border-color: #3f7ea6;
  color: white;
}

.page-btn.active:hover {
  background: #2a5c74;
  border-color: #2a5c74;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 10px;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.write-modal {
  max-width: 500px;
}

.confirm-modal {
  max-width: 300px;
  padding: 20px;
  text-align: center;
}

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
  text-align: left;
  padding-right: 40px;
  margin-top: 25px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-radius: 50%;
}

.close-btn:hover {
  background-color: #f8f9fa;
  color: #000;
}

.modal-body {
  padding: 0px 20px 0 20px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 25px;
  align-items: stretch;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
}

.checkbox-group {
  flex: 0 0 auto;
  align-self: flex-start;
}

.form-group label {
  display: block;
  margin: 20px 6px 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
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

.form-input:focus {
  color: #495057;
  background-color: #fff;
  border-color: #94a3b8;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.form-input::placeholder {
  color: #6c757d;
  opacity: 1;
}

.form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 13px;
  resize: vertical;
  box-sizing: border-box;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #94a3b8;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
  color: #495057;
  font-size: 15px;
}

.form-checkbox {
  margin-right: 6px;
  width: auto;
  transform: scale(0.9);
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
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
}

/* 상세보기 */
.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: #212529;
  margin-bottom: 16px;
  padding: 24px 24px 0;
}

.detail-meta {
  margin-bottom: 24px;
  padding: 16px 24px;
  background: #fcfcfc;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #495057;
}

.meta-label {
  font-weight: 600;
  margin-right: 8px;
  color: #212529;
}

.detail-content {
  padding: 10px 0 34px 34px;
  white-space: pre-wrap;
  font-size: 15px;
  min-height: 200px;
}

.detail-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  border-top: 1px solid #000;
  background: #f8f9fa;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 4px;
  gap: 6px;
  flex: 1;
}

.notice-edit-btn {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.notice-edit-btn:hover {
  background-color: #2a5c74;
}

.notice-edit-btn:active {
  background-color: #204658;
}

.notice-delete-btn {
  background-color: #ff3b30;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.notice-delete-btn:hover {
  background-color: #e03128;
}

.notice-delete-btn:active {
  background-color: #b3271f;
}

.notice-list-btn {
  background-color: #5ba666;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.notice-list-btn:hover {
  background-color: #4a8955;
}

.notice-list-btn:active {
  background-color: #3e7548;
}

.modal-notice-header {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
}

.modal-notice-header span:nth-child(1) {
  text-align: left;
}
.modal-notice-header span:nth-child(2) {
  text-align: right;
}

.modal-notice-list {
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
}

.modal-notice-row {
  display: grid;
  grid-template-columns: 1fr 70px;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 13px;
}

.modal-notice-row:hover {
  background-color: #f8f9fa;
}

.modal-notice-row.important {
  background-color: #fff8f0;
}

.modal-notice-row.important:hover {
  background-color: #ffefd6;
}

.modal-notice-title-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-left: 0;
}

.modal-notice-text {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}

.modal-notice-row.important .modal-notice-text {
  font-weight: 500;
}

.modal-notice-date {
  font-size: 11px;
  color: #999;
  text-align: right;
}

.modal-pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}
</style>
