<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  /** 내부 스크롤 영역 높이 제어 (미지정 시 부모 레이아웃에 맞춤) */
  maxHeight: { type: String, default: 'calc(100vh - 120px)' },
  /** body 기본 padding 조정 */
  bodyPadding: { type: String, default: '0' },
})
</script>

<template>
  <div class="white-box" :style="{ '--wb-max-h': maxHeight, '--wb-body-pad': bodyPadding }">
    <!-- 헤더: 타이틀/툴바 영역 (sticky) -->
    <div class="white-box__header">
      <div class="white-box__title" v-if="title">{{ title }}</div>
      <!-- 필터/버튼 등 커스텀 헤더 -->
      <slot name="header"></slot>
    </div>

    <!-- 본문: ✅ 여기만 스크롤 -->
    <div class="white-box__body">
      <slot></slot>
    </div>

    <!-- 푸터: 페이지네이션 등 (원하면 sticky) -->
    <div class="white-box__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<style scoped>
.white-box {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,.1);
  box-sizing: border-box;

  /* 기존 스타일 유지 */
  width: 100%;
  min-width: 1200px;       /* 1430px → 너무 크면 줄여도 좋음 */
  margin: 30px;
  padding: 0;              /* 내부 여백은 섹션별로 */
  overflow: hidden;        /* 바깥 스크롤 차단 */

  /* 전체 높이 */
  max-height: var(--wb-max-h, calc(100vh - 120px));
  min-height: 600px;
}

/* Header (sticky) */
.white-box__header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
}
.white-box__title {
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 8px;
}

/* Body (scroll) */
/* .white-box__body {
  overflow: auto; 
  padding: var(--wb-body-pad, 0);
} */

/* Footer (sticky bottom: 필요 시) */
.white-box__footer {
  position: sticky;
  bottom: 0;
  z-index: 1;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 10px 12px;
}


</style>