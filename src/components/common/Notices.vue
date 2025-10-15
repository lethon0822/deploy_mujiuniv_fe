<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/account';
import YnModal from '@/components/common/YnModal.vue';
import ConfirmModal from '@/components/common/Confirm.vue';
import {
  postNotice,
  searchNotice,
  updateNotice,
} from '@/services/NoticeService';

const allNotices = ref([]); // 초기값 빈 배열

// 상태 관리
const searchKeyword = ref('');
const filterType = ref('all');
const activeTab = ref('all'); // 학생/교수용 탭
const currentPage = ref(1);
const selectedNotice = ref(null);
const isWriteModalOpen = ref(false);
const editMode = ref(false);
const nextId = ref(11);

const form = reactive({
  data: {
    noticeTitle: '',
    noticeContent: '',
    type: false,
    view: 0,
    type: 0,
    author: '관리자',
  },
});

const router = useRouter();
const userStore = useUserStore();

const isStaffUser = computed(
  () => userStore.state.signedUser?.userRole === 'staff'
);

const state = reactive({
  showYnModal: false,
  ynModalMessage: '',
  ynModalType: 'info',
  showConfirmModal: false,
  confirmMessage: '',
  confirmCallback: null,
});

const showModal = (message, type = 'info') => {
  state.ynModalMessage = message;
  state.ynModalType = type;
  state.showYnModal = true;
};

const itemsPerPage = 5;

// 초성 배열
const CHO = [
  "ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ",
  "ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ",
  "ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"
];

// 문자열 → 초성 변환
function toChosung(str) {
  return str
    .normalize("NFC")
    .split("")
    .map(char => {
      const code = char.charCodeAt(0) - 0xac00;
      if (code >= 0 && code <= 11171) {
        return CHO[Math.floor(code / 588)];
      }
      return char;
    })
    .join("");
}

// 검색어가 초성으로만 이루어졌는지 체크
function isChosungKeyword(str) {
  return /^[ㄱ-ㅎ]+$/.test(str);
}

// 필터 + 검색
const filteredNotices = computed(() => {
  const rawKeyword = (searchKeyword.value ?? "").trim();
  if (!rawKeyword) return allNotices.value;

  const keyword = rawKeyword.toLowerCase();
  const useChosung = isChosungKeyword(rawKeyword);

  return allNotices.value.filter(notice => {
    const title = (notice.noticeTitle ?? "").toLowerCase();
    const content = (notice.noticeContent ?? "").toLowerCase();

    if (useChosung) {
      // 초성 검색
      const titleChosung = toChosung(title);
      const contentChosung = toChosung(content);
      return titleChosung.includes(keyword) || contentChosung.includes(keyword);
    } else {
      // 일반 단어 검색
      return title.includes(keyword) || content.includes(keyword);
    }
  });
});
const totalPages = computed(() =>
  Math.ceil(filteredNotices.value.length / itemsPerPage)
);
const paginatedNotices = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredNotices.value.slice(start, end);
});

// 공지사항 상세보기
const NoticeDetail = (id) => {
  router.push(`/notice/${id}`);
};

const openWriteModal = () => {
  form.noticeTitle = '';
  form.noticeContent = '';
  form.type = false;
  form.author = '관리자';
  editMode.value = false;
  isWriteModalOpen.value = true;
};

const closeWriteModal = () => {
  isWriteModalOpen.value = false;
  form.value = {
    noticeTitle: '',
    noticeContent: '',
    type: 0,
    author: '관리자',
  };
};

// const openEditModal = (notice) => {
//   form.data = {
//     noticeId: notice.noticeId,
//     noticeTitle: notice.noticeTitle,
//     noticeContent: notice.noticeContent,
//     author: '관리자',
//   };
//   editMode.value = true;
//   isWriteModalOpen.value = true;
// };

const saveNotice = async () => {
  if (!form.data.noticeTitle.trim() || !form.data.noticeContent.trim()) {
    showModal('제목과 내용을 입력해주세요.', 'error');
    return;
  }

  if (editMode.value) {
    const res = await updateNotice(form.data.noticeId, {
      noticeTitle: form.data.noticeTitle,
      noticeContent: form.data.noticeContent,
    });
    if (res && res.status === 200) {
      showModal('수정이 완료되었습니다.', 'success');
      loadPage();
    } else {
      showModal('수정을 실패하였습니다. \n잠시 후에 시도해주세요.', 'error');
    }
  } else {
    const res = await postNotice({
      noticeTitle: form.data.noticeTitle,
      noticeContent: form.data.noticeContent,
      type: form.data.type,
    });
    console.log(res.data);
    if (res && res.status == 200) {
      nextId.value++;
      showModal('작성 완료되었습니다.', 'success');
      loadPage();
    } else {
      showModal(
        '공지사항을 올리는데 실패했습니다. \n잠시 후에 시도해주세요',
        'error'
      );
    }
  }
  
  closeWriteModal();
};

// const openConfirmModal = (message, callback) => {
//   state.confirmMessage = message;
//   state.confirmCallback = callback;
//   state.showConfirmModal = true;
// };

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

const changeTab = (tab) => {
  activeTab.value = tab;
  currentPage.value = tab;
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getNoticeNumber = (index) => {
  const totalCount = filteredNotices.value.length;
  const number = totalCount - ((currentPage.value - 1) * itemsPerPage + index);
  return number;
};

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    if (isWriteModalOpen.value) closeWriteModal();
    if (selectedNotice.value) selectedNotice.value = null;
    if (state.showYnModal) state.showYnModal = false;
    if (state.showConfirmModal) closeConfirmModal();
  }
};

const loadPage = async () => {
  const res = await searchNotice();
  if (res && res.status == 200) {
    allNotices.value = res.data;
  }
};

onMounted(async () => {
  loadPage();
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="notice-page">
    <!-- 📌 상세보기 -->
    <!-- <template v-if ="change">
      <div class="notice-detail-box">
        <div class="detail-title">{{ selectedNotice.noticeTitle }}</div>

        <div class="detail-meta">
          <div class="meta-row">
            <span class="meta-label">작성자:</span>
            <span>{{ selectedNotice.author || 관리자 }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">작성일:</span>
            <span>{{ selectedNotice.createdAt }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">조회수:</span>
            <span>{{ selectedNotice.view }}</span>
          </div>
        </div>

        <div class="detail-content">{{ selectedNotice.noticeContent }}</div>

        <div class="detail-actions">
          <button class="notice-list-btn" @click="back">
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
            @click="deleteNoticeById(selectedNotice.noticeId)"
          >
            삭제
          </button>
        </div>
      </div>
    </template> -->

    <!-- 📌 목록 보기 -->
    <main class="main-content">
      <div class="content-container">
        <div class="compact-notice-widget">
          <span class="top-title">
            <i class="bi bi-megaphone-fill me-2" style="margin: 5px"></i>무지대
            공지사항
          </span>

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

              <button
                v-if="isStaffUser"
                class="write-btn"
                @click="openWriteModal"
              >
                글쓰기
              </button>
            </div>
          </div>

          <div v-if="!isStaffUser" class="tab-section">
            <div
              class="tab-container"
              style="display: flex; align-items: center"
            >
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
              <div class="search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input
                  v-model="searchKeyword"
                  placeholder="검색"
                  class="search-input-box"
                />
              </div>
            </div>
          </div>

          <!-- 리스트 -->
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
                  :class="{ 'important-row': notice.type }"
                  @click="NoticeDetail(notice.noticeId)"
                >
                  <div class="list-item-data-number">
                    {{ getNoticeNumber(index) }}
                  </div>
                  <div class="list-item-data-title">
                    <span v-if="notice.type" class="important-badge">중요</span>
                    {{ notice.noticeTitle }}
                  </div>
                  <div class="list-item-data-date">{{ notice.createdAt }}</div>
                  <div class="list-item-data-views">{{ notice.view }}</div>
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
            {{ editMode ? '공지사항 수정' : '공지사항 작성' }}
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
                  v-model="form.data.type"
                  :true-value="1"
                  :false-value="0"
                  type="checkbox"
                  @change="show"
                  class="form-checkbox"
                />
                중요 공지사항
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>제목</label>
            <input
              v-model="form.data.noticeTitle"
              type="text"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="form.data.noticeContent"
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
            {{ editMode ? '수정 완료' : '작성 완료' }}
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
  max-width: 800px;
  margin: 0 auto;
  padding: 14px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  height: 430px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.notice-page {
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.top-title {
  display: block;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  flex-shrink: 0;
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

.tab-section {
  margin-bottom: 10px;
  flex-shrink: 0;
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
  flex-shrink: 0;
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

.filter-select:hover {
  border-color: #cbd5e1;
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

.notice-board {
  background: white;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.notice-list-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
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
  position: sticky;
  top: 0;
  z-index: 1;
}

.list-item-header-number,
.list-item-header-title,
.list-item-header-date,
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
  padding: 10px 0;
  background: white;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
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
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus {
  border-color: #94a3b8;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
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
</style>
