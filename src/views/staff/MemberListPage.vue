<script setup>
import { reactive, computed, watch, onMounted } from "vue";
import WhiteBox from "@/components/common/WhiteBox.vue";
import YnModal from "@/components/common/YnModal.vue";
import noDataImg from "@/assets/find.png";
import { getMemberList } from "@/services/memberService";
import { deptNameGet } from "@/services/DeptManageService";
import { createAccount } from "@/services/accountService";
import * as XLSX from 'xlsx';

const behaivorTF = reactive({
  isDragging: false,
  showPreview: false,
  showYnModal: false,
  showUploadModal: false,
  loading: false,
});

const data = reactive({
  depts: [{ id: "", name: "전체" }],
  rows: [],
  error: "",
  ynModalMessage: "",
  ynModalType: "info",
  error: "",
});

/* 필터 상태 */
const filters = reactive({
  deptId: "",
  status: "",
  grade: "",
  keyword: "",
  searchBy: "all",
  gender: "",
});

const form = reactive({
  data: {
    userRole: "student",
  },
  excel: null,
});

const uploadState = reactive({
  previewData: [],
  progress: 0,
  status: "",
});

//computed로 감싸야 실시간 반영됨
const STATUS = computed(() => [
  { value: "", label: "상태: 전체" },
  { value: '0', label: isStudent.value ? "휴학" : "휴직" },
  { value: '1', label: isStudent.value ? "재학" : "재직" },
  { value: '2', label: isStudent.value ? "졸업" : "퇴직" },
]);
// status 숫자를 label로 바꿔주는 함수
const getStatusLabel = (status) => {
  const found = STATUS.value.find((s) => s.value === status);
  return found ? found.label : "-";
};

const showModal = (message, type = "info") => {
  data.ynModalMessage = message;
  data.ynModalType = type;
  behaivorTF.showYnModal = true;
};

const isStudent = computed(() => form.data.userRole === "student");
const roleLabel = computed(() => (isStudent.value ? "학생" : "교수"));

const loadDepts = async () => {
  try {
    const raw = await deptNameGet();
    if (!Array.isArray(raw.data))
      throw new Error("학과정보가 존재하지 않습니다");

    const mapped = raw.data.map((d) => ({
      id: d.deptId ?? d.id ?? "",
      name: d.deptName ?? d.name ?? "이름 없음",
    }));

    data.depts = [{ id: "", name: "학과:전체" }, ...mapped];
  } catch (e) {
    console.error(
      "학과 로딩 실패",
      e,
      "(응답=",
      await Promise.resolve(deptGet()).catch(() => "N/A"),
      ")"
    );
  }
};

const load = async () => {
  try {
    const params = {
      userRole: form.data.userRole,
      deptId: filters.deptId !== "" ? Number(filters.deptId) : undefined,
      status: filters.status || undefined,
      grade:
        isStudent.value && filters.grade ? Number(filters.grade) : undefined,
      gender: filters.gender || undefined,
      q: filters.keyword || undefined,
      searchBy: filters.searchBy !== "all" ? filters.searchBy : undefined,
    };

    const res = await getMemberList(params);
    data.rows = Array.isArray(res) ? res : [];
  } catch (e) {
    behaivorTF.loading = true;
    console.error(e);
    data.error = "목록을 불러오지 못했습니다.";
  } finally {
    behaivorTF.loading = false;
  }
};

const setRole = (r) => {
  if (form.data.userRole === r) {
    return;
  }
  form.data.userRole = r;
  console.log(form.data.userRole);
};

function clearQ() {
  filters.keyword = "";
}

function openUploadModal() {
  behaivorTF.showUploadModal = true;
  uploadState.previewData = [];
  uploadState.status = "";
}

function closeUploadModal() {
  behaivorTF.showUploadModal = false;
  uploadState.progress = 0;
  form.excel = null;
}

const handleFileSelected = (event) => {
  let excelFile;
  if (event.dataTransfer) {
    excelFile = event.dataTransfer.files[0]; // 단일 파일
  } else {
    excelFile = event.target.files[0]; // 단일 파일
  }

  // 파일 타입 체크
  const isExcel =
    excelFile.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    excelFile.type === "application/vnd.ms-excel";

  if (!isExcel) {
    showModal("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.", "warning");
    return;
  }
  form.excel = excelFile;
  event.target.value = "";
};


//엑셀 전송
const uploadExcel = async () => {
  if (!form.excel) {
    showModal("업로드할 파일을 선택해주세요.", "error");
    return;
  }
  uploadState.status = "uploading";
  uploadState.progress = 0;

  const formData = new FormData();
  formData.append("excel", form.excel);
  formData.append("data", form.data.userRole);

  for (let i = 0; i <= 100; i += 10) {
    uploadState.progress = i;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  try {
    const res = await createAccount(formData);
    parseExcelFile(form.excel)
    await load();

    uploadState.status = "success";
    behaivorTF.showPreview = true;
    closeUploadModal();
  } catch (error) {
    uploadState.status = "error";
  }
};

// 엑셀 읽는 함수 
const parseExcelFile = async(file) => {
  try{
    //
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'binary',cellDates: true, dateNF: 'yyyy-mm-dd' });
    console.log(workbook)
   
    // xlsx라이브러리는 시트명으로 접근해야함 
    const sheetName = workbook.SheetNames[0]; // 첫번째 시트 이름 get
    const workSheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(workSheet, { header: 1, raw:false }); // 이차원 배열 [[각 행들]]

    // row를 delete로 지웠을 시 꼬이는 문제 때문에 json으로 바꾸기 전에 먼저 제거 
    const filteredRows = rows.filter(row => row && row.some(cell => cell !== null && cell !== undefined && cell !== ""));
    //header: key지정, 설정하지 않으면 기본 엑셀 파일의 첫행이 key값이 된다 
    //sheet_to_json을 사용하면 json형태로 반환된다.
    //2차원 배열로 만들어서 한번더 검토 

    // xlsx라이브러리는 1행의 값을 key로 삼는다. 키명을 바꾸고 싶다면 아래처럼 이름을 지정한다 
    const keyName = ["name","birthday", "gender","email","phone","postCode","address","addDetail","dept","date"]
    const jsonData = XLSX.utils.sheet_to_json(XLSX.utils.aoa_to_sheet(filteredRows),{
      header:keyName,
      range:1, 
    })
    
    console.log('2', jsonData)
    uploadState.previewData = jsonData;
    console.log(uploadState.previewData)
  } catch (error) {
    console.error("파일 파싱 오류:", error);
    showModal("파일을 읽는 중 오류가 발생했습니다.", "error");
  }}

function handleDragEnter(event) {
  behaivorTF.isDragging = true;
}

function handleDragLeave(event) {
  // 실제로 드래그가 완전히 영역 밖으로 나갔는지 확인하기 위해
  // event.target === event.currentTarget 인 경우만 false 처리 권장
  if (event.target === event.currentTarget) {
    behaivorTF.isDragging = false;
  }
}

const removeFile = () => {
  form.excel = null;
  closePreview();
  document.querySelector('input[type="file"]').value = "";
};

function togglePreview() {
  behaivorTF.showPreview = !behaivorTF.showPreview;
}

function closePreview() {
  behaivorTF.showPreview = false;
  uploadState.status = "";
  uploadState.previewData = [];
}


watch(
  [
    () => form.data.userRole,
    () => filters.deptId,
    () => filters.status,
    () => filters.gender,
    () => filters.grade,
  ],
  load
);

onMounted(async () => {
  await loadDepts();
  await load();
});
</script>

<template>
  <div class="container">
    <div class="header-card">
      <h1>구성원현황</h1>
      <p>학생 및 교수를 조회하여 관리 할 수 있습니다.</p>

      <div class="filters">
        <div class="chips">
          <button
            class="chip"
            :class="{ on: form.data.userRole === 'student' }"
            @click="setRole('student')"
          >
            <i
              class="bi bi-person-fill"
              style="margin-right: 8px; color: #00664f"
            ></i>
            학생
          </button>

          <button
            class="chip"
            :class="{ on: form.data.userRole === 'professor' }"
            @click="setRole('professor')"
          >
            <i
              class="bi bi-clipboard-check"
              style="margin-right: 8px; color: #00664f"
            ></i>
            교수
          </button>
        </div>
        <div class="full-line"></div>
      </div>
      <div class="right">
        <select v-model="filters.deptId" class="inp w150">
          <option :value="d.id" v-for="d in data.depts" :key="d.id">
            {{ d.name }}
          </option>
        </select>

        <select v-model="filters.status" class="inp w120">
          <option v-for="opt in STATUS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <select v-if="isStudent" v-model="filters.grade" class="inp w120">
          <option value="">학년: 전체</option>
          <option v-for="n in 4" :key="n" :value="n">{{ n }}학년</option>
        </select>

        <select v-model="filters.gender" class="inp w100">
          <option value="">성별: 전체</option>
          <option value="M">남</option>
          <option value="F">여</option>
        </select>

        <div class="search-group">
          <select v-model="filters.searchBy" class="inp w120">
            <option value="all">전체</option>
            <option value="name">이름</option>
            <option value="loginId">아이디</option>
            <option value="email">이메일</option>
          </select>
          <input
            v-model="filters.keyword"
            type="text"
            class="inp w240"
            :placeholder="
              isStudent ? '이름 또는 학번 검색' : '이름 또는 아이디 검색'
            "
            @keyup.enter="load"
          />
          <button class="ghost" v-if="filters.keyword" @click="clearQ">
            지움
          </button>
        </div>

        <button class="btn btn-success" @click="load">
          <i class="bi bi-search"></i>
          조회
        </button>

        <button class="btn btn-primary" @click="openUploadModal">
          <i class="bi bi-plus-circle"></i>
          등록
        </button>
      </div>
    </div>
    <WhiteBox :bodyPadding="'0'" >
      <div v-if="data.rows && data.rows.length === 0" class="empty-state">
          <img :src="noDataImg" alt="검색 결과 없음" class="empty-image" />
          <p>검색 결과가 없습니다.</p>
      </div>
      <div v-else class="table-wrap">
        <table class="tbl">
          <thead>
            <tr>
              <th style="width: 140px">
                {{ isStudent ? "학번" : "사번" }}
              </th>
              <th style="width: 140px">이름</th>
              <th style="width: 140px">학과</th>
              <th style="width: 140px">{{ roleLabel }} 정보</th>
              <th style="width: 240px">이메일</th>
              <th style="width: 140px">전화</th>
              <th style="width: 240px">주소</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in data.rows" :key="`${r.loginId}-${r.username}`">
              <td>{{ r.loginId }}</td>
              <td>{{ r.username }}</td>
              <td>{{ r.deptName }}</td>
              <td>
                <span v-if="r.grade">{{ r.grade }}학년/</span>
                <span v-if="r.status" class="muted">{{ getStatusLabel(r.status) }}</span>
              </td>
              <td class="muted ellipsis">{{ r.email }}</td>
              <td class="muted">{{ r.phone }}</td>
              <td class="muted ellipsis">{{ r.address }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 프리뷰 창  -->
      <div
        v-if="
          uploadState.status === 'success' && uploadState.previewData.length > 0
        "
        class="preview-mini"
        :class="{ expanded: behaivorTF.showPreview }"
      >
        <div class="preview-header">
          <div class="preview-title" @click="togglePreview">
            <i class="bi bi-file-earmark-excel-fill"></i>
            <strong>결과보기</strong> ({{ uploadState.previewData.length }}건)
          </div>
          <div class="preview-actions">
            <button type="button" class="preview-close" @click="closePreview">
              ×
            </button>
          </div>
        </div>

        <div v-show="behaivorTF.showPreview" class="preview-content">
          <div class="preview-table-wrap">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>생년월일</th>
                  <th>성별</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>우편번호</th>
                  <th>주소</th>
                  <th>상세주소</th>
                  <th>학과</th>
                  <th>{{ isStudent ? "입학년도" : "고용일자" }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in uploadState.previewData"
                  :key="index"
                >
                  <td>{{ item.name }}</td>
                  <td>{{ item.birthday }}</td>
                  <td>{{ item.gender }}</td>
                  <td>{{ item.email }}</td>
                  <td>{{ item.phone }}</td>
                  <td>{{ item.postCode }}</td>
                  <td>{{ item.address }}</td>
                  <td>{{ item.addDetail }}</td>
                  <td>{{ item.dept }}</td>
                  <td>{{ item.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    <!-- 파일 업로드 창 -->
    </WhiteBox>
    <div
      v-if="behaivorTF.showUploadModal"
      class="modal-overlay"
      @click="closeUploadModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <button type="button" class="btn-close" @click="closeUploadModal">
            ×
          </button>
          <h5>{{ roleLabel }} 일괄 등록</h5>
        </div>

        <div class="modal-body">
          <div class="upload-section">
            <div class="upload-info">
              <i class="bi bi-info-circle"></i>
              엑셀 파일(.xlsx, .xls)을 업로드하여 {{ roleLabel }}정보를 일괄
              등록할 수 있습니다.
            </div>

            <div
              class="upload-area"
              :class="{ 'drag-over': behaivorTF.isDragging }"
              @dragover.prevent
              @dragenter.prevent="handleDragEnter"
              @dragleave="handleDragLeave"
              @drop.prevent="handleFileSelected"
            >
              <label class="upload-label">
                <i class="bi bi-cloud-upload"></i>
                <div class="upload-text">
                  <div>파일을 선택하거나 여기로 드래그하세요</div>
                  <div class="upload-sub">엑셀 파일만 업로드 가능합니다</div>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  @change="handleFileSelected"
                  style="display: none"
                />
              </label>
            </div>

            <div v-if="form.excel" class="selected-files">
              <div class="selected-file">
                <i class="bi bi-file-earmark-excel"></i>
                {{ form.excel.name }}
                <span class="file-size"
                  >({{ Math.round(form.excel.size / 1024) }}KB)</span
                >
                <button
                  class="uplode-close"
                  @click="removeFile(index)"
                  type="button"
                  aria-label="파일 삭제"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <div
              v-if="uploadState.status === 'uploading'"
              class="upload-progress"
            >
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: uploadState.progress + '%' }"
                ></div>
              </div>
              <div class="progress-text">
                업로드 중... {{ uploadState.progress }}%
              </div>
            </div>

            <div
              v-if="uploadState.status === 'success'"
              class="upload-result success"
            >
              <i class="bi bi-check-circle"></i>
              업로드가 완료되었습니다!
            </div>

            <div
              v-if="uploadState.status === 'error'"
              class="upload-result error"
            >
              <i class="bi bi-exclamation-circle"></i>
              업로드 중 오류가 발생했습니다.
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeUploadModal">
            취소
          </button>
          <button
            class="btn btn-primary"
            @click="uploadExcel"
            :disabled="!form.excel || uploadState.status === 'uploading'"
          >
            <i class="bi bi-upload"></i>
            업로드
          </button>
        </div>
      </div>
    </div>
    <YnModal
      v-if="behaivorTF.showYnModal"
      :content="data.ynModalMessage"
      :type="data.ynModalType"
      @close="behaivorTF.showYnModal = false"
    ></YnModal>
  </div>
</template>

<style scoped>

.container {
  width: 100%;
  min-width: 320px;
  padding: 16px 24px 24px 0;
  box-sizing: border-box;
}

.header-card {
  position: relative;
  background: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
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
  margin: 0 0 25px 0;
  line-height: 1.4;
}

.table-wrap {
  overflow-x: auto;
  max-height: calc(100vh - 350px);
  min-height: 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  font-size: 16px;
  color: #afb0b2;
  font-weight: 500;
}

.empty-image {
  max-width: 80px;
  opacity: 0.8;
  margin-top: -10px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.chips {
  display: flex;
  gap: 8px;
  margin-bottom: 25px;
}

.chip {
  all: unset;
  height: 30px;
  min-width: 80px;
  padding: 0 14px;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #00664f;
}

.full-line {
  position: absolute;
  top: 134px;
  left: 0;
  width: 100%;
  height: 0.2px;
  background-color: #e0e0e0;
  transform: translateZ(0);
}

.bi-search,
.bi-plus-circle,
.bi-upload {
  color: #fff;
}

.chip.on {
  background: #e9f5e8;
  border-bottom: 2px solid;
}

.right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  overflow-x: auto;
}

.right select,
.right input,
.right button,
.right .search-group {
  flex: 1 1 auto;
  min-width: 120px;
  max-width: 100%;
  box-sizing: border-box;
}

.inp {
  height: 36px;
  padding: 8px 32px 8px 12px;
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
}

.search-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  align-items: center;
}

.search-group input[type="text"] {
  appearance: textfield !important;
  -webkit-appearance: none !important;
  -moz-appearance: textfield !important;
  background-image: none !important;
}

.ghost {
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  height: 34px;
  padding: 0 10px;
  cursor: pointer;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  font-weight: 500;
  border-radius: 6px;
  gap: 6px; /* 아이콘과 텍스트 간격 */
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-success {
  background-color: #5ba666;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-success:hover {
  background-color: #4a8955;
}

.btn-success:active {
  background-color: #3e7548;
}

.btn-primary {
  background-color: #3f7ea6;
  color: #fff;
  border: none;
  height: 36px;
  min-width: 100px;
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2a5c74;
}

.btn-primary:active {
  background-color: #204658;
}

.btn-secondary {
  height: 36px;
  min-width: 100px;
  font-size: 13px;
}

.table-wrap {
  min-height: 200px;
  padding-bottom: 16px;
}

.tbl {
  min-width: 1100px;
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse; /* 권장 */
}

.tbl thead th {
  text-align: center;
  vertical-align: middle;
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f9fafb;
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 14px;
}

.tbl tbody td {
  text-align: center;
  vertical-align: middle;
  padding: 10px;
  border-bottom: 1px solid #f1f1f1;
  font-size: 13px;
}

.center {
  text-align: center;
  padding: 28px 0;
}

.dim {
  color: #666;
}

.err {
  color: #e53935;
}

.ellipsis {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-mini {
  position: fixed;
  bottom: 40px;
  left: 50px;
  width: 1000px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  /* 핵심 수정 부분 */
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease;
}

.preview-mini.expanded {
  max-height: 1000px;
}

.preview-header {
  padding: 5px 16px;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #eaf6ff;
  border-radius: 12px 12px 0 0;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
  color: #343a40;
}

.preview-content {
  max-height: 300px;
  overflow-y: auto;
}

.preview-table-wrap {
  padding: 0px;
  max-height: 300px;
  overflow-y: auto;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.preview-table th,
.preview-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.preview-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #343a40;
}

.preview-table td {
  color: #000;
}

.preview-more {
  text-align: center;
  padding: 8px;
  color: #9ca3af;
  font-size: 12px;
  border-top: 1px solid #f1f5f9;
}

.preview-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-radius: 4px;
}

.preview-close:hover {
  color: #000;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  all: unset;
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  background-color: #fff;
}

.modal-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: left;
  padding-right: 40px;
  margin-top: 25px;
}

.btn-close {
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

.btn-close:hover {
  background-color: #f8f9fa;
  color: #000;
}

.uplode-close {
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
}

.uplode-close:hover {
  background: #f3f4f6;
}

.uplode-close i {
  font-size: 12px;
  color: #db3619;
}

.modal-body {
  padding: 20px 20px 0 20px;
  overflow-y: auto;
  flex: 1;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: #1e40af;
  font-size: 14px;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #3b82f6;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}

.upload-label i {
  font-size: 48px;
  color: #9ca3af;
}

.upload-text div:first-child {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.upload-sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.selected-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 14px;
}

.file-size {
  color: #6b7280;
  font-size: 12px;
}

.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.upload-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
}

.upload-result.success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.upload-result.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
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
  padding: 20px;
  font-size: 14px;
  font-weight: 500;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #f0f9ff;
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

  .full-line {
    top: 122px !important;
  }

  .filter-section {
    gap: 16px;
  }
  .filter-row {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .filter-row select {
    flex: 1;
    min-width: 0;
    width: auto;
  }

  .search-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-group {
    flex-direction: column;
    min-width: unset;
    gap: 8px;
  }

  .search-group select,
  .search-input {
    width: 100%;
    min-width: unset;
    max-width: unset;
  }

  .action-buttons {
    width: 100%;
    justify-content: stretch;
  }

  .btn {
    flex: 1;
    justify-content: center;
    padding: 12px 16px;
    height: 40px;
  }

  .btn-text {
    display: inline;
  }

  .full-line {
    top: 124px;
  }
  .filters {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .chips {
    margin-bottom: 16px;
    width: 100%;
  }
  .chip {
    height: 36px;
    min-width: 100px;
    font-size: 13px;
    padding: 0 16px;
  }
  .full-line {
    top: 106px;
  }

  .right {
    flex-direction: column;
    align-items: stretch;
  }

  .right select,
  .right input,
  .right button,
  .right .search-group {
    flex: 1 1 auto;
    min-width: 120px;
    max-width: 100%;
    box-sizing: border-box;
  }

  .search-group {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group .inp {
    width: 100%;
  }

  .search-group .ghost {
    align-self: flex-end;
  }

  .preview-mini {
    left: 12px;
    right: 12px;
    width: auto;
    bottom: 20px;
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

  .header-card p {
    font-size: 13px;
    margin: 0 0 20px 0;
  }

  .chips {
    margin-bottom: 20px;
  }

  .chip {
    height: 32px;
    min-width: 90px;
    font-size: 13px;
  }

  .full-line {
    top: 125px;
  }

  .right {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .right .search-group {
    flex: 1 1 auto;
    min-width: 0;
  }

  .right .btn {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .btn {
    height: 34px;
    padding: 8px 14px;
    font-size: 13px;
  }

  .preview-mini {
    left: 20px;
    right: 20px;
    width: auto;
    bottom: 30px;
  }
  .modal-content {
    width: 85%;
    max-width: 500px;
  }

  .modal-header {
    padding: 14px 20px;
  }

  .modal-header h3 {
    font-size: 17px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 14px 20px 20px 20px;
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

  .chips {
    margin-bottom: 20px;
  }

  .chip {
    height: 32px;
    min-width: 90px;
    font-size: 13px;
  }

  .full-line {
    top: 136px;
  }

  .right {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .right .search-group {
    flex: 1 1 auto;
    min-width: 0;
  }

  .right .btn {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .preview-mini {
    left: 20px;
    right: 20px;
    width: auto;
    bottom: 30px;
  }

  .modal-content {
    width: 85%;
    max-width: 500px;
  }

  .modal-header {
    padding: 14px 20px;
  }

  .modal-header h3 {
    font-size: 17px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 14px 20px 20px 20px;
  }
}
</style>
