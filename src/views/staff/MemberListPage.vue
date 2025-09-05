<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import WhiteBox from "@/components/common/WhiteBox.vue";
import { getMemberList } from "@/services/memberService";
import { deptGet } from "@/services/DeptManageService";

const depts = ref([
  { id: "", name: "전체" },
  // { id: 10, name: '컴퓨터공학과' } ... 실제 옵션으로 교체
]);
const deptLoading = ref(false);
const isDragging = ref(false);
const uploadFiles = ref([]);

async function loadDepts() {
  deptLoading.value = true;
  try {
    const raw = await deptGet();
    // ① 배열이 직접 오나? ② data가 배열? ③ list가 배열?
    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.list)
      ? raw.list
      : [];

    if (!Array.isArray(arr)) throw new Error("Invalid department response");

    const mapped = arr.map((d) => ({
      id: d.deptId ?? d.id,
      name: d.deptName ?? d.name,
    }));

    depts.value = [{ id: "", name: "전체" }].concat(
      mapped
        .filter((d) => d.id != null && d.name)
        .sort((a, b) => String(a.name).localeCompare(String(b.name), "ko"))
    );
  } catch (e) {
    console.error(
      "학과 로딩 실패",
      e,
      "(응답=",
      await Promise.resolve(deptGet()).catch(() => "N/A"),
      ")"
    );
  } finally {
    deptLoading.value = false;
  }
}

const STUDENT_STATUS = [
  { value: "", label: "상태: 전체" },
  { value: "재학", label: "재학" },
  { value: "휴학", label: "휴학" },
  { value: "졸업", label: "졸업" },
  // 필요 시 { value: '제적', label: '제적' } 등 추가
];
const PROFESSOR_STATUS = [
  { value: "", label: "상태: 전체" },
  { value: "재직", label: "재직" },
  { value: "휴직", label: "휴직" },
  { value: "퇴직", label: "퇴직" },
];

const role = ref("student");
const loading = ref(false);
const error = ref("");
const rows = ref([]);

/* 필터 상태 */
const filters = reactive({
  deptId: "",
  status: "",
  grade: "",
  keyword: "",
  searchBy: "all", // all | name | loginId | email
  gender: "",
});

const showUploadModal = ref(false);
const uploadFile = ref(null);
const previewData = ref([]);
const uploadProgress = ref(0);
const uploadStatus = ref(""); // 'uploading', 'success', 'error'
const showPreview = ref(false);

const isStudent = computed(() => role.value === "student");
const roleLabel = computed(() => (isStudent.value ? "학생" : "교수"));
const statusOptions = computed(() =>
  isStudent.value ? STUDENT_STATUS : PROFESSOR_STATUS
);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const roleParam = role.value === "student" ? "student" : "professor";

    const params = {
      userRole: roleParam,
      deptId: filters.deptId !== "" ? Number(filters.deptId) : undefined,
      status: filters.status || undefined,
      grade:
        isStudent.value && filters.grade ? Number(filters.grade) : undefined,
      gender: filters.gender || undefined,
      q: filters.keyword || undefined,
      searchBy: filters.searchBy !== "all" ? filters.searchBy : undefined,
    };

    const res = await getMemberList(params);
    rows.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error(e);
    error.value = "목록을 불러오지 못했습니다.";
  } finally {
    loading.value = false;
  }
}

function setRole(r) {
  if (role.value === r) return;
  role.value = r;
  filters.gender = "";
  filters.grade = "";
  filters.status = "";
}

function clearQ() {
  filters.keyword = "";
}

function openUploadModal() {
  showUploadModal.value = true;
  uploadFile.value = null;
  previewData.value = [];
  uploadProgress.value = 0;
  uploadStatus.value = "";
}

function closeUploadModal() {
  showUploadModal.value = false;
  uploadFiles.value = [];
  uploadProgress.value = 0;
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  const excelFiles = files.filter(
    (file) =>
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
  );

  if (excelFiles.length === 0) {
    alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
    return;
  }

  uploadFiles.value.push(...excelFiles);

  parseExcelFile(uploadFiles.value[0]);
}

async function parseExcelFile(file) {
  try {
    // 실제 환경에서는 SheetJS나 ExcelJS 등을 사용
    // 여기서는 샘플 데이터로 대체
    const sampleData = [
      {
        loginId: "2024001",
        username: "김학생",
        deptName: "컴퓨터공학과",
        grade: 1,
        status: "재학",
        email: "student1@example.com",
        phone: "010-1234-5678",
      },
      {
        loginId: "2024002",
        username: "이학생",
        deptName: "전자공학과",
        grade: 2,
        status: "재학",
        email: "student2@example.com",
        phone: "010-2345-6789",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
      {
        loginId: "P001",
        username: "박교수",
        deptName: "컴퓨터공학과",
        status: "재직",
        email: "prof1@example.com",
        phone: "010-3456-7890",
      },
    ];

    previewData.value = sampleData;
    showPreview.value = true;
  } catch (error) {
    console.error("파일 파싱 오류:", error);
    alert("파일을 읽는 중 오류가 발생했습니다.");
  }
}

async function uploadExcel() {
  if (uploadFiles.value.length === 0 || previewData.value.length === 0) {
    alert("업로드할 파일을 선택해주세요.");
    return;
  }

  uploadStatus.value = "uploading";
  uploadProgress.value = 0;

  try {
    for (let i = 0; i <= 100; i += 10) {
      uploadProgress.value = i;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await load();

    uploadStatus.value = "success";
    showPreview.value = true;

    closeUploadModal();
  } catch (error) {
    uploadStatus.value = "error";
    console.error("업로드 오류:", error);
  }
}

function handleDragEnter(event) {
  isDragging.value = true;
}

function handleDragLeave(event) {
  // 실제로 드래그가 완전히 영역 밖으로 나갔는지 확인하기 위해
  // event.target === event.currentTarget 인 경우만 false 처리 권장
  if (event.target === event.currentTarget) {
    isDragging.value = false;
  }
}

function handleDrop(event) {
  const files = Array.from(event.dataTransfer.files);
  const excelFiles = files.filter(
    (file) =>
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel"
  );

  if (excelFiles.length === 0) {
    alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
    return;
  }

  uploadFiles.value.push(...excelFiles);
  parseExcelFile(uploadFiles.value[0]);
}

function removeFile(index) {
  uploadFiles.value.splice(index, 1);

  if (uploadFiles.value.length === 0) {
    closePreview();
  } else {
    parseExcelFile(uploadFiles.value[0]);
  }
}

function togglePreview() {
  showPreview.value = !showPreview.value;
}

function closePreview() {
  showPreview.value = false;
  uploadStatus.value = "";
  previewData.value = [];
}

watch(
  [
    role,
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
  <WhiteBox title="구성원 관리" :bodyPadding="'0'">
    <template #header>
      <div class="filters">
        <!-- 상단 탭 -->
        <div class="chips">
          <button
            class="chip"
            :class="{ on: role === 'student' }"
            @click="setRole('student')"
          >
            학생
          </button>
          <button
            class="chip"
            :class="{ on: role === 'professor' }"
            @click="setRole('professor')"
          >
            교수
          </button>
        </div>

        <div class="right">
          <!-- 학과 -->
          <select v-model="filters.deptId" class="inp w150">
            <option :value="d.id" v-for="d in depts" :key="d.id">
              {{ d.name }}
            </option>
          </select>

          <!-- 상태(공통) -->
          <select v-model="filters.status" class="inp w120">
            <option
              v-for="opt in statusOptions"
              :key="opt.value"
              :value="opt.value"
            >
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
    </template>

    <div class="table-wrap">
      <div v-if="loading" class="center dim">불러오는 중…</div>
      <div v-else-if="error" class="center err">{{ error }}</div>

      <table v-else class="tbl">
        <thead>
          <tr>
            <th style="width: 140px">
              {{ role === "student" ? "학번" : "사번" }}
            </th>
            <th style="width: 140px">이름</th>
            <th>학과</th>
            <th style="width: 140px">{{ roleLabel }} 정보</th>
            <th style="width: 240px">이메일</th>
            <th style="width: 140px">전화</th>
            <th>주소</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="`${r.loginId}-${r.username}`">
            <td>{{ r.loginId }}</td>
            <td>{{ r.username }}</td>
            <td>{{ r.deptName }}</td>
            <td v-if="isStudent">
              <span v-if="r.grade">{{ r.grade }}학년</span>
              <span v-if="r.status" class="muted"> / {{ r.status }}</span>
            </td>
            <td v-else>
              <span>{{ r.status || "-" }}</span>
            </td>
            <td class="muted ellipsis">{{ r.email }}</td>
            <td class="muted">{{ r.phone }}</td>
            <td class="muted ellipsis">{{ r.address }}</td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="center dim">결과가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 결과보기 창-->
    <div
      v-if="uploadStatus === 'success' && previewData.length > 0"
      class="preview-mini"
      :class="{ expanded: showPreview }"
    >
      <div class="preview-header">
        <div class="preview-title" @click="togglePreview">
          <i class="bi bi-file-earmark-excel-fill"></i>
          <strong>결과보기</strong> ({{ previewData.length }}건)
        </div>
        <div class="preview-actions">
          <button class="preview-close" @click="closePreview">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div v-if="showPreview" class="preview-content">
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>{{ role === "student" ? "학번" : "사번" }}</th>
                <th>이름</th>
                <th>학과</th>
                <th v-if="isStudent">학년</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in previewData.slice(0, 10)"
                :key="index"
              >
                <td>{{ item.loginId }}</td>
                <td>{{ item.username }}</td>
                <td>{{ item.deptName }}</td>
                <td v-if="isStudent">{{ item.grade }}학년</td>
                <td>{{ item.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </WhiteBox>

  <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ roleLabel }} 일괄 등록</h3>
        <button class="modal-close" @click="closeUploadModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="upload-section">
          <div class="upload-info">
            <i class="bi bi-info-circle"></i>
            엑셀 파일(.xlsx, .xls)을 업로드하여 {{ roleLabel }}를 일괄 등록할 수
            있습니다.
          </div>

          <div
            class="upload-area"
            :class="{ 'drag-over': isDragging }"
            @dragover.prevent
            @dragenter.prevent="handleDragEnter"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
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
                @change="handleFileSelect"
                style="display: none"
              />
            </label>
          </div>

          <div v-if="uploadFiles.length" class="selected-files">
            <div
              v-for="(file, index) in uploadFiles"
              :key="file.name + file.size"
              class="selected-file"
            >
              <i class="bi bi-file-earmark-excel"></i>
              {{ file.name }}
              <span class="file-size"
                >({{ Math.round(file.size / 1024) }}KB)</span
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

          <div v-if="uploadStatus === 'uploading'" class="upload-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
            <div class="progress-text">업로드 중... {{ uploadProgress }}%</div>
          </div>

          <div v-if="uploadStatus === 'success'" class="upload-result success">
            <i class="bi bi-check-circle"></i>
            업로드가 완료되었습니다!
          </div>

          <div v-if="uploadStatus === 'error'" class="upload-result error">
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
          :disabled="uploadFiles.length === 0 || uploadStatus === 'uploading'"
        >
          <i class="bi bi-upload"></i>
          업로드
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrap {
  overflow: auto;
  max-height: calc(100vh - 220px);
  min-height: 0;
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
}
.chip {
  all: unset;
  box-sizing: border-box;
  height: 34px;
  min-width: 76px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #111;
}

.bi-search,
.bi-plus-circle,
.bi-upload {
  color: #fff;
}
.chip.on {
  background: #eaf6ff;
  border-color: #bfe7ff;
}
.right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.inp {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.w150 {
  width: 150px;
}
.w120 {
  width: 120px;
}
.w240 {
  width: 240px;
}
.w100 {
  width: 100px;
}
.search-group {
  display: flex;
  gap: 6px;
  align-items: center;
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
  height: 34px;
  padding: 15px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-wrap {
  min-height: 200px;
  padding-bottom: 16px;
}
.tbl {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.tbl thead th {
  text-align: center;
  vertical-align: middle;
  position: sticky;
  top: 0;
  z-index: 1;
  background: #f9fafb;
  padding: 10px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}
.tbl tbody td {
  text-align: center;
  vertical-align: middle;
  padding: 10px;
  border-bottom: 1px solid #f1f1f1;
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
.muted {
  color: #777;
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
  transition: all 0.3s ease;
  overflow: auto;
}

.preview-mini.expanded {
  height: auto;
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
  color: #374151;
}

.preview-table td {
  color: #374151;
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
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}

.preview-close:hover {
  background: #f3f4f6;
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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 10px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
}

.modal-close:hover {
  background: #f3f4f6;
}

.modal-close i {
  font-size: 15px; /* 기본은 보통 16px 정도 */
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
  padding: 24px 24px;
  flex: 1;
  overflow-y: auto;
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
  margin-bottom: 5px;
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
  padding: 10px 24px 24px 24px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.upload-area.drag-over {
  border-color: #3b82f6;
  background: #f0f9ff;
}
</style>
