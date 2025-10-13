<script setup>
import { changeCodeToTime } from "@/services/CommonMethod";

const props = defineProps({
  id: Number,
  item: Object
});

</script>

<template>
  <div>
    <div class="course-plan-title" title="강의계획서">강의계획서</div>
    <div class="section">
      <div class="info-grid">
        <div class="label"><i class="bi bi-book"></i> 교과목명:</div>
        <div class="value">{{ props.item.title }}</div>

        <div class="label"><i class="bi bi-person"></i> 담당교수:</div>
        <div class="value">{{ props.item.userName }}</div>

        <div class="label"><i class="bi bi-bookmark-dash"></i> 이수구분:</div>
        <div class="value">{{ props.item.type }}</div>

        <div class="label"><i class="bi bi-archive"></i> 학과명:</div>
        <div class="value">{{ props.item.grade === 0 ? "교양학부" : props.item.deptName }}</div>

        <div class="label"><i class="bi bi-bookmark-dash"></i> 이수학점:</div>
        <div class="value">{{ props.item.credit }}학점</div>

        <div class="label"><i class="bi bi-archive"></i> 학기:</div>
        <div class="value">{{ props.item.semester }}학기</div>

        <div class="label"><i class="bi bi-stopwatch"></i> 강의시간:</div>
        <div class="value">{{ changeCodeToTime(props.item.time) }}</div>

        <div class="label"><i class="bi bi-people"></i> 수강대상:</div>
        <div class="value">
          <template v-if="props.item.type === '전공'">
            {{ props.item.deptName + " " + props.item.grade }}학년
          </template>
          <template v-else>수강희망자</template>
        </div>

        <div class="label"><i class="bi bi-binoculars"></i> 수강정원:</div>
        <div class="value">{{ props.item.maxStd }}</div>

        <div class="label"><i class="bi bi-geo-alt"></i> 강의실:</div>
        <div class="value">{{ props.item.classroom }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">교재</div>
      <div class="label-value-row" style="display: flex; font-size: 15px">
        <div
          class="label content-label"
          style="margin-right: 8px; white-space: nowrap"
        >
          <i class="bi bi-book"></i> 교재명
        </div>
        <div class="value content-value">
          {{ props.item.textBook }}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">강의목표</div>
      <div class="value content-value" style="font-size: 15px">
        {{ props.item.goal }}
      </div>
    </div>

    <div class="section">
      <div class="section-title">주차별계획</div>
      <div class="value content-value pre-line" style="font-size: 15px" :style="{ whiteSpace: 'pre-wrap' }">
        {{ props.item.weekPlan }}
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">평가방법</h3>
      <div class="evaluation">
        <div class="eval-item">
          <div class="eval-label">출석</div>
          <div class="eval-score">10%</div>
        </div>
        <div class="eval-item">
          <div class="eval-label">중간고사</div>
          <div class="eval-score">30%</div>
        </div>
        <div class="eval-item">
          <div class="eval-label">기말고사</div>
          <div class="eval-score">40%</div>
        </div>
        <div class="eval-item">
          <div class="eval-label">과제</div>
          <div class="eval-score">20%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.course-plan-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e0e0e0;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section {
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px 30px 20px 30px;
  border-radius: 8px;
  border: 0.2px solid #74747450;
  background-color: #f8f9fa;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #343a40;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 12px;
  column-gap: 16px;
  font-size: 15px;
}

.label {
  font-weight: 600;
  color: #747474;
}

.value {
  color: #747474;
}

.evaluation {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.eval-item {
  flex: 1;
  min-width: 80px;
  text-align: center;
  padding: 8px;
  background: #e9f5e8;
  border-radius: 8px;
  border: 0.2px solid #00664f50;
}

.eval-label {
  font-size: 12px;
  color: #343a40;
  margin-bottom: 4px;
}

.eval-score {
  font-size: 20px;
  font-weight: 600;
  color: #00664f;
}


/* 모바일 */
@media all and (min-width: 480px) and (max-width: 767px) {
  .info-grid {
    grid-template-columns: 1fr 2fr;
  }
}

/* 탬플릿 */
@media all and (min-width: 768px) and (max-width: 1023px) {
  .info-grid {
    grid-template-columns: 2fr 5fr 2fr 3fr;
  }
}

/* PC */
@media all and (min-width: 1024px) {
  .info-grid {
    grid-template-columns: 110px 250px 110px 150px;
  }
}

.label {
  font-weight: 600;
  color: #747474;
}

.value {
  color: #747474;
}

.evaluation {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.eval-item {
  flex: 1 1 100px;
  text-align: center;
  padding: 8px;
  background: #e9f5e8;
  border-radius: 8px;
  border: 0.2px solid #00664f50;
}

.eval-label {
  font-size: 12px;
  color: #343a40;
  margin-bottom: 4px;
}

.eval-score {
  font-size: 20px;
  font-weight: 600;
  color: #00664f;
}
</style>
