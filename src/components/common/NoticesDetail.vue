<script setup>
import { onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getNoticeDetail } from '@/services/NoticeService';
import { useUserStore } from '@/stores/account';

const route = useRoute();
const userStore = useUserStore();
const data = reactive({
  result:{}
})

onMounted(async () => {
  const res = await getNoticeDetail(route.params.id)
  data.result = res.data
  console.log(res)
})


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

</script>

<template>
  <div class="notice-detail-box">
    <div class="detail-title">{{ data.result.noticeTitle }}</div>
    <div class="detail-meta">
      <div class="d-flex">
        <div class="meta-row">
          <span class="meta-label">작성자:</span>
          <span>관리자</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">작성일:</span>
          <span>{{ data.result.createdAt }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">조회수:</span>
          <span>{{ data.result.view }}</span>
        </div>
      </div>

      <div class="d-flex" v-if=" userStore.state.signedUser.userRole === 'staff'">
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

    <div class="detail-content">{{ data.result.noticeContent }}</div>

    <div class="detail-actions">
      <button class="notice-list-btn" @click="back">
        목록
      </button>
      
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
  width: 100%;
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


</style>