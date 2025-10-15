<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoticeDetail, updateNotice, deleteNotice } from '@/services/NoticeService';
import { useUserStore } from '@/stores/account';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const data = reactive({
  author:"관리자",
  form:{
    createdAt: '',
    updatedAt: '',
    noticeId: 0,
    noticeTitle:'',
    noticeContent:'',
    view: 0,
    type: 0
  },
  form2:{
    createdAt: '',
    updatedAt: '',
    noticeId: 0,
    noticeTitle:'',
    noticeContent:'',
    view: 0,
    type: 0
  }
})

const state = reactive({
  editMode: false,
  isWriteModalOpen: false
})

onMounted(() => {
  getNotice();
  console.log(data.form)
})

// DB데이터 불러오기
const getNotice = async() =>{
  const res = await getNoticeDetail(route.params.id)
  console.log('xhdtls',res)
  data.form = res.data;
  give();
}

// 모달관리
const openEditModal = () => {
  state.isWriteModalOpen = true;
};

const closeWriteModal = () => {
  state.isWriteModalOpen = false;
  give();
};

//저장(수정)
const modify = async() =>{
  const res = await updateNotice(route.params.id, data.form2)
  console.log(res)
  closeWriteModal();
  getNotice();
  
}

//값 할당
const give = () =>{
  data.form2.createdAt = data.form.createdAt
  data.form2.updatedAt = data.form.updatedAt
  data.form2.noticeId = data.form.noticedId
  data.form2.noticeTitle = data.form.noticeTitle
  data.form2.noticeContent = data.form.noticeContent
  data.form2.view = data.form.view ? data.form.view : 0
  data.form2.type = data.form.type ? data.form.type : 0
}

const deleteNoticeById = async (id) => {
  const res = await deleteNotice(id);
  openConfirmModal('정말 삭제하시겠습니까?', () => {
    if (res.status == 200) {
      allNotices.value = allNotices.value.filter((n) => n.id !== id);
      selectedNotice.value = null;
      showModal('삭제 완료', 'success');
      loadPage()
    }
  });
};

const show = () =>{
  console.log(data.form.type)
}

const back = () =>{
  router.push('/main')
}
</script>

<template>
  <div class="notice-detail-box">
    <div class="detail-title">{{ data.form.noticeTitle }}</div>
    <div class="detail-meta">
      <div class="d-flex">
        <div class="meta-row">
          <span class="meta-label">작성자:</span>
          <span>관리자</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">작성일:</span>
          <span>{{ data.form.createdAt }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">조회수:</span>
          <span>{{ data.form.view }}</span>
        </div>
      </div>

      <div class="d-flex button" v-if=" userStore.state.signedUser.userRole === 'staff'">
        <button
          class="notice-edit-btn"
          @click="openEditModal(selectedNotice)"
        >
          수정
        </button>
        <button
          class="notice-delete-btn"
          @click="deleteNoticeById(selectedNotice.noticeId)"
        >
          삭제
        </button>
      </div>

    </div>

    <div class="detail-content">{{ data.form.noticeContent }}</div>

    <div class="detail-actions">
      <button class="notice-list-btn" @click="back">
        목록
      </button>
    </div>
  </div>

  <!-- 모달 -->
  <div v-show="state.isWriteModalOpen" class="modal-overlay">
      <div class="modal-content write-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            공지사항 수정
          </h3>
          <button class="close-btn" @click="closeWriteModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>작성자</label>
              <input
                v-model="data.author"
                type="text"
                class="form-input"
              />
            </div>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="data.form2.type"
                  :true-value ="1"
                  :false-value ="0"
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
              v-model="data.form2.noticeTitle"
              type="text"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              v-model="data.form2.noticeContent"
              class="form-textarea"
              rows="12"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeWriteModal">
            취소
          </button>
          <button class="btn btn-primary" @click="modify">
            수정완료
          </button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.notice-detail-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px;
  max-width: 100%;
}

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
  justify-content: space-between;
  gap: 24px;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #495057;
  margin-right: 20px;
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
  min-height: 550px;
}

.button{
  margin-right: 10px;
  gap:10px;
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
  background-color: #e9eaeb;
  color: #333;
  border: none;
  height: 30px;
  min-width: 50px;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

/* .notice-edit-btn:hover {
  background-color: #8e9396;
  color: #fff;
} */

/* .notice-edit-btn:active {
  background-color: #204658;
} */

.notice-delete-btn {
  background-color: #e9eaeb;
  color: #333;
  border: none;
  height: 30px;
  min-width: 50px;
  font-size: 13px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

/* .notice-delete-btn:hover {
  background-color: #e03128;
}

.notice-delete-btn:active {
  background-color: #b3271f;
} */

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

/* 아래는 모달 */
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

</style>