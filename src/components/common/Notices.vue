<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";

// 전체 공지사항 데이터
const allNotices = ref([
  {
    id: 1,
    title: "2025년 시스템 정기 점검 안내",
    date: "2025-07-28",
    isImportant: true,
    content:
      "안정적인 서비스 제공을 위해 시스템 정기 점검을 실시합니다.\n\n점검 일시: 2025년 8월 1일 02:00 ~ 06:00 (4시간)\n점검 내용:\n- 서버 안정성 개선\n- 보안 패치 적용\n- 데이터베이스 최적화\n\n점검 중에는 일시적으로 서비스 이용이 제한될 수 있습니다.\n이용에 불편을 드려 죄송합니다.",
    views: 245,
    author: "관리자",
  },
  {
    id: 2,
    title: "새로운 기능 업데이트 - 다크모드 지원",
    date: "2025-07-27",
    isImportant: false,
    content:
      "사용자 편의성 향상을 위해 다크모드 기능이 추가되었습니다.\n\n주요 변경사항:\n- 다크모드/라이트모드 전환 가능\n- 사용자 설정에 따른 자동 테마 적용\n- 모든 페이지에서 일관된 디자인 제공\n\n설정 > 화면 설정에서 변경하실 수 있습니다.",
    views: 189,
    author: "개발팀",
  },
  {
    id: 3,
    title: "[중요] 개인정보 처리방침 변경 안내",
    date: "2025-07-25",
    isImportant: true,
    content:
      "개인정보 보호법 개정에 따른 처리방침 변경사항을 안내드립니다.\n\n주요 변경사항:\n- 개인정보 수집 및 이용 목적 명확화\n- 개인정보 보유 및 이용기간 조정\n- 개인정보 처리 위탁 관련 사항 추가\n\n자세한 내용은 개인정보 처리방침 페이지를 확인해주세요.",
    views: 567,
    author: "법무팀",
  },
  {
    id: 4,
    title: "서비스 이용약관 개정 안내",
    date: "2025-07-20",
    isImportant: false,
    content:
      "서비스 품질 향상을 위한 이용약관 일부 개정 사항입니다.\n\n개정 내용:\n- 서비스 이용 범위 명확화\n- 사용자 의무사항 추가\n- 서비스 중단 관련 조항 개선\n\n개정된 약관은 2025년 8월 1일부터 적용됩니다.",
    views: 123,
    author: "운영팀",
  },
  {
    id: 5,
    title: "고객센터 운영시간 변경 안내",
    date: "2025-07-18",
    isImportant: false,
    content:
      "고객센터 운영시간이 변경되오니 참고 부탁드립니다.\n\n변경 전: 평일 09:00 ~ 18:00\n변경 후: 평일 09:00 ~ 19:00, 토요일 10:00 ~ 16:00\n\n일요일 및 공휴일은 휴무입니다.\n긴급 문의는 온라인 채팅을 이용해주세요.",
    views: 89,
    author: "고객지원팀",
  },
  {
    id: 6,
    title: "[긴급] 보안 업데이트 완료 안내",
    date: "2025-07-15",
    isImportant: true,
    content: "보안 취약점 패치를 위한 긴급 업데이트가 완료되었습니다.",
    views: 432,
    author: "관리자",
  },
  {
    id: 7,
    title: "여름휴가 기간 고객지원 안내",
    date: "2025-07-10",
    isImportant: false,
    content: "여름휴가 기간 중 고객지원 운영 일정을 안내드립니다.",
    views: 156,
    author: "고객지원팀",
  },
  {
    id: 8,
    title: "서버 성능 개선 작업 완료",
    date: "2025-07-08",
    isImportant: false,
    content: "서버 성능 개선을 통해 더욱 빠른 서비스를 제공합니다.",
    views: 203,
    author: "개발팀",
  },
  {
    id: 9,
    title: "[알림] 비밀번호 보안 강화 권장사항",
    date: "2025-07-05",
    isImportant: true,
    content: "계정 보안 강화를 위한 비밀번호 변경을 권장합니다.",
    views: 378,
    author: "보안팀",
  },
  {
    id: 10,
    title: "모바일 앱 버전 업데이트 안내",
    date: "2025-07-01",
    isImportant: false,
    content: "모바일 앱의 새로운 버전이 출시되었습니다.",
    views: 291,
    author: "개발팀",
  },
]);

// 상태 관리
const searchKeyword = ref("");
const filterType = ref("all");
const currentPage = ref(1);
const selectedNotice = ref(null);
const isModalOpen = ref(false);
const isWriteModalOpen = ref(false);
const editMode = ref(false);
const showConfirm = ref(false);
const confirmCallback = ref(null);
const nextId = ref(11);

const form = ref({
  title: "",
  content: "",
  isImportant: false,
  author: "관리자",
});

const route = useRoute();
const router = useRouter();

const state = reactive({
  showYnModal: false,
  ynModalMessage: "",
  ynModalType: "info",
});

// 한 페이지에 보여줄 아이템 수 (5개로 설정)
const itemsPerPage = 5;

// 필터링된 공지사항
const filteredNotices = computed(() => {
  return allNotices.value.filter((notice) => {
    const matchesKeyword =
      !searchKeyword.value.trim() ||
      notice.title.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchKeyword.value.toLowerCase());

    const matchesFilter =
      filterType.value === "all" ||
      (filterType.value === "important" && notice.isImportant) ||
      (filterType.value === "normal" && !notice.isImportant);

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
const viewNotice = (notice) => {
  selectedNotice.value = { ...notice, views: notice.views + 1 };
  // 조회수 증가
  allNotices.value = allNotices.value.map((n) =>
    n.id === notice.id ? { ...n, views: n.views + 1 } : n
  );
};

// 모달 열기/닫기
const openModal = () => (isModalOpen.value = true);
const closeModal = () => (isModalOpen.value = false);

// 글쓰기 모달
const openWriteModal = () => {
  form.value = { title: "", content: "", isImportant: false, author: "관리자" };
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
const saveNotice = () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  if (editMode.value) {
    allNotices.value = allNotices.value.map((n) =>
      n.id === selectedNotice.value.id ? { ...n, ...form.value } : n
    );
    alert("수정 완료");
  } else {
    const newNotice = {
      id: nextId.value,
      ...form.value,
      date: new Date().toISOString().split("T")[0],
      views: 0,
    };
    allNotices.value = [newNotice, ...allNotices.value];
    nextId.value++;
    alert("작성 완료");
  }
  closeWriteModal();
};

// 삭제
const deleteNotice = (id) => {
  showConfirm.value = true;
  confirmCallback.value = () => {
    allNotices.value = allNotices.value.filter((n) => n.id !== id);
    selectedNotice.value = null;
    showConfirm.value = false;
    alert("삭제 완료");
  };
};

// 페이지 변경
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// 순번 계산
const getNoticeNumber = (index) => {
  // 최신순으로 정렬되었으므로, 총 개수에서 현재 인덱스와 페이지를 기반으로 계산
  const totalCount = filteredNotices.value.length;
  const number = totalCount - ((currentPage.value - 1) * itemsPerPage + index);
  return number;
};

// ESC로 모달 닫기
const handleKeydown = (e) => {
  if (e.key === "Escape") {
    if (isModalOpen.value) closeModal();
    if (isWriteModalOpen.value) closeWriteModal();
    if (selectedNotice.value) selectedNotice.value = null;
    if (showConfirm.value) showConfirm.value = false;
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="notice-page">
    <div v-if="selectedNotice" class="content-container">
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
        <button class="btn btn-secondary" @click="selectedNotice = null">
          목록으로
        </button>
        <button class="btn btn-primary" @click="openEditModal(selectedNotice)">
          수정
        </button>
        <button class="btn btn-danger" @click="deleteNotice(selectedNotice.id)">
          삭제
        </button>
        <button class="btn btn-primary" @click="openModal">전체보기</button>
      </div>
    </div>

    <main v-if="!selectedNotice" class="main-content">
      <div class="content-container">
        <div class="compact-notice-widget">
          <div class="search-filter-section">
            <div class="search-area">
              <input
                v-model="searchKeyword"
                placeholder="검색..."
                class="search-input"
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
                  @click="viewNotice(notice)"
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
                  ‹
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
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content detail-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">전체 공지사항</h2>
          <button class="close-btn" @click="closeModal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="modal-notice-header">
            <span class="modal-header-title">제목</span>
            <span>등록일</span>
          </div>

          <div class="modal-notice-list">
            <div
              v-for="(notice, index) in allNotices"
              :key="notice.id"
              :class="[
                'modal-notice-row',
                notice.isImportant ? 'important' : '',
              ]"
              @click="
                closeModal();
                viewNotice(notice);
              "
            >
              <div class="modal-notice-title-cell">
                <span v-if="notice.isImportant" class="important-badge"
                  >중요</span
                >
                <span class="modal-notice-text">{{ notice.title }}</span>
              </div>

              <span class="modal-notice-date">{{ notice.date }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="modal-pagination">
            <button class="page-btn">‹</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">›</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isWriteModalOpen" class="modal-overlay" @click="closeWriteModal">
      <div class="modal-content write-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editMode ? "공지사항 수정" : "새 공지사항 작성" }}</h3>
          <button class="close-btn" @click="closeWriteModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>작성자</label>
              <input v-model="form.author" type="text" class="form-input" />
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.isImportant"
                  type="checkbox"
                  class="form-checkbox"
                />
                중요 공지사항
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>제목</label>
            <input v-model="form.title" type="text" class="form-input" />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="form.content"
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

    <div v-if="showConfirm" class="modal-overlay">
      <div class="modal-content confirm-modal">
        <h3 class="confirm-title">삭제 확인</h3>
        <p class="confirm-message">정말 삭제하시겠습니까?</p>
        <div class="confirm-actions">
          <button class="btn btn-secondary" @click="showConfirm = false">
            취소
          </button>
          <button class="btn btn-danger" @click="confirmCallback">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compact-notice-widget {
  width: 100%;
  max-width: 600px;
  height: 400px;
  margin: 0 auto;
  padding: 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
}

.notice-page {
  min-height: 100vh;
}

.main-content {
  padding: 20px 10px;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-filter-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.search-area {
  flex-grow: 1;
  min-width: 120px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #007bff;
}

.filter-area {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-select {
  padding: 7px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 13px;
  outline: none;
}

.write-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.write-btn:hover {
  background: #0056b3;
}

.notice-board {
  background: none;
  border: none;
  box-shadow: none;
  overflow: hidden;
  margin-top: 10px;
}
.board-header {
  padding: 10px;
  border-bottom: 1px solid #ced4da;
  background: #fff;
}

.notice-list-container {
  padding: 0;
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
  text-align: left;
}
.list-item-header-date {
  text-align: right;
}
.list-item-header-views {
  text-align: right;
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
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-data-date {
  text-align: right;
  color: #868e96;
  font-size: 12px;
}

.list-item-data-views {
  text-align: right;
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
  padding: 30px 15px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.pagination-section {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #e9ecef;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
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
  background: #007bff;
  border-color: #007bff;
  color: white;
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
}

.write-modal {
  max-width: 380px;
}

.detail-modal {
  max-width: 380px;
}

.confirm-modal {
  max-width: 300px;
  padding: 20px;
  text-align: center;
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #333;
  background: #f0f0f0;
}

.modal-body {
  padding: 15px;
  flex: 1;
  overflow-y: auto;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 15px;
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
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 13px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
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
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
  color: #495057;
  font-size: 13px;
}

.form-checkbox {
  margin-right: 6px;
  width: auto;
  transform: scale(0.9);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
  gap: 8px;
}

/* 상세보기 스타일 */
.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-meta {
  margin-bottom: 15px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.meta-row {
  display: flex;
  font-size: 12px;
}

.meta-label {
  font-weight: 600;
  color: #495057;
  margin-right: 6px;
}

.detail-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  font-size: 14px;
  padding: 15px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  margin-bottom: 20px;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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

/* 삭제 확인 모달 */
.confirm-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.confirm-message {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
